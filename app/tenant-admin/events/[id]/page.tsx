'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { tenantAdminService, CreateEventDto, EventStatus } from '@/services/tenantAdminService';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Save, Type, Trash2, AlertCircle, Palette, Settings, ExternalLink, Ticket, Users, DollarSign, CheckCircle2 } from 'lucide-react';

const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const formatDateForInput = (value?: string | Date) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toISOStringOrNull = (value?: string) => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
};

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | string[] | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Theme selection state
    const [fetchingThemes, setFetchingThemes] = useState(true);
    const [themes, setThemes] = useState<any[]>([]);
    const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'premium'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Derived state for categories
    const categories = ['all', ...Array.from(new Set(themes.map(t => t.category || 'General')))];

    // Filtered themes
    const filteredThemes = themes.filter(theme => {
        const matchesPrice =
            filterPrice === 'all' ? true :
                filterPrice === 'free' ? !theme.isPremium :
                    filterPrice === 'premium' ? theme.isPremium : true;

        const matchesCategory =
            filterCategory === 'all' ? true :
                (theme.category || 'General') === filterCategory;

        return matchesPrice && matchesCategory;
    });

    const [formData, setFormData] = useState<Partial<CreateEventDto>>({
        name: '',
        slug: '',
        description: '',
        fullDescription: '',
        venue: '',
        city: '',
        country: 'Bangladesh',
        startAt: '',
        endAt: '',
        status: EventStatus.DRAFT,
        capacity: 100,
        price: 0,
        themeId: ''
    });

    useEffect(() => {
        const fetchEventAndThemes = async () => {
            try {
                // Fetch event details
                const eventData = await tenantAdminService.getEventById(eventId);
                // Normalize possible snake_case fields from backend and format for datetime-local inputs
                const startAtRaw = eventData.startAt || (eventData as any).start_at;
                const endAtRaw = eventData.endAt || (eventData as any).end_at;

                setFormData({
                    ...eventData,
                    startAt: formatDateForInput(startAtRaw),
                    endAt: formatDateForInput(endAtRaw),
                    status: (eventData.status as EventStatus) || EventStatus.DRAFT,
                    fullDescription: eventData.fullDescription || '',
                    capacity: eventData.capacity || 0,
                    price: eventData.price || 0,
                });

                // Fetch themes
                const themeData = await tenantAdminService.getAvailableThemes();
                const themeList = Array.isArray(themeData) ? themeData : (themeData as any).data || [];
                setThemes(themeList);

                setError(null);
            } catch (err: any) {
                setError('Failed to load event details or themes');
                console.error(err);
            } finally {
                setLoading(false);
                setFetchingThemes(false);
            }
        };
        fetchEventAndThemes();
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setError(null);
        setSuccessMessage(null);

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Only update slug if it looks like it was auto-generated from the old name (simple heuristic)
                // For edit page, typically we might NOT want to auto-update slug to avoid breaking links, 
                // but let's keep it consistent with create for now or just allow manual edit. 
                // User can manually edit slug if needed.
            }));
        } else if (name === 'status') {
            setFormData(prev => ({ ...prev, status: value as EventStatus }));
        } else if (name === 'price' || name === 'capacity') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThemeSelect = (themeId: string) => {
        setFormData(prev => ({ ...prev, themeId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!formData.name || !formData.slug || !formData.startAt || !formData.endAt) {
            setError('Please fill in all required fields (Name, Slug, Dates).');
            return;
        }

        setSaving(true);
        try {
            const allowedStatuses = Object.values(EventStatus);
            const normalizedStatus = allowedStatuses.includes((formData.status as EventStatus) || EventStatus.DRAFT)
                ? (formData.status as EventStatus)
                : EventStatus.DRAFT;

            const startIso = toISOStringOrNull(typeof formData.startAt === 'string' ? formData.startAt : formData.startAt?.toString());
            const endIso = toISOStringOrNull(typeof formData.endAt === 'string' ? formData.endAt : formData.endAt?.toString());

            const payload: Partial<CreateEventDto> & { start_at?: string; end_at?: string } = {
                ...formData,
                status: normalizedStatus,
                startAt: startIso,
                endAt: endIso,
                start_at: startIso as any,
                end_at: endIso as any,
            };

            console.log('Updating event with data:', payload);
            await tenantAdminService.updateEvent(eventId, payload as CreateEventDto);
            setSuccessMessage('Event updated successfully!');
            // Optional: scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            console.error('Update error:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update event';
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await tenantAdminService.deleteEvent(eventId);
            setSuccessMessage('Event deleted successfully!');
            setTimeout(() => {
                router.push('/tenant-admin/events');
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to delete event');
            setSaving(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 p-6">
                <div className="h-12 w-48 bg-slate-200 rounded-lg animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
                        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
                    </div>
                    <div className="space-y-8">
                        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-3 transition-colors text-sm">
                        <ArrowLeft size={16} />
                        Back to Events
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Event</h1>
                    <p className="text-slate-500 font-medium mt-1">Update details for <span className="text-slate-900 font-bold">"{formData.name}"</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/tenant-admin/events/${eventId}/customize`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-100/50 text-violet-700 font-bold hover:bg-violet-100 transition-all border border-violet-200"
                    >
                        <Palette size={18} />
                        Customize Theme
                    </Link>
                    <span className="text-slate-900/10">|</span>
                    <a
                        href={`/${formData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                    >
                        <ExternalLink size={18} />
                        {(formData.status === 'active' || formData.status === 'published') ? 'View Live' : 'Preview Event'}
                    </a>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1 text-red-700 font-medium">
                                {Array.isArray(error) ? (
                                    <ul className="list-disc pl-4 space-y-1">
                                        {error.map((err, i) => (
                                            <li key={i}>{typeof err === 'string' ? err : JSON.stringify(err)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Success Alert */}
                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">✓</span>
                            </div>
                            <p className="text-emerald-700 font-medium">{successMessage}</p>
                        </div>
                    )}

                    {/* Basic Info Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Type size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Event Essentials</h2>
                                <p className="text-sm text-slate-500">The core identity of your event.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold text-slate-900 placeholder-slate-400 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">URL Slug <span className="text-red-500">*</span></label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 py-3 rounded-l-xl bg-slate-100 text-slate-500 font-medium border-y border-l border-slate-200 text-sm">
                                            /
                                        </span>
                                        <input
                                            type="text"
                                            name="slug"
                                            required
                                            value={formData.slug || ''}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-3 rounded-r-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Theme ID</label>
                                    <input
                                        type="text"
                                        name="themeId"
                                        disabled
                                        value={formData.themeId || 'Not Selected'}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-slate-400">To change theme, create a new event or contact support.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Short Description <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    required
                                    rows={2}
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-medium text-slate-900 resize-none transition-all"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                                    <Palette size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Choose a Theme</h2>
                                    <p className="text-sm text-slate-500">Pick the visual style for your event page.</p>
                                </div>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['all', 'free', 'premium'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFilterPrice(type as any)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filterPrice === type
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {fetchingThemes ? (
                            <div className="flex items-center justify-center p-8 text-slate-400">
                                <span className="loading loading-spinner loading-md mr-2"></span>
                                Loading themes...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredThemes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={`group relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col ${formData.themeId === theme.id
                                            ? 'border-violet-600 bg-violet-50/50 ring-2 ring-violet-200 shadow-xl shadow-violet-500/10'
                                            : 'border-slate-100 hover:border-slate-300 hover:shadow-lg bg-white'
                                            }`}
                                    >
                                        <div className="aspect-video bg-slate-200 relative overflow-hidden">
                                            {theme.thumbnailUrl ? (
                                                <img
                                                    src={theme.thumbnailUrl}
                                                    alt={theme.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                                    <Palette size={24} className="mb-2 opacity-50" />
                                                    <span className="text-xs font-semibold">No Preview</span>
                                                </div>
                                            )}

                                            {/* Price Tag Overlay */}
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${theme.isPremium
                                                    ? 'bg-amber-100/90 text-amber-700 border border-amber-200/50'
                                                    : 'bg-white/90 text-slate-700 border border-slate-200/50'
                                                    }`}>
                                                    {theme.isPremium ? `৳${theme.price}` : 'Free'}
                                                </span>
                                            </div>

                                            {/* Categories */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                                                    {theme.category}
                                                </span>
                                            </div>

                                            {/* Selection Overlay */}
                                            {formData.themeId === theme.id && (
                                                <div className="absolute inset-0 bg-violet-900/40 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-200">
                                                    <div className="bg-white text-violet-700 rounded-full p-2.5 shadow-xl scale-in-center">
                                                        <CheckCircle2 size={32} fill="currentColor" className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight">{theme.name}</h3>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{theme.description}</p>

                                            <div className="mt-auto flex items-end justify-between gap-4">
                                                {/* Color Palette Swatches */}
                                                {theme.defaultProperties?.colors && (
                                                    <div className="flex -space-x-1.5">
                                                        {Object.entries(theme.defaultProperties.colors)
                                                            .filter(([key]) => ['primary', 'secondary', 'background', 'accent'].includes(key))
                                                            .slice(0, 4)
                                                            .map(([key, color]: any) => (
                                                                <div
                                                                    key={key}
                                                                    className="w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-slate-100"
                                                                    style={{ backgroundColor: color }}
                                                                    title={`${key}: ${color}`}
                                                                />
                                                            ))}
                                                    </div>
                                                )}

                                                {/* Live Preview Link */}
                                                {theme.previewUrl && (
                                                    <a
                                                        href={theme.previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-violet-50"
                                                    >
                                                        Live Preview <ArrowLeft size={10} className="rotate-135" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!fetchingThemes && themes.length === 0 && (
                            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-500 mb-2">No active themes found.</p>
                                <p className="text-sm text-slate-400">Please contact support or seed the themes database.</p>
                            </div>
                        )}
                    </div>

                    {/* Location & Capacity */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Location & Capacity</h2>
                                <p className="text-sm text-slate-500">Where and how big?</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-slate-900 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        readOnly
                                        value={formData.country || ''}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                        <Users size={12} /> Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Actions Card (Mobile/Desktop) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings size={20} className="text-slate-400" />
                            <h3 className="font-bold text-slate-900">Actions</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                            >
                                {saving ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                            <a
                                href={`/${formData.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 bg-violet-50 text-violet-700 hover:bg-violet-100 px-6 py-3.5 rounded-xl font-bold transition-all border border-violet-200"
                            >
                                <ExternalLink size={18} />
                                {(formData.status === 'active' || formData.status === 'published') ? 'View Live' : 'Preview Event'}
                            </a>

                            <Link
                                href={`/tenant-admin/events/${eventId}/customize`}
                                className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 text-slate-700 hover:bg-slate-100 px-6 py-3.5 rounded-xl font-bold transition-all border border-slate-200"
                            >
                                <Palette size={18} />
                                Customize Theme
                            </Link>

                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3.5 rounded-xl font-bold transition-all border border-red-100 mt-4"
                            >
                                <Trash2 size={18} />
                                Delete Event
                            </button>
                        </div>
                    </div>

                    {/* Date/Time */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                <Calendar size={16} />
                            </div>
                            <h3 className="font-bold text-slate-900">Schedule</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Start</label>
                                <input
                                    type="datetime-local"
                                    name="startAt"
                                    required
                                    value={formData.startAt as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">End</label>
                                <input
                                    type="datetime-local"
                                    name="endAt"
                                    required
                                    value={formData.endAt as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none font-bold text-slate-700 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                <AlertCircle size={16} />
                            </div>
                            <h3 className="font-bold text-slate-900">Status</h3>
                        </div>

                        <div className="space-y-3">
                            <select
                                name="status"
                                value={(formData.status as EventStatus) || EventStatus.DRAFT}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none font-bold text-slate-900"
                            >
                                <option value={EventStatus.DRAFT}>Draft</option>
                                <option value={EventStatus.PUBLISHED}>Published</option>
                                <option value={EventStatus.SCHEDULED}>Scheduled</option>
                                <option value={EventStatus.ACTIVE}>Active</option>
                                <option value={EventStatus.CANCELLED}>Cancelled</option>
                                <option value={EventStatus.COMPLETED}>Completed</option>
                            </select>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {formData.status === EventStatus.DRAFT && '🔒 Not visible to public.'}
                                    {formData.status === EventStatus.PUBLISHED && '🌍 Visible to public.'}
                                    {formData.status === EventStatus.SCHEDULED && '📅 Visible, no sales.'}
                                    {formData.status === EventStatus.ACTIVE && '🎟️ Tickets on sale.'}
                                    {formData.status === EventStatus.CANCELLED && '❌ Event cancelled.'}
                                    {formData.status === EventStatus.COMPLETED && '🏁 Event ended.'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </form>

            {/* Delete Modal (Same as before) */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 bg-red-50 border-b border-red-100">
                            <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                                <AlertCircle className="text-red-600" size={24} />
                                Delete Event?
                            </h2>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-slate-900">"{formData.name}"</span>?
                            </p>
                            <p className="text-xs text-red-500 font-bold uppercase tracking-wide bg-red-50 px-3 py-2 rounded-lg inline-block">
                                ⚠️ This action cannot be undone
                            </p>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md shadow-red-600/20"
                            >
                                {saving ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
