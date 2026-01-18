'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import {
    Search, Filter, QrCode, CheckCircle,
    XCircle, ArrowLeft, Ticket,
    ShieldCheck, Activity, User,
    Calendar, ExternalLink, RefreshCcw,
    Fingerprint
} from 'lucide-react';
import Link from 'next/link';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchTickets = async () => {
        try {
            setRefreshing(true);
            const data = await tenantAdminService.getTickets();
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket =>
        ticket.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.holder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCheckIn = async (ticketId: string) => {
        try {
            await tenantAdminService.checkInTicket(ticketId);
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'checked_in' } : t));
        } catch (error) {
            console.error("Check-in failed", error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 p-6">
                <div className="h-40 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="h-14 bg-slate-100 rounded-2xl animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-56 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 lg:px-0">

            {/* ATMOSPHERIC VALIDATION HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0"></div>
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <Link href="/tenant-admin" className="inline-flex items-center gap-2 text-emerald-500/80 hover:text-emerald-400 font-black text-[9px] uppercase tracking-[0.3em] transition-all group/back">
                            <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl transform group-hover:rotate-6 transition-transform">
                                <QrCode size={24} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Tickets</span>
                                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase leading-none">
                                    Ticket Management
                                </h1>
                                <p className="text-emerald-500/60 text-[9px] font-bold uppercase tracking-widest mt-1">Monitor ticket issuance and validation status</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={fetchTickets}
                            disabled={refreshing}
                            className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-90 group/refresh"
                        >
                            <RefreshCcw size={18} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        </button>
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2.5 group/scan">
                            <QrCode size={16} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                            Scan Ticket
                        </button>
                    </div>
                </div>
            </div>

            {/* ACCESS FILTER HUB */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Guest Name, Ticket ID, or Code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-5 py-3.5 rounded-xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-emerald-500/10 text-slate-900 placeholder:text-slate-400 text-[11px] font-black uppercase tracking-tight transition-all outline-none"
                    />
                </div>
                <button className="px-5 py-3.5 rounded-xl bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100">
                    <Filter size={14} />
                    Parameters
                </button>
            </div>

            {/* VALIDATION GRID */}
            {filteredTickets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-100 border-dashed">
                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Ticket size={40} className="text-slate-200 group-hover:text-emerald-200 transition-colors" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Tickets Found</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">No tickets match your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets.map((ticket, index) => {
                        const isCheckedIn = ticket.status === 'checked_in';
                        return (
                            <div
                                key={ticket.id}
                                className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-500 relative group overflow-hidden flex flex-col"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Matrix Identity Stripe */}
                                <div className={`absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-all duration-700 ${isCheckedIn ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-amber-500 group-hover:bg-amber-400'}`}></div>

                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[7.5px] font-black uppercase tracking-[0.3em] text-slate-400">Guest Identity</span>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-[13px] leading-tight group-hover:text-emerald-600 transition-colors">
                                            {ticket.holder_name || 'Anonymous Asset'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            <ShieldCheck size={10} className="text-emerald-600" />
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{ticket.type_name || 'General Protocol'}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${isCheckedIn
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {isCheckedIn ? 'AUTHORIZED' : 'PENDING'}
                                    </div>
                                </div>

                                <div className="space-y-3.5 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100/50 shadow-inner flex-1">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[7.5px] font-black uppercase tracking-[0.3em] text-slate-400">Operation</span>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={11} className="text-slate-400" />
                                            <span className="font-bold text-slate-700 text-[9px] uppercase truncate">{ticket.event_name || 'Unknown Operation'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[7.5px] font-black uppercase tracking-[0.3em] text-slate-400">Signature</span>
                                        <div className="flex items-center gap-2">
                                            <Fingerprint size={11} className="text-slate-400" />
                                            <span className="font-mono font-bold text-slate-900 text-[9px] tracking-tight">{ticket.id.slice(0, 16).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCheckIn(ticket.id)}
                                    disabled={isCheckedIn}
                                    className={`
                                        w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 transition-all relative overflow-hidden active:scale-95 disabled:active:scale-100
                                        ${isCheckedIn
                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-[#022c22] text-white hover:bg-black shadow-xl shadow-emerald-900/10 group/btn'
                                        }
                                    `}
                                >
                                    {isCheckedIn ? (
                                        <>
                                            <CheckCircle size={13} strokeWidth={3} />
                                            Granted
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover/btn:translate-y-[85%] transition-transform duration-700 opacity-20"></div>
                                            <Activity size={13} strokeWidth={3} className="animate-pulse" />
                                            Authorize
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SYSTEM STATUS FEED */}
            <div className="flex flex-wrap items-center justify-center gap-8 py-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                <div className="flex items-center gap-2">
                    <Activity size={12} className="text-emerald-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Validation Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Integrity Set</span>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshCcw size={12} className="text-emerald-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Node: {tickets.length} Units</span>
                </div>
            </div>
        </div>
    );
}
