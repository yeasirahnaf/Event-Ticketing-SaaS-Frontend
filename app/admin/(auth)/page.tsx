"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setStatus({ type: 'loading', message: 'Authenticating...' });
        setFieldErrors({});

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await authService.login(email, password);
            setStatus({ type: 'success', message: 'Login successful' });
            setTimeout(() => router.push('/admin/dashboard'), 1000);
        } catch (error: any) {
            console.error("Login failed", error);
            const errorMessage = error.response?.data?.message || 'Invalid email or password';
            setStatus({ type: 'error', message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage });
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-8">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 group-hover:rotate-6 transition-transform duration-300">
                        <Ticket className="text-white" size={28} />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-2xl font-black tracking-tighter text-slate-950 italic">TicketBD</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Admin Portal</span>
                    </div>
                </Link>
            </div>

            <div className="bg-white py-10 px-6 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-12 border border-slate-100">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-950 italic mb-2">Welcome Back</h2>
                    <p className="text-slate-500 text-sm">Please enter your credentials to access the platform control panel.</p>
                </div>

                {status.type !== 'idle' && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        status.type === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {status.type === 'success' && <CheckCircle2 size={20} className="shrink-0" />}
                        {status.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
                        {status.type === 'loading' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />}
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>
                )}

                <form className="space-y-6" action={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@ticketbd.com"
                                className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-xs font-semibold text-red-500 uppercase tracking-tight">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="text-xs">
                                <a href="#" className="font-bold text-primary hover:text-emerald-700 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            />
                            {fieldErrors.password && (
                                <p className="mt-1.5 text-xs font-semibold text-red-500 uppercase tracking-tight">
                                    {fieldErrors.password[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded-md transition-all cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-600 font-medium cursor-pointer">
                            Remember me
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                        >
                            {status.type === 'loading' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Terminal</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Don't have an admin account?{' '}
                        <Link href="/admin/register" className="text-primary font-bold hover:underline">
                            Register Admin
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 italic">
                &copy; {new Date().getFullYear()} TicketBD. Authorized Access Only.
            </p>
        </div>
    );
}
