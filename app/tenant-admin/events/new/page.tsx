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
    Plus,
    Save,
    Clock,
    Palette,
    Lock,
    Settings,
    ShoppingBag,
    CheckCircle2
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

const getLocalDatetimeValue = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingThemes, setFetchingThemes] = useState(true);
    const [themes, setThemes] = useState<any[]>([]);
    const [purchasedThemes, setPurchasedThemes] = useState<any[]>([]);
    const [error, setError] = useState<string | string[] | null>(null);


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
        const fetchThemesAndPurchases = async () => {
            try {
                const [themeData, purchasedData] = await Promise.all([
                    tenantAdminService.getAvailableThemes(),
                    tenantAdminService.getPurchasedThemes()
                ]);

                const themeList = Array.isArray(themeData) ? themeData : (themeData as any).data || [];
                setThemes(themeList);
                setPurchasedThemes(purchasedData);
            } catch (err) {
                console.error('Failed to fetch themes or purchases', err);
            } finally {
                setFetchingThemes(false);
            }
        };
        fetchThemesAndPurchases();
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
        if (!isOwned(themeId)) {
            setError("This premium theme is locked. Please purchase it from the marketplace first.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
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
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20">
            {/* COMPACT ECOSYSTEM HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Plus size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1.5">
                        <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold mb-1 transition-colors text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                            <ArrowLeft size={12} />
                            Back to Events
                        </Link>
                        <h1 className="text-2xl font-black tracking-tight leading-none uppercase">Create Event</h1>
                        <p className="text-emerald-100/60 text-xs font-medium max-w-xl mx-auto md:mx-0">
                            Set up your new event. Configure the event details, schedule, and theme to start selling tickets.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-5">

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
                    <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Event Details</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name, Slug, and Description</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Event Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. ULTRA NETWORK SUMMIT"
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Url Slug</label>
                                    <div className="flex rounded-2xl bg-slate-50 border border-slate-50 overflow-hidden focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-8 focus-within:ring-emerald-500/5 transition-all">
                                        <span className="px-4 py-4 bg-slate-100/50 text-slate-400 font-black border-r border-slate-100 text-[10px]">
                                            /
                                        </span>
                                        <input
                                            type="text"
                                            name="slug"
                                            required
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="slug"
                                            className="flex-1 px-4 py-4 bg-transparent border-none focus:ring-0 text-slate-900 font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Brief Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief operational summary..."
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all resize-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Long Description</label>
                                <textarea
                                    name="fullDescription"
                                    rows={4}
                                    value={formData.fullDescription || ''}
                                    onChange={handleChange}
                                    placeholder="Detailed environment specifications..."
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all resize-none text-sm font-medium text-slate-600 placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Date & Schedule */}
                    <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Event Schedule</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage Dates and Times</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-6 rounded-3xl bg-slate-50/50 border border-slate-50 group transition-all hover:border-emerald-500/20 hover:bg-emerald-50/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors ml-1">Start Date/Time</span>
                                </div>
                                <div className="relative group/picker">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/picker:text-emerald-500 group-hover/picker:text-emerald-500 pointer-events-none transition-colors">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        required
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch (err) {
                                                console.error('Picker error:', err);
                                            }
                                        }}
                                        onChange={(e) => {
                                            const newDate = new Date(e.target.value);
                                            setFormData(prev => ({ ...prev, startAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                        }}
                                        value={getLocalDatetimeValue(formData.startAt as string)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 text-sm transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/picker:text-emerald-500 group-hover/picker:text-emerald-500 pointer-events-none transition-colors">
                                        <Clock size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-6 rounded-3xl bg-slate-50/50 border border-slate-50 group transition-all hover:border-red-500/20 hover:bg-red-50/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-600 transition-colors ml-1">End Date/Time</span>
                                </div>
                                <div className="relative group/picker">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/picker:text-red-500 group-hover/picker:text-red-500 pointer-events-none transition-colors">
                                        <Calendar size={16} />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        required
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch (err) {
                                                console.error('Picker error:', err);
                                            }
                                        }}
                                        onChange={(e) => {
                                            const newDate = new Date(e.target.value);
                                            setFormData(prev => ({ ...prev, endAt: isNaN(newDate.getTime()) ? '' : newDate.toISOString() }));
                                        }}
                                        value={getLocalDatetimeValue(formData.endAt as string)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-100 focus:border-red-500 focus:ring-8 focus:ring-red-500/5 outline-none font-bold text-slate-700 text-sm transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/picker:text-red-500 group-hover/picker:text-red-500 pointer-events-none transition-colors">
                                        <Clock size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Section: Theme Selection */}
                    <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-inner">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Theme Selection</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose the visual style for your event page</p>
                                </div>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <select
                                    value={filterPrice}
                                    onChange={(e) => setFilterPrice(e.target.value as any)}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-wider outline-none shadow-sm focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Tiers</option>
                                    <option value="free">Standard</option>
                                    <option value="premium">Premium</option>
                                </select>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-wider outline-none shadow-sm focus:border-emerald-500 transition-all cursor-pointer"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="capitalize">{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {fetchingThemes ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                                <span className="loading loading-spinner loading-lg text-emerald-500 mb-4"></span>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading themes...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredThemes.map((theme) => {
                                    const owned = isOwned(theme.id);
                                    const isSelected = formData.themeId === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            onClick={() => handleThemeSelect(theme.id)}
                                            className={`group relative cursor-pointer rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col ${isSelected
                                                ? 'border-emerald-500 bg-emerald-50/10 ring-8 ring-emerald-500/5 shadow-2xl shadow-emerald-500/20'
                                                : !owned
                                                    ? 'border-slate-100 opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'
                                                    : 'border-slate-50 hover:border-emerald-200 hover:shadow-xl bg-white'
                                                }`}
                                        >
                                            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                                                {theme.thumbnailUrl ? (
                                                    <img
                                                        src={theme.thumbnailUrl}
                                                        alt={theme.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                                        <Palette size={32} className="mb-2 opacity-20" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">No Image</span>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl border ${theme.isPremium
                                                        ? 'bg-amber-400/90 text-amber-950 border-amber-300 ring-1 ring-amber-400/20'
                                                        : 'bg-emerald-400/90 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400/20'
                                                        }`}>
                                                        {theme.isPremium ? `৳${theme.price}` : 'FREE'}
                                                    </span>
                                                    {owned && theme.isPremium && (
                                                        <span className="px-2 py-0.5 rounded-full text-[7px] font-black bg-white/90 text-emerald-600 uppercase tracking-widest shadow-lg border border-emerald-100">
                                                            OWNED
                                                        </span>
                                                    )}
                                                </div>

                                                {!owned && (
                                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px] transition-all group-hover:bg-slate-900/40">
                                                        <div className="bg-white/10 backdrop-blur-xl text-white rounded-2xl p-3 shadow-2xl border border-white/20">
                                                            <Lock size={20} className="animate-pulse" />
                                                        </div>
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="bg-white text-emerald-600 rounded-full p-2.5 shadow-2xl scale-in-center border-4 border-emerald-500/20">
                                                            <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4 bg-white">
                                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-wide group-hover:text-emerald-600 transition-colors truncate mb-2">{theme.name}</h3>

                                                <div className="flex items-center justify-between">
                                                    {theme.defaultProperties?.colors && (
                                                        <div className="flex -space-x-2">
                                                            {Object.entries(theme.defaultProperties.colors)
                                                                .filter(([key]) => ['primary', 'secondary', 'background', 'accent'].includes(key))
                                                                .slice(0, 3)
                                                                .map(([key, color]: any) => (
                                                                    <div
                                                                        key={key}
                                                                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
                                                                        style={{ backgroundColor: color }}
                                                                    />
                                                                ))}
                                                        </div>
                                                    )}

                                                    {theme.previewUrl && (
                                                        <a
                                                            href={theme.previewUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[8px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-[0.2em] transition-colors"
                                                        >
                                                            Preview Theme
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center">
                            <Link
                                href="/tenant-admin/themes"
                                className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-3 transition-all uppercase tracking-[0.3em] bg-emerald-50/50 px-8 py-4 rounded-2xl border border-emerald-100 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <ShoppingBag size={14} />
                                Go to Marketplace
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                        {/* Status & Options Card */}
                        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group">
                            <div className="flex items-center gap-4 mb-6 text-slate-400">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:text-emerald-500 transition-colors">
                                    <Settings size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Event Settings</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Event Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-emerald-500 transition-all text-slate-900 font-bold text-sm outline-none cursor-pointer"
                                    >
                                        <option value={EventStatus.DRAFT}>DRAFT (HIDDEN)</option>
                                        <option value={EventStatus.PUBLISHED}>PUBLISHED (LIVE)</option>
                                        <option value={EventStatus.SCHEDULED}>SCHEDULED</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Ticket Price</label>
                                    <div className="flex rounded-2xl bg-slate-50 border border-slate-50 overflow-hidden focus-within:bg-white focus-within:border-emerald-500 transition-all">
                                        <span className="px-4 py-3 bg-slate-100/50 text-slate-400 font-black text-xs flex items-center border-r border-slate-100">৳</span>
                                        <input
                                            type="number"
                                            name="price"
                                            min="0"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-900 font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Capacity Card */}
                        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group">
                            <div className="flex items-center gap-4 mb-6 text-slate-400">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:text-blue-500 transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Location & Capacity</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Venue Name</label>
                                    <input
                                        type="text"
                                        name="venue"
                                        value={formData.venue}
                                        onChange={handleChange}
                                        placeholder="e.g. NATIONAL HUB"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-slate-900 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-slate-900 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Capacity</label>
                                        <input
                                            type="number"
                                            name="capacity"
                                            min="1"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-slate-900 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group/btn overflow-hidden rounded-3xl p-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:scale-105 transition-transform duration-500"></div>
                            <div className="relative bg-slate-900 group-hover:bg-slate-900/0 text-white py-5 rounded-[1.4rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-300">
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="group-hover:rotate-12 transition-transform" />
                                        Create Event
                                    </>
                                )}
                            </div>
                        </button>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
                            * Please verify all event details before creating your event.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
