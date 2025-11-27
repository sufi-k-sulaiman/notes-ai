import React, { useState, useEffect } from 'react';
import { 
    Brain, TrendingUp, Target, Sparkles, Play, Loader2, Activity, Lightbulb, Zap,
    LineChart, GitBranch, Shield, AlertTriangle, CheckCircle2, X, Maximize2, Minimize2,
    Sliders, BarChart3, RefreshCw, Layers, Clock, Cpu, ChevronRight, SlidersHorizontal,
    FileText, Users, MessageSquare, Share2, Download, Settings2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar } from 'recharts';

// Dashboard Components
import MetricCard from '@/components/dashboard/MetricCard';
import PieChartCard from '@/components/dashboard/PieChartCard';
import RadialProgressCard from '@/components/dashboard/RadialProgressCard';
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart';
import RadarChartCard from '@/components/dashboard/RadarChart';
import StackedBarChart from '@/components/dashboard/StackedBarChart';
import AreaChartWithMarkers from '@/components/dashboard/AreaChartWithMarkers';

const MODULES = [
    { id: 'forecast', name: 'Forecasting', icon: LineChart, color: '#8B5CF6', desc: 'Time-series predictions with ARIMA, LSTM, Transformer models' },
    { id: 'scenario', name: 'Scenario Builder', icon: GitBranch, color: '#10B981', desc: 'Drag-and-drop scenario construction with templates' },
    { id: 'whatif', name: 'What-If Analysis', icon: Sliders, color: '#F59E0B', desc: 'Parameter sliders with instant recalculation' },
    { id: 'simulation', name: 'Simulation', icon: Activity, color: '#3B82F6', desc: 'Agent-based, system dynamics, Monte Carlo runs' },
    { id: 'risk', name: 'Risk Assessment', icon: Shield, color: '#EF4444', desc: 'Threat analysis, scoring matrices, early warnings' },
    { id: 'opportunity', name: 'Opportunity Mapping', icon: Lightbulb, color: '#EC4899', desc: 'Growth potential, emerging markets, ROI forecasting' },
    { id: 'impact', name: 'Impact Analysis', icon: Target, color: '#0EA5E9', desc: 'Policy quantification, cross-domain ripple effects' },
];

const DOMAINS = ['Economy', 'Health', 'Education', 'Defense', 'Trade', 'Labor', 'Tourism', 'Climate'];
const TIME_HORIZONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', '5-Year', '10-Year'];
const MODEL_TYPES = ['ARIMA', 'LSTM', 'Transformer', 'Ensemble', 'Gradient Boosting'];

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#0EA5E9', '#6366F1'];

