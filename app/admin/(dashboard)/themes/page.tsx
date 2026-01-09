
'use client';

import { useState, useEffect } from 'react';
import { Palette, Plus, Search, Trash2, Edit2, CheckCircle, XCircle, Layout } from 'lucide-react';
import adminService from '@/services/adminService';

// Interfaces (move to types folder in real app)
interface Theme {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft';
    isPremium: boolean;
    properties: any;
    createdAt: string;
}

export default function ThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllThemes({ search: searchTerm });
            setThemes(response.data);
        } catch (error) {
            console.error('Failed to fetch themes:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Themes</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage platform and tenant themes.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20"
                >
                    <Plus size={18} />
                    Create New Theme
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 min-h-[400px]">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading themes...</div>
                ) : themes.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <Palette size={32} />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold text-lg">No themes found</p>
                            <p className="text-slate-500">Create your first theme to get started.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themes.map((theme) => (
                            <div key={theme.id} className="group relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                                {/* Preview Header */}
                                <div className="h-32 bg-slate-200 relative overflow-hidden">
                                    {/* Simulated UI Preview */}
                                    <div className="absolute inset-0 p-4 flex flex-col gap-2 opacity-50">
                                        <div className="h-2 w-1/3 rounded bg-slate-400" style={{ backgroundColor: theme.properties.primaryColor }}></div>
                                        <div className="flex gap-2">
                                            <div className="h-20 w-1/4 rounded bg-slate-300"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-full rounded bg-slate-300"></div>
                                                <div className="h-2 w-2/3 rounded bg-slate-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">{theme.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{theme.description || 'No description'}</p>
                                        </div>
                                        {theme.status === 'active' ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Active</span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-1 rounded-md">Draft</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {theme.properties.primaryColor && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.properties.primaryColor }}></div>
                                                {theme.properties.primaryColor}
                                            </div>
                                        )}
                                        {theme.isPremium && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                                                Premium
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-center gap-2">
                                        <button className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(theme.id)}
                                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateThemeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchThemes} />
        </div>
    );
}

function CreateThemeModal({ isOpen, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        primaryColor: '#059669',
        secondaryColor: '#d97706',
        backgroundColor: '#ffffff',
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
                properties: {
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                    backgroundColor: formData.backgroundColor
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white px-8 py-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900">New Theme</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the theme..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                />
                                <span className="text-xs font-mono text-slate-500">{formData.primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Secondary</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    className="h-10 w-10 rounded-lg cursor-pointer border-0 p-0"
                                    value={formData.secondaryColor}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                />
                                <span className="text-xs font-mono text-slate-500">{formData.secondaryColor}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                        Create Theme
                    </button>
                </form>
            </div>
        </div>
    );
}
