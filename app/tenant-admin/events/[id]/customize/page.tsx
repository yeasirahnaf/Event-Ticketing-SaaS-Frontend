'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tenantAdminService } from '@/services/tenantAdminService';
import DynamicThemeRenderer from '@/components/themes/DynamicThemeRenderer';
import {
    ArrowLeft, Save, Layout, Type, Image as ImageIcon,
    Palette, Ticket, Globe, ChevronDown, ChevronRight,
    Plus, Trash2, Edit2, Check, X, Calendar, Users, MapPin, HelpCircle, GripVertical, Eye, EyeOff, Link, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';

// --- Generic List Editor ---
const ListEditor = ({ items, renderItem, onAdd, onEdit, onDelete, label, emptyText }: any) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {label}
                </h3>
                <button
                    onClick={onAdd}
                    className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors"
                >
                    + Add
                </button>
            </div>

            <div className="space-y-2">
                {items?.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl group relative hover:border-violet-200 transition-colors">
                        {renderItem(item)}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 p-0.5 rounded-lg backdrop-blur-sm">
                            <button
                                onClick={() => onEdit(item, index)}
                                className="p-1.5 hover:text-blue-600"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button
                                onClick={() => onDelete(index)}
                                className="p-1.5 hover:text-red-600"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {(!items || items.length === 0) && (
                    <div className="text-center p-6 bg-slate-50 rounded-xl border-dashed border border-slate-300 text-slate-400 text-xs">
                        {emptyText || 'No items yet.'}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Form Components ---
const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</label>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden relative shrink-0">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0"
                />
            </div>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-mono"
            />
        </div>
    </div>
);

const TextInput = ({ label, value, onChange, multiline = false, placeholder }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</label>
        {multiline ? (
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-violet-500/20 outline-none resize-none"
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-violet-500/20 outline-none"
            />
        )}
    </div>
);

const ImageUpload = ({ label, value, onChange }: any) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</label>
        <div className="flex gap-2">
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
            />
        </div>
        {value && (
            <div className="aspect-video w-full rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
        )}
    </div>
);

// Toggle Component
const SectionToggle = ({ isVisible, onToggle }: any) => (
    <button
        onClick={onToggle}
        className={`w-8 h-4 rounded-full relative transition-colors ${isVisible ? 'bg-green-500' : 'bg-slate-300'}`}
        title={isVisible ? 'Section Visible' : 'Section Hidden'}
    >
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${isVisible ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
)

export default function CustomizeThemePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localEvent, setLocalEvent] = useState<any>(null);
    const [activeSection, setActiveSection] = useState('branding');

    // Modals
    const [modalConfig, setModalConfig] = useState<any>({ open: false, type: '', data: null, index: -1 });

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        try {
            const data = await tenantAdminService.getEventById(eventId);
            // Ensure themeCustomization structure exists
            if (!data.themeCustomization) data.themeCustomization = {};
            if (!data.themeCustomization.sectionVisibility) data.themeCustomization.sectionVisibility = {};

            // Deep copy for local editing
            setLocalEvent(JSON.parse(JSON.stringify(data)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await tenantAdminService.updateEvent(eventId, {
                themeCustomization: localEvent.themeCustomization,
                themeContent: localEvent.themeContent
            });
            await loadData();
            alert('Theme saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const updateNestedState = (path: string[], value: any) => {
        setLocalEvent((prev: any) => {
            const newState = { ...prev };
            let current = newState;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newState;
        });
    };

    const toggleSectionVisibility = (sectionId: string) => {
        const currentVisibility = localEvent.themeCustomization?.sectionVisibility?.[sectionId];
        // If undefined, it defaults to true, so toggling makes it false. 
        // If defined, just invert.
        const newValue = currentVisibility === undefined ? false : !currentVisibility;
        updateNestedState(['themeCustomization', 'sectionVisibility', sectionId], newValue);
    };

    const isSectionVisible = (sectionId: string) => {
        const vis = localEvent?.themeCustomization?.sectionVisibility?.[sectionId];
        return vis === undefined ? true : vis;
    }

    // Generic Add/Edit/Delete for ThemeContent Lists
    // Generic Add/Edit/Delete for ThemeContent Lists
    const handleListUpdate = (listName: string, item: any, index: number) => {
        // Handle nested structure (e.g. features.features vs features)
        const content = localEvent.themeContent?.[listName];
        const isNested = content && !Array.isArray(content) && Array.isArray(content[listName]); // e.g. features.features

        const list = isNested
            ? [...content[listName]]
            : (Array.isArray(content) ? [...content] : []);

        if (index === -1) {
            list.push(item);
        } else {
            list[index] = item;
        }

        if (isNested) {
            updateNestedState(['themeContent', listName, listName], list);
        } else {
            updateNestedState(['themeContent', listName], list);
        }

        setModalConfig({ open: false, type: '', data: null, index: -1 });
    };

    const handleListDelete = (listName: string, index: number) => {
        if (!confirm('Remove this item?')) return;

        // Handle nested structure
        const content = localEvent.themeContent?.[listName];
        const isNested = content && !Array.isArray(content) && Array.isArray(content[listName]);

        const list = isNested
            ? [...content[listName]]
            : (Array.isArray(content) ? [...content] : []);

        list.splice(index, 1);

        if (isNested) {
            updateNestedState(['themeContent', listName, listName], list);
        } else {
            updateNestedState(['themeContent', listName], list);
        }
    };

    // Entity CRUD Handlers (Tickets & Sessions)
    // Entity CRUD Handlers (Tickets & Sessions)
    const handleEntitySave = async (entity: string, data: any) => {
        try {
            if (entity === 'ticket') {
                let result;
                if (data.id) {
                    result = await tenantAdminService.updateTicketType(data.id, data);
                } else {
                    result = await tenantAdminService.createTicketType({ ...data, event_id: eventId });
                }

                // Update local tickets list manually to avoid wiping theme changes with loadData()
                setLocalEvent((prev: any) => {
                    const newTickets = prev.ticketTypes ? [...prev.ticketTypes] : [];
                    const idx = newTickets.findIndex((t: any) => t.id === result.id);
                    if (idx > -1) newTickets[idx] = result;
                    else newTickets.push(result);

                    // Also update ticket features in themeContent
                    const newThemeContent = { ...prev.themeContent };
                    if (!newThemeContent.ticketFeatures) newThemeContent.ticketFeatures = {};
                    // If features were edited in the modal (passed in data.features as comma-separated string)
                    if (data.features) {
                        newThemeContent.ticketFeatures[result.id] = data.features.split(',').map((f: string) => f.trim()).filter((f: string) => f);
                    }

                    return { ...prev, ticketTypes: newTickets, themeContent: newThemeContent };
                });
            }
            // await loadData(); // DISABLED to preserve unsaved theme changes
            setModalConfig({ open: false });
        } catch (err) {
            console.error(err);
            alert('Operation failed');
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500 font-mono text-sm">Loading editor...</div>;

    const navItems = [
        { id: 'branding', label: 'Branding', icon: Palette, notToggleable: true },
        { id: 'hero', label: 'Hero', icon: Layout, notToggleable: true },
        { id: 'about', label: 'About', icon: Type },
        { id: 'features', label: 'Features', icon: StarIcon },
        { id: 'tickets', label: 'Tickets', icon: Ticket },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'speakers', label: 'Speakers', icon: Users },
        { id: 'venue', label: 'Venue', icon: MapPin },
        { id: 'gallery', label: 'Gallery', icon: ImageIcon },
        { id: 'faq', label: 'FAQ', icon: HelpCircle },
        { id: 'footer', label: 'Footer', icon: Link, notToggleable: true }, // Footer is usually always there
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 relative">
            {/* Left Sidebar - Compact */}
            <div className="w-[320px] flex flex-col bg-white border-r border-slate-200 z-40 shadow-xl flex-shrink-0">
                {/* Header */}
                <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <button onClick={() => router.back()} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-800 text-sm">Theme Editor</h1>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{localEvent?.name}</p>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Icon sidebar */}
                    <div className="w-12 border-r border-slate-100 flex flex-col items-center py-2 gap-1 bg-slate-50 overflow-y-auto no-scrollbar">
                        {navItems.map(item => (
                            <div key={item.id} className="relative group">
                                <button
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative ${activeSection === item.id
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                        : 'text-slate-400 hover:bg-white hover:text-slate-700'
                                        } ${!isSectionVisible(item.id) && !item.notToggleable ? 'opacity-40 grayscale' : ''}`}
                                    title={item.label}
                                >
                                    <item.icon size={16} />
                                    {!item.notToggleable && !isSectionVisible(item.id) && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></div>
                                    )}
                                </button>
                                {/* Mini Toggle on Hover for quick access */}
                                {!item.notToggleable && (
                                    <div className="absolute left-full top-0 ml-2 hidden group-hover:flex items-center bg-white p-1 rounded shadow-lg border border-slate-100 z-50">
                                        <SectionToggle isVisible={isSectionVisible(item.id)} onToggle={(e: any) => { e.stopPropagation(); toggleSectionVisibility(item.id); }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Section Form */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white w-full">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-4">
                            <h2 className="text-lg font-black text-slate-900">
                                {navItems.find(i => i.id === activeSection)?.label}
                            </h2>
                            {/* Section Toggle */}
                            {!navItems.find(i => i.id === activeSection)?.notToggleable && (
                                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
                                    <span className="text-[10px] uppercase font-bold text-slate-500">
                                        {isSectionVisible(activeSection) ? 'Visible' : 'Hidden'}
                                    </span>
                                    <SectionToggle isVisible={isSectionVisible(activeSection)} onToggle={() => toggleSectionVisibility(activeSection)} />
                                </div>
                            )}
                        </div>

                        {/* BRANDING */}
                        {activeSection === 'branding' && (
                            <div className="space-y-4">
                                <ColorPicker
                                    label="Primary Color"
                                    value={localEvent.themeCustomization?.primaryColor}
                                    onChange={(v: string) => updateNestedState(['themeCustomization', 'primaryColor'], v)}
                                />
                                <ColorPicker
                                    label="Secondary Color"
                                    value={localEvent.themeCustomization?.secondaryColor}
                                    onChange={(v: string) => updateNestedState(['themeCustomization', 'secondaryColor'], v)}
                                />
                                <ImageUpload
                                    label="Logo URL"
                                    value={localEvent.themeCustomization?.logo}
                                    onChange={(v: string) => updateNestedState(['themeCustomization', 'logo'], v)}
                                />
                            </div>
                        )}

                        {/* HERO */}
                        {activeSection === 'hero' && (
                            <div className="space-y-4">
                                <TextInput
                                    label="Headline"
                                    value={localEvent.themeContent?.hero?.title || localEvent.name}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'hero', 'title'], v)}
                                />
                                <TextInput
                                    label="Subtitle"
                                    value={localEvent.themeContent?.hero?.subtitle}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'hero', 'subtitle'], v)}
                                    multiline
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextInput
                                        label="CTA Text"
                                        value={localEvent.themeContent?.hero?.ctaText}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'hero', 'ctaText'], v)}
                                    />
                                    <TextInput
                                        label="CTA Link"
                                        value={localEvent.themeContent?.hero?.ctaLink}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'hero', 'ctaLink'], v)}
                                        placeholder="/#tickets"
                                    />
                                </div>
                                <ImageUpload
                                    label="Background Image"
                                    value={localEvent.themeContent?.hero?.backgroundImage}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'hero', 'backgroundImage'], v)}
                                />
                            </div>
                        )}

                        {/* ABOUT */}
                        {activeSection === 'about' && (
                            <div className="space-y-4">
                                <TextInput
                                    label="Section Heading"
                                    value={localEvent.themeContent?.about?.heading}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'about', 'heading'], v)}
                                />
                                <TextInput
                                    label="Section Subtitle"
                                    value={localEvent.themeContent?.about?.subHeading}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'about', 'subHeading'], v)}
                                    placeholder="Our Story"
                                />
                                <TextInput
                                    label="Content"
                                    value={localEvent.themeContent?.about?.content}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'about', 'content'], v)}
                                    multiline
                                />
                                <ImageUpload
                                    label="Section Image"
                                    value={localEvent.themeContent?.about?.image}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'about', 'image'], v)}
                                />
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <ListEditor
                                        label="Key Stats"
                                        items={localEvent.themeContent?.about?.stats || []}
                                        onAdd={() => setModalConfig({ open: true, type: 'stat', data: { value: '', label: '' }, index: -1 })}
                                        onEdit={(item: any, idx: number) => setModalConfig({ open: true, type: 'stat', data: item, index: idx })}
                                        onDelete={(idx: number) => {
                                            const newStats = [...(localEvent.themeContent?.about?.stats || [])];
                                            newStats.splice(idx, 1);
                                            updateNestedState(['themeContent', 'about', 'stats'], newStats);
                                        }}
                                        renderItem={(item: any) => (
                                            <div>
                                                <div className="font-bold text-xs">{item.value}</div>
                                                <div className="text-[10px] text-slate-500">{item.label}</div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* FEATURES */}
                        {activeSection === 'features' && (
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.features?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'features', 'heading'], v)}
                                        placeholder="Experience Excellence"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.features?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'features', 'subHeading'], v)}
                                        placeholder="Highlights"
                                    />
                                </div>
                                <ListEditor
                                    label="Key Features"
                                    items={localEvent.themeContent?.features?.features || (Array.isArray(localEvent.themeContent?.features) ? localEvent.themeContent?.features : [])}
                                    onAdd={() => setModalConfig({ open: true, type: 'feature', data: { icon: 'Star', title: '', description: '' }, index: -1 })}
                                    onEdit={(item: any, idx: number) => setModalConfig({ open: true, type: 'feature', data: item, index: idx })}
                                    onDelete={(idx: number) => handleListDelete('features', idx)} // NOTE: Need to handle nested deletion if structure changed
                                    renderItem={(item: any) => (
                                        <div>
                                            <div className="font-bold text-xs text-slate-800">{item.title}</div>
                                            <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* TICKETS (Entities) */}
                        {activeSection === 'tickets' && (
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.tickets?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'tickets', 'heading'], v)}
                                        placeholder="Get Your Tickets"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.tickets?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'tickets', 'subHeading'], v)}
                                        placeholder="Join Us"
                                    />
                                    <TextInput
                                        label="Description"
                                        value={localEvent.themeContent?.tickets?.description}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'tickets', 'description'], v)}
                                        multiline
                                    />
                                </div>
                                <ListEditor
                                    label="Ticket Types"
                                    items={localEvent.ticketTypes || []}
                                    onAdd={() => setModalConfig({ open: true, type: 'ticket', data: { features: '' }, index: -1 })}
                                    onEdit={(item: any) => {
                                        // Load existing features from themeContent if available
                                        const features = localEvent.themeContent?.ticketFeatures?.[item.id]?.join(', ') || '';
                                        setModalConfig({ open: true, type: 'ticket', data: { ...item, features }, index: -1 })
                                    }}
                                    onDelete={async (idx: number) => {
                                        if (confirm('Delete ticket?')) {
                                            await tenantAdminService.deleteTicketType(localEvent.ticketTypes[idx].id);
                                            loadData();
                                        }
                                    }}
                                    renderItem={(item: any) => (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-xs text-slate-800">{item.name}</div>
                                                <div className="text-[10px] text-slate-500">৳{item.price_taka}</div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* SCHEDULE */}
                        {activeSection === 'schedule' && (
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.schedule?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'schedule', 'heading'], v)}
                                        placeholder="Event Schedule"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.schedule?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'schedule', 'subHeading'], v)}
                                        placeholder="Timeline"
                                    />
                                    <TextInput
                                        label="Description"
                                        value={localEvent.themeContent?.schedule?.description}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'schedule', 'description'], v)}
                                        multiline
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-100 mb-2">
                                        Managing sessions updates the event timeline.
                                    </div>
                                    <ListEditor
                                        label="Sessions"
                                        items={localEvent.sessions || []}
                                        renderItem={(item: any) => (
                                            <div className="flex gap-2">
                                                <div className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600 h-fit">
                                                    {new Date(item.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-800">{item.title}</div>
                                                    <div className="text-[10px] text-slate-500 line-clamp-1">{item.description}</div>
                                                </div>
                                            </div>
                                        )}
                                        emptyText="No sessions found."
                                        onAdd={() => alert('Please use the Session Manager in the main event page for now.')}
                                        onEdit={() => alert('Please use the main event page.')}
                                        onDelete={() => alert('Please use the main event page.')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* SPEAKERS */}
                        {activeSection === 'speakers' && (
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.speakers?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'speakers', 'heading'], v)}
                                        placeholder="The Lineup"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.speakers?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'speakers', 'subHeading'], v)}
                                        placeholder="Experts"
                                    />
                                </div>
                                <ListEditor
                                    label="Speakers"
                                    items={localEvent.themeContent?.speakers?.speakers || (Array.isArray(localEvent.themeContent?.speakers) ? localEvent.themeContent?.speakers : [])}
                                    onAdd={() => setModalConfig({ open: true, type: 'speaker', data: { name: '', role: '', bio: '', social: {} }, index: -1 })}
                                    onEdit={(item: any, idx: number) => setModalConfig({ open: true, type: 'speaker', data: item, index: idx })}
                                    onDelete={(idx: number) => handleListDelete('speakers', idx)}
                                    renderItem={(item: any) => (
                                        <div className="flex gap-3 items-center">
                                            {item.image && <img src={item.image} className="w-8 h-8 rounded-full object-cover" />}
                                            <div>
                                                <div className="font-bold text-xs text-slate-800">{item.name}</div>
                                                <div className="text-[10px] text-slate-500">{item.role}</div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* VENUE */}
                        {activeSection === 'venue' && (
                            <div className="space-y-4">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.venue?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'heading'], v)}
                                        placeholder="Join Us at..."
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.venue?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'subHeading'], v)}
                                        placeholder="Location"
                                    />
                                </div>
                                <TextInput
                                    label="Venue Name"
                                    value={localEvent.venue /* direct field */}
                                    onChange={(v: string) => setLocalEvent({ ...localEvent, venue: v })}
                                />
                                <TextInput
                                    label="Address"
                                    value={localEvent.themeContent?.venue?.address || localEvent.city}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'address'], v)}
                                />
                                <TextInput
                                    onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'mapUrl'], v)}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextInput
                                        label="Directions"
                                        value={localEvent.themeContent?.venue?.directions}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'directions'], v)}
                                        placeholder="Public transit info..."
                                    />
                                    <TextInput
                                        label="Parking"
                                        value={localEvent.themeContent?.venue?.parking}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'venue', 'parking'], v)}
                                        placeholder="On-site parking..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* GALLERY */}
                        {activeSection === 'gallery' && (
                            <div className="space-y-4">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.gallery?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'gallery', 'heading'], v)}
                                        placeholder="Event Gallery"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.gallery?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'gallery', 'subHeading'], v)}
                                        placeholder="Visuals"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(localEvent.gallery || []).map((url: string, idx: number) => (
                                        <div key={idx} className="aspect-square relative rounded-lg overflow-hidden group">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => {
                                                    const newGallery = [...localEvent.gallery];
                                                    newGallery.splice(idx, 1);
                                                    setLocalEvent({ ...localEvent, gallery: newGallery });
                                                }}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
                                        onClick={() => {
                                            const url = prompt('Enter Image URL');
                                            if (url) setLocalEvent({ ...localEvent, gallery: [...(localEvent.gallery || []), url] });
                                        }}
                                    >
                                        <Plus size={24} />
                                        <span className="text-[10px] mt-1">Add URL</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* FAQ */}
                        {activeSection === 'faq' && (
                            <div className="space-y-6">
                                <div className="space-y-4 border-b border-slate-50 pb-6">
                                    <TextInput
                                        label="Section Heading"
                                        value={localEvent.themeContent?.faq?.heading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'faq', 'heading'], v)}
                                        placeholder="Frequently Asked Questions"
                                    />
                                    <TextInput
                                        label="Section Subtitle"
                                        value={localEvent.themeContent?.faq?.subHeading}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'faq', 'subHeading'], v)}
                                        placeholder="Support"
                                    />
                                    <TextInput
                                        label="Description"
                                        value={localEvent.themeContent?.faq?.description}
                                        onChange={(v: string) => updateNestedState(['themeContent', 'faq', 'description'], v)}
                                        multiline
                                    />
                                </div>
                                <ListEditor
                                    label="Questions"
                                    items={localEvent.themeContent?.faq?.faq || (Array.isArray(localEvent.themeContent?.faq) ? localEvent.themeContent?.faq : [])}
                                    onAdd={() => setModalConfig({ open: true, type: 'faq', data: { question: '', answer: '' }, index: -1 })}
                                    onEdit={(item: any, idx: number) => setModalConfig({ open: true, type: 'faq', data: item, index: idx })}
                                    onDelete={(idx: number) => handleListDelete('faq', idx)}
                                    renderItem={(item: any) => (
                                        <div>
                                            <div className="font-bold text-xs text-slate-800 line-clamp-1">Q: {item.question}</div>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* FOOTER */}
                        {activeSection === 'footer' && (
                            <div className="space-y-4">
                                <TextInput
                                    label="Copyright Text"
                                    value={localEvent.themeContent?.footer?.copyrightText}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'footer', 'copyrightText'], v)}
                                    placeholder="© 2024 Event Name. All rights reserved."
                                />
                                <TextInput
                                    label="Footer Description"
                                    value={localEvent.themeContent?.footer?.description}
                                    onChange={(v: string) => updateNestedState(['themeContent', 'footer', 'description'], v)}
                                    multiline
                                />
                                <h3 className="text-xs font-bold text-slate-900 mt-4">Social Links</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Facebook size={16} className="text-blue-600" />
                                        <input
                                            type="text"
                                            placeholder="Facebook URL"
                                            value={localEvent.themeContent?.footer?.socials?.facebook || ''}
                                            onChange={(e) => updateNestedState(['themeContent', 'footer', 'socials', 'facebook'], e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Twitter size={16} className="text-sky-500" />
                                        <input
                                            type="text"
                                            placeholder="Twitter URL"
                                            value={localEvent.themeContent?.footer?.socials?.twitter || ''}
                                            onChange={(e) => updateNestedState(['themeContent', 'footer', 'socials', 'twitter'], e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Linkedin size={16} className="text-blue-700" />
                                        <input
                                            type="text"
                                            placeholder="LinkedIn URL"
                                            value={localEvent.themeContent?.footer?.socials?.linkedin || ''}
                                            onChange={(e) => updateNestedState(['themeContent', 'footer', 'socials', 'linkedin'], e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Instagram size={16} className="text-pink-600" />
                                        <input
                                            type="text"
                                            placeholder="Instagram URL"
                                            value={localEvent.themeContent?.footer?.socials?.instagram || ''}
                                            onChange={(e) => updateNestedState(['themeContent', 'footer', 'socials', 'instagram'], e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Save */}
                <div className="p-3 border-t border-slate-100 bg-white">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-10 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-xs rounded-lg font-bold transition-all disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="flex-1 bg-slate-200/50 p-4 md:p-8 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full max-w-[1400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60 ring-4 ring-slate-200/50">
                    <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-400 font-mono shadow-sm">
                                <Globe size={10} />
                                localhost:3000/{localEvent?.slug}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white scroll-smooth relative">
                        {/* Renderer */}
                        {localEvent?.theme && (
                            <DynamicThemeRenderer
                                tenant={localEvent.tenant}
                                event={localEvent}
                                theme={localEvent.theme}
                            />
                        )}

                        {(!localEvent?.theme) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                <Layout size={48} className="opacity-50" />
                                <p>Select a theme to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Universal Modal */}
            {modalConfig.open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 text-sm capitalize">
                                {modalConfig.index > -1 ? 'Edit' : 'Add'} {modalConfig.type}
                            </h3>
                            <button onClick={() => setModalConfig({ open: false })} className="text-slate-400 hover:text-slate-900">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Stat Form */}
                            {modalConfig.type === 'stat' && (
                                <>
                                    <TextInput label="Value (e.g. 10k+)" value={modalConfig.data.value} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, value: v } })} />
                                    <TextInput label="Label" value={modalConfig.data.label} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, label: v } })} />
                                </>
                            )}

                            {/* Feature Form */}
                            {modalConfig.type === 'feature' && (
                                <>
                                    <TextInput label="Title" value={modalConfig.data.title} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, title: v } })} />
                                    <TextInput label="Description" value={modalConfig.data.description} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, description: v } })} multiline />
                                    <TextInput label="Icon (Lucide Name)" value={modalConfig.data.icon} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, icon: v } })} placeholder="Star, Zap, etc." />
                                </>
                            )}

                            {/* Speaker Form */}
                            {modalConfig.type === 'speaker' && (
                                <>
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            {modalConfig.data.image && <img src={modalConfig.data.image} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <TextInput label="Name" value={modalConfig.data.name} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, name: v } })} />
                                            <TextInput label="Role" value={modalConfig.data.role} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, role: v } })} />
                                        </div>
                                    </div>
                                    <TextInput label="Image URL" value={modalConfig.data.image} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, image: v } })} />
                                    <TextInput label="Bio" value={modalConfig.data.bio} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, bio: v } })} multiline />
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextInput label="Twitter URL" value={modalConfig.data.social?.twitter} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, social: { ...modalConfig.data.social, twitter: v } } })} />
                                        <TextInput label="LinkedIn URL" value={modalConfig.data.social?.linkedin} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, social: { ...modalConfig.data.social, linkedin: v } } })} />
                                    </div>
                                </>
                            )}

                            {/* FAQ Form */}
                            {modalConfig.type === 'faq' && (
                                <>
                                    <TextInput label="Question" value={modalConfig.data.question} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, question: v } })} />
                                    <TextInput label="Answer" value={modalConfig.data.answer} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, answer: v } })} multiline />
                                </>
                            )}

                            {/* Ticket Form */}
                            {modalConfig.type === 'ticket' && (
                                <>
                                    <TextInput label="Name" value={modalConfig.data.name} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, name: v } })} />
                                    <TextInput label="Description" value={modalConfig.data.description} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, description: v } })} multiline />
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextInput label="Price (BDT)" value={modalConfig.data.price_taka} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, price_taka: v } })} />
                                        <TextInput label="Total Qty" value={modalConfig.data.quantity_total} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, quantity_total: v } })} />
                                    </div>
                                    <TextInput label="Features (comma separated)" value={modalConfig.data.features || ''} onChange={(v: string) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, features: v } })} />
                                </>
                            )}

                            <button
                                onClick={() => {
                                    if (modalConfig.type === 'ticket') {
                                        handleEntitySave('ticket', modalConfig.data);
                                    } else if (modalConfig.type === 'stat') {
                                        // Special handler for stats (nested in about)
                                        const stats = [...(localEvent.themeContent?.about?.stats || [])];
                                        if (modalConfig.index > -1) stats[modalConfig.index] = modalConfig.data;
                                        else stats.push(modalConfig.data);
                                        updateNestedState(['themeContent', 'about', 'stats'], stats);
                                        setModalConfig({ open: false });
                                    } else {
                                        const mapping: any = { feature: 'features', speaker: 'speakers', faq: 'faq' };
                                        handleListUpdate(mapping[modalConfig.type] || modalConfig.type + 's', modalConfig.data, modalConfig.index);
                                    }
                                }}
                                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold text-xs mt-2 hover:bg-black transition-colors"
                            >
                                {modalConfig.index > -1 ? 'Update' : 'Add'} Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StarIcon({ size, className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}
