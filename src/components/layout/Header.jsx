import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, Menu, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { LOGO_URL, menuItems } from '../NavigationConfig';

const PAGES_WITHOUT_SEARCH = ['Qwirey', 'MindMap', 'Learning'];
const PAGES_WITH_FILTER_SEARCH = ['Markets'];

export default function Header({ title, sidebarOpen, setSidebarOpen, children, currentPage }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [theme, setTheme] = useState('light');
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const checkTheme = () => setTheme(localStorage.getItem('theme') || 'light');
        checkTheme();
        const interval = setInterval(checkTheme, 100);
        return () => clearInterval(interval);
    }, []);

    const isDark = theme === 'dark';

    const hideSearch = PAGES_WITHOUT_SEARCH.includes(currentPage);
    const isFilterSearch = PAGES_WITH_FILTER_SEARCH.includes(currentPage);

    // Dispatch search query for filter pages
    useEffect(() => {
        if (isFilterSearch) {
            window.dispatchEvent(new CustomEvent('headerSearchChange', { detail: searchQuery }));
        }
    }, [searchQuery, isFilterSearch]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const pageSuggestions = menuItems
                .filter(item => item.label.toLowerCase().includes(query))
                .map(item => ({ type: 'page', label: item.label, href: item.href }));
            
            const topicSuggestions = [
                'AI trends', 'Technology news', 'Market analysis', 'Learning resources', 
                'Data visualization', 'Geospatial mapping', 'Task management'
            ].filter(s => s.toLowerCase().includes(query))
             .map(s => ({ type: 'topic', label: s }));

            setSuggestions([...pageSuggestions.slice(0, 3), ...topicSuggestions.slice(0, 3)]);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() && !isFilterSearch) {
            setShowSuggestions(false);
            navigate(createPageUrl('Search') + `?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setShowSuggestions(false);
        if (suggestion.type === 'page') {
            navigate(suggestion.href);
        } else {
            setSearchQuery(suggestion.label);
            navigate(createPageUrl('Search') + `?q=${encodeURIComponent(suggestion.label)}`);
        }
    };

    return (
        <header className={`sticky top-0 z-40 border-b shadow-sm h-[72px] ${isDark ? 'bg-[#1a1a2e] border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between px-4 h-full gap-4">
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80">
                        <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                        <div className="hidden sm:block">
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1cPublishing</span>
                            <p className="text-xs font-medium text-blue-500">Ai Powered</p>
                        </div>
                    </Link>
                    {setSidebarOpen && (
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}>
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-blue-500" /> : <Menu className="w-5 h-5 text-blue-500" />}
                        </Button>
                    )}
                </div>

                {/* Centered Search Bar - Hidden on specific pages */}
                {!hideSearch && (
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto" ref={searchRef}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery && setShowSuggestions(true)}
                                placeholder="Search anything..."
                                className={`w-full h-12 pl-5 pr-14 rounded-full border outline-none transition-all ${isDark ? 'border-gray-600 bg-gray-800 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-900' : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-gray-700 placeholder:text-gray-400'}`}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                            >
                                <Search className="w-4 h-4 text-white" />
                            </button>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-lg border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSuggestionClick(s)}
                                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-blue-900/30 text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
                                        >
                                            <Search className="w-4 h-4 text-gray-400" />
                                            <span>{s.label}</span>
                                            {s.type === 'page' && (
                                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? 'text-blue-400 bg-blue-900/50' : 'text-blue-600 bg-blue-50'}`}>Page</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                )}

                <div className="flex-shrink-0">
                    {children}
                </div>
            </div>
        </header>
    );
}