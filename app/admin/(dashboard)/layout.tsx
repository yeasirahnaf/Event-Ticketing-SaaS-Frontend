"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    Menu,
    X,
    Ticket,
    Search,
    Bell,
    ChevronRight
} from 'lucide-react';

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
        { icon: <Building2 size={20} />, label: 'Tenants', href: '/admin/tenants' },
        { icon: <Users size={20} />, label: 'Platform Users', href: '/admin/users' },
        { icon: <Ticket size={20} />, label: 'Ticket Sales', href: '/admin/sales' },
        { icon: <Settings size={20} />, label: 'System Settings', href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-slate-200 bg-white shadow-sm ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                            <Ticket className="text-white" size={22} />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col leading-tight overflow-hidden whitespace-nowrap">
                                <span className="text-lg font-black tracking-tighter text-slate-950 italic">TicketBD</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin Portal</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 mt-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 group relative"
                            >
                                <div className="shrink-0">{item.icon}</div>
                                {isSidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* User Bottom Section */}
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                        >
                            <LogOut size={20} className="shrink-0" />
                            {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
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
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="bg-transparent border-none text-xs focus:ring-0 w-48 text-slate-600 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex flex-col items-end leading-none hidden sm:flex">
                                <span className="text-xs font-bold text-slate-950">Super Admin</span>
                                <span className="text-[10px] font-medium text-slate-500">Platform Control</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-primary/20 flex items-center justify-center font-bold text-primary">
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
