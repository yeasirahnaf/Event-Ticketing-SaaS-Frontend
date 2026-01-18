'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Check, Layout, Filter, CreditCard, ChevronRight, Star, Clock, AlertCircle, Sparkles, Box, ShieldCheck, Zap } from 'lucide-react';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Theme, ThemePurchase } from '@/types/theme';

export default function TenantThemesPage() {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'library'>('marketplace');
    const [themes, setThemes] = useState<Theme[]>([]);
    const [purchasedThemes, setPurchasedThemes] = useState<ThemePurchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

    const [purchasingTheme, setPurchasingTheme] = useState<Theme | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [availableData, purchasedData] = await Promise.all([
                tenantAdminService.getAvailableThemes(),
                tenantAdminService.getPurchasedThemes()
            ]);
            setThemes(availableData);
            setPurchasedThemes(purchasedData);
        } catch (error) {
            console.error('Failed to fetch themes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check ownership
    const isOwned = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme && (!theme.isPremium || theme.price === 0)) return true; // Free themes are auto-owned
        return purchasedThemes.some(p => p.themeId === themeId && p.status === 'active');
    };

    const handlePurchaseSuccess = () => {
        setPurchasingTheme(null);
        fetchData(); // Refresh data to update ownership status
    };

    const filteredThemes = themes.filter(theme => {
        const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            theme.description.toLowerCase().includes(searchTerm.toLowerCase());

        const isFree = !theme.isPremium || theme.price === 0;
        const matchesPrice = priceFilter === 'all' ? true :
            priceFilter === 'free' ? isFree :
                priceFilter === 'paid' ? !isFree : true;

        return matchesSearch && matchesPrice;
    });

    // Merge purchased themes with free themes for the Library view
    const allLibraryThemes = [
        ...themes.filter(t => !t.isPremium || t.price === 0).map(t => ({ theme: t, themeId: t.id, status: 'active', purchasedAt: new Date().toISOString() } as any)),
        ...purchasedThemes
    ];

    // Deduplicate logic: If a free theme is also in purchasedThemes, prefer purchasedThemes so we have real purchase data if any
    const uniqueLibraryThemes = Array.from(new Map(allLibraryThemes.map(item => [item.theme.id, item])).values());




    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 px-4 lg:px-0">
            {/* ATMOSPHERIC MARKETPLACE HEADER */}
            <div className="bg-[#022c22] rounded-3xl p-6 lg:p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
                {/* Background Patterns */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent z-0 opacity-50"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2 lg:space-y-3 max-w-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl">
                                <ShoppingBag className="text-emerald-400" size={28} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Themes Marketplace</span>
                                <h1 className="text-2xl font-black tracking-tight text-white uppercase leading-none">Available Themes</h1>
                            </div>
                        </div>
                        <p className="text-emerald-100/60 text-xs font-medium leading-relaxed max-w-lg">
                            Browse and acquire premium themes for your events. Explore the marketplace or manage your existing theme library.
                        </p>
                    </div>

                    {/* Integrated Tab Navigation */}
                    <div className="flex p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl self-start md:self-auto">
                        <button
                            onClick={() => setActiveTab('marketplace')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-[0.9rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'marketplace'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Box size={14} />
                            Marketplace
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-[0.9rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${activeTab === 'library'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Layout size={14} />
                            My Library
                            {uniqueLibraryThemes.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-[#022c22] rounded-full flex items-center justify-center text-[8px] font-black border-2 border-[#022c22] shadow-lg animate-pulse">
                                    {uniqueLibraryThemes.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Marketplace View */}
            {activeTab === 'marketplace' && (
                <div className="space-y-8">
                    {/* PREMIUM FILTER HUB */}
                    <div className="bg-white p-4 lg:p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-5 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search themes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 transition-all text-xs font-bold text-slate-900 outline-none shadow-inner"
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'All Themes' },
                                { id: 'free', label: 'Free' },
                                { id: 'paid', label: 'Premium' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setPriceFilter(filter.id as any)}
                                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${priceFilter === filter.id
                                        ? 'bg-white text-emerald-600 shadow-md shadow-emerald-200/40 scale-105 z-10 border border-emerald-100/50'
                                        : 'text-slate-400 hover:text-emerald-500'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100 shadow-xl shadow-slate-200/40"></div>
                            ))}
                        </div>
                    ) : filteredThemes.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Themes Found</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">No themes match your search criteria.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setPriceFilter('all'); }}
                                className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                            >
                                Reset Search
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredThemes.map(theme => (
                                <ThemeMarketplaceCard
                                    key={theme.id}
                                    theme={theme}
                                    owned={isOwned(theme.id)}
                                    onPurchase={() => setPurchasingTheme(theme)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Library View */}
            {activeTab === 'library' && (
                <div className="space-y-8">
                    {uniqueLibraryThemes.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6 text-slate-300 shadow-inner">
                                <Layout size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Library Empty</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">You haven't acquired any themes yet.</p>
                            <button
                                onClick={() => setActiveTab('marketplace')}
                                className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                Go to Marketplace
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {uniqueLibraryThemes.map(purchase => (
                                <ThemeMarketplaceCard
                                    key={purchase.theme.id}
                                    theme={purchase.theme}
                                    owned={true}
                                    purchaseDate={purchase.purchasedAt}
                                    onPurchase={() => { }} // No-op for owned
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Purchase Modal */}
            {purchasingTheme && (
                <PurchaseModal
                    theme={purchasingTheme}
                    onClose={() => setPurchasingTheme(null)}
                    onSuccess={handlePurchaseSuccess}
                />
            )}
        </div>
    );
}

// Components

function ThemeMarketplaceCard({ theme, owned, purchaseDate, onPurchase }: { theme: Theme; owned: boolean; purchaseDate?: string; onPurchase: () => void }) {
    const isFree = !theme.isPremium || theme.price === 0;

    return (
        <div className="group bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-emerald-500/10 hover:border-emerald-500/20 transition-all duration-500 flex flex-col overflow-hidden relative">
            {/* Thumbnail Matrix */}
            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden group/thumb">
                {theme.thumbnailUrl ? (
                    <img
                        src={theme.thumbnailUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-700 brightness-[0.95] group-hover/thumb:brightness-100"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                        <Box size={40} className="mb-2 opacity-20" />
                        <span className="text-[8px] font-black uppercase tracking-widest">No Image</span>
                    </div>
                )}

                {/* Glass Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-[9px] font-black tracking-[0.2em] text-white uppercase shadow-2xl">
                        {theme.category}
                    </span>
                    {owned && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border border-emerald-400">
                            <ShieldCheck size={12} />
                            Owned
                        </div>
                    )}
                </div>

                <div className="absolute top-4 right-4 item-end justify-end flex flex-col gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl border ${isFree
                        ? 'bg-blue-500/90 text-white border-blue-400'
                        : 'bg-amber-400/90 text-amber-950 border-amber-300'
                        }`}>
                        {isFree ? 'STANDARD' : `৳${theme.price}`}
                    </span>
                </div>

                {/* Interactive Overlay */}
                {!owned && (
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <button
                            onClick={onPurchase}
                            className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Zap size={14} className="text-emerald-500" />
                            Acquire Now
                        </button>
                    </div>
                )}
            </div>

            {/* Core Info */}
            <div className="p-5 lg:p-6 flex flex-col flex-1 bg-white relative z-10">
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">
                            {theme.name}
                        </h3>
                        {theme.isPremium && !owned && (
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 ring-4 ring-amber-50/50">
                                <Sparkles size={14} />
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-10 italic">
                        {theme.description}
                    </p>

                    {purchaseDate && (
                        <div className="mt-4 flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 self-start">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                ACQUIRED: {new Date(purchaseDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Matrix Actions */}
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {theme.defaultProperties?.colors && Object.entries(theme.defaultProperties.colors)
                            .filter(([key]) => ['primary', 'secondary', 'accent'].includes(key))
                            .slice(0, 3)
                            .map(([key, color]: any) => (
                                <div
                                    key={key}
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg ring-1 ring-slate-100 transition-transform hover:scale-125 hover:z-20 cursor-help"
                                    style={{ backgroundColor: color }}
                                    title={key}
                                />
                            ))}
                    </div>

                    {owned ? (
                        <div className="flex items-center gap-2 text-emerald-500/60 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-emerald-50/30 rounded-xl border border-emerald-100/30 cursor-default">
                            <Check size={14} strokeWidth={3} />
                            Owned
                        </div>
                    ) : (
                        <button
                            onClick={onPurchase}
                            className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-2 group/btn"
                        >
                            Acquire Now
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Purchase & Acquisition Hub
function PurchaseModal({ theme, onClose, onSuccess }: { theme: Theme; onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [isSuccess, setIsSuccess] = useState(false);
    const isFree = !theme.isPremium || theme.price === 0;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await tenantAdminService.purchaseTheme(theme.id, paymentMethod);
            setIsSuccess(true);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Failed to process purchase. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl" onClick={onSuccess}>
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center border border-emerald-500/20" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 animate-pulse"></div>
                        <Check size={32} strokeWidth={4} className="relative z-10" />
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Purchase Successful</h3>
                    <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed max-w-[280px] mx-auto">
                        The <span className="font-black text-emerald-600 italic">"{theme.name}"</span> interface has been integrated into your profile.
                    </p>

                    <button
                        onClick={onSuccess}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] group"
                    >
                        Go to Library
                    </button>

                    <p className="text-[9px] font-black text-slate-400 mt-6 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        Validated & Secure
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="bg-[#022c22] p-6 lg:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 skew-x-12 translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                            <Box className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80 mb-0.5 block">Purchase Theme</span>
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">
                                {isFree ? 'Confirm Theme' : 'Purchase Premium Theme'}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 lg:p-8 space-y-6">
                    {/* Item Context */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner group">
                        <div className="h-16 w-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                            {theme.thumbnailUrl && <img src={theme.thumbnailUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{theme.name}</h4>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-400 text-[8px] font-black uppercase tracking-widest">
                                    {theme.category}
                                </span>
                            </div>
                            <p className="text-emerald-600 font-black text-lg flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pricing:</span>
                                {isFree ? 'STANDARD' : `৳${theme.price}`}
                            </p>
                        </div>
                    </div>

                    {!isFree && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Acquisition Gateway</label>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck size={10} /> Secure Scan
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['bkash', 'nagad', 'stripe', 'sslcommerz'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1.5 ${paymentMethod === method
                                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-md shadow-emerald-500/10'
                                            : 'border-slate-50 hover:border-emerald-200 hover:bg-slate-50 text-slate-400'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${paymentMethod === method ? 'bg-emerald-100 shadow-sm' : 'bg-slate-100'}`}>
                                            <CreditCard size={14} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{method}</span>
                                    </button>
                                ))}
                                <button className="p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 flex flex-col items-center gap-1.5 cursor-not-allowed opacity-50">
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest">More...</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!isFree && (
                        <div className="text-[10px] text-slate-500 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 flex gap-4 items-start">
                            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                            <p className="font-medium leading-relaxed italic">
                                This is a premium operational interface. High-priority clearance is required. Your organization will be charged <span className="font-black text-amber-700">৳{theme.price}</span> upon confirmation.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-[9px] uppercase tracking-[0.3em]"
                    >
                        Abort Sync
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-[2] py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 text-[9px] uppercase tracking-[0.3em] overflow-hidden relative group/btn"
                    >
                        {loading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Syncing...
                            </>
                        ) : (
                            <>
                                <Zap size={14} className="group-hover/btn:animate-pulse" />
                                {isFree ? 'Initialize Sync' : 'Acquire Matrix'}
                            </>
                        )}
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
