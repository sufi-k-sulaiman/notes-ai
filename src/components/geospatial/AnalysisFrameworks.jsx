import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Target, TrendingUp, Zap, BarChart3, Grid3X3, Globe, Building, CircleDot } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
    LineChart, Line, Legend, AreaChart, Area, ScatterChart, Scatter, ZAxis,
    ComposedChart
} from 'recharts';

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
    swot: (categories) => `Perform a SWOT analysis SPECIFICALLY for ${categories} environmental sector.

ONLY include items directly related to ${categories}. Examples:
- For Carbon & Climate: emissions reduction tech, carbon pricing policies, renewable energy adoption, fossil fuel lobbying
- For Forests: deforestation rates, reforestation programs, illegal logging, biodiversity corridors
- For Air & Water: pollution monitoring, treatment infrastructure, industrial emissions, water scarcity

Provide 4 items per category with scores (0-100). Be specific with real data points like percentages, gigatons, PPM levels, hectares.
Also provide a summary insight paragraph analyzing the overall SWOT position.`,

    dmaic: (categories) => `Apply DMAIC (Define, Measure, Analyze, Improve, Control) framework SPECIFICALLY to improve ${categories} outcomes.

For EACH of the 5 DMAIC phases, provide:
- A progress score (0-100) based on global ${categories} efforts
- 3 specific data points with real 2024 metrics relevant to ${categories}

Phase-specific guidance for ${categories}:
- DEFINE: What are the specific ${categories} problems? (e.g., emission levels, pollution rates, resource depletion)
- MEASURE: Current ${categories} metrics and baselines (actual numbers: tons, hectares, PPM, percentages)
- ANALYZE: Root causes of ${categories} issues (industries, regions, behaviors responsible)
- IMPROVE: Solutions being implemented for ${categories} (programs, technologies, policies with real impact data)
- CONTROL: Monitoring and sustaining ${categories} improvements (reporting systems, enforcement, tracking)

Also provide timeline data showing ${categories} progress from 2020-2024 with yearly scores.
Provide a detailed insight explaining what the DMAIC analysis reveals about ${categories} and recommended next steps.`,

    ice: (categories) => `Score 6 specific initiatives for ${categories} using ICE framework.

Initiatives MUST be directly related to ${categories}:
- For Carbon: carbon capture, methane reduction, grid decarbonization, EV adoption, building efficiency
- For Forests: protected area expansion, sustainable forestry, REDD+ programs, indigenous land rights
- For Resources: circular mining, rare earth recycling, sustainable extraction

Rate Impact/Confidence/Ease (1-10) with specific justification using real metrics.
Also provide ROI projections for top 3 initiatives and a summary insight.`,

    pareto: (categories) => `Apply the Pareto 80/20 Principle to ${categories} environmental challenges.

Identify the critical 20% of factors causing 80% of ${categories} problems OR the 20% of solutions delivering 80% of improvements.

For ${categories}, analyze:
- Which specific sources/activities contribute most to the problem?
- What are the highest-impact interventions?
- Where should resources be concentrated for maximum effect?

Provide 6 actions/factors ranked by impact percentage. Each must include:
- Specific action or factor name relevant to ${categories}
- Individual impact percentage (all should total approximately 100%)
- Cumulative impact percentage
- Brief explanation of why this factor is significant for ${categories}

Also provide a detailed insight explaining:
- What the Pareto analysis reveals about ${categories} priorities
- Which 2-3 actions would deliver the most improvement
- Specific recommendations based on the 80/20 distribution`,

    ansoff: (categories) => `Apply Ansoff Growth Matrix to ${categories} environmental solutions and market strategies.

Analyze growth opportunities SPECIFICALLY for ${categories}:

1. MARKET PENETRATION (Low Risk - Existing solutions in existing markets):
   - How can current ${categories} solutions be scaled up?
   - What adoption barriers exist and how to overcome them?
   - Provide 3 specific initiatives with growth potential scores (0-100)

2. MARKET DEVELOPMENT (Medium Risk - Existing solutions in new markets):
   - Which new regions/sectors could adopt ${categories} solutions?
   - What adaptations are needed for new markets?
   - Provide 3 specific initiatives with growth potential scores (0-100)

3. PRODUCT DEVELOPMENT (Medium Risk - New solutions for existing markets):
   - What new technologies/approaches are emerging for ${categories}?
   - What R&D investments are being made?
   - Provide 3 specific initiatives with growth potential scores (0-100)

4. DIVERSIFICATION (High Risk - New solutions in new markets):
   - What cross-sector innovations could address ${categories}?
   - What breakthrough technologies are being explored?
   - Provide 3 specific initiatives with growth potential scores (0-100)

For each quadrant, provide risk score (0-100) and reward potential score (0-100).

Provide a detailed insight explaining:
- Which quadrant offers the best opportunities for ${categories}
- Recommended strategic focus based on current market conditions
- Key success factors for each growth strategy`,

    pestle: (categories) => `Conduct a comprehensive PESTLE analysis for ${categories} sector using 2024 data.

Analyze each factor SPECIFICALLY for ${categories}:

POLITICAL (Score 0-100):
- Government policies and regulations affecting ${categories}
- International agreements and treaties
- Political stability and commitment to ${categories} goals
- Provide 3 specific data points with real 2024 examples

ECONOMIC (Score 0-100):
- Market size and growth for ${categories} solutions
- Investment flows and funding availability
- Cost trends and economic incentives
- Provide 3 specific data points with real 2024 numbers ($B, growth rates)

SOCIAL (Score 0-100):
- Public awareness and attitudes toward ${categories}
- Consumer behavior changes
- Workforce and skills availability
- Provide 3 specific data points with surveys/statistics

TECHNOLOGICAL (Score 0-100):
- Innovation and R&D in ${categories}
- Technology adoption rates
- Breakthrough developments
- Provide 3 specific data points with real examples

LEGAL (Score 0-100):
- Compliance requirements for ${categories}
- Liability and enforcement
- Upcoming legislation
- Provide 3 specific data points with real regulations

ENVIRONMENTAL (Score 0-100):
- Current state of ${categories} metrics
- Climate and ecosystem trends
- Tipping points and risks
- Provide 3 specific data points with real measurements

For each factor, also provide a trend score (-50 to +50) indicating if conditions are worsening or improving.

Provide a detailed insight explaining:
- Which PESTLE factors are most critical for ${categories}
- Key risks and opportunities identified
- Strategic recommendations based on the analysis`,

    porter: (categories) => `Apply Porter's Five Forces to ${categories} industry/sector.

Analyze competitive dynamics specific to ${categories}:
- Rivalry: competition among ${categories} solution providers
- Supplier Power: raw materials, technology for ${categories}
- Buyer Power: governments, corporations demanding ${categories} solutions
- Substitutes: alternative approaches to ${categories} challenges
- New Entrants: startups, new players in ${categories} space

Rate each force 1-10 with specific market data and examples from ${categories} sector.
Also provide market size data and a summary insight.`,

    bcg: (categories) => `Create BCG Matrix for ${categories} initiatives and technologies.

Categorize real ${categories} solutions:
- Stars: high-growth, high-share ${categories} technologies (e.g., solar for carbon, satellite monitoring for forests)
- Cash Cows: mature ${categories} solutions with stable returns
- Question Marks: emerging ${categories} innovations with uncertain outcomes
- Dogs: declining or ineffective ${categories} approaches

Provide market share % and growth rate % for 8 specific ${categories} initiatives.
Also provide investment allocation recommendations and a summary insight.`,
};

