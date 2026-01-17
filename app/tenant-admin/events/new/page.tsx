'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tenantAdminService, CreateEventDto, EventStatus } from '@/services/tenantAdminService';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Layout,
    Users,
    DollarSign,
    Type,
    Save,
    CheckCircle2,
    Palette
} from 'lucide-react';

// Helper to generate slug
const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const toISOStringOrNull = (value?: string) => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
};

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingThemes, setFetchingThemes] = useState(true);
    const [themes, setThemes] = useState<any[]>([]);
    const [error, setError] = useState<string | string[] | null>(null);


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
        venue: '',
        city: '',
        country: 'Bangladesh',
        startAt: '',
        endAt: '',
        status: EventStatus.DRAFT,
        themeId: '',
        capacity: 100,
        price: 0,
    });

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                // Fetch available themes (marketplace + purchased)
                // For now, assuming getAvailableThemes returns all options suitable for selection
                const data = await tenantAdminService.getAvailableThemes();
                // Ensure data is an array
                const themeList = Array.isArray(data) ? data : (data as any).data || [];
                setThemes(themeList);
            } catch (err) {
                console.error('Failed to fetch themes', err);
                // Don't block creation if themes fail, just show empty
            } finally {
                setFetchingThemes(false);
            }
        };
        fetchThemes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setError(null);

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Only auto-update slug if it hasn't been manually edited (simple check: if it matches old slug expectation)
                slug: !prev.slug || prev.slug === generateSlug(prev.name || '') ? generateSlug(value) : prev.slug
            }));
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

        // Basic validation
        if (!formData.name || !formData.slug || !formData.startAt || !formData.endAt) {
            setError('Please fill in all required fields (Name, Slug, Dates).');
            return;
        }

        if (!formData.themeId) {
            setError('Please select a theme for your event.');
            return;
        }

        setLoading(true);
        try {
            const payload: CreateEventDto = {
                name: formData.name!,
                slug: formData.slug!,
                description: formData.description || '',
                fullDescription: formData.fullDescription,
                venue: formData.venue || 'TBD', // Default if empty to avoid fail
                city: formData.city || 'Dhaka',
                country: formData.country || 'Bangladesh',
                status: formData.status,
                themeId: formData.themeId,
                capacity: formData.capacity,
                price: formData.price,
                startAt: toISOStringOrNull(formData.startAt as string) as any,
                endAt: toISOStringOrNull(formData.endAt as string) as any,
            };

            await tenantAdminService.createEvent(payload);
            router.push('/tenant-admin/events');
        } catch (error: any) {
            console.error("Failed to create event", error);
            setError(error?.response?.data?.message || error?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-2 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Events
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create New Event</h1>
                    <p className="text-slate-500 font-medium">Launch a stunning page for your next big thing.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <div className="text-red-700 font-medium">
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

                    {/* Section 1: Essentials */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <Layout size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Event Essentials</h2>
                                <p className="text-sm text-slate-500">The core identity of your event.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Event Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Future Tech Summit 2026"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-semibold text-lg placeholder:font-normal"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">URL Slug <span className="text-red-500">*</span></label>
                                <div className="flex rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
                                    <span className="px-4 py-3 bg-slate-100 text-slate-500 font-medium border-r border-slate-200 text-sm flex items-center">
                                        /
                                    </span>
                                    <input
                                        type="text"
                                        name="slug"
                                        required
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="future-tech-summit-2026"
                                        className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Short Description <span className="text-red-500">*</span></label>
                                <textarea
                                    name="description"
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief summary for cards and lists..."
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Description</label>
                                <textarea
                                    name="fullDescription"
                                    rows={6}
                                    value={formData.fullDescription || ''}
                                    onChange={handleChange}
                                    placeholder="Detailed event information, agenda, rules, etc..."
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none"
                                />
                                <p className="text-xs text-slate-400 text-right">Markdown supported</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Date & Time (Modernized) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Date & Schedule</h2>
                                <p className="text-sm text-slate-500">When is the magic happenning?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            {/* Decorative connector */}
                            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full border border-slate-200 z-10 flex items-center justify-center text-slate-400">
                                <span className="text-xs font-bold">TO</span>
                            </div>

                            {/* Start Block */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-violet-200 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Time</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            onChange={(e) => {
                                                const time = formData.startAt ? new Date(formData.startAt).toTimeString().slice(0, 5) : '10:00';
                                                const newDate = new Date(`${e.target.value}T${time}`);
                                                setFormData(prev => ({ ...prev, startAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                            }}
                                            value={formData.startAt ? new Date(formData.startAt).toISOString().split('T')[0] : ''}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold text-slate-700"
                                        />
                                        <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            name="startTime"
                                            required
                                            onChange={(e) => {
                                                const date = formData.startAt ? new Date(formData.startAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                                                const newDate = new Date(`${date}T${e.target.value}`);
                                                setFormData(prev => ({ ...prev, startAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                            }}
                                            value={formData.startAt ? new Date(formData.startAt).toTimeString().slice(0, 5) : ''}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* End Block */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-red-200 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">End Time</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="endDate"
                                            required
                                            onChange={(e) => {
                                                const time = formData.endAt ? new Date(formData.endAt).toTimeString().slice(0, 5) : '18:00';
                                                const newDate = new Date(`${e.target.value}T${time}`);
                                                setFormData(prev => ({ ...prev, endAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                            }}
                                            value={formData.endAt ? new Date(formData.endAt).toISOString().split('T')[0] : ''}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none font-bold text-slate-700"
                                        />
                                        <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            name="endTime"
                                            required
                                            onChange={(e) => {
                                                const date = formData.endAt ? new Date(formData.endAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                                                const newDate = new Date(`${date}T${e.target.value}`);
                                                setFormData(prev => ({ ...prev, endAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                            }}
                                            value={formData.endAt ? new Date(formData.endAt).toTimeString().slice(0, 5) : ''}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Section 2: Theme Selection */}
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
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 block">Event Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-500 focus:outline-none text-slate-900 font-bold"
                        >
                            <option value={EventStatus.DRAFT}>Draft (Hidden)</option>
                            <option value={EventStatus.PUBLISHED}>Published (Live)</option>
                            <option value={EventStatus.SCHEDULED}>Scheduled</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-3 px-1 leading-relaxed">
                            Draft events are only visible to you. Publish when you are ready to go live.
                        </p>
                    </div>



                    {/* Location & Details Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 text-slate-900">
                            <MapPin size={18} className="text-blue-500" />
                            <h3 className="font-bold">Location & Capacity</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Venue</label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="e.g. Convention Hall"
                                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        readOnly
                                        value={formData.country}
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-sm font-medium text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 mt-2"></div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Users size={12} /> Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:border-blue-500"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Create Event
                            </>
                        )}
                    </button>

                </div>
            </form>
        </div>
    );
}
