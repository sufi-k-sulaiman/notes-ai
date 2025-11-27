import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlobalSearchBar from './GlobalSearchBar';
import { LOGO_URL, menuItems, footerLinks } from './NavigationConfig.js';

export default function PageLayout({ children, activePage, onSearch, searchPlaceholder = "Search anything...", showSearch = true }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [blackWhiteMode, setBlackWhiteMode] = useState(() => localStorage.getItem('blackWhiteMode') === 'true');
    const [hideIcons, setHideIcons] = useState(() => localStorage.getItem('hideIcons') === 'true');
    const [cognitiveMode, setCognitiveMode] = useState(() => localStorage.getItem('cognitiveMode') || 'none');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // Listen for storage changes to update settings in real-time
    React.useEffect(() => {
        const handleStorageChange = () => {
            setBlackWhiteMode(localStorage.getItem('blackWhiteMode') === 'true');
            setHideIcons(localStorage.getItem('hideIcons') === 'true');
            setCognitiveMode(localStorage.getItem('cognitiveMode') || 'none');
            setTheme(localStorage.getItem('theme') || 'light');
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically for same-tab changes
        const interval = setInterval(handleStorageChange, 500);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Auto-open sidebar on desktop
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get theme-based classes
    const getThemeClasses = () => {
        if (theme === 'dark') return 'bg-gray-900 text-white';
        if (theme === 'hybrid') return 'bg-gray-100 text-gray-900';
        return 'bg-gray-50 text-gray-900';
    };

    const getHeaderClasses = () => {
        if (theme === 'dark') return 'bg-gray-800 border-gray-700';
        if (theme === 'hybrid') return 'bg-white border-gray-300';
        return 'bg-white border-gray-200';
    };

    const getSidebarClasses = () => {
        if (theme === 'dark') return 'bg-gray-800 border-gray-700';
        if (theme === 'hybrid') return 'bg-white border-gray-300';
        return 'bg-white border-gray-200';
    };

    const getFooterClasses = () => {
        if (theme === 'dark') return 'bg-gray-800 border-gray-700 text-gray-400';
        if (theme === 'hybrid') return 'bg-white border-gray-300';
        return 'bg-white border-gray-200';
    };

    // Reader mode simplifies layout
    const isReaderMode = cognitiveMode === 'reader';

    return (
        <div className={`min-h-screen flex flex-col ${getThemeClasses()} ${blackWhiteMode ? 'grayscale' : ''} ${isReaderMode ? 'reader-mode' : ''}`}>
            {/* Header - fixed height */}
            <header className={`sticky top-0 z-50 border-b shadow-sm h-[72px] ${getHeaderClasses()}`}>
                <div className="flex items-center justify-between px-4 h-full">
                    <div className="flex items-center gap-2">
                        <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {!hideIcons && <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />}
                            <div className="hidden md:block">
                                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>1cPublishing</span>
                                <p className="text-xs font-medium text-purple-600">
                                    {activePage === 'AI Hub' ? 'AI Assistant' :
                                     activePage === 'SearchPods' ? 'Podcast Generator' :
                                     activePage === 'MindMap' ? 'Knowledge Explorer' :
                                     activePage === 'Intelligence' ? 'Predictive Analytics' :
                                     activePage === 'Resume Builder' ? 'Career Tools' :
                                     activePage === 'Markets' ? 'Stock Analysis' :
                                     activePage === 'Learning' ? 'Learning Archipelago' :
                                     activePage === 'Tasks' ? 'Task Management' :
                                     activePage === 'Notes' ? 'Rich Text Notes' :
                                     activePage === 'Comms' ? 'Communications Hub' :
                                     activePage === 'Games' ? 'Game Arcade' :
                                     activePage === 'Settings' ? 'Preferences' :
                                     'Ai Powered'}
                                </p>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-gray-100 hidden md:flex ml-2"
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
                        </Button>
                    </div>

                    {showSearch ? (
                        <GlobalSearchBar 
                            onSearch={onSearch || ((q) => console.log('Search:', q))}
                            placeholder={searchPlaceholder}
                            className="flex-1 max-w-xl mx-4 md:mx-8"
                        />
                    ) : (
                        <div className="flex-1 max-w-xl mx-4 md:mx-8 h-14" />
                    )}

                    {/* Mobile menu button on header right side */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hover:bg-gray-100 md:hidden"
                    >
                        <Menu className="w-5 h-5 text-purple-600" />
                    </Button>
                    <div className="w-10 hidden md:block" />
                </div>
            </header>

            <div className="flex flex-1">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden border-r flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto ${getSidebarClasses()}`}>
                    <nav className="px-4 py-6 space-y-1">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={createPageUrl(item.page)}
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                                    item.label === activePage
                                        ? 'bg-purple-100 text-purple-700'
                                        : theme === 'dark' 
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-purple-400'
                                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                            >
                                {!hideIcons && <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: '#6B4EE6' }} />}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className={`py-6 border-t ${getFooterClasses()}`}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {!hideIcons && <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />}
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <Link key={i} to={createPageUrl(link.page)} className={`hover:text-purple-600 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{link.label}</Link>
                            ))}
                        </nav>
                    </div>
                    <div className={`mt-4 pt-4 border-t text-center text-sm ${theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
                        © 2025 1cPublishing.com
                    </div>
                </div>
            </footer>
        </div>
    );
}