const FRAMEWORK_SCHEMAS = {
    swot: {
        type: "object",
        properties: {
            strengths: { type: "array", items: { type: "object", properties: { item: { type: "string" }, score: { type: "number" } } } },
            weaknesses: { type: "array", items: { type: "object", properties: { item: { type: "string" }, score: { type: "number" } } } },
            opportunities: { type: "array", items: { type: "object", properties: { item: { type: "string" }, score: { type: "number" } } } },
            threats: { type: "array", items: { type: "object", properties: { item: { type: "string" }, score: { type: "number" } } } },
            insight: { type: "string" }
        }
    },
    dmaic: {
        type: "object",
        properties: {
            phases: { type: "array", items: { type: "object", properties: { phase: { type: "string" }, score: { type: "number" }, points: { type: "array", items: { type: "string" } } } } },
            timeline: { type: "array", items: { type: "object", properties: { year: { type: "string" }, progress: { type: "number" } } } },
            insight: { type: "string" }
        }
    },
    ice: {
        type: "object",
        properties: {
            initiatives: { type: "array", items: { type: "object", properties: { name: { type: "string" }, impact: { type: "number" }, confidence: { type: "number" }, ease: { type: "number" } } } },
            roi_projections: { type: "array", items: { type: "object", properties: { name: { type: "string" }, roi: { type: "number" }, investment: { type: "number" } } } },
            insight: { type: "string" }
        }
    },
    pareto: {
        type: "object",
        properties: {
            actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, impact: { type: "number" }, cumulative: { type: "number" } } } },
            insight: { type: "string" }
        }
    },
    ansoff: {
        type: "object",
        properties: {
            quadrants: { type: "array", items: { type: "object", properties: { quadrant: { type: "string" }, risk: { type: "number" }, reward: { type: "number" }, initiatives: { type: "array", items: { type: "object", properties: { name: { type: "string" }, score: { type: "number" } } } } } } },
            insight: { type: "string" }
        }
    },
    pestle: {
        type: "object",
        properties: {
            factors: { type: "array", items: { type: "object", properties: { factor: { type: "string" }, score: { type: "number" }, trend: { type: "number" }, points: { type: "array", items: { type: "string" } } } } },
            insight: { type: "string" }
        }
    },
    porter: {
        type: "object",
        properties: {
            forces: { type: "array", items: { type: "object", properties: { force: { type: "string" }, score: { type: "number" }, market_size: { type: "number" }, insight: { type: "string" } } } },
            insight: { type: "string" }
        }
    },
    bcg: {
        type: "object",
        properties: {
            initiatives: { type: "array", items: { type: "object", properties: { name: { type: "string" }, quadrant: { type: "string" }, market_share: { type: "number" }, growth_rate: { type: "number" }, investment: { type: "number" } } } },
            insight: { type: "string" }
        }
    },
};

