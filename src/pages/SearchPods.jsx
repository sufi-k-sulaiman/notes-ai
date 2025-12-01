import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music,
    Sparkles, Radio, Loader2, TrendingUp, Users, Mic, ChevronDown,
    ChevronRight, X, Clock, Plus, AlertTriangle, RotateCcw, RotateCw,
    ListMusic, Sliders, Eye, MessageSquarePlus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ERROR_CODES, getErrorCode } from '@/components/ErrorDisplay';

const CATEGORIES = [
    { id: 'hope', name: 'Hope', color: '#10B981', episodes: 8 },
    { id: 'courage', name: 'Courage', color: '#EF4444', episodes: 10 },
    { id: 'confidence', name: 'Confidence', color: '#F59E0B', episodes: 9 },
    { id: 'success', name: 'Success', color: '#8B5CF6', episodes: 12 },
    { id: 'growth', name: 'Growth', color: '#22C55E', episodes: 11 },
    { id: 'resilience', name: 'Resilience', color: '#3B82F6', episodes: 8 },
    { id: 'determination', name: 'Determination', color: '#DC2626', episodes: 9 },
    { id: 'passion', name: 'Passion', color: '#EC4899', episodes: 7 },
    { id: 'gratitude', name: 'Gratitude', color: '#F97316', episodes: 10 },
    { id: 'optimism', name: 'Optimism', color: '#FBBF24', episodes: 8 },
    { id: 'focus', name: 'Focus', color: '#6366F1', episodes: 9 },
    { id: 'discipline', name: 'Discipline', color: '#64748B', episodes: 11 },
    { id: 'mindfulness', name: 'Mindfulness', color: '#14B8A6', episodes: 10 },
    { id: 'vision', name: 'Vision', color: '#A855F7', episodes: 7 },
    { id: 'purpose', name: 'Purpose', color: '#0EA5E9', episodes: 9 },
    { id: 'balance', name: 'Balance', color: '#84CC16', episodes: 8 },
    { id: 'clarity', name: 'Clarity', color: '#06B6D4', episodes: 7 },
    { id: 'drive', name: 'Drive', color: '#E11D48', episodes: 10 },
    { id: 'ambition', name: 'Ambition', color: '#7C3AED', episodes: 9 },
    { id: 'persistence', name: 'Persistence', color: '#059669', episodes: 8 },
    { id: 'momentum', name: 'Momentum', color: '#2563EB', episodes: 7 },
    { id: 'progress', name: 'Progress', color: '#16A34A', episodes: 11 },
    { id: 'breakthrough', name: 'Breakthrough', color: '#D946EF', episodes: 6 },
    { id: 'achievement', name: 'Achievement', color: '#CA8A04', episodes: 10 },
    { id: 'triumph', name: 'Triumph', color: '#B91C1C', episodes: 7 },
    { id: 'empowerment', name: 'Empowerment', color: '#9333EA', episodes: 9 },
    { id: 'leadership', name: 'Leadership', color: '#1D4ED8', episodes: 12 },
    { id: 'creativity', name: 'Creativity', color: '#DB2777', episodes: 8 },
    { id: 'innovation', name: 'Innovation', color: '#0891B2', episodes: 10 },
    { id: 'excellence', name: 'Excellence', color: '#7E22CE', episodes: 9 },
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
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [showEqualizer, setShowEqualizer] = useState(false);
    const [showBraille, setShowBraille] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    
    // Refs for audio playback
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
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

    // ElevenLabs voice options
    useEffect(() => {
        // Set up simplified voice options for ElevenLabs
        const elevenLabsVoices = [
            { name: 'UK Female', voice_id: 'EXAVITQu4vr4xnSDxMaL' }, // Sarah
            { name: 'UK Male', voice_id: 'TX3LPaxmHKxFdv7VOQHJ' }, // Liam
            { name: 'US', voice_id: '21m00Tcm4TlvDq8ikWAM' } // Rachel
        ];
        setVoices(elevenLabsVoices);
        setSelectedVoice(elevenLabsVoices[0]);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
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
            
            setGenerationStep('Generating audio...');

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
            setCurrentCaption(sentences[0] || 'Ready to play');

            // Generate audio using ElevenLabs
            const voiceId = selectedVoice?.voice_id || 'EXAVITQu4vr4xnSDxMaL';
            const response = await base44.functions.invoke('elevenlabsTTS', { 
                text: cleanText,
                voice_id: voiceId
            });

            if (response.data?.audio) {
                // Decode base64 to binary
                const binaryString = atob(response.data.audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Clean up previous audio URL
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                }

                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(blob);
                audioUrlRef.current = audioUrl;

                // Create audio element
                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                audio.onloadedmetadata = () => {
                    setDuration(audio.duration);
                };

                audio.ontimeupdate = () => {
                    setCurrentTime(audio.currentTime);
                    // Update caption based on time
                    const progress = audio.currentTime / audio.duration;
                    const sentenceIndex = Math.floor(progress * sentences.length);
                    if (sentenceIndex !== currentIndexRef.current && sentenceIndex < sentences.length) {
                        currentIndexRef.current = sentenceIndex;
                        setCurrentCaption(sentences[sentenceIndex]);
                        setCaptionWords(sentences[sentenceIndex].split(/\s+/));
                    }
                };

                audio.onended = () => {
                    isPlayingRef.current = false;
                    setIsPlaying(false);
                };

                audio.volume = volume / 100;
                audio.playbackRate = playbackSpeed;

                setIsGenerating(false);

                // Auto-start playback
                setTimeout(() => {
                    audio.play();
                    isPlayingRef.current = true;
                    setIsPlaying(true);
                }, 300);
            } else {
                throw new Error(response.data?.error || 'Failed to generate audio');
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

    // Stop playback
    const stopPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        isPlayingRef.current = false;
        setIsPlaying(false);
    }, []);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            isPlayingRef.current = false;
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            isPlayingRef.current = true;
            setIsPlaying(true);
        }
    }, [isPlaying]);

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

    // Skip forward/backward
    const skipForward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, audioRef.current.duration);
    };

    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    };

    // Load recommendations based on current episode
    const loadRecommendations = async () => {
        if (!currentEpisode) return;
        setShowRecommendations(true);
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Based on someone listening to "${currentEpisode.title}" in the ${currentEpisode.category} category, suggest 5 related podcast topics they might enjoy. Make them diverse but related.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    category: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setRecommendations(response?.recommendations || []);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            setRecommendations([
                { title: `More ${currentEpisode.category}`, category: currentEpisode.category, reason: 'Similar topic' },
                { title: 'Trending Now', category: 'Popular', reason: 'What others are listening to' }
            ]);
        }
    };

    // Extend the podcast content
    const extendPodcast = async () => {
        if (!currentEpisode || isExtending) return;
        setIsExtending(true);
        
        try {
            const currentContent = sentencesRef.current.join(' ');
            
            const response = await base44.integrations.Core.InvokeLLM({
                                prompt: `Continue this podcast about "${currentEpisode.title}". Here's what was covered so far (summary): "${currentContent.substring(0, 500)}..."

                                Write 12 more paragraphs (about 5 minutes worth) expanding on the topic with new insights, examples, stories, or related points. Keep the same conversational tone. Do NOT use markdown formatting.`,
                                add_context_from_internet: true
                            });
            
            const cleanText = cleanTextForSpeech(response || '');
            const newSentences = cleanText
                .replace(/\n+/g, ' ')
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s.length > 3);
            
            if (newSentences.length > 0) {
                sentencesRef.current = [...sentencesRef.current, ...newSentences];
                setDuration(sentencesRef.current.length * 3);
            }
        } catch (error) {
            console.error('Error extending podcast:', error);
        } finally {
            setIsExtending(false);
        }
    };

    // Convert text to Braille
    const toBraille = (text) => {
        const brailleMap = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
            'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
            'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
            'y': '⠽', 'z': '⠵', ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', "'": '⠄',
            '-': '⠤', '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖',
            '7': '⠶', '8': '⠦', '9': '⠔'
        };
        return text.toLowerCase().split('').map(c => brailleMap[c] || c).join('');
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
                            <div className="mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 h-[84px] border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {showBraille ? (
                                        <p className="text-center leading-relaxed text-lg font-mono text-gray-700 line-clamp-3">
                                            {toBraille(currentCaption)}
                                        </p>
                                    ) : (
                                        <p className="text-center leading-relaxed text-sm line-clamp-3">
                                            {captionWords.length > 0 ? (
                                                captionWords.map((word, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`transition-all duration-150 ${
                                                            idx === currentWordIndex 
                                                                ? 'text-purple-600 font-bold bg-purple-100 px-1 py-0.5 rounded' 
                                                                : idx < currentWordIndex 
                                                                    ? 'text-gray-400' 
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
                                    )}
                                </div>
                                {/* Tell me more button */}
                                <button
                                    onClick={extendPodcast}
                                    disabled={isExtending || isGenerating}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {isExtending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Extending podcast...
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquarePlus className="w-4 h-4" />
                                            Tell me more
                                        </>
                                    )}
                                </button>
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
                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={skipBackward}
                                disabled={isGenerating}
                                className="text-gray-400 hover:text-gray-600 p-2 flex flex-col items-center disabled:opacity-50"
                            >
                                <RotateCcw className="w-6 h-6" />
                                <span className="text-xs mt-0.5">15s</span>
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

                            <button 
                                onClick={skipForward}
                                disabled={isGenerating}
                                className="text-gray-400 hover:text-gray-600 p-2 flex flex-col items-center disabled:opacity-50"
                            >
                                <RotateCw className="w-6 h-6" />
                                <span className="text-xs mt-0.5">30s</span>
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
                                    onValueChange={([v]) => { 
                                        setVolume(v); 
                                        setIsMuted(v === 0);
                                        // Update current utterance volume if playing
                                        if (utteranceRef.current && window.speechSynthesis.speaking) {
                                            window.speechSynthesis.cancel();
                                            if (isPlayingRef.current) {
                                                setTimeout(() => speakNextSentence(), 100);
                                            }
                                        }
                                    }}
                                    className="w-20"
                                />
                                <span className="text-xs text-gray-400 w-8">{volume}%</span>
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

                        {/* Voice Selection - Simplified */}
                        {voices.length > 0 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {(() => {
                                    // Create simplified voice options
                                    const ukFemale = voices.find(v => 
                                        (v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('kingdom')) && 
                                        v.name.toLowerCase().includes('female')
                                    ) || voices.find(v => v.name === 'Google UK English Female') || voices.find(v => v.name.toLowerCase().includes('female'));
                                    
                                    const ukMale = voices.find(v => 
                                        (v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('kingdom')) && 
                                        v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female')
                                    ) || voices.find(v => v.name === 'Google UK English Male');
                                    
                                    const usFemale = voices.find(v => 
                                        (v.name.toLowerCase().includes('us') || v.name.toLowerCase().includes('states')) && 
                                        v.name.toLowerCase().includes('female')
                                    ) || voices.find(v => v.name === 'Google US English') || voices.find(v => v.name === 'Samantha');
                                    
                                    const voiceOptions = [
                                        { label: 'UK Female', voice: ukFemale },
                                        { label: 'UK Male', voice: ukMale },
                                        { label: 'US', voice: usFemale }
                                    ].filter(opt => opt.voice);
                                    
                                    return voiceOptions.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { 
                                                setSelectedVoice(opt.voice); 
                                                if (isPlayingRef.current) {
                                                    window.speechSynthesis?.cancel();
                                                    setTimeout(() => speakNextSentence(), 100);
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                selectedVoice?.name === opt.voice.name 
                                                    ? 'bg-purple-600 text-white' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ));
                                })()}
                            </div>
                        )}

                        {/* Options Row */}
                        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                            <button 
                                onClick={() => setShowBraille(!showBraille)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    showBraille 
                                        ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600'
                                }`}
                            >
                                <Eye className="w-4 h-4" />
                                Braille
                            </button>
                            <button 
                                onClick={loadRecommendations}
                                disabled={isGenerating}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    showRecommendations 
                                        ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600'
                                } disabled:opacity-50`}
                            >
                                <ListMusic className="w-4 h-4" />
                                Recommended
                            </button>
                        </div>
                    </div>

                    {/* Recommendations Drawer */}
                    {showRecommendations && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-700">Recommended For You</h4>
                                <button 
                                    onClick={() => setShowRecommendations(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {recommendations.length === 0 ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recommendations.map((rec, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setShowRecommendations(false);
                                                playEpisode({ title: rec.title, category: rec.category });
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-white hover:bg-purple-50 border border-gray-100 hover:border-purple-200 transition-all text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                <Radio className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{rec.title}</p>
                                                <p className="text-xs text-gray-500">{rec.reason || rec.category}</p>
                                            </div>
                                            <Play className="w-4 h-4 text-purple-600" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}