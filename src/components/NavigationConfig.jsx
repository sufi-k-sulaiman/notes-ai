
import { Globe, Sparkles, BarChart3, Gamepad2, Settings, Radio, Brain, FileText, GraduationCap, ListTodo, StickyNote, Lightbulb } from 'lucide-react';
import { createPageUrl } from '@/utils';

export const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/a1a505225_1cPublishing-logo.png';

export const menuItems = [
    { label: 'Qwirey', icon: Sparkles, href: createPageUrl('Qwirey') },
    { label: 'MindMap', icon: Brain, href: createPageUrl('MindMap') },
    { label: 'SearchPods', icon: Radio, href: createPageUrl('SearchPods') },
    { label: 'Markets', icon: BarChart3, href: createPageUrl('Markets') },
    { label: 'Learning', icon: GraduationCap, href: createPageUrl('Learning') },
    { label: 'Geospatial', icon: Globe, href: createPageUrl('Geospatial') },
    { label: 'Intelligence', icon: Lightbulb, href: createPageUrl('Intelligence') },
    { label: 'Resume Builder', icon: FileText, href: createPageUrl('ResumeBuilder') },
    { label: 'Tasks', icon: ListTodo, href: createPageUrl('Tasks') },
    { label: 'Notes', icon: StickyNote, href: createPageUrl('Notes') },
    { label: 'Games', icon: Gamepad2, href: createPageUrl('Games') },
    { label: 'Settings', icon: Settings, href: createPageUrl('Settings') },
];

export const NAVIGATION_ITEMS = menuItems.map(item => ({
    name: item.label,
    page: item.label,
}));

export const footerLinks = [];
