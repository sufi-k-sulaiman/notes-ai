import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, FileText, Lightbulb, ExternalLink, Brain, Map, BookOpen, Newspaper, Headphones, ChevronRight, Globe, ListTodo, Plus, Play, Clock, TrendingUp, Pause, Volume2, VolumeX, X, Sparkles, Send, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { menuItems, LOGO_URL } from '@/components/NavigationConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

// In-app content definitions for searchable pages
const IN_APP_CONTENT = {
    SearchPods: {
        name: 'SearchPods',
        icon: Headphones,
        color: '#EC4899',
        description: 'AI-generated audio podcasts on any topic',
        keywords: ['podcast', 'audio', 'listen', 'episodes', 'voice', 'speech', 'tts', 'motivation', 'inspiration'],
        canCreate: true,
        createLabel: 'Create a Pod'
    },
    MindMap: {
        name: 'MindMap',
        icon: Brain,
        color: '#10B981',
        description: 'Visual mind mapping and brainstorming tool',
        keywords: ['mindmap', 'brainstorm', 'ideas', 'visual', 'diagram', 'nodes', 'connections', 'thinking'],
        canCreate: true,
        createLabel: 'Create MindMap'
    },
    News: {
        name: 'News',
        icon: Newspaper,
        color: '#EF4444',
        description: 'Latest news and current events',
        keywords: ['news', 'headlines', 'current', 'events', 'articles', 'updates', 'breaking', 'world'],
        canCreate: false
    },
    Learning: {
        name: 'Learning',
        icon: BookOpen,
        color: '#F59E0B',
        description: 'Interactive learning courses and educational content',
        keywords: ['learn', 'courses', 'education', 'study', 'knowledge', 'skills', 'training', 'lessons'],
        canCreate: true,
        createLabel: 'Start Learning'
    },
    Geospatial: {
        name: 'Geospatial',
        icon: Globe,
        color: '#3B82F6',
        description: 'Interactive maps and geographic analysis',
        keywords: ['maps', 'geography', 'location', 'spatial', 'earth', 'countries', 'regions', 'mapping'],
        canCreate: true,
        createLabel: 'Explore Map'
    },
    Intelligence: {
        name: 'Intelligence',
        icon: Lightbulb,
        color: '#8B5CF6',
        description: 'AI-powered intelligence and knowledge exploration',
        keywords: ['intelligence', 'knowledge', 'ai', 'science', 'explore', 'discover', 'facts', 'research'],
        canCreate: true,
        createLabel: 'Explore Topics'
    },
    Tasks: {
        name: 'Tasks',
        icon: ListTodo,
        color: '#A855F7',
        description: 'Task management and productivity',
        keywords: ['tasks', 'todo', 'productivity', 'manage', 'organize', 'projects', 'work'],
        canCreate: true,
        createLabel: 'Create Task'
    },
    Qwirey: {
        name: 'Qwirey',
        icon: Map,
        color: '#7C3AED',
        description: 'AI-powered research and Q&A assistant',
        keywords: ['ai', 'research', 'questions', 'answers', 'assistant', 'chat', 'query']
    }
};

