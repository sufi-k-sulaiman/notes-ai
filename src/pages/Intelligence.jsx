import React, { useState, useEffect } from 'react';
import { 
    Brain, Loader2, ChevronRight, Sparkles,
    Globe, Mountain, Leaf, Zap, Star, Home,
    Beaker, Calculator, FlaskConical, Users, Lightbulb, BookOpen, Atom
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const CATEGORIES = {
    Elements_Environment: {
        name: "Elements & Environment",
        icon: Globe,
        color: "#3B82F6",
        gradient: "from-blue-500 to-cyan-500",
        items: ["Earth", "Soil", "Water", "Air", "Fire", "Sunlight", "Moon", "Stars", "Sky", "Space", "Lightning", "Ice", "Climate", "Darkness"]
    },
    Natural_Landscapes_Features: {
        name: "Natural Landscapes",
        icon: Mountain,
        color: "#10B981",
        gradient: "from-emerald-500 to-teal-500",
        items: ["Mountains", "Rivers", "Oceans", "Forests", "Deserts", "Islands", "Valleys", "Grasslands", "Polar Regions", "Caves", "Wetlands", "Plateaus", "Volcanoes", "Coral Reefs"]
    },
    Living_Things: {
        name: "Living Things",
        icon: Leaf,
        color: "#22C55E",
        gradient: "from-green-500 to-lime-500",
        items: ["Plants", "Animals", "Microorganisms", "Insects", "Birds", "Fish", "Reptiles", "Humans", "Amphibians", "Fungi", "Mollusks", "Crustaceans", "Arachnids", "Algae", "Dinosaurs"]
    },
    Forces_Cycles: {
        name: "Forces & Cycles",
        icon: Zap,
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-500",
        items: ["Gravity", "Seasons", "Weather", "Energy", "Time", "Magnetism", "Water Cycle", "Life Cycles", "Tectonic Activity", "Evolution", "Photosynthesis", "Carbon Cycle", "Erosion", "Radiation"]
    },
    Cosmic_Celestial: {
        name: "Cosmic & Celestial",
        icon: Star,
        color: "#8B5CF6",
        gradient: "from-purple-500 to-indigo-500",
        items: ["Universe", "Galaxy", "Solar System", "Planets", "Asteroids", "Comets", "Black Holes", "Nebulae", "Constellations", "Exoplanets", "Supernovae", "Pulsars", "Quasars", "Dark Matter", "Dark Energy"]
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
                                ? 'text-gray-900 font-medium bg-gray-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                    <span key={i} className="px-2.5 py-1 bg-white/20 rounded-full text-sm font-medium">
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

function ItemDetailView({ item, category, onNavigateToTopic }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        fetchItemData();
        generateImage();
    }, [item]);

    const generateImage = async () => {
        setImageLoading(true);
        try {
            const response = await base44.integrations.Core.GenerateImage({
                prompt: `A stunning, educational scientific illustration of ${item} in the context of ${category?.name || 'natural world'}. Photorealistic, highly detailed, vibrant colors, professional scientific visualization style.`
            });
            setImageUrl(response?.url);
        } catch (error) {
            console.error('Failed to generate image:', error);
        } finally {
            setImageLoading(false);
        }
    };

    const fetchItemData = async () => {
        setLoading(true);
        setData(null);
        setError(false);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive intelligence data about "${item}" in the context of ${category?.name || 'natural world'}. Include:
1. Overview: A detailed description (3-4 sentences)
2. Key Facts: 5 interesting and fun facts
3. Significance: Why it matters to humans and the planet
4. Related Topics: 4 related concepts to explore
5. Current Research: Recent scientific discoveries or developments
6. Physical Composition: 5 key physical properties/characteristics with descriptions
7. Chemical Composition: 5 main chemical elements or compounds with percentages or descriptions
8. Mathematical Illustrations: 3 mathematical formulas or equations related to this topic with explanations
9. Research Data: 5 key statistics or research findings with numerical data
10. Subject Matter Experts: 4 notable scientists or researchers who study this topic with their contributions
11. Chart Data: Provide numerical data for visualization:
    - distributionData: 5 items with name and value (percentage distribution)
    - trendData: 6 data points showing trends over time (year and value)
    - comparisonData: 4 items comparing different aspects (name, valueA, valueB)
    - radarData: 5 attributes with scores (0-100) for a radar chart`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        keyFacts: { type: "array", items: { type: "string" } },
                        significance: { type: "string" },
                        relatedTopics: { type: "array", items: { type: "string" } },
                        currentResearch: { type: "string" },
                        physicalComposition: { type: "array", items: { type: "object", properties: { property: { type: "string" }, description: { type: "string" } } } },
                        chemicalComposition: { type: "array", items: { type: "object", properties: { element: { type: "string" }, percentage: { type: "string" }, description: { type: "string" } } } },
                        mathematicalIllustrations: { type: "array", items: { type: "object", properties: { formula: { type: "string" }, name: { type: "string" }, explanation: { type: "string" } } } },
                        researchData: { type: "array", items: { type: "object", properties: { statistic: { type: "string" }, value: { type: "string" }, source: { type: "string" } } } },
                        subjectMatterExperts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, field: { type: "string" }, contribution: { type: "string" } } } },
                        distributionData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                        trendData: { type: "array", items: { type: "object", properties: { year: { type: "string" }, value: { type: "number" } } } },
                        comparisonData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, valueA: { type: "number" }, valueB: { type: "number" } } } },
                        radarData: { type: "array", items: { type: "object", properties: { attribute: { type: "string" }, score: { type: "number" } } } }
                    }
                }
            });
            
            // Validate response has proper data
            if (!response || !response.overview || response.overview.length < 50 || 
                !response.keyFacts || response.keyFacts.length < 3 ||
                !response.distributionData || response.distributionData.length < 2) {
                // Data is incomplete, retry once
                console.log('Incomplete data received, retrying...');
                const retryResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Provide comprehensive intelligence data about "${item}" in the context of ${category?.name || 'natural world'}. Include:
1. Overview: A detailed description (3-4 sentences)
2. Key Facts: 5 interesting and fun facts
3. Significance: Why it matters to humans and the planet
4. Related Topics: 4 related concepts to explore
5. Current Research: Recent scientific discoveries or developments
6. Physical Composition: 5 key physical properties/characteristics with descriptions
7. Chemical Composition: 5 main chemical elements or compounds with percentages or descriptions
8. Mathematical Illustrations: 3 mathematical formulas or equations related to this topic with explanations
9. Research Data: 5 key statistics or research findings with numerical data
10. Subject Matter Experts: 4 notable scientists or researchers who study this topic with their contributions
11. Chart Data: Provide numerical data for visualization:
    - distributionData: 5 items with name and value (percentage distribution)
    - trendData: 6 data points showing trends over time (year and value)
    - comparisonData: 4 items comparing different aspects (name, valueA, valueB)
    - radarData: 5 attributes with scores (0-100) for a radar chart`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            overview: { type: "string" },
                            keyFacts: { type: "array", items: { type: "string" } },
                            significance: { type: "string" },
                            relatedTopics: { type: "array", items: { type: "string" } },
                            currentResearch: { type: "string" },
                            physicalComposition: { type: "array", items: { type: "object", properties: { property: { type: "string" }, description: { type: "string" } } } },
                            chemicalComposition: { type: "array", items: { type: "object", properties: { element: { type: "string" }, percentage: { type: "string" }, description: { type: "string" } } } },
                            mathematicalIllustrations: { type: "array", items: { type: "object", properties: { formula: { type: "string" }, name: { type: "string" }, explanation: { type: "string" } } } },
                            researchData: { type: "array", items: { type: "object", properties: { statistic: { type: "string" }, value: { type: "string" }, source: { type: "string" } } } },
                            subjectMatterExperts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, field: { type: "string" }, contribution: { type: "string" } } } },
                            distributionData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                            trendData: { type: "array", items: { type: "object", properties: { year: { type: "string" }, value: { type: "number" } } } },
                            comparisonData: { type: "array", items: { type: "object", properties: { name: { type: "string" }, valueA: { type: "number" }, valueB: { type: "number" } } } },
                            radarData: { type: "array", items: { type: "object", properties: { attribute: { type: "string" }, score: { type: "number" } } } }
                        }
                    }
                });
                setData(retryResponse);
            } else {
                setData(response);
            }
        } catch (error) {
            console.error('Failed to fetch item data:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: category?.color }} />
                <p className="text-gray-500">Loading intelligence data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Globe className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
                <p className="text-gray-500 mb-4">Unable to fetch intelligence data for {item}</p>
                <button 
                    onClick={fetchItemData}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header with Generated Image */}
            <div className={`bg-gradient-to-r ${category?.gradient || 'from-purple-600 to-indigo-600'} rounded-2xl p-6 mb-6 text-white`}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">{category?.name}</p>
                            <h2 className="text-2xl font-bold">{item}</h2>
                        </div>
                    </div>
                    {imageLoading ? (
                        <div className="w-full md:w-48 h-32 rounded-xl bg-white/20 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : imageUrl && (
                        <img src={imageUrl} alt={item} className="w-full md:w-48 h-32 object-cover rounded-xl" />
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5" style={{ color: category?.color }} />
                        Overview
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{data?.overview}</p>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Distribution Pie Chart */}
                    {data?.distributionData?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Distribution Analysis</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {data.distributionData.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Trend Line Chart */}
                    {data?.trendData?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Trend Over Time</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={data.trendData}>
                                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke={category?.color} strokeWidth={2} dot={{ fill: category?.color }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Comparison Bar Chart */}
                    {data?.comparisonData?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Comparative Analysis</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.comparisonData}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="valueA" fill={category?.color} name="Primary" />
                                    <Bar dataKey="valueB" fill={CHART_COLORS[1]} name="Secondary" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Radar Chart */}
                    {data?.radarData?.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Attribute Analysis</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={data.radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 10 }} />
                                    <Radar dataKey="score" stroke={category?.color} fill={category?.color} fillOpacity={0.5} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Fun Facts */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" style={{ color: category?.color }} />
                        Fun Facts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data?.keyFacts?.map((fact, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                    {i + 1}
                                </span>
                                <p className="text-gray-700 text-sm">{fact}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Physical Composition */}
                {data?.physicalComposition?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Atom className="w-5 h-5" style={{ color: category?.color }} />
                            Physical Composition
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data.physicalComposition.map((comp, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => onNavigateToTopic(comp.property)}
                                    className="p-4 rounded-lg border border-gray-100 hover:shadow-md hover:border-purple-300 transition-all text-left cursor-pointer group" 
                                    style={{ backgroundColor: `${category?.color}05` }}
                                >
                                    <h4 className="font-medium text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{comp.property}</h4>
                                    <p className="text-sm text-gray-600">{comp.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chemical Composition */}
                {data?.chemicalComposition?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FlaskConical className="w-5 h-5" style={{ color: category?.color }} />
                            Chemical Composition
                        </h3>
                        <div className="space-y-3">
                            {data.chemicalComposition.map((comp, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => onNavigateToTopic(comp.element)}
                                    className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 hover:shadow-md transition-all cursor-pointer group text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                        {comp.element?.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">{comp.element}</h4>
                                            <span className="text-sm font-semibold" style={{ color: category?.color }}>{comp.percentage}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{comp.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mathematical Illustrations */}
                {data?.mathematicalIllustrations?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5" style={{ color: category?.color }} />
                            Mathematical Illustrations
                        </h3>
                        <div className="space-y-4">
                            {data.mathematicalIllustrations.map((item, i) => (
                                <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: `${category?.color}10` }}>
                                    <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
                                    <div className="bg-white rounded-lg p-3 mb-2 font-mono text-center text-lg" style={{ color: category?.color }}>
                                        {item.formula}
                                    </div>
                                    <p className="text-sm text-gray-600">{item.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Research Data */}
                {data?.researchData?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" style={{ color: category?.color }} />
                            Research Data & Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.researchData.map((item, i) => (
                                <div key={i} className="p-4 border border-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">{item.statistic}</p>
                                    <p className="text-2xl font-bold" style={{ color: category?.color }}>{item.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">Source: {item.source}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Subject Matter Experts */}
                {data?.subjectMatterExperts?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: category?.color }} />
                            Subject Matter Experts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.subjectMatterExperts.map((expert, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                        {expert.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                                        <p className="text-sm text-gray-500 mb-1">{expert.field}</p>
                                        <p className="text-sm text-gray-600">{expert.contribution}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Why It Matters */}
                <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ backgroundColor: `${category?.color}08` }}>
                    <h3 className="font-semibold text-gray-900 mb-2">Why It Matters</h3>
                    <p className="text-gray-700">{data?.significance}</p>
                </div>
                
                {/* Related Topics */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {data?.relatedTopics?.map((topic, i) => (
                            <button 
                                key={i} 
                                onClick={() => onNavigateToTopic(topic)}
                                className="px-4 py-2 rounded-full text-sm font-medium hover:scale-105 hover:shadow-md transition-all cursor-pointer" 
                                style={{ backgroundColor: `${category?.color}15`, color: category?.color }}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Current Research */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Current Research</h3>
                    <p className="text-gray-600">{data?.currentResearch}</p>
                </div>
            </div>
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

    const handleCategoryClick = (categoryKey) => {
        setSelectedCategory(categoryKey);
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleBreadcrumbNavigate = (index) => {
        if (index === 0) {
            setSelectedCategory(null);
            setSelectedItem(null);
        } else if (index === 1) {
            setSelectedItem(null);
        }
    };

    const currentCategory = selectedCategory ? CATEGORIES[selectedCategory] : null;

    // Build breadcrumb items
    const breadcrumbItems = [{ label: 'Intelligence' }];
    if (selectedCategory) {
        breadcrumbItems.push({ label: currentCategory.name });
    }
    if (selectedItem) {
        breadcrumbItems.push({ label: selectedItem });
    }

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
                                <h1 className="text-2xl md:text-3xl font-bold">General Intelligence</h1>
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

                {/* Breadcrumb Navigation */}
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
                    <ItemDetailView 
                        item={selectedItem} 
                        category={currentCategory} 
                        onNavigateToTopic={(topic) => setSelectedItem(topic)}
                    />
                )}
            </div>
        </div>
    );
}