import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Sparkles, Radio, Loader2, TrendingUp, Users, Search, Mic,
    ChevronRight, X, Clock, Menu, ChevronLeft, Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

import { LOGO_URL, menuItems, footerLinks } from '../components/NavigationConfig';
import GlobalSearchBar from '../components/GlobalSearchBar';

const CATEGORIES = [
    { id: 'technology', name: 'Technology', color: '#6B4EE6', episodes: 16 },
    { id: 'education', name: 'Education', color: '#3B82F6', episodes: 12 },
    { id: 'entertainment', name: 'Entertainment', color: '#EC4899', episodes: 8 },
    { id: 'health', name: 'Health', color: '#F59E0B', episodes: 10 },
    { id: 'business', name: 'Business', color: '#8B5CF6', episodes: 14 },
    { id: 'science', name: 'Science', color: '#06B6D4', episodes: 9 },
];

// Clean text from HTML, markdown, and other formatting
const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic markdown
        .replace(/__([^_]+)__/g, '$1') // Remove underline markdown
        .replace(/_([^_]+)_/g, '$1') // Remove underline markdown
        .replace(/#+\s*/g, '') // Remove headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/`([^`]+)`/g, '$1') // Remove code formatting
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
};

const QUICK_TOPICS = [
    'AI trends', 'Morning motivation', 'Sleep story', 'Health tips', 'World news', 'Book summary',
    'Cryptocurrency', 'Climate change', 'Space exploration', 'Mental health', 'Productivity hacks', 'History facts',
    'Meditation guide', 'Stock market', 'Startup stories', 'Philosophy 101', 'True crime', 'Science breakthroughs',
    'Leadership skills', 'Personal finance', 'Relationship advice', 'Travel destinations', 'Cooking basics', 'Fitness routines',
    'Art history', 'Music theory', 'Language learning', 'Career growth', 'Tech gadgets', 'Movie reviews', 'Political analysis', 'Sports highlights'
];

