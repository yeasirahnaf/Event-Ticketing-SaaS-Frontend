'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenantAdminService, CreateEventDto } from '@/services/tenantAdminService';
import Link from 'next/link';
import { ArrowLeft, Calendar, Image as ImageIcon, MapPin, Save, Type } from 'lucide-react';

// Helper function to generate slug from text
const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateEventDto>>({
        name: '',
        slug: '',
        description: '',
        venue: '',
        city: '',
        country: 'Bangladesh',
        start_at: '',
        end_at: '',
        status: undefined
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Auto-generate slug from event name
        if (name === 'name') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                slug: generateSlug(value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await tenantAdminService.createEvent(formData as CreateEventDto);
            router.push('/tenant-admin/events');
        } catch (error) {
            console.error("Failed to create event", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Events
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Event</h1>
                <p className="text-slate-500 font-medium">Fill in the details to launch your event.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Type size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                            <p className="text-sm text-slate-400 font-medium">Event name and description</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Winter Music Festival 2026"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Slug (URL)</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 py-3 rounded-l-xl bg-slate-100/50 text-slate-400 font-medium border-r border-slate-100 text-sm">
                                    ticketbd.com/events/
                                </span>
                                <input
                                    type="text"
                                    name="slug"
                                    required
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="winter-music-fest-2026"
                                    className="flex-1 px-4 py-3 rounded-r-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell people what your event is about..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Date & Location Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Location */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Location</h2>
                                <p className="text-sm text-slate-400 font-medium">Where is it happenning?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    required
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="e.g. ICCB Hall 4"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 font-medium transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Dhaka"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 font-medium transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        readOnly
                                        value={formData.country}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date/Time */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Date & Time</h2>
                                <p className="text-sm text-slate-400 font-medium">When is it happenning?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="start_at"
                                    required
                                    value={formData.start_at as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-violet-500/20 text-slate-900 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="end_at"
                                    required
                                    value={formData.end_at as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-violet-500/20 text-slate-900 font-medium transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner text-white"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Publish Event
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
