"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-primary/15 bg-white/90 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 group-hover:rotate-6 transition-transform duration-300">
                            <Ticket className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-black tracking-tighter text-slate-950 group-hover:text-primary transition-colors italic">TicketBD</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SaaS Platform</span>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-8 lg:flex">
                        <Link href="/#features" className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">Pricing</Link>
                        <Link href="/about" className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">About</Link>
                        <Link href="/resources" className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">Resources</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/auth/login" className="hidden sm:flex text-sm font-black text-slate-950 hover:text-primary px-4 py-2 transition-all">
                        Login
                    </Link>
                    <div className="h-6 w-[1px] bg-slate-300 hidden sm:block mx-1"></div>
                    <Link href="/admin" className="btn btn-primary rounded-full px-7 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all text-white">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
