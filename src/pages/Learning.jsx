import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Menu, ChevronLeft, ChevronDown, GraduationCap, Trophy, Award, Star,
    Brain, Shield, Users, Leaf, Heart, Building, Cpu, Globe, Zap, Target,
    Lightbulb, BookOpen, Rocket, Settings as SettingsIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { LOGO_URL, menuItems, footerLinks } from '../components/NavigationConfig';

// Learning topic icons mapping
const TOPIC_ICONS = {
    'AI Integration': Brain,
    'Cybersecurity': Shield,
    'Workforce Readiness': Users,
    'STEM Education': Lightbulb,
    'Digital Transformation': Cpu,
    'Biotechnology': Zap,
    'Climate Change': Leaf,
    'Healthcare Access': Heart,
    'Infrastructure': Building,
    'Public Policy': Globe,
};

// Countries with their priorities
const COUNTRIES = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
];

// Learning topics with priorities
const LEARNING_TOPICS = [
    { id: 1, name: 'AI Integration', priority: 1, color: '#3B82F6', progress: 75, lessons: 12, completed: 9 },
    { id: 2, name: 'Cybersecurity', priority: 2, color: '#EF4444', progress: 60, lessons: 10, completed: 6 },
    { id: 3, name: 'Workforce Readiness', priority: 3, color: '#22C55E', progress: 45, lessons: 8, completed: 4 },
    { id: 4, name: 'STEM Education', priority: 4, color: '#EAB308', progress: 90, lessons: 15, completed: 14 },
    { id: 5, name: 'Digital Transformation', priority: 5, color: '#A855F7', progress: 30, lessons: 10, completed: 3 },
    { id: 6, name: 'Biotechnology', priority: 6, color: '#F97316', progress: 55, lessons: 8, completed: 4 },
    { id: 7, name: 'Climate Change', priority: 7, color: '#06B6D4', progress: 40, lessons: 12, completed: 5 },
    { id: 8, name: 'Healthcare Access', priority: 8, color: '#EC4899', progress: 85, lessons: 10, completed: 9 },
    { id: 9, name: 'Infrastructure', priority: 9, color: '#84CC16', progress: 20, lessons: 6, completed: 1 },
    { id: 10, name: 'Public Policy', priority: 10, color: '#6366F1', progress: 65, lessons: 8, completed: 5 },
];

// Island SVG Component with 3D effect
const LearningIsland = ({ topic, onClick, index }) => {
    const Icon = TOPIC_ICONS[topic.name] || BookOpen;
    const isEven = index % 2 === 0;
    
    return (
        <div 
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => onClick(topic)}
        >
            {/* Priority badge */}
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2 shadow-lg"
                style={{ backgroundColor: topic.color }}
            >
                {topic.priority}
            </div>
            
            {/* Island with 3D effect */}
            <div className="relative">
                {/* Island shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-300/50 rounded-full blur-sm" />
                
                {/* Island base */}
                <svg width="140" height="100" viewBox="0 0 140 100" className="drop-shadow-lg">
                    {/* Water ring */}
                    <ellipse cx="70" cy="75" rx="65" ry="20" fill="#67E8F9" opacity="0.5" />
                    
                    {/* Island grass - darker layer */}
                    <ellipse cx="70" cy="65" rx="55" ry="25" fill="#22C55E" />
                    
                    {/* Island grass - lighter layer */}
                    <ellipse cx="70" cy="60" rx="50" ry="22" fill="#4ADE80" />
                    
                    {/* Small details */}
                    {isEven && (
                        <>
                            <circle cx="40" cy="55" r="4" fill="#166534" />
                            <circle cx="95" cy="60" r="3" fill="#166534" />
                        </>
                    )}
                </svg>
                
                {/* Icon on top of island */}
                <div 
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: topic.color }}
                >
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
            
            {/* Topic name */}
            <h3 className="mt-3 font-semibold text-gray-800 text-center">{topic.name}</h3>
            <p className="text-sm text-gray-500">Priority #{topic.priority}</p>
        </div>
    );
};

