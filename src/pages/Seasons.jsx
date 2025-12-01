import React, { useState, useEffect } from 'react';
import { 
    Sun, Cloud, Leaf, Snowflake, ChevronRight, Home, Loader2,
    Calendar, MapPin, Thermometer, Droplets, Wind, Heart,
    Utensils, Plane, Shirt, Music, Book, Camera, TreeDeciduous,
    Flower2, CloudRain, Mountain, Waves, Sparkles, Globe, Clock,
    Target, TrendingUp, Award, Users, Play
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const SEASONS_DATA = {
    spring: {
        name: "Spring",
        icon: Flower2,
        color: "#10B981",
        gradient: "from-emerald-400 to-teal-500",
        months: "March - May (N) / Sept - Nov (S)",
        description: "Season of renewal and growth"
    },
    summer: {
        name: "Summer",
        icon: Sun,
        color: "#F59E0B",
        gradient: "from-amber-400 to-orange-500",
        months: "June - August (N) / Dec - Feb (S)",
        description: "Season of warmth and vitality"
    },
    autumn: {
        name: "Autumn",
        icon: Leaf,
        color: "#EA580C",
        gradient: "from-orange-500 to-red-500",
        months: "Sept - Nov (N) / March - May (S)",
        description: "Season of harvest and change"
    },
    winter: {
        name: "Winter",
        icon: Snowflake,
        color: "#3B82F6",
        gradient: "from-blue-400 to-indigo-500",
        months: "Dec - Feb (N) / June - Aug (S)",
        description: "Season of rest and reflection"
    }
};

const CATEGORIES = {
    awareness: {
        name: "Seasonal Awareness",
        icon: Globe,
        color: "#8B5CF6",
        gradient: "from-purple-500 to-indigo-500",
        items: ["Current Season Tracker", "Hemisphere Guide", "Sub-Seasons", "Equinox & Solstice Countdown", "Micro-Seasons (72 Japanese)", "Historical Context"]
    },
    weather: {
        name: "Weather & Environment",
        icon: Cloud,
        color: "#0EA5E9",
        gradient: "from-sky-500 to-blue-500",
        items: ["Seasonal Forecasts", "Temperature Averages", "Rainfall Patterns", "Daylight Hours", "Climate Insights", "Allergy Alerts", "Seasonal Produce"]
    },
    lifestyle: {
        name: "Lifestyle & Activities",
        icon: Heart,
        color: "#EC4899",
        gradient: "from-pink-500 to-rose-500",
        items: ["Seasonal Bucket Lists", "Travel Destinations", "Seasonal Recipes", "Gardening Planner", "Fitness Routines", "Outdoor Adventures", "Indoor Activities"]
    },
    cultural: {
        name: "Cultural & Festive",
        icon: Sparkles,
        color: "#F59E0B",
        gradient: "from-amber-500 to-yellow-500",
        items: ["Worldwide Holidays", "Traditions & Folklore", "Music Playlists", "Movie Suggestions", "Book Recommendations", "Local Festivals", "Seasonal Celebrations"]
    },
    personal: {
        name: "Personal Tracking",
        icon: Target,
        color: "#10B981",
        gradient: "from-emerald-500 to-green-500",
        items: ["Mood Journal", "Health Tracking", "Seasonal Goals", "Wardrobe Planner", "Energy Patterns", "Sleep Cycles", "Wellness Tips"]
    },
    sensory: {
        name: "Visual & Sensory",
        icon: Camera,
        color: "#6366F1",
        gradient: "from-indigo-500 to-violet-500",
        items: ["Seasonal Wallpapers", "Nature Photography", "Soundscapes", "Meditation Guides", "Seasonal Themes", "Photo Challenges", "Ambient Experiences"]
    }
};

function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

function getDaysUntilNextSolstice() {
    const now = new Date();
    const year = now.getFullYear();
    const solstices = [
        new Date(year, 2, 20), // Spring equinox
        new Date(year, 5, 21), // Summer solstice
        new Date(year, 8, 22), // Autumn equinox
        new Date(year, 11, 21), // Winter solstice
        new Date(year + 1, 2, 20) // Next spring
    ];
    const next = solstices.find(d => d > now) || solstices[4];
    return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
}

function Breadcrumb({ items, onNavigate }) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <button
                        onClick={() => onNavigate(index)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                            index === items.length - 1 
                                ? 'text-purple-600 font-medium bg-purple-50' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        {index === 0 && <Home className="w-4 h-4" />}
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
}

function SeasonCard({ seasonKey, season, isActive, onClick }) {
    const Icon = season.icon;
    return (
        <div 
            onClick={onClick}
            className={`bg-gradient-to-br ${season.gradient} rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl text-white group relative overflow-hidden`}
        >
            {isActive && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/30 rounded-full text-xs font-medium">
                    Current
                </div>
            )}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">{season.name}</h3>
                    <p className="text-white/70 text-xs">{season.months}</p>
                </div>
            </div>
            <p className="text-white/80 text-sm">{season.description}</p>
            <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
        </div>
    );
}

