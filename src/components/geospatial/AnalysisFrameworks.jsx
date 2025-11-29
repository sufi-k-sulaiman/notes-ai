import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Target, TrendingUp, Zap, BarChart3, Grid3X3, Globe, Building, CircleDot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, Legend } from 'recharts';

const FRAMEWORKS = [
    { id: 'swot', name: 'SWOT', icon: Grid3X3 },
    { id: 'dmaic', name: 'DMAIC', icon: Target },
    { id: 'ice', name: 'ICE', icon: Zap },
    { id: 'pareto', name: 'Pareto', icon: BarChart3 },
    { id: 'ansoff', name: 'Ansoff', icon: TrendingUp },
    { id: 'pestle', name: 'PESTLE', icon: Globe },
    { id: 'porter', name: 'Porter', icon: Building },
    { id: 'bcg', name: 'BCG', icon: CircleDot },
];

const CATEGORY_LABELS = {
    carbon: 'Carbon & Climate',
    airwater: 'Air & Water Quality',
    forests: 'Forests & Biodiversity',
    resources: 'Natural Resources',
    sustainability: 'Sustainability',
    health: 'Environmental Health',
    treasures: 'National Treasures & Protected Areas',
};

const FRAMEWORK_PROMPTS = {
    swot: (categories) => `Perform a detailed SWOT analysis for global environmental efforts in: ${categories}. Provide 4 items each with a score (0-100) indicating strength/severity.`,
    dmaic: (categories) => `Apply DMAIC framework to improving global ${categories} outcomes. For each phase provide a score (0-100) indicating current progress and 3 specific data points.`,
    ice: (categories) => `Use ICE scoring for 6 environmental initiatives for ${categories}. Each needs Impact (1-10), Confidence (1-10), Ease (1-10) scores with specific metrics.`,
    pareto: (categories) => `Apply Pareto (80/20) to ${categories}. List 6 actions with their impact percentage (totaling 100%) and specific measurable outcomes.`,
    ansoff: (categories) => `Apply Ansoff Matrix to ${categories} environmental strategy. Provide 3 specific initiatives per quadrant with growth potential scores (0-100).`,
    pestle: (categories) => `Conduct PESTLE analysis for ${categories}. For each factor provide an impact score (0-100) and 2 specific current data points/statistics.`,
    porter: (categories) => `Apply Porter's Five Forces to ${categories} industry. Rate each force 1-10 and provide specific market data and competitive insights.`,
    bcg: (categories) => `Create BCG Matrix for ${categories} initiatives. Provide market share % and growth rate % for 8 specific initiatives across all quadrants.`,
};

const FRAMEWORK_SCHEMAS = {
    swot: {
        type: "object",
        properties: {
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            threats: { type: "array", items: { type: "string" } }
        }
    },
    dmaic: {
        type: "object",
        properties: {
            define: { type: "array", items: { type: "string" } },
            measure: { type: "array", items: { type: "string" } },
            analyze: { type: "array", items: { type: "string" } },
            improve: { type: "array", items: { type: "string" } },
            control: { type: "array", items: { type: "string" } }
        }
    },
    ice: {
        type: "object",
        properties: {
            initiatives: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        impact: { type: "number" },
                        confidence: { type: "number" },
                        ease: { type: "number" },
                        reasoning: { type: "string" }
                    }
                }
            }
        }
    },
    pareto: {
        type: "object",
        properties: {
            high_impact_actions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        action: { type: "string" },
                        impact_percentage: { type: "number" },
                        description: { type: "string" }
                    }
                }
            }
        }
    },
    ansoff: {
        type: "object",
        properties: {
            market_penetration: { type: "array", items: { type: "string" } },
            market_development: { type: "array", items: { type: "string" } },
            product_development: { type: "array", items: { type: "string" } },
            diversification: { type: "array", items: { type: "string" } }
        }
    },
    pestle: {
        type: "object",
        properties: {
            political: { type: "array", items: { type: "string" } },
            economic: { type: "array", items: { type: "string" } },
            social: { type: "array", items: { type: "string" } },
            technological: { type: "array", items: { type: "string" } },
            legal: { type: "array", items: { type: "string" } },
            environmental: { type: "array", items: { type: "string" } }
        }
    },
    porter: {
        type: "object",
        properties: {
            competitive_rivalry: { type: "string" },
            supplier_power: { type: "string" },
            buyer_power: { type: "string" },
            threat_of_substitution: { type: "string" },
            threat_of_new_entry: { type: "string" }
        }
    },
    bcg: {
        type: "object",
        properties: {
            stars: { type: "array", items: { type: "string" } },
            cash_cows: { type: "array", items: { type: "string" } },
            question_marks: { type: "array", items: { type: "string" } },
            dogs: { type: "array", items: { type: "string" } }
        }
    },
};

