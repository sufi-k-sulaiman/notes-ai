import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Eye, 
    BookOpen, GraduationCap, Lightbulb, Globe, Calendar, Heart, Sun,
    ChevronRight, Home, Loader2, TrendingUp, BarChart3, Shield,
    Leaf, Clock, MapPin, AlertTriangle, Activity, Search, Filter, 
    Sparkles, Quote, Compass, Waves, Gauge, Umbrella
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const WEATHER_PHENOMENA = {
    atmospheric: { name: 'Atmospheric', icon: Wind, color: '#3B82F6' },
    precipitation: { name: 'Precipitation', icon: CloudRain, color: '#06B6D4' },
    temperature: { name: 'Temperature', icon: Thermometer, color: '#EF4444' },
    severe: { name: 'Severe Weather', icon: CloudLightning, color: '#8B5CF6' }
};

const TABS = [
    { id: 'understanding', label: 'Understanding', icon: Lightbulb },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'knowledge', label: 'Knowledge', icon: Globe },
    { id: 'wisdom', label: 'Wisdom', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];

function Breadcrumb({ items }) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {index === 0 && <Home className="w-4 h-4" />}
                            {item.label}
                        </Link>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-blue-600 font-medium bg-blue-50">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

function WeatherQuote({ quote, source }) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
                <Quote className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                    <p className="text-gray-700 italic">"{quote}"</p>
                    <p className="text-sm text-blue-600 mt-1">— {source}</p>
                </div>
            </div>
        </div>
    );
}

