import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    GraduationCap, Trophy, Zap, Star, Flame, Target, Award,
    Loader2, RefreshCw, Sparkles, Search, Check,
    Telescope, Mountain, Waves, Cloud, TreePine, Bug, Flower2, 
    Microscope, Dna, Brain, Pill, Smile, Heart, Activity, 
    Stethoscope, Footprints, Dumbbell, Building, HardHat, Cog,
    FlaskConical, Rocket, Factory, Leaf, Monitor, Code, Database,
    Bot, HardDrive, BarChart3, Network, TrendingUp, Landmark, 
    Users, Skull, BookOpen, Lightbulb, Scale, Languages, BookText,
    PenTool, Palette, Music, Film
} from 'lucide-react';
import { Button } from "@/components/ui/button";

import LearningIslandCard from '@/components/learning/LearningIslandCard';
import CourseModal from '@/components/learning/CourseModal';
import { SUBJECTS, CATEGORIES } from '@/components/learning/SubjectData';

const ICON_MAP = {
    Telescope, Mountain, Waves, Cloud, TreePine, Bug, Flower2, 
    Microscope, Dna, Brain, Pill, Smile, Heart, Activity, 
    Stethoscope, Footprints, Dumbbell, Building, HardHat, Cog,
    FlaskConical, Rocket, Factory, Leaf, Monitor, Code, Database,
    Bot, HardDrive, BarChart3, Network, TrendingUp, Landmark, 
    Users, Skull, BookOpen, Lightbulb, Scale, Languages, BookText,
    PenTool, Palette, Music, Film
};

// App theme colors
const THEME = {
    primary: '#6B4EE6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    success: '#10B981',
};

const RANKS = [
    { name: 'Novice', minXP: 0, color: '#9CA3AF', icon: '🌱' },
    { name: 'Explorer', minXP: 500, color: THEME.primary, icon: '🧭' },
    { name: 'Scholar', minXP: 2000, color: THEME.success, icon: '📚' },
    { name: 'Expert', minXP: 5000, color: THEME.secondary, icon: '🎓' },
    { name: 'Master', minXP: 10000, color: THEME.accent, icon: '👑' },
    { name: 'Legend', minXP: 25000, color: '#EF4444', icon: '🌟' },
];

