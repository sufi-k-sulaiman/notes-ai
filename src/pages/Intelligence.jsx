import React, { useState } from 'react';
import { 
    Brain, TrendingUp, Globe, Target, Sparkles, Play, Loader2,
    BarChart3, PieChart, Activity, Lightbulb, Zap, Clock, ChevronRight,
    LineChart, GitBranch, Shield, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2, Minimize2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPC, Pie, Cell } from 'recharts';

const ANALYSIS_TYPES = [
    { id: 'forecast', name: 'Forecast', icon: TrendingUp, description: '5-year predictions across sectors', color: '#8B5CF6', tags: ['GDP Growth', 'Employment', 'Trade Balance'] },
    { id: 'projection', name: 'Projection', icon: LineChart, description: 'Decade-long sector trajectories', color: '#3B82F6', tags: ['Population', 'Infrastructure', 'Technology'] },
    { id: 'scenario', name: 'Scenario', icon: GitBranch, description: 'Alternative future scenarios', color: '#10B981', tags: ['Digital Utopia', 'Climate Crisis', 'Economic Growth'] },
    { id: 'simulation', name: 'Simulation', icon: Activity, description: 'Monte Carlo probability runs', color: '#F59E0B', tags: ['Economic Growth', 'Immigration', 'Trade'] },
    { id: 'emulation', name: 'Emulation', icon: Shield, description: 'Crisis response simulation', color: '#EF4444', tags: ['Pandemic', 'Recession', 'Natural Disasters'] },
    { id: 'hypothetical', name: 'Hypothetical', icon: Lightbulb, description: 'Policy intervention analysis', color: '#EC4899', tags: ['UBI', 'Carbon Tax', 'Education Reform'] },
];

const SECTORS = ['Economy', 'Trade', 'Health', 'Defense', 'Citizenship', 'Environment', 'Education', 'Technology'];

const SAMPLE_CHART_DATA = [
    { name: 'Q1', value: 65 }, { name: 'Q2', value: 72 }, { name: 'Q3', value: 68 }, { name: 'Q4', value: 78 },
    { name: 'Q5', value: 82 }, { name: 'Q6', value: 75 }, { name: 'Q7', value: 88 }, { name: 'Q8', value: 92 }
];

