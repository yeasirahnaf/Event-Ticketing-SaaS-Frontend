"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Shield,
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Mail,
    Building2
} from 'lucide-react';
import { adminService, User } from '@/services/adminService';
import CreateUserModal from './CreateUserModal';

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'platform_admin' | 'tenant_admin'>('all');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [activeTab, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'tenant_admin') {
                response = await adminService.getAllTenantUsers({
                    role: 'TenantAdmin',
                    search: searchTerm // Pass search term
                });
                // Map tenant users to a common format if needed
                setUsers(response.data.map((tu: any) => ({
                    id: tu.id,
                    fullName: tu.user.fullName,
                    email: tu.user.email,
                    role: 'Tenant Admin',
                    tenantName: tu.tenant.name,
                    status: tu.status,
                    createdAt: tu.createdAt
                })));
            } else {
                const query: any = { search: searchTerm };
                if (activeTab === 'platform_admin') {
                    query.isPlatformAdmin = true;
                }
                response = await adminService.getAllUsers(query);
                setUsers(response.data.map((u: any) => ({
                    id: u.id,
                    fullName: u.fullName,
                    email: u.email,
                    role: u.isPlatformAdmin ? 'Platform Admin' : 'User',
                    status: 'active', // User entity doesn't have status yet, assume active
                    createdAt: u.createdAt
                })));
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight italic">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage platform admins, tenant admins, and users.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                    >
                        <Plus size={18} />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Filters & Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-1.5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                    <TabButton
                        active={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                        label="All Users"
                    />
                    <TabButton
                        active={activeTab === 'platform_admin'}
                        onClick={() => setActiveTab('platform_admin')}
                        label="Platform Admins"
                    />
                    <TabButton
                        active={activeTab === 'tenant_admin'}
                        onClick={() => setActiveTab('tenant_admin')}
                        label="Tenant Admins"
                    />
                </div>

                <div className="relative px-4 pb-2 md:pb-0 md:pr-4">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-full md:w-64"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-xs uppercase font-bold text-slate-400">
                            <tr>
                                <th className="px-8 py-4 pl-8">User Information</th>
                                <th className="px-8 py-4">Role</th>
                                {activeTab === 'tenant_admin' && <th className="px-8 py-4">Tenant</th>}
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Joined</th>
                                <th className="px-8 py-4 pr-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-10 w-40 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-8 py-6"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                                        {activeTab === 'tenant_admin' && <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>}
                                        <td className="px-8 py-6"><div className="h-6 w-16 bg-slate-100 rounded-full"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="px-8 py-6"></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                    {user.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.fullName || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                        <Mail size={10} />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        {activeTab === 'tenant_admin' && (
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
                                                    <Building2 size={12} className="text-slate-400" />
                                                    {user.tenantName}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-5">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">No users found for this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <CreateUserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    fetchUsers();
                    // Optionally show a success toast here
                }}
            />
        </div>
    );
}

function TabButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
        >
            {label}
        </button>
    );
}

function RoleBadge({ role }: { role: string }) {
    if (role === 'Platform Admin') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white ring-1 ring-inset ring-slate-700">
                <Shield size={10} className="fill-current" />
                Admin
            </span>
        );
    }
    if (role === 'Tenant Admin') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-600/20">
                <Shield size={10} />
                Tenant
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20">
            User
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        active: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
        inactive: 'bg-slate-100 text-slate-500 ring-slate-500/20',
        suspended: 'bg-red-100 text-red-700 ring-red-600/20',
    };
    const style = styles[status?.toLowerCase()] || styles.active;

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ring-1 ring-inset ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.replace('bg-', 'bg-current opacity-50 ')}`}></span>
            {status}
        </span>
    );
}