const TRENDING = [
    { title: 'The Psychology of Happiness', category: 'Psychology', plays: 3421, image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=400&h=400&fit=crop' },
    { title: 'The Science of Learning', category: 'Education', plays: 3156, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop' },
    { title: 'AI Revolution in Industries', category: 'Technology', plays: 2847, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop' },
    { title: 'Startup Playbook', category: 'Business', plays: 2789, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop' },
    { title: 'Investment Basics', category: 'Finance', plays: 2567, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop' },
    { title: 'Peak Performance', category: 'Sports', plays: 2567, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
    { title: 'Quantum Computing Explained', category: 'Science', plays: 2234, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop' },
    { title: 'Future of Work', category: 'Business', plays: 2189, image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=400&fit=crop' },
    { title: 'Nutrition Science', category: 'Health', plays: 1987, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop' },
];



export default function SearchPods() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [categoryEpisodes, setCategoryEpisodes] = useState({});
    const [loadingCategory, setLoadingCategory] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentCaption, setCurrentCaption] = useState('');
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [audioError, setAudioError] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLoadingPods, setIsLoadingPods] = useState(true);
    
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize speech synthesis voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices();
            console.log('Available voices:', voices?.length);
        };
        
        if ('speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        return () => {
            window.speechSynthesis?.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Simulate initial loading
    useEffect(() => {
        const timer = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setIsLoadingPods(false);
                    return 100;
                }
                return prev + 20;
            });
        }, 300);
        return () => clearInterval(timer);
    }, []);

    const loadCategoryEpisodes = async (categoryId) => {
        if (categoryEpisodes[categoryId]) return;
        setLoadingCategory(categoryId);
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 podcast episode titles for "${categoryId}" category. Make them engaging and specific.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        episodes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        subtopics: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setCategoryEpisodes(prev => ({
                ...prev,
                [categoryId]: {
                    episodes: response?.episodes || [],
                    subtopics: response?.subtopics || []
                }
            }));
        } catch (error) {
            console.error('Error loading episodes:', error);
        } finally {
            setLoadingCategory(null);
        }
    };

    const handleVoiceSearch = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice search not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            setSearchQuery(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.start();
    };

    const playEpisode = async (episode) => {
        // Cancel any existing speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        setCurrentEpisode(episode);
        setShowPlayer(true);
        setCurrentTime(0);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsGenerating(true);
        setCurrentCaption('Generating your podcast script...');
        setAudioError(null);
        currentIndexRef.current = 0;

        try {
            const script = await base44.integrations.Core.InvokeLLM({
                prompt: `Write a 2-minute engaging podcast script about "${episode.title}". 
                Include an intro greeting, 3-4 key points with interesting facts, and a conclusion.
                Write naturally as if speaking to listeners. Be informative and entertaining.
                Do not use markdown formatting, just plain text.`,
                add_context_from_internet: true
            });

            const rawText = script || `Welcome to this episode about ${episode.title}. Let me share some interesting insights with you today.`;
            
            // Clean the text before processing
            const text = cleanTextForSpeech(rawText);
            
            // Split into sentences more carefully
            const sentences = text
                .replace(/\n+/g, ' ')
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 3);
            
            console.log('Generated sentences:', sentences.length, sentences);
            
            if (sentences.length === 0) {
                sentences.push(`Welcome to ${episode.title}. This is an exciting topic to explore.`);
            }
            
            sentencesRef.current = sentences;
            currentIndexRef.current = 0;
            setDuration(sentences.length * 4);
            setIsGenerating(false);
            setCurrentCaption(sentences[0] || 'Ready to play');
            
            // Auto-start playback after a short delay
            setTimeout(() => {
                startPlayback();
            }, 500);
            
        } catch (error) {
            console.error('Script generation error:', error);
            setIsGenerating(false);
            setAudioError('Failed to generate script. Please try again.');
            sentencesRef.current = [`Welcome to ${episode.title}. This is an exciting topic.`];
            setCurrentCaption(sentencesRef.current[0]);
            setDuration(10);
        }
    };

    const startPlayback = () => {
        if (!('speechSynthesis' in window)) {
            setAudioError('Text-to-speech is not supported in your browser. Please try Chrome or Edge.');
            return;
        }

        // Ensure any previous speech is cancelled
        window.speechSynthesis.cancel();
        
        isPlayingRef.current = true;
        setIsPlaying(true);
        setAudioError(null);
        
        // Start speaking
        speakCurrentSentence();
        
        // Start timer for progress
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
                const newTime = prev + 1;
                if (newTime >= duration) {
                    clearInterval(timerRef.current);
                    return duration;
                }
                return newTime;
            });
        }, 1000);
    };

    const speakCurrentSentence = () => {
        if (!isPlayingRef.current) {
            console.log('Playback stopped');
            return;
        }
        
        if (currentIndexRef.current >= sentencesRef.current.length) {
            console.log('All sentences spoken');
            stopPlayback();
            return;
        }

        const text = sentencesRef.current[currentIndexRef.current];
        console.log('Speaking sentence', currentIndexRef.current, ':', text);
        setCurrentCaption(text);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.volume = isMuted ? 0 : volume / 100;
        utterance.pitch = 1;
        utterance.lang = 'en-US';

        // Get a voice
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Try to find an English voice
            const englishVoice = voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        utterance.onstart = () => {
            console.log('Started speaking sentence', currentIndexRef.current);
        };

        utterance.onend = () => {
            console.log('Finished sentence', currentIndexRef.current);
            currentIndexRef.current++;
            
            if (isPlayingRef.current && currentIndexRef.current < sentencesRef.current.length) {
                // Small delay between sentences for natural pacing
                setTimeout(() => speakCurrentSentence(), 200);
            } else if (currentIndexRef.current >= sentencesRef.current.length) {
                stopPlayback();
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event.error);
            if (event.error !== 'interrupted') {
                setAudioError(`Speech error: ${event.error}`);
            }
            currentIndexRef.current++;
            if (isPlayingRef.current && currentIndexRef.current < sentencesRef.current.length) {
                setTimeout(() => speakCurrentSentence(), 200);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopPlayback = () => {
        console.log('Stopping playback');
        window.speechSynthesis?.cancel();
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            isPlayingRef.current = true;
            setIsPlaying(true);
            speakCurrentSentence();
            
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => Math.min(prev + 1, duration));
            }, 1000);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            playEpisode({ title: searchQuery, category: 'Search' });
        }
    };

    const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

    const AnimatedBars = () => (
        <div className="flex items-end h-3 gap-0.5">
            {[1,2,3].map(i => (
                <div key={i} className="w-0.5 bg-purple-500 rounded-full animate-pulse" 
                    style={{ height: `${4 + Math.random() * 8}px`, animationDelay: `${i * 100}ms` }} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm h-[72px]">
                <div className="flex items-center justify-between px-4 h-full">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80">
                            <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                            <div>
                                <span className="text-xl font-bold text-gray-900">1cPublishing</span>
                                <p className="text-xs font-medium text-purple-600">Ai SearchPods</p>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hover:bg-gray-100"
                        >
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
                        </Button>
                    </div>

                    {/* Global Search Bar */}
                    <GlobalSearchBar 
                        onSearch={(q) => { setSearchQuery(q); playEpisode({ title: q, category: 'Search' }); }}
                        placeholder="Search any topic to create a podcast..."
                        className="flex-1 max-w-2xl mx-8"
                    />

                    <div className="w-20" />
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0`}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    item.label === 'SearchPods'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                                }`}
                            >
                                <item.icon className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
                        {/* Loading State */}
                        {isLoadingPods && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Radio className="w-12 h-12 text-purple-600 animate-pulse" />
                                    <h3 className="text-lg font-semibold text-gray-800">Loading SearchPods...</h3>
                                    <div className="w-full max-w-md">
                                        <Progress value={loadingProgress} className="h-2" />
                                    </div>
                                    <p className="text-sm text-gray-500">{loadingProgress}% complete</p>
                                </div>
                            </div>
                        )}

                        {!isLoadingPods && (
                        <>
                        {/* Trending Section */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-bold text-lg">Trending Now</h3>
                                    <p className="text-gray-500 text-sm">What others are listening to</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {TRENDING.map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => playEpisode(item)}
                                        className="relative flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 group transition-all"
                                    >
                                        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play className="w-4 h-4 text-white" fill="white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-gray-900 text-sm font-medium truncate">{item.title}</h4>
                                            <p className="text-gray-500 text-xs">{item.category}</p>
                                            <div className="flex items-center gap-2 mt-1 text-purple-600 text-xs">
                                                <Users className="w-3 h-3" />
                                                {item.plays.toLocaleString()} plays
                                            </div>
                                        </div>
                                        <AnimatedBars />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Generate */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-gray-500 text-sm">Quick Generate:</span>
                            {QUICK_TOPICS.map((topic) => (
                                <button
                                    key={topic}
                                    onClick={() => playEpisode({ title: topic, category: 'Quick' })}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {topic}
                                </button>
                            ))}
                        </div>

                        {/* Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CATEGORIES.map((cat) => (
                                <div key={cat.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                                    <div 
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                        onClick={() => loadCategoryEpisodes(cat.id)}
                                        style={{ borderLeft: `4px solid ${cat.color}` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                                                <Radio className="w-6 h-6" style={{ color: cat.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-gray-900 font-bold">{cat.name}</h3>
                                                <p className="text-gray-500 text-sm">{cat.episodes} episodes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 hover:text-purple-600">
                                            {loadingCategory === cat.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span className="text-sm">View All</span>
                                                    <ChevronRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {categoryEpisodes[cat.id] && (
                                        <div className="p-4 pt-0 space-y-2">
                                            {categoryEpisodes[cat.id].subtopics?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 py-2">
                                                    <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">All</span>
                                                    {categoryEpisodes[cat.id].subtopics.slice(0, 3).map((sub, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => playEpisode({ title: sub, category: cat.name })}
                                                            className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                                                        >
                                                            {sub}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {categoryEpisodes[cat.id].episodes?.slice(0, 4).map((ep, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => playEpisode({ ...ep, category: cat.name })}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 cursor-pointer group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <Radio className="w-4 h-4 text-gray-500 group-hover:hidden" />
                                                        <Play className="w-4 h-4 text-purple-600 hidden group-hover:block" fill="currentColor" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-gray-900 text-sm font-medium truncate">{ep.title}</h4>
                                                        {ep.description && <p className="text-gray-500 text-xs truncate">{ep.description}</p>}
                                                    </div>
                                                    <span className="text-gray-400 text-xs flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> 2m
                                                    </span>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => playEpisode({ title: `Latest in ${cat.name}`, category: cat.name })}
                                                className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Generate New Episode
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        </>
                        )}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="py-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <a key={i} href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        © 2025 1cPublishing.com
                    </div>
                </div>
            </footer>

            {/* Player Modal */}
            <Dialog open={showPlayer} onOpenChange={() => { stopPlayback(); setShowPlayer(false); }}>
                <DialogContent className="max-w-lg p-0 bg-white border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between mb-6">
                            <button onClick={() => { stopPlayback(); setShowPlayer(false); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                            <span className="text-gray-500 text-sm uppercase tracking-wider">Now Playing</span>
                            <div className="w-6" />
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
                                <Radio className="w-20 h-20 text-white/80" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-gray-900 text-xl font-bold mb-1">{currentEpisode?.title}</h2>
                            <p className="text-purple-600 text-sm">{currentEpisode?.category}</p>
                        </div>

                        {isGenerating && (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                <span className="text-gray-600">Generating podcast...</span>
                            </div>
                        )}

                        {audioError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                                {audioError}
                            </div>
                        )}

                        {/* Live Caption with typing indicator */}
                        <div className="bg-purple-50 rounded-xl p-4 mb-6 min-h-[80px] border border-purple-100">
                            <div className="flex items-start gap-2">
                                {isPlaying && (
                                    <div className="flex gap-1 mt-1">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                )}
                                <p className="flex-1 text-center text-gray-700 leading-relaxed text-sm">{currentCaption}</p>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-700">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <Slider value={[isMuted ? 0 : volume]} max={100} onValueChange={([v]) => { setVolume(v); setIsMuted(false); }} className="flex-1" />
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                            <Slider value={[currentTime]} max={duration || 100} className="w-full" />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-8">
                            <button className="text-gray-400 hover:text-gray-600"><SkipBack className="w-6 h-6" /></button>
                            <button
                                onClick={togglePlay}
                                disabled={isGenerating}
                                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white disabled:opacity-50"
                            >
                                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
                            </button>
                            <button className="text-gray-400 hover:text-gray-600"><SkipForward className="w-6 h-6" /></button>
                        </div>

                        {/* Speed */}
                        <div className="flex justify-center gap-2 mt-6">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`px-3 py-1 rounded-lg text-sm ${playbackSpeed === speed ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}