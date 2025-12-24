import React from 'react';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-primary/5">
                <h1 className="text-3xl font-black text-slate-950 mb-6 italic tracking-tighter">TicketBD</h1>
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <p className="text-slate-500 text-sm mb-6">Enter your credentials to access your dashboard.</p>
                {/* Login form placeholder */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="name@company.com" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="••••••••" />
                    </div>
                    <button className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
