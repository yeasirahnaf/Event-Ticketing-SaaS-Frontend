"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2, Shield, User } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string; // 'Platform Admin' | 'User' | 'Tenant Admin'
    } | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '', // Optional for update
        isPlatformAdmin: false,
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                password: '',
                isPlatformAdmin: user.role === 'Platform Admin',
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);

        try {
            const updatePayload: any = {
                fullName: formData.fullName,
                email: formData.email,
                isPlatformAdmin: formData.isPlatformAdmin
            };

            // Only include password if provided
            if (formData.password && formData.password.trim() !== '') {
                updatePayload.password = formData.password;
            }

            await adminService.updateUser(user.id, updatePayload);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to update user", error);
            alert(error.response?.data?.message || "Failed to update user");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 italic">Edit User</h3>
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
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password (Optional)</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-medium"
                                placeholder="Leave blank to keep current"
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Role Assignment</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <RoleOption
                                    icon={<User size={18} />}
                                    label="Regular User"
                                    selected={!formData.isPlatformAdmin}
                                    onClick={() => setFormData({ ...formData, isPlatformAdmin: false })}
                                />
                                <RoleOption
                                    icon={<Shield size={18} />}
                                    label="Platform Admin"
                                    selected={formData.isPlatformAdmin}
                                    onClick={() => setFormData({ ...formData, isPlatformAdmin: true })}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                * To make this user a Tenant Admin, please use the Tenant creation flow or Tenant Users section.
                            </p>
                        </div>
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
                            Save Changes
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
                ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900/20'
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <div className={`mb-2 ${selected ? 'text-slate-900' : 'text-slate-400'}`}>{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
}
