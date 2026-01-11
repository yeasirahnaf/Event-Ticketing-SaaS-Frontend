'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarDays,
    ShoppingCart,
    Ticket,
    Users,
    Settings,
    LogOut,
    Menu,
    ShieldCheck,
    Palette
} from 'lucide-react';
import { authService } from '@/services/authService';

export default function TenantAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loggingOut, setLoggingOut] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    React.useEffect(() => {
        const verifySession = async () => {
            try {
                await authService.checkAuth();
                setIsAuthenticated(true);
            } catch (error: any) {
                const status = error?.status;
                // 401/403 is expected for unauthenticated users - silently redirect
                if (status === 401 || status === 403) {
                    router.replace('/auth/login');
                } else {
                    console.error('Auth verification failed:', error?.message || error);
                    router.replace('/auth/login');
                }
            }
        };
        verifySession();
    }, [router]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await authService.logout();
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setLoggingOut(false);
        }
    };

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
        const isActive = pathname === href;
        return (
            <li>
                <Link
                    href={href}
                    className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                        ${isActive
                            ? 'bg-white/10 text-emerald-400 shadow-lg shadow-black/10 backdrop-blur-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{label}</span>
                    {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    )}
                </Link>
            </li>
        );
    };

    return (
        <div className="drawer lg:drawer-open font-sans antialiased text-slate-900 bg-slate-50">
            <input id="tenant-drawer" type="checkbox" className="drawer-toggle" />

            {/* Main Content Content */}
            <div className="drawer-content flex flex-col min-h-screen">
                {/* Mobile Navbar */}
                <div className="w-full navbar bg-slate-900 text-white shadow-md lg:hidden z-20">
                    <div className="flex-none">
                        <label htmlFor="tenant-drawer" className="btn btn-square btn-ghost">
                            <Menu className="h-6 w-6" />
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" size={20} />
                            TicketBD
                        </span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-slate-50/50">
                    {children}
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-30">
                <label htmlFor="tenant-drawer" className="drawer-overlay bg-black/50 backdrop-blur-sm"></label>
                <div className="menu p-4 w-72 min-h-full bg-[#022c22] text-base-content flex flex-col justify-between border-r border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[96px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[96px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div>
                        {/* Logo Section */}
                        <div className="flex items-center gap-3 px-2 mb-10 pt-2 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/10">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold text-white leading-tight tracking-tight">TicketBD</h2>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tenant Portal</span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <ul className="space-y-1 relative z-10">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 mt-2">Platform</p>
                            <NavItem href="/tenant-admin" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem href="/tenant-admin/events" icon={CalendarDays} label="Events" />
                            <NavItem href="/tenant-admin/orders" icon={ShoppingCart} label="Orders" />

                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 mt-6">Management</p>
                            <NavItem href="/tenant-admin/tickets" icon={Ticket} label="Tickets" />
                            <NavItem href="/tenant-admin/staff" icon={Users} label="Staff" />
                            <NavItem href="/tenant-admin/design" icon={Palette} label="Site Design" />
                            <NavItem href="/tenant-admin/settings" icon={Settings} label="Settings" />
                        </ul>
                    </div>

                    {/* User & Logout */}
                    <div className="relative z-10">
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-500/10 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium text-sm">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
