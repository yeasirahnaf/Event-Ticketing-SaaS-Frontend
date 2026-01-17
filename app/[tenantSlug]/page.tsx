'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import DynamicThemeRenderer from '@/components/themes/DynamicThemeRenderer';
import { useParams } from 'next/navigation';

export default function TenantPublicPage() { // Remove props
    const params = useParams(); // Use the hook
    const slug = params?.tenantSlug as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:7000';

    useEffect(() => {
        if (slug) {
            fetchEventData(slug);
        }
    }, [slug]);

    async function fetchEventData(slug: string) {
        try {
            const res = await axios.get(`${API_URL}/public/events/${slug}`);
            // Backend returns the event object directly
            setData(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load event page');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Loading Experience...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-500 w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
                    <p className="text-slate-400 mb-6">{error || "The event page you are looking for does not exist."}</p>
                    <a href="/" className="inline-block px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors">Return Home</a>
                </div>
            </div>
        );
    }

    const event = data;
    const tenant = event.tenant || {};
    const theme = event.theme;

    // Validate theme existence
    if (!theme) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold">Theme Loading Error</h1>
                    <p className="text-slate-400">This event does not have a valid theme assigned.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {event.status !== 'active' && event.status !== 'published' && (
                <div className="bg-amber-400 text-amber-950 px-4 py-2 text-center font-bold text-sm fixed top-0 left-0 right-0 z-50 shadow-md">
                    ⚠️ PREVIEW MODE: This event is currently {event.status}.
                </div>
            )}
            <DynamicThemeRenderer
                tenant={tenant}
                event={event}
                theme={theme}
            />
        </>
    );
}