const COLORS = ['#22C55E', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// SWOT: Radar + Pie
const SWOTDisplay = ({ data }) => {
    const radarData = [
        { name: 'Strengths', value: data.strengths?.reduce((a, b) => a + (b.score || 0), 0) / (data.strengths?.length || 1) },
        { name: 'Weaknesses', value: data.weaknesses?.reduce((a, b) => a + (b.score || 0), 0) / (data.weaknesses?.length || 1) },
        { name: 'Opportunities', value: data.opportunities?.reduce((a, b) => a + (b.score || 0), 0) / (data.opportunities?.length || 1) },
        { name: 'Threats', value: data.threats?.reduce((a, b) => a + (b.score || 0), 0) / (data.threats?.length || 1) },
    ];
    
    const pieData = [
        { name: 'Strengths', value: data.strengths?.length || 0, fill: '#22C55E' },
        { name: 'Weaknesses', value: data.weaknesses?.length || 0, fill: '#EF4444' },
        { name: 'Opportunities', value: data.opportunities?.length || 0, fill: '#3B82F6' },
        { name: 'Threats', value: data.threats?.length || 0, fill: '#F59E0B' },
    ];

    const allItems = [
        ...(data.strengths?.map(s => ({ ...s, type: 'Strength', color: '#22C55E' })) || []),
        ...(data.weaknesses?.map(s => ({ ...s, type: 'Weakness', color: '#EF4444' })) || []),
        ...(data.opportunities?.map(s => ({ ...s, type: 'Opportunity', color: '#3B82F6' })) || []),
        ...(data.threats?.map(s => ({ ...s, type: 'Threat', color: '#F59E0B' })) || []),
    ].sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">SWOT Balance Radar</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Factor Distribution</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Key Insights</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allItems.slice(0, 4).map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 border">
                            <span className="text-xs font-medium" style={{ color: item.color }}>{item.type}</span>
                            <p className="text-sm text-gray-800 truncate">{item.item}</p>
                            <span className="text-xs text-gray-500">Score: {item.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// DMAIC: Bar + Area Timeline
const DMAICDisplay = ({ data }) => {
    const barData = data.phases?.map(p => ({ name: p.phase, score: p.score })) || [];
    const timelineData = data.timeline || [
        { year: '2020', progress: 20 },
        { year: '2021', progress: 35 },
        { year: '2022', progress: 50 },
        { year: '2023', progress: 65 },
        { year: '2024', progress: 80 },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Phase Progress</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Progress Timeline</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Area type="monotone" dataKey="progress" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">DMAIC Analysis</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 space-y-2">
                    {data.phases?.map((phase, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-20 font-medium text-gray-800">{phase.phase}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                <div className="h-full rounded-full" style={{ width: `${phase.score}%`, backgroundColor: COLORS[i] }} />
                            </div>
                            <span className="text-sm font-semibold text-gray-600">{phase.score}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ICE: Stacked Bar + Scatter ROI
const ICEDisplay = ({ data }) => {
    const barData = data.initiatives?.map(i => ({ 
        name: i.name?.substring(0, 12) + '...',
        fullName: i.name,
        Impact: i.impact, 
        Confidence: i.confidence, 
        Ease: i.ease,
        total: i.impact + i.confidence + i.ease 
    })).sort((a, b) => b.total - a.total) || [];

    const scatterData = data.roi_projections?.map(r => ({
        name: r.name,
        x: r.investment,
        y: r.roi,
        z: r.roi * 10
    })) || barData.slice(0, 3).map((b, i) => ({ name: b.fullName, x: (i + 1) * 50, y: b.total * 5, z: b.total * 10 }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">ICE Scores</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 30]} />
                                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                                <Tooltip content={({ payload }) => payload?.[0] && (
                                    <div className="bg-white p-2 rounded shadow border text-xs">
                                        <p className="font-semibold">{payload[0].payload.fullName}</p>
                                        <p>Impact: {payload[0].payload.Impact}</p>
                                        <p>Confidence: {payload[0].payload.Confidence}</p>
                                        <p>Ease: {payload[0].payload.Ease}</p>
                                    </div>
                                )} />
                                <Legend />
                                <Bar dataKey="Impact" stackId="a" fill="#22C55E" />
                                <Bar dataKey="Confidence" stackId="a" fill="#3B82F6" />
                                <Bar dataKey="Ease" stackId="a" fill="#F59E0B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">ROI vs Investment</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="x" name="Investment" unit="M" tick={{ fontSize: 10 }} />
                                <YAxis type="number" dataKey="y" name="ROI" unit="%" tick={{ fontSize: 10 }} />
                                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={scatterData} fill="#8B5CF6" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Priority Recommendations</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 flex gap-4 overflow-x-auto">
                    {barData.slice(0, 3).map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border min-w-[180px]">
                            <span className="text-xs font-medium text-purple-600">#{i + 1} Priority</span>
                            <p className="text-sm font-medium text-gray-800">{item.fullName}</p>
                            <p className="text-xs text-gray-500">Total Score: {item.total}/30</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Pareto: Bar + Line Cumulative
const ParetoDisplay = ({ data }) => {
    const chartData = data.actions?.map(a => ({ 
        name: a.action?.substring(0, 15), 
        fullName: a.action,
        impact: a.impact, 
        cumulative: a.cumulative 
    })) || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Impact Distribution</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
                                <YAxis domain={[0, 40]} />
                                <Tooltip content={({ payload }) => payload?.[0] && (
                                    <div className="bg-white p-2 rounded shadow border text-xs">
                                        <p className="font-semibold">{payload[0].payload.fullName}</p>
                                        <p>Impact: {payload[0].payload.impact}%</p>
                                    </div>
                                )} />
                                <Bar dataKey="impact" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Cumulative Impact (80/20)</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} />
                                <YAxis yAxisId="left" domain={[0, 40]} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                                <Tooltip />
                                <Bar yAxisId="left" dataKey="impact" fill="#3B82F6" opacity={0.7} />
                                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#EF4444" strokeWidth={3} dot />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Pareto Analysis</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 flex items-center gap-4">
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-2xl font-bold text-purple-600">80%</span>
                        <p className="text-xs text-gray-500">of results from</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-2xl font-bold text-green-600">20%</span>
                        <p className="text-xs text-gray-500">of actions</p>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-3 border">
                        <span className="text-sm font-medium text-gray-800">Top Actions:</span>
                        <p className="text-xs text-gray-600">{chartData.slice(0, 2).map(c => c.fullName).join(', ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Ansoff: Scatter Risk/Reward + Bar by Quadrant
const AnsoffDisplay = ({ data }) => {
    const scatterData = data.quadrants?.map(q => ({
        name: q.quadrant,
        risk: q.risk || Math.random() * 100,
        reward: q.reward || Math.random() * 100,
    })) || [];

    const barData = data.quadrants?.flatMap(q => 
        q.initiatives?.map(i => ({ quadrant: q.quadrant, name: i.name?.substring(0, 12), score: i.score })) || []
    ) || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Risk vs Reward Matrix</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="risk" name="Risk" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <YAxis type="number" dataKey="reward" name="Reward" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter data={scatterData} fill="#8B5CF6">
                                    {scatterData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Initiative Scores</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9 }} />
                                <Tooltip />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {barData.map((entry, i) => {
                                        const colorMap = { 'Market Penetration': '#22C55E', 'Market Development': '#3B82F6', 'Product Development': '#F59E0B', 'Diversification': '#EF4444' };
                                        return <Cell key={i} fill={colorMap[entry.quadrant] || COLORS[i % COLORS.length]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Strategic Recommendations</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {data.quadrants?.map((q, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 border">
                            <span className="text-xs font-medium" style={{ color: COLORS[i] }}>{q.quadrant}</span>
                            <p className="text-sm text-gray-600">{q.initiatives?.length || 0} initiatives</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// PESTLE: Radar + Bar with Trends
const PESTLEDisplay = ({ data }) => {
    const radarData = data.factors?.map(f => ({ name: f.factor, score: f.score })) || [];
    const barData = data.factors?.map(f => ({ name: f.factor, current: f.score, trend: f.trend || f.score * 1.1 })) || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Factor Impact Radar</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Impact" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Current vs Projected</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="current" fill="#3B82F6" name="Current" />
                                <Bar dataKey="trend" fill="#22C55E" name="Projected" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">PESTLE Summary</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {data.factors?.map((f, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 border">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-800">{f.factor}</span>
                                <span className="text-xs font-bold" style={{ color: COLORS[i] }}>{f.score}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{f.points?.[0]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Porter: Horizontal Bar + Pie Market Size
const PorterDisplay = ({ data }) => {
    const barData = data.forces?.map(f => ({ name: f.force, score: f.score })) || [];
    const pieData = data.forces?.map((f, i) => ({ name: f.force, value: f.market_size || f.score * 10, fill: COLORS[i] })) || [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Force Intensity</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 10]} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Market Distribution</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name.substring(0, 8)}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Competitive Analysis</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 space-y-2">
                    {data.forces?.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            <span className="text-sm font-medium text-gray-800 w-32">{f.force}</span>
                            <p className="text-xs text-gray-600 flex-1 truncate">{f.insight}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// BCG: Scatter Matrix + Bar Investment
const BCGDisplay = ({ data }) => {
    const scatterData = data.initiatives?.map(item => ({
        name: item.name,
        x: item.market_share,
        y: item.growth_rate,
        quadrant: item.quadrant,
        investment: item.investment || 50
    })) || [];

    const quadrantColors = { Stars: '#F59E0B', 'Cash Cows': '#22C55E', 'Question Marks': '#8B5CF6', Dogs: '#6B7280' };

    const investmentData = ['Stars', 'Cash Cows', 'Question Marks', 'Dogs'].map(q => ({
        name: q,
        investment: scatterData.filter(s => s.quadrant === q).reduce((a, b) => a + (b.investment || 0), 0) || 25,
        fill: quadrantColors[q]
    }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">BCG Matrix</h4>
                    <div className="h-56 relative">
                        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 text-xs text-gray-400">
                            <div className="border-r border-b p-1">Question Marks</div>
                            <div className="border-b p-1">Stars</div>
                            <div className="border-r p-1">Dogs</div>
                            <div className="p-1">Cash Cows</div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="x" domain={[0, 100]} name="Market Share" tick={{ fontSize: 9 }} />
                                <YAxis type="number" dataKey="y" domain={[0, 100]} name="Growth Rate" tick={{ fontSize: 9 }} />
                                <Tooltip content={({ payload }) => payload?.[0] && (
                                    <div className="bg-white p-2 rounded shadow border text-xs">
                                        <p className="font-semibold">{payload[0].payload.name}</p>
                                        <p>Share: {payload[0].payload.x}%</p>
                                        <p>Growth: {payload[0].payload.y}%</p>
                                    </div>
                                )} />
                                <Scatter data={scatterData}>
                                    {scatterData.map((entry, i) => <Cell key={i} fill={quadrantColors[entry.quadrant] || '#8B5CF6'} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border">
                    <h4 className="font-semibold text-gray-700 mb-2">Investment Allocation</h4>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={investmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="investment" radius={[4, 4, 0, 0]}>
                                    {investmentData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Portfolio Strategy</h4>
                <p className="text-gray-700">{data.insight}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Stars', 'Cash Cows', 'Question Marks', 'Dogs'].map(q => (
                        <div key={q} className="bg-white rounded-lg p-2 border">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: quadrantColors[q] }} />
                                <span className="text-xs font-medium">{q}</span>
                            </div>
                            <p className="text-xs text-gray-500">{scatterData.filter(s => s.quadrant === q).length} items</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

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