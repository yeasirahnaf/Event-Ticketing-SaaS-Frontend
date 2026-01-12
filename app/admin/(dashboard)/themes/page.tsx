'use client';

import { useState, useEffect } from 'react';
import { Palette, Plus, Search, Eye, Power, DollarSign, Filter, X } from 'lucide-react';
import adminService from '@/services/adminService';
import SectionHeader from '@/components/admin/SectionHeader';
import StatsGrid from '@/components/admin/StatsGrid';

// Interfaces
interface Theme {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    isPremium: boolean;
    price: number;
    thumbnailUrl?: string;
    type?: string;
    defaultProperties: {
        colors: { primary: string; secondary: string; background: string; text: string };
        fonts: { heading: string; body: string };
        layout?: string;
    };
    createdAt: string;
}

export default function ThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [premiumFilter, setPremiumFilter] = useState<string>('all');
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<number>(0);

    useEffect(() => {
        fetchThemes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [themes, searchTerm, statusFilter, premiumFilter]);

    const fetchThemes = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllThemes();
            setThemes(response.data);
        } catch (error) {
            console.error('Failed to fetch themes:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...themes];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(theme =>
                theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                theme.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(theme => theme.status === statusFilter);
        }

        // Premium filter
        if (premiumFilter === 'free') {
            filtered = filtered.filter(theme => !theme.isPremium);
        } else if (premiumFilter === 'premium') {
            filtered = filtered.filter(theme => theme.isPremium);
        }

        setFilteredThemes(filtered);
    };

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await adminService.updateThemeStatus(id, newStatus);
            fetchThemes();
        } catch (error) {
            console.error('Failed to update theme status', error);
        }
    };

    const handlePriceEdit = (theme: Theme) => {
        setEditingPriceId(theme.id);
        setTempPrice(theme.price || 0);
    };

    const handlePriceSave = async (id: string, isPremium: boolean) => {
        try {
            await adminService.updateThemePrice(id, tempPrice, isPremium);
            setEditingPriceId(null);
            fetchThemes();
        } catch (error) {
            console.error('Failed to update theme price', error);
        }
    };

    const handlePriceCancel = () => {
        setEditingPriceId(null);
        setTempPrice(0);
    };

    const handlePreview = (theme: Theme) => {
        // Map theme names to preview routes
        const previewRoutes: Record<string, string> = {
            'Modern Dark': '/preview/modern-dark',
            'Vibrant Festival': '/preview/vibrant-festival',
            'Professional Corporate': '/preview/professional-corporate',
        };

        const previewUrl = previewRoutes[theme.name];
        if (previewUrl) {
            // Open live preview in new tab
            window.open(previewUrl, '_blank');
        } else {
            // Fallback to modal for unknown themes
            setPreviewTheme(theme);
            setShowPreviewModal(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this theme?')) {
            try {
                await adminService.deleteTheme(id);
                fetchThemes();
            } catch (error) {
                console.error('Failed to delete theme', error);
            }
        }
    };

    // Calculate stats
    const stats = [
        { label: 'Total Themes', value: themes.length },
        { label: 'Active', value: themes.filter(t => t.status === 'active').length },
        { label: 'Premium', value: themes.filter(t => t.isPremium).length },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader
                title="Themes Management"
                description="Manage platform themes for tenants."
                icon={<Palette size={24} />}
                actionLabel="Create New Theme"
                actionIcon={<Plus size={20} />}
                onAction={() => setShowCreateModal(true)}
            />

            <StatsGrid stats={stats} />

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search themes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                    </select>

                    {/* Premium Filter */}
                    <select
                        value={premiumFilter}
                        onChange={(e) => setPremiumFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    >
                        <option value="all">All Types</option>
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
            </div>

            {/* Themes Grid */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 min-h-[400px]">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading themes...</div>
                ) : filteredThemes.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Palette size={32} />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold text-lg">No themes found</p>
                            <p className="text-slate-500">Try adjusting your filters or create a new theme.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map((theme) => (
                            <div key={theme.id} className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full">
                                {/* Preview Header */}
                                <div className="h-40 bg-slate-100 relative overflow-hidden">
                                    {theme.thumbnailUrl ? (
                                        <img src={theme.thumbnailUrl} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 p-4 flex flex-col gap-2 opacity-80" style={{ backgroundColor: theme.defaultProperties?.colors?.background || '#f1f5f9' }}>
                                            <div className="h-4 w-1/3 rounded" style={{ backgroundColor: theme.defaultProperties?.colors?.primary || '#059669' }}></div>
                                            <div className="flex gap-2 mt-2">
                                                <div className="h-24 w-1/4 rounded bg-slate-200/50"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 w-full rounded bg-slate-200/50"></div>
                                                    <div className="h-2 w-2/3 rounded bg-slate-200/50"></div>
                                                    <div className="h-8 w-1/3 rounded mt-2" style={{ backgroundColor: theme.defaultProperties?.colors?.secondary || '#d97706' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">{theme.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{theme.description || 'No description'}</p>
                                        </div>
                                    </div>

                                    {/* Status Toggle & Price */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStatusToggle(theme.id, theme.status)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                                                    }`}
                                                title={`Toggle ${theme.status === 'active' ? 'off' : 'on'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                            <span className={`text-xs font-bold uppercase ${theme.status === 'active' ? 'text-emerald-600' : 'text-slate-500'
                                                }`}>
                                                {theme.status}
                                            </span>
                                        </div>

                                        {/* Price Editor */}
                                        {editingPriceId === theme.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={tempPrice}
                                                    onChange={(e) => setTempPrice(Number(e.target.value))}
                                                    className="w-16 px-2 py-1 text-xs border border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <button
                                                    onClick={() => handlePriceSave(theme.id, tempPrice > 0)}
                                                    className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={handlePriceCancel}
                                                    className="px-2 py-1 bg-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-400"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handlePriceEdit(theme)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                                            >
                                                <DollarSign size={12} className="text-amber-600" />
                                                <span className="text-xs font-bold text-amber-700">
                                                    {theme.isPremium ? Number(theme.price).toFixed(2) : 'Free'}
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Color Palette */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.defaultProperties?.colors?.primary || '#ccc' }} title="Primary"></div>
                                            <div className="w-4 h-4 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.defaultProperties?.colors?.secondary || '#ccc' }} title="Secondary"></div>
                                            <div className="w-4 h-4 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: theme.defaultProperties?.colors?.background || '#fff' }} title="Background"></div>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 uppercase">Colors</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto flex items-center gap-2">
                                        <button
                                            onClick={() => handlePreview(theme)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 hover:shadow-sm transition-all"
                                        >
                                            <Eye size={14} />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDelete(theme.id)}
                                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                                            title="Delete Theme"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && <CreateThemeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchThemes} />}
            {showPreviewModal && previewTheme && <PreviewModal theme={previewTheme} onClose={() => setShowPreviewModal(false)} />}
        </div>
    );
}

// Preview Modal Component
function PreviewModal({ theme, onClose }: { theme: Theme; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{theme.name}</h2>
                        <p className="text-sm text-slate-500">{theme.description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Preview Content */}
                <div className="p-8">
                    <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl" style={{ backgroundColor: theme.defaultProperties.colors.background }}>
                        <div className="p-8 space-y-6">
                            {/* Header Preview */}
                            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.defaultProperties.colors.primary + '20' }}>
                                <h1 className="text-3xl font-bold" style={{ color: theme.defaultProperties.colors.primary, fontFamily: theme.defaultProperties.fonts.heading }}>
                                    Event Name
                                </h1>
                                <button className="px-6 py-3 rounded-xl font-bold text-white shadow-lg" style={{ backgroundColor: theme.defaultProperties.colors.primary }}>
                                    Get Tickets
                                </button>
                            </div>

                            {/* Content Preview */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-4">
                                    <p className="text-lg" style={{ color: theme.defaultProperties.colors.text, fontFamily: theme.defaultProperties.fonts.body }}>
                                        This is a preview of how the theme will look on tenant sites. The colors, fonts, and layout are applied according to the theme settings.
                                    </p>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: theme.defaultProperties.colors.secondary, color: '#fff' }}>
                                            Secondary Action
                                        </button>
                                        <button className="px-4 py-2 rounded-lg font-semibold border-2" style={{ borderColor: theme.defaultProperties.colors.primary, color: theme.defaultProperties.colors.primary }}>
                                            Outline Button
                                        </button>
                                    </div>
                                </div>
                                <div className="rounded-xl p-4 shadow-inner" style={{ backgroundColor: theme.defaultProperties.colors.primary + '10' }}>
                                    <h3 className="font-bold mb-2" style={{ color: theme.defaultProperties.colors.primary }}>Event Details</h3>
                                    <p className="text-sm" style={{ color: theme.defaultProperties.colors.text }}>Date: Jan 15, 2026</p>
                                    <p className="text-sm" style={{ color: theme.defaultProperties.colors.text }}>Location: Dhaka</p>
                                </div>
                            </div>

                            {/* Color Palette Display */}
                            <div className="pt-6 border-t" style={{ borderColor: theme.defaultProperties.colors.primary + '20' }}>
                                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Theme Colors</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="h-16 rounded-xl shadow-md mb-2" style={{ backgroundColor: theme.defaultProperties.colors.primary }}></div>
                                        <p className="text-xs font-mono text-slate-600">{theme.defaultProperties.colors.primary}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Primary</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-16 rounded-xl shadow-md mb-2" style={{ backgroundColor: theme.defaultProperties.colors.secondary }}></div>
                                        <p className="text-xs font-mono text-slate-600">{theme.defaultProperties.colors.secondary}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Secondary</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-16 rounded-xl shadow-md mb-2 border border-slate-200" style={{ backgroundColor: theme.defaultProperties.colors.background }}></div>
                                        <p className="text-xs font-mono text-slate-600">{theme.defaultProperties.colors.background}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Background</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-16 rounded-xl shadow-md mb-2" style={{ backgroundColor: theme.defaultProperties.colors.text }}></div>
                                        <p className="text-xs font-mono text-slate-600">{theme.defaultProperties.colors.text}</p>
                                        <p className="text-[10px] text-slate-400 uppercase">Text</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Create Theme Modal Component (keeping existing implementation)
function CreateThemeModal({ isOpen, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        thumbnailUrl: '',
        primaryColor: '#059669',
        secondaryColor: '#d97706',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        headingFont: 'Inter',
        bodyFont: 'Inter',
        isPremium: false
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.createTheme({
                name: formData.name,
                description: formData.description,
                isPremium: formData.isPremium,
                price: formData.isPremium ? Number(formData.price) : 0,
                thumbnailUrl: formData.thumbnailUrl,
                defaultProperties: {
                    colors: {
                        primary: formData.primaryColor,
                        secondary: formData.secondaryColor,
                        background: formData.backgroundColor,
                        text: formData.textColor
                    },
                    fonts: {
                        heading: formData.headingFont,
                        body: formData.bodyFont
                    },
                    layout: 'grid'
                }
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create theme', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white px-8 py-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">New Master Theme</h2>
                        <p className="text-slate-500 text-sm">Create a template for tenants to use.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Theme Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Midnight Pro"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Thumbnail URL</label>
                                <input
                                    type="url"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    value={formData.thumbnailUrl}
                                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                    placeholder="https://example.com/preview.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-24"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Default Styles</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} />
                                        <span className="text-xs font-mono text-slate-500">{formData.primaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Secondary</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} />
                                        <span className="text-xs font-mono text-slate-500">{formData.secondaryColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Background</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={formData.backgroundColor} onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })} />
                                        <span className="text-xs font-mono text-slate-500">{formData.backgroundColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Text</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0" value={formData.textColor} onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} />
                                        <span className="text-xs font-mono text-slate-500">{formData.textColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Heading Font</label>
                                    <select className="w-full px-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs" value={formData.headingFont} onChange={(e) => setFormData({ ...formData, headingFont: e.target.value })}>
                                        <option value="Inter">Inter</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Playfair Display">Playfair Display</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Body Font</label>
                                    <select className="w-full px-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs" value={formData.bodyFont} onChange={(e) => setFormData({ ...formData, bodyFont: e.target.value })}>
                                        <option value="Inter">Inter</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Open Sans">Open Sans</option>
                                        <option value="Lato">Lato</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isPremium"
                                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                checked={formData.isPremium}
                                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                            />
                            <label htmlFor="isPremium" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                                Premium Theme
                                <span className="block text-xs font-medium text-slate-400">Available to paid tenants only</span>
                            </label>
                        </div>

                        {formData.isPremium && (
                            <div className="pl-8 animate-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full md:w-1/2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                        Create Master Theme
                    </button>
                </form>
            </div>
        </div>
    );
}