// Render components for each framework
const SWOTDisplay = ({ data }) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 text-sm">Strengths</h4>
            <ul className="space-y-1">{data.strengths?.map((s, i) => <li key={i} className="text-xs text-green-700">• {s}</li>)}</ul>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2 text-sm">Weaknesses</h4>
            <ul className="space-y-1">{data.weaknesses?.map((w, i) => <li key={i} className="text-xs text-red-700">• {w}</li>)}</ul>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">Opportunities</h4>
            <ul className="space-y-1">{data.opportunities?.map((o, i) => <li key={i} className="text-xs text-blue-700">• {o}</li>)}</ul>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2 text-sm">Threats</h4>
            <ul className="space-y-1">{data.threats?.map((t, i) => <li key={i} className="text-xs text-amber-700">• {t}</li>)}</ul>
        </div>
    </div>
);

const DMAICDisplay = ({ data }) => (
    <div className="space-y-3">
        {['define', 'measure', 'analyze', 'improve', 'control'].map((phase) => (
            <div key={phase} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm capitalize">{phase}</h4>
                <ul className="space-y-1">{data[phase]?.map((item, i) => <li key={i} className="text-xs text-gray-600">• {item}</li>)}</ul>
            </div>
        ))}
    </div>
);

const ICEDisplay = ({ data }) => (
    <div className="space-y-2">
        {data.initiatives?.map((init, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800 text-sm">{init.name}</span>
                    <span className="text-xs font-bold text-purple-600">Score: {init.impact + init.confidence + init.ease}</span>
                </div>
                <div className="flex gap-4 mb-1">
                    <span className="text-xs"><span className="text-gray-500">Impact:</span> {init.impact}/10</span>
                    <span className="text-xs"><span className="text-gray-500">Confidence:</span> {init.confidence}/10</span>
                    <span className="text-xs"><span className="text-gray-500">Ease:</span> {init.ease}/10</span>
                </div>
                <p className="text-xs text-gray-500">{init.reasoning}</p>
            </div>
        ))}
    </div>
);

const ParetoDisplay = ({ data }) => (
    <div className="space-y-2">
        {data.high_impact_actions?.map((action, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800 text-sm">{action.action}</span>
                    <span className="text-xs font-bold text-green-600">{action.impact_percentage}% impact</span>
                </div>
                <p className="text-xs text-gray-500">{action.description}</p>
            </div>
        ))}
    </div>
);

const AnsoffDisplay = ({ data }) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">Market Penetration</h4>
            <ul className="space-y-1">{data.market_penetration?.map((m, i) => <li key={i} className="text-xs text-blue-700">• {m}</li>)}</ul>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 text-sm">Market Development</h4>
            <ul className="space-y-1">{data.market_development?.map((m, i) => <li key={i} className="text-xs text-purple-700">• {m}</li>)}</ul>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 text-sm">Product Development</h4>
            <ul className="space-y-1">{data.product_development?.map((p, i) => <li key={i} className="text-xs text-green-700">• {p}</li>)}</ul>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2 text-sm">Diversification</h4>
            <ul className="space-y-1">{data.diversification?.map((d, i) => <li key={i} className="text-xs text-orange-700">• {d}</li>)}</ul>
        </div>
    </div>
);

const PESTLEDisplay = ({ data }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {['political', 'economic', 'social', 'technological', 'legal', 'environmental'].map((factor) => (
            <div key={factor} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm capitalize">{factor}</h4>
                <ul className="space-y-1">{data[factor]?.map((item, i) => <li key={i} className="text-xs text-gray-600">• {item}</li>)}</ul>
            </div>
        ))}
    </div>
);

