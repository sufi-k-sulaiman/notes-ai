import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Sparkles, Radio, Loader2, TrendingUp, Users, Search, Mic,
    Home, Compass, Library, ChevronRight, X, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = [
    { id: 'technology', name: 'Technology', color: '#10B981', episodes: 16 },
    { id: 'education', name: 'Education', color: '#3B82F6', episodes: 12 },
    { id: 'entertainment', name: 'Entertainment', color: '#EC4899', episodes: 8 },
    { id: 'health', name: 'Health', color: '#F59E0B', episodes: 10 },
    { id: 'business', name: 'Business', color: '#8B5CF6', episodes: 14 },
    { id: 'science', name: 'Science', color: '#06B6D4', episodes: 9 },
];

const QUICK_TOPICS = [
    'AI trends', 'Morning motivation', 'Sleep story', 'Health tips', 'World news', 'Book summary'
];

const TRENDING = [
    { title: 'The Psychology of Happiness', category: 'Psychology', plays: 3421, image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=400&h=400&fit=crop' },
    { title: 'The Science of Learning', category: 'Education', plays: 3156, image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop' },
    { title: 'AI Revolution in Industries', category: 'Technology', plays: 2847, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop' },
    { title: 'Startup Playbook', category: 'Business', plays: 2789, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=400&fit=crop' },
    { title: 'Investment Basics', category: 'Finance', plays: 2567, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop' },
    { title: 'Peak Performance', category: 'Sports', plays: 2567, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
];

export default function SearchPods() {
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
    const [activeTab, setActiveTab] = useState('home');
    
    const sentencesRef = useRef([]);
    const currentIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
        return () => {
            window.speechSynthesis?.cancel();
            if (timerRef.current) clearInterval(timerRef.current);
        };
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
        window.speechSynthesis?.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        
        setCurrentEpisode(episode);
        setShowPlayer(true);
        setCurrentTime(0);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsGenerating(true);
        setCurrentCaption('Generating your podcast...');

        try {
            const script = await base44.integrations.Core.InvokeLLM({
                prompt: `Write a 2-minute engaging podcast script about "${episode.title}". 
                Include an intro, 3-4 key points with interesting facts, and a conclusion.
                Write naturally as if speaking to listeners. Be informative and entertaining.`,
                add_context_from_internet: true
            });

            const text = script || `Welcome to this episode about ${episode.title}.`;
            const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 5);
            
            sentencesRef.current = sentences;
            currentIndexRef.current = 0;
            setDuration(sentences.length * 4);
            setIsGenerating(false);
            setCurrentCaption(sentences[0] || 'Ready to play');
            
            // Auto-start
            setTimeout(() => startPlayback(), 300);
        } catch (error) {
            console.error('Error:', error);
            setIsGenerating(false);
            sentencesRef.current = [`Welcome to ${episode.title}.`];
            setCurrentCaption(sentencesRef.current[0]);
            setDuration(10);
        }
    };

    const startPlayback = () => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech not supported');
            return;
        }

        window.speechSynthesis.cancel();
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakNext();
        
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => Math.min(prev + 1, duration));
        }, 1000);
    };

    const speakNext = () => {
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

        utterance.onend = () => {
            currentIndexRef.current++;
            if (isPlayingRef.current) speakNext();
        };

        utterance.onerror = () => {
            currentIndexRef.current++;
            if (isPlayingRef.current) speakNext();
        };

        window.speechSynthesis.speak(utterance);
    };

    const stopPlayback = () => {
        window.speechSynthesis?.cancel();
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            isPlayingRef.current = true;
            setIsPlaying(true);
            speakNext();
            timerRef.current = setInterval(() => setCurrentTime(prev => prev + 1), 1000);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            playEpisode({ title: searchQuery, category: 'Search' });
        }
    };

    const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

    // Animated bars component
    const AnimatedBars = () => (
        <div className="flex items-end h-3 gap-0.5">
            {[1,2,3].map(i => (
                <div key={i} className="w-0.5 bg-emerald-400 rounded-full animate-pulse" 
                    style={{ height: `${4 + Math.random() * 8}px`, animationDelay: `${i * 100}ms` }} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#121318]">
            <div className="pb-24">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#121318]/95 backdrop-blur-sm border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Radio className="w-8 h-8 text-emerald-400" />
                            <span className="text-white font-bold text-xl">SearchPods</span>
                        </div>
                        
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search any topic..."
                                className="w-full pl-12 pr-12 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full"
                            />
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-400 animate-pulse' : 'text-white/40 hover:text-white/60'}`}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
                                    className="relative flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 border border-transparent group"
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
                                        <p className="text-white/50 text-xs">{item.category}</p>
                                        <div className="flex items-center gap-2 mt-1 text-emerald-400/70 text-xs">
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
                        <span className="text-white/50 text-sm">Quick Generate:</span>
                        {QUICK_TOPICS.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => playEpisode({ title: topic, category: 'Quick' })}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-emerald-500/20 text-white/80 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 transition-all text-sm"
                            >
                                <Sparkles className="w-4 h-4" />
                                {topic}
                            </button>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                                <div 
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
                                    onClick={() => loadCategoryEpisodes(cat.id)}
                                    style={{ borderLeft: `4px solid ${cat.color}` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
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
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {categoryEpisodes[cat.id] && (
                                    <div className="p-4 pt-0 space-y-2">
                                        {/* Subtopics */}
                                        {categoryEpisodes[cat.id].subtopics?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 py-2">
                                                <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">All</span>
                                                {categoryEpisodes[cat.id].subtopics.slice(0, 3).map((sub, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => playEpisode({ title: sub, category: cat.name })}
                                                        className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Episodes */}
                                        {categoryEpisodes[cat.id].episodes?.slice(0, 4).map((ep, i) => (
                                            <div
                                                key={i}
                                                onClick={() => playEpisode({ ...ep, category: cat.name })}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <Radio className="w-4 h-4 text-white/50 group-hover:hidden" />
                                                    <Play className="w-4 h-4 text-emerald-400 hidden group-hover:block" fill="currentColor" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white text-sm font-medium truncate">{ep.title}</h4>
                                                    {ep.description && <p className="text-white/40 text-xs truncate">{ep.description}</p>}
                                                </div>
                                                <span className="text-white/30 text-xs flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> 2m
                                                </span>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => playEpisode({ title: `Latest in ${cat.name}`, category: cat.name })}
                                            className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:border-emerald-500/50 hover:text-emerald-400 flex items-center justify-center gap-2 text-sm"
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

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1b21] border-t border-white/10 py-4 px-6">
                    <div className="max-w-md mx-auto flex justify-around">
                        {[
                            { id: 'home', icon: Home, label: 'Home' },
                            { id: 'explore', icon: Compass, label: 'Explore' },
                            { id: 'library', icon: Library, label: 'Library' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-emerald-400' : 'text-white/50'}`}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-xs">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>

            {/* Player Modal */}
            <Dialog open={showPlayer} onOpenChange={() => { stopPlayback(); setShowPlayer(false); }}>
                <DialogContent className="max-w-lg p-0 bg-[#1a1b21] border-white/10 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between mb-6">
                            <button onClick={() => { stopPlayback(); setShowPlayer(false); }} className="text-white/50 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                            <span className="text-white/50 text-sm uppercase tracking-wider">Now Playing</span>
                            <div className="w-6" />
                        </div>

                        {/* Cover */}
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl">
                                <Radio className="w-20 h-20 text-white/80" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-white text-xl font-bold mb-1">{currentEpisode?.title}</h2>
                            <p className="text-emerald-400 text-sm">{currentEpisode?.category}</p>
                        </div>

                        {isGenerating && (
                            <div className="flex items-center justify-center gap-3 py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                                <span className="text-white/60">Generating podcast...</span>
                            </div>
                        )}

                        {/* Caption */}
                        <div className="bg-white/5 rounded-xl p-4 mb-6 min-h-[80px] flex items-center justify-center border border-white/10">
                            <p className="text-center text-white/80 leading-relaxed text-sm">{currentCaption}</p>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setIsMuted(!isMuted)}>
                                {isMuted ? <VolumeX className="w-5 h-5 text-white/50" /> : <Volume2 className="w-5 h-5 text-white/50" />}
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
                            <button className="text-white/50 hover:text-white"><SkipBack className="w-6 h-6" /></button>
                            <button
                                onClick={togglePlay}
                                disabled={isGenerating}
                                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white disabled:opacity-50"
                            >
                                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" fill="currentColor" />}
                            </button>
                            <button className="text-white/50 hover:text-white"><SkipForward className="w-6 h-6" /></button>
                        </div>

                        {/* Speed */}
                        <div className="flex justify-center gap-2 mt-6">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`px-3 py-1 rounded-lg text-sm ${playbackSpeed === speed ? 'bg-emerald-500 text-white' : 'text-white/50 hover:bg-white/10'}`}
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