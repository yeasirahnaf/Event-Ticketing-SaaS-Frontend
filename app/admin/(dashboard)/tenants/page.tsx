"use client";

import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/admin/SectionHeader';
import StatsGrid from '@/components/admin/StatsGrid';
import Link from 'next/link';
import { Building2, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { adminService } from '@/services/adminService';

// Define the Tenant interface matching the API response
interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    createdAt: string;
    brandingSettings?: {
        primaryColor?: string;
        logo?: string;
    };
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await adminService.getAllTenants();
                // API response structure: { data: [...], meta: ... }
                setTenants(response.data || []);
            } catch (error) {
                console.error("Failed to fetch tenants", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, []);

    // Calculate stats
    const stats = [
        { label: 'Total Tenants', value: tenants.length },
        { label: 'Active', value: tenants.filter((t) => t.status === 'active').length },
        { label: 'Pending Review', value: tenants.filter((t) => t.status === 'pending').length },
    ];

    if (loading) {
        return <div className="p-12 text-center text-slate-400">Loading tenants...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader
                title="Tenants Management"
                description="Manage and onboard organizations on TicketBD."
                icon={<Building2 size={24} />}
                actionLabel="Onboard New Tenant"
                actionIcon={<Plus size={20} />}
            />

            <StatsGrid stats={stats} />

            {/* Controls */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or slug..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {/* Tenants List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Organization</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Onboarded</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-5">
                            {tenants.length > 0 ? (
                                tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-inner"
                                                    style={{ backgroundColor: tenant.brandingSettings?.primaryColor || '#6366f1' }}
                                                >
                                                    {tenant.brandingSettings?.logo ? (
                                                        <img src={tenant.brandingSettings.logo} alt={tenant.name} className="w-8 h-8 rounded-lg" />
                                                    ) : (
                                                        <span className="text-lg">{tenant.name.substring(0, 1).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-950">{tenant.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">@{tenant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tenant.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                                            {new Date(tenant.createdAt).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                href={`/admin/tenants/${tenant.id}`}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
                                            >
                                                <ChevronRight size={20} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No tenants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
