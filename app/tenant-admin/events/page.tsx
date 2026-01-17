'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import Link from 'next/link';
import { CalendarDays, MapPin, MoreVertical, Plus, Search, Filter, Clock, Activity, BarChart3, Ticket, Eye, Edit2 } from 'lucide-react';

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

    // Stats Calculation
    const stats = {
        total: events.length,
        active: events.filter(e => e.status === 'published' || e.status === 'active').length,
        draft: events.filter(e => e.status === 'draft').length,
        totalTickets: events.reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0)
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
            draft: 'bg-slate-100 text-slate-600 border-slate-200',
            ended: 'bg-red-50 text-red-600 border-red-200',
            scheduled: 'bg-blue-50 text-blue-600 border-blue-200'
        };
        const style = styles[status as keyof typeof styles] || styles.draft;

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${style} capitalize`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`}></span>
                {status || 'Draft'}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Create, manage and monitor your events.</p>
                </div>
                <Link
                    href="/tenant-admin/events/new"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Create New Event
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Events" value={stats.total} icon={CalendarDays} color="blue" />
                <StatCard label="Active Events" value={stats.active} icon={Activity} color="emerald" />
                <StatCard label="Drafts" value={stats.draft} icon={Edit2} color="slate" />
                <StatCard label="Total Capacity" value={stats.totalTickets} icon={Ticket} color="purple" />
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search events by name or venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['all', 'active', 'draft', 'ended'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all
                                ${filterStatus === status
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarDays className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                        {searchQuery ? 'We couldn\'t find any events matching your search.' : 'Get started by creating your first event to start selling tickets.'}
                    </p>
                    {!searchQuery && (
                        <Link href="/tenant-admin/events/new" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                            Create something new <Plus size={16} />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col">
                            {/* Card Header / Image */}
                            <div className="h-48 bg-slate-900 relative overflow-hidden">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-700">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>

                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                        <StatusBadge status={event.status === 'published' ? 'active' : event.status} />
                                    </div>
                                    <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-1 mb-1">{event.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                                        <MapPin size={14} className="text-emerald-400" />
                                        <span className="truncate">{event.venue || 'Venue TBA'}</span>
                                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                        <span>{event.city || 'City'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex flex-col gap-4 flex-1">
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</span>
                                        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                            <Clock size={16} className="text-emerald-500" />
                                            <span>
                                                {event.startAt
                                                    ? new Date(event.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                    : 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales</span>
                                        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                            <BarChart3 size={16} className="text-emerald-500" />
                                            <span>0 / {event.capacity || 'Wait'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-500">Tickets Sold</span>
                                        <span className="text-emerald-600">0%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-0 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                                    <Link
                                        href={`/tenant-admin/events/${event.id}`}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-lg shadow-slate-900/10"
                                    >
                                        <Edit2 size={16} />
                                        Manage
                                    </Link>
                                    <Link
                                        href={`/${event.slug || '#'}`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm"
                                    >
                                        <Eye size={16} />
                                        Preview
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}