function UnderstandingView() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Explain weather phenomena with focus on the WHY behind events. Include:
1. What is weather - fundamental explanation
2. Key atmospheric processes that drive weather
3. How weather systems form and move
4. The water cycle's role in weather
5. Why weather prediction is challenging
6. Cause-and-effect relationships in weather patterns`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        whatIsWeather: { type: "string" },
                        atmosphericProcesses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    explanation: { type: "string" },
                                    whyItMatters: { type: "string" }
                                }
                            }
                        },
                        weatherSystems: { type: "string" },
                        waterCycle: { type: "string" },
                        predictionChallenges: { type: "array", items: { type: "string" } },
                        causeEffect: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    cause: { type: "string" },
                                    effect: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch understanding data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading weather understanding...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">What is Weather?</h3>
                <p className="text-white/90 leading-relaxed">{data?.whatIsWeather}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.atmosphericProcesses?.map((process, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Wind className="w-5 h-5 text-blue-500" />
                            {process.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">{process.explanation}</p>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700"><strong>Why it matters:</strong> {process.whyItMatters}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Waves className="w-5 h-5 text-cyan-500" />
                    The Water Cycle
                </h3>
                <p className="text-gray-700 leading-relaxed">{data?.waterCycle}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Cause & Effect in Weather</h3>
                <div className="space-y-3">
                    {data?.causeEffect?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 p-3 bg-amber-100 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">Cause: {item.cause}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                            <div className="flex-1 p-3 bg-blue-100 rounded-lg">
                                <p className="text-sm font-medium text-blue-800">Effect: {item.effect}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Why Weather Prediction is Challenging
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data?.predictionChallenges?.map((challenge, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="text-amber-600">•</span>
                            <p className="text-sm text-amber-800">{challenge}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function EncyclopediaView({ onSelectTopic }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a comprehensive weather encyclopedia with 16 entries across categories: Atmospheric (pressure systems, fronts, jet stream, wind patterns), Precipitation (rain, snow, hail, fog), Temperature (heat waves, cold snaps, inversions), Severe (hurricanes, tornadoes, thunderstorms, blizzards). Each entry needs title, brief description, and category.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        entries: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    category: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setEntries(response?.entries || []);
        } catch (error) {
            console.error('Failed to fetch encyclopedia:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter(e => 
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = [...new Set(entries.map(e => e.category))];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading encyclopedia...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Search weather phenomena..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12"
                />
            </div>

            {categories.map(category => {
                const catConfig = Object.values(WEATHER_PHENOMENA).find(p => p.name === category) || { icon: Cloud, color: '#6B7280' };
                const CatIcon = catConfig.icon;
                
                return (
                    <div key={category}>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CatIcon className="w-5 h-5" style={{ color: catConfig.color }} />
                            {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredEntries.filter(e => e.category === category).map((entry, i) => (
                                <div 
                                    key={i}
                                    onClick={() => onSelectTopic(entry)}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all group"
                                >
                                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">{entry.title}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">{entry.description}</p>
                                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function EducationView() {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [moduleContent, setModuleContent] = useState(null);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 6 interactive weather education modules: 1) Reading Weather Maps, 2) Understanding Radar & Satellite, 3) Cloud Identification Guide, 4) Storm Safety Essentials, 5) Climate vs Weather, 6) Meteorology Careers. Include title, description, difficulty, duration.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        modules: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    difficulty: { type: "string" },
                                    duration: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setModules(response?.modules || []);
        } catch (error) {
            console.error('Failed to fetch modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadModuleContent = async (module) => {
        setSelectedModule(module);
        setModuleContent(null);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Create comprehensive educational content for "${module.title}". Include: introduction, 5 key concepts with visual descriptions, a real-world case study, 3 quiz questions, practical applications, and summary.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        introduction: { type: "string" },
                        keyConcepts: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    explanation: { type: "string" },
                                    visualTip: { type: "string" }
                                }
                            }
                        },
                        caseStudy: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                lessons: { type: "array", items: { type: "string" } }
                            }
                        },
                        practicalApplications: { type: "array", items: { type: "string" } },
                        summary: { type: "string" }
                    }
                }
            });
            setModuleContent(response);
        } catch (error) {
            console.error('Failed to load module:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
                <p className="text-gray-500">Loading education modules...</p>
            </div>
        );
    }

    if (selectedModule) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={() => setSelectedModule(null)}>← Back to Modules</Button>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                    <p className="text-sm text-white/70 mb-1">{selectedModule.difficulty} • {selectedModule.duration}</p>
                    <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                </div>

                {!moduleContent ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-3" />
                        <p className="text-gray-500">Loading lesson content...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Introduction</h3>
                            <p className="text-gray-700">{moduleContent.introduction}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Key Concepts</h3>
                            {moduleContent.keyConcepts?.map((concept, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-start gap-4">
                                        <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">{concept.title}</h4>
                                            <p className="text-gray-600 text-sm mb-2">{concept.explanation}</p>
                                            <div className="p-2 bg-green-50 rounded-lg">
                                                <p className="text-xs text-green-700"><Eye className="w-3 h-3 inline mr-1" /> {concept.visualTip}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-6">
                            <h3 className="font-semibold text-cyan-900 mb-3">Practical Applications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {moduleContent.practicalApplications?.map((app, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                                        <Sparkles className="w-4 h-4 text-cyan-500 mt-0.5" />
                                        <p className="text-sm text-gray-700">{app}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                            <p className="text-gray-700">{moduleContent.summary}</p>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, i) => (
                <div 
                    key={i}
                    onClick={() => loadModuleContent(module)}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-green-200 cursor-pointer transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                        <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-green-600 mb-2">{module.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{module.difficulty}</span>
                        <span>{module.duration}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function KnowledgeView() {
    const [loading, setLoading] = useState(true);
    const [knowledge, setKnowledge] = useState(null);

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const fetchKnowledge = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide historical, cultural, and scientific weather knowledge including:
1. Historical weather events that changed history (5 events)
2. Weather in different cultures - myths and traditions (5 cultures)
3. Scientific breakthroughs in meteorology (5 breakthroughs)
4. Climate patterns and long-term trends
5. Global weather systems comparison`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        historicalEvents: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    event: { type: "string" },
                                    year: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        culturalWisdom: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    culture: { type: "string" },
                                    belief: { type: "string" },
                                    meaning: { type: "string" }
                                }
                            }
                        },
                        scientificBreakthroughs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    breakthrough: { type: "string" },
                                    scientist: { type: "string" },
                                    significance: { type: "string" }
                                }
                            }
                        },
                        climatePatterns: { type: "string" },
                        globalComparison: { type: "string" }
                    }
                }
            });
            setKnowledge(response);
        } catch (error) {
            console.error('Failed to fetch knowledge:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-500">Loading weather knowledge...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    Historical Weather Events
                </h3>
                <div className="space-y-4">
                    {knowledge?.historicalEvents?.map((event, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-bold">{event.year}</span>
                            <div>
                                <h4 className="font-medium text-amber-900">{event.event}</h4>
                                <p className="text-sm text-amber-700 mt-1">{event.impact}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Weather Across Cultures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {knowledge?.culturalWisdom?.map((item, i) => (
                        <div key={i} className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-medium text-blue-900">{item.culture}</h4>
                            <p className="text-sm text-blue-700 mt-1 italic">"{item.belief}"</p>
                            <p className="text-xs text-blue-600 mt-2">{item.meaning}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-500" />
                    Scientific Breakthroughs
                </h3>
                <div className="space-y-4">
                    {knowledge?.scientificBreakthroughs?.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                            <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">{i + 1}</span>
                            <div>
                                <h4 className="font-medium text-green-900">{item.breakthrough}</h4>
                                <p className="text-sm text-green-600">By {item.scientist}</p>
                                <p className="text-sm text-green-700 mt-1">{item.significance}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
                    <h3 className="font-semibold text-purple-900 mb-3">Climate Patterns</h3>
                    <p className="text-purple-800 text-sm leading-relaxed">{knowledge?.climatePatterns}</p>
                </div>
                <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-6">
                    <h3 className="font-semibold text-cyan-900 mb-3">Global Weather Comparison</h3>
                    <p className="text-cyan-800 text-sm leading-relaxed">{knowledge?.globalComparison}</p>
                </div>
            </div>
        </div>
    );
}

function WisdomView() {
    const [loading, setLoading] = useState(true);
    const [wisdom, setWisdom] = useState(null);

    useEffect(() => {
        fetchWisdom();
    }, []);

    const fetchWisdom = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate actionable weather wisdom including:
1. Daily life tips based on weather conditions (5 tips)
2. Health guidance for different weather (5 points)
3. Safety wisdom for severe weather (5 points)
4. Sustainability tips related to weather (5 tips)
5. Philosophical reflections on weather and nature (3 reflections)
6. Weather proverbs from around the world (5 proverbs with meanings)`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        dailyTips: { type: "array", items: { type: "string" } },
                        healthGuidance: { type: "array", items: { type: "string" } },
                        safetyWisdom: { type: "array", items: { type: "string" } },
                        sustainabilityTips: { type: "array", items: { type: "string" } },
                        reflections: { type: "array", items: { type: "string" } },
                        proverbs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    proverb: { type: "string" },
                                    origin: { type: "string" },
                                    meaning: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setWisdom(response);
        } catch (error) {
            console.error('Failed to fetch wisdom:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-500">Gathering wisdom...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Philosophical Reflections */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
                <Sparkles className="w-8 h-8 mb-3 text-white/80" />
                <div className="space-y-4">
                    {wisdom?.reflections?.map((reflection, i) => (
                        <p key={i} className="text-white/90 leading-relaxed border-l-2 border-white/30 pl-4">{reflection}</p>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        Daily Life Tips
                    </h3>
                    <div className="space-y-3">
                        {wisdom?.dailyTips?.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                <span className="text-amber-500">☀️</span>
                                <p className="text-sm text-gray-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Health Guidance
                    </h3>
                    <div className="space-y-3">
                        {wisdom?.healthGuidance?.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                <span className="text-red-500">❤️</span>
                                <p className="text-sm text-gray-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Safety Wisdom
                    </h3>
                    <div className="space-y-3">
                        {wisdom?.safetyWisdom?.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <span className="text-blue-500">🛡️</span>
                                <p className="text-sm text-gray-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        Sustainability Tips
                    </h3>
                    <div className="space-y-3">
                        {wisdom?.sustainabilityTips?.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <span className="text-green-500">🌱</span>
                                <p className="text-sm text-gray-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* World Proverbs */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-500" />
                    Weather Proverbs Around the World
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wisdom?.proverbs?.map((item, i) => (
                        <div key={i} className="p-4 bg-purple-50 rounded-xl">
                            <p className="font-medium text-purple-900 italic">"{item.proverb}"</p>
                            <p className="text-sm text-purple-600 mt-1">— {item.origin}</p>
                            <p className="text-xs text-gray-600 mt-2">{item.meaning}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AnalyticsView() {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate weather analytics data including:
1. Temperature trends for 12 months (avg high, avg low)
2. Precipitation by month (rainfall in inches)
3. Severe weather frequency by type (hurricanes, tornadoes, floods, etc.)
4. Air quality index components
5. Wind patterns by direction (N, NE, E, SE, S, SW, W, NW with percentages)`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        temperatureTrends: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    month: { type: "string" },
                                    high: { type: "number" },
                                    low: { type: "number" }
                                }
                            }
                        },
                        precipitation: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    month: { type: "string" },
                                    rainfall: { type: "number" }
                                }
                            }
                        },
                        severeWeather: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    frequency: { type: "number" }
                                }
                            }
                        },
                        airQuality: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    component: { type: "string" },
                                    value: { type: "number" }
                                }
                            }
                        },
                        windPatterns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    direction: { type: "string" },
                                    percentage: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });
            setChartData(response);
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Trends */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Annual Temperature Trends</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData?.temperatureTrends}>
                            <defs>
                                <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="high" stroke="#EF4444" fill="url(#highGradient)" strokeWidth={2} />
                            <Area type="monotone" dataKey="low" stroke="#3B82F6" fill="url(#lowGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-3 text-sm">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> High</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Low</span>
                    </div>
                </div>

                {/* Precipitation */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Monthly Precipitation</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData?.precipitation}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="rainfall" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Severe Weather */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Severe Weather Frequency</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData?.severeWeather}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="frequency"
                                nameKey="type"
                                label={({ type }) => type}
                            >
                                {chartData?.severeWeather?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Wind Patterns */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Wind Direction Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={chartData?.windPatterns}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="direction" tick={{ fontSize: 10 }} />
                            <Radar name="Wind %" dataKey="percentage" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Air Quality */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Air Quality Components</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData?.airQuality} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="component" type="category" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function TopicDetailView({ topic }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchTopicData();
    }, [topic]);

    const fetchTopicData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide comprehensive encyclopedia entry for weather phenomenon "${topic.title}". Include:
