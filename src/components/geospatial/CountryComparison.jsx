import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const CATEGORY_LABELS = {
    carbon: 'Carbon & Climate',
    airwater: 'Air & Water Quality',
    forests: 'Forests & Biodiversity',
    resources: 'Natural Resources',
    sustainability: 'Sustainability',
    health: 'Environmental Health',
    treasures: 'National Treasures & Protected Areas',
};

const CATEGORY_SPECIFIC_PROMPTS = {
    carbon: `Focus ONLY on carbon emissions and climate metrics:
- CO2 emissions per capita (tons)
- Total emissions (gigatons)
- Renewable energy % of grid
- Carbon intensity of economy
- Net zero commitments and progress
- Coal phase-out status`,

    airwater: `Focus ONLY on air and water quality metrics:
- PM2.5 levels (μg/m³)
- Air Quality Index averages
- Clean water access %
- Water treatment coverage
- Industrial pollution levels
- Respiratory disease rates`,

    forests: `Focus ONLY on forests and biodiversity metrics:
- Forest coverage % of land
- Deforestation rate (hectares/year)
- Protected area % of territory
- Species extinction risk
- Reforestation programs
- Illegal logging enforcement`,

    resources: `Focus ONLY on natural resource management:
- Mining sustainability practices
- Resource extraction rates
- Environmental damage from extraction
- Rare earth mining impact
- Oil/gas spill incidents
- Rehabilitation of mining sites`,

    sustainability: `Focus ONLY on sustainability metrics:
- Renewable energy capacity (GW)
- Circular economy adoption
- Waste recycling rates
- Green building standards
- Sustainable agriculture %
- ESG investment flows`,

    health: `Focus ONLY on environmental health metrics:
- Pollution-related deaths per 100k
- Lead/mercury contamination levels
- Toxic waste management
- Chemical spill incidents
- Environmental disease burden
- Clean cooking fuel access`,

    treasures: `Focus ONLY on natural heritage protection:
- UNESCO site conservation status
- National park coverage
- Heritage site funding
- Tourism impact management
- Indigenous land rights
- Wildlife corridor preservation`
};

export default function CountryComparison({ selectedCategories = [] }) {
    const [topCountries, setTopCountries] = useState([]);
    const [bottomCountries, setBottomCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastCategories, setLastCategories] = useState('');

    useEffect(() => {
        const categoriesKey = selectedCategories.sort().join(',');
        if (categoriesKey !== lastCategories && selectedCategories.length > 0) {
            setLastCategories(categoriesKey);
            fetchCountryData();
        }
    }, [selectedCategories]);

    const fetchCountryData = async () => {
        setLoading(true);
        setError(null);
        setTopCountries([]);
        setBottomCountries([]);
        
        try {
            const categoryNames = selectedCategories
                .map(c => CATEGORY_LABELS[c] || c)
                .join(', ');

            const specificMetrics = selectedCategories
                .map(c => CATEGORY_SPECIFIC_PROMPTS[c] || '')
                .filter(Boolean)
                .join('\n\n');

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an environmental data analyst. Analyze countries SPECIFICALLY for: ${categoryNames}.

CRITICAL: Use ONLY these category-specific metrics to rank countries:
${specificMetrics}

Provide the top 5 BEST-performing countries and bottom 5 WORST-performing countries based on 2024 data.

REQUIREMENTS:
- Each country MUST have specific numerical data (not vague statements)
- Scores must reflect ONLY the selected categories, not general environmental performance
- Include actual statistics like: percentages, tons, hectares, PPM, μg/m³, GW, etc.
- Different categories MUST produce different country rankings
- For Carbon: China, USA, India should likely be in worst performers
- For Forests: Brazil, Indonesia, DRC deforestation should be considered
- For Sustainability: Nordic countries, Costa Rica should rank high

DO NOT give generic environmental rankings. Be SPECIFIC to ${categoryNames}.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        top_performers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    score: { type: "number" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        needs_improvement: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    score: { type: "number" },
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setTopCountries(response?.top_performers || []);
            setBottomCountries(response?.needs_improvement || []);
        } catch (err) {
            console.error('Error fetching country data:', err);
            setError('Failed to load country data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 my-6 bg-gray-50 rounded-xl border border-gray-200">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-3" />
                <span className="text-gray-600">Analyzing country performance...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 my-6 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-600">{error}</span>
            </div>
        );
    }

    if (topCountries.length === 0 && bottomCountries.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            {/* Top Performers */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Top Performers</h3>
                        <p className="text-xs text-gray-500">Leading in environmental metrics</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {topCountries.map((country, i) => (
                        <div 
                            key={country.name}
                            className="bg-white rounded-lg p-3 border border-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-gray-900">{country.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-600">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-sm font-semibold">{country.score}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 ml-7 line-clamp-2">{country.reason}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Needs Improvement</h3>
                        <p className="text-xs text-gray-500">Opportunities for progress</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {bottomCountries.map((country, i) => (
                        <div 
                            key={country.name}
                            className="bg-white rounded-lg p-3 border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="font-medium text-gray-900">{country.name}</span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-600">
                                    <TrendingDown className="w-3 h-3" />
                                    <span className="text-sm font-semibold">{country.score}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 ml-7 line-clamp-2">{country.reason}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}