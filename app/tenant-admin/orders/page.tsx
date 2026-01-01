'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Download, Filter, Search, ShoppingCart, Eye, MoreHorizontal, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredOrders = orders.filter(order =>
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const OrderStatusBadge = ({ status }: { status: string }) => {
        const styles = {
            completed: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-amber-100 text-amber-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-indigo-100 text-indigo-700'
        };
        const style = styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${style}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orders</h1>
                    <p className="text-slate-500 font-medium">Track your ticket sales and transactions.</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-200 shadow-sm transition-colors">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Email or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-transparent focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 font-medium"
                    />
                </div>
                <div className="h-px sm:h-auto w-full sm:w-px bg-slate-100"></div>
                <div className="flex items-center gap-2 px-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50 transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Event</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Total</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingCart className="text-slate-300" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
                                        <p className="text-slate-500">No orders match your search criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded select-all">
                                                {order.id.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {(order.buyer_name || 'U')[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{order.buyer_name || 'Unknown User'}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        {order.buyer_email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium text-sm">
                                            {order.event?.name || 'Event #123'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {order.currency} {order.total_taka}
                                        </td>
                                        <td className="px-6 py-4">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-all">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Showing {filteredOrders.length} results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