1. Full definition and scientific explanation
2. How it forms - the process
3. Types or variations
4. Where it occurs globally
5. Impact on humans and environment
6. Safety considerations
7. Interesting facts`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        definition: { type: "string" },
                        formation: { type: "string" },
                        types: { type: "array", items: { type: "string" } },
                        globalOccurrence: { type: "string" },
                        impact: { type: "string" },
                        safety: { type: "array", items: { type: "string" } },
                        facts: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch topic:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">Loading encyclopedia entry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <p className="text-sm text-white/70 mb-1">{topic.category}</p>
                <h2 className="text-2xl font-bold">{topic.title}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Definition</h3>
                        <p className="text-gray-700 leading-relaxed">{data?.definition}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">How It Forms</h3>
                        <p className="text-gray-700 leading-relaxed">{data?.formation}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Impact</h3>
                        <p className="text-gray-700 leading-relaxed">{data?.impact}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Global Occurrence</h3>
                        <p className="text-gray-700 leading-relaxed">{data?.globalOccurrence}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                        <h3 className="font-semibold text-blue-900 mb-3">Types & Variations</h3>
                        <div className="space-y-2">
                            {data?.types?.map((type, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Cloud className="w-4 h-4 text-blue-500" />
                                    <p className="text-sm text-blue-800">{type}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                        <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Safety Tips
                        </h3>
                        <div className="space-y-2">
                            {data?.safety?.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-red-500">•</span>
                                    <p className="text-sm text-red-800">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                        <h3 className="font-semibold text-amber-900 mb-3">Interesting Facts</h3>
                        <div className="space-y-2">
                            {data?.facts?.map((fact, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <p className="text-sm text-amber-800">{fact}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Weather() {
    useEffect(() => {
        document.title = 'Weather - Intelligence Encyclopedia';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Comprehensive weather understanding through encyclopedia, education, and wisdom.');
    }, []);

    const [activeTab, setActiveTab] = useState('understanding');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [dailyQuote] = useState({
        quote: "Sunshine is delicious, rain is refreshing, wind braces us up, snow is exhilarating; there is really no such thing as bad weather, only different kinds of good weather.",
        source: "John Ruskin"
    });

    const breadcrumbItems = [
        { label: 'Intelligence', href: createPageUrl('Intelligence') },
        { label: 'Forces & Cycles', href: createPageUrl('Intelligence') + '?category=Forces_Cycles' },
        { label: 'Weather' }
    ];
    if (selectedTopic) {
        breadcrumbItems.push({ label: selectedTopic.title });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Weather</h1>
                                <p className="text-white/80 text-sm">Understanding Atmospheric Phenomena</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {Object.values(WEATHER_PHENOMENA).map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="text-center">
                                        <Icon className="w-6 h-6 mx-auto text-white/80" />
                                        <p className="text-xs text-white/60 mt-1">{item.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Daily Quote */}
                <WeatherQuote quote={dailyQuote.quote} source={dailyQuote.source} />

                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                {selectedTopic ? (
                    <>
                        <Button variant="outline" onClick={() => setSelectedTopic(null)} className="mb-4">← Back</Button>
                        <TopicDetailView topic={selectedTopic} />
                    </>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        activeTab === tab.id 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        {activeTab === 'understanding' && <UnderstandingView />}
                        {activeTab === 'encyclopedia' && <EncyclopediaView onSelectTopic={setSelectedTopic} />}
                        {activeTab === 'education' && <EducationView />}
                        {activeTab === 'knowledge' && <KnowledgeView />}
                        {activeTab === 'wisdom' && <WisdomView />}
                        {activeTab === 'analytics' && <AnalyticsView />}
                    </>
                )}
            </div>
        </div>
    );
}