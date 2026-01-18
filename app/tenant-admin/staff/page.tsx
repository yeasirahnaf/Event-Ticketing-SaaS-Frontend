'use client';

import React, { useEffect, useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Mail, Plus, Shield, Trash2, User, MoreVertical, Search, ExternalLink, ShieldAlert, CheckCircle2, X, Loader2, Key, Info } from 'lucide-react';

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Invitation Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await tenantAdminService.getAllStaff();
            // Ensure data is an array
            const staffList = Array.isArray(data) ? data : (data as any).data || [];
            setStaff(staffList);
        } catch (error) {
            console.error("Failed to fetch staff", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setMessage(null);
        try {
            await tenantAdminService.inviteStaff(formData);
            setMessage({ type: 'success', text: 'Member invited successfully! An email has been sent.' });
            setFormData({ fullName: '', email: '', password: '' });
            fetchStaff();
            // Close modal after delay
            setTimeout(() => {
                setIsModalOpen(false);
                setMessage(null);
            }, 3000);
        } catch (error: any) {
            console.error('Invitation error details:', {
                status: error?.response?.status,
                data: error?.response?.data,
                message: error?.message
            });
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to invite member' });
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}? They will lose access immediately.`)) return;

        try {
            await tenantAdminService.removeStaff(id);
            fetchStaff();
        } catch (error) {
            console.error("Failed to remove staff", error);
            alert("Failed to remove member. Please try again.");
        }
    };

    const filteredStaff = staff.filter(member =>
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 px-4 lg:px-0">
            {/* ATMOSPHERIC PERSONNEL HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0 opacity-50"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2 lg:space-y-3 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl">
                                <ShieldAlert size={28} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Staff Management</span>
                                <h1 className="text-2xl font-black tracking-tight text-white uppercase leading-none">Team Members</h1>
                            </div>
                        </div>
                        <p className="text-emerald-100/60 text-xs font-medium leading-relaxed max-w-lg">
                            Manage team access and invitation credentials. Monitor staff activity and roles within your organization.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-0.5">Total Staff</span>
                            <span className="text-2xl font-black text-white">{staff.length}</span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-[#022c22] px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2.5 h-full"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Invite Staff Member
                        </button>
                    </div>
                </div>
            </div>

            {/* PREMIUM FILTER HUB */}
            <div className="bg-white p-4 lg:p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-5 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Scan Personnel Database..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-xs font-bold text-slate-900 outline-none shadow-inner"
                    />
                </div>
            </div>

            {/* Staff Matrix */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-72 bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm"></div>
                    ))}
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 text-slate-300">
                        <User size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Zero Matches Found</h3>
                    <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Adjust your scan parameters or initialize new units.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStaff.map((member) => (
                        <div
                            key={member.id || member.user_id}
                            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-500/20 transition-all duration-500 overflow-hidden flex flex-col relative"
                        >
                            {/* Card Header Background */}
                            <div className="h-16 bg-slate-50/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            </div>

                            {/* Personnel Avatar */}
                            <div className="px-6 -mt-10 relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full p-1 bg-white border border-slate-100 shadow-xl relative group-hover:scale-110 transition-transform duration-500">
                                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                        <User size={40} strokeWidth={1.5} />
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white shadow-lg ${member.status !== 'inactive' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>

                                <div className="mt-4 mb-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
                                        {member.fullName}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Mail size={10} className="text-slate-300" />
                                        {member.email}
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-3 pb-6">
                                    <button className="py-2.5 rounded-xl bg-slate-50 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2">
                                        Profile <ExternalLink size={10} />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(member.id || member.user_id, member.fullName)}
                                        className="py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-[9px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 flex items-center justify-center gap-2"
                                    >
                                        Revoke <Trash2 size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Access Authorization Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => !inviting && setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-[#022c22] p-6 lg:p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 skew-x-12 translate-x-1/2"></div>
                            <div className="relative z-10 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                                    <Plus className="text-emerald-400" size={24} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80 mb-0.5 block">Access Authorization</span>
                                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">Initialize Unit</h3>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 lg:p-8 space-y-5">
                            <form onSubmit={handleInvite} className="space-y-4">
                                {message && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${message?.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {message?.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                                        <p className="text-[11px] font-bold uppercase tracking-tight">{message?.text}</p>
                                    </div>
                                )}

                                <div className="space-y-1.5 focus-within:ring-0 group">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                            <User size={16} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Channel</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Credentials Access</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                            <Key size={16} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            minLength={8}
                                            placeholder="Min. 8 characters"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all outline-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                        <Info size={14} className="text-amber-600" />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-wider">
                                        Personnel will receive an email with credentials and 'Staff' role assignment.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-6 bg-slate-50 -mx-6 lg:-mx-8 px-6 lg:px-8 py-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-[9px] uppercase tracking-[0.3em]"
                                        disabled={inviting}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 text-[9px] uppercase tracking-[0.3em] overflow-hidden relative group/btn"
                                        disabled={inviting}
                                    >
                                        {inviting ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Initialize
                                                <CheckCircle2 size={14} />
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

