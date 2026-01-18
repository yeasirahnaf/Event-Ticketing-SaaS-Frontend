'use client';

import React, { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import {
    User, Mail, Lock, Shield, CheckCircle2,
    AlertCircle, Loader2, Save, Camera,
    ShieldCheck, Settings, Fingerprint,
    Activity, Key, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.checkAuth();
                setUser(data);
                setFormData(prev => ({
                    ...prev,
                    fullName: data.name || data.fullName || '',
                    email: data.email || ''
                }));
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMessage(null);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        // Validation for password change
        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'Encryption sequences do not match' });
                setSaving(false);
                return;
            }
            if (!formData.currentPassword) {
                setMessage({ type: 'error', text: 'Current authorization key is required' });
                setSaving(false);
                return;
            }
        }

        try {
            const updatePayload: any = {
                fullName: formData.fullName,
                email: formData.email
            };

            if (formData.newPassword) {
                updatePayload.password = formData.newPassword;
            }

            await authService.updateProfile(updatePayload);
            setMessage({ type: 'success', text: 'Profile Updated Successfully' });

            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            const updatedUser = await authService.checkAuth();
            setUser(updatedUser);

        } catch (error: any) {
            console.error("Failed to update profile", error);
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Update Error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 p-6">
                <div className="h-40 bg-slate-200 rounded-3xl animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
                    <div className="lg:col-span-8 h-[600px] bg-slate-100 rounded-3xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 lg:px-0">
            {/* ATMOSPHERIC DOSSIER HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0"></div>
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Fingerprint size={32} className="text-emerald-400 relative z-10 shadow-lg" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80">User Profile</span>
                            <h1 className="text-xl lg:text-3xl font-black tracking-tight text-white uppercase leading-none">
                                {formData.fullName || 'User'}
                            </h1>
                            <div className="flex items-center gap-2.5 mt-1.5">
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    Administrator
                                </span>
                                <span className="text-emerald-500/40 text-[8px] font-black uppercase tracking-[0.2em]">Verified Account</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase text-emerald-500 tracking-wider">Account Status</p>
                                <p className="text-xs font-bold text-white">Secure</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                <ShieldCheck size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Personnel Matrix */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 opacity-50"></div>

                        <div className="relative mb-6">
                            <div className="w-28 h-28 rounded-3xl bg-slate-50 p-1.5 ring-4 ring-slate-100 group-hover:ring-emerald-100 transition-all overflow-hidden relative shadow-inner">
                                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors shadow-inner">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={56} strokeWidth={1.5} />
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-white hover:bg-emerald-600 active:scale-95 transition-all z-10"
                            >
                                <Camera size={16} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="space-y-1 w-full border-b border-slate-50 pb-6 mb-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-1">{formData.fullName}</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formData.email}</p>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">User Role</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-slate-900 font-black uppercase tracking-tighter text-[10px]">
                                        {user?.role?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            {user?.tenantName && (
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Organization</span>
                                    <span className="text-slate-900 font-black text-[10px] uppercase truncate max-w-[120px]">{user.tenantName}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">System ID</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px] tracking-tight truncate max-w-[100px]">
                                    {user?.id?.substring(0, 12) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Threat Assessment & Protocol */}
                    <div className="bg-[#022c22] rounded-3xl p-6 border border-white/5 shadow-2xl shadow-emerald-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Shield size={64} className="text-white" />
                        </div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                                <Activity size={20} />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Security Tip</h4>
                                <p className="text-[11px] text-emerald-100/70 leading-relaxed font-bold uppercase tracking-tight">
                                    Regularly update your password and monitor active sessions for unauthorized access.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Authorization Parameters */}
                <div className="lg:col-span-8 space-y-6">
                    {/* ALERT FEED */}
                    {message && (
                        <div className={`p-5 rounded-2xl flex items-center gap-4 shadow-xl border ${message.type === 'success'
                            ? 'bg-emerald-500/5 text-emerald-700 border-emerald-500/20'
                            : 'bg-red-500/5 text-red-700 border-red-500/20'
                            }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'
                                    }`}>
                                    {message.type === 'success' ? 'Success' : 'Error'}
                                </h4>
                                <p className="text-[10px] font-bold uppercase tracking-tight opacity-70">{message.text}</p>
                            </div>
                        </div>
                    )}

                    {/* Basic Info Module */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center shadow-inner border border-slate-100">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Basic Information</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Personal Details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-600 transition-colors">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Encryption Sequence Module */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
                        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center shadow-inner border border-slate-100">
                                <Key size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Security & Password</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Security Credentials</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2.5 group/field">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">Current Password</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="••••••••••••"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="space-y-2.5 group/field">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors">
                                            <Activity size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="••••••••••••"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner tracking-widest"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5 group/field">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] group-focus-within/field:text-emerald-500 transition-colors">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-emerald-500 transition-colors">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="••••••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner tracking-widest"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto relative overflow-hidden bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 group/btn"
                            >
                                <div className="absolute inset-0 bg-emerald-500/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} strokeWidth={2.5} />
                                            Apply Configuration
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-10 py-4 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                        <div className="flex items-center gap-2">
                            <Shield size={14} />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Encrypted Connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe size={14} />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Regional Node: Dhaka_01</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
