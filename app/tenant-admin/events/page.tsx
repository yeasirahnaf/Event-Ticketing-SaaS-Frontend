'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import Link from 'next/link';
import { CalendarDays, MapPin, MoreVertical, Plus, Search, Filter, Clock, Activity } from 'lucide-react';

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await tenantAdminService.getAllEvents();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
            draft: 'bg-slate-100 text-slate-700 ring-slate-600/20',
            ended: 'bg-red-100 text-red-700 ring-red-600/20',
            scheduled: 'bg-blue-100 text-blue-700 ring-blue-600/20'
        };
        const style = styles[status as keyof typeof styles] || styles.draft;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${style} capitalize`}>
                {status || 'Draft'}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events</h1>
                    <p className="text-slate-500 font-medium">Manage your events and ticket sales.</p>
                </div>
                <Link
                    href="/tenant-admin/events/new"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Create Event
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium"
                    />
                </div>
                <div className="h-px sm:h-auto w-full sm:w-px bg-slate-100"></div>
                <div className="flex items-center gap-2 px-2 overflow-x-auto">
                    {['all', 'active', 'draft', 'ended'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`
                                px-4 py-1.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all
                                ${filterStatus === status
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <CalendarDays className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No events found</h3>
                    <p className="text-slate-500">
                        {searchQuery ? 'Try adjusting your search filters.' : 'Get started by creating your first event.'}
                    </p>
                    {!searchQuery && (
                        <Link href="/tenant-admin/events/new" className="mt-4 inline-block text-emerald-600 font-bold hover:underline">
                            Create New Event
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="group bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Card Header / Image Placeholder */}
                            <div className="h-40 bg-slate-900 relative p-6 flex flex-col justify-between overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-slate-900 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10 flex justify-between items-start">
                                    <StatusBadge status={event.status} />
                                    <button className="text-white/50 hover:text-white transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <h3 className="relative z-10 text-xl font-bold text-white leading-tight line-clamp-2">{event.name}</h3>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex flex-col gap-4 flex-1">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <MapPin size={16} className="text-emerald-500" />
                                        <span className="truncate">{event.venue || 'TBA'}, {event.city || 'TBA'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <Clock size={16} className="text-emerald-500" />
                                        <span>
                                            {event.start_at
                                                ? new Date(event.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'Date TBA'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sold</span>
                                        <span className="font-bold text-slate-900">0/{event.total_tickets || '∞'}</span>
                                    </div>

                                    <Link
                                        href={`/tenant-admin/events/${event.id}`}
                                        className="px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                                    >
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
