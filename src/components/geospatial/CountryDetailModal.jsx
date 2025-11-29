import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Loader2, TrendingUp, TrendingDown, ExternalLink, BarChart3, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function CountryDetailModal({ isOpen, onClose, country, isTopPerformer, categories }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && country) {
            fetchDetails();
        }
    }, [isOpen, country]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const categoryNames = categories.join(', ');
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide detailed 2024 environmental analysis for ${country.name} regarding ${categoryNames}.

Include:
1. Overview: 2-3 sentence summary of current status (no URLs in text)
2. Key Metrics: 5 specific metrics with numerical values
3. Trend Analysis: Performance over last 5 years (2020-2024) with yearly scores 0-100
4. Breakdown by Factor: 5 factors contributing to the score with individual scores
5. Key Initiatives: 3 current programs or policies
6. Challenges: 3 main obstacles
7. Sources: List 3 reputable data sources with their URLs separately

IMPORTANT: Do NOT include any URLs or web links within the text descriptions. Keep URLs only in the sources section.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        metrics: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "string" },
                                    unit: { type: "string" }
                                }
                            }
                        },
                        trend: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    year: { type: "string" },
                                    score: { type: "number" }
                                }
                            }
                        },
                        factors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    score: { type: "number" }
                                }
                            }
                        },
                        initiatives: { type: "array", items: { type: "string" } },
                        challenges: { type: "array", items: { type: "string" } },
                        sources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    url: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setDetails(response);
        } catch (err) {
            console.error('Error fetching country details:', err);
        } finally {
            setLoading(false);
        }
    };

    const accentColor = isTopPerformer ? '#22C55E' : '#F59E0B';
    const bgGradient = isTopPerformer ? 'from-emerald-50 to-green-50' : 'from-amber-50 to-orange-50';
    const borderColor = isTopPerformer ? 'border-emerald-200' : 'border-amber-200';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 z-[10000]">
                {/* Header */}
                <div className={`p-4 border-b ${borderColor} bg-gradient-to-r ${bgGradient} sticky top-0 z-10`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${accentColor}20` }}
                            >
                                {isTopPerformer ? (
                                    <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                                ) : (
                                    <TrendingDown className="w-5 h-5" style={{ color: accentColor }} />
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">{country?.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {isTopPerformer ? 'Top Performer' : 'Needs Improvement'} • Score: {country?.score}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onClose(false)}
                            className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin mr-3" style={{ color: accentColor }} />
                            <span className="text-gray-600">Analyzing {country?.name}...</span>
                        </div>
                    ) : details ? (
                        <div className="space-y-6">
                            {/* Overview */}
                            <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-4 border ${borderColor}`}>
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4" style={{ color: accentColor }} />
                                    Overview
                                </h3>
                                <p className="text-gray-700 text-sm leading-relaxed">{details.overview}</p>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Trend Chart */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Performance Trend (2020-2024)</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={details.trend || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Bar dataKey="score" fill={accentColor} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Factors Radar */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Factor Breakdown</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={details.factors || []}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                                <Radar name="Score" dataKey="score" stroke={accentColor} fill={accentColor} fillOpacity={0.4} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" style={{ color: accentColor }} />
                                    Key Metrics
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {details.metrics?.map((metric, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                                            <p className="text-lg font-bold" style={{ color: accentColor }}>{metric.value}</p>
                                            <p className="text-xs text-gray-500">{metric.unit}</p>
                                            <p className="text-xs text-gray-700 font-medium mt-1">{metric.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Initiatives & Challenges */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-3">Key Initiatives</h4>
                                    <ul className="space-y-2">
                                        {details.initiatives?.map((item, i) => (
                                            <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <h4 className="font-semibold text-red-800 mb-3">Challenges</h4>
                                    <ul className="space-y-2">
                                        {details.challenges?.map((item, i) => (
                                            <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Sources */}
                            {details.sources && details.sources.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-gray-500" />
                                        Data Sources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {details.sources.map((source, i) => (
                                            <a 
                                                key={i}
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {source.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}