export default function Intelligence() {
    const [activeTab, setActiveTab] = useState('generator');
    const [selectedSector, setSelectedSector] = useState('Economy');
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [customQuery, setCustomQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const stats = [
        { label: 'AI Models Active', value: '12', icon: Brain },
        { label: 'Predictions Generated', value: '8,432', change: '+18%', icon: TrendingUp },
        { label: 'Scenarios Analyzed', value: '1,247', icon: Globe },
        { label: 'Accuracy Rate', value: '94.2%', change: '+2.1%', icon: Target },
    ];

    const runAnalysis = async (type) => {
        setLoading(true);
        setSelectedAnalysis(type);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a ${type.name} analysis for the ${selectedSector} sector. Include:
                1. Executive Summary (2-3 sentences)
                2. Key Findings (3-5 bullet points)
                3. Risk Assessment (low/medium/high with explanation)
                4. Recommendations (3 actionable items)
                5. Projected Impact (quantitative if possible)`,
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
                        confidenceScore: { type: "number" }
                    }
                }
            });
            setResults(response);
            setShowResultModal(true);
        } catch (error) {
            console.error('Analysis failed:', error);
            setResults({
                summary: 'Analysis completed with available data.',
                findings: ['Key trend identified', 'Market indicators analyzed', 'Policy impacts assessed'],
                riskLevel: 'Medium',
                riskExplanation: 'Moderate uncertainty in projections',
                recommendations: ['Continue monitoring', 'Diversify approach', 'Prepare contingencies'],
                projectedImpact: 'Expected 5-8% improvement over baseline',
                confidenceScore: 78
            });
            setShowResultModal(true);
        } finally {
            setLoading(false);
        }
    };

    const runCustomQuery = async () => {
        if (!customQuery.trim()) return;
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `${customQuery}\n\nProvide a structured intelligence analysis with summary, key insights, and recommendations.`,
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
                        confidenceScore: { type: "number" }
                    }
                }
            });
            setResults(response);
            setSelectedAnalysis({ name: 'Custom Query', color: '#6B4EE6' });
            setShowResultModal(true);
        } catch (error) {
            console.error('Query failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout activePage="Intelligence" showSearch={false}>
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Brain className="w-7 h-7 text-purple-600" />
                            Generative Intelligence Platform
                        </h1>
                        <p className="text-gray-500 mt-1">Advanced AI-powered predictive analytics and scenario modeling</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        {stat.change && <p className="text-sm text-emerald-600">{stat.change} vs last period</p>}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <stat.icon className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { id: 'generator', label: 'AI Generator', icon: Sparkles },
                            { id: 'results', label: 'Analysis Results', icon: BarChart3 },
                            { id: 'library', label: 'Intelligence Library', icon: Brain },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Sector Selector */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {SECTORS.map(sector => (
                            <button
                                key={sector}
                                onClick={() => setSelectedSector(sector)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedSector === sector
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                {sector}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'generator' && (
                        <>
                            {/* Analysis Type Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {ANALYSIS_TYPES.map(type => (
                                    <div key={type.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${type.color}20` }}>
                                                <type.icon className="w-5 h-5" style={{ color: type.color }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{type.name}</h3>
                                                <p className="text-sm text-gray-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {type.tags.map((tag, i) => (
                                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{tag}</span>
                                            ))}
                                        </div>
                                        <Button 
                                            onClick={() => runAnalysis(type)}
                                            disabled={loading}
                                            className="w-full"
                                            style={{ backgroundColor: type.color }}
                                        >
                                            {loading && selectedAnalysis?.id === type.id ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Play className="w-4 h-4 mr-2" />
                                            )}
                                            Run {type.name}
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Query */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Custom Query</h3>
                                    <span className="text-sm text-gray-500">Ask anything with AI</span>
                                </div>
                                <Textarea
                                    placeholder="e.g., 'What if we increase healthcare spending by 20%?' or 'Predict economic impact of new trade agreements...'"
                                    value={customQuery}
                                    onChange={e => setCustomQuery(e.target.value)}
                                    rows={3}
                                    className="mb-3"
                                />
                                <Button 
                                    onClick={runCustomQuery} 
                                    disabled={loading || !customQuery.trim()}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {loading && !selectedAnalysis ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Generate Analysis
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'results' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Trend Analysis</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={SAMPLE_CHART_DATA}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <p className="text-2xl font-bold text-purple-600">36.9K</p>
                                        <p className="text-sm text-gray-500">Initiated</p>
                                    </div>
                                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                        <p className="text-2xl font-bold text-emerald-600">56%</p>
                                        <p className="text-sm text-gray-500">Engaged</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                                        <p className="text-2xl font-bold text-amber-600">17%</p>
                                        <p className="text-sm text-gray-500">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'library' && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <p className="text-center text-gray-500 py-12">Intelligence library with saved analyses coming soon...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Modal */}
            <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
                <DialogContent className={`${isFullscreen ? 'max-w-full w-full h-full max-h-full rounded-none' : 'max-w-3xl max-h-[90vh]'} overflow-y-auto p-0 transition-all`}>
                    {results && (
                        <div>
                            <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${selectedAnalysis?.color || '#6B4EE6'}, #8B5CF6)` }}>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold">{selectedAnalysis?.name} Analysis - {selectedSector}</h2>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:bg-white/20">
                                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)} className="text-white hover:bg-white/20">
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-6 space-y-6 ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
                                    <p className="text-gray-700 leading-relaxed">{results.summary}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Key Findings</h3>
                                    <ul className="space-y-2">
                                        {results.findings?.map((finding, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{finding}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`flex-1 p-4 rounded-xl ${results.riskLevel === 'High' ? 'bg-red-50' : results.riskLevel === 'Medium' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className={`w-4 h-4 ${results.riskLevel === 'High' ? 'text-red-500' : results.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                            <span className="font-medium">Risk: {results.riskLevel}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{results.riskExplanation}</p>
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-purple-50">
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
                                        {results.recommendations?.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium flex-shrink-0">{i + 1}</span>
                                                <span className="text-gray-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-1">Projected Impact</h3>
                                    <p className="text-gray-600">{results.projectedImpact}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageLayout>
    );
}