const PorterDisplay = ({ data }) => (
    <div className="space-y-3">
        {[
            { key: 'competitive_rivalry', label: 'Competitive Rivalry', color: 'red' },
            { key: 'supplier_power', label: 'Supplier Power', color: 'blue' },
            { key: 'buyer_power', label: 'Buyer Power', color: 'green' },
            { key: 'threat_of_substitution', label: 'Threat of Substitution', color: 'amber' },
            { key: 'threat_of_new_entry', label: 'Threat of New Entry', color: 'purple' },
        ].map((force) => (
            <div key={force.key} className={`bg-${force.color}-50 rounded-lg p-3 border border-${force.color}-200`}>
                <h4 className={`font-semibold text-${force.color}-800 mb-1 text-sm`}>{force.label}</h4>
                <p className="text-xs text-gray-600">{data[force.key]}</p>
            </div>
        ))}
    </div>
);

const BCGDisplay = ({ data }) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2 text-sm">⭐ Stars</h4>
            <ul className="space-y-1">{data.stars?.map((s, i) => <li key={i} className="text-xs text-yellow-700">• {s}</li>)}</ul>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 text-sm">🐄 Cash Cows</h4>
            <ul className="space-y-1">{data.cash_cows?.map((c, i) => <li key={i} className="text-xs text-green-700">• {c}</li>)}</ul>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 text-sm">❓ Question Marks</h4>
            <ul className="space-y-1">{data.question_marks?.map((q, i) => <li key={i} className="text-xs text-purple-700">• {q}</li>)}</ul>
        </div>
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">🐕 Dogs</h4>
            <ul className="space-y-1">{data.dogs?.map((d, i) => <li key={i} className="text-xs text-gray-600">• {d}</li>)}</ul>
        </div>
    </div>
);

const DISPLAY_COMPONENTS = {
    swot: SWOTDisplay,
    dmaic: DMAICDisplay,
    ice: ICEDisplay,
    pareto: ParetoDisplay,
    ansoff: AnsoffDisplay,
    pestle: PESTLEDisplay,
    porter: PorterDisplay,
    bcg: BCGDisplay,
};

export default function AnalysisFrameworks({ selectedCategories = [] }) {
    const [activeTab, setActiveTab] = useState('swot');
    const [frameworkData, setFrameworkData] = useState({});
    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const categoryKey = selectedCategories.sort().join(',');

    useEffect(() => {
        if (selectedCategories.length > 0) {
            fetchFrameworkData(activeTab);
        }
    }, [activeTab, categoryKey]);

    const fetchFrameworkData = async (framework) => {
        const cacheKey = `${framework}-${categoryKey}`;
        if (cacheRef.current[cacheKey]) {
            setFrameworkData(prev => ({ ...prev, [framework]: cacheRef.current[cacheKey] }));
            return;
        }

        setLoading(true);
        try {
            const categoryNames = selectedCategories
                .map(c => CATEGORY_LABELS[c] || c)
                .join(', ');

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: FRAMEWORK_PROMPTS[framework](categoryNames),
                add_context_from_internet: true,
                response_json_schema: FRAMEWORK_SCHEMAS[framework]
            });

            cacheRef.current[cacheKey] = response;
            setFrameworkData(prev => ({ ...prev, [framework]: response }));
        } catch (err) {
            console.error('Error fetching framework data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (selectedCategories.length === 0) return null;

    const DisplayComponent = DISPLAY_COMPONENTS[activeTab];
    const data = frameworkData[activeTab];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 my-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100 p-1 mb-4 flex-wrap h-auto gap-1">
                    {FRAMEWORKS.map(fw => {
                        const Icon = fw.icon;
                        return (
                            <TabsTrigger 
                                key={fw.id} 
                                value={fw.id}
                                className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                            >
                                <Icon className="w-3 h-3" />
                                {fw.name}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin mr-3" />
                        <span className="text-gray-600">Generating {activeTab.toUpperCase()} analysis...</span>
                    </div>
                ) : data ? (
                    <DisplayComponent data={data} />
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Select a framework to view analysis
                    </div>
                )}
            </Tabs>
        </div>
    );
}