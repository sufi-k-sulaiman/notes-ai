import React, { useState, useEffect } from 'react';
import { 
    Brain, Loader2, ChevronRight, ArrowLeft, Sparkles,
    Globe, Mountain, Leaf, Zap, Star, Home
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import WeatherDashboard from '@/components/intelligence/WeatherDashboard';

const CATEGORIES = {
    Elements_Environment: {
        name: "Elements & Environment",
        icon: Globe,
        color: "#3B82F6",
        gradient: "from-blue-500 to-cyan-500",
        items: ["Earth", "Soil", "Water", "Air", "Fire", "Sunlight", "Moon", "Stars", "Sky", "Space"]
    },
    Natural_Landscapes_Features: {
        name: "Natural Landscapes",
        icon: Mountain,
        color: "#10B981",
        gradient: "from-emerald-500 to-teal-500",
        items: ["Mountains", "Rivers", "Oceans", "Forests", "Deserts"]
    },
    Living_Things: {
        name: "Living Things",
        icon: Leaf,
        color: "#22C55E",
        gradient: "from-green-500 to-lime-500",
        items: ["Plants", "Animals", "Microorganisms", "Insects", "Birds", "Fish", "Reptiles", "Humans"]
    },
    Forces_Cycles: {
        name: "Forces & Cycles",
        icon: Zap,
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-500",
        items: ["Gravity", "Seasons", "Weather", "Energy", "Time"]
    },
    Cosmic_Celestial: {
        name: "Cosmic & Celestial",
        icon: Star,
        color: "#8B5CF6",
        gradient: "from-purple-500 to-indigo-500",
        items: ["Universe", "Galaxy", "Solar System", "Planets", "Asteroids", "Comets", "Black Holes", "Nebulae"]
    }
};

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

function CategoryCard({ category, onClick }) {
    const Icon = category.icon;
    
    return (
        <div 
            onClick={onClick}
            className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl text-white group`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">{category.name}</h3>
            <p className="text-white/80 text-sm mb-4">{category.items.length} topics to explore</p>
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

// Special items that have dedicated dashboards
const SPECIAL_ITEMS = {
    'Seasons': WeatherDashboard,
    'Weather': WeatherDashboard,
};

function ItemDetailView({ item, category }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    // Check if this item has a special dashboard
    const SpecialDashboard = SPECIAL_ITEMS[item];
    
    useEffect(() => {
        if (item && !SpecialDashboard) {
            fetchItemData();
        }
    }, [item]);

    const fetchItemData = async () => {
        setLoading(true);
        setData(null);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive intelligence data about "${item}" in the context of ${category?.name || 'natural world'}. Include:
1. Overview: A detailed description (3-4 sentences)
2. Key Facts: 5 interesting facts
3. Significance: Why it matters to humans and the planet
4. Related Topics: 4 related concepts to explore
5. Current Research: Recent scientific discoveries or developments`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        keyFacts: { type: "array", items: { type: "string" } },
                        significance: { type: "string" },
                        relatedTopics: { type: "array", items: { type: "string" } },
                        currentResearch: { type: "string" }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch item data:', error);
            setData({
                overview: `${item} is a fascinating subject within ${category?.name || 'the natural world'}.`,
                keyFacts: ['Information is being gathered...'],
                significance: 'This topic plays an important role in our understanding of the world.',
                relatedTopics: ['More topics coming soon'],
                currentResearch: 'Research data is being compiled.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Render special dashboard if available
    if (SpecialDashboard) {
        return <SpecialDashboard />;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: category?.color }} />
                <p className="text-gray-500">Loading intelligence data...</p>
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
                                <Sparkles className="w-5 h-5" style={{ color: category?.color }} />
                                Key Facts
                            </h3>
                            <div className="space-y-3">
                                {data.keyFacts?.map((fact, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: category?.color }}>
                                            {i + 1}
                                        </span>
                                        <p className="text-gray-700 text-sm">{fact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Current Research</h3>
                            <p className="text-gray-600">{data.currentResearch}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="rounded-xl p-5" style={{ backgroundColor: `${category?.color}10` }}>
                            <h3 className="font-semibold text-gray-900 mb-3">Why It Matters</h3>
                            <p className="text-gray-700 text-sm">{data.significance}</p>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Related Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.relatedTopics?.map((topic, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${category?.color}20`, color: category?.color }}>
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Intelligence() {
    useEffect(() => {
        document.title = 'AI Intelligence for automated decision making';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Intelligence platform delivering automated insights and smarter decisions for growth.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'AI Intelligence, Intelligence');
    }, []);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const currentCategory = selectedCategory ? CATEGORIES[selectedCategory] : null;

    // Build breadcrumb items
    const breadcrumbItems = [{ label: 'Intelligence', level: 0 }];
    if (selectedCategory && currentCategory) {
        breadcrumbItems.push({ label: currentCategory.name, level: 1 });
    }
    if (selectedItem) {
        breadcrumbItems.push({ label: selectedItem, level: 2 });
    }

    const handleBreadcrumbNavigate = (index) => {
        if (index === 0) {
            setSelectedCategory(null);
            setSelectedItem(null);
        } else if (index === 1) {
            setSelectedItem(null);
        }
    };

    const handleCategoryClick = (categoryKey) => {
        setSelectedCategory(categoryKey);
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Natural Intelligence</h1>
                                <p className="text-white/80 text-sm">Explore the wonders of our universe</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{Object.keys(CATEGORIES).length}</p>
                                <p className="text-xs text-white/70">Categories</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">
                                    {Object.values(CATEGORIES).reduce((acc, cat) => acc + cat.items.length, 0)}
                                </p>
                                <p className="text-xs text-white/70">Topics</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />

                {/* Content */}
                {!selectedCategory ? (
                    /* Category Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Object.entries(CATEGORIES).map(([key, category]) => (
                            <CategoryCard 
                                key={key}
                                category={category}
                                onClick={() => handleCategoryClick(key)}
                            />
                        ))}
                    </div>
                ) : !selectedItem ? (
                    /* Category Items View */
                    <div>
                        <div className={`bg-gradient-to-r ${currentCategory.gradient} rounded-2xl p-6 mb-6 text-white`}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                    <currentCategory.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
                                    <p className="text-white/80">{currentCategory.items.length} topics to explore</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentCategory.items.map((item, i) => (
                                <ItemCard 
                                    key={i}
                                    item={item}
                                    color={currentCategory.color}
                                    onClick={() => handleItemClick(item)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Item Detail View */
                    <ItemDetailView item={selectedItem} category={currentCategory} />
                )}
            </div>
        </div>
    );
}