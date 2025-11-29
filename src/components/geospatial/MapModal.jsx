import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import GeospatialMap from './GeospatialMap';
import { base44 } from '@/api/base44Client';

const USE_CASE_CONFIG = {
    carbon: {
        title: 'Carbon Hotspots',
        description: 'Global CO2 emission concentrations and climate impact zones',
        highLabel: 'Highest Emitters',
        lowLabel: 'Lowest Emitters',
        highMetric: 'CO2 emissions (Mt/year)',
        lowMetric: 'CO2 per capita (tons)'
    },
    forests: {
        title: 'Forest Coverage',
        description: 'Global forest density, deforestation rates, and biodiversity zones',
        highLabel: 'Deforestation Hotspots',
        lowLabel: 'Reforestation Leaders',
        highMetric: 'Forest loss (hectares/year)',
        lowMetric: 'Forest gain (hectares/year)'
    },
    resources: {
        title: 'Natural Resources',
        description: 'Mining sites, energy reserves, and extraction impact areas',
        highLabel: 'Resource Depletion Zones',
        lowLabel: 'Sustainable Extraction',
        highMetric: 'Depletion rate (%)',
        lowMetric: 'Sustainability index'
    },
    biomass: {
        title: 'Biomass Production',
        description: 'Biofuel, organic matter, and composting zones',
        highLabel: 'High Biomass Regions',
        lowLabel: 'Biomass Deficit Areas',
        highMetric: 'Production (Mt/year)',
        lowMetric: 'Consumption rate'
    },
    produce: {
        title: 'Produce & Crops',
        description: 'Agricultural productivity and crop yields',
        highLabel: 'Top Producers',
        lowLabel: 'Low Yield Regions',
        highMetric: 'Yield (tons/hectare)',
        lowMetric: 'Food security index'
    },
    dairy: {
        title: 'Milk & Dairy',
        description: 'Dairy production and processing centers',
        highLabel: 'Major Dairy Regions',
        lowLabel: 'Dairy Deficit Areas',
        highMetric: 'Production (million liters)',
        lowMetric: 'Per capita consumption'
    },
    livestock: {
        title: 'Livestock & Protein',
        description: 'Cattle, poultry, and meat production zones',
        highLabel: 'Intensive Farming',
        lowLabel: 'Sustainable Farming',
        highMetric: 'Head count (millions)',
        lowMetric: 'Methane emissions'
    },
    power: {
        title: 'Power Consumption',
        description: 'Energy usage patterns and grid demand',
        highLabel: 'Highest Consumers',
        lowLabel: 'Energy Efficient',
        highMetric: 'TWh/year',
        lowMetric: 'Renewable %'
    },
    wellness: {
        title: 'Wellness & Health',
        description: 'Public health indicators and environmental health',
        highLabel: 'Health Challenges',
        lowLabel: 'Healthiest Regions',
        highMetric: 'Disease burden',
        lowMetric: 'Life expectancy'
    },
    elements: {
        title: 'Earth Elements',
        description: 'Rare earth and mineral extraction zones',
        highLabel: 'Rich Deposits',
        lowLabel: 'Depleted Zones',
        highMetric: 'Reserve value ($B)',
        lowMetric: 'Extraction rate'
    },
    airpollution: {
        title: 'Air Pollution',
        description: 'PM2.5, smog, and atmospheric contamination',
        highLabel: 'Most Polluted',
        lowLabel: 'Cleanest Air',
        highMetric: 'PM2.5 (μg/m³)',
        lowMetric: 'AQI Index'
    },
    waterpollution: {
        title: 'Water Pollution',
        description: 'Contamination, runoff, and marine debris',
        highLabel: 'Critical Zones',
        lowLabel: 'Clean Waters',
        highMetric: 'Pollution index',
        lowMetric: 'Water quality score'
    },
    soilpollution: {
        title: 'Soil Pollution',
        description: 'Contaminated land and degradation zones',
        highLabel: 'Contaminated Areas',
        lowLabel: 'Healthy Soil',
        highMetric: 'Heavy metals (ppm)',
        lowMetric: 'Soil health index'
    },
    plasticpollution: {
        title: 'Plastic Pollution',
        description: 'Ocean plastic and microplastic concentrations',
        highLabel: 'Plastic Hotspots',
        lowLabel: 'Clean Zones',
        highMetric: 'Plastic waste (Mt)',
        lowMetric: 'Recycling rate %'
    },
    noisepollution: {
        title: 'Noise Pollution',
        description: 'Urban noise and industrial sound levels',
        highLabel: 'Noisiest Cities',
        lowLabel: 'Quietest Areas',
        highMetric: 'Decibels (dB)',
        lowMetric: 'Quiet hours/day'
    },
    lightpollution: {
        title: 'Light Pollution',
        description: 'Sky glow and artificial light at night',
        highLabel: 'Brightest Areas',
        lowLabel: 'Dark Sky Zones',
        highMetric: 'Radiance (nW)',
        lowMetric: 'Star visibility'
    },
    thermalpollution: {
        title: 'Thermal Pollution',
        description: 'Industrial heat and temperature anomalies',
        highLabel: 'Heat Islands',
        lowLabel: 'Cool Zones',
        highMetric: 'Temp anomaly (°C)',
        lowMetric: 'Cooling efficiency'
    },
    radioactive: {
        title: 'Radioactive Pollution',
        description: 'Nuclear waste and radiation zones',
        highLabel: 'Contaminated Sites',
        lowLabel: 'Safe Zones',
        highMetric: 'Radiation (mSv)',
        lowMetric: 'Background level'
    },
    chemical: {
        title: 'Chemical Pollution',
        description: 'Industrial chemicals and toxic contamination',
        highLabel: 'Toxic Hotspots',
        lowLabel: 'Clean Industry',
        highMetric: 'Toxic release (tons)',
        lowMetric: 'Cleanup progress %'
    },
    climatepollution: {
        title: 'Climate-Linked Pollution',
        description: 'GHG emissions and climate warming impact',
        highLabel: 'Worst Contributors',
        lowLabel: 'Climate Leaders',
        highMetric: 'GHG (MtCO2e)',
        lowMetric: 'Net zero progress %'
    },
    sustainability: {
        title: 'Sustainability',
        description: 'Renewable energy and green initiatives',
        highLabel: 'Leaders',
        lowLabel: 'Lagging Regions',
        highMetric: 'Sustainability score',
        lowMetric: 'Improvement rate'
    },
    treasures: {
        title: 'National Treasures',
        description: 'Protected areas and heritage sites',
        highLabel: 'Most Protected',
        lowLabel: 'At Risk Sites',
        highMetric: 'Protection status',
        lowMetric: 'Threat level'
    }
};

