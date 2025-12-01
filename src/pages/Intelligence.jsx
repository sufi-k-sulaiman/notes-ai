import React, { useState, useEffect } from 'react';
import { 
    Brain, Loader2, ChevronRight, Sparkles,
    Globe, Mountain, Leaf, Zap, Star, Home,
    Atom, FlaskConical, Calculator, BookOpen, Users,
    Lightbulb, BarChart3, PieChart, TrendingUp, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
    BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Scatter, ScatterChart, RadialBarChart, RadialBar
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
        items: ["Gravity", "Seasons", "Weather", "Energy", "Time", "Magnetism", "Water Cycle", "Life Cycles", "Tectonic Activity", "Evolution"]
    },
    Cosmic_Celestial: {
        name: "Cosmic & Celestial",
        icon: Star,
        color: "#8B5CF6",
        gradient: "from-purple-500 to-indigo-500",
        items: ["Universe", "Galaxy", "Solar System", "Planets", "Asteroids", "Comets", "Black Holes", "Nebulae", "Constellations", "Exoplanets"]
    }
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

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

function ChartCard({ title, children, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color }} />
                {title}
            </h4>
            <div className="h-48">
                {children}
            </div>
        </div>
    );
}

function ItemDetailView({ item, category }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(true);

    useEffect(() => {
        fetchItemData();
        generateImages();
    }, [item]);

    const generateImages = async () => {
        setImagesLoading(true);
        try {
            const imagePromises = [
                base44.integrations.Core.GenerateImage({
                    prompt: `Beautiful scientific illustration of ${item}, detailed, educational, vibrant colors, professional quality`
                }),
                base44.integrations.Core.GenerateImage({
                    prompt: `Abstract artistic representation of ${item} showing its essence and characteristics, modern digital art style`
                })
            ];
            const results = await Promise.all(imagePromises);
            setGeneratedImages(results.map(r => r.url));
        } catch (error) {
            console.error('Failed to generate images:', error);
            setGeneratedImages([]);
        } finally {
            setImagesLoading(false);
        }
    };

    const fetchItemData = async () => {
        setLoading(true);
        setData(null);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert scientist. Generate ACCURATE, REAL, COMPLETE scientific data specifically about "${item}" in the category "${category?.name || 'natural world'}".

CRITICAL REQUIREMENTS:
- Every piece of data must be REAL and SPECIFIC to "${item}"
- ALL arrays must have AT LEAST 4-6 items each
- ALL chart data arrays must have AT LEAST 5 data points each with realistic numbers
- DO NOT return empty arrays - fill everything with real data

For "${item}", provide COMPLETE data:

1. OVERVIEW: 4-5 factual sentences about "${item}".

2. KEY FACTS: Exactly 8 real facts about "${item}" with numbers/measurements.

3. FUN FACTS: Exactly 5 surprising facts about "${item}".

4. SIGNIFICANCE: Why "${item}" matters scientifically.

5. PHYSICAL COMPOSITIONS for "${item}":
   - Structure: Detailed physical structure description
   - Measurable Properties: At least 5 properties with real values and units (temperature, density, size, mass, etc.)
   - Physical States: States "${item}" exists in
   - Metrics: Key measurements

6. CHEMICAL COMPOSITIONS for "${item}":
   - Elements: At least 4 elements with real percentages that sum close to 100%
   - Compounds: At least 4 key compounds/molecules
   - Properties: Chemical properties description
   - Molecular Structure: Molecular description

7. MATHEMATICAL ILLUSTRATIONS for "${item}":
   - Equations: At least 3 real equations with descriptions (physics formulas, rate equations specific to "${item}")
   - Models: At least 3 mathematical models used to study "${item}"
   - Geometric Representations: Geometric patterns in "${item}"
   - Statistical Patterns: Statistical patterns observed

8. RESEARCH DATA about "${item}":
   - Findings: Exactly 5 research discoveries with institution names and years (2015-2024)
   - Statistics: At least 4 statistics with values and sources
   - Recent Discoveries: At least 3 discoveries from 2020-2024
   - Ongoing Research: At least 4 current research areas

9. EXPERTS: Exactly 5 scientists who study "${item}" with institutions, specialties, contributions

10. CHART DATA - MUST have realistic numerical data for "${item}":
    - Distribution: 5-6 categories with percentage values (should sum to ~100)
    - Trend: 6 time periods with values showing change over time
    - Comparison: 4-5 items with valueA and valueB for comparison
    - Composition: 5-6 components with percentage values
    - Geographic: 5-6 regions with numerical values
    - Annual: 6 years (2019-2024) with values
    - Performance: 5-6 metrics with score (0-100) and max (100)
    - Correlation: 8-10 data points with x and y values
    - Ranking: 5-6 items with rank and score
    - Cyclical: 12 months with values showing seasonal patterns

11. RELATED TOPICS: 6 related scientific concepts

12. ATOMIC & MOLECULAR STRUCTURE for "${item}":
    - Atoms: 3-5 atoms with name, symbol, atomicNumber, electronConfig
    - Elements: 4-6 elements with name, symbol, atomicMass, state, group, role
    - Molecules: 3-5 molecules with name, formula, structure, properties
    - Bonds: 2-4 bond types with type, description, strength
    - Isotopes: 2-3 isotopes with name, symbol, halfLife, significance`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        keyFacts: { type: "array", items: { type: "string" } },
                        funFacts: { type: "array", items: { type: "string" } },
                        significance: { type: "string" },
                        physicalCompositions: {
                            type: "object",
                            properties: {
                                structure: { type: "string" },
                                measurableProperties: { type: "array", items: { type: "object", properties: { property: { type: "string" }, value: { type: "string" }, unit: { type: "string" } } } },
                                physicalStates: { type: "array", items: { type: "string" } },
                                metrics: { type: "string" }
                            }
                        },
                        chemicalCompositions: {
                            type: "object",
                            properties: {
                                elements: { type: "array", items: { type: "object", properties: { element: { type: "string" }, percentage: { type: "number" } } } },
                                compounds: { type: "array", items: { type: "string" } },
                                properties: { type: "string" },
                                molecularStructure: { type: "string" }
                            }
                        },
                        mathematicalIllustrations: {
                            type: "object",
                            properties: {
                                equations: { type: "array", items: { type: "object", properties: { equation: { type: "string" }, description: { type: "string" } } } },
                                models: { type: "array", items: { type: "string" } },
                                geometricRepresentations: { type: "string" },
                                statisticalPatterns: { type: "string" }
                            }
                        },
                        researchData: {
                            type: "object",
                            properties: {
                                findings: { type: "array", items: { type: "object", properties: { finding: { type: "string" }, source: { type: "string" }, year: { type: "number" } } } },
                                statistics: { type: "array", items: { type: "object", properties: { stat: { type: "string" }, value: { type: "string" }, source: { type: "string" } } } },
                                recentDiscoveries: { type: "array", items: { type: "string" } },
                                ongoingResearch: { type: "array", items: { type: "string" } }
                            }
                        },
                        experts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, institution: { type: "string" }, specialty: { type: "string" }, contribution: { type: "string" } } } },
                        chartData: {
                            type: "object",
                            properties: {
                                distribution: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                trend: { type: "array", items: { type: "object", properties: { period: { type: "string" }, value: { type: "number" } } } },
                                comparison: { type: "array", items: { type: "object", properties: { name: { type: "string" }, valueA: { type: "number" }, valueB: { type: "number" } } } },
                                composition: { type: "array", items: { type: "object", properties: { name: { type: "string" }, value: { type: "number" } } } },
                                geographic: { type: "array", items: { type: "object", properties: { region: { type: "string" }, value: { type: "number" } } } },
                                annual: { type: "array", items: { type: "object", properties: { year: { type: "number" }, value: { type: "number" } } } },
                                performance: { type: "array", items: { type: "object", properties: { metric: { type: "string" }, score: { type: "number" }, max: { type: "number" } } } },
                                correlation: { type: "array", items: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } } },
                                ranking: { type: "array", items: { type: "object", properties: { name: { type: "string" }, rank: { type: "number" }, score: { type: "number" } } } },
                                cyclical: { type: "array", items: { type: "object", properties: { month: { type: "string" }, value: { type: "number" } } } }
                            }
                        },
                        relatedTopics: { type: "array", items: { type: "string" } },
                        atomicStructure: {
                            type: "object",
                            properties: {
                                atoms: { type: "array", items: { type: "object", properties: { name: { type: "string" }, symbol: { type: "string" }, atomicNumber: { type: "number" }, electronConfig: { type: "string" } } } },
                                elements: { type: "array", items: { type: "object", properties: { name: { type: "string" }, symbol: { type: "string" }, atomicMass: { type: "number" }, state: { type: "string" }, group: { type: "string" }, role: { type: "string" } } } },
                                molecules: { type: "array", items: { type: "object", properties: { name: { type: "string" }, formula: { type: "string" }, structure: { type: "string" }, properties: { type: "string" } } } },
                                bonds: { type: "array", items: { type: "object", properties: { type: { type: "string" }, description: { type: "string" }, strength: { type: "string" } } } },
                                isotopes: { type: "array", items: { type: "object", properties: { name: { type: "string" }, symbol: { type: "string" }, halfLife: { type: "string" }, significance: { type: "string" } } } }
                            }
                        }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch item data:', error);
            // Retry once on error
            try {
                const retryResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Provide scientific facts about "${item}". Include overview, 5 key facts, significance, and 4 related topics.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            overview: { type: "string" },
                            keyFacts: { type: "array", items: { type: "string" } },
                            significance: { type: "string" },
                            relatedTopics: { type: "array", items: { type: "string" } }
                        }
                    }
                });
                setData({
                    ...retryResponse,
                    funFacts: retryResponse.keyFacts?.slice(0, 3) || [],
                    chartData: { distribution: [], trend: [], comparison: [], composition: [], geographic: [], annual: [], performance: [], correlation: [], ranking: [], cyclical: [] }
                });
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
                setData(null);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: category?.color }} />
                <p className="text-gray-500">Loading comprehensive intelligence data...</p>
                <p className="text-gray-400 text-sm mt-2">Generating charts, compositions, and research data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Failed to load data. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Generated Images */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: category?.color }} />
                    AI-Generated Visualizations
                </h3>
                {imagesLoading ? (
                    <div className="flex gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex-1 h-48 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedImages.map((url, i) => (
                            <img key={i} src={url} alt={`${item} visualization ${i + 1}`} className="w-full h-48 object-cover rounded-xl" />
                        ))}
                    </div>
                )}
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5" style={{ color: category?.color }} />
                    Overview
                </h3>
                <p className="text-gray-700 leading-relaxed">{data?.overview}</p>
            </div>

            {/* Fun Facts */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Fun Facts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data?.funFacts?.map((fact, i) => (
                        <div key={i} className="bg-white/80 rounded-lg p-3 flex items-start gap-3">
                            <span className="text-2xl">🎉</span>
                            <p className="text-gray-700 text-sm">{fact}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Section - 10 Dynamic Charts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" style={{ color: category?.color }} />
                    Data Visualizations & Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Distribution Pie Chart */}
                    <ChartCard title={`${item} Type Distribution`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={data?.chartData?.distribution || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(data?.chartData?.distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 2. Trend Line Chart */}
                    <ChartCard title={`${item} Historical Trends`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.chartData?.trend || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke={category?.color} strokeWidth={2} dot={{ fill: category?.color }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 3. Comparison Bar Chart */}
                    <ChartCard title={`${item} Comparative Metrics`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chartData?.comparison || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="valueA" fill={category?.color} name="Primary" />
                                <Bar dataKey="valueB" fill="#94A3B8" name="Secondary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 4. Composition Donut */}
                    <ChartCard title={`${item} Composition`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                                <Pie
                                    data={data?.chartData?.composition || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={60}
                                >
                                    {(data?.chartData?.composition || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 5. Geographic Bar */}
                    <ChartCard title={`${item} by Region`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chartData?.geographic || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 10 }} />
                                <YAxis dataKey="region" type="category" tick={{ fontSize: 10 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill={category?.color} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 6. Annual Area Chart */}
                    <ChartCard title={`${item} Annual Data (2019-2024)`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.chartData?.annual || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke={category?.color} fill={`${category?.color}40`} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 7. Performance Radar */}
                    <ChartCard title={`${item} Performance Scores`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={data?.chartData?.performance || []}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8 }} />
                                <PolarRadiusAxis tick={{ fontSize: 8 }} />
                                <Radar name="Score" dataKey="score" stroke={category?.color} fill={category?.color} fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 8. Correlation Scatter */}
                    <ChartCard title={`${item} Variable Correlation`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                                <YAxis dataKey="y" tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={data?.chartData?.correlation || []} fill={category?.color} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 9. Ranking Bar */}
                    <ChartCard title={`${item} Rankings`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.chartData?.ranking || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="score" fill={category?.color}>
                                    {(data?.chartData?.ranking || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* 10. Cyclical Pattern */}
                    <ChartCard title={`${item} Monthly Patterns`} color={category?.color}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data?.chartData?.cyclical || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" fill={`${category?.color}30`} stroke="none" />
                                <Line type="monotone" dataKey="value" stroke={category?.color} strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>
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

            {/* Physical Compositions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Atom className="w-5 h-5" style={{ color: category?.color }} />
                    Physical Compositions
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Structure</h4>
                        <p className="text-blue-700 text-sm">{data?.physicalCompositions?.structure}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Measurable Properties</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data?.physicalCompositions?.measurableProperties?.map((prop, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">{prop.property}</p>
                                    <p className="text-lg font-semibold" style={{ color: category?.color }}>{prop.value} <span className="text-sm text-gray-500">{prop.unit}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {data?.physicalCompositions?.physicalStates?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Physical States</h4>
                            <div className="flex flex-wrap gap-2">
                                {data?.physicalCompositions?.physicalStates?.map((state, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{state}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.physicalCompositions?.metrics && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Additional Metrics</h4>
                            <p className="text-gray-600 text-sm">{data?.physicalCompositions?.metrics}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chemical Compositions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" style={{ color: category?.color }} />
                    Chemical Compositions
                </h3>
                <div className="space-y-4">
                    {data?.chemicalCompositions?.elements?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Elemental Composition</h4>
                            <div className="space-y-2">
                                {data?.chemicalCompositions?.elements?.map((el, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-20 text-sm font-medium text-gray-700">{el.element}</span>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full" 
                                                style={{ width: `${el.percentage}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                            />
                                        </div>
                                        <span className="w-14 text-sm text-gray-600 text-right">{el.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.chemicalCompositions?.compounds?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Key Compounds</h4>
                            <div className="flex flex-wrap gap-2">
                                {data?.chemicalCompositions?.compounds?.map((compound, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{compound}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.chemicalCompositions?.properties && (
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Chemical Properties</h4>
                            <p className="text-green-700 text-sm">{data?.chemicalCompositions?.properties}</p>
                        </div>
                    )}
                    {data?.chemicalCompositions?.molecularStructure && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Molecular Structure</h4>
                            <p className="text-gray-600 text-sm">{data?.chemicalCompositions?.molecularStructure}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mathematical Illustrations */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" style={{ color: category?.color }} />
                    Mathematical Illustrations
                </h3>
                <div className="space-y-4">
                    {data?.mathematicalIllustrations?.equations?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Key Equations</h4>
                            <div className="space-y-3">
                                {data?.mathematicalIllustrations?.equations?.map((eq, i) => (
                                    <div key={i} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                                        <p className="font-mono text-lg text-purple-800 mb-2">{eq.equation}</p>
                                        <p className="text-purple-600 text-sm">{eq.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.mathematicalIllustrations?.models?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Mathematical Models</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data?.mathematicalIllustrations?.models?.map((model, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-purple-500" />
                                        <p className="text-gray-700 text-sm">{model}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.mathematicalIllustrations?.geometricRepresentations && (
                        <div className="p-4 bg-indigo-50 rounded-lg">
                            <h4 className="font-medium text-indigo-800 mb-2">Geometric Representations</h4>
                            <p className="text-indigo-700 text-sm">{data?.mathematicalIllustrations?.geometricRepresentations}</p>
                        </div>
                    )}
                    {data?.mathematicalIllustrations?.statisticalPatterns && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Statistical Patterns</h4>
                            <p className="text-gray-600 text-sm">{data?.mathematicalIllustrations?.statisticalPatterns}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Research Data */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: category?.color }} />
                    Research Data
                </h3>
                <div className="space-y-4">
                    {data?.researchData?.findings?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Key Research Findings</h4>
                            <div className="space-y-3">
                                {data?.researchData?.findings?.map((finding, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-800 mb-2">{finding.finding}</p>
                                        <p className="text-xs text-gray-500">Source: {finding.source} ({finding.year})</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.researchData?.statistics?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Statistical Data</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {data?.researchData?.statistics?.map((stat, i) => (
                                    <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: `${category?.color}10` }}>
                                        <p className="text-2xl font-bold" style={{ color: category?.color }}>{stat.value}</p>
                                        <p className="text-sm text-gray-700">{stat.stat}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stat.source}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.researchData?.recentDiscoveries?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Recent Discoveries (2020-2024)</h4>
                            <div className="space-y-2">
                                {data?.researchData?.recentDiscoveries?.map((discovery, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                                        <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-emerald-800 text-sm">{discovery}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {data?.researchData?.ongoingResearch?.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">Ongoing Research Areas</h4>
                            <div className="flex flex-wrap gap-2">
                                {data?.researchData?.ongoingResearch?.map((area, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">{area}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subject Matter Experts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: category?.color }} />
                    Subject Matter Experts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.experts?.map((expert, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}>
                                    {expert.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                                    <p className="text-sm text-gray-600">{expert.institution}</p>
                                    <p className="text-xs text-gray-500 mt-1">Specialty: {expert.specialty}</p>
                                    <p className="text-sm text-gray-700 mt-2">{expert.contribution}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Significance */}
            <div className="rounded-xl border p-5" style={{ backgroundColor: `${category?.color}08`, borderColor: `${category?.color}30` }}>
                <h3 className="font-semibold text-gray-900 mb-2">Why It Matters</h3>
                <p className="text-gray-700">{data?.significance}</p>
            </div>

            {/* Atomic & Molecular Structure */}
            {data?.atomicStructure && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Atom className="w-5 h-5" style={{ color: category?.color }} />
                        Atoms, Elements & Molecules
                    </h3>
                    <div className="space-y-6">
                        {/* Atoms */}
                        {data?.atomicStructure?.atoms?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">⚛</span>
                                    Constituent Atoms
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data?.atomicStructure?.atoms?.map((atom, i) => (
                                        <div key={i} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                                    {atom.symbol}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{atom.name}</p>
                                                    <p className="text-xs text-gray-500">Atomic # {atom.atomicNumber}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-indigo-600 font-mono bg-white/50 px-2 py-1 rounded">{atom.electronConfig}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Elements */}
                        {data?.atomicStructure?.elements?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">E</span>
                                    Key Elements
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Element</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Symbol</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Atomic Mass</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">State</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Group</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.atomicStructure?.elements?.map((el, i) => (
                                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{el.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono font-bold">{el.symbol}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{el.atomicMass} u</td>
                                                    <td className="px-4 py-3 text-gray-600">{el.state}</td>
                                                    <td className="px-4 py-3 text-gray-600">{el.group}</td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">{el.role}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Molecules */}
                        {data?.atomicStructure?.molecules?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">M</span>
                                    Key Molecules
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data?.atomicStructure?.molecules?.map((mol, i) => (
                                        <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                            <div className="flex items-start justify-between mb-2">
                                                <h5 className="font-semibold text-gray-900">{mol.name}</h5>
                                                <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-mono">{mol.formula}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{mol.structure}</p>
                                            <p className="text-xs text-blue-700 bg-white/50 px-2 py-1 rounded">{mol.properties}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chemical Bonds */}
                        {data?.atomicStructure?.bonds?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">⚡</span>
                                    Chemical Bonds
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data?.atomicStructure?.bonds?.map((bond, i) => (
                                        <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="font-semibold text-amber-800">{bond.type}</p>
                                            <p className="text-sm text-gray-600 mt-1">{bond.description}</p>
                                            <p className="text-xs text-amber-600 mt-2">Strength: {bond.strength}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Isotopes */}
                        {data?.atomicStructure?.isotopes?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">☢</span>
                                    Relevant Isotopes
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data?.atomicStructure?.isotopes?.map((iso, i) => (
                                        <div key={i} className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-rose-500 text-white rounded font-mono text-sm">{iso.symbol}</span>
                                                <span className="font-semibold text-gray-900">{iso.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">Half-life: {iso.halfLife}</p>
                                            <p className="text-xs text-rose-700 mt-2">{iso.significance}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Related Topics */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                    {data?.relatedTopics?.map((topic, i) => (
                        <span key={i} className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: `${category?.color}15`, color: category?.color }}>
                            {topic}
                        </span>
                    ))}
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

                <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNavigate} />

                {!selectedCategory ? (
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
                    <ItemDetailView item={selectedItem} category={currentCategory} />
                )}
            </div>
        </div>
    );
}