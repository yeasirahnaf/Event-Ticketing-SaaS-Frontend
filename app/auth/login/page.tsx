'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Sparkles, Activity, ShieldAlert, Zap, Cpu } from 'lucide-react';
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
            {/* AMBIENT CORE BACKGROUND */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] opacity-50"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[160px] opacity-30"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-75 contrast-125 mix-blend-overlay pointer-events-none"></div>

            <div className="w-full max-w-md px-6 relative z-10">
                {/* GLASS AUTHORIZATION HUB */}
                <div className="bg-[#022c22]/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 relative overflow-hidden group/card ring-1 ring-white/5">

                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

                    <div className="p-8 sm:p-10">
                        {/* IDENTITY HEADER */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative mb-4">
                                <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="relative h-16 w-16 bg-emerald-950 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-2xl shadow-emerald-950">
                                    <ShieldCheck className="text-emerald-400 h-8 w-8" />
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg ring-2 ring-emerald-950">
                                        <Zap size={12} className="text-[#022c22] fill-current" />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Secure Access Channel</span>
                                </div>
                                <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Login</h1>
                                <p className="text-emerald-100/40 text-[10px] font-bold uppercase tracking-[0.2em]">Sign in to manage your events</p>
                            </div>
                        </div>

                        {/* RESPONSE FEED */}
                        {error && (
                            <div className="mb-8 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 shadow-xl">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500 shadow-lg shadow-red-500/20">
                                    <ShieldAlert size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Login Failed</h4>
                                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-tight leading-relaxed">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* EMAIL */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-200 ${focusedInput === 'email' ? 'text-emerald-400' : 'text-emerald-100/30'}`}>Email Address</label>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
                                    <div className={`relative bg-black/40 rounded-2xl border border-white/5 transition-all duration-300 flex items-center ${focusedInput === 'email' ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-black/60' : 'hover:border-white/10'}`}>
                                        <div className="pl-5 text-emerald-500/40">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedInput('email')}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-transparent border-none text-white placeholder-emerald-100/10 px-4 py-3 focus:ring-0 focus:outline-none text-sm font-bold tracking-wide"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-200 ${focusedInput === 'password' ? 'text-emerald-400' : 'text-emerald-100/30'}`}>Password</label>
                                    <Link href="#" className="text-[10px] font-black text-emerald-500/40 hover:text-emerald-400 uppercase tracking-widest transition-colors">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
                                    <div className={`relative bg-black/40 rounded-2xl border border-white/5 transition-all duration-300 flex items-center ${focusedInput === 'password' ? 'ring-2 ring-emerald-500/20 border-emerald-500/30 bg-black/60' : 'hover:border-white/10'}`}>
                                        <div className="pl-5 text-emerald-500/40">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedInput('password')}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full bg-transparent border-none text-white placeholder-emerald-100/10 px-4 py-3 focus:ring-0 focus:outline-none text-sm font-bold tracking-wide"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SUBMIT */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className={`
                                        overflow-hidden relative w-full flex justify-center items-center py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all duration-500 group
                                        ${loading || success
                                            ? 'bg-emerald-800/50 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>

                                    <span className="relative z-10 flex items-center gap-3">
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : success ? (
                                            <span className="flex items-center gap-2">
                                                <Activity size={18} className="animate-pulse" />
                                                SUCCESS
                                            </span>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* BRAND SIGNATURE */}
                        <div className="mt-10 flex flex-col items-center gap-6">
                            <div className="flex items-center gap-3 pt-6 border-t border-emerald-500/10 w-full justify-center">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center">
                                            <Cpu size={10} className="text-emerald-500/60" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-emerald-100/20 uppercase tracking-[0.3em]">System Status: <span className="text-emerald-500">OPERATIONAL</span></span>
                            </div>

                            <p className="text-center text-emerald-100/30 text-[10px] font-bold uppercase tracking-widest leading-loose">
                                Don't have an account? <button className="text-emerald-500 hover:text-emerald-400 transition-colors">Apply for Access</button>
                            </p>
                        </div>
                    </div>

                </div>

                {/* SYSTEM FOOTER REFS */}
                <div className="mt-10 flex justify-center gap-8 text-emerald-100/10 text-[9px] font-black uppercase tracking-[0.4em]">
                    <span className="hover:text-emerald-500 transition-colors pointer-events-auto cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-emerald-500 transition-colors pointer-events-auto cursor-pointer">Terms of Service</span>
                    <span className="hover:text-emerald-500 transition-colors pointer-events-auto cursor-pointer">Support</span>
                </div>
            </div>
        </div>
    );
}
