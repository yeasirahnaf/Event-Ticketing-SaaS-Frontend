"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, Bell, Search, Ticket, Building2, CreditCard, Palette, Shield } from 'lucide-react';

import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const verifySession = async () => {
            try {
                await authService.checkAuth();
                setIsAuthenticated(true);
            } catch (error) {
                // If 401/403, redirect to admin login
                router.replace('/admin/login');
            }
        };
        verifySession();
    }, [router]);

    async function handleLogout() {
        await authService.logout();
        router.replace('/admin/login');
    }

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Users', icon: <Users size={20} />, href: '/admin/users' },
        { label: 'Tenants', icon: <Building2 size={20} />, href: '/admin/tenants' },
        { label: 'Themes', icon: <Palette size={20} />, href: '/admin/themes' }, // New Theme Item
        { label: 'Payment', icon: <CreditCard size={20} />, href: '/admin/payment' },
        { label: 'Settings', icon: <Settings size={20} />, href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-slate-100">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-950 shadow-2xl ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/50">
                            <Ticket className="text-white" size={22} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col leading-tight overflow-hidden whitespace-nowrap">
                                <span className="text-lg font-black tracking-tighter text-white italic">TicketBD</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Admin Portal</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group relative"
                            >
                                <div className="shrink-0 group-hover:text-emerald-400 transition-colors">{item.icon}</div>
                                {isSidebarOpen && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-800">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Bottom Section */}
                    <div className="p-4 border-t border-slate-900/50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                        >
                            <LogOut size={20} className="shrink-0 group-hover:text-red-400 transition-colors" />
                            {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`transition-all duration-300 min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-emerald-600"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-slate-200 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="bg-transparent border-none text-xs focus:ring-0 w-48 text-slate-600 placeholder:text-slate-400 p-0 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg hover:bg-emerald-50 transition-colors text-slate-500 hover:text-emerald-600">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex flex-col items-end leading-none hidden sm:flex">
                                <span className="text-xs font-bold text-slate-900">Super Admin</span>
                                <span className="text-[10px] font-bold text-emerald-600 tracking-wide uppercase">Platform Control</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 border-2 border-white ring-2 ring-emerald-100 flex items-center justify-center font-black text-emerald-700 shadow-md">
                                SA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
