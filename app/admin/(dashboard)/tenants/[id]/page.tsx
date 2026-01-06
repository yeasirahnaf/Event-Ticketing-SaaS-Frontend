import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Users,
    Ticket,
    TrendingUp,
    Settings,
    Shield,
    ExternalLink,
    Mail,
    Phone
} from 'lucide-react';
import { adminService, Tenant } from '@/services/adminService';

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let tenant = null;
    try {
        const response = await adminService.getTenantById(id);
        tenant = response.data || response; // Handle if response is wrapped or direct
    } catch (error) {
        console.error("Failed to fetch tenant", error);
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Shield size={48} className="text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Tenant Not Found</h2>
                <p className="text-slate-500 mt-2">The organization you are looking for does not exist.</p>
                <Link href="/admin/tenants" className="mt-6 text-primary font-bold hover:underline">Back to Tenants</Link>
            </div>
        );
    }

    // Safely handle branding properties with defaults
    const branding = tenant.brandingSettings || { primaryColor: '#059669', logo: '/placeholder-logo.png' };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <Link href="/admin/tenants" className="flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors font-bold group">
                    <div className="p-2 rounded-xl group-hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span>Back to Tenants</span>
                </Link>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm">
                        Suspend
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/20">
                        Edit Settings
                    </button>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-20 -mt-20 rounded-full"
                    style={{ backgroundColor: branding.primaryColor }}
                ></div>

                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    <div
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200 border-4 border-white"
                        style={{ backgroundColor: branding.primaryColor }}
                    >
                        {branding.logo ? (
                            <img src={branding.logo} alt={tenant.name} className="w-16 h-16 sm:w-20 sm:h-20" />
                        ) : (
                            <Shield className="text-white w-10 h-10" />
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tighter italic">{tenant.name}</h1>
                                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                    {tenant.status}
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Tenant ID: {tenant.id}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                            <div className="flex items-center gap-3 text-slate-600 font-medium">
                                <div className="p-2.5 bg-slate-50 rounded-xl"><Mail size={18} /></div>
                                <span className="text-sm">support@{tenant.slug}.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-medium">
                                <div className="p-2.5 bg-slate-50 rounded-xl"><Phone size={18} /></div>
                                <span className="text-sm">+880 2-4458899</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-medium">
                                <div className="p-2.5 bg-slate-50 rounded-xl"><ExternalLink size={18} /></div>
                                <span className="text-sm">{tenant.slug}.ticketbd.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Events', value: '12', icon: <Calendar size={20} />, color: 'blue' },
                    { label: 'Staff Members', value: '08', icon: <Users size={20} />, color: 'purple' },
                    { label: 'Tickets Sold', value: '1.2k', icon: <Ticket size={20} />, color: 'emerald' },
                    { label: 'Revenue (BDT)', value: '৳450k', icon: <TrendingUp size={20} />, color: 'rose' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 group hover:border-slate-200 transition-all cursor-default">
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-950 italic">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Settings & Config Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Shield size={18} /></div>
                        <h3 className="text-lg font-black text-slate-950 italic">Compliance & Roles</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Tenant Admin</p>
                                <p className="text-xs text-slate-500 font-medium">Primary account holder</p>
                            </div>
                            <span className="text-xs font-bold text-slate-600">admin@dreamland.com</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Verification Status</p>
                                <p className="text-xs text-slate-500 font-medium">Trade license and NID</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Verified</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Settings size={18} /></div>
                        <h3 className="text-lg font-black text-slate-950 italic">Global Branding</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center"
                                style={{ backgroundColor: branding.primaryColor }}
                            >
                                <div className="w-4 h-4 rounded-full bg-white/20"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Primary Color</p>
                                <p className="text-xs text-slate-500 font-medium font-mono uppercase">{branding.primaryColor}</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium">
                            Custom Domain: {tenant.slug}.ticketbd.com
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
