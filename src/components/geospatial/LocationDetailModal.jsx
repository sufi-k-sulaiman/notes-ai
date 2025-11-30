import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, MapPin, Target, AlertTriangle, CheckCircle, FileText, Clock, X } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const LOADING_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/622024f26_image-loading-logo.png";

const pulseAnimation = `
@keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
}
`;

const CATEGORY_LABELS = {
    carbon: 'Carbon Emissions',
    forests: 'Forest Coverage',
    resources: 'Natural Resources',
    sustainability: 'Sustainability Index',
    treasures: 'Heritage Protection',
    coastal: 'Coastal Health',
    ocean: 'Ocean Sustainability',
    wildlife: 'Wildlife Conservation',
    biomass: 'Biomass Production',
    produce: 'Agricultural Output',
    dairy: 'Dairy Production',
    livestock: 'Livestock Industry',
    power: 'Power Consumption',
    wellness: 'Health & Wellness',
    elements: 'Rare Earth Elements',
    airpollution: 'Air Pollution',
    waterpollution: 'Water Pollution',
    soilpollution: 'Soil Contamination',
    plasticpollution: 'Plastic Pollution',
    noisepollution: 'Noise Pollution',
    lightpollution: 'Light Pollution',
    thermalpollution: 'Thermal Pollution',
    radioactive: 'Radioactive Contamination',
    chemical: 'Chemical Pollution',
    climatepollution: 'Climate Impact',
};

