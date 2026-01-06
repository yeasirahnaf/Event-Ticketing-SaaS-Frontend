'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(email, password);
            const user = response.user;
            setSuccess(true);

            setTimeout(() => {
                if (user.role === 'platform_admin') {
                    router.push('/admin');
                } else if (user.role === 'TenantAdmin' || user.role === 'staff' || user.tenantId) {
                    router.push('/tenant-admin');
                } else {
                    router.push('/tenant-admin');
                }
            }, 800);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c] relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[128px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[128px] animate-pulse delay-1000"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

            <div className="w-full max-w-lg px-6 relative z-10">
                {/* Glass Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-emerald-900/20 relative overflow-hidden group/card hover:border-white/15 transition-colors duration-500">

                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>

                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative mb-4 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative h-14 w-14 bg-[#0F1424] rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                                <ShieldCheck className="text-emerald-400 h-7 w-7" />
                            </div>
                            <div className="absolute -top-2 -right-2 text-yellow-300 animate-bounce delay-700">
                                <Sparkles size={16} fill="currentColor" className="opacity-80" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-400 text-sm text-center">Manage your events with <span className="text-emerald-400 font-medium">premium</span> security.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mb-0.5"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className={`text-xs uppercase font-bold tracking-widest ml-1 transition-colors duration-200 ${focusedInput === 'email' ? 'text-emerald-400' : 'text-slate-500'}`}>Email Address</label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-[1px] opacity-0 transition duration-300 ${focusedInput === 'email' ? 'opacity-50' : 'group-hover:opacity-20'}`}></div>
                                <div className="relative bg-[#0F1424] rounded-xl border border-white/10 transition-colors duration-300 flex items-center">
                                    <div className="pl-4 text-slate-500">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 px-3 py-3.5 focus:ring-0 focus:outline-none text-base"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className={`text-xs uppercase font-bold tracking-widest transition-colors duration-200 ${focusedInput === 'password' ? 'text-emerald-400' : 'text-slate-500'}`}>Password</label>
                                <Link href="#" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors duration-200">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-[1px] opacity-0 transition duration-300 ${focusedInput === 'password' ? 'opacity-50' : 'group-hover:opacity-20'}`}></div>
                                <div className="relative bg-[#0F1424] rounded-xl border border-white/10 transition-colors duration-300 flex items-center">
                                    <div className="pl-4 text-slate-500">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 px-3 py-3.5 focus:ring-0 focus:outline-none text-base"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`
                                overflow-hidden relative w-full flex justify-center items-center py-4 rounded-xl font-bold text-white text-base shadow-lg transition-all duration-300 group
                                ${loading || success
                                    ? 'bg-emerald-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:shadow-emerald-500/25 active:scale-[0.98]'
                                }
                            `}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>

                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        <span>Signing In...</span>
                                    </>
                                ) : success ? (
                                    <span>Redirecting...</span>
                                ) : (
                                    <>
                                        <span>Access Dashboard</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm mt-8">
                        New to TicketBD?{' '}
                        <button className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">Apply for access</button>
                    </p>
                </div>

                <div className="mt-8 flex justify-center gap-6 text-slate-500/50 text-xs font-medium uppercase tracking-widest">
                    <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
                    <span className="hover:text-slate-400 cursor-pointer transition-colors">Support</span>
                </div>
            </div>
        </div>
    );
}
