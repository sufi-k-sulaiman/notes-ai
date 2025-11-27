import React, { useState } from 'react';
import { 
    Target, TrendingUp, Zap, BarChart3, Grid3X3, Globe2, 
    Building2, CircleDot, ChevronRight, Plus, Minus, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';

const FRAMEWORKS = [
    { id: 'swot', name: 'SWOT', icon: Grid3X3, color: '#6366F1', description: 'Strengths, Weaknesses, Opportunities, Threats' },
    { id: 'dmaic', name: 'DMAIC', icon: Target, color: '#10B981', description: 'Define, Measure, Analyze, Improve, Control' },
    { id: 'ice', name: 'ICE', icon: Zap, color: '#F59E0B', description: 'Impact, Confidence, Ease scoring' },
    { id: 'pareto', name: 'Pareto', icon: BarChart3, color: '#EF4444', description: '80/20 principle analysis' },
    { id: 'ansoff', name: 'Ansoff', icon: Grid3X3, color: '#8B5CF6', description: 'Growth strategy matrix' },
    { id: 'pestle', name: 'PESTLE', icon: Globe2, color: '#06B6D4', description: 'Political, Economic, Social, Tech, Legal, Environmental' },
    { id: 'porter', name: 'Porter', icon: Building2, color: '#EC4899', description: "Five forces competitive analysis" },
    { id: 'bcg', name: 'BCG', icon: CircleDot, color: '#22C55E', description: 'Growth-share matrix' },
];

const SWOTAnalysis = ({ domain }) => {
    const data = {
        strengths: ['Strong GDP growth', 'Skilled workforce', 'Tech innovation', 'Infrastructure'],
        weaknesses: ['High debt levels', 'Aging population', 'Resource dependency', 'Bureaucracy'],
        opportunities: ['Green energy', 'Digital transformation', 'Trade agreements', 'Tourism growth'],
        threats: ['Inflation', 'Geopolitical tensions', 'Climate change', 'Competition']
    };
    
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Strengths</h4>
                </div>
                <ul className="space-y-2">
                    {data.strengths.map((item, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Minus className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">Weaknesses</h4>
                </div>
                <ul className="space-y-2">
                    {data.weaknesses.map((item, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ArrowUp className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Opportunities</h4>
                </div>
                <ul className="space-y-2">
                    {data.opportunities.map((item, i) => (
                        <li key={i} className="text-sm text-blue-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ArrowDown className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-800">Threats</h4>
                </div>
                <ul className="space-y-2">
                    {data.threats.map((item, i) => (
                        <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const DMAICAnalysis = () => {
    const phases = [
        { name: 'Define', score: 85, color: '#6366F1', desc: 'Problem clearly identified' },
        { name: 'Measure', score: 72, color: '#8B5CF6', desc: 'Data collection in progress' },
        { name: 'Analyze', score: 68, color: '#A855F7', desc: 'Root cause analysis' },
        { name: 'Improve', score: 45, color: '#C084FC', desc: 'Solutions being implemented' },
        { name: 'Control', score: 30, color: '#E879F9', desc: 'Monitoring systems needed' },
    ];
    
    return (
        <div className="space-y-4">
            {phases.map((phase, i) => (
                <div key={phase.name} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-gray-700">{phase.name}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                            className="h-full rounded-lg transition-all"
                            style={{ width: `${phase.score}%`, backgroundColor: phase.color }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                            {phase.score}%
                        </span>
                    </div>
                    <div className="w-40 text-xs text-gray-500">{phase.desc}</div>
                </div>
            ))}
        </div>
    );
};

const ICEAnalysis = () => {
    const initiatives = [
        { name: 'Digital Infrastructure', impact: 9, confidence: 8, ease: 6, score: 72 },
        { name: 'Healthcare Reform', impact: 10, confidence: 6, ease: 4, score: 40 },
        { name: 'Education Tech', impact: 8, confidence: 9, ease: 7, score: 63 },
        { name: 'Green Energy', impact: 9, confidence: 7, ease: 5, score: 45 },
        { name: 'Trade Expansion', impact: 7, confidence: 8, ease: 8, score: 56 },
    ].sort((a, b) => b.score - a.score);
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Initiative</th>
                        <th className="px-4 py-3 text-center">Impact</th>
                        <th className="px-4 py-3 text-center">Confidence</th>
                        <th className="px-4 py-3 text-center">Ease</th>
                        <th className="px-4 py-3 text-center">ICE Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {initiatives.map((item, i) => (
                        <tr key={item.name} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-sm font-medium">{item.impact}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm font-medium">{item.confidence}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-sm font-medium">{item.ease}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    item.score >= 60 ? 'bg-green-100 text-green-700' : 
                                    item.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>{item.score}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ParetoAnalysis = () => {
    const data = [
        { name: 'Infrastructure', value: 35, cumulative: 35 },
        { name: 'Healthcare', value: 25, cumulative: 60 },
        { name: 'Education', value: 15, cumulative: 75 },
        { name: 'Defense', value: 10, cumulative: 85 },
        { name: 'Social', value: 8, cumulative: 93 },
        { name: 'Other', value: 7, cumulative: 100 },
    ];
    
    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const AnsoffMatrix = () => {
    const quadrants = [
        { name: 'Market Penetration', risk: 'Low', strategy: 'Existing products, existing markets', color: '#22C55E' },
        { name: 'Product Development', risk: 'Medium', strategy: 'New products, existing markets', color: '#F59E0B' },
        { name: 'Market Development', risk: 'Medium', strategy: 'Existing products, new markets', color: '#3B82F6' },
        { name: 'Diversification', risk: 'High', strategy: 'New products, new markets', color: '#EF4444' },
    ];
    
    return (
        <div className="grid grid-cols-2 gap-4">
            {quadrants.map(q => (
                <div 
                    key={q.name}
                    className="p-4 rounded-xl border-2"
                    style={{ borderColor: q.color, backgroundColor: `${q.color}10` }}
                >
                    <h4 className="font-semibold mb-1" style={{ color: q.color }}>{q.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{q.strategy}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium`} style={{ backgroundColor: `${q.color}20`, color: q.color }}>
                        Risk: {q.risk}
                    </span>
                </div>
            ))}
        </div>
    );
};

const PESTLEAnalysis = () => {
    const factors = [
        { name: 'Political', score: 72, items: ['Government stability', 'Tax policy', 'Trade regulations'] },
        { name: 'Economic', score: 65, items: ['GDP growth', 'Interest rates', 'Inflation'] },
        { name: 'Social', score: 78, items: ['Demographics', 'Education', 'Cultural trends'] },
        { name: 'Technological', score: 85, items: ['Innovation', 'R&D', 'Digital adoption'] },
        { name: 'Legal', score: 70, items: ['Employment law', 'Consumer protection', 'IP rights'] },
        { name: 'Environmental', score: 55, items: ['Climate change', 'Sustainability', 'Regulations'] },
    ];
    
    const colors = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#10B981'];
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {factors.map((f, i) => (
                <div key={f.name} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{f.name}</h4>
                        <span className="text-lg font-bold" style={{ color: colors[i] }}>{f.score}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mb-3">
                        <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: colors[i] }} />
                    </div>
                    <ul className="space-y-1">
                        {f.items.map((item, j) => (
                            <li key={j} className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors[i] }} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

const PorterAnalysis = () => {
    const forces = [
        { name: 'Competitive Rivalry', score: 75, position: 'top' },
        { name: 'Supplier Power', score: 45, position: 'left' },
        { name: 'Buyer Power', score: 60, position: 'right' },
        { name: 'Threat of Substitution', score: 55, position: 'bottom-left' },
        { name: 'Threat of New Entry', score: 40, position: 'bottom-right' },
    ];
    
    return (
        <div className="relative h-80 flex items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 rounded-xl p-3 text-center w-48">
                <div className="text-sm font-medium text-red-800">Competitive Rivalry</div>
                <div className="text-2xl font-bold text-red-600">75%</div>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center w-40">
                <div className="text-sm font-medium text-blue-800">Supplier Power</div>
                <div className="text-2xl font-bold text-blue-600">45%</div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-green-50 border border-green-200 rounded-xl p-3 text-center w-40">
                <div className="text-sm font-medium text-green-800">Buyer Power</div>
                <div className="text-2xl font-bold text-green-600">60%</div>
            </div>
            <div className="absolute bottom-0 left-1/4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center w-44">
                <div className="text-sm font-medium text-amber-800">Substitution Threat</div>
                <div className="text-2xl font-bold text-amber-600">55%</div>
            </div>
            <div className="absolute bottom-0 right-1/4 bg-purple-50 border border-purple-200 rounded-xl p-3 text-center w-44">
                <div className="text-sm font-medium text-purple-800">New Entry Threat</div>
                <div className="text-2xl font-bold text-purple-600">40%</div>
            </div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
            </div>
        </div>
    );
};

const BCGMatrix = () => {
    const products = [
        { name: 'Tech Sector', x: 80, y: 85, z: 500, type: 'star' },
        { name: 'Healthcare', x: 70, y: 40, z: 400, type: 'cash' },
        { name: 'Manufacturing', x: 30, y: 30, z: 350, type: 'dog' },
        { name: 'Green Energy', x: 40, y: 75, z: 300, type: 'question' },
        { name: 'Finance', x: 65, y: 55, z: 450, type: 'cash' },
    ];
    
    return (
        <div className="relative h-80">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-purple-50 border-r border-b border-gray-200 p-2">
                    <span className="text-xs font-medium text-purple-600">? Question Marks</span>
                </div>
                <div className="bg-yellow-50 border-b border-gray-200 p-2">
                    <span className="text-xs font-medium text-yellow-600">★ Stars</span>
                </div>
                <div className="bg-gray-50 border-r border-gray-200 p-2">
                    <span className="text-xs font-medium text-gray-600">✕ Dogs</span>
                </div>
                <div className="bg-green-50 p-2">
                    <span className="text-xs font-medium text-green-600">$ Cash Cows</span>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="x" name="Market Share" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" name="Growth Rate" domain={[0, 100]} hide />
                    <ZAxis type="number" dataKey="z" range={[100, 500]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Products" data={products} fill="#6366F1">
                        {products.map((entry, index) => (
                            <Cell key={index} fill={
                                entry.type === 'star' ? '#F59E0B' :
                                entry.type === 'cash' ? '#22C55E' :
                                entry.type === 'question' ? '#8B5CF6' : '#9CA3AF'
                            } />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function AnalysisFrameworks({ activeDomain }) {
    const [activeFramework, setActiveFramework] = useState('swot');
    
    const renderFramework = () => {
        switch (activeFramework) {
            case 'swot': return <SWOTAnalysis domain={activeDomain} />;
            case 'dmaic': return <DMAICAnalysis />;
            case 'ice': return <ICEAnalysis />;
            case 'pareto': return <ParetoAnalysis />;
            case 'ansoff': return <AnsoffMatrix />;
            case 'pestle': return <PESTLEAnalysis />;
            case 'porter': return <PorterAnalysis />;
            case 'bcg': return <BCGMatrix />;
            default: return <SWOTAnalysis domain={activeDomain} />;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map(fw => {
                    const Icon = fw.icon;
                    return (
                        <button
                            key={fw.id}
                            onClick={() => setActiveFramework(fw.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                activeFramework === fw.id
                                    ? 'bg-white shadow-md border-2'
                                    : 'bg-white/50 hover:bg-white border border-gray-200'
                            }`}
                            style={{ borderColor: activeFramework === fw.id ? fw.color : undefined }}
                        >
                            <Icon className="w-4 h-4" style={{ color: fw.color }} />
                            <span className="font-medium text-sm">{fw.name}</span>
                        </button>
                    );
                })}
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {FRAMEWORKS.find(f => f.id === activeFramework)?.name} Analysis
                        </h3>
                        <p className="text-sm text-gray-500">
                            {FRAMEWORKS.find(f => f.id === activeFramework)?.description}
                        </p>
                    </div>
                </div>
                {renderFramework()}
            </div>
        </div>
    );
}