export default function Intelligence() {
    const [activeTab, setActiveTab] = useState('forecast');
    const [selectedDomain, setSelectedDomain] = useState('Economy');
    const [timeHorizon, setTimeHorizon] = useState('Monthly');
    const [modelType, setModelType] = useState('Ensemble');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [results, setResults] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Dynamic data states
    const [forecastData, setForecastData] = useState([]);
    const [riskData, setRiskData] = useState([]);
    const [opportunityData, setOpportunityData] = useState([]);
    const [impactData, setImpactData] = useState([]);
    const [radarData, setRadarData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [metrics, setMetrics] = useState({});

    // What-If Parameters
    const [interestRate, setInterestRate] = useState([3.5]);
    const [populationGrowth, setPopulationGrowth] = useState([1.2]);
    const [tradeFlows, setTradeFlows] = useState([50]);
    const [energyPrices, setEnergyPrices] = useState([75]);

    // Load dynamic data based on domain
    useEffect(() => {
        loadDynamicData();
    }, [selectedDomain, timeHorizon, activeTab]);

    const loadDynamicData = async () => {
        setDataLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate realistic analytics data for ${selectedDomain} sector intelligence analysis.
Time horizon: ${timeHorizon}. Analysis type: ${activeTab}.

Provide JSON with:
1. forecastData: 12 periods with actual (first 8) and forecast values (periods 9-12), include upper/lower confidence bounds
2. riskData: 5 risk categories with likelihood (0-100) and impact (0-100) scores
3. opportunityData: 5 growth opportunities with potential (0-100) and feasibility (0-100)
4. radarData: 6 performance dimensions each scored 0-100
5. distributionData: 5 segments with percentage breakdown (must sum to 100)
6. metrics: accuracy (%), confidence (%), trend (up/down/stable), volatility (low/medium/high)`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        forecastData: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    period: { type: "string" }, 
                                    actual: { type: "number" }, 
                                    forecast: { type: "number" }, 
                                    upper: { type: "number" }, 
                                    lower: { type: "number" } 
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
                        opportunityData: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    name: { type: "string" }, 
                                    potential: { type: "number" }, 
                                    feasibility: { type: "number" } 
                                } 
                            } 
                        },
                        radarData: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    dimension: { type: "string" }, 
                                    current: { type: "number" }, 
                                    target: { type: "number" } 
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
                        metrics: { 
                            type: "object", 
                            properties: { 
                                accuracy: { type: "number" }, 
                                confidence: { type: "number" }, 
                                trend: { type: "string" }, 
                                volatility: { type: "string" } 
                            } 
                        }
                    }
                }
            });

            if (response) {
                setForecastData(response.forecastData || []);
                setRiskData(response.riskData || []);
                setOpportunityData(response.opportunityData || []);
                setRadarData(response.radarData || []);
                setDistributionData(response.distributionData || []);
                setMetrics(response.metrics || {});
            }
        } catch (error) {
            console.error('Failed to load dynamic data:', error);
            // Fallback data
            generateFallbackData();
        } finally {
            setDataLoading(false);
        }
    };

    const generateFallbackData = () => {
        const periods = Array.from({ length: 12 }, (_, i) => {
            const base = 100 + Math.random() * 50;
            return {
                period: `P${i + 1}`,
                actual: i < 8 ? Math.round(base) : null,
                forecast: i >= 7 ? Math.round(base + (Math.random() - 0.5) * 10) : null,
                upper: i >= 7 ? Math.round(base + 15) : null,
                lower: i >= 7 ? Math.round(base - 15) : null,
            };
        });
        setForecastData(periods);
        setRiskData([
            { name: 'Market Risk', likelihood: 65, impact: 78 },
            { name: 'Regulatory', likelihood: 45, impact: 85 },
            { name: 'Operational', likelihood: 55, impact: 62 },
            { name: 'Cyber Risk', likelihood: 70, impact: 90 },
            { name: 'Climate', likelihood: 60, impact: 72 },
        ]);
        setOpportunityData([
            { name: 'Digital Transformation', potential: 85, feasibility: 72 },
            { name: 'Market Expansion', potential: 78, feasibility: 65 },
            { name: 'Innovation', potential: 90, feasibility: 55 },
            { name: 'Partnerships', potential: 70, feasibility: 80 },
            { name: 'Sustainability', potential: 75, feasibility: 68 },
        ]);
        setRadarData([
            { dimension: 'Growth', current: 75, target: 90 },
            { dimension: 'Efficiency', current: 82, target: 88 },
            { dimension: 'Innovation', current: 68, target: 85 },
            { dimension: 'Resilience', current: 78, target: 92 },
            { dimension: 'Sustainability', current: 65, target: 80 },
            { dimension: 'Compliance', current: 88, target: 95 },
        ]);
        setDistributionData([
            { name: 'Segment A', value: 35 },
            { name: 'Segment B', value: 28 },
            { name: 'Segment C', value: 20 },
            { name: 'Segment D', value: 12 },
            { name: 'Other', value: 5 },
        ]);
        setMetrics({ accuracy: 94, confidence: 87, trend: 'up', volatility: 'medium' });
    };

    const runAnalysis = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Perform ${activeTab} analysis for ${selectedDomain} sector: "${query}"
Time horizon: ${timeHorizon}, Model: ${modelType}

Provide:
1. Executive Summary
2. Key Findings (5 points)
3. Risk Level with explanation
4. Confidence intervals
5. Recommendations
6. Projected Impact with metrics`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        findings: { type: "array", items: { type: "string" } },
                        riskLevel: { type: "string" },
                        riskExplanation: { type: "string" },
                        recommendations: { type: "array", items: { type: "string" } },
                        projectedImpact: { type: "string" },
                        confidenceScore: { type: "number" },
                        confidenceInterval: { type: "string" }
                    }
                }
            });
            setResults(response);
            setShowModal(true);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const activeModule = MODULES.find(m => m.id === activeTab);
    const gdpProjection = (2.5 + (interestRate[0] * -0.2) + (populationGrowth[0] * 0.3) + (tradeFlows[0] * 0.02) - (energyPrices[0] * 0.01)).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Generative Intelligence</h1>
                                <p className="text-white/80 text-sm">Ai-Powered Analytics</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">7</p>
                                <p className="text-xs text-white/70">Analysis Modules</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">8</p>
                                <p className="text-xs text-white/70">Domains</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">5</p>
                                <p className="text-xs text-white/70">ML Models</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {MODULES.map(mod => (
                        <button key={mod.id} onClick={() => setActiveTab(mod.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                                activeTab === mod.id
                                    ? 'bg-white shadow-md border-2 text-gray-900'
                                    : 'bg-white/70 text-gray-600 hover:bg-white border border-gray-200'
                            }`}
                            style={{ borderColor: activeTab === mod.id ? mod.color : undefined }}>
                            <mod.icon className="w-4 h-4" style={{ color: mod.color }} />
                            <span className="font-medium text-sm">{mod.name}</span>
                        </button>
                    ))}
                </div>

                {/* Controls Row */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="w-36 bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                        <SelectTrigger className="w-32 bg-white">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIME_HORIZONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={modelType} onValueChange={setModelType}>
                        <SelectTrigger className="w-40 bg-white">
                            <Cpu className="w-4 h-4 mr-2 text-gray-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MODEL_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={loadDynamicData} variant="outline" size="sm" className="gap-2" disabled={dataLoading}>
                        <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh Data
                    </Button>
                </div>

                {dataLoading ? (
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
                        <span className="text-gray-600">Loading intelligence data...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Metric Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricCard 
                                    title="Model Accuracy" 
                                    subtitle={`${modelType} Performance`} 
                                    value={`${metrics.accuracy || 94}%`} 
                                    change="+2.3%" 
                                    changeType="positive" 
                                    bgColor="#8B5CF6" 
                                />
                                <MetricCard 
                                    title="Confidence Level" 
                                    subtitle="Prediction Certainty" 
                                    value={`${metrics.confidence || 87}%`} 
                                    change="+1.5%" 
                                    changeType="positive" 
                                    bgColor="#10B981" 
                                />
                                <MetricCard 
                                    title="Trend Direction" 
                                    subtitle={`${selectedDomain} Outlook`} 
                                    value={metrics.trend === 'up' ? 'Bullish' : metrics.trend === 'down' ? 'Bearish' : 'Stable'} 
                                    change={metrics.volatility || 'Medium'} 
                                    changeType={metrics.trend === 'up' ? 'positive' : 'negative'} 
                                    bgColor="#F59E0B" 
                                />
                            </div>

                            {/* Forecasting View */}
                            {activeTab === 'forecast' && (
                                <>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">Forecast Visualization</h3>
                                            <div className="flex gap-3 text-xs">
                                                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-purple-600 rounded" /> Actual</span>
                                                <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded" /> Forecast</span>
                                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-100 rounded" /> Confidence</span>
                                            </div>
                                        </div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={forecastData}>
                                                    <defs>
                                                        <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="period" axisLine={false} tickLine={false} fontSize={11} />
                                                    <YAxis axisLine={false} tickLine={false} fontSize={11} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confBand)" />
                                                    <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" />
                                                    <Area type="monotone" dataKey="actual" stroke="#8B5CF6" fill="transparent" strokeWidth={2} dot={false} />
                                                    <Area type="monotone" dataKey="forecast" stroke="#10B981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <PieChartCard 
                                            title={`${selectedDomain} Distribution`} 
                                            variant="donut" 
                                            data={distributionData} 
                                            colors={COLORS}
                                        />
                                        <HorizontalBarChart 
                                            title="Performance by Category" 
                                            data={opportunityData.map(d => ({ name: d.name, value1: d.potential, value2: d.feasibility }))} 
                                        />
                                    </div>
                                </>
                            )}

                            {/* Risk Assessment */}
                            {activeTab === 'risk' && (
                                <>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4">Risk Matrix</h3>
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
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {riskData.slice(0, 4).map((risk, i) => (
                                            <RadialProgressCard 
                                                key={i}
                                                percentage={Math.round((risk.likelihood + risk.impact) / 2)} 
                                                size="medium" 
                                                color={risk.impact > 75 ? '#EF4444' : risk.impact > 50 ? '#F59E0B' : '#10B981'} 
                                                title={risk.name} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Opportunity Mapping */}
                            {activeTab === 'opportunity' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                                            <h3 className="font-semibold text-gray-900 mb-4">Opportunity Analysis</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart data={radarData}>
                                                        <PolarGrid />
                                                        <PolarAngleAxis dataKey="dimension" fontSize={10} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                        <Radar name="Current" dataKey="current" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                                                        <Radar name="Target" dataKey="target" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                                                        <Legend />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <PieChartCard 
                                            title="Growth Potential" 
                                            variant="pie" 
                                            data={opportunityData.map(d => ({ name: d.name, value: d.potential }))} 
                                            colors={COLORS}
                                        />
                                    </div>
                                    <HorizontalBarChart 
                                        title="Opportunity Feasibility Matrix" 
                                        data={opportunityData.map(d => ({ name: d.name, value1: d.potential, value2: d.feasibility }))} 
                                    />
                                </>
                            )}

                            {/* What-If Analysis */}
                            {activeTab === 'whatif' && (
                                <>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4">Parameter Sliders</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Interest Rate</span>
                                                    <span className="text-sm text-purple-600 font-medium">{interestRate[0]}%</span>
                                                </div>
                                                <Slider value={interestRate} onValueChange={setInterestRate} min={0} max={10} step={0.1} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Population Growth</span>
                                                    <span className="text-sm text-purple-600 font-medium">{populationGrowth[0]}%</span>
                                                </div>
                                                <Slider value={populationGrowth} onValueChange={setPopulationGrowth} min={-2} max={5} step={0.1} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Trade Flows Index</span>
                                                    <span className="text-sm text-purple-600 font-medium">{tradeFlows[0]}</span>
                                                </div>
                                                <Slider value={tradeFlows} onValueChange={setTradeFlows} min={0} max={100} step={1} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Energy Prices Index</span>
                                                    <span className="text-sm text-purple-600 font-medium">{energyPrices[0]}</span>
                                                </div>
                                                <Slider value={energyPrices} onValueChange={setEnergyPrices} min={0} max={150} step={1} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <MetricCard 
                                            title="GDP Projection" 
                                            subtitle="Based on parameters" 
                                            value={`${gdpProjection}%`} 
                                            change={parseFloat(gdpProjection) > 2 ? 'Growth' : 'Contraction'} 
                                            changeType={parseFloat(gdpProjection) > 2 ? 'positive' : 'negative'} 
                                            bgColor="#8B5CF6" 
                                        />
                                        <MetricCard 
                                            title="Inflation Impact" 
                                            subtitle="Projected" 
                                            value={`${(interestRate[0] * 0.5 + energyPrices[0] * 0.02).toFixed(1)}%`} 
                                            change="Estimate" 
                                            changeType="neutral" 
                                            bgColor="#F59E0B" 
                                        />
                                        <MetricCard 
                                            title="Employment" 
                                            subtitle="Projected Change" 
                                            value={`${(populationGrowth[0] * 0.8 + tradeFlows[0] * 0.01).toFixed(1)}%`} 
                                            change="Forecast" 
                                            changeType="positive" 
                                            bgColor="#10B981" 
                                        />
                                    </div>
                                </>
                            )}

                            {/* Simulation */}
                            {activeTab === 'simulation' && (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <RadialProgressCard percentage={Math.round(metrics.accuracy || 85)} size="medium" color="#8B5CF6" title="Simulation Accuracy" />
                                        <RadialProgressCard percentage={Math.round(metrics.confidence || 78)} size="medium" color="#10B981" title="Convergence" />
                                        <RadialProgressCard percentage={72} size="medium" color="#F59E0B" title="Stability" />
                                        <RadialProgressCard percentage={88} size="medium" color="#3B82F6" title="Reliability" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <HorizontalBarChart 
                                            title="Monte Carlo Results" 
                                            data={riskData.map(d => ({ name: d.name, value1: d.likelihood, value2: 100 - d.impact }))} 
                                        />
                                        <PieChartCard 
                                            title="Scenario Distribution" 
                                            variant="donut" 
                                            data={distributionData} 
                                            colors={COLORS}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Impact Analysis */}
                            {activeTab === 'impact' && (
                                <>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <h3 className="font-semibold text-gray-900 mb-4">Cross-Domain Impact</h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={DOMAINS.map(d => ({ name: d, impact: 30 + Math.random() * 60, baseline: 50 }))}>
                                                    <XAxis dataKey="name" fontSize={10} />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="baseline" fill="#E5E7EB" name="Baseline" />
                                                    <Bar dataKey="impact" fill="#8B5CF6" name="Projected Impact" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <HorizontalBarChart 
                                            title="Ripple Effects" 
                                            data={opportunityData.slice(0, 4).map(d => ({ name: d.name, value1: d.potential, value2: Math.round(d.potential * 0.6) }))} 
                                        />
                                        <PieChartCard 
                                            title="Impact Distribution" 
                                            variant="pie" 
                                            data={distributionData} 
                                            colors={COLORS}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Scenario Builder */}
                            {activeTab === 'scenario' && (
                                <>
                                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">Scenario Templates</h3>
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <Share2 className="w-4 h-4" /> Share
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Climate Transition', 'Economic Recession', 'Trade War', 'Tech Disruption', 'Pandemic Response', 'Defense Buildup'].map((scenario, i) => (
                                                <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all">
                                                    <h4 className="font-medium text-gray-900">{scenario}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Pre-configured template</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <PieChartCard 
                                            title="Scenario Comparison" 
                                            variant="donut" 
                                            data={[
                                                { name: 'Optimistic', value: 35 },
                                                { name: 'Base Case', value: 40 },
                                                { name: 'Pessimistic', value: 25 }
                                            ]} 
                                            colors={['#10B981', '#8B5CF6', '#EF4444']}
                                        />
                                        <HorizontalBarChart 
                                            title="Scenario Outcomes" 
                                            data={[
                                                { name: 'GDP Growth', value1: 3.2, value2: 2.1 },
                                                { name: 'Inflation', value1: 2.5, value2: 4.2 },
                                                { name: 'Employment', value1: 95, value2: 92 }
                                            ]} 
                                        />
                                    </div>
                                </>
                            )}

                            {/* Query Input */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <span className="font-semibold text-gray-900">Custom Analysis Query</span>
                                </div>
                                <Textarea value={query} onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`e.g., "Forecast ${selectedDomain.toLowerCase()} indicators for ${timeHorizon.toLowerCase()} horizon using ${modelType} model..."`}
                                    className="min-h-[80px] mb-3" />
                                <Button onClick={runAnalysis} disabled={loading || !query.trim()} className="bg-purple-600 hover:bg-purple-700">
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                                    Run Analysis
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Capabilities */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Platform Capabilities</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Cpu className="w-4 h-4 text-purple-600" />
                                        <span>Hybrid ML (ARIMA, LSTM, Transformer)</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <RefreshCw className="w-4 h-4 text-blue-600" />
                                        <span>Real-time ingestion & retraining</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Layers className="w-4 h-4 text-emerald-600" />
                                        <span>Multi-domain transfer learning</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <BarChart3 className="w-4 h-4 text-amber-600" />
                                        <span>Confidence & uncertainty scoring</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <FileText className="w-4 h-4 text-pink-600" />
                                        <span>Ai narrative generation</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Users className="w-4 h-4 text-indigo-600" />
                                        <span>Collaborative workspaces</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Model Performance</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-xl font-bold text-purple-600">{metrics.accuracy || 94}%</p>
                                        <p className="text-xs text-gray-500">Accuracy</p>
                                    </div>
                                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                        <p className="text-xl font-bold text-emerald-600">8.4K</p>
                                        <p className="text-xs text-gray-500">Predictions</p>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xl font-bold text-blue-600">1.2K</p>
                                        <p className="text-xs text-gray-500">Scenarios</p>
                                    </div>
                                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                                        <p className="text-xl font-bold text-amber-600">Live</p>
                                        <p className="text-xs text-gray-500">Retraining</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Analyses */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recent Analyses</h3>
                                <div className="space-y-2">
                                    {['GDP Forecast Q1 2025', 'Trade Flow Scenario', 'Climate Risk Assessment'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 flex-1">{item}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full rounded-none' : 'max-w-2xl max-h-[85vh]'} overflow-y-auto p-0`}>
                    {results && (
                        <div>
                            <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${activeModule?.color || '#8B5CF6'}, #6366F1)` }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {activeModule && <activeModule.icon className="w-6 h-6" />}
                                        <div>
                                            <h2 className="text-lg font-bold">{activeModule?.name} Results</h2>
                                            <p className="text-white/80 text-sm">{selectedDomain} • {timeHorizon} • {modelType}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:bg-white/20">
                                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-white hover:bg-white/20">
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                                    <p className="text-gray-700">{results.summary}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Key Findings</h3>
                                    <ul className="space-y-2">
                                        {results.findings?.map((f, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                                <span className="text-gray-600">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl ${results.riskLevel === 'High' ? 'bg-red-50' : results.riskLevel === 'Medium' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className={`w-4 h-4 ${results.riskLevel === 'High' ? 'text-red-500' : results.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                            <span className="font-medium">Risk: {results.riskLevel}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{results.riskExplanation}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-purple-50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-purple-600" />
                                            <span className="font-medium">Confidence: {results.confidenceScore}%</span>
                                        </div>
                                        <div className="h-2 bg-purple-200 rounded-full mt-2">
                                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${results.confidenceScore}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                                    <ul className="space-y-2">
                                        {results.recommendations?.map((r, i) => (
                                            <li key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">{i+1}</span>
                                                <span className="text-gray-700">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-1">Projected Impact</h3>
                                    <p className="text-gray-600">{results.projectedImpact}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Download className="w-4 h-4" /> Export
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}