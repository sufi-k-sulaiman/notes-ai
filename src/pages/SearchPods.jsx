import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, FileText, Music,
    Sparkles, Radio, Loader2, TrendingUp, Users, Mic, ChevronDown,
    ChevronRight, X, Clock, Search, Plus, AlertTriangle
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

const ALL_TRENDING = [
    { title: 'The Psychology of Happiness', category: 'Psychology', plays: 3421, image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=400&h=400&fit=crop' },
    { title: 'The Science of Learning', category: 'Education', plays: 3156, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop' },
    { title: 'AI Revolution in Industries', category: 'Technology', plays: 2847, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop' },
    { title: 'Startup Playbook', category: 'Startups', plays: 2789, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop' },
    { title: 'Investment Basics', category: 'Finance', plays: 2567, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop' },
    { title: 'Peak Performance', category: 'Sports', plays: 2567, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
    { title: 'Mindfulness Meditation', category: 'Wellness', plays: 2234, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop' },
    { title: 'Creative Writing Tips', category: 'Arts', plays: 1987, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop' },
    { title: 'Healthy Eating Habits', category: 'Health', plays: 2654, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop' },
    { title: 'Leadership Skills', category: 'Business', plays: 2345, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop' },
    { title: 'Space Exploration', category: 'Science', plays: 2890, image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=400&fit=crop' },
    { title: 'Music Theory Basics', category: 'Music', plays: 1756, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop' },
];

const getRandomTrending = () => {
    const shuffled = [...ALL_TRENDING].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
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
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const [isDownloadingMp3, setIsDownloadingMp3] = useState(false);
    
    // Refs for speech synthesis
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const utteranceRef = useRef(null);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const [podImage, setPodImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [trending, setTrending] = useState(getRandomTrending);

    // Auto-refresh trending every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTrending(getRandomTrending());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Load voices - filter for quality voices only
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis?.getVoices() || [];
            
            // Whitelist of known good quality voices - include all Google variants
            const goodVoiceNames = [
                'samantha', 'alex', 'victoria', 'karen', 'daniel', 'moira', 'tessa', 'fiona',
                'google us', 'google uk', 'google australia', 'google india', 'google',
                'microsoft', 'zira', 'david', 'mark', 'hazel', 'susan', 'george',
                'catherine', 'arthur', 'martha', 'native', 'premium', 'enhanced', 'neural'
            ];
            
            // Blacklist of novelty/broken voices
            const badVoicePatterns = [
                'whisper', 'wobble', 'zarvox', 'boing', 'bells', 'bad news', 'good news',
                'bubbles', 'cellos', 'deranged', 'hysterical', 'organ', 'trinoids', 'princess',
                'pipe', 'ralph', 'superstar', 'junior', 'albert', 'fred', 'kathy', 'bruce',
                'agnes', 'bahh', 'jester', 'novelty', 'effect', 'robot', 'alien'
            ];
            
            const qualityVoices = availableVoices.filter(v => {
                const isEnglish = v.lang.startsWith('en');
                const nameLower = v.name.toLowerCase();
                
                // Check blacklist
                const isNovelty = badVoicePatterns.some(pattern => nameLower.includes(pattern));
                if (isNovelty) return false;
                
                // Prefer whitelisted or default voices
                const isGood = goodVoiceNames.some(name => nameLower.includes(name)) || v.default;
                
                return isEnglish && (isGood || v.localService);
            });
            
            // Keep all Google voices (don't deduplicate them) but deduplicate others
            const uniqueVoices = [];
            const seenNames = new Set();
            for (const voice of qualityVoices) {
                const nameLower = voice.name.toLowerCase();
                // Keep all Google voice variants
                if (nameLower.includes('google')) {
                    uniqueVoices.push(voice);
                } else {
                    const simpleName = voice.name.split('(')[0].trim();
                    if (!seenNames.has(simpleName)) {
                        seenNames.add(simpleName);
                        uniqueVoices.push(voice);
                    }
                }
            }
            
            // Sort: premium/enhanced first, then by name
            uniqueVoices.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aScore = (aName.includes('premium') || aName.includes('enhanced') || aName.includes('neural')) ? 0 : 1;
                const bScore = (bName.includes('premium') || bName.includes('enhanced') || bName.includes('neural')) ? 0 : 1;
                if (aScore !== bScore) return aScore - bScore;
                return a.name.localeCompare(b.name);
            });
            
            setVoices(uniqueVoices);
            if (uniqueVoices.length > 0 && !selectedVoice) {
                // Prefer Google UK English Female, then Google US, then first available
                const preferred = uniqueVoices.find(v => v.name.toLowerCase().includes('google uk english female'))
                    || uniqueVoices.find(v => v.name.toLowerCase().includes('google uk') && v.name.toLowerCase().includes('female'))
                    || uniqueVoices.find(v => v.name.toLowerCase().includes('google') && v.lang === 'en-GB')
                    || uniqueVoices.find(v => v.name.toLowerCase().includes('google us'))
                    || uniqueVoices.find(v => v.name.toLowerCase().includes('google'))
                    || uniqueVoices[0];
                setSelectedVoice(preferred);
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
            prompt: `Beautiful lifestyle photography representing "${episode.title}". Authentic, natural scene with real people or calming environment. Warm lighting, editorial style, professional DSLR quality. No technology devices, no phones, no computers, no headphones, no microphones, no screens. Absolutely no text, no words, no letters, no titles, no captions, no watermarks, no logos, no URLs.`
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
Use short sentences for better pacing. Do NOT use any markdown formatting.
Do NOT mention any websites, URLs, or external references in the audio script.`
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
            
            // Auto-start playback with browser TTS
            setTimeout(() => {
                startSpeaking();
            }, 500);
            
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
        if (isPlaying) {
            stopPlayback();
        } else {
            startSpeaking();
        }
    }, [isPlaying, stopPlayback, startSpeaking]);

    // Download Text Script
    const downloadText = () => {
        try {
            const fullScript = sentencesRef.current.join(' ');
            const blob = new Blob([fullScript], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_')}_script.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        }
    };

    // Download MP3 using ElevenLabs TTS
    const downloadMp3 = async () => {
        if (!sentencesRef.current.length) return;
        setIsDownloadingMp3(true);
        
        try {
            const fullScript = sentencesRef.current.join(' ');
            
            // Call ElevenLabs TTS backend function
            const response = await base44.functions.invoke('elevenlabsTTS', { 
                text: fullScript,
                voice_id: 'EXAVITQu4vr4xnSDxMaL'
            });
            
            // The response.data contains base64 audio
            if (response.data?.audio) {
                // Decode base64 to binary
                const binaryString = atob(response.data.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentEpisode.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else if (response.data?.error) {
                throw new Error(response.data.error);
            }
        } catch (err) {
            console.error('MP3 download error:', err);
            alert('MP3 download failed: ' + (err.message || 'Unknown error'));
        } finally {
            setIsDownloadingMp3(false);
        }
    };

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
            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-8">

                {/* Trending Section */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <span className="text-gray-900 font-bold text-2xl md:text-3xl">SearchPods</span>
                            <p className="text-xs text-gray-500">Generative Podcast</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trending.map((item, i) => (
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
                                ) : isGenerating && !imageLoading ? (
                                    <div className={`${podImage ? 'absolute inset-0 bg-black/50' : ''} flex flex-col items-center justify-center gap-3`}>
                                        <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
                                        <span className="text-white/80 text-sm">{generationStep}</span>
                                    </div>
                                ) : !isGenerating && !imageLoading ? (
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
                                className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    const newTime = Math.floor(percent * duration);
                                    const newIndex = Math.floor(percent * sentencesRef.current.length);
                                    
                                    // Stop current speech and jump to new position
                                    window.speechSynthesis?.cancel();
                                    currentIndexRef.current = Math.max(0, Math.min(newIndex, sentencesRef.current.length - 1));
                                    setCurrentTime(newTime);
                                    
                                    const text = sentencesRef.current[currentIndexRef.current] || '';
                                    setCurrentCaption(text);
                                    setCaptionWords(text.split(/\s+/));
                                    setCurrentWordIndex(-1);
                                    
                                    if (isPlayingRef.current) {
                                        setTimeout(() => speakNextSentence(), 100);
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
                        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                            {/* Voice Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Mic className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-gray-700">{selectedVoice?.name?.split(' ')[0] || 'Voice'}</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>
                                {showVoiceMenu && voices.length > 0 && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        {voices.map((voice, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { 
                                                    setSelectedVoice(voice); 
                                                    setShowVoiceMenu(false);
                                                    // If currently playing, restart with new voice from current sentence
                                                    if (isPlayingRef.current) {
                                                        window.speechSynthesis?.cancel();
                                                        setTimeout(() => speakNextSentence(), 100);
                                                    }
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors ${selectedVoice?.name === voice.name ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                                            >
                                                {voice.name.split('(')[0].trim()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Text Download */}
                            <button 
                                onClick={downloadText}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-50 transition-colors"
                                title="Download Script"
                            >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Text</span>
                            </button>
                            
                            {/* MP3 Download */}
                            <button 
                                onClick={downloadMp3}
                                disabled={isGenerating || isDownloadingMp3}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-600 disabled:opacity-50 transition-colors"
                                title="Download MP3"
                            >
                                {isDownloadingMp3 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                                <span className="text-sm">MP3</span>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}