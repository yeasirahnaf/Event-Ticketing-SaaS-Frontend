"use client";

import React, { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Ticket
} from 'lucide-react';
import { adminService, ActivityLog } from '@/services/adminService';

export default function AdminPage() {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsResponse, statsData, tenantsResponse] = await Promise.all([
                    adminService.getAllActivityLogs(),
                    adminService.getDashboardStats(),
                    adminService.getAllTenants({ limit: 5 })
                ]);

                // Logs
                const logs = logsResponse.data || [];
                setActivityLogs(logs.slice(0, 5));

                // Stats
                setStats(statsData);

                // Tenants
                setTenants(tenantsResponse.data || []);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight italic">Global Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time health and growth metrics for TicketBD.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Tenants"
                    value={loading ? "..." : stats?.activeTenants || 0}
                    trend="Live"
                    isUp={true}
                    icon={<Building2 className="text-primary" size={20} />}
                />
                <StatCard
                    title="Total Users"
                    value={loading ? "..." : stats?.totalUsers || 0}
                    trend="Registered"
                    isUp={true}
                    icon={<Users className="text-blue-500" size={20} />}
                />
                <StatCard
                    title="Net Revenue"
                    value={loading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
                    trend="Total"
                    isUp={true}
                    icon={<TrendingUp className="text-emerald-500" size={20} />}
                />
                <StatCard
                    title="System Health"
                    value={loading ? "..." : stats?.systemHealth || "Good"}
                    trend="Stable"
                    isUp={true}
                    icon={<AlertCircle className="text-amber-500" size={20} />}
                />
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Tenants */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 italic">Recent Onboarded Tenants</h3>
                            <p className="text-slate-500 text-xs">Manage new platform partners.</p>
                        </div>
                        <button className="text-xs font-bold text-primary hover:underline">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 italic text-slate-400 font-medium">
                                    <th className="text-left pb-4">Tenant Name</th>
                                    <th className="text-left pb-4">Onboarded</th>
                                    <th className="text-left pb-4">Slug</th>
                                    <th className="text-left pb-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-5">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-4 text-center text-slate-400">Loading tenants...</td></tr>
                                ) : tenants.length > 0 ? (
                                    tenants.map((tenant: any) => (
                                        <TenantRow
                                            key={tenant.id}
                                            name={tenant.name}
                                            date={new Date(tenant.createdAt).toLocaleDateString()}
                                            slug={tenant.slug}
                                            status={tenant.status}
                                        />
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="py-4 text-center text-slate-400">No tenants found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Ticket size={120} />
                    </div>

                    <h3 className="text-lg font-bold mb-6 italic">System Activity</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-slate-400 text-sm">Loading activity...</p>
                        ) : activityLogs.length > 0 ? (
                            activityLogs.map((log) => (
                                <ActivityItem
                                    key={log.id}
                                    text={log.action}
                                    time={new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                />
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm">No recent activity.</p>
                        )}
                    </div>

                    <button className="mt-8 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold transition-all">
                        View Audit Logs
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, isUp, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend} {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
            </div>
            <div className="text-2xl font-black text-slate-950 italic">{value}</div>
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-1">{title}</div>
        </div>
    );
}

function TenantRow({ name, date, slug, status }: any) {
    const statusColors: any = {
        active: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        suspended: 'bg-red-100 text-red-700',
        Active: 'bg-emerald-100 text-emerald-700', // support both cases just in case
        Pending: 'bg-amber-100 text-amber-700',
        Suspended: 'bg-red-100 text-red-700'
    };

    return (
        <tr className="group hover:bg-slate-50 transition-colors">
            <td className="py-4 font-bold text-slate-900">{name}</td>
            <td className="py-4 text-slate-500">{date}</td>
            <td className="py-4 text-slate-500 italic">@{slug}</td>
            <td className="py-4 text-right">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[status] || 'bg-gray-100'}`}>
                    {status}
                </span>
            </td>
        </tr>
    );
}

function ActivityItem({ text, time }: any) {
    return (
        <div className="flex flex-col gap-1 border-l-2 border-white/10 pl-4">
            <p className="text-sm font-medium text-slate-200 leading-snug">{text}</p>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{time}</span>
        </div>
    );
}

