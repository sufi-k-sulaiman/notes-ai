import React, { useState, useEffect, useMemo } from 'react';
import { 
    Globe, Building2, TrendingUp, Heart, GraduationCap, Shield, Ship, Briefcase, Plane,
    Layers, Database, Cpu, Search, MapPin, ArrowUp, ArrowDown, RefreshCw, Loader2,
    Satellite, BarChart3, Bell, FileText, Lock, Play, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line } from 'recharts';
import InteractiveMap from '@/components/geospatial/InteractiveMap';

// Dashboard Components
import ColoredMetricCard from '@/components/dashboard/ColoredMetricCard';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import AreaChartWithMarkers from '@/components/dashboard/AreaChartWithMarkers';
import SemiCircleProgress from '@/components/dashboard/SemiCircleProgress';
import BudgetDonutCard from '@/components/dashboard/BudgetDonutCard';
import CountryVisitorsCard from '@/components/dashboard/CountryVisitorsCard';

const DOMAINS = [
    { id: 'governance', name: 'Governance', icon: Building2, color: '#6366F1', description: 'Administrative mapping, infrastructure oversight, policy simulation' },
    { id: 'economy', name: 'Economy', icon: TrendingUp, color: '#22C55E', description: 'Activity hotspots, agriculture, resources, resilience' },
    { id: 'health', name: 'Health', icon: Heart, color: '#EC4899', description: 'Outbreak intelligence, healthcare access, environmental health' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: '#10B981', description: 'School mapping, equity dashboards, planning tools' },
    { id: 'defense', name: 'Defense', icon: Shield, color: '#EF4444', description: 'Border awareness, asset tracking, incident management' },
    { id: 'trade', name: 'Trade', icon: Ship, color: '#3B82F6', description: 'Route intelligence, port analytics, supply chain' },
    { id: 'labor', name: 'Labor', icon: Briefcase, color: '#F97316', description: 'Workforce distribution, market dynamics, urbanization' },
    { id: 'tourism', name: 'Tourism', icon: Plane, color: '#0EA5E9', description: 'Attraction mapping, visitor dynamics, sustainability' },
];

const REGIONS = [
    { id: 'all', name: 'Global' },
    { id: 'north-america', name: 'North America', countries: ['USA', 'Canada', 'Mexico'] },
    { id: 'europe', name: 'Europe', countries: ['UK', 'Germany', 'France', 'Italy', 'Spain'] },
    { id: 'asia-pacific', name: 'Asia Pacific', countries: ['China', 'Japan', 'India', 'Australia'] },
    { id: 'latin-america', name: 'Latin America', countries: ['Brazil', 'Argentina', 'Chile'] },
    { id: 'middle-east', name: 'Middle East', countries: ['UAE', 'Saudi Arabia', 'Israel'] },
    { id: 'africa', name: 'Africa', countries: ['South Africa', 'Nigeria', 'Kenya', 'Egypt'] },
];

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#0EA5E9', '#6366F1'];