// Stats cards for bottom section
const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center">
        <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${color}20` }}
        >
            <Icon className="w-8 h-8" style={{ color }} />
        </div>
        <div className="text-4xl font-bold text-gray-800">{value}</div>
        <div className="text-gray-500 text-sm">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
);

export default function Learning() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('US');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userStats, setUserStats] = useState({
        points: 5500,
        certificates: 3,
        rank: 'Explorer',
        globalPosition: 137
    });

    const currentCountry = COUNTRIES.find(c => c.code === selectedCountry);

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
        setShowModal(true);
    };

    const getRankBadge = () => {
        const ranks = ['Novice', 'Explorer', 'Scholar', 'Expert', 'Master'];
        const colors = ['#94A3B8', '#22C55E', '#3B82F6', '#A855F7', '#F59E0B'];
        const rankIndex = ranks.indexOf(userStats.rank);
        return { name: userStats.rank, color: colors[rankIndex] || colors[0] };
    };

    const rankBadge = getRankBadge();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 md:hidden">
                            <Menu className="w-5 h-5 text-purple-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 hidden md:flex">
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
                        </Button>
                        
                        {/* User profile section */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Learning Explorer</h1>
                                <p className="text-sm text-gray-500">Citizen • Knowledge Seeker</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Country selector */}
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger className="w-48 bg-white border-gray-200">
                                <SelectValue>
                                    <span className="flex items-center gap-2">
                                        <span>{currentCountry?.flag}</span>
                                        <span>{currentCountry?.name}</span>
                                    </span>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map(country => (
                                    <SelectItem key={country.code} value={country.code}>
                                        <span className="flex items-center gap-2">
                                            <span>{country.flag}</span>
                                            <span>{country.name}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{userStats.points.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Points</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{userStats.certificates}</div>
                                <div className="text-xs text-gray-500">Certificates</div>
                            </div>
                            <div 
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                                style={{ backgroundColor: rankBadge.color }}
                            >
                                <Trophy className="w-5 h-5" />
                                <div>
                                    <div className="font-semibold">{rankBadge.name}</div>
                                    <div className="text-xs opacity-80">Rank</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

                <aside className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-72px)] md:h-auto`}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.href} 
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} 
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    item.label === 'Learning' 
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

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {/* Title section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className="w-8 h-8 text-purple-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-purple-600">
                                {currentCountry?.name} Learning Archipelago
                            </h2>
                        </div>
                        <p className="text-gray-600">
                            Navigate knowledge islands tailored to {currentCountry?.name}'s strategic priorities and gaps
                        </p>
                    </div>

                    {/* Islands Grid - First Row (5 items) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                        {LEARNING_TOPICS.slice(0, 5).map((topic, index) => (
                            <LearningIsland 
                                key={topic.id} 
                                topic={topic} 
                                index={index}
                                onClick={handleTopicClick} 
                            />
                        ))}
                    </div>

                    {/* Islands Grid - Second Row (5 items) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                        {LEARNING_TOPICS.slice(5, 10).map((topic, index) => (
                            <LearningIsland 
                                key={topic.id} 
                                topic={topic} 
                                index={index + 5}
                                onClick={handleTopicClick} 
                            />
                        ))}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard 
                            icon={Globe}
                            title="Global Rank"
                            value={`#${userStats.globalPosition}`}
                            subtitle="Out of 10,000+ learners"
                            color="#3B82F6"
                        />
                        <StatsCard 
                            icon={Rocket}
                            title="Topics Completed"
                            value="10"
                            subtitle="Keep learning!"
                            color="#22C55E"
                        />
                        <StatsCard 
                            icon={Target}
                            title="Current Streak"
                            value="12"
                            subtitle="Days in a row"
                            color="#F59E0B"
                        />
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

            {/* Topic Detail Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-white border-gray-200 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            {selectedTopic && (
                                <>
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: selectedTopic.color }}
                                    >
                                        {(() => {
                                            const Icon = TOPIC_ICONS[selectedTopic.name] || BookOpen;
                                            return <Icon className="w-5 h-5 text-white" />;
                                        })()}
                                    </div>
                                    {selectedTopic.name}
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedTopic && (
                        <div className="space-y-6">
                            {/* Priority badge */}
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                                    style={{ backgroundColor: selectedTopic.color }}
                                >
                                    Priority #{selectedTopic.priority}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    Strategic focus area for {currentCountry?.name}
                                </span>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm text-gray-500">{selectedTopic.progress}%</span>
                                </div>
                                <Progress value={selectedTopic.progress} className="h-3" />
                            </div>

                            {/* Lessons */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">Lessons Completed</p>
                                        <p className="text-sm text-gray-500">{selectedTopic.completed} of {selectedTopic.lessons} lessons</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold" style={{ color: selectedTopic.color }}>
                                            {selectedTopic.completed}/{selectedTopic.lessons}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button 
                                    className="flex-1 text-white"
                                    style={{ backgroundColor: selectedTopic.color }}
                                >
                                    Continue Learning
                                </Button>
                                <Button variant="outline" className="flex-1 border-gray-300">
                                    View All Lessons
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}