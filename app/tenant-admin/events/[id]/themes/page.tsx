'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { tenantAdminService } from '@/services/tenantAdminService';
import { Theme, ThemePurchase } from '@/types/theme';
import DynamicThemeRenderer from '@/components/themes/DynamicThemeRenderer';
import { Save, Smartphone, Monitor, ChevronLeft, Check, Palette, Type, Layout, Image as ImageIcon, MapPin, Calendar, Users, FileText, Globe } from 'lucide-react';
import Link from 'next/link';

export default function EventThemeEditorPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<any>(null);
    const [purchasedThemes, setPurchasedThemes] = useState<ThemePurchase[]>([]);
    const [selectedThemeId, setSelectedThemeId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor State
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeSection, setActiveSection] = useState<string>('global'); // global, hero, about, etc.

    // Content State (mirrors EventEntity structure)
    const [themeContent, setThemeContent] = useState<any>({});
    const [themeCustomization, setThemeCustomization] = useState<any>({});
    const [seoSettings, setSeoSettings] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventData, purchases] = await Promise.all([
                tenantAdminService.getEventById(eventId),
                tenantAdminService.getPurchasedThemes()
            ]);

            setEvent(eventData);
            setPurchasedThemes(purchases);

            // Initialize State
            if (eventData.themeId) {
                setSelectedThemeId(eventData.themeId);
            }
            if (eventData.themeContent && Object.keys(eventData.themeContent).length > 0) {
                setThemeContent(eventData.themeContent);
            } else if (eventData.theme?.defaultContent) {
                setThemeContent(eventData.theme.defaultContent);
            }

            if (eventData.themeCustomization) setThemeCustomization(eventData.themeCustomization);
            if (eventData.seoSettings) setSeoSettings(eventData.seoSettings);

        } catch (error) {
            console.error('Failed to load editor data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = (themeId: string) => {
        setSelectedThemeId(themeId);
        // Load default content from the selected theme if switching
        const theme = purchasedThemes.find(p => p.theme.id === themeId)?.theme;
        if (theme && theme.defaultContent) {
            if (confirm('Switching themes will reset your content structure. Continue?')) {
                setThemeContent(theme.defaultContent);
                // Reset customizations too? Maybe keep generic ones.
                // For now, keep generic.
            } else {
                // Revert selection
                // (requires tracking previous ID, skipping for complexity)
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await tenantAdminService.updateEvent(eventId, {
                themeId: selectedThemeId,
                themeContent,
                themeCustomization,
                seoSettings
            });
            alert('Theme settings saved successfully!');
        } catch (error) {
            console.error('Failed to save theme settings', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to get actual Theme object
    const currentTheme = useMemo(() => {
        return purchasedThemes.find(p => p.theme.id === selectedThemeId)?.theme || event?.theme;
    }, [selectedThemeId, purchasedThemes, event]);

    // Transform Data for ThemeRenderer
    const previewConfig = useMemo(() => {
        return {
            styleOverrides: {
                colors: themeCustomization.colors || currentTheme?.defaultProperties?.colors
            },
            assets: {
                logoUrl: themeCustomization.logo,
                heroBannerUrl: themeContent.hero?.backgroundImage
            },
            siteInfo: {
                title: themeContent.hero?.title || event?.name,
                description: themeContent.hero?.subtitle || event?.description,
                contactEmail: 'contact@example.com', // Placeholder
                socialLinks: themeContent.speakers?.[0]?.social // Hacky mapping or need specific social field
            }
        };
    }, [themeContent, themeCustomization, currentTheme, event]);

    const tenantData = { name: event?.tenant?.name || 'Your Organization' }; // Placeholder if tenant not populated
    const eventDataMock = [{ ...event, imageUrl: themeContent.hero?.backgroundImage || event?.imageUrl }]; // Mock events list with current event

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading Editor...</div>;

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href={`/tenant-admin/events/${eventId}`} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-bold text-slate-800 text-sm md:text-base">{event?.name}</h1>
                        <span className="text-xs text-slate-500">Theme Editor</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Device Toggle */}
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200"></div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Controls */}
                <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 z-10">
                    {/* Theme Selector */}
                    <div className="p-4 border-b border-slate-200">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Theme</label>
                        <select
                            value={selectedThemeId || ''}
                            onChange={(e) => handleThemeChange(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="" disabled>Select a theme</option>
                            {purchasedThemes.map(p => (
                                <option key={p.id} value={p.theme.id}>{p.theme.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Accordion Sections */}
                    <div className="divide-y divide-slate-100">
                        <EditorSection
                            title="Global Styles"
                            icon={<Palette size={16} />}
                            active={activeSection === 'global'}
                            onToggle={() => setActiveSection(activeSection === 'global' ? '' : 'global')}
                        >
                            <div className="space-y-4">
                                <ColorInput
                                    label="Primary Color"
                                    value={themeCustomization.colors?.primary || '#10b981'}
                                    onChange={(v: string) => setThemeCustomization({ ...themeCustomization, colors: { ...themeCustomization.colors, primary: v } })}
                                />
                                <ColorInput
                                    label="Secondary Color"
                                    value={themeCustomization.colors?.secondary || '#f59e0b'}
                                    onChange={(v: string) => setThemeCustomization({ ...themeCustomization, colors: { ...themeCustomization.colors, secondary: v } })}
                                />
                                <ColorInput
                                    label="Background Color"
                                    value={themeCustomization.colors?.background || '#020617'}
                                    onChange={(v: string) => setThemeCustomization({ ...themeCustomization, colors: { ...themeCustomization.colors, background: v } })}
                                />
                                <ColorInput
                                    label="Text Color"
                                    value={themeCustomization.colors?.text || '#ffffff'}
                                    onChange={(v: string) => setThemeCustomization({ ...themeCustomization, colors: { ...themeCustomization.colors, text: v } })}
                                />
                            </div>
                        </EditorSection>

                        <EditorSection
                            title="Hero Section"
                            icon={<Layout size={16} />}
                            active={activeSection === 'hero'}
                            onToggle={() => setActiveSection(activeSection === 'hero' ? '' : 'hero')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={themeContent.hero?.title || ''}
                                        onChange={(e) => setThemeContent({ ...themeContent, hero: { ...themeContent.hero, title: e.target.value } })}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="Event Title"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Subtitle</label>
                                    <textarea
                                        value={themeContent.hero?.subtitle || ''}
                                        onChange={(e) => setThemeContent({ ...themeContent, hero: { ...themeContent.hero, subtitle: e.target.value } })}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
                                        placeholder="Catchy tagline..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Background Image URL</label>
                                    <input
                                        type="text"
                                        value={themeContent.hero?.backgroundImage || ''}
                                        onChange={(e) => setThemeContent({ ...themeContent, hero: { ...themeContent.hero, backgroundImage: e.target.value } })}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </EditorSection>

                        <EditorSection
                            title="SEO Settings"
                            icon={<Globe size={16} />}
                            active={activeSection === 'seo'}
                            onToggle={() => setActiveSection(activeSection === 'seo' ? '' : 'seo')}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Meta Title</label>
                                    <input
                                        type="text"
                                        value={seoSettings.metaTitle || ''}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">Meta Description</label>
                                    <textarea
                                        value={seoSettings.metaDescription || ''}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
                                    />
                                </div>
                            </div>
                        </EditorSection>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative">
                    <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none"></div>

                    <div
                        className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden ${previewMode === 'mobile'
                            ? 'w-[375px] h-[700px] rounded-[3rem] border-8 border-slate-900'
                            : 'w-full h-full rounded-xl border border-slate-200'
                            }`}
                    >
                        {/* Live Preview */}
                        <div className="w-full h-full overflow-y-auto section-scroll no-scrollbar">
                            <DynamicThemeRenderer
                                tenant={tenantData}
                                event={{
                                    ...event,
                                    themeContent,
                                    themeCustomization: {
                                        primaryColor: themeCustomization.colors?.primary,
                                        secondaryColor: themeCustomization.colors?.secondary
                                    }
                                }}
                                theme={currentTheme}
                                customContent={themeContent}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents

function EditorSection({ title, icon, children, active, onToggle }: any) {
    return (
        <div>
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${active ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`text-slate-400 ${active ? 'text-emerald-600' : ''}`}>{icon}</div>
                    <span className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
                </div>
                <ChevronLeft size={16} className={`text-slate-400 transition-transform ${active ? '-rotate-90' : 'rotate-180'}`} />
            </button>
            {active && (
                <div className="p-4 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
}

function ColorInput({ label, value, onChange }: any) {
    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 p-1 cursor-pointer"
            />
            <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 block mb-0.5">{label}</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-slate-700 uppercase focus:outline-none"
                />
            </div>
        </div>
    );
}