export default function LocationDetailModal({ isOpen, onClose, location, useCase }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (isOpen && location && useCase) {
            fetchLocationData();
        }
    }, [isOpen, location, useCase]);

    const fetchLocationData = async () => {
        setLoading(true);
        setData(null);

        const categoryLabel = CATEGORY_LABELS[useCase] || useCase;

        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze "${location.name}" for ${categoryLabel} impact.

Provide a comprehensive analysis with REAL 2024 data:

1. CURRENT IMPACT SCORE (0-100): Based on actual metrics for ${categoryLabel}
2. DESCRIPTION: 2-3 sentences explaining the current situation with specific data points
3. KEY POINTS: 4 bullet points with specific metrics (percentages, measurements, rankings)
4. HISTORIC SCORES: Yearly impact scores from 2019-2024 (realistic progression)
5. FUTURE PROJECTIONS: Projected scores for 2025-2030 based on current trends and policies
6. KEY METRICS: 6 important metrics specific to ${categoryLabel} for this location. Each metric needs a name, current value (with unit), and percentage change from previous period (positive or negative number)
7. PERFORMANCE COMPARISON: 4 metrics comparing current vs previous period values with change percentages

Be specific with real numbers, avoid generic statements. Use actual statistics where available.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        impact_score: { type: "number" },
                        description: { type: "string" },
                        key_points: { 
                            type: "array", 
                            items: { type: "string" } 
                        },
                        historic_scores: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    year: { type: "number" },
                                    score: { type: "number" }
                                }
                            }
                        },
                        future_projections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    year: { type: "number" },
                                    score: { type: "number" }
                                }
                            }
                        },
                        trend: { type: "string", enum: ["improving", "worsening", "stable"] },
                        key_metrics: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "string" },
                                    change: { type: "number" }
                                }
                            }
                        },
                        performance_comparison: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    metric: { type: "string" },
                                    current: { type: "string" },
                                    previous: { type: "string" },
                                    change: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });

            setData(response);
        } catch (error) {
            console.error('Error fetching location data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (value) => {
        if (value >= 80) return '#DC2626';
        if (value >= 70) return '#EF4444';
        if (value >= 50) return '#F97316';
        if (value >= 30) return '#FBBF24';
        if (value >= 20) return '#84CC16';
        return '#22C55E';
    };

    const getImpactLabel = (value) => {
        if (value >= 80) return 'Critical';
        if (value >= 70) return 'High';
        if (value >= 50) return 'Moderate';
        if (value >= 30) return 'Low';
        return 'Minimal';
    };

    const categoryLabel = CATEGORY_LABELS[useCase] || useCase;

    // Combine historic and future data for the chart
    const chartData = data ? [
        ...(data.historic_scores || []).map(d => ({ ...d, type: 'historic' })),
        ...(data.future_projections || []).map(d => ({ ...d, type: 'projected' }))
    ] : [];

    if (!isOpen) return null;

    return (
        <div className="absolute top-4 left-4 z-[1001] w-[380px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100% - 2rem)' }}>
            <style>{pulseAnimation}</style>
            
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-white">
                <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 truncate text-sm">{location?.name || 'Location Details'}</span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <img 
                            src={LOADING_LOGO} 
                            alt="Loading" 
                            className="w-16 h-16 object-contain mb-4"
                            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                        />
                        <p className="text-gray-500 text-sm">Analyzing {categoryLabel} data...</p>
                    </div>
                ) : data ? (
                    <div className="flex flex-col h-full">
                        {/* Impact Score Header - Always visible */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">{categoryLabel} Impact</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold" style={{ color: getColor(data.impact_score) }}>
                                                {data.impact_score}
                                            </span>
                                            <span className="text-sm text-gray-600">/ 100</span>
                                            <span 
                                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{ 
                                                    backgroundColor: `${getColor(data.impact_score)}20`,
                                                    color: getColor(data.impact_score)
                                                }}
                                            >
                                                {getImpactLabel(data.impact_score)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {data.trend === 'improving' ? (
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            <TrendingDown className="w-4 h-4" />
                                            <span className="text-xs font-medium">Improving</span>
                                        </div>
                                    ) : data.trend === 'worsening' ? (
                                        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-xs font-medium">Worsening</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                            <Target className="w-4 h-4" />
                                            <span className="text-xs font-medium">Stable</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ 
                                        width: `${data.impact_score}%`, 
                                        backgroundColor: getColor(data.impact_score) 
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Tabs for Content */}
                        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
                            <TabsList className="bg-gray-100 p-1 mb-3 w-full justify-start">
                                <TabsTrigger value="overview" className="gap-1.5 text-xs data-[state=active]:bg-white">
                                    <FileText className="w-3 h-3" /> Overview
                                </TabsTrigger>
                                <TabsTrigger value="findings" className="gap-1.5 text-xs data-[state=active]:bg-white">
                                    <CheckCircle className="w-3 h-3" /> Key Findings
                                </TabsTrigger>
                                <TabsTrigger value="timeline" className="gap-1.5 text-xs data-[state=active]:bg-white">
                                    <Clock className="w-3 h-3" /> Timeline
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-y-auto">
                                <TabsContent value="overview" className="mt-0">
                                    <div className="bg-white rounded-xl p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-2">Overview</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{data.description}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="findings" className="mt-0 space-y-4">
                                    {/* Key Metrics Grid */}
                                    <div className="bg-white rounded-xl p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-3">Key Metrics</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {data.key_metrics?.slice(0, 6).map((metric, i) => (
                                                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <p className="text-xs text-gray-500 mb-1">{metric.name}</p>
                                                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                                                    <div className={`flex items-center gap-1 text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {metric.change >= 0 ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        <span>{metric.change >= 0 ? '+' : ''}{metric.change}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Performance Comparison Table */}
                                    <div className="bg-white rounded-xl p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-3">Performance Comparison</h4>
                                        <div className="overflow-hidden">
                                            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 pb-2 border-b">
                                                <span>Metric</span>
                                                <span>Current</span>
                                                <span>Previous</span>
                                                <span>Change</span>
                                            </div>
                                            {data.performance_comparison?.map((row, i) => (
                                                <div key={i} className="grid grid-cols-4 gap-2 py-2.5 border-b border-gray-100 last:border-0">
                                                    <span className="text-sm font-medium text-gray-700">{row.metric}</span>
                                                    <span className="text-sm text-gray-900">{row.current}</span>
                                                    <span className="text-sm text-gray-500">{row.previous}</span>
                                                    <span className={`text-sm font-medium flex items-center gap-1 ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {row.change >= 0 ? (
                                                            <TrendingUp className="w-3 h-3" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3" />
                                                        )}
                                                        {row.change >= 0 ? '+' : ''}{row.change}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Key Points */}
                                    <div className="bg-white rounded-xl p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-3">Key Findings</h4>
                                        <div className="space-y-2">
                                            {data.key_points?.map((point, i) => (
                                                <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                                                    {data.impact_score >= 50 ? (
                                                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <span className="text-sm text-gray-700">{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline" className="mt-0">
                                    <div className="bg-white rounded-xl p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-3">Impact Score Timeline</h4>
                                        <div className="h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="historicGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis 
                                                        dataKey="year" 
                                                        tick={{ fontSize: 10 }} 
                                                        tickLine={false}
                                                    />
                                                    <YAxis 
                                                        domain={[0, 100]} 
                                                        tick={{ fontSize: 10 }} 
                                                        tickLine={false}
                                                    />
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload[0]) {
                                                                const d = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-2 rounded-lg shadow-lg border text-xs">
                                                                        <p className="font-semibold">{d.year}</p>
                                                                        <p>
                                                                            <span className={d.type === 'historic' ? 'text-purple-600' : 'text-amber-600'}>
                                                                                {d.type === 'historic' ? 'Historic' : 'Projected'}
                                                                            </span>
                                                                            : {d.score}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="score" 
                                                        stroke="#8B5CF6" 
                                                        strokeWidth={2}
                                                        fill="url(#historicGradient)"
                                                        dot={(props) => {
                                                            const { cx, cy, payload } = props;
                                                            if (payload.type === 'projected') return null;
                                                            return (
                                                                <circle cx={cx} cy={cy} r={3} fill="#8B5CF6" stroke="#fff" strokeWidth={2} />
                                                            );
                                                        }}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="score" 
                                                        stroke="#F59E0B" 
                                                        strokeWidth={2}
                                                        strokeDasharray="5 5"
                                                        fill="url(#projectedGradient)"
                                                        dot={(props) => {
                                                            const { cx, cy, payload } = props;
                                                            if (payload.type === 'historic') return null;
                                                            return (
                                                                <circle cx={cx} cy={cy} r={3} fill="#F59E0B" stroke="#fff" strokeWidth={2} />
                                                            );
                                                        }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex items-center justify-center gap-6 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-600" />
                                                <span className="text-xs text-gray-600">Historic</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                <span className="text-xs text-gray-600">Projected</span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Failed to load data. Please try again.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}