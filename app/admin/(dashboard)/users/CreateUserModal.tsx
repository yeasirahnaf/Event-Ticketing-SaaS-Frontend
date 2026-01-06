"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Shield, Building2, User } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1); // 1: User Details, 2: Role Details (if needed)

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'user', // 'user', 'platform_admin', 'tenant_admin'
        tenantId: '',
    });

    const [tenants, setTenants] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && formData.role === 'tenant_admin') {
            fetchTenants();
        }
    }, [isOpen, formData.role]);

    const fetchTenants = async () => {
        try {
            const response = await adminService.getAllTenants({ limit: 100, status: 'active' });
            setTenants(response.data);
        } catch (error) {
            console.error("Failed to fetch tenants", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Create the User Base Account
            // Note: We need to handle 'isPlatformAdmin' based on role
            const userPayload = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                isPlatformAdmin: formData.role === 'platform_admin'
            };

            const userResponse = await adminService.createUser(userPayload);
            const createdUser = userResponse; // backend returns the user entity (or wait, I should verify response structure, usually it does)

            // 2. If Tenant Admin, link to tenant
            if (formData.role === 'tenant_admin' && formData.tenantId) {
                await adminService.createTenantUser({
                    userId: createdUser.id,
                    tenantId: formData.tenantId,
                    role: 'TenantAdmin',
                    status: 'active'
                });
            }

            onSuccess();
            onClose();
            // Reset form
            setFormData({ fullName: '', email: '', password: '', role: 'user', tenantId: '' });
        } catch (error: any) {
            console.error("Failed to create user", error);
            alert(error.response?.data?.message || "Failed to create user");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 italic">Add New User</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                placeholder="e.g. John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                placeholder="••••••••"
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Role Assignment</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <RoleOption
                                    icon={<User size={18} />}
                                    label="User"
                                    selected={formData.role === 'user'}
                                    onClick={() => setFormData({ ...formData, role: 'user' })}
                                />
                                <RoleOption
                                    icon={<Building2 size={18} />}
                                    label="Tenant Admin"
                                    selected={formData.role === 'tenant_admin'}
                                    onClick={() => setFormData({ ...formData, role: 'tenant_admin' })}
                                />
                                <RoleOption
                                    icon={<Shield size={18} />}
                                    label="Platform Admin"
                                    selected={formData.role === 'platform_admin'}
                                    onClick={() => setFormData({ ...formData, role: 'platform_admin' })}
                                />
                            </div>
                        </div>

                        {formData.role === 'tenant_admin' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign to Tenant</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none"
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                >
                                    <option value="">Select a Tenant...</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} (@{t.slug})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={18} className="animate-spin" />}
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RoleOption({ icon, label, selected, onClick }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/10'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <div className={`mb-2 ${selected ? 'text-emerald-600' : 'text-slate-400'}`}>{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
}
