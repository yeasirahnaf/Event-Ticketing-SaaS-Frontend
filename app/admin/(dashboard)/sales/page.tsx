"use client";

import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/admin/SectionHeader';
import StatsGrid from '@/components/admin/StatsGrid';
import AdminCard from '@/components/admin/AdminCard';
import { Ticket, TrendingUp, DollarSign, Download, Filter, Search } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface Payment {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    provider: string;
    createdAt: string;
    orderId?: string;
    payload?: any;
    // ... other fields
}

export default function SalesPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await adminService.getAllPayments();
                setPayments(response.data || []);
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Calculate stats
    const totalRevenueCents = payments.reduce((acc, curr) =>
        acc + (curr.status === 'succeeded' ? Number(curr.amountCents) : 0), 0);
    const totalTransactions = payments.length;
    const avgOrderValueCents = totalTransactions > 0 ? totalRevenueCents / totalTransactions : 0;
    const pendingPayoutsCents = payments.reduce((acc, curr) =>
        acc + (curr.status === 'pending' ? Number(curr.amountCents) : 0), 0);

    const stats = [
        {
            label: 'Global Revenue',
            value: `৳${(totalRevenueCents / 100).toLocaleString()}`,
            icon: <DollarSign size={20} />
        },
        {
            label: 'Total Transactions',
            value: totalTransactions,
            icon: <Ticket size={20} />
        },
        {
            label: 'Avg. Order Value',
            value: `৳${(avgOrderValueCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: <TrendingUp size={20} />
        },
        {
            label: 'Pending Payouts',
            value: `৳${(pendingPayoutsCents / 100).toLocaleString()}`,
            icon: <Download size={20} />
        },
    ];

    if (loading) {
        return <div className="p-12 text-center text-slate-400">Loading sales data...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader
                title="Ticket Sales Ledger"
                description="Global transaction monitoring and financial audit."
                icon={<Ticket size={24} />}
                actionLabel="Export Report"
                actionIcon={<Download size={20} />}
            />

            <StatsGrid stats={stats} />

            <AdminCard title="Recent Transactions" icon={<TrendingUp size={18} />}>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by TXN, Tenant or Customer..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">TXN ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Order ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-5">
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">{payment.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 text-center uppercase">{payment.provider}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 text-center">{payment.orderId || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-950 italic text-center">৳{(Number(payment.amountCents) / 100).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${payment.status === 'succeeded'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : payment.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium text-center">
                                            {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}
