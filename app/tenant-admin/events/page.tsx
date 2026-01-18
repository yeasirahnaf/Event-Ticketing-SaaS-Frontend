'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    CalendarDays, Plus, Search, Eye, Edit2,
    Filter, Zap, TrendingUp, Activity,
    Layers, CheckCircle2, Ticket, MapPin,
    Clock, BarChart3, Globe, Trash2
} from 'lucide-react';
import { tenantAdminService } from '@/services/tenantAdminService';

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await tenantAdminService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

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
        totalCapacity: events.reduce((acc, curr) => acc + (parseInt(curr.capacity) || 0), 0)
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">

            {/* COMPACT ECOSYSTEM HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CalendarDays size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">
                            <Layers size={10} fill="currentColor" /> Events
                        </div>
                        <h1 className="text-2xl font-black tracking-tight leading-none uppercase">Event Management</h1>
                        <p className="text-emerald-100/60 text-xs font-medium max-w-xl mx-auto md:mx-0">
                            Manage your events, monitor ticket sales and track capacity across your organization's portfolio.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Link
                            href="/tenant-admin/events/new"
                            className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 group"
                        >
                            <Plus size={16} className="text-emerald-600 group-hover:rotate-90 transition-transform" />
                            Create Event
                        </Link>
                    </div>
                </div>
            </div>

            {/* PERFORMANCE GRID - EVENT STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <CompactStatCard label="Total Events" value={stats.total} icon={CalendarDays} color="slate" />
                <CompactStatCard label="Active Events" value={stats.active} icon={CheckCircle2} color="emerald" />
                <CompactStatCard label="Draft Events" value={stats.draft} icon={Activity} color="amber" />
                <CompactStatCard label="Total Capacity" value={stats.totalCapacity} icon={Ticket} color="emerald" />
            </div>

            {/* FILTER & SEARCH HUB */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-4 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Compact Tabs */}
                    <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <ModernTabButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} label="All Events" />
                        <ModernTabButton active={filterStatus === 'active'} onClick={() => setFilterStatus('active')} label="Active" />
                        <ModernTabButton active={filterStatus === 'draft'} onClick={() => setFilterStatus('draft')} label="Draft" />
                        <ModernTabButton active={filterStatus === 'ended'} onClick={() => setFilterStatus('ended')} label="Ended" />
                    </div>

                    {/* Integrated Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search events by name or venue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-[2rem] text-[13px] font-bold focus:bg-white focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <div className="h-4 w-px bg-slate-200"></div>
                            <Filter size={14} className="text-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* EVENT MATRIX TABLE */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#022c22]"></div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                                <th className="px-8 py-5 text-left">Event Name</th>
                                <th className="px-8 py-5 text-left">Status</th>
                                <th className="px-8 py-5 text-left">Tickets Sold</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
                            ) : filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <tr key={event.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 overflow-hidden shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3 border border-white/20 flex items-center justify-center">
                                                    {event.imageUrl ? (
                                                        <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Zap size={20} className="text-emerald-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-base tracking-tight truncate max-w-[300px]">{event.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                                                        <MapPin size={12} className="text-emerald-500/50" />
                                                        {event.venue || 'Venue TBA'} • {event.city || 'City'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={event.status === 'published' ? 'active' : event.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    <BarChart3 size={14} className="text-emerald-500" />
                                                    0 / {event.capacity || '???'} sold
                                                </div>
                                                <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 w-0 rounded-full"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/${event.slug || '#'}`}
                                                    target="_blank"
                                                    className="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 transition-all"
                                                    title="Network Preview"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    href={`/tenant-admin/events/${event.id}`}
                                                    className="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 transition-all"
                                                    title="Modify Matrix"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest italic">Zero Events Detected within current matrix scope</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// COMPACT COMPONENTS

function CompactStatCard({ label, value, icon: Icon, color }: any) {
    const config: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-900/5",
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-900/5",
        red: "bg-red-50 text-red-600 border-red-100 shadow-red-900/5",
        slate: "bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/10",
    };

    return (
        <div className={`rounded-[2rem] p-6 border ${config[color] || config.emerald} group transition-all hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-2xl ${color === 'slate' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                {color !== 'slate' && (
                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                        <TrendingUp size={12} /> Live
                    </div>
                )}
            </div>
            <div className="text-2xl font-black tracking-tight mb-0.5">{value}</div>
            <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${color === 'slate' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
        </div>
    );
}

function ModernTabButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-white transition-colors'
                }`}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        active: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        draft: 'text-slate-400 bg-slate-50 border-slate-200',
        ended: 'text-red-600 bg-red-50 border-red-100',
        scheduled: 'text-blue-600 bg-blue-50 border-blue-100'
    };
    const style = styles[status?.toLowerCase()] || 'text-slate-400 bg-slate-50 border-slate-100';

    return (
        <span className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 bg-current shadow-[0_0_8px_currentColor] ${status === 'active' ? 'animate-pulse' : ''}`}></span>
            {status || 'Draft'}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50"></div>
                    <div className="space-y-2">
                        <div className="h-5 w-40 bg-slate-50 rounded"></div>
                        <div className="h-3 w-20 bg-slate-50 rounded"></div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6"><div className="h-6 w-24 bg-slate-50 rounded-full"></div></td>
            <td className="px-8 py-6"><div className="h-1 w-24 bg-slate-50 rounded ml-auto"></div></td>
            <td className="px-8 py-6"><div className="h-10 w-24 bg-slate-50 rounded ml-auto"></div></td>
        </tr>
    );
}
