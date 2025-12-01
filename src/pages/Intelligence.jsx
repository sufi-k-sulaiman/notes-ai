import React, { useState, useEffect } from 'react';
import { 
    Brain, Loader2, ChevronRight, Sparkles,
    Globe, Mountain, Leaf, Zap, Star, Home, TrendingUp, BarChart3, PieChart, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { 
    BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

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
        items: ["Mountains", "Rivers", "Oceans", "Forests", "Deserts", "Islands", "Valleys", "Grasslands", "Polar Regions", "Caves"]
    },
    Living_Things: {
        name: "Living Things",
        icon: Leaf,
        color: "#22C55E",
        gradient: "from-green-500 to-lime-500",
        items: ["Plants", "Animals", "Microorganisms", "Insects", "Birds", "Fish", "Reptiles", "Humans", "Amphibians", "Fungi"]
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

const CHART_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

function ItemDetailView({ item, category }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [images, setImages] = useState([]);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        fetchItemData();
        generateImages();
    }, [item]);

    const generateImages = async () => {
        setImageLoading(true);
        try {
            const prompts = [
                `Beautiful realistic photograph of ${item}, natural lighting, high detail, 4k quality`,
                `Artistic illustration of ${item} in its natural environment, vibrant colors, detailed`
            ];
            const imagePromises = prompts.map(prompt => 
                base44.integrations.Core.GenerateImage({ prompt })
            );
            const results = await Promise.all(imagePromises);
            setImages(results.map(r => r.url));
        } catch (error) {
            console.error('Failed to generate images:', error);
        } finally {
            setImageLoading(false);
        }
    };

    const fetchItemData = async () => {
        setLoading(true);
        setData(null);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive intelligence data about "${item}" in the context of ${category?.name || 'natural world'}. Include:
1. Overview: A detailed description (3-4 sentences)
2. Key Facts: 8 interesting and fun facts
3. Significance: Why it matters to humans and the planet
4. Related Topics: 4 related concepts to explore
5. Current Research: Recent scientific discoveries or developments
6. Fun Facts: 5 surprising or amusing facts
7. Physical Compositions: 5 items describing physical properties, structure, states of matter, physical characteristics with name and description
8. Chemical Compositions: 5 items describing chemical elements, compounds, molecular structure, reactions with name, formula, and description
9. Mathematical Illustrations: 5 items with mathematical formulas, equations, or models that describe this topic with name, formula, and explanation
10. Research Data: 5 recent research findings or studies with title, institution, year, and finding
11. Subject Matter Experts: 5 notable experts or scientists who study this topic with name, affiliation, specialty, and contribution
12. Charts Data - Generate realistic data for 10 different charts:
   - trendData: Array of 12 monthly data points with month, value, growth fields (showing trends over a year)
   - distributionData: Array of 5 items with name, value for pie chart
   - comparisonData: Array of 6 items with category, current, previous for comparison
   - radarData: Array of 6 items with subject, score (0-100), fullMark (100)
   - areaData: Array of 12 items with month, primary, secondary values
   - barData: Array of 8 items with name, value, benchmark
   - progressData: Array of 5 items with name, value, fill color
   - timelineData: Array of 10 items with year, metric1, metric2
   - compositionData: Array of 4 items with name, value, percentage
   - correlationData: Array of 8 items with x, y, size values`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        keyFacts: { type: "array", items: { type: "string" } },
                        significance: { type: "string" },
                        relatedTopics: { type: "array", items: { type: "string" } },
                        currentResearch: { type: "string" },
                        funFacts: { type: "array", items: { type: "string" } },
                        physicalCompositions: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } } },
                        chemicalCompositions: { type: "array", items: { type: "object", properties: { name: { type: "string" }, formula: { type: "string" }, description: { type: "string" } } } },
                        mathematicalIllustrations: { type: "array", items: { type: "object", properties: { name: { type: "string" }, formula: { type: "string" }, explanation: { type: "string" } } } },
                        researchData: { type: "array", items: { type: "object", properties: { title: { type: "string" }, institution: { type: "string" }, year: { type: "string" }, finding: { type: "string" } } } },
                        subjectMatterExperts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, affiliation: { type: "string" }, specialty: { type: "string" }, contribution: { type: "string" } } } },
                        trendData: { type: "array", items: { type: "object" } },
                        distributionData: { type: "array", items: { type: "object" } },
                        comparisonData: { type: "array", items: { type: "object" } },
                        radarData: { type: "array", items: { type: "object" } },
                        areaData: { type: "array", items: { type: "object" } },
                        barData: { type: "array", items: { type: "object" } },
                        progressData: { type: "array", items: { type: "object" } },
                        timelineData: { type: "array", items: { type: "object" } },
                        compositionData: { type: "array", items: { type: "object" } },
                        correlationData: { type: "array", items: { type: "object" } }
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
                currentResearch: 'Research data is being compiled.',
                funFacts: ['Loading fun facts...'],
                trendData: [],
                distributionData: [],
                comparisonData: [],
                radarData: [],
                areaData: [],
                barData: [],
                progressData: [],
                timelineData: [],
                compositionData: [],
                correlationData: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: category?.color }} />
                <p className="text-gray-500">Loading intelligence data...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className={`bg-gradient-to-r ${category?.gradient || 'from-purple-600 to-indigo-600'} rounded-2xl p-6 mb-6 text-white`}>
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

            {/* Generated Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {imageLoading ? (
                    <>
                        <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                        <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    </>
                ) : images.map((img, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl shadow-lg">
                        <img src={img} alt={`${item} ${i + 1}`} className="w-full h-64 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <p className="text-white text-sm font-medium">{i === 0 ? 'Realistic View' : 'Artistic Illustration'}</p>
                        </div>
                    </div>
                ))}
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

                {/* Fun Facts Banner */}
                {data?.funFacts?.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                        <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            Fun Facts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data.funFacts.map((fact, i) => (
                                <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-amber-100">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">🎉</span>
                                        <p className="text-gray-700 text-sm">{fact}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Physical Compositions */}
                {data?.physicalCompositions?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Mountain className="w-5 h-5" style={{ color: category?.color }} />
                            Physical Compositions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.physicalCompositions.map((item, i) => (
                                <div key={i} className="p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chemical Compositions */}
                {data?.chemicalCompositions?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" style={{ color: category?.color }} />
                            Chemical Compositions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.chemicalCompositions.map((item, i) => (
                                <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">{item.formula}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mathematical Illustrations */}
                {data?.mathematicalIllustrations?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" style={{ color: category?.color }} />
                            Mathematical Illustrations
                        </h3>
                        <div className="space-y-4">
                            {data.mathematicalIllustrations.map((item, i) => (
                                <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <code className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-mono rounded-lg">{item.formula}</code>
                                    </div>
                                    <p className="text-gray-600 text-sm">{item.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Research Data */}
                {data?.researchData?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" style={{ color: category?.color }} />
                            Research Data
                        </h3>
                        <div className="space-y-4">
                            {data.researchData.map((item, i) => (
                                <div key={i} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">{item.year}</span>
                                    </div>
                                    <p className="text-emerald-700 text-sm font-medium mb-1">{item.institution}</p>
                                    <p className="text-gray-600 text-sm">{item.finding}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Subject Matter Experts */}
                {data?.subjectMatterExperts?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5" style={{ color: category?.color }} />
                            Subject Matter Experts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.subjectMatterExperts.map((expert, i) => (
                                <div key={i} className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: category?.color }}>
                                            {expert.name?.charAt(0) || 'E'}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{expert.name}</h4>
                                            <p className="text-violet-600 text-xs">{expert.affiliation}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-1"><strong>Specialty:</strong> {expert.specialty}</p>
                                    <p className="text-gray-600 text-sm">{expert.contribution}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" style={{ color: category?.color }} />
                        Data Visualizations
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chart 1: Trend Line */}
                        {data?.trendData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Annual Trends
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={data.trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke={category?.color} strokeWidth={2} dot={{ fill: category?.color }} />
                                        <Line type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 2: Distribution Pie */}
                        {data?.distributionData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <PieChart className="w-4 h-4" /> Distribution
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RechartsPie>
                                        <Pie data={data.distributionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                                            {data.distributionData.map((entry, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 3: Comparison Bar */}
                        {data?.comparisonData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" /> Comparison Analysis
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data.comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Bar dataKey="current" fill={category?.color} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="previous" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 4: Radar */}
                        {data?.radarData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Multi-Factor Analysis
                                </h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={data.radarData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis tick={{ fontSize: 8 }} />
                                        <Radar name="Score" dataKey="score" stroke={category?.color} fill={category?.color} fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 5: Area Chart */}
                        {data?.areaData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Patterns</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={data.areaData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="primary" stackId="1" stroke={category?.color} fill={category?.color} fillOpacity={0.6} />
                                        <Area type="monotone" dataKey="secondary" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 6: Horizontal Bar */}
                        {data?.barData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data.barData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 10 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill={category?.color} radius={[0, 4, 4, 0]} />
                                        <Bar dataKey="benchmark" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 7: Radial Progress */}
                        {data?.progressData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Progress Indicators</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data.progressData.map((d, i) => ({ ...d, fill: CHART_COLORS[i % CHART_COLORS.length] }))}>
                                        <RadialBar background dataKey="value" />
                                        <Tooltip />
                                        <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 8: Timeline */}
                        {data?.timelineData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Historical Timeline</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={data.timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="metric1" stroke={category?.color} strokeWidth={2} />
                                        <Line type="monotone" dataKey="metric2" stroke="#F59E0B" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 9: Composition */}
                        {data?.compositionData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Composition Breakdown</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={data.compositionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {data.compositionData.map((entry, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Chart 10: Scatter/Bubble approximation with area */}
                        {data?.correlationData?.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Correlation Analysis</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={data.correlationData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="y" stroke={category?.color} fill={category?.color} fillOpacity={0.3} />
                                        <Area type="monotone" dataKey="size" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* Key Facts */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" style={{ color: category?.color }} />
                        Key Facts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data?.keyFacts?.map((fact, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: category?.color }}>
                                    {i + 1}
                                </span>
                                <p className="text-gray-700 text-sm">{fact}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Significance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5" style={{ backgroundColor: `${category?.color}08` }}>
                    <h3 className="font-semibold text-gray-900 mb-2">Why It Matters</h3>
                    <p className="text-gray-700">{data?.significance}</p>
                </div>
                
                {/* Related Topics */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {data?.relatedTopics?.map((topic, i) => (
                            <span key={i} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                                {topic}
                            </span>
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
                    <ItemDetailView item={selectedItem} category={currentCategory} />
                )}
            </div>
        </div>
    );
}