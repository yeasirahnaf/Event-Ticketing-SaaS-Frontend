'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Download, Filter, Search, ShoppingCart, Eye, MoreHorizontal, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // In a real app, we'd pass pagination/search params here
                const data = await tenantAdminService.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status?.toUpperCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const OrderStatusBadge = ({ status }: { status: string }) => {
        const configs = {
            completed: {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-500',
                label: 'SUCCESS'
            },
            pending: {
                bg: 'bg-amber-500/10',
                text: 'text-amber-500',
                label: 'PENDING'
            },
            failed: {
                bg: 'bg-red-500/10',
                text: 'text-red-500',
                label: 'FAILED'
            },
            refunded: {
                bg: 'bg-slate-500/10',
                text: 'text-slate-500',
                label: 'REFUNDED'
            }
        };

        const config = configs[status as keyof typeof configs] || {
            bg: 'bg-slate-500/10',
            text: 'text-slate-500',
            label: status?.toUpperCase() || 'UNKNOWN'
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest ${config.bg} ${config.text} border border-current opacity-70`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 px-4 lg:px-0">
            {/* ATMOSPHERIC TRANSACTION HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0 opacity-50"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2 lg:space-y-3 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl">
                                <ShoppingCart size={28} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Order Management</span>
                                <h1 className="text-2xl font-black tracking-tight text-white uppercase leading-none">Order List</h1>
                            </div>
                        </div>
                        <p className="text-emerald-100/60 text-xs font-medium leading-relaxed max-w-lg">
                            Monitor and manage all orders and transactions. Audit customer info, track sales performance, and export transaction data.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-0.5">Total Volume</span>
                            <span className="text-2xl font-black text-white">{orders.length}</span>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/10 transition-all active:scale-95 flex items-center gap-2.5 h-full">
                            <Download size={16} strokeWidth={3} />
                            Export Ledger
                        </button>
                    </div>
                </div>
            </div>

            {/* PREMIUM FILTER HUB */}
            <div className="bg-white p-4 lg:p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-5 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Scan Ledger Database..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-xs font-bold text-slate-900 outline-none shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${statusFilter === filter
                                ? 'bg-white text-emerald-600 shadow-md shadow-emerald-200/40 scale-105 z-10 border border-emerald-100/50'
                                : 'text-slate-400 hover:text-emerald-500'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* TRANSACTION MATRIX */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction ID</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Entity Identity</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Context</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Throughput</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Decrypting Ledger...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                <ShoppingCart size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Zero Transactions Detected</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjust your scan parameters to locate data.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 select-all tracking-wider">
                                                #{order.id?.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-xs shadow-lg shadow-slate-200">
                                                    {(order.buyer_name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{order.buyer_name || 'Anonymous Entity'}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.buyer_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{order.event?.name || 'External Ecosystem'}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Event Matrix</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.currency || 'BDT'}</span>
                                                <span className="text-sm font-black text-slate-900 tabular-nums">{order.total_taka}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* MATRIC FOOTER */}
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Showing {filteredOrders.length} Transaction Records
                    </span>
                    <div className="flex gap-2">
                        <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-30 disabled:pointer-events-none" disabled>
                            <MoreHorizontal size={14} className="rotate-180" />
                        </button>
                        <button className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-30 disabled:pointer-events-none" disabled>
                            <MoreHorizontal size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
