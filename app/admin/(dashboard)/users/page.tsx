"use client";

import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/admin/SectionHeader';
import { Users, ShieldCheck, Mail, Clock, Plus } from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function UsersPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await adminService.getAllUsers();
                // API response structure: { data: [...], meta: ... }
                setAdmins(response.data || []);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading users...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader
                title="Platform Users"
                description="Super admins and platform control users."
                icon={<Users size={24} />}
                actionLabel="Invite Platform Admin"
                actionIcon={<Plus size={20} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin: any) => (
                    <div key={admin.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 relative overflow-hidden group hover:border-indigo-100 transition-all">
                        <div className="absolute top-4 right-4 text-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <ShieldCheck size={24} />
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl italic shadow-sm">
                                {(admin.fullName || admin.email || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-950 text-lg leading-tight">
                                    {admin.fullName || admin.email}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    {admin.isPlatformAdmin ? 'Platform Admin' : 'User'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                <span className="text-sm font-medium">{admin.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Clock size={16} className="text-slate-400" />
                                <span className="text-sm font-medium">Joined {new Date(admin.createdAt).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                {admin.isPlatformAdmin ? 'Super Admin' : 'Standard'}
                            </span>
                            <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                                Revoke Access
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


