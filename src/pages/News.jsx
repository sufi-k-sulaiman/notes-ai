import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Newspaper, Search, Loader2, ExternalLink, RefreshCw, TrendingUp, Clock, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'business', label: 'Business', icon: '📈' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'world', label: 'World', icon: '🌍' },
];

export default function News() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('technology');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchNews = async (keyword) => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Search for the latest news about "${keyword}" from multiple sources. 
                
Use information from news sources like:
- Google News: https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=nws
- Bing News: https://www.bing.com/news/search?q=${encodeURIComponent(keyword)}
- DuckDuckGo News: https://duckduckgo.com/?q=${encodeURIComponent(keyword)}&ia=news&iar=news

Provide the 12 most recent and relevant news articles with their titles, sources, summaries, and approximate publish time. Make sure the news is current and from today or the past few days.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        articles: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    source: { type: "string" },
                                    summary: { type: "string" },
                                    time: { type: "string" },
                                    url: { type: "string" },
                                    category: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setNews(response?.articles || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(activeCategory);
    }, [activeCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            fetchNews(searchQuery.trim());
        }
    };

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <Newspaper className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">News</h1>
                                <p className="text-white/80">AI-Powered News Aggregator</p>
                            </div>
                        </div>
                        {lastUpdated && (
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                <Clock className="w-4 h-4" />
                                Updated {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for any news topic..."
                            className="w-full h-14 pl-6 pr-16 rounded-full border-gray-200 bg-white shadow-sm focus:border-red-300 focus:ring-2 focus:ring-red-100 text-lg"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </form>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                activeCategory === cat.id
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNews(searchQuery || activeCategory)}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                        <p className="text-gray-600">Fetching latest news...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No News Found</h2>
                        <p className="text-gray-500">Try searching for a different topic</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {news.map((article, index) => (
                            <article
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                            {article.source || 'News'}
                                        </span>
                                        {article.time && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.time}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {article.summary}
                                    </p>
                                    {article.url && (
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            Read more <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Trending Section */}
                {!loading && news.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-red-600" />
                            <h2 className="font-semibold text-gray-900">Trending Topics</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['AI', 'Climate', 'Economy', 'Elections', 'Space', 'Crypto', 'Tech Stocks', 'Healthcare'].map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        fetchNews(topic);
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-700 text-sm rounded-full transition-colors"
                                >
                                    #{topic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}