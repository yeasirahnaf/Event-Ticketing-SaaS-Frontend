'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { tenantAdminService, CreateEventDto, EventStatus } from '@/services/tenantAdminService';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Save, Type, Trash2, AlertCircle, Palette, Lock, Settings, ExternalLink, Ticket, Users, DollarSign, CheckCircle2, ShoppingBag } from 'lucide-react';

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
    const [purchasedThemes, setPurchasedThemes] = useState<any[]>([]);
    const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'premium'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Derived state for categories
    const categories = ['all', ...Array.from(new Set(themes.map(t => t.category || 'General')))];

    // Helper to check ownership
    const isOwned = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return false;
        if (!theme.isPremium || theme.price === 0) return true;
        return purchasedThemes.some(p => p.themeId === themeId && p.status === 'active');
    };

    // Filtered themes (Only show OWNED themes)
    const filteredThemes = themes.filter(theme => {
        if (!isOwned(theme.id)) return false;

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

                // Fetch themes and purchases
                const [themeData, purchasedData] = await Promise.all([
                    tenantAdminService.getAvailableThemes(),
                    tenantAdminService.getPurchasedThemes()
                ]);

                const themeList = Array.isArray(themeData) ? themeData : (themeData as any).data || [];
                setThemes(themeList);
                setPurchasedThemes(purchasedData);

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
        if (!isOwned(themeId)) {
            setError("You don't own this premium theme yet. Please buy it from the Themes Marketplace.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setFormData(prev => ({ ...prev, themeId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

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

            await tenantAdminService.updateEvent(eventId, payload as CreateEventDto);
            setSuccessMessage('Event updated successfully!');
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
            <div className="max-w-6xl mx-auto space-y-6 p-6">
                <div className="h-48 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-[200px] bg-slate-100 rounded-3xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 lg:px-0">
            {/* ATMOSPHERIC OPERATION HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0 opacity-50"></div>
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-emerald-500/80 hover:text-emerald-400 font-black text-[9px] uppercase tracking-[0.3em] transition-all group/back">
                            <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform" />
                            Return to Events
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl">
                                <Settings size={24} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Event Brief</span>
                                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase leading-none">
                                    {formData.name || 'Untitled Event'}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={`/tenant-admin/events/${eventId}/customize`}
                            className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] backdrop-blur-md border border-violet-500/20 transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-violet-500/5"
                        >
                            <Palette size={14} strokeWidth={3} />
                            Customize
                        </Link>
                        <a
                            href={`/${formData.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] backdrop-blur-md border border-white/10 transition-all active:scale-95 flex items-center gap-2 shadow-xl"
                        >
                            <ExternalLink size={14} strokeWidth={3} />
                            {(formData.status === 'active' || formData.status === 'published') ? 'Live' : 'Preview'}
                        </a>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-6">

                    {/* ALERT FEED */}
                    {(error || successMessage) && (
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500 shadow-lg shadow-red-500/20">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">System Error Response</h4>
                                        <div className="text-[10px] font-bold text-red-900/70 uppercase tracking-tight leading-relaxed">
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
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Operation Successful</h4>
                                        <p className="text-[10px] font-bold text-emerald-900/70 uppercase tracking-tight">{successMessage}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STRATEGIC ESSENTIALS */}
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6 relative overflow-hidden group">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                <Type size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Event Details</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Core Identity & Description</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">Event Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Enter operation name..."
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 transition-all text-xs font-black text-slate-900 outline-none shadow-inner"
                                />
                            </div>

                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">URL Slug</label>
                                <div className="flex relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">/</div>
                                    <input
                                        type="text"
                                        name="slug"
                                        required
                                        value={formData.slug || ''}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 transition-all text-xs font-black text-slate-900 outline-none shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5 group/field">
                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">Event Description</label>
                            <textarea
                                name="description"
                                required
                                rows={3}
                                placeholder="Provide a high-level briefing of the operation..."
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 transition-all text-xs font-bold text-slate-900 outline-none shadow-inner resize-none min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* DEPLOYMENT CONFIGURATION */}
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6 relative overflow-hidden">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Location & Capacity</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Venue & Attendance Limits</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-blue-500 transition-colors">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="Briefing location..."
                                    value={formData.venue || ''}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all text-xs font-black text-slate-900 outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-blue-500 transition-colors">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Operational region..."
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all text-xs font-black text-slate-900 outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-blue-500 transition-colors flex items-center gap-2">
                                    <Users size={12} strokeWidth={3} /> Max Capacity
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all text-xs font-black text-slate-900 outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2.5 group/field opacity-60">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    readOnly
                                    value={formData.country || ''}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-100 border-2 border-transparent text-xs font-black text-slate-400 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* VISUAL MATRIX (THEME SELECTION) */}
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-inner">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Theme Selection</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Choose visual interface</p>
                                </div>
                            </div>

                            {/* Matrix Filters */}
                            <div className="flex items-center gap-2.5">
                                <select
                                    value={filterPrice}
                                    onChange={(e) => setFilterPrice(e.target.value as any)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none focus:bg-white focus:border-pink-500 transition-all cursor-pointer shadow-inner"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Only</option>
                                    <option value="premium">Premium</option>
                                </select>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none focus:bg-white focus:border-pink-500 transition-all cursor-pointer shadow-inner"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {fetchingThemes ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-4">
                                <span className="loading loading-spinner loading-md text-pink-500"></span>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Loading themes...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {filteredThemes.map((theme) => {
                                    const owned = isOwned(theme.id);
                                    const selected = formData.themeId === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            onClick={() => handleThemeSelect(theme.id)}
                                            className={`group relative cursor-pointer rounded-2xl border-2 transition-all duration-500 overflow-hidden flex flex-col ${selected
                                                ? 'border-violet-600 shadow-xl shadow-violet-200 ring-4 ring-violet-50'
                                                : !owned
                                                    ? 'border-slate-100 opacity-60 grayscale shadow-inner'
                                                    : 'border-slate-50 hover:border-slate-200 hover:shadow-xl bg-white active:scale-95'
                                                }`}
                                        >
                                            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                                                {theme.thumbnailUrl ? (
                                                    <img
                                                        src={theme.thumbnailUrl}
                                                        alt={theme.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                                        <Palette size={20} className="mb-1.5 opacity-50" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${theme.isPremium
                                                        ? 'bg-amber-500/90 text-white border-amber-400/50'
                                                        : 'bg-white/90 text-slate-700 border-slate-100'
                                                        }`}>
                                                        {theme.isPremium ? `৳${theme.price}` : 'Default'}
                                                    </span>
                                                    {owned && theme.isPremium && (
                                                        <span className="px-2 py-1 rounded-lg text-[8px] font-black bg-emerald-500 text-white uppercase tracking-widest shadow-lg border border-emerald-400">
                                                            Owned
                                                        </span>
                                                    )}
                                                </div>

                                                {!owned && (
                                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-white">
                                                            <Lock size={24} className="animate-pulse" />
                                                        </div>
                                                    </div>
                                                )}

                                                {selected && (
                                                    <div className="absolute inset-0 bg-violet-900/40 flex items-center justify-center backdrop-blur-[2px]">
                                                        <div className="bg-white text-violet-600 rounded-full p-4 shadow-2xl ring-8 ring-white/20">
                                                            <CheckCircle2 size={32} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 flex items-center justify-between bg-white border-t border-slate-50">
                                                <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-tight group-hover:text-violet-600 transition-colors truncate">{theme.name}</h3>
                                                {selected && <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest shrink-0">Selected</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-center">
                            <Link
                                href="/tenant-admin/themes"
                                className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all group flex items-center gap-3 shadow-xl shadow-slate-900/10"
                            >
                                <ShoppingBag size={12} className="group-hover:animate-bounce" />
                                Go to Marketplace
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">

                    {/* ACTIONS HUB */}
                    <div className="bg-white p-6 lg:p-7 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 sticky top-10 space-y-6 ring-1 ring-slate-100">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center shadow-inner">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1 text-slate-900">Event Actions</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Manage Event Settings</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full relative overflow-hidden bg-[#022c22] hover:bg-black text-white px-7 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-70 group/save"
                            >
                                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/save:translate-y-[85%] transition-transform duration-700 opacity-20"></div>
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {saving ? <span className="loading loading-spinner loading-xs"></span> : <Save size={18} strokeWidth={3} />}
                                    {saving ? 'Saving...' : 'Update Event'}
                                </div>
                            </button>

                            <Link
                                href={`/tenant-admin/events/${eventId}/customize`}
                                className="w-full flex items-center justify-center gap-3 bg-violet-600 text-white hover:bg-violet-700 px-7 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-violet-600/10 active:scale-95"
                            >
                                <Palette size={18} strokeWidth={3} />
                                Customize
                            </Link>

                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center justify-center gap-3 text-red-500/50 hover:text-red-500 hover:bg-red-50 px-7 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] transition-all border-2 border-transparent hover:border-red-50 mt-2 active:scale-95"
                            >
                                <Trash2 size={16} />
                                Delete Event
                            </button>
                        </div>
                    </div>

                    {/* OPERATIONAL SCHEDULE */}
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shadow-inner">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1 text-red-600/80">Schedule</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Date & Time Settings</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-red-500 transition-colors">Start Date/Time</label>
                                <input
                                    type="datetime-local"
                                    name="startAt"
                                    required
                                    value={formData.startAt as string}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 transition-all text-[11px] font-black text-slate-700 outline-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-2 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-red-500 transition-colors">End Date/Time</label>
                                <input
                                    type="datetime-local"
                                    name="endAt"
                                    required
                                    value={formData.endAt as string}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-500 transition-all text-[11px] font-black text-slate-700 outline-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DEPLOYMENT STATUS */}
                    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1 text-amber-600/80">Status</h3>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Event State</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="relative group/field">
                                <select
                                    name="status"
                                    value={(formData.status as EventStatus) || EventStatus.DRAFT}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-500 outline-none font-black text-slate-900 text-xs shadow-inner appearance-none cursor-pointer pr-12"
                                >
                                    <option value={EventStatus.DRAFT}>DRAFT (HIDDEN)</option>
                                    <option value={EventStatus.PUBLISHED}>PUBLISHED (LIVE)</option>
                                    <option value={EventStatus.SCHEDULED}>SCHEDULED</option>
                                    <option value={EventStatus.ACTIVE}>ACTIVE</option>
                                    <option value={EventStatus.CANCELLED}>CANCELLED</option>
                                    <option value={EventStatus.COMPLETED}>COMPLETED</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500 opacity-50">
                                    <ExternalLink size={14} />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 ring-1 ring-slate-100 shadow-inner">
                                <p className="text-[9px] font-black text-slate-400 leading-relaxed uppercase tracking-widest italic text-center">
                                    {formData.status === EventStatus.DRAFT && 'System Status: Locked. Assets encrypted.'}
                                    {formData.status === EventStatus.PUBLISHED && 'System Status: Intel Active. Operations public.'}
                                    {formData.status === EventStatus.SCHEDULED && 'System Status: Standby. Sales in queue.'}
                                    {formData.status === EventStatus.ACTIVE && 'System Status: Live. Operations mission-critical.'}
                                    {formData.status === EventStatus.CANCELLED && 'System Status: Aborted. Access keys revoked.'}
                                    {formData.status === EventStatus.COMPLETED && 'System Status: Archived. Logs stored in vault.'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </form>

            {/* CRITICAL OVERRIDE HUB (DELETE MODAL) */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden border border-slate-50">
                        <div className="p-8 bg-red-50 border-b border-red-100 flex flex-col items-center text-center space-y-5">
                            <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-red-600 shadow-2xl shadow-red-200/50">
                                <Trash2 size={40} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1.5">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Delete Event</h2>
                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Permanent Action</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center leading-relaxed">
                                You are about to terminate all datasets associated with <span className="text-slate-900 font-black">"{formData.name}"</span>. This action is terminal.
                            </p>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-inner">
                                <AlertCircle size={24} className="text-amber-500 flex-shrink-0" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] leading-relaxed">Warning: All records and configurations will be permanently purged.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-8 border-t border-slate-50 bg-slate-50/50">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="flex-1 px-6 py-4 rounded-xl bg-white border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-6 py-4 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-95"
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
