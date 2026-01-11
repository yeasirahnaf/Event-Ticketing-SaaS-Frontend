'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Mail, Plus, Shield, Trash2, User, MoreVertical } from 'lucide-react';

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await tenantAdminService.getAllStaff();
                // Ensure data is an array
                const staffList = Array.isArray(data) ? data : (data as any).data || [];
                console.log("Staff data:", staffList);
                setStaff(staffList);
            } catch (error) {
                console.error("Failed to fetch staff", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Members</h1>
                    <p className="text-slate-500 font-medium">Manage access to your organization.</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus size={18} />
                    Invite Member
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : staff.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <User className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No staff members found</h3>
                    <p className="text-slate-500">Invite your team to collaborate.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {staff.map((member) => (
                        <div key={member.id || member.user_id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 group flex flex-col items-center text-center relative">
                            <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors">
                                <MoreVertical size={20} />
                            </button>

                            <div className="w-20 h-20 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-lg ring-1 ring-slate-100 flex items-center justify-center">
                                {/* Ideally use member.avatarUrl here */}
                                <User size={40} className="text-slate-400" />
                            </div>

                            <h3 className="font-bold text-slate-900 text-lg">{member.fullName}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1">
                                <Mail size={12} />
                                {member.email}
                            </p>

                            <div className="mt-auto w-full pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${member.status !== 'inactive' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {member.status || 'Active'}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 capitalize">
                                    <Shield size={10} className="mr-1" />
                                    {member.role || 'Staff'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