export default function Learning() {
    useEffect(() => {
        document.title = 'Smart Learning Archipelago';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Learning Archipelago uses AI agents to create automated learning islands for growth on all subjects.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Learning Archipelago, Learning islands');
    }, []);

    const [selectedSubjects, setSelectedSubjects] = useState([SUBJECTS[0]]); // Default to first subject
    const [subTopics, setSubTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [userProgress, setUserProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    
    // Gamification state
    const [totalXP, setTotalXP] = useState(1250);
    const [streak, setStreak] = useState(7);
    const [completedCourses, setCompletedCourses] = useState(3);
    const [certificates, setCertificates] = useState(1);

    // Filter subjects based on search and category
    const filteredSubjects = SUBJECTS.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             subject.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !activeCategory || subject.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
        if (!acc[subject.category]) acc[subject.category] = [];
        acc[subject.category].push(subject);
        return acc;
    }, {});

    const toggleSubject = (subject) => {
        const isSelected = selectedSubjects.some(s => s.id === subject.id);
        if (isSelected) {
            setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
        } else {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    const currentRank = RANKS.filter(r => totalXP >= r.minXP).pop() || RANKS[0];
    const nextRank = RANKS.find(r => r.minXP > totalXP);
    const xpToNextRank = nextRank ? nextRank.minXP - totalXP : 0;

    // Generate sub-topics when subjects change - use ref to track current request
    const requestIdRef = React.useRef(0);
    
    useEffect(() => {
        if (selectedSubjects.length > 0) {
            const currentRequestId = ++requestIdRef.current;
            generateSubTopics(currentRequestId);
        } else {
            setSubTopics([]);
        }
    }, [JSON.stringify(selectedSubjects.map(s => s.id))]);

    const generateSubTopics = async (requestId) => {
        setLoadingTopics(true);
        setSubTopics([]);
        try {
            const subjectNames = selectedSubjects.map(s => s.name).join(', ');
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 10 specific learning sub-topics/courses for these subjects: ${subjectNames}.
                Each topic should be a focused, learnable concept that could be a standalone course.
                Make them practical and engaging for learners.
                Include a mix of beginner and advanced topics.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        topics: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    name: { type: "string" },
                                    description: { type: "string" },
                                    difficulty: { type: "string" },
                                    estimatedHours: { type: "number" },
                                    parentSubject: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            // Map generated topics to include colors from parent subjects
            const topicsWithColors = (response?.topics || []).map((topic, i) => {
                const parentSubject = selectedSubjects.find(s => 
                    s.name.toLowerCase() === topic.parentSubject?.toLowerCase()
                ) || selectedSubjects[i % selectedSubjects.length];
                
                return {
                    ...topic,
                    color: parentSubject?.color || '#6B4EE6',
                    icon: parentSubject?.icon || 'BookOpen',
                    id: topic.id || `topic-${i}`
                };
            });

            // Only update if this is still the current request
            if (requestId === requestIdRef.current) {
                setSubTopics(topicsWithColors);
                
                // Initialize progress for new topics
                const newProgress = {};
                topicsWithColors.forEach(t => {
                    newProgress[t.id] = userProgress[t.id] || Math.floor(Math.random() * 30);
                });
                setUserProgress(newProgress);
            }
            
        } catch (error) {
            console.error('Error generating topics:', error);
            // Fallback topics based on selected subjects
            const fallbackTopics = selectedSubjects.flatMap((subject, si) => [
                { id: `${subject.id}-1`, name: `Introduction to ${subject.name}`, description: 'Core fundamentals', color: subject.color, icon: subject.icon, difficulty: 'Beginner', estimatedHours: 4 },
                { id: `${subject.id}-2`, name: `Advanced ${subject.name}`, description: 'Deep dive into concepts', color: subject.color, icon: subject.icon, difficulty: 'Advanced', estimatedHours: 8 },
            ]).slice(0, 10);
            if (requestId === requestIdRef.current) {
                setSubTopics(fallbackTopics);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                setLoadingTopics(false);
            }
        }
    };

    const handleExplore = (topic) => {
        setSelectedTopic(topic);
        setShowCourseModal(true);
    };

    const handleCourseComplete = () => {
        if (selectedTopic) {
            setUserProgress(prev => ({ ...prev, [selectedTopic.id]: 100 }));
            setTotalXP(prev => prev + 500);
            setCompletedCourses(prev => prev + 1);
        }
        setShowCourseModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
            {/* Top Row - Header Left, Subject Selector Right */}
            <div className="mx-4 md:mx-8 mt-4 flex flex-col lg:flex-row gap-4">
                {/* Hero Banner - Left */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg lg:w-1/2 flex flex-col justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Learning Archipelago</h1>
                        <p className="text-purple-200 text-sm">Ai-Powered Learning Journey</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 mt-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{totalXP.toLocaleString()}</p>
                            <p className="text-xs text-purple-200">Total XP</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{streak}</p>
                            <p className="text-xs text-purple-200">Day Streak</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{completedCourses}</p>
                            <p className="text-xs text-purple-200">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{certificates}</p>
                            <p className="text-xs text-purple-200">Certificates</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    {nextRank && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-purple-200 mb-1">
                                <span>{currentRank.name}</span>
                                <span>{xpToNextRank} XP to {nextRank.name}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all bg-white/80"
                                    style={{ 
                                        width: `${((totalXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Subject Selector - Right */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:w-1/2 flex flex-col">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search subjects..."
                                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-gray-100">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                !activeCategory ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeCategory === cat ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Subjects list */}
                    <div className="flex-1 overflow-y-auto max-h-[200px]">
                        {Object.entries(groupedSubjects).map(([category, subjects]) => (
                            <div key={category} className="mb-4">
                                <div className="text-xs font-semibold text-purple-600 px-2 mb-2">{category}</div>
                                <div className="space-y-1">
                                    {subjects.map(subject => {
                                        const isSelected = selectedSubjects.some(s => s.id === subject.id);
                                        const IconComponent = ICON_MAP[subject.icon] || GraduationCap;
                                        return (
                                            <button
                                                key={subject.id}
                                                onClick={() => toggleSubject(subject)}
                                                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                                                    isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${subject.color}20` }}
                                                >
                                                    <IconComponent 
                                                        className="w-4 h-4"
                                                        style={{ color: subject.color }}
                                                    />
                                                </div>
                                                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                                                    {subject.name}
                                                </span>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-purple-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {filteredSubjects.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No subjects found matching "{searchQuery}"
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                            {selectedSubjects.length} selected
                        </div>
                        <Button 
                            onClick={generateSubTopics}
                            disabled={loadingTopics || selectedSubjects.length === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-sm"
                            size="sm"
                        >
                            <RefreshCw className={`w-3 h-3 mr-1.5 ${loadingTopics ? 'animate-spin' : ''}`} />
                            Generate Islands
                        </Button>
                    </div>
                </div>
            </div>

            {/* Learning Islands Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-12">
                {loadingTopics ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <style>{`
                            @keyframes logoPulse {
                                0%, 100% { opacity: 0.4; transform: scale(1); }
                                50% { opacity: 0.7; transform: scale(1.03); }
                            }
                        `}</style>
                        <div className="relative mb-4 flex items-center justify-center">
                            <div className="absolute w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png" 
                                alt="Loading" 
                                className="w-12 h-12 object-contain grayscale opacity-50"
                                style={{ animation: 'logoPulse 1.5s ease-in-out infinite' }}
                            />
                        </div>
                        <p className="text-gray-600">Generating learning islands for you...</p>
                    </div>
                ) : subTopics.length === 0 ? (
                    <div className="text-center py-20">
                        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select subjects to explore</h3>
                        <p className="text-gray-400">Choose one or more subjects above to generate learning islands</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Your Learning Archipelago
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Target className="w-4 h-4" />
                                {subTopics.length} islands to explore
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {subTopics.map((topic, index) => (
                                <LearningIslandCard
                                    key={topic.id}
                                    topic={topic}
                                    index={index}
                                    progress={userProgress[topic.id] || 0}
                                    onExplore={handleExplore}
                                    locked={false}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Summary Stats */}
            {subTopics.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${THEME.primary}20` }}>
                                    <Star className="w-6 h-6" style={{ color: THEME.primary }} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{subTopics.length}</p>
                                    <p className="text-sm text-gray-500">Learning Islands</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${THEME.success}20` }}>
                                    <Target className="w-6 h-6" style={{ color: THEME.success }} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {Object.values(userProgress).filter(p => p === 100).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Islands Completed</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${THEME.accent}20` }}>
                                    <Zap className="w-6 h-6" style={{ color: THEME.accent }} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {subTopics.length * 500}
                                    </p>
                                    <p className="text-sm text-gray-500">Potential XP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Course Modal */}
            <CourseModal 
                isOpen={showCourseModal}
                onClose={() => setShowCourseModal(false)}
                topic={selectedTopic}
                onComplete={handleCourseComplete}
            />
        </div>
    );
}