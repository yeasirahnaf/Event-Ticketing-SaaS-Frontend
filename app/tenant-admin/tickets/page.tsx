'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Search, Filter, QrCode, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // Fetch all tickets (attendees)
                const data = await tenantAdminService.getTickets();
                setTickets(data);
            } catch (error) {
                console.error("Failed to fetch tickets", error);
            } finally {
                setLoading(false);
            }
        };
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
            // Optimistically update UI
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'checked_in' } : t));
        } catch (error) {
            console.error("Check-in failed", error);
            alert("Failed to check in ticket");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tickets</h1>
                    <p className="text-slate-500 font-medium">Manage attendee access and check-ins.</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <QrCode size={18} />
                    Scan QR
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Ticket ID, Attendee or Event..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <QrCode className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No tickets found</h3>
                    <p className="text-slate-500">No tickets match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden">
                            {/* Decorative header */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">{ticket.holder_name || 'Guest User'}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{ticket.type_name || 'General Admission'}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${ticket.status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {ticket.status || 'Active'}
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Event</span>
                                    <span className="font-medium text-slate-900 truncate max-w-[150px]">{ticket.event_name || 'Unknown Event'}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Ticket ID</span>
                                    <span className="font-mono text-slate-900">{ticket.id.slice(0, 8)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCheckIn(ticket.id)}
                                disabled={ticket.status === 'checked_in'}
                                className={`
                                    w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                    ${ticket.status === 'checked_in'
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                    }
                                `}
                            >
                                {ticket.status === 'checked_in' ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Checked In
                                    </>
                                ) : (
                                    <>
                                        Is Here? Check In
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