export default function MapModal({ isOpen, onClose, title, icon: Icon, iconColor, useCase, mapType }) {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const config = USE_CASE_CONFIG[useCase] || USE_CASE_CONFIG.carbon;

    useEffect(() => {
        if (isOpen && useCase) {
            fetchAnalysis();
        }
    }, [isOpen, useCase]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide a detailed 2024 analysis for ${config.title} (${config.description}).

Include:
1. Current Status: What's happening globally right now with specific numbers
2. Key Impacts: 3 major environmental/economic impacts with real data

3. ${config.highLabel} (5 locations): Places with the HIGHEST levels/worst performance
   - Include specific location names, countries, and exact data values for ${config.highMetric}

4. ${config.lowLabel} (5 locations): Places with the LOWEST levels/best performance  
   - Include specific location names, countries, and exact data values for ${config.lowMetric}

Use real 2024 data. Be specific with numbers, locations, and measurable metrics.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        current_status: { type: "string" },
                        key_impacts: { type: "array", items: { type: "string" } },
                        high_locations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    country: { type: "string" },
                                    value: { type: "string" },
                                    detail: { type: "string" }
                                }
                            }
                        },
                        low_locations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    country: { type: "string" },
                                    value: { type: "string" },
                                    detail: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            setAnalysis(response);
        } catch (err) {
            console.error('Error fetching analysis:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" style={{ zIndex: 9999 }}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${iconColor}20` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: iconColor }} />
                            </div>
                        )}
                        <div>
                            <h2 className="font-semibold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-500">{config.description}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onClose(false)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Map */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ position: 'relative', zIndex: 1 }}>
                        <GeospatialMap 
                            useCase={useCase}
                            mapType={mapType}
                            height="400px"
                            color={iconColor}
                        />
                    </div>

                    {/* Analysis Section */}
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-3" />
                            <span className="text-gray-600">Analyzing {title}...</span>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-4">
                            {/* Current Status */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" style={{ color: iconColor }} />
                                    Current Status
                                </h3>
                                <p className="text-gray-700">{analysis.current_status}</p>
                            </div>

                            {/* Key Impacts */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <h3 className="font-semibold text-amber-800 mb-2">Key Impacts</h3>
                                <ul className="space-y-1">
                                    {analysis.key_impacts?.map((impact, i) => (
                                        <li key={i} className="text-amber-900 flex items-start gap-2">
                                            <span className="text-amber-500 mt-1">•</span>
                                            {impact}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* High & Low Locations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* High Locations (Hotspots/Worst) */}
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        {config.highLabel}
                                    </h3>
                                    <p className="text-xs text-red-600 mb-3">{config.highMetric}</p>
                                    <div className="space-y-2">
                                        {analysis.high_locations?.map((loc, i) => (
                                            <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin className="w-4 h-4 text-red-500" />
                                                    <span className="font-medium text-red-900">{loc.name}</span>
                                                    <span className="text-xs text-red-600">({loc.country})</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-red-800">{loc.detail}</span>
                                                    <span className="text-sm font-bold text-red-600">{loc.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Low Locations (Best/Leaders) */}
                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5" />
                                        {config.lowLabel}
                                    </h3>
                                    <p className="text-xs text-green-600 mb-3">{config.lowMetric}</p>
                                    <div className="space-y-2">
                                        {analysis.low_locations?.map((loc, i) => (
                                            <div key={i} className="bg-white rounded-lg p-3 border border-green-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span className="font-medium text-green-900">{loc.name}</span>
                                                    <span className="text-xs text-green-600">({loc.country})</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-green-800">{loc.detail}</span>
                                                    <span className="text-sm font-bold text-green-600">{loc.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}