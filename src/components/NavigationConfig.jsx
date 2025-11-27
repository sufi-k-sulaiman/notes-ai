
import { Home, Globe, Sparkles, BarChart3, Gamepad2, Settings, Radio, Brain, FileText, GraduationCap, ListTodo, StickyNote, MessageCircle, Lightbulb } from 'lucide-react';
import { createPageUrl } from '@/utils';

export const LOGO_URL = 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop';

export const menuItems = [
    { label: 'Home', icon: Home, href: createPageUrl('Home') },
    { label: 'Geospatial', icon: Globe, href: createPageUrl('Geospatial') },
    { label: 'Intelligence', icon: Lightbulb, href: createPageUrl('Intelligence') },
    { label: 'Markets', icon: BarChart3, href: createPageUrl('Markets') },
    { label: 'SearchPods', icon: Radio, href: createPageUrl('SearchPods') },
    { label: 'Learning', icon: GraduationCap, href: createPageUrl('Learning') },
    { label: 'Games', icon: Gamepad2, href: createPageUrl('Games') },
    { label: 'Notes', icon: StickyNote, href: createPageUrl('Notes') },
    { label: 'Comms', icon: MessageCircle, href: createPageUrl('Comms') },
    { label: 'Settings', icon: Settings, href: createPageUrl('Settings') },
];

export const NAVIGATION_ITEMS = menuItems.map(item => ({
    name: item.label,
    page: item.label,
}));

export const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Governance', href: '#' },
];
