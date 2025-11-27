import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Sparkles, Radio, Loader2, TrendingUp, Users, Mic,
    ChevronRight, X, Clock, Search, Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

const CATEGORIES = [
    { id: 'technology', name: 'Technology', color: '#10B981', episodes: 16 },
    { id: 'education', name: 'Education', color: '#3B82F6', episodes: 12 },
    { id: 'entertainment', name: 'Entertainment', color: '#EC4899', episodes: 8 },
    { id: 'health', name: 'Health', color: '#F59E0B', episodes: 10 },
    { id: 'business', name: 'Business', color: '#8B5CF6', episodes: 14 },
    { id: 'science', name: 'Science', color: '#06B6D4', episodes: 9 },
];

const QUICK_TOPICS = ['AI trends', 'Morning motivation', 'Sleep story', 'Health tips', 'World news', 'Book summary'];

const TRENDING = [
    { title: 'The Psychology of Happiness', category: 'Psychology', plays: 3421, image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=400&h=400&fit=crop' },
    { title: 'The Science of Learning', category: 'Education', plays: 3156, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop' },
    { title: 'AI Revolution in Industries', category: 'Technology', plays: 2847, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop' },
    { title: 'Startup Playbook', category: 'Startups', plays: 2789, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop' },
    { title: 'Investment Basics', category: 'Finance', plays: 2567, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop' },
    { title: 'Peak Performance', category: 'Sports', plays: 2567, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
];

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

export default function SearchPods() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryData, setCategoryData] = useState({});
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(null);
    
    // Player state
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentCaption, setCurrentCaption] = useState('');
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    
    // Refs for speech synthesis
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const utteranceRef = useRef(null);
    const timerRef = useRef(null);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis?.getVoices() || [];
            const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
            setVoices(englishVoices);
            if (englishVoices.length > 0 && !selectedVoice) {
                setSelectedVoice(englishVoices[0]);
            }
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

    // Load category episodes
    const loadCategory = async (categoryId) => {
        if (categoryData[categoryId]) {
            setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
            return;
        }
        
        setLoadingCategory(categoryId);
        setExpandedCategory(categoryId);
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 4 podcast episode ideas for the "${categoryId}" category. Each should have a compelling title and brief description. Also suggest 4 subtopics for filtering.`,
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
            
            setCategoryData(prev => ({
                ...prev,
                [categoryId]: {
                    episodes: response?.episodes || [],
                    subtopics: response?.subtopics || [],
                    activeFilter: 'All'
                }
            }));
        } catch (error) {
            console.error('Error loading category:', error);
        } finally {
            setLoadingCategory(null);
        }
    };

    // Play episode with TTS
    const playEpisode = async (episode) => {
        // Cancel any existing speech
        window.speechSynthesis?.cancel();
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
        setGenerationStep('Researching topic...');
        currentIndexRef.current = 0;
        
        try {
            setGenerationStep('Writing script...');
            
            const script = await base44.integrations.Core.InvokeLLM({
                prompt: `Write a 2-3 minute engaging podcast script about "${episode.title}". 
                
Structure:
1. Warm greeting and topic introduction (2-3 sentences)
2. 3-4 key points with interesting facts and insights
3. Brief conclusion with takeaway

Write naturally as if speaking to a listener. Be informative and engaging. 
Use short sentences for better pacing. Do NOT use any markdown formatting.`,
                add_context_from_internet: true
            });
            
            setGenerationStep('Preparing audio...');
            
            const rawText = script || `Welcome to this episode about ${episode.title}. Let me share some fascinating insights with you today.`;
            const cleanText = cleanTextForSpeech(rawText);
            
            // Split into sentences for caption sync
            const sentences = cleanText
                .replace(/\n+/g, ' ')
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 3);
            
            if (sentences.length === 0) {
                sentences.push(`Welcome to ${episode.title}. This is an exciting topic to explore.`);
            }
            
            sentencesRef.current = sentences;
            currentIndexRef.current = 0;
            
            // Estimate duration (average 3 seconds per sentence)
            setDuration(sentences.length * 3);
            setIsGenerating(false);
            setCurrentCaption(sentences[0] || 'Ready to play');
            
            // Auto-start playback after a brief delay
            setTimeout(() => {
                startSpeaking();
            }, 500);
            
        } catch (error) {
            console.error('Script generation error:', error);
            setIsGenerating(false);
            sentencesRef.current = [`Welcome to ${episode.title}. This is an exciting topic.`];
            setCurrentCaption(sentencesRef.current[0]);
            setDuration(10);
        }
    };

    // Start speaking
    const startSpeaking = useCallback(() => {
        if (!('speechSynthesis' in window)) {
            setCurrentCaption('Text-to-speech is not supported in your browser.');
            return;
        }
        
        window.speechSynthesis.cancel();
        isPlayingRef.current = true;
        setIsPlaying(true);
        
        speakNextSentence();
        
        // Start timer for progress
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
                if (prev >= duration) {
                    clearInterval(timerRef.current);
                    return duration;
                }
                return prev + 1;
            });
        }, 1000);
    }, [duration]);

    // Speak next sentence
    const speakNextSentence = useCallback(() => {
        if (!isPlayingRef.current) return;
        
        if (currentIndexRef.current >= sentencesRef.current.length) {
            stopPlayback();
            return;
        }
        
        const text = sentencesRef.current[currentIndexRef.current];
        setCurrentCaption(text);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.volume = isMuted ? 0 : volume / 100;
        utterance.pitch = 1;
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => {
            currentIndexRef.current++;
            if (isPlayingRef.current && currentIndexRef.current < sentencesRef.current.length) {
                setTimeout(() => speakNextSentence(), 200);
            } else if (currentIndexRef.current >= sentencesRef.current.length) {
                stopPlayback();
            }
        };
        
        utterance.onerror = (event) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.error('Speech error:', event.error);
            }
            currentIndexRef.current++;
            if (isPlayingRef.current && currentIndexRef.current < sentencesRef.current.length) {
                setTimeout(() => speakNextSentence(), 200);
            }
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [playbackSpeed, isMuted, volume, selectedVoice]);

    // Stop playback
    const stopPlayback = useCallback(() => {
        window.speechSynthesis?.cancel();
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startSpeaking();
        }
    }, [isPlaying, stopPlayback, startSpeaking]);

    // Close player
    const closePlayer = useCallback(() => {
        stopPlayback();
        setShowPlayer(false);
        setCurrentEpisode(null);
    }, [stopPlayback]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            playEpisode({ title: searchQuery, category: 'Search' });
        }
    };

    return (
        <div className="min-h-screen bg-[#121318] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Search Bar */}
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <Radio className="w-8 h-8 text-emerald-400" />
                    </div>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search any topic..."
                            className="w-full pl-12 pr-12 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full focus:border-emerald-500"
                        />
                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                            <Mic className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Trending Section */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Trending Now</h3>
                            <p className="text-white/50 text-sm">What others are listening to</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TRENDING.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => playEpisode(item)}
                                className="relative flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 border border-transparent group transition-all"
                            >
                                <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70'}`}>
                                    {i + 1}
                                </div>
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="w-4 h-4 text-white" fill="white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
                                    <p className="text-white/50 text-xs capitalize">{item.category}</p>
                                    <div className="flex items-center gap-2 mt-1 text-emerald-400/70 text-xs">
                                        <Users className="w-3 h-3" />
                                        {item.plays.toLocaleString()} plays
                                    </div>
                                </div>
                                <AnimatedBars isPlaying={true} color="#10B981" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Generate */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white/50 text-sm">Quick Generate:</span>
                    {QUICK_TOPICS.map((topic) => (
                        <button
                            key={topic}
                            onClick={() => playEpisode({ title: topic, category: 'Quick' })}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 transition-all text-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                            {/* Category Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                                onClick={() => loadCategory(cat.id)}
                                style={{ borderLeft: `4px solid ${cat.color}` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${cat.color}20` }}
                                    >
                                        <Radio className="w-6 h-6" style={{ color: cat.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{cat.name}</h3>
                                        <p className="text-white/50 text-sm">{cat.episodes} episodes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white/50 hover:text-emerald-400">
                                    {loadingCategory === cat.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-sm">View All</span>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategory === cat.id ? 'rotate-90' : ''}`} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedCategory === cat.id && categoryData[cat.id] && (
                                <div className="p-4 pt-0 space-y-3">
                                    {/* Subtopic Filters */}
                                    {categoryData[cat.id].subtopics?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 py-2">
                                            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">All</span>
                                            {categoryData[cat.id].subtopics.slice(0, 3).map((sub, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => playEpisode({ title: sub, category: cat.name })}
                                                    className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                            <button className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/60 hover:text-white flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Subtopics
                                            </button>
                                        </div>
                                    )}

                                    {/* Episodes */}
                                    {categoryData[cat.id].episodes?.map((ep, i) => (
                                        <div
                                            key={i}
                                            onClick={() => playEpisode({ ...ep, category: cat.name })}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-emerald-500/10 cursor-pointer group transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Radio className="w-4 h-4 text-white/50 group-hover:hidden" />
                                                <Play className="w-4 h-4 text-emerald-400 hidden group-hover:block" fill="currentColor" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white text-sm font-medium truncate">{ep.title}</h4>
                                                {ep.description && (
                                                    <p className="text-white/50 text-xs truncate">{ep.description}</p>
                                                )}
                                            </div>
                                            <span className="text-white/30 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 2m
                                            </span>
                                        </div>
                                    ))}

                                    {/* Generate More */}
                                    <button
                                        onClick={() => playEpisode({ title: `Latest in ${cat.name}`, category: cat.name })}
                                        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:border-emerald-500/50 hover:text-emerald-400 flex items-center justify-center gap-2 text-sm transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate New Episode
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Modal */}
            <Dialog open={showPlayer} onOpenChange={closePlayer}>
                <DialogContent className="max-w-lg p-0 bg-[#1a1b21] border-white/10 overflow-hidden">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={closePlayer} className="text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                            <span className="text-white/50 text-sm uppercase tracking-wider">Now Playing</span>
                            <div className="w-6" />
                        </div>

                        {/* Album Art */}
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                {isGenerating ? (
                                    <Loader2 className="w-16 h-16 text-white/80 animate-spin" />
                                ) : (
                                    <Radio className="w-20 h-20 text-white/80" />
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-white text-xl font-bold mb-1">{currentEpisode?.title}</h2>
                            <p className="text-emerald-400 text-sm">{currentEpisode?.category}</p>
                        </div>

                        {/* Generation Status */}
                        {isGenerating && (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                                <span className="text-white/60">{generationStep}</span>
                            </div>
                        )}

                        {/* Captions */}
                        <div className="bg-white/5 rounded-xl p-4 mb-6 min-h-[80px] border border-white/10">
                            <div className="flex items-start gap-2">
                                {isPlaying && (
                                    <div className="flex gap-1 mt-1">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                )}
                                <p className="flex-1 text-center text-white/80 leading-relaxed text-sm">
                                    {currentCaption}
                                </p>
                            </div>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-3 mb-4">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={100}
                                onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
                                className="flex-1"
                            />
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                            <Slider value={[currentTime]} max={duration || 100} className="w-full" />
                            <div className="flex justify-between text-xs text-white/40 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-8">
                            <button className="text-white/40 hover:text-white">
                                <SkipBack className="w-6 h-6" />
                            </button>
                            <button
                                onClick={togglePlay}
                                disabled={isGenerating}
                                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white disabled:opacity-50 transition-all"
                            >
                                {isPlaying ? (
                                    <Pause className="w-7 h-7" />
                                ) : (
                                    <Play className="w-7 h-7 ml-1" fill="currentColor" />
                                )}
                            </button>
                            <button className="text-white/40 hover:text-white">
                                <SkipForward className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Speed Controls */}
                        <div className="flex justify-center gap-2 mt-6">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                                        playbackSpeed === speed
                                            ? 'bg-emerald-500 text-white'
                                            : 'text-white/50 hover:bg-white/10'
                                    }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        {/* Voice Selection */}
                        {voices.length > 1 && (
                            <div className="mt-4 flex justify-center">
                                <select
                                    value={selectedVoice?.name || ''}
                                    onChange={(e) => {
                                        const voice = voices.find(v => v.name === e.target.value);
                                        setSelectedVoice(voice);
                                    }}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white/70"
                                >
                                    {voices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}