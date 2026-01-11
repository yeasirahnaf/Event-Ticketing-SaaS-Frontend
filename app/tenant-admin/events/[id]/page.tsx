'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { tenantAdminService, CreateEventDto, EventStatus } from '@/services/tenantAdminService';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Save, Type, Trash2, AlertCircle } from 'lucide-react';

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
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateEventDto>>({
        name: '',
        slug: '',
        description: '',
        venue: '',
        city: '',
        country: 'Bangladesh',
        startAt: '',
        endAt: '',
        status: EventStatus.DRAFT
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await tenantAdminService.getEventById(eventId);
                // Normalize possible snake_case fields from backend and format for datetime-local inputs
                const startAtRaw = data.startAt || (data as any).start_at;
                const endAtRaw = data.endAt || (data as any).end_at;

                setFormData({
                    ...data,
                    startAt: formatDateForInput(startAtRaw),
                    endAt: formatDateForInput(endAtRaw),
                    status: (data.status as EventStatus) || EventStatus.DRAFT,
                });
                setError(null);
            } catch (err: any) {
                setError('Failed to load event details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setError(null);
        setSuccessMessage(null);

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                slug: generateSlug(value)
            }));
        } else if (name === 'status') {
            setFormData(prev => ({ ...prev, status: value as EventStatus }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!formData.name || !formData.slug || !formData.description || !formData.venue || !formData.city || !formData.startAt || !formData.endAt) {
            setError('Please fill in all required fields');
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
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                venue: formData.venue,
                city: formData.city,
                country: formData.country,
                status: normalizedStatus,
                startAt: startIso,
                endAt: endIso,
                start_at: startIso as any,
                end_at: endIso as any,
            };

            console.log('Updating event with data:', payload);
            await tenantAdminService.updateEvent(eventId, payload as CreateEventDto);
            setSuccessMessage('Event updated successfully!');
            setTimeout(() => {
                router.push('/tenant-admin/events');
            }, 1500);
        } catch (err: any) {
            console.error('Update error:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update event';
            console.error('Error message:', errorMsg);
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
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <Link href="/tenant-admin/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Events
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Event</h1>
                <p className="text-slate-500 font-medium">Update your event details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-red-700 font-medium">{error}</p>
                            <p className="text-red-600 text-xs mt-2">Check browser console for more details (F12)</p>
                        </div>
                    </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                        </div>
                        <p className="text-emerald-700 font-medium">{successMessage}</p>
                    </div>
                )}

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
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="e.g. Winter Music Festival 2026"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
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
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="winter-music-fest-2026"
                                    className="flex-1 px-4 py-3 rounded-r-xl bg-slate-50 border-2 border-l-0 border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description || ''}
                                onChange={handleChange}
                                placeholder="Tell people what your event is about..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-slate-900 placeholder-slate-400 font-medium transition-all resize-none"
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
                                <p className="text-sm text-slate-400 font-medium">Where is it happening?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    required
                                    value={formData.venue || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. ICCB Hall 4"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                        placeholder="Dhaka"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 font-medium transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        readOnly
                                        value={formData.country || ''}
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
                                <p className="text-sm text-slate-400 font-medium">When is it happening?</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="startAt"
                                    required
                                    value={formData.startAt as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-violet-500 focus:outline-none text-slate-900 font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="endAt"
                                    required
                                    value={formData.endAt as string}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-violet-500 focus:outline-none text-slate-900 font-medium transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Status Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Event Status</h2>
                            <p className="text-sm text-slate-400 font-medium">Control event visibility and state</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Status</label>
                            <select
                                name="status"
                                value={(formData.status as EventStatus) || EventStatus.DRAFT}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-900 font-medium transition-all"
                            >
                                <option value={EventStatus.DRAFT}>Draft - Not visible to public</option>
                                <option value={EventStatus.PUBLISHED}>Published - Event is live</option>
                                <option value={EventStatus.SCHEDULED}>Scheduled - Visible, tickets not yet on sale</option>
                                <option value={EventStatus.ACTIVE}>Active - Tickets on sale</option>
                                <option value={EventStatus.CANCELLED}>Cancelled - Event canceled</option>
                                <option value={EventStatus.COMPLETED}>Completed - Event finished</option>
                            </select>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Description</p>
                            <p className="text-sm text-slate-600">
                                {formData.status === EventStatus.DRAFT && 'Event is not visible to the public. Use this while setting up your event.'}
                                {formData.status === EventStatus.PUBLISHED && 'Event is live and visible to the public. Tickets are available for purchase.'}
                                {formData.status === EventStatus.SCHEDULED && 'Event is visible but tickets are not yet available for purchase.'}
                                {formData.status === EventStatus.ACTIVE && 'Event is live and tickets are available for purchase.'}
                                {formData.status === EventStatus.CANCELLED && 'Event has been cancelled. Attendees will be notified.'}
                                {formData.status === EventStatus.COMPLETED && 'Event has ended. No further ticket sales.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all border-2 border-red-200"
                    >
                        <Trash2 size={18} />
                        Delete Event
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertCircle className="text-red-600" size={24} />
                                Delete Event?
                            </h2>
                        </div>

                        <div className="p-6">
                            <p className="text-slate-600 mb-4">
                                Are you sure you want to delete this event? This action cannot be undone.
                            </p>
                            <p className="text-sm text-slate-500 font-medium">
                                Event: <span className="text-slate-900 font-bold">{formData.name}</span>
                            </p>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-slate-100">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-50"
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