export default function SearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchedQuery, setSearchedQuery] = useState('');
    const [inAppResults, setInAppResults] = useState([]);
    const [activeTab, setActiveTab] = useState('news');
    const [tabResults, setTabResults] = useState({
        news: { loading: false, data: [] },
        pods: { loading: false, data: null },
        intelligence: { loading: false, data: null },
        learning: { loading: false, data: [] },
        mindmaps: { loading: false, data: [] },
        qwirey: { loading: false, data: null }
    });

    // Pod Player State
    const [podPlayer, setPodPlayer] = useState({
        isGenerating: false,
        isPlaying: false,
        currentPod: null,
        audio: null,
        script: null,
        progress: 0
    });
    const audioRef = useRef(null);

    // MindMap State
    const [mindmapData, setMindmapData] = useState(null);
    const [mindmapLoading, setMindmapLoading] = useState(false);

    // Learning State
    const [learningData, setLearningData] = useState(null);
    const [learningLoading, setLearningLoading] = useState(false);

    // Qwirey State
    const [qwireyPrompt, setQwireyPrompt] = useState('');
    const [qwireyLoading, setQwireyLoading] = useState(false);
    const [qwireyResult, setQwireyResult] = useState(null);

    // Filter matching pages from navigation
    const matchingPages = menuItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    // Search in-app content
    const searchInAppContent = (searchQuery) => {
        const q = searchQuery.toLowerCase();
        const matches = [];
        
        Object.entries(IN_APP_CONTENT).forEach(([page, content]) => {
            const nameMatch = content.name.toLowerCase().includes(q);
            const descMatch = content.description.toLowerCase().includes(q);
            const keywordMatch = content.keywords.some(kw => kw.includes(q) || q.includes(kw));
            
            if (nameMatch || descMatch || keywordMatch) {
                matches.push({
                    page,
                    ...content,
                    relevance: nameMatch ? 3 : (descMatch ? 2 : 1)
                });
            }
        });
        
        return matches.sort((a, b) => b.relevance - a.relevance);
    };

    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery);
        }
    }, []);

    const fetchNewsResults = async (searchQuery) => {
        setTabResults(prev => ({ ...prev, news: { loading: true, data: [] } }));
        try {
            const response = await base44.functions.invoke('fetchNews', {
                query: searchQuery,
                limit: 12
            });
            setTabResults(prev => ({ ...prev, news: { loading: false, data: response.data?.articles || [] } }));
        } catch (error) {
            console.error('News fetch failed:', error);
            setTabResults(prev => ({ ...prev, news: { loading: false, data: [] } }));
        }
    };

    const fetchIntelligenceResults = async (searchQuery) => {
        setTabResults(prev => ({ ...prev, intelligence: { loading: true, data: null } }));
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide detailed intelligence about: "${searchQuery}". Include key facts, statistics, and insights.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        overview: { type: "string" },
                        keyFacts: { type: "array", items: { type: "string" } },
                        statistics: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } },
                        relatedTopics: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setTabResults(prev => ({ ...prev, intelligence: { loading: false, data: response } }));
        } catch (error) {
            console.error('Intelligence fetch failed:', error);
            setTabResults(prev => ({ ...prev, intelligence: { loading: false, data: null } }));
        }
    };

    const fetchLearningResults = async (searchQuery) => {
        setTabResults(prev => ({ ...prev, learning: { loading: true, data: [] } }));
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 educational learning modules about "${searchQuery}". Each should be a course or lesson topic.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        modules: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, difficulty: { type: "string" }, duration: { type: "string" } } } }
                    }
                }
            });
            setTabResults(prev => ({ ...prev, learning: { loading: false, data: response?.modules || [] } }));
        } catch (error) {
            console.error('Learning fetch failed:', error);
            setTabResults(prev => ({ ...prev, learning: { loading: false, data: [] } }));
        }
    };

    const fetchPodsResults = async (searchQuery) => {
        setTabResults(prev => ({ ...prev, pods: { loading: true, data: null } }));
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 unique podcast episode ideas about "${searchQuery}". Each should be engaging and educational. Include creative titles, compelling descriptions, and realistic durations.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        episodes: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, duration: { type: "string" } } } }
                    }
                }
            });
            setTabResults(prev => ({ ...prev, pods: { loading: false, data: response } }));
        } catch (error) {
            console.error('Pods fetch failed:', error);
            setTabResults(prev => ({ ...prev, pods: { loading: false, data: null } }));
        }
    };

    const fetchMindmapsResults = async (searchQuery) => {
        setTabResults(prev => ({ ...prev, mindmaps: { loading: true, data: [] } }));
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 mindmap topic ideas related to "${searchQuery}". Each should be a great starting point for visual brainstorming and exploration.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        topics: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, subtopics: { type: "array", items: { type: "string" } } } } }
                    }
                }
            });
            setTabResults(prev => ({ ...prev, mindmaps: { loading: false, data: response?.topics || [] } }));
        } catch (error) {
            console.error('Mindmaps fetch failed:', error);
            setTabResults(prev => ({ ...prev, mindmaps: { loading: false, data: [] } }));
        }
    };

    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setSearchedQuery(searchQuery);
        setActiveTab('news');
        
        // Reset embedded states
        setPodPlayer({ isGenerating: false, isPlaying: false, currentPod: null, audio: null, script: null, progress: 0 });
        setMindmapData(null);
        setLearningData(null);
        setQwireyResult(null);
        setQwireyPrompt(searchQuery);
        
        // Search in-app content first
        const appMatches = searchInAppContent(searchQuery);
        setInAppResults(appMatches);
        
        // Fetch all tab results in parallel
        fetchNewsResults(searchQuery);
        fetchIntelligenceResults(searchQuery);
        fetchLearningResults(searchQuery);
        fetchPodsResults(searchQuery);
        fetchMindmapsResults(searchQuery);
        
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

    // Pod Generation & Player
    const generatePod = async (episode) => {
        setPodPlayer(prev => ({ ...prev, isGenerating: true, currentPod: episode }));
        try {
            // Generate script
            const scriptResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Write a 2-3 minute podcast script about: "${episode.title}". Description: ${episode.description}. Make it engaging and conversational.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        script: { type: "string" }
                    }
                }
            });
            
            const script = scriptResponse?.script || `Welcome to this episode about ${episode.title}. ${episode.description}`;
            
            // Generate audio
            const audioResponse = await base44.functions.invoke('elevenlabsTTS', {
                text: script.substring(0, 4000),
                voice_id: 'pNInz6obpgDQGcFmaJgB'
            });
            
            if (audioResponse.data?.audio) {
                const audioBlob = new Blob(
                    [Uint8Array.from(atob(audioResponse.data.audio), c => c.charCodeAt(0))],
                    { type: 'audio/mpeg' }
                );
                const audioUrl = URL.createObjectURL(audioBlob);
                
                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    audioRef.current.play();
                }
                
                setPodPlayer(prev => ({
                    ...prev,
                    isGenerating: false,
                    isPlaying: true,
                    audio: audioUrl,
                    script
                }));
            }
        } catch (error) {
            console.error('Pod generation failed:', error);
            setPodPlayer(prev => ({ ...prev, isGenerating: false }));
        }
    };

    const togglePodPlayback = () => {
        if (audioRef.current) {
            if (podPlayer.isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setPodPlayer(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
        }
    };

    const closePodPlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setPodPlayer({ isGenerating: false, isPlaying: false, currentPod: null, audio: null, script: null, progress: 0 });
    };

    // MindMap Generation
    const generateMindmap = async (topic) => {
        setMindmapLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a detailed mind map for: "${topic.title}". Include the central topic and 5-7 main branches, each with 2-3 sub-branches.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        centralTopic: { type: "string" },
                        branches: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    color: { type: "string" },
                                    children: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });
            setMindmapData(response);
        } catch (error) {
            console.error('Mindmap generation failed:', error);
        } finally {
            setMindmapLoading(false);
        }
    };

    // Learning Island Generation
    const generateLearning = async (module) => {
        setLearningLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create a learning module for: "${module.title}". Include 5 lessons with titles, descriptions, and key takeaways.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        moduleTitle: { type: "string" },
                        description: { type: "string" },
                        lessons: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    duration: { type: "string" },
                                    keyTakeaways: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });
            setLearningData(response);
        } catch (error) {
            console.error('Learning generation failed:', error);
        } finally {
            setLearningLoading(false);
        }
    };

    // Qwirey Chat
    const handleQwireySubmit = async () => {
        if (!qwireyPrompt.trim()) return;
        setQwireyLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: qwireyPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        answer: { type: "string" },
                        keyPoints: { type: "array", items: { type: "string" } },
                        followUpQuestions: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setQwireyResult(response);
        } catch (error) {
            console.error('Qwirey failed:', error);
        } finally {
            setQwireyLoading(false);
        }
    };

    // Audio element for pod player
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.ontimeupdate = () => {
                if (audioRef.current.duration) {
                    setPodPlayer(prev => ({
                        ...prev,
                        progress: (audioRef.current.currentTime / audioRef.current.duration) * 100
                    }));
                }
            };
            audioRef.current.onended = () => {
                setPodPlayer(prev => ({ ...prev, isPlaying: false, progress: 0 }));
            };
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <audio ref={audioRef} className="hidden" />
            
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

                {/* Pod Player */}
                {(podPlayer.currentPod || podPlayer.isGenerating) && (
                    <div className="mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Headphones className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">{podPlayer.currentPod?.title}</h4>
                                    <p className="text-sm text-white/70">
                                        {podPlayer.isGenerating ? 'Generating audio...' : 'Now Playing'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closePodPlayer} className="p-2 hover:bg-white/20 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {podPlayer.isGenerating ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Creating your personalized podcast...</span>
                            </div>
                        ) : (
                            <>
                                <div className="h-1 bg-white/30 rounded-full mb-3">
                                    <div 
                                        className="h-full bg-white rounded-full transition-all"
                                        style={{ width: `${podPlayer.progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={togglePodPlayback}
                                        className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        {podPlayer.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-500">Searching for "{searchedQuery}"...</p>
                    </div>
                )}

                {/* Results with Tabs */}
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

                        {/* Tabbed Results */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-xl p-1 mb-4 flex-wrap h-auto gap-1">
                                <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white">
                                    <Newspaper className="w-4 h-4 mr-2" /> News
                                </TabsTrigger>
                                <TabsTrigger value="pods" className="rounded-lg data-[state=active]:bg-pink-600 data-[state=active]:text-white">
                                    <Headphones className="w-4 h-4 mr-2" /> Pods
                                </TabsTrigger>
                                <TabsTrigger value="mindmaps" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                    <Brain className="w-4 h-4 mr-2" /> MindMaps
                                </TabsTrigger>
                                <TabsTrigger value="learning" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                                    <GraduationCap className="w-4 h-4 mr-2" /> Learning
                                </TabsTrigger>
                                <TabsTrigger value="intelligence" className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                                    <Lightbulb className="w-4 h-4 mr-2" /> Intelligence
                                </TabsTrigger>
                                <TabsTrigger value="qwirey" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Sparkles className="w-4 h-4 mr-2" /> Qwirey
                                </TabsTrigger>
                            </TabsList>

                            {/* News Tab */}
                            <TabsContent value="news">
                                {tabResults.news.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                                    </div>
                                ) : tabResults.news.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tabResults.news.data.map((article, i) => (
                                            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" 
                                               className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">{article.source || 'News'}</span>
                                                    {article.time && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{article.time}</span>}
                                                </div>
                                                <h4 className="font-semibold text-gray-900 group-hover:text-red-600 line-clamp-2 mb-2">{article.title}</h4>
                                                <span className="text-red-600 text-sm font-medium flex items-center gap-1">Read more <ExternalLink className="w-3 h-3" /></span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No news found for "{searchedQuery}"</div>
                                )}
                            </TabsContent>

                            {/* Pods Tab - Generate directly */}
                            <TabsContent value="pods">
                                {tabResults.pods.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
                                    </div>
                                ) : tabResults.pods.data?.episodes?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tabResults.pods.data.episodes.map((episode, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => generatePod(episode)}
                                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-pink-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        <Play className="w-5 h-5 text-pink-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-pink-600 line-clamp-2 mb-1">{episode.title}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{episode.description}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-400">{episode.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <span className="text-pink-600 text-sm font-medium flex items-center gap-1">
                                                        <Play className="w-4 h-4" /> Generate & Play
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No podcasts found</div>
                                )}
                            </TabsContent>

                            {/* MindMaps Tab - Generate directly */}
                            <TabsContent value="mindmaps">
                                {mindmapData ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-gray-900">{mindmapData.centralTopic}</h3>
                                            <Button variant="outline" size="sm" onClick={() => setMindmapData(null)}>
                                                <X className="w-4 h-4 mr-1" /> Close
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-center p-4 text-sm">
                                                {mindmapData.centralTopic}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                            {mindmapData.branches?.map((branch, i) => (
                                                <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-2">{branch.name}</h4>
                                                    <ul className="space-y-1">
                                                        {branch.children?.map((child, j) => (
                                                            <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                                {child}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Link to={createPageUrl('MindMap') + `?topic=${encodeURIComponent(mindmapData.centralTopic)}`}>
                                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                                    Open Full MindMap Editor <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : mindmapLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                        <span className="ml-3 text-gray-600">Generating mindmap...</span>
                                    </div>
                                ) : tabResults.mindmaps.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                    </div>
                                ) : tabResults.mindmaps.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tabResults.mindmaps.data.map((topic, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => generateMindmap(topic)}
                                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center flex-shrink-0">
                                                        <Brain className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 line-clamp-2">{topic.title}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-2">{topic.description}</p>
                                                    </div>
                                                </div>
                                                {topic.subtopics?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {topic.subtopics.slice(0, 4).map((sub, j) => (
                                                            <span key={j} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{sub}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                                        <Brain className="w-4 h-4" /> Generate MindMap
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No mindmap topics found</div>
                                )}
                            </TabsContent>

                            {/* Learning Tab - Generate directly */}
                            <TabsContent value="learning">
                                {learningData ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{learningData.moduleTitle}</h3>
                                                <p className="text-gray-500">{learningData.description}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => setLearningData(null)}>
                                                <X className="w-4 h-4 mr-1" /> Close
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {learningData.lessons?.map((lesson, i) => (
                                                <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                                            <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">{lesson.duration}</span>
                                                            </div>
                                                            {lesson.keyTakeaways?.length > 0 && (
                                                                <div className="mt-2">
                                                                    <p className="text-xs font-medium text-amber-700 mb-1">Key Takeaways:</p>
                                                                    <ul className="space-y-1">
                                                                        {lesson.keyTakeaways.map((takeaway, j) => (
                                                                            <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                                                                                <span className="text-amber-500">•</span> {takeaway}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-center">
                                            <Link to={createPageUrl('Learning')}>
                                                <Button className="bg-amber-600 hover:bg-amber-700">
                                                    Open Learning Platform <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : learningLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                                        <span className="ml-3 text-gray-600">Generating learning module...</span>
                                    </div>
                                ) : tabResults.learning.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                                    </div>
                                ) : tabResults.learning.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tabResults.learning.data.map((module, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => generateLearning(module)}
                                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center flex-shrink-0">
                                                        <GraduationCap className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 line-clamp-2">{module.title}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-2">{module.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mb-3">
                                                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{module.difficulty}</span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}</span>
                                                </div>
                                                <div className="pt-3 border-t border-gray-100">
                                                    <span className="text-amber-600 text-sm font-medium flex items-center gap-1">
                                                        <GraduationCap className="w-4 h-4" /> Generate Learning Island
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No learning modules found</div>
                                )}
                            </TabsContent>

                            {/* Intelligence Tab */}
                            <TabsContent value="intelligence">
                                {tabResults.intelligence.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                                    </div>
                                ) : tabResults.intelligence.data ? (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                            <h3 className="text-xl font-bold text-gray-900">{tabResults.intelligence.data.title}</h3>
                                            <p className="text-gray-600">{tabResults.intelligence.data.overview}</p>
                                            {tabResults.intelligence.data.keyFacts?.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Key Facts</h4>
                                                    <ul className="space-y-1">
                                                        {tabResults.intelligence.data.keyFacts.map((fact, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                                <TrendingUp className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                                                                {fact}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {tabResults.intelligence.data.statistics?.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {tabResults.intelligence.data.statistics.map((stat, i) => (
                                                        <div key={i} className="bg-violet-50 rounded-lg p-3 text-center">
                                                            <div className="text-lg font-bold text-violet-700">{stat.value}</div>
                                                            <div className="text-xs text-gray-600">{stat.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {tabResults.intelligence.data.relatedTopics?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-3">Explore Related Topics</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {tabResults.intelligence.data.relatedTopics.map((topic, i) => (
                                                        <Link key={i} to={createPageUrl('Intelligence')}
                                                           className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-violet-300 transition-all group flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                                <Lightbulb className="w-5 h-5 text-violet-600" />
                                                            </div>
                                                            <span className="font-medium text-gray-900 group-hover:text-violet-600">{topic}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No intelligence data found</div>
                                )}
                            </TabsContent>

                            {/* Qwirey Tab */}
                            <TabsContent value="qwirey">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={LOGO_URL} alt="Qwirey" className="w-10 h-10 rounded-xl" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Qwirey AI</h3>
                                            <p className="text-sm text-gray-500">Ask anything about "{searchedQuery}"</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={qwireyPrompt}
                                            onChange={(e) => setQwireyPrompt(e.target.value)}
                                            placeholder="Ask a follow-up question..."
                                            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleQwireySubmit()}
                                        />
                                        <Button 
                                            onClick={handleQwireySubmit}
                                            disabled={qwireyLoading}
                                            className="bg-purple-600 hover:bg-purple-700 h-12 px-4"
                                        >
                                            {qwireyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                    
                                    {qwireyResult && (
                                        <div className="space-y-4">
                                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                                <div className="prose prose-sm max-w-none text-gray-700">
                                                    <ReactMarkdown>{qwireyResult.answer}</ReactMarkdown>
                                                </div>
                                            </div>
                                            
                                            {qwireyResult.keyPoints?.length > 0 && (
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                                                    <ul className="space-y-2">
                                                        {qwireyResult.keyPoints.map((point, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium flex-shrink-0">{i + 1}</span>
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {qwireyResult.followUpQuestions?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Continue exploring</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {qwireyResult.followUpQuestions.map((q, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    setQwireyPrompt(q);
                                                                    handleQwireySubmit();
                                                                }}
                                                                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                                                            >
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 text-center">
                                        <Link to={createPageUrl('Qwirey')}>
                                            <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                                                Open Full Qwirey <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

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

                {/* Default State - Show all features */}
                {!loading && !results && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Explore Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(IN_APP_CONTENT).map(([page, item]) => {
                                const Icon = item.icon;
                                return (
                                    <div key={page} className="bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all overflow-hidden">
                                        <Link
                                            to={createPageUrl(page)}
                                            className="flex items-center gap-4 p-4 group"
                                        >
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${item.color}15` }}
                                            >
                                                <Icon className="w-6 h-6" style={{ color: item.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{item.name}</h4>
                                                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </Link>
                                        {item.canCreate && (
                                            <Link 
                                                to={createPageUrl(page)}
                                                className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 text-sm font-medium hover:bg-purple-50 transition-colors"
                                                style={{ color: item.color }}
                                            >
                                                <Plus className="w-4 h-4" />
                                                {item.createLabel}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}