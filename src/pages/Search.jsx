import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, FileText, Lightbulb, ExternalLink, Brain, Map, BookOpen, Newspaper, Headphones, ChevronRight, Globe, ListTodo, Plus, Play, Clock, TrendingUp, Pause, Volume2, VolumeX, X, Sparkles, Send, GraduationCap, RotateCcw, RotateCw, MessageSquarePlus, Radio, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { menuItems, LOGO_URL } from '@/components/NavigationConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

// Clean text for speech synthesis
const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#+\s*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Animated equalizer bars
const AnimatedBars = ({ isPlaying = false, color = '#10B981' }) => {
    const [heights, setHeights] = useState([4, 8, 6]);
    
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setHeights([
                4 + Math.random() * 8,
                4 + Math.random() * 8,
                4 + Math.random() * 8
            ]);
        }, 150);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="flex items-end h-3 gap-0.5">
            {heights.map((h, i) => (
                <div
                    key={i}
                    className="w-0.5 rounded-full transition-all duration-150"
                    style={{ height: `${h}px`, backgroundColor: color }}
                />
            ))}
        </div>
    );
};

export default function SearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    const navigate = useNavigate();
    
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

    // Full Pod Player State (like SearchPods)
    const [showPodPlayer, setShowPodPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentCaption, setCurrentCaption] = useState('');
    const [captionWords, setCaptionWords] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [podImage, setPodImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const sentencesRef = useRef([]);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);

    // Learning State
    const [learningData, setLearningData] = useState(null);
    const [learningLoading, setLearningLoading] = useState(false);

    // Qwirey State
    const [qwireyPrompt, setQwireyPrompt] = useState('');
    const [qwireyLoading, setQwireyLoading] = useState(false);
    const [qwireyResult, setQwireyResult] = useState(null);
    
    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, []);

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

    // Full Pod Player (like SearchPods)
    const playEpisode = async (episode) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setCurrentEpisode(episode);
        setShowPodPlayer(true);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsGenerating(true);
        setGenerationStep('Researching topic...');
        setGenerationProgress(10);
        setPodImage(null);
        setImageLoading(true);
        setCurrentCaption('Generating audio...');
        setCaptionWords([]);

        // Generate image in parallel
        base44.integrations.Core.GenerateImage({
            prompt: `Beautiful lifestyle photography representing "${episode.title}". Authentic, natural scene. Warm lighting, editorial style. No text, no words, no logos.`
        }).then(result => {
            setPodImage(result.url);
            setImageLoading(false);
        }).catch(() => setImageLoading(false));

        try {
            setGenerationStep('Writing script...');
            setGenerationProgress(25);

            const scriptResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Write a detailed, engaging 5-minute podcast script about "${episode.title}". Write in a conversational, friendly tone. Do NOT use markdown formatting.`,
                add_context_from_internet: true
            });
            
            const rawText = scriptResponse || `Welcome to this episode about ${episode.title}.`;
            
            setGenerationStep('Generating audio...');
            setGenerationProgress(50);
            const cleanText = cleanTextForSpeech(rawText);

            const sentences = cleanText
                .replace(/\n+/g, ' ')
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 3);

            if (sentences.length === 0) {
                sentences.push(`Welcome to ${episode.title}.`);
            }

            sentencesRef.current = sentences;

            const ttsResponse = await base44.functions.invoke('elevenlabsTTS', {
                text: cleanText,
                voice_id: 'EXAVITQu4vr4xnSDxMaL'
            });

            setGenerationProgress(75);

            if (!ttsResponse?.data?.audio) {
                throw new Error('No audio data received');
            }

            setGenerationProgress(90);

            const binaryString = atob(ttsResponse.data.audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            audioUrlRef.current = audioUrl;

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onloadedmetadata = () => setDuration(audio.duration);

            audio.ontimeupdate = () => {
                setCurrentTime(audio.currentTime);
                if (sentences.length > 0 && audio.duration > 0) {
                    const progress = audio.currentTime / audio.duration;
                    const sentenceIndex = Math.min(Math.floor(progress * sentences.length), sentences.length - 1);
                    setCurrentCaption(sentences[sentenceIndex]);
                    setCaptionWords(sentences[sentenceIndex].split(/\s+/));
                }
            };

            audio.onended = () => setIsPlaying(false);

            setGenerationProgress(100);
            setIsGenerating(false);
            setCurrentCaption(sentences[0] || 'Ready to play');
            setCaptionWords((sentences[0] || '').split(/\s+/));

            audio.play().then(() => setIsPlaying(true)).catch(() => {});

        } catch (error) {
            console.error('Generation error:', error);
            setIsGenerating(false);
        }
    };

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    }, [isPlaying]);

    const closePodPlayer = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        setShowPodPlayer(false);
        setCurrentEpisode(null);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const skipForward = () => {
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
    };

    const skipBackward = () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    };

    // Navigate to MindMap page with topic
    const navigateToMindmap = (topic) => {
        navigate(createPageUrl('MindMap') + `?topic=${encodeURIComponent(topic.title)}`);
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
                        <Tabs value={activeTab} onValueChange={(tab) => {
                            setActiveTab(tab);
                            // Auto-trigger Qwirey when switching to that tab
                            if (tab === 'qwirey' && !qwireyResult && !qwireyLoading && searchedQuery) {
                                setQwireyPrompt(searchedQuery);
                                setTimeout(() => handleQwireySubmit(), 100);
                            }
                        }} className="w-full">
                            <TabsList className="w-full justify-start bg-white rounded-2xl p-2 mb-4 flex-wrap h-auto gap-2 shadow-sm border border-gray-100">
                                <TabsTrigger value="news" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
                                    <Newspaper className="w-4 h-4 mr-2" /> News
                                </TabsTrigger>
                                <TabsTrigger value="pods" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
                                    <Headphones className="w-4 h-4 mr-2" /> Pods
                                </TabsTrigger>
                                <TabsTrigger value="mindmaps" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
                                    <Brain className="w-4 h-4 mr-2" /> MindMaps
                                </TabsTrigger>
                                <TabsTrigger value="learning" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
                                    <GraduationCap className="w-4 h-4 mr-2" /> Learning
                                </TabsTrigger>
                                <TabsTrigger value="intelligence" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
                                    <Lightbulb className="w-4 h-4 mr-2" /> Intelligence
                                </TabsTrigger>
                                <TabsTrigger value="qwirey" className="rounded-xl px-4 py-2.5 text-sm font-medium border border-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:border-gray-200 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 transition-all">
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

                            {/* Pods Tab - Full Player */}
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
                                                onClick={() => playEpisode(episode)}
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

                            {/* MindMaps Tab - Navigate to MindMap page */}
                            <TabsContent value="mindmaps">
                                {tabResults.mindmaps.loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                    </div>
                                ) : tabResults.mindmaps.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tabResults.mindmaps.data.map((topic, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => navigateToMindmap(topic)}
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
                                                        <Brain className="w-4 h-4" /> Open in MindMap
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
                                ) : tabResults.intelligence.data && (tabResults.intelligence.data.title || tabResults.intelligence.data.overview) ? (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                            {tabResults.intelligence.data.title && (
                                                <h3 className="text-xl font-bold text-gray-900">{tabResults.intelligence.data.title}</h3>
                                            )}
                                            {tabResults.intelligence.data.overview && (
                                                <p className="text-gray-600">{tabResults.intelligence.data.overview}</p>
                                            )}
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
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                            <Lightbulb className="w-8 h-8 text-violet-600" />
                                        </div>
                                        <p className="text-gray-500 mb-4">Intelligence data is being processed</p>
                                        <Link to={createPageUrl('Intelligence')}>
                                            <Button className="bg-violet-600 hover:bg-violet-700">
                                                Explore Intelligence Platform <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
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
                                    
                                    {qwireyLoading && !qwireyResult && (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                            <span className="ml-3 text-gray-600">Analyzing "{searchedQuery}"...</span>
                                        </div>
                                    )}
                                    
                                    {qwireyResult && (
                                        <div className="space-y-4 mb-4">
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
                                    
                                    <div className="text-center">
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

                        {/* Pod Player Modal */}
                        <Dialog open={showPodPlayer} onOpenChange={closePodPlayer}>
                        <DialogContent className="max-w-lg p-0 bg-white border-gray-200 overflow-hidden" aria-describedby={undefined}>
                        <DialogTitle className="sr-only">Now Playing</DialogTitle>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={closePodPlayer} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                                <span className="text-gray-500 text-sm uppercase tracking-wider">Now Playing</span>
                                <div className="w-6" />
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="relative w-56 h-56 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 overflow-hidden">
                                    {podImage && (
                                        <img src={podImage} alt="Podcast cover" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                    )}
                                    {imageLoading && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-indigo-600/90 flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
                                            <span className="text-white/70 text-xs">Creating artwork...</span>
                                        </div>
                                    )}
                                    {isGenerating && !imageLoading ? (
                                        <div className={`${podImage ? 'absolute inset-0 bg-black/50' : ''} flex flex-col items-center justify-center gap-3 px-6`}>
                                            <Loader2 className="w-10 h-10 text-white/80 animate-spin" />
                                            <span className="text-white/80 text-sm">{generationStep}</span>
                                            <div className="w-full max-w-[180px]">
                                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${generationProgress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : !isGenerating && !imageLoading ? (
                                        <>
                                            {!podImage && <Radio className="w-16 h-16 text-white/80" />}
                                            {isPlaying && (
                                                <div className={`${podImage ? 'absolute inset-0 bg-black/30 flex items-center justify-center' : 'absolute inset-0 flex items-center justify-center'}`}>
                                                    <div className="scale-[2.6]">
                                                        <AnimatedBars isPlaying={true} color="#ffffff" />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <h2 className="text-gray-900 text-xl font-bold mb-1 line-clamp-2">{currentEpisode?.title}</h2>
                                <p className="text-purple-600 text-sm">{currentEpisode?.description?.substring(0, 50)}</p>
                            </div>

                            {!isGenerating && (
                                <div className="mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4 h-[84px] border border-gray-200 flex items-center justify-center overflow-hidden">
                                        <p className="text-center leading-relaxed text-sm text-gray-700 line-clamp-3">
                                            {captionWords.map((word, i) => (
                                                <span key={i}>{word} </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <div 
                                    className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
                                    onClick={(e) => {
                                        if (!audioRef.current || !duration) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const percent = (e.clientX - rect.left) / rect.width;
                                        audioRef.current.currentTime = percent * duration;
                                    }}
                                >
                                    <div className="absolute h-full bg-purple-600 rounded-full transition-all" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button onClick={skipBackward} disabled={isGenerating} className="text-gray-400 hover:text-gray-600 p-2 flex flex-col items-center disabled:opacity-50">
                                    <RotateCcw className="w-6 h-6" />
                                    <span className="text-xs mt-0.5">15s</span>
                                </button>
                                <button onClick={togglePlay} disabled={isGenerating} className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30">
                                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
                                </button>
                                <button onClick={skipForward} disabled={isGenerating} className="text-gray-400 hover:text-gray-600 p-2 flex flex-col items-center disabled:opacity-50">
                                    <RotateCw className="w-6 h-6" />
                                    <span className="text-xs mt-0.5">30s</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-6 gap-4">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-700">
                                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                    </button>
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={100}
                                        onValueChange={([v]) => { 
                                            setVolume(v); 
                                            setIsMuted(v === 0);
                                            if (audioRef.current) audioRef.current.volume = v / 100;
                                        }}
                                        className="w-20"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    {[0.75, 1, 1.25, 1.5].map((speed) => (
                                        <button
                                            key={speed}
                                            onClick={() => {
                                                setPlaybackSpeed(speed);
                                                if (audioRef.current) audioRef.current.playbackRate = speed;
                                            }}
                                            className={`px-2 py-1 rounded text-xs transition-all ${playbackSpeed === speed ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </DialogContent>
                        </Dialog>

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