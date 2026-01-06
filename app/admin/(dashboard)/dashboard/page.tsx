"use client";

import React, { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Ticket,
    Activity,
    CreditCard,
    MoreHorizontal,
    RefreshCw
} from 'lucide-react';
import { adminService, ActivityLog } from '@/services/adminService';

// --- Components ---

function WelcomeHeader({ onRefresh, loading }: { onRefresh: () => void, loading: boolean }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl shadow-slate-200">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Dashboard <span className="text-emerald-400">Overview</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-lg">
                        Real-time command center for TicketBD. Monitor tenant growth, user acquisition, and revenue streams.
                    </p>
                </div>
                <div>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        {loading ? "Syncing..." : "Refresh Data"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function HighlightCard({ title, value, trend, isUp, icon, colorClass }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
                <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                    {React.cloneElement(icon, { className: `${colorClass.replace('bg-', 'text-').replace('/10', '')}` })}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend}
                </div>
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
}

function TenantList({ tenants, loading }: any) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Recent Tenants</h3>
                    <p className="text-slate-500 text-xs font-medium mt-1">Latest platform partners onboarded.</p>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-xs uppercase font-bold text-slate-400">
                        <tr>
                            <th className="px-8 py-4 pl-8">Tenant Name</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Onboarded</th>
                            <th className="px-8 py-4 pr-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                    <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                                    <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                    <td className="px-8 py-6"></td>
                                </tr>
                            ))
                        ) : tenants.length > 0 ? (
                            tenants.map((tenant: any) => (
                                <tr key={tenant.id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-8 py-5">
                                        <div>
                                            <div className="font-bold text-slate-900">{tenant.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">@{tenant.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <StatusBadge status={tenant.status} />
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 font-medium">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">No tenants found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        active: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
        pending: 'bg-amber-100 text-amber-700 ring-amber-600/20',
        suspended: 'bg-red-100 text-red-700 ring-red-600/20',
    };
    const style = styles[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 ring-slate-500/20';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ring-1 ring-inset ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.replace('bg-', 'bg-current opacity-50 ')}`}></span>
            {status}
        </span>
    );
}

function ActivityFeed({ logs, loading }: any) {
    return (
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/10 flex flex-col h-full relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-lg font-black italic flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400" />
                    System Live
                </h3>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
                {loading ? (
                    <div className="text-slate-500 text-sm animate-pulse">Syncing feed...</div>
                ) : logs.length > 0 ? (
                    logs.map((log: any, i: number) => (
                        <div key={log.id} className="relative pl-6 border-l border-slate-700/50 group">
                            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${i === 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                                {log.action}
                            </p>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-slate-500 text-sm">No recent activity.</div>
                )}
            </div>

            <button className="mt-8 w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-widest transition-all text-slate-300 hover:text-white">
                Full Audit Log
            </button>
        </div>
    );
}


// --- Main Page ---

export default function AdminDashboard() {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [logsResponse, statsData, tenantsResponse] = await Promise.all([
                adminService.getAllActivityLogs(),
                adminService.getDashboardStats(),
                adminService.getAllTenants({ limit: 5 })
            ]);

            setActivityLogs((logsResponse.data || []).slice(0, 6));
            setStats(statsData);
            setTenants(tenantsResponse.data || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8 pb-10">
            <WelcomeHeader onRefresh={fetchData} loading={loading} />

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HighlightCard
                    title="Active Tenants"
                    value={loading ? "-" : stats?.activeTenants || 0}
                    trend="Live"
                    isUp={true}
                    icon={<Building2 size={24} />}
                    colorClass="bg-blue-500"
                />
                <HighlightCard
                    title="Total Revenue"
                    value={loading ? "-" : formatCurrency(stats?.totalRevenue || 0)}
                    trend="+12%"
                    isUp={true}
                    icon={<CreditCard size={24} />}
                    colorClass="bg-emerald-500"
                />
                <HighlightCard
                    title="Platform Users"
                    value={loading ? "-" : stats?.totalUsers || 0}
                    trend="Growth"
                    isUp={true}
                    icon={<Users size={24} />}
                    colorClass="bg-violet-500"
                />
                <HighlightCard
                    title="System Health"
                    value={loading ? "-" : stats?.systemHealth || "Unknown"}
                    trend="99.9%"
                    isUp={true}
                    icon={<AlertCircle size={24} />}
                    colorClass="bg-amber-500"
                />
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[600px]">
                <div className="xl:col-span-2 h-full">
                    <TenantList tenants={tenants} loading={loading} />
                </div>
                <div className="h-full">
                    <ActivityFeed logs={activityLogs} loading={loading} />
                </div>
            </div>
        </div>
    );
}

