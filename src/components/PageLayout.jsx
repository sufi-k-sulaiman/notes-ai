import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Globe, Sparkles, BarChart3, Gamepad2, Settings, Menu, X } from 'lucide-react';
import { LOGO_URL, NAVIGATION_ITEMS } from './NavigationConfig';

const NAV_ICONS = {
    Home: Home,
    Markets: BarChart3,
    Intelligence: Sparkles,
    Geospatial: Globe,
    Games: Gamepad2,
    Settings: Settings,
};

export default function PageLayout({ children, activePage }) {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to={createPageUrl('Home')} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">1c</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800 hidden sm:block">1cPublishing</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAVIGATION_ITEMS.map((item) => {
                                const Icon = NAV_ICONS[item.page] || Home;
                                const isActive = activePage === item.page;
                                return (
                                    <Link
                                        key={item.name}
                                        to={createPageUrl(item.page)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <nav className="px-4 py-2 space-y-1">
                            {NAVIGATION_ITEMS.map((item) => {
                                const Icon = NAV_ICONS[item.page] || Home;
                                const isActive = activePage === item.page;
                                return (
                                    <Link
                                        key={item.name}
                                        to={createPageUrl(item.page)}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">1c</span>
                            </div>
                            <span className="text-gray-600 text-sm">© 2024 1cPublishing. All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <Link to={createPageUrl('Settings')} className="hover:text-gray-700">Settings</Link>
                            <span>Privacy</span>
                            <span>Terms</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}