export default function Geospatial() {
    const [activeDomain, setActiveDomain] = useState('economy');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);

    // Dynamic data states
    const [countryData, setCountryData] = useState([]);
    const [domainMetrics, setDomainMetrics] = useState({});
    const [trendData, setTrendData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [riskData, setRiskData] = useState([]);
    const [progressSteps, setProgressSteps] = useState([]);

    useEffect(() => {
        loadGeospatialData();
    }, [activeDomain, selectedRegion]);

    const loadGeospatialData = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate comprehensive geospatial intelligence data for the ${activeDomain} domain.
Region focus: ${selectedRegion === 'all' ? 'Global' : selectedRegion}.

Provide realistic JSON data for a geospatial intelligence platform:
1. countryData: Array of 15 countries with name, region, score (0-100), change (-20 to +20), dataSources count, trend array of 8 values
2. domainMetrics: Object with totalCountries, avgScore, activeAlerts, dataSources, lastUpdated, trend (up/down/stable)
3. trendData: 12 monthly data points with period, value, marker (optional percentage labels on key points)
4. distributionData: 5 segments showing domain distribution (name, value percentage)
5. comparisonData: 5 yearly comparison data (name: year, value1-5 for stacked bars)
6. riskData: 5 risk categories with name, likelihood (0-100), impact (0-100)
7. progressSteps: 5 steps showing pipeline progress with name, value (equal portions), color (hex)`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        countryData: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    country: { type: "string" },
                                    region: { type: "string" },
                                    score: { type: "number" },
                                    change: { type: "number" },
                                    dataSources: { type: "number" },
                                    trend: { type: "array", items: { type: "number" } }
                                }
                            }
                        },
                        domainMetrics: {
                            type: "object",
                            properties: {
                                totalCountries: { type: "number" },
                                avgScore: { type: "number" },
                                activeAlerts: { type: "number" },
                                dataSources: { type: "number" },
                                lastUpdated: { type: "string" },
                                trend: { type: "string" }
                            }
                        },
                        trendData: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "number" },
                                    marker: { type: "string" }
                                }
                            }
                        },
                        distributionData: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "number" }
                                }
                            }
                        },
                        comparisonData: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value1: { type: "number" },
                                    value2: { type: "number" },
                                    value3: { type: "number" },
                                    value4: { type: "number" },
                                    value5: { type: "number" }
                                }
                            }
                        },
                        riskData: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    likelihood: { type: "number" },
                                    impact: { type: "number" }
                                }
                            }
                        },
                        progressSteps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "number" },
                                    color: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            if (response) {
                setCountryData(response.countryData || []);
                setDomainMetrics(response.domainMetrics || {});
                setTrendData(response.trendData || []);
                setDistributionData(response.distributionData || []);
                setComparisonData(response.comparisonData || []);
                setRiskData(response.riskData || []);
                setProgressSteps(response.progressSteps || []);
            }
        } catch (error) {
            console.error('Failed to load geospatial data:', error);
            generateFallbackData();
        } finally {
            setLoading(false);
        }
    };

    const generateFallbackData = () => {
        const countries = REGIONS.filter(r => r.id !== 'all').flatMap(r =>
            (r.countries || []).map(c => ({
                country: c,
                region: r.name,
                score: Math.round(40 + Math.random() * 55),
                change: Math.round((Math.random() - 0.5) * 20),
                dataSources: Math.floor(12 + Math.random() * 20),
                trend: Array.from({ length: 8 }, () => Math.round(40 + Math.random() * 50))
            }))
        );
        setCountryData(countries);
        setDomainMetrics({ totalCountries: 195, avgScore: 72, activeAlerts: 24, dataSources: 2400, trend: 'up' });
        setTrendData([
            { name: 'Jan', value: 65 }, { name: 'Feb', value: 72, marker: '+8%' }, { name: 'Mar', value: 68 },
            { name: 'Apr', value: 78 }, { name: 'May', value: 82, marker: '+12%' }, { name: 'Jun', value: 75 },
            { name: 'Jul', value: 88 }, { name: 'Aug', value: 92, marker: '+18%' }, { name: 'Sep', value: 85 }
        ]);
        setDistributionData([
            { name: 'High Priority', value: 35 }, { name: 'Medium', value: 28 },
            { name: 'Low', value: 20 }, { name: 'Monitoring', value: 12 }, { name: 'Resolved', value: 5 }
        ]);
        setComparisonData([
            { name: '2020', value1: 30, value2: 25, value3: 20, value4: 15, value5: 10 },
            { name: '2021', value1: 35, value2: 30, value3: 25, value4: 20, value5: 15 },
            { name: '2022', value1: 40, value2: 35, value3: 30, value4: 25, value5: 20 },
            { name: '2023', value1: 50, value2: 40, value3: 35, value4: 30, value5: 25 },
            { name: '2024', value1: 55, value2: 45, value3: 38, value4: 32, value5: 28 }
        ]);
        setRiskData([
            { name: 'Geopolitical', likelihood: 65, impact: 85 },
            { name: 'Environmental', likelihood: 72, impact: 78 },
            { name: 'Infrastructure', likelihood: 45, impact: 68 },
            { name: 'Economic', likelihood: 58, impact: 72 },
            { name: 'Social', likelihood: 52, impact: 55 }
        ]);
        setProgressSteps([
            { name: 'Ingestion', value: 20, color: '#8B5CF6' },
            { name: 'Processing', value: 20, color: '#10B981' },
            { name: 'Analysis', value: 20, color: '#F59E0B' },
            { name: 'Validation', value: 20, color: '#3B82F6' },
            { name: 'Delivery', value: 20, color: '#EC4899' }
        ]);
    };

    const runGeospatialAnalysis = async () => {
        if (!query.trim()) return;
        setAnalysisLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Perform geospatial intelligence analysis for ${activeDomain} domain: "${query}"
Region: ${selectedRegion === 'all' ? 'Global' : selectedRegion}

Provide comprehensive analysis:
1. Executive Summary (2-3 sentences)
2. Key Spatial Insights (5 findings)
3. Risk Assessment with explanation
4. Affected Regions list
5. Recommendations (5 actionable items)
6. Data Sources used
7. Confidence Level (0-100)`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        insights: { type: "array", items: { type: "string" } },
                        riskLevel: { type: "string" },
                        riskExplanation: { type: "string" },
                        affectedRegions: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        dataSources: { type: "array", items: { type: "string" } },
                        confidenceScore: { type: "number" }
                    }
                }
            });
            setAnalysisResults(response);
            setShowResultsModal(true);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setAnalysisLoading(false);
        }
    };

    const filteredCountries = useMemo(() => {
        let data = [...countryData];
        if (selectedRegion !== 'all') {
            const region = REGIONS.find(r => r.id === selectedRegion);
            if (region?.countries) {
                data = data.filter(c => region.countries.includes(c.country));
            }
        }
        if (searchQuery) {
            data = data.filter(c => c.country.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return data.sort((a, b) => b.score - a.score);
    }, [countryData, selectedRegion, searchQuery]);

    const domainInfo = DOMAINS.find(d => d.id === activeDomain);
    const topCountries = filteredCountries.slice(0, 5);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Geospatial Analysis</h1>
                                <p className="text-white/80 text-sm">Geospatial Analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search countries..." className="pl-9 w-44 bg-white/20 border-white/30 text-white placeholder:text-white/60" />
                            </div>
                            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                <SelectTrigger className="w-36 bg-white/20 border-white/30 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={loadGeospatialData} variant="ghost" size="icon" disabled={loading} className="text-white hover:bg-white/20">
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{domainMetrics.totalCountries || 195}</p>
                            <p className="text-xs text-white/70">Countries</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{domainMetrics.dataSources || '2.4K'}</p>
                            <p className="text-xs text-white/70">Data Sources</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{domainMetrics.activeAlerts || 24}</p>
                            <p className="text-xs text-white/70">Active Alerts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{domainMetrics.avgScore || 72}</p>
                            <p className="text-xs text-white/70">Avg Score</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="bg-white border border-gray-200">
                        <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Globe className="w-4 h-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4" /> Analytics
                        </TabsTrigger>
                        <TabsTrigger value="pipeline" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Database className="w-4 h-4" /> Data Pipeline
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Domain Selection */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {DOMAINS.map(domain => {
                        const Icon = domain.icon;
                        return (
                            <button key={domain.id} onClick={() => setActiveDomain(domain.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                                    activeDomain === domain.id
                                        ? 'bg-white shadow-md border-2 text-gray-900'
                                        : 'bg-white/70 text-gray-600 hover:bg-white border border-gray-200'
                                }`}
                                style={{ borderColor: activeDomain === domain.id ? domain.color : undefined }}>
                                <Icon className="w-4 h-4" style={{ color: domain.color }} />
                                <span className="font-medium text-sm">{domain.name}</span>
                            </button>
                        );
                    })}
                </div>

                {loading ? (
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
                        <span className="text-gray-600">Loading geospatial intelligence...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Metric Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ColoredMetricCard
                                        title={`${domainInfo?.name} Score`}
                                        change={domainMetrics.trend === 'up' ? '+5.2%' : '-2.1%'}
                                        changeType={domainMetrics.trend === 'up' ? 'positive' : 'negative'}
                                        bgColor={domainInfo?.color || '#8B5CF6'}
                                        metric1={{ value: String(domainMetrics.avgScore || 72), label: 'Avg Score' }}
                                        metric2={{ value: String(filteredCountries.length), label: 'Countries' }}
                                    />
                                    <ColoredMetricCard
                                        title="Data Coverage"
                                        change="+12%"
                                        changeType="positive"
                                        bgColor="#10B981"
                                        metric1={{ value: String(domainMetrics.dataSources || 2400), label: 'Sources' }}
                                        metric2={{ value: '98%', label: 'Uptime' }}
                                    />
                                    <ColoredMetricCard
                                        title="Active Monitoring"
                                        change="+8 new"
                                        changeType="positive"
                                        bgColor="#F59E0B"
                                        metric1={{ value: String(domainMetrics.activeAlerts || 24), label: 'Alerts' }}
                                        metric2={{ value: '15', label: 'Critical' }}
                                    />
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Map */}
                                    <div className="lg:col-span-2">
                                        <InteractiveMap
                                            countryData={countryData}
                                            activeDomain={activeDomain}
                                            selectedRegion={selectedRegion}
                                            onSelectCountry={setSelectedCountry}
                                        />
                                    </div>

                                    {/* Sidebar */}
                                    <div className="space-y-4">
                                        {/* Domain Summary */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                {domainInfo && <domainInfo.icon className="w-5 h-5" style={{ color: domainInfo?.color }} />}
                                                <h3 className="font-semibold text-gray-900">{domainInfo?.name} Intelligence</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{domainInfo?.description}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-xl font-bold" style={{ color: domainInfo?.color }}>{domainMetrics.avgScore || 72}</p>
                                                    <p className="text-[10px] text-gray-500">Avg Score</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-xl font-bold text-gray-900">{filteredCountries.length}</p>
                                                    <p className="text-[10px] text-gray-500">Countries</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-xl font-bold text-emerald-600">Live</p>
                                                    <p className="text-[10px] text-gray-500">Status</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Rankings */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Top Performers</h3>
                                            <div className="space-y-2">
                                                {topCountries.map((country, i) => (
                                                    <div key={country.country} onClick={() => setSelectedCountry(country)}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                                            selectedCountry?.country === country.country
                                                                ? 'bg-purple-50 border border-purple-200'
                                                                : 'hover:bg-gray-50'
                                                        }`}>
                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>{i + 1}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm">{country.country}</p>
                                                            <p className="text-xs text-gray-500">{country.dataSources} sources</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-sm" style={{ color: domainInfo?.color }}>{country.score}</p>
                                                            <p className={`text-xs ${country.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {country.change >= 0 ? '+' : ''}{country.change}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selected Country */}
                                        {selectedCountry && (
                                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold text-gray-900">{selectedCountry.country}</h3>
                                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{selectedCountry.region}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div>
                                                        <p className="text-3xl font-bold" style={{ color: domainInfo?.color }}>{selectedCountry.score}</p>
                                                        <p className="text-xs text-gray-500">Domain Score</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                                        selectedCountry.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {selectedCountry.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                        <span className="text-sm font-medium">{Math.abs(selectedCountry.change)}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-16">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={selectedCountry.trend?.map((v, i) => ({ i, v })) || []}>
                                                            <Area type="monotone" dataKey="v" stroke={domainInfo?.color} fill={`${domainInfo?.color}30`} strokeWidth={2} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Query Input */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        <span className="font-semibold text-gray-900">Geospatial Analysis Query</span>
                                    </div>
                                    <Textarea value={query} onChange={(e) => setQuery(e.target.value)}
                                        placeholder={`e.g., "Analyze ${domainInfo?.name.toLowerCase()} infrastructure gaps in ${selectedRegion === 'all' ? 'Sub-Saharan Africa' : selectedRegion}..."`}
                                        className="min-h-[80px] mb-3" />
                                    <Button onClick={runGeospatialAnalysis} disabled={analysisLoading || !query.trim()} className="bg-purple-600 hover:bg-purple-700">
                                        {analysisLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                                        Run Analysis
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                {/* Trend Chart */}
                                <AreaChartWithMarkers
                                    title={`${domainInfo?.name} Performance Trend`}
                                    data={trendData}
                                    color={domainInfo?.color || '#8B5CF6'}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Stacked Bar */}
                                    <StackedBarChart
                                        title="Yearly Domain Comparison"
                                        data={comparisonData}
                                        colors={COLORS}
                                        legend={[
                                            { name: 'Infrastructure', color: COLORS[0] },
                                            { name: 'Coverage', color: COLORS[1] }
                                        ]}
                                    />

                                    {/* Distribution Pie */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">{domainInfo?.name} Distribution</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={distributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                                        {distributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Matrix */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Assessment Matrix</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={riskData} layout="vertical">
                                                <XAxis type="number" domain={[0, 100]} />
                                                <YAxis type="category" dataKey="name" width={100} fontSize={11} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="likelihood" fill="#8B5CF6" name="Likelihood" radius={[0, 4, 4, 0]} />
                                                <Bar dataKey="impact" fill="#EF4444" name="Impact" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Budget Donut Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <BudgetDonutCard title="Coverage" percentage={domainMetrics.avgScore || 72} label="Score" />
                                    <BudgetDonutCard title="Reliability" percentage={88} label="Uptime" color1="#10B981" color2="#34D399" />
                                    <BudgetDonutCard title="Accuracy" percentage={94} label="Data" color1="#3B82F6" color2="#60A5FA" />
                                    <BudgetDonutCard title="Alerts" percentage={65} label="Resolved" color1="#F59E0B" color2="#FBBF24" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'pipeline' && (
                            <div className="space-y-6">
                                {/* Semi Circle Progress */}
                                <SemiCircleProgress
                                    title="Data Pipeline Status"
                                    steps={progressSteps.length > 0 ? progressSteps : [
                                        { name: 'Ingestion', value: 20, color: '#8B5CF6' },
                                        { name: 'Processing', value: 20, color: '#10B981' },
                                        { name: 'Analysis', value: 20, color: '#F59E0B' },
                                        { name: 'Validation', value: 20, color: '#3B82F6' },
                                        { name: 'Delivery', value: 20, color: '#EC4899' }
                                    ]}
                                />

                                {/* Pipeline Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ColoredMetricCard
                                        title="Data Ingestion"
                                        change="+15.2K/hr"
                                        changeType="positive"
                                        bgColor="#8B5CF6"
                                        metric1={{ value: '2.4M', label: 'Records Today' }}
                                        metric2={{ value: '99.2%', label: 'Success Rate' }}
                                    />
                                    <ColoredMetricCard
                                        title="Processing Queue"
                                        change="12ms avg"
                                        changeType="positive"
                                        bgColor="#10B981"
                                        metric1={{ value: '1.8K', label: 'In Queue' }}
                                        metric2={{ value: '45K/min', label: 'Throughput' }}
                                    />
                                    <ColoredMetricCard
                                        title="Storage"
                                        change="+2.3TB"
                                        changeType="positive"
                                        bgColor="#3B82F6"
                                        metric1={{ value: '847TB', label: 'Total Data' }}
                                        metric2={{ value: '12PB', label: 'Capacity' }}
                                    />
                                </div>

                                {/* Architecture Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                                            <Satellite className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Data Sources</h3>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li>Satellite imagery (optical, SAR)</li>
                                            <li>IoT sensors & mobile aggregates</li>
                                            <li>Government GIS & customs logs</li>
                                            <li>Traffic feeds & environmental monitors</li>
                                            <li>Crowdsourced reports</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                                            <Database className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Storage Layer</h3>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li>Spatially indexed data lake</li>
                                            <li>Vector/raster hybrid storage</li>
                                            <li>Temporal snapshots & versions</li>
                                            <li>Access-controlled datasets</li>
                                            <li>Edge nodes for low-latency</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                                            <Cpu className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">APIs & Services</h3>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li>REST/GraphQL queries</li>
                                            <li>WebSocket live streams</li>
                                            <li>OGC standards (WMS/WFS/WMTS)</li>
                                            <li>Batch export capabilities</li>
                                            <li>Plugin SDK for extensions</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Country Bar Chart */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <h3 className="font-semibold text-gray-900 mb-4">{domainInfo?.name} Scores by Country</h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={filteredCountries.slice(0, 12)} layout="vertical">
                                                <XAxis type="number" domain={[0, 100]} />
                                                <YAxis type="category" dataKey="country" width={80} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Bar dataKey="score" fill={domainInfo?.color} radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Results Modal */}
            <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    {analysisResults && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${domainInfo?.color || '#8B5CF6'}, #6366F1)` }}>
                                <h2 className="text-lg font-bold text-white">Geospatial Analysis Results</h2>
                                <p className="text-white/80 text-sm">{domainInfo?.name} • {selectedRegion === 'all' ? 'Global' : selectedRegion}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                                <p className="text-gray-700">{analysisResults.summary}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Key Insights</h3>
                                <ul className="space-y-1">
                                    {analysisResults.insights?.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5" />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl ${analysisResults.riskLevel === 'High' ? 'bg-red-50' : analysisResults.riskLevel === 'Medium' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                                    <p className="font-medium text-sm">Risk: {analysisResults.riskLevel}</p>
                                    <p className="text-xs text-gray-600 mt-1">{analysisResults.riskExplanation}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-50">
                                    <p className="font-medium text-sm">Confidence: {analysisResults.confidenceScore}%</p>
                                    <div className="h-2 bg-purple-200 rounded-full mt-2">
                                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${analysisResults.confidenceScore}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                                <ul className="space-y-2">
                                    {analysisResults.recommendations?.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">{i+1}</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}