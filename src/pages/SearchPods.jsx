import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Sparkles, Radio, Loader2, TrendingUp, Users, Mic,
    ChevronRight, X, Clock, Search, Plus, AlertTriangle, Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ERROR_CODES, getErrorCode } from '@/components/ErrorDisplay';

const CATEGORIES = [
    { id: 'technology', name: 'Technology', color: '#10B981', episodes: 16 },
    { id: 'education', name: 'Education', color: '#3B82F6', episodes: 12 },
    { id: 'entertainment', name: 'Entertainment', color: '#EC4899', episodes: 8 },
    { id: 'health', name: 'Health', color: '#F59E0B', episodes: 10 },
    { id: 'business', name: 'Business', color: '#8B5CF6', episodes: 14 },
    { id: 'science', name: 'Science', color: '#06B6D4', episodes: 9 },
    { id: 'morning-boost', name: 'Morning Boost', color: '#FF9800', episodes: 6 },
    { id: 'daily-gratitude', name: 'Daily Gratitude', color: '#E91E63', episodes: 5 },
    { id: 'positive-mindset', name: 'Positive Mindset', color: '#9C27B0', episodes: 7 },
    { id: 'sleep-story', name: 'Sleep Story', color: '#3F51B5', episodes: 8 },
    { id: 'dream-journey', name: 'Dream Journey', color: '#673AB7', episodes: 5 },
    { id: 'calm-night', name: 'Calm Night', color: '#1A237E', episodes: 6 },
    { id: 'health-tip', name: 'Health Tip', color: '#4CAF50', episodes: 10 },
    { id: 'wellness-hack', name: 'Wellness Hack', color: '#00BCD4', episodes: 8 },
    { id: 'mindful-moment', name: 'Mindful Moment', color: '#009688', episodes: 7 },
    { id: 'sunrise-focus', name: 'Sunrise Focus', color: '#FFC107', episodes: 5 },
    { id: 'fresh-start', name: 'Fresh Start', color: '#8BC34A', episodes: 6 },
    { id: 'inner-strength', name: 'Inner Strength', color: '#795548', episodes: 7 },
    { id: 'peaceful-rest', name: 'Peaceful Rest', color: '#607D8B', episodes: 5 },
    { id: 'starry-escape', name: 'Starry Escape', color: '#311B92', episodes: 4 },
    { id: 'night-calm', name: 'Night Calm', color: '#1B5E20', episodes: 6 },
    { id: 'body-balance', name: 'Body Balance', color: '#EF6C00', episodes: 8 },
    { id: 'healthy-habit', name: 'Healthy Habit', color: '#00897B', episodes: 9 },
    { id: 'calm-breath', name: 'Calm Breath', color: '#5C6BC0', episodes: 6 },
    { id: 'vital-energy', name: 'Vital Energy', color: '#F44336', episodes: 7 },
    { id: 'joy-spark', name: 'Joy Spark', color: '#FFEB3B', episodes: 5 },
    { id: 'mind-reset', name: 'Mind Reset', color: '#00ACC1', episodes: 6 },
    { id: 'soul-care', name: 'Soul Care', color: '#AB47BC', episodes: 7 },
    { id: 'sleep-calm', name: 'Sleep Calm', color: '#26A69A', episodes: 5 },
    { id: 'gratitude-glow', name: 'Gratitude Glow', color: '#FF7043', episodes: 6 },
    { id: 'energy-reset', name: 'Energy Reset', color: '#66BB6A', episodes: 7 },
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
    useEffect(() => {
        document.title = 'Search and Ai generated Audio Podcasts';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'SearchPods delivers AI generated audio podcasts, making discovery simple and productivity smarter.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Ai Podcasts, SearchPods');
    }, []);

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
    const [generationError, setGenerationError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentCaption, setCurrentCaption] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [captionWords, setCaptionWords] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    
    // Refs for speech synthesis
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const utteranceRef = useRef(null);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const [useElevenLabs, setUseElevenLabs] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [podImage, setPodImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);

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
        setGenerationError(null);
        setGenerationStep('Researching topic...');
        currentIndexRef.current = 0;
        setPodImage(null);
        setImageLoading(true);
        
        // Generate image in parallel
        base44.integrations.Core.GenerateImage({
            prompt: `Beautiful lifestyle photography for "${episode.title}". Authentic, natural scene with real people or calming environment. Warm lighting, editorial style. No technology, no phones, no computers, no headphones, no microphones, no text or graphics.`
        }).then(result => {
            setPodImage(result.url);
            setImageLoading(false);
        }).catch(err => {
            console.error('Image generation error:', err);
            setImageLoading(false);
        });
        
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
            
            // If using ElevenLabs, generate audio
            if (useElevenLabs) {
                setAudioLoading(true);
                setGenerationStep('Generating natural voice...');
                try {
                    const fullText = sentences.join(' ');
                    const response = await base44.functions.invoke('elevenlabsTTS', { 
                        text: fullText,
                        voice_id: 'EXAVITQu4vr4xnSDxMaL' // Sarah - natural female voice
                    });
                    
                    const blob = new Blob([response.data], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(blob);
                    
                    if (audioRef.current) {
                        audioRef.current.pause();
                        URL.revokeObjectURL(audioRef.current.src);
                    }
                    
                    const audio = new Audio(audioUrl);
                    audioRef.current = audio;
                    
                    audio.onloadedmetadata = () => {
                        setDuration(Math.floor(audio.duration));
                    };
                    
                    audio.ontimeupdate = () => {
                        setCurrentTime(Math.floor(audio.currentTime));
                        // Update caption based on time
                        const progress = audio.currentTime / audio.duration;
                        const sentenceIndex = Math.floor(progress * sentences.length);
                        if (sentenceIndex !== currentIndexRef.current && sentenceIndex < sentences.length) {
                            currentIndexRef.current = sentenceIndex;
                            const text = sentences[sentenceIndex];
                            setCurrentCaption(text);
                            setCaptionWords(text.split(/\s+/));
                            // Estimate word progress within sentence
                            const sentenceProgress = (progress * sentences.length) % 1;
                            const words = text.split(/\s+/);
                            setCurrentWordIndex(Math.floor(sentenceProgress * words.length));
                        }
                    };
                    
                    audio.onended = () => {
                        setIsPlaying(false);
                        isPlayingRef.current = false;
                        setCurrentWordIndex(-1);
                    };
                    
                    setAudioLoading(false);
                    
                    // Auto-start playback
                    setTimeout(() => {
                        audio.play();
                        setIsPlaying(true);
                        isPlayingRef.current = true;
                    }, 300);
                    
                } catch (error) {
                    console.error('ElevenLabs error:', error);
                    setAudioLoading(false);
                    // Fallback to browser TTS
                    setUseElevenLabs(false);
                    setTimeout(() => startSpeaking(), 500);
                }
            } else {
                // Auto-start playback with browser TTS
                setTimeout(() => {
                    startSpeaking();
                }, 500);
            }
            
        } catch (error) {
            console.error('Script generation error:', error);
            const errorCode = getErrorCode(error);
            const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.E500;
            setGenerationError({ code: errorCode, ...errorInfo });
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
        const words = text.split(/\s+/);
        setCaptionWords(words);
        setCurrentWordIndex(-1);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.volume = isMuted ? 0 : volume / 100;
        utterance.pitch = 1;
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        // Word boundary event for highlighting
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const spokenText = text.substring(0, event.charIndex);
                const wordCount = spokenText.split(/\s+/).filter(w => w.length > 0).length;
                setCurrentWordIndex(wordCount);
            }
        };
        
        utterance.onend = () => {
            setCurrentWordIndex(-1);
            currentIndexRef.current++;
            // Update time based on sentence progress
            const progress = currentIndexRef.current / sentencesRef.current.length;
            setCurrentTime(Math.floor(progress * duration));
            
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
            setCurrentWordIndex(-1);
            currentIndexRef.current++;
            if (isPlayingRef.current && currentIndexRef.current < sentencesRef.current.length) {
                setTimeout(() => speakNextSentence(), 200);
            }
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [playbackSpeed, isMuted, volume, selectedVoice, duration]);

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
        if (useElevenLabs && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                isPlayingRef.current = false;
            } else {
                audioRef.current.play();
                setIsPlaying(true);
                isPlayingRef.current = true;
            }
        } else {
            if (isPlaying) {
                stopPlayback();
            } else {
                startSpeaking();
            }
        }
    }, [isPlaying, stopPlayback, startSpeaking, useElevenLabs]);

    // Close player
    const closePlayer = useCallback(() => {
        stopPlayback();
        if (audioRef.current) {
            audioRef.current.pause();
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current = null;
        }
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
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 mb-6">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div>
                            <span className="text-gray-900 font-bold text-lg">SearchPods</span>
                            <p className="text-xs text-gray-500">Generative Podcast</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">

                {/* Trending Section */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
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
                                className="relative flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-white hover:bg-purple-50 border border-gray-100 hover:border-purple-200 group transition-all shadow-sm"
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
                                    <p className="text-gray-500 text-xs capitalize">{item.category}</p>
                                    <div className="flex items-center gap-2 mt-1 text-purple-600 text-xs">
                                        <Users className="w-3 h-3" />
                                        {item.plays.toLocaleString()} plays
                                    </div>
                                </div>
                                <AnimatedBars isPlaying={true} color="#7c3aed" />
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
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-600 border border-gray-200 hover:border-purple-300 transition-all text-sm shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                            {/* Category Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
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
                                            <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-600">All</span>
                                            {categoryData[cat.id].subtopics.slice(0, 3).map((sub, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => { e.stopPropagation(); playEpisode({ title: sub, category: cat.name }); }}
                                                    className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 transition-all"
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                            <button className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Subtopics
                                            </button>
                                        </div>
                                    )}

                                    {/* Episodes */}
                                    {categoryData[cat.id].episodes?.map((ep, i) => (
                                        <div
                                            key={i}
                                            onClick={() => playEpisode({ ...ep, category: cat.name })}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 cursor-pointer group transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                <Radio className="w-4 h-4 text-gray-400 group-hover:hidden" />
                                                <Play className="w-4 h-4 text-purple-600 hidden group-hover:block" fill="currentColor" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-gray-900 text-sm font-medium truncate">{ep.title}</h4>
                                                {ep.description && (
                                                    <p className="text-gray-500 text-xs truncate">{ep.description}</p>
                                                )}
                                            </div>
                                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 2m
                                            </span>
                                        </div>
                                    ))}

                                    {/* Generate More */}
                                    <button
                                        onClick={() => playEpisode({ title: `Latest in ${cat.name}`, category: cat.name })}
                                        className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-600 flex items-center justify-center gap-2 text-sm transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate New Episode
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Player Modal */}
            <Dialog open={showPlayer} onOpenChange={closePlayer}>
                <DialogContent className="max-w-lg p-0 bg-white border-gray-200 overflow-hidden">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={closePlayer} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                            <span className="text-gray-500 text-sm uppercase tracking-wider">Now Playing</span>
                            <div className="w-6" />
                        </div>

                        {/* Album Art */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-56 h-56 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 overflow-hidden">
                                {/* Generated Image Background */}
                                {podImage && (
                                    <img 
                                        src={podImage} 
                                        alt="Podcast cover" 
                                        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                    />
                                )}
                                
                                {/* Image Loading Overlay */}
                                {imageLoading && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-indigo-600/90 flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
                                        <span className="text-white/70 text-xs">Creating artwork...</span>
                                    </div>
                                )}
                                
                                {generationError ? (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-4">
                                        <AlertTriangle className="w-12 h-12 text-white/80" />
                                        <span className="text-white/80 text-xs text-center">{generationError.title}</span>
                                        <Button size="sm" variant="ghost" className="text-white/80 hover:text-white" onClick={() => { setGenerationError(null); playEpisode(currentEpisode); }}>
                                            Retry
                                        </Button>
                                    </div>
                                ) : (isGenerating || audioLoading) && !imageLoading ? (
                                    <div className={`${podImage ? 'absolute inset-0 bg-black/50' : ''} flex flex-col items-center justify-center gap-3`}>
                                        <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
                                        <span className="text-white/80 text-sm">{audioLoading ? 'Generating natural voice...' : generationStep}</span>
                                    </div>
                                ) : !isGenerating && !audioLoading && !imageLoading ? (
                                    <>
                                        {!podImage && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}
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

                        {/* Title */}
                        <div className="text-center mb-4">
                            <h2 className="text-gray-900 text-xl font-bold mb-1 line-clamp-2">{currentEpisode?.title}</h2>
                            <p className="text-purple-600 text-sm">{currentEpisode?.category}</p>
                        </div>

                        {/* Captions - fixed height for 3 lines */}
                        {!isGenerating && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 h-[84px] border border-gray-200 flex items-center justify-center overflow-hidden">
                                <p className="text-center leading-relaxed text-sm line-clamp-3">
                                    {captionWords.length > 0 ? (
                                        captionWords.map((word, idx) => (
                                            <span
                                                key={idx}
                                                className={`transition-colors duration-100 ${
                                                    idx === currentWordIndex 
                                                        ? 'text-purple-600 font-semibold' 
                                                        : idx < currentWordIndex 
                                                            ? 'text-gray-500' 
                                                            : 'text-gray-700'
                                                }`}
                                            >
                                                {word}{idx < captionWords.length - 1 ? ' ' : ''}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-700">{currentCaption}</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Progress - clickable timeline */}
                        <div className="mb-6">
                            <div 
                                className="relative h-1 bg-gray-200 rounded-full cursor-pointer group"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    const newTime = Math.floor(percent * duration);
                                    
                                    if (useElevenLabs && audioRef.current) {
                                        audioRef.current.currentTime = percent * audioRef.current.duration;
                                        setCurrentTime(newTime);
                                    } else {
                                        const newIndex = Math.floor(percent * sentencesRef.current.length);
                                        // Stop current speech and jump to new position
                                        window.speechSynthesis?.cancel();
                                        currentIndexRef.current = Math.max(0, Math.min(newIndex, sentencesRef.current.length - 1));
                                        setCurrentTime(newTime);
                                        
                                        if (isPlayingRef.current) {
                                            setTimeout(() => speakNextSentence(), 100);
                                        } else {
                                            const text = sentencesRef.current[currentIndexRef.current] || '';
                                            setCurrentCaption(text);
                                            setCaptionWords(text.split(/\s+/));
                                            setCurrentWordIndex(-1);
                                        }
                                    }
                                }}
                            >
                                <div 
                                    className="absolute h-full bg-purple-600 rounded-full transition-all"
                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                    style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <button className="text-gray-400 hover:text-gray-600 p-2">
                                <SkipBack className="w-6 h-6" />
                            </button>
                            <button
                                onClick={togglePlay}
                                disabled={isGenerating}
                                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30"
                            >
                                {isPlaying ? (
                                    <Pause className="w-7 h-7" />
                                ) : (
                                    <Play className="w-7 h-7 ml-1" fill="currentColor" />
                                )}
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-2">
                                <SkipForward className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Speed & Volume */}
                        <div className="flex items-center justify-between mt-6 gap-4">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-gray-700">
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={100}
                                    onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
                                    className="w-20"
                                />
                            </div>
                            <div className="flex gap-1">
                                {[0.5, 1, 1.5, 2].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`px-2 py-1 rounded text-xs transition-all ${
                                            playbackSpeed === speed
                                                ? 'bg-purple-600 text-white'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Voice Selection & Download */}
                        <div className="mt-4 flex items-center justify-center gap-4">
                            {voices.length > 1 && (
                                <select
                                    value={selectedVoice?.name || ''}
                                    onChange={(e) => {
                                        const voice = voices.find(v => v.name === e.target.value);
                                        setSelectedVoice(voice);
                                    }}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-700"
                                >
                                    {voices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {useElevenLabs && audioRef.current && !isGenerating && !audioLoading && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = audioRef.current.src;
                                        a.download = `${currentEpisode?.title || 'podcast'}.mp3`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                    Download MP3
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}