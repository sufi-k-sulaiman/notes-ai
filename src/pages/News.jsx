import React, { useState, useEffect } from 'react';

const pulseAnimation = `
@keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
}
`;
import { base44 } from '@/api/base44Client';
import { Newspaper, Search, Loader2, ExternalLink, RefreshCw, TrendingUp, Clock, Globe, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorDisplay, { LoadingState, getErrorCode } from '@/components/ErrorDisplay';

const NewsCard = ({ article, index }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [isValidUrl, setIsValidUrl] = useState(null); // null = checking, true = valid, false = invalid

    useEffect(() => {
        const validateUrl = async () => {
            if (!article.url || !article.url.startsWith('http')) {
                setIsValidUrl(false);
                return;
            }
            try {
                const response = await base44.functions.invoke('checkUrl', { url: article.url });
                setIsValidUrl(response.data?.valid === true);
            } catch (error) {
                setIsValidUrl(false);
            }
        };
        validateUrl();
    }, [article.url]);

    useEffect(() => {
        if (isValidUrl === false) return; // Don't generate image for invalid articles
        
        const generateImage = async () => {
            setImageLoading(true);
            try {
                const prompt = article.imagePrompt || `Lifestyle photography, ${article.title}, natural lighting, earth tones, minimalist composition`;
                const result = await base44.integrations.Core.GenerateImage({
                    prompt: `${prompt}, professional photography style, soft natural lighting, lifestyle aesthetic, earth and nature elements, no text or words`
                });
                if (result?.url) {
                    setImageUrl(result.url);
                }
            } catch (error) {
                console.error('Image generation error:', error);
            } finally {
                setImageLoading(false);
            }
        };
        generateImage();
    }, [article.title, article.imagePrompt, isValidUrl]);

    // Don't render if URL is invalid
    if (isValidUrl === false) return null;
    
    // Show loading state while checking URL
    if (isValidUrl === null) {
        return (
            <article className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
            </article>
        );
    }

    return (
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png" 
                                    alt="Loading" 
                                    className="w-10 h-10 object-contain"
                                    style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                                />
                            </div>
                            <span className="text-xs text-gray-400">Loading...</span>
                        </div>
                    </div>
                ) : imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                        <Newspaper className="w-10 h-10 text-red-200" />
                    </div>
                )}
            </div>
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
                <a
                    href={article.url && article.url.startsWith('http') ? article.url : `https://www.google.com/search?q=${encodeURIComponent(article.title)}&tbm=nws`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                    Read more <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </article>
    );
};

import { Monitor, TrendingUp as BusinessIcon, FlaskConical, HeartPulse, Landmark, Trophy, Clapperboard, Globe2, ChevronDown, ChevronUp } from 'lucide-react';

const ARTICLES_PER_CATEGORY = 12;

const NewsGrid = ({ news }) => {
    // RSS feeds provide real URLs - no validation needed
    const articles = news.slice(0, ARTICLES_PER_CATEGORY);

    if (articles.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No Articles Found</h2>
                <p className="text-gray-500">Try a different topic</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article, index) => (
                <NewsCardSimple key={index} article={article} index={index} />
            ))}
        </div>
    );
};

const cleanHtmlFromText = (text) => {
    if (!text) return '';
    return text
        .replace(/<a[^>]*>.*?<\/a>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const NewsCardSimple = ({ article, index }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    
    const cleanTitle = cleanHtmlFromText(article.title);
    const cleanSummary = cleanHtmlFromText(article.summary);

    useEffect(() => {
        const generateImage = async () => {
            setImageLoading(true);
            try {
                // Create a specific prompt from both title and description
                const context = `${cleanTitle}. ${cleanSummary}`.slice(0, 200);
                const result = await base44.integrations.Core.GenerateImage({
                    prompt: `Professional news photography depicting: ${context}. Photorealistic, editorial style, high quality, no text or words, no logos`
                });
                if (result?.url) {
                    setImageUrl(result.url);
                }
            } catch (error) {
                console.error('Image generation error:', error);
            } finally {
                setImageLoading(false);
            }
        };
        generateImage();
    }, [cleanTitle, cleanSummary]);

    return (
        <a 
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
        >
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png" 
                                    alt="Loading" 
                                    className="w-10 h-10 object-contain"
                                    style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                                />
                            </div>
                            <span className="text-xs text-gray-400">Loading...</span>
                        </div>
                    </div>
                ) : imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                        <Newspaper className="w-10 h-10 text-red-200" />
                    </div>
                )}
            </div>
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
                    {cleanTitle}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {cleanSummary || `Read the full story: ${cleanTitle}`}
                </p>
                <span className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium">
                    Read more <ExternalLink className="w-3 h-3" />
                </span>
            </div>
        </a>
    );
};

