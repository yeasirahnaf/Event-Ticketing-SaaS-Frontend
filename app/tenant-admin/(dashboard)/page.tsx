'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { CalendarDays, ShoppingCart, TrendingUp, Users, ArrowUpRight, DollarSign, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TenantAdminDashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch events to show recent activity
                const eventsData = await tenantAdminService.getAllEvents();
                setEvents(eventsData);
                // In a real app, we'd also fetch orders stats, revenue etc.
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Mock Data for Charts/Stats
    const stats = [
        { title: 'Total Revenue', value: '৳ 24,500', icon: DollarSign, color: 'emerald', trend: '+12.5%', trendColor: 'text-emerald-600' },
        { title: 'Total Orders', value: '145', icon: ShoppingCart, color: 'teal', trend: '+8.2%', trendColor: 'text-teal-600' },
        { title: 'Active Events', value: loading ? "..." : events.filter(e => e.status === 'active').length.toString(), icon: CalendarDays, color: 'emerald', trend: '0%', trendColor: 'text-slate-500' },
        { title: 'Total Attendees', value: '1,204', icon: Users, color: 'cyan', trend: '+24%', trendColor: 'text-cyan-600' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <Link href="/tenant-admin/events/new" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                    <CalendarDays size={18} />
                    <span>Create Event</span>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-bold ${stat.trendColor} bg-slate-50 px-2 py-1 rounded-full`}>
                                {stat.trend !== '0%' && <TrendingUp size={12} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts & Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder (CSS Only) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
                            <p className="text-slate-400 text-sm">Monthly performance</p>
                        </div>
                        <select className="bg-slate-50 border-none text-slate-500 text-sm font-bold rounded-lg px-3 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-slate-100">
                            <option>This Month</option>
                            <option>Last Month</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart Authorization */}
                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-8">
                        {[40, 70, 45, 90, 65, 85, 55, 95, 75, 50, 60, 80].map((h, i) => (
                            <div key={i} className="w-full bg-slate-50 rounded-t-xl relative group cursor-pointer overflow-hidden">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-emerald-900 rounded-t-xl transition-all duration-500 ease-out group-hover:bg-emerald-500"
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ৳{h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                        <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Events</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-10"><span className="loading loading-spinner loading-md text-primary"></span></div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">No events yet.</div>
                        ) : (
                            events.slice(0, 5).map((event: any, i) => (
                                <div key={event.id} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <CalendarDays size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{event.name}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={10} />
                                            {event.status || 'Draft'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-900">0</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Sold</span>
                                    </div>
                                </div>
                            ))
                        )}
                        <Link href="/tenant-admin/events" className="block w-full py-3 text-center text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all mt-4">
                            View All Events
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
