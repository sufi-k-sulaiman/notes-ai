import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Radio, Brain, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SUGGESTIONS = [
    { text: 'Artificial Intelligence', category: 'Technology' },
    { text: 'Machine Learning', category: 'Technology' },
    { text: 'Climate Change', category: 'Science' },
    { text: 'Blockchain', category: 'Finance' },
    { text: 'Quantum Computing', category: 'Technology' },
    { text: 'Renewable Energy', category: 'Environment' },
    { text: 'Digital Marketing', category: 'Business' },
    { text: 'Cybersecurity', category: 'Technology' },
];

const RECENT_SEARCHES = [
    'AI trends',
    'Morning motivation',
    'Health tips',
];

const QUICK_ACTIONS = [
    { label: 'AI Hub', icon: Sparkles, page: 'AIHub', color: '#6B4EE6' },
    { label: 'SearchPods', icon: Radio, page: 'SearchPods', color: '#3B82F6' },
    { label: 'MindMap', icon: Brain, page: 'MindMap', color: '#EC4899' },
];

export default function GlobalSearchBar({ 
    onSearch, 
    placeholder = "Search anything...",
    className = "",
    showQuickActions = true 
}) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = SUGGESTIONS.filter(s => 
                s.text.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            setFilteredSuggestions(filtered);
        } else {
            setFilteredSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (query.trim()) {
            if (onSearch) {
                onSearch(query.trim());
            } else {
                // Navigate to search results page if no handler provided
                window.location.href = `${createPageUrl('SearchResults')}?q=${encodeURIComponent(query.trim())}`;
            }
            setIsFocused(false);
        }
    };

    const handleSuggestionClick = (text) => {
        setQuery(text);
        if (onSearch) {
            onSearch(text);
        }
        setIsFocused(false);
    };

    const showDropdown = isFocused && (query.length > 0 || showQuickActions);

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    className="w-full pl-14 pr-24 py-4 h-14 bg-white border-2 border-purple-200 text-gray-900 placeholder:text-gray-400 rounded-full focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>

            {/* Dropdown */}
            {showDropdown && (
                <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                    {/* Suggestions */}
                    {filteredSuggestions.length > 0 && (
                        <div className="p-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">Suggestions</p>
                            {filteredSuggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(suggestion.text)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-50 text-left transition-colors"
                                >
                                    <TrendingUp className="w-4 h-4 text-purple-500" />
                                    <span className="text-gray-800 font-medium">{suggestion.text}</span>
                                    <span className="text-xs text-gray-400 ml-auto">{suggestion.category}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {query.length === 0 && (
                        <div className="p-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">Recent</p>
                            {RECENT_SEARCHES.map((search, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(search)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{search}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    {showQuickActions && query.length === 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">Quick Actions</p>
                            <div className="flex gap-2 px-3">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <Link
                                        key={i}
                                        to={createPageUrl(action.page)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                                    >
                                        <action.icon className="w-4 h-4" style={{ color: action.color }} />
                                        <span className="text-sm text-gray-700">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}