function CategoryCard({ category, onClick }) {
    const Icon = category.icon;
    return (
        <div 
            onClick={onClick}
            className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl text-white group`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                </div>
                <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
            <p className="text-white/80 text-sm mb-4">{category.items.length} topics</p>
            <div className="flex flex-wrap gap-1.5">
                {category.items.map((item, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

function ItemCard({ item, color, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-purple-200 cursor-pointer transition-all group"
        >
            <div className="flex items-center gap-3">
                <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Sparkles className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{item}</h4>
                    <p className="text-xs text-gray-500">Tap to explore</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
}

function ItemDetailView({ item, category, selectedSeason }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (item) fetchData();
    }, [item, selectedSeason]);

    const fetchData = async () => {
        setLoading(true);
        const seasonContext = selectedSeason ? SEASONS_DATA[selectedSeason]?.name : getCurrentSeason();
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive seasonal information about "${item}" in the context of ${category?.name || 'seasons'} for ${seasonContext}. Include:
1. Overview: Detailed description (3-4 sentences)
2. Key Tips: 5 practical tips or facts
3. Seasonal Relevance: Why this matters during ${seasonContext}
4. Activities: 4 suggested activities or actions
5. Did You Know: An interesting fact`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        keyTips: { type: "array", items: { type: "string" } },
                        seasonalRelevance: { type: "string" },
                        activities: { type: "array", items: { type: "string" } },
                        didYouKnow: { type: "string" }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setData({
                overview: `${item} is an important aspect of seasonal living.`,
                keyTips: ['Explore more about this topic'],
                seasonalRelevance: 'This topic connects to seasonal patterns.',
                activities: ['Learn more'],
                didYouKnow: 'Seasons affect every aspect of life on Earth.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: category?.color }} />
                <p className="text-gray-500">Loading seasonal data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`bg-gradient-to-r ${category?.gradient || 'from-purple-600 to-indigo-600'} rounded-2xl p-6 text-white`}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">{category?.name}</p>
                        <h2 className="text-2xl font-bold">{item}</h2>
                    </div>
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Globe className="w-5 h-5" style={{ color: category?.color }} />
                                Overview
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{data.overview}</p>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5" style={{ color: category?.color }} />
                                Key Tips
                            </h3>
                            <div className="space-y-3">
                                {data.keyTips?.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: category?.color }}>
                                            {i + 1}
                                        </span>
                                        <p className="text-gray-700 text-sm">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5" style={{ color: category?.color }} />
                                Suggested Activities
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {data.activities?.map((activity, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        {activity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="rounded-xl p-5" style={{ backgroundColor: `${category?.color}10` }}>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5" style={{ color: category?.color }} />
                                Seasonal Relevance
                            </h3>
                            <p className="text-gray-700 text-sm">{data.seasonalRelevance}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
                            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                Did You Know?
                            </h3>
                            <p className="text-amber-700 text-sm">{data.didYouKnow}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SeasonDetailView({ seasonKey, season, onSelectCategory }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const Icon = season.icon;

    useEffect(() => {
        fetchSeasonData();
    }, [seasonKey]);

    const fetchSeasonData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive information about ${season.name} season. Include:
1. Overview: Description of this season (3-4 sentences)
2. Weather: Typical weather patterns
3. Nature: What happens in nature during this season
4. Activities: 5 popular activities
5. Holidays: Major holidays and celebrations
6. Health Tips: 3 health and wellness tips
7. Fun Fact: An interesting fact about this season`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        weather: { type: "string" },
                        nature: { type: "string" },
                        activities: { type: "array", items: { type: "string" } },
                        holidays: { type: "array", items: { type: "string" } },
                        healthTips: { type: "array", items: { type: "string" } },
                        funFact: { type: "string" }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch season data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: season.color }} />
                <p className="text-gray-500">Loading {season.name} data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`bg-gradient-to-r ${season.gradient} rounded-2xl p-6 text-white`}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">{season.name}</h2>
                        <p className="text-white/80">{season.months}</p>
                    </div>
                </div>
            </div>

            {data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Cloud className="w-5 h-5" style={{ color: season.color }} />
                                Weather
                            </h3>
                            <p className="text-gray-600 text-sm">{data.weather}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <TreeDeciduous className="w-5 h-5" style={{ color: season.color }} />
                                Nature
                            </h3>
                            <p className="text-gray-600 text-sm">{data.nature}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2 lg:col-span-1">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Fun Fact
                            </h3>
                            <p className="text-gray-600 text-sm">{data.funFact}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Popular Activities</h3>
                            <div className="space-y-2">
                                {data.activities?.map((activity, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <ChevronRight className="w-4 h-4" style={{ color: season.color }} />
                                        {activity}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Holidays & Celebrations</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.holidays?.map((holiday, i) => (
                                    <span key={i} className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${season.color}20`, color: season.color }}>
                                        {holiday}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Health Tips</h3>
                            <div className="space-y-2">
                                {data.healthTips?.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <Heart className="w-4 h-4 mt-0.5 text-pink-500" />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Explore {season.name} Topics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(CATEGORIES).map(([key, category]) => (
                                <CategoryCard 
                                    key={key}
                                    category={category}
                                    onClick={() => onSelectCategory(key)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Seasons() {
    useEffect(() => {
        document.title = 'Seasons - Understand and embrace seasonal living';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Explore seasons, plan activities, track personal rhythms, and celebrate cultural events tied to the seasonal cycle.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Seasons, seasonal living, weather, nature, lifestyle');
    }, []);

    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const currentSeason = getCurrentSeason();
    const daysUntilSolstice = getDaysUntilNextSolstice();

    const currentSeasonData = selectedSeason ? SEASONS_DATA[selectedSeason] : null;
    const currentCategoryData = selectedCategory ? CATEGORIES[selectedCategory] : null;

    // Build breadcrumb
    const breadcrumbItems = [{ label: 'Seasons', level: 0 }];
    if (selectedSeason) {
        breadcrumbItems.push({ label: SEASONS_DATA[selectedSeason].name, level: 1 });
    }
    if (selectedCategory) {
        breadcrumbItems.push({ label: CATEGORIES[selectedCategory].name, level: 2 });
    }
    if (selectedItem) {
        breadcrumbItems.push({ label: selectedItem, level: 3 });
    }

    const handleBreadcrumbNavigate = (index) => {
        if (index === 0) {
            setSelectedSeason(null);
            setSelectedCategory(null);
            setSelectedItem(null);
        } else if (index === 1) {
            setSelectedCategory(null);
            setSelectedItem(null);
        } else if (index === 2) {
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className={`bg-gradient-to-r ${SEASONS_DATA[currentSeason].gradient} rounded-2xl p-6 mb-6 text-white`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                {React.createElement(SEASONS_DATA[currentSeason].icon, { className: "w-6 h-6" })}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Seasons</h1>
                                <p className="text-white/80 text-sm">Currently: {SEASONS_DATA[currentSeason].name}</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">4</p>
                                <p className="text-xs text-white/70">Seasons</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{daysUntilSolstice}</p>
                                <p className="text-xs text-white/70">Days to Solstice</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{Object.values(CATEGORIES).reduce((a, c) => a + c.items.length, 0)}</p>
                                <p className="text-xs text-white/70">Topics</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />

                {/* Content */}
                {!selectedSeason && !selectedCategory ? (
                    /* Main View - Seasons Grid + Categories */
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Seasons</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(SEASONS_DATA).map(([key, season]) => (
                                    <SeasonCard 
                                        key={key}
                                        seasonKey={key}
                                        season={season}
                                        isActive={key === currentSeason}
                                        onClick={() => setSelectedSeason(key)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(CATEGORIES).map(([key, category]) => (
                                    <CategoryCard 
                                        key={key}
                                        category={category}
                                        onClick={() => setSelectedCategory(key)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : selectedSeason && !selectedCategory ? (
                    /* Season Detail View */
                    <SeasonDetailView 
                        seasonKey={selectedSeason}
                        season={SEASONS_DATA[selectedSeason]}
                        onSelectCategory={(cat) => setSelectedCategory(cat)}
                    />
                ) : selectedCategory && !selectedItem ? (
                    /* Category Items View */
                    <div>
                        <div className={`bg-gradient-to-r ${currentCategoryData.gradient} rounded-2xl p-6 mb-6 text-white`}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                    <currentCategoryData.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{currentCategoryData.name}</h2>
                                    <p className="text-white/80">{currentCategoryData.items.length} topics to explore</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentCategoryData.items.map((item, i) => (
                                <ItemCard 
                                    key={i}
                                    item={item}
                                    color={currentCategoryData.color}
                                    onClick={() => setSelectedItem(item)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Item Detail View */
                    <ItemDetailView 
                        item={selectedItem} 
                        category={currentCategoryData}
                        selectedSeason={selectedSeason}
                    />
                )}
            </div>
        </div>
    );
}