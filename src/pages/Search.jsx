import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, FileText, Lightbulb, ExternalLink, Globe, Sparkles, BarChart3, Gamepad2, Settings, Radio, Brain, GraduationCap, ListTodo, StickyNote, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const menuItems = [
    { label: 'Home', icon: Globe, href: createPageUrl('Home') },
    { label: 'Qwirey', icon: Sparkles, href: createPageUrl('Qwirey') },
    { label: 'MindMap', icon: Brain, href: createPageUrl('MindMap') },
    { label: 'SearchPods', icon: Radio, href: createPageUrl('SearchPods') },
    { label: 'Markets', icon: BarChart3, href: createPageUrl('Markets') },
    { label: 'Learning', icon: GraduationCap, href: createPageUrl('Learning') },
    { label: 'Geospatial', icon: Globe, href: createPageUrl('Geospatial') },
    { label: 'Intelligence', icon: LightbulbIcon, href: createPageUrl('Intelligence') },
    { label: 'Resume Builder', icon: FileText, href: createPageUrl('ResumeBuilder') },
    { label: 'Tasks', icon: ListTodo, href: createPageUrl('Tasks') },
    { label: 'Notes', icon: StickyNote, href: createPageUrl('Notes') },
    { label: 'Games', icon: Gamepad2, href: createPageUrl('Games') },
    { label: 'Terms of Use', icon: ScrollText, href: createPageUrl('TermsOfUse') },
    { label: 'Settings', icon: Settings, href: createPageUrl('Settings') },
];

export default function SearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchedQuery, setSearchedQuery] = useState('');

    // Filter matching pages from navigation
    const matchingPages = menuItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, []);

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setSearchedQuery(searchQuery);
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Search for information about: "${searchQuery}". Provide helpful results with titles, descriptions, and relevant links or actions. Format as structured data.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        results: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    type: { type: "string" },
                                    url: { type: "string" }
                                }
                            }
                        },
                        suggestions: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });
            
            setResults(response);
        } catch (error) {
            console.error('Search failed:', error);
            setResults({ summary: 'Search completed', results: [], suggestions: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            window.history.pushState({}, '', createPageUrl('Search') + `?q=${encodeURIComponent(query.trim())}`);
            performSearch(query);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Search Header */}
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search anything..."
                            className="w-full h-14 pl-6 pr-16 rounded-full border border-gray-200 bg-white shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-lg text-gray-700 placeholder:text-gray-400"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </button>
                    </form>
                </div>

                {/* Quick Links to Pages */}
                {matchingPages.length > 0 && query && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Pages</h3>
                        <div className="flex flex-wrap gap-2">
                            {matchingPages.map((page) => (
                                <Link
                                    key={page.label}
                                    to={page.href}
                                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                                >
                                    <page.icon className="w-4 h-4 text-purple-600" />
                                    <span className="text-gray-700">{page.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500">Searching for "{searchedQuery}"...</p>
                    </div>
                )}

                {/* Results */}
                {!loading && results && (
                    <div className="space-y-6">
                        {/* Summary */}
                        {results.summary && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <Lightbulb className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">AI Summary</h3>
                                        <p className="text-gray-600">{results.summary}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        {results.results?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">
                                    Found {results.results.length} results for "{searchedQuery}"
                                </h3>
                                <div className="space-y-3">
                                    {results.results.map((result, i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{result.title}</h4>
                                                    <p className="text-gray-600 text-sm mb-2">{result.description}</p>
                                                    {result.url && (
                                                        <a
                                                            href={result.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                                                        >
                                                            Learn more <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {result.type && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        {result.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {results.suggestions?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Related searches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {results.suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setQuery(suggestion);
                                                performSearch(suggestion);
                                            }}
                                            className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all text-sm"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !results && !query && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Anything</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Search across pages, get AI-powered answers, and discover information quickly.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}