const CATEGORIES = [
    { id: 'technology', label: 'Technology', icon: Monitor, subtopics: ['AI', 'Startups', 'Gadgets', 'Cybersecurity', 'Software', 'Cloud Computing', 'Blockchain', 'Robotics', '5G Networks', 'IoT'] },
    { id: 'business', label: 'Business', icon: BusinessIcon, subtopics: ['Stocks', 'Economy', 'Crypto', 'Real Estate', 'Finance', 'Mergers', 'IPOs', 'Venture Capital', 'Banking', 'Commodities'] },
    { id: 'science', label: 'Science', icon: FlaskConical, subtopics: ['Space', 'Physics', 'Biology', 'Climate', 'Research', 'Astronomy', 'Genetics', 'Archaeology', 'Chemistry', 'Quantum'] },
    { id: 'health', label: 'Health', icon: HeartPulse, subtopics: ['Medicine', 'Wellness', 'Mental Health', 'Nutrition', 'Fitness', 'Vaccines', 'Aging', 'Sleep', 'Diseases', 'Healthcare Policy'] },
    { id: 'politics', label: 'Politics', icon: Landmark, subtopics: ['Elections', 'Policy', 'Congress', 'International', 'Law', 'Supreme Court', 'Diplomacy', 'Defense', 'Immigration', 'Trade'] },
    { id: 'sports', label: 'Sports', icon: Trophy, subtopics: ['Football', 'Basketball', 'Soccer', 'Tennis', 'Olympics', 'Baseball', 'Golf', 'MMA', 'Formula 1', 'Cricket'] },
    { id: 'entertainment', label: 'Entertainment', icon: Clapperboard, subtopics: ['Movies', 'Music', 'TV Shows', 'Celebrities', 'Gaming', 'Streaming', 'Broadway', 'Awards', 'Podcasts', 'Anime'] },
    { id: 'world', label: 'World', icon: Globe2, subtopics: ['Europe', 'Asia', 'Americas', 'Africa', 'Middle East', 'Australia', 'Russia', 'India', 'China', 'Latin America'] },
];

export default function News() {
    useEffect(() => {
        document.title = 'News articles hub for around the world';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Global hub for trusted news articles, delivering accurate reporting and insights worldwide.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'News articles, news article');
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('technology');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchNews = async (keyword) => {
        setLoading(true);
        setError(null);
        try {
            // Use backend function with RSS + NewsAPI
            const response = await base44.functions.invoke('fetchNews', {
                query: keyword,
                category: CATEGORIES.find(c => c.id === keyword)?.id || null,
                limit: 30
            });

            setNews(response.data?.articles || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching news:', err);
            setError(getErrorCode(err));
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
            <style>{pulseAnimation}</style>
            <div className="max-w-[82rem] mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">News</h1>
                                <p className="text-white/80">Ai-Powered News Aggregator</p>
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
                <div className="flex flex-wrap gap-2 mb-2">
                    {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isExpanded = expandedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    handleCategoryClick(cat.id);
                                    setExpandedCategory(isExpanded ? null : cat.id);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                    activeCategory === cat.id
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                <IconComponent className="w-4 h-4" />
                                {cat.label}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        );
                    })}
                </div>

                {/* Subtopics */}
                {expandedCategory && (
                    <div className="flex flex-wrap gap-2 mb-6 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {CATEGORIES.find(c => c.id === expandedCategory)?.subtopics.map((subtopic) => (
                            <button
                                key={subtopic}
                                onClick={() => {
                                    setSearchQuery(subtopic);
                                    fetchNews(subtopic);
                                }}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200 transition-colors"
                            >
                                {subtopic}
                            </button>
                        ))}
                    </div>
                )}
                
                {!expandedCategory && <div className="mb-4" />}

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
                    <LoadingState message="Fetching latest news..." size="large" />
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-gray-200">
                        <ErrorDisplay 
                            errorCode={error} 
                            onRetry={() => fetchNews(searchQuery || activeCategory)}
                        />
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No News Found</h2>
                        <p className="text-gray-500">Try searching for a different topic</p>
                    </div>
                ) : (
                    <NewsGrid news={news} />
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