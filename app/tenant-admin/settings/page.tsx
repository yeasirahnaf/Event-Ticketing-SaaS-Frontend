'use client';

import React, { useState } from 'react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Building, CreditCard, Globe, Image as ImageIcon, Save, Shield, User } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('organization');
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'organization', label: 'Organization', icon: Building },
        { id: 'branding', label: 'Branding', icon: Globe },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'team', label: 'Team', icon: Shield },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium">Manage your organization preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'organization' && (
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Organization Details</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Company Name</label>
                                        <input type="text" defaultValue="TicketBD Events" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none font-medium focus:ring-2 focus:ring-emerald-500/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Public Email</label>
                                        <input type="email" defaultValue="support@ticketbd.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none font-medium focus:ring-2 focus:ring-emerald-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Website</label>
                                    <input type="url" defaultValue="https://ticketbd.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none font-medium focus:ring-2 focus:ring-emerald-500/20" />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button className="btn bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-xl font-bold shadow-lg">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Brand Customization</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                        <ImageIcon className="text-slate-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Logo</h3>
                                        <p className="text-sm text-slate-500 mb-4">Recommended size: 400x400px. PNG or JPG.</p>
                                        <button className="text-sm font-bold text-emerald-600 hover:underline">Upload new logo</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Primary Color</label>
                                        <div className="flex gap-2">
                                            <input type="color" defaultValue="#059669" className="h-12 w-24 rounded-xl cursor-pointer" />
                                            <input type="text" defaultValue="#059669" className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none font-medium font-mono uppercase" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button className="btn bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-xl font-bold shadow-lg">Save Branding</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-300 text-center py-20">
                            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CreditCard className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Billing Portal</h3>
                            <p className="text-slate-500 mb-6">Manage your subscription and payment methods.</p>
                            <button className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                Open Stripe Portal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
