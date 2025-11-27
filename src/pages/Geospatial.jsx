import React, { useState, useMemo } from 'react';
import { 
    Globe, Building2, Scale, Shield, Users, DollarSign, Heart, GraduationCap, 
    Home, Palette, TrendingUp, Percent, Ship, Briefcase, HardHat, Wrench,
    Plane, Package, Pickaxe, MapPin, BarChart3, Search, RefreshCw, Eye, Map,
    Brain, Sparkles, Target, Activity, Layers, Database, AlertTriangle, Zap,
    ChevronDown, Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import InteractiveMap from '../components/geospatial/InteractiveMap';
import DynamicFrameworks from '../components/geospatial/DynamicFrameworks';
import SpatialQuery from '../components/geospatial/SpatialQuery';
import AIScenarios from '../components/geospatial/AIScenarios';
import PredictiveAnalytics from '../components/geospatial/PredictiveAnalytics';

const DOMAINS = [
    { id: 'governance', name: 'Governance', icon: Building2, color: '#6366F1', description: 'Government structure & policy' },
    { id: 'justice', name: 'Justice', icon: Scale, color: '#8B5CF6', description: 'Legal system & courts' },
    { id: 'defense', name: 'Defense', icon: Shield, color: '#EF4444', description: 'National security & military' },
    { id: 'citizenship', name: 'Citizenship', icon: Users, color: '#06B6D4', description: 'Immigration & naturalization' },
    { id: 'deficit', name: 'Deficit', icon: DollarSign, color: '#F59E0B', description: 'Budget & national debt' },
    { id: 'health', name: 'Health', icon: Heart, color: '#EC4899', description: 'Healthcare systems' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: '#10B981', description: 'Schools & universities' },
    { id: 'community', name: 'Community', icon: Home, color: '#14B8A6', description: 'Local development' },
    { id: 'culture', name: 'Culture', icon: Palette, color: '#F472B6', description: 'Arts & heritage' },
    { id: 'economy', name: 'Economy', icon: TrendingUp, color: '#22C55E', description: 'GDP & economic growth' },
    { id: 'inflation', name: 'Inflation', icon: Percent, color: '#EAB308', description: 'Price indices & CPI' },
    { id: 'trade', name: 'Trade', icon: Ship, color: '#3B82F6', description: 'Imports & exports' },
    { id: 'labor', name: 'Labor', icon: Briefcase, color: '#6366F1', description: 'Employment statistics' },
    { id: 'workforce', name: 'Workforce', icon: HardHat, color: '#F97316', description: 'Labor market dynamics' },
    { id: 'vocational', name: 'Vocational', icon: Wrench, color: '#84CC16', description: 'Skills training' },
    { id: 'tourism', name: 'Tourism', icon: Plane, color: '#0EA5E9', description: 'Travel & hospitality' },
    { id: 'products', name: 'Products', icon: Package, color: '#A855F7', description: 'Manufacturing output' },
    { id: 'resources', name: 'Resources', icon: Pickaxe, color: '#78716C', description: 'Natural resources' },
];

const REGIONS = [
    { id: 'north-america', name: 'North America', countries: ['USA', 'Canada', 'Mexico'] },
    { id: 'europe', name: 'Europe', countries: ['UK', 'Germany', 'France', 'Italy', 'Spain'] },
    { id: 'asia-pacific', name: 'Asia Pacific', countries: ['China', 'Japan', 'India', 'Australia', 'Korea'] },
    { id: 'latin-america', name: 'Latin America', countries: ['Brazil', 'Argentina', 'Chile', 'Colombia'] },
    { id: 'middle-east', name: 'Middle East', countries: ['UAE', 'Saudi Arabia', 'Israel', 'Qatar'] },
    { id: 'africa', name: 'Africa', countries: ['South Africa', 'Nigeria', 'Kenya', 'Egypt'] },
];

const SCENARIO_FRAMEWORKS = [
    'Counterfactual Analysis',
    'Thought Experiment',
    'Possible World Model',
    'Speculative Vignette',
    'Conjectural Paradigm',
    'Notional Case Study',
    'Prospective Tableau',
    'Envisaged Contingency',
    'Uchronia',
    'Phantasmatic Projection'
];

const ANOMALY_DETECTION = [
    'Heteroclite Patterns',
    'Aberration Detection',
    'Parergon Analysis',
    'Ectopia Mapping',
    'Apophasis Framework'
];

const generateMetricData = () => ({
    current: Math.round(Math.random() * 100),
    change: Math.round((Math.random() - 0.5) * 20),
    trend: Array.from({ length: 12 }, () => Math.round(40 + Math.random() * 60)),
});

const generateCountryData = () => REGIONS.flatMap(r => r.countries.map(country => ({
    country,
    region: r.name,
    metrics: DOMAINS.reduce((acc, d) => ({ ...acc, [d.id]: generateMetricData() }), {})
})));

const DomainCard = ({ domain, isActive, onClick, data }) => {
    const Icon = domain.icon;
    const metric = data?.metrics?.[domain.id];
    const change = metric?.change || 0;
    
    return (
        <div onClick={onClick}
            className={`p-3 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-white shadow-lg border-2' : 'bg-white/50 hover:bg-white hover:shadow-md border-gray-200'}`}
            style={{ borderColor: isActive ? domain.color : undefined }}>
            <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${domain.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: domain.color }} />
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{domain.name}</h3>
            <div className="h-8 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric?.trend?.map(v => ({ v })) || []}>
                        <Area type="monotone" dataKey="v" stroke={domain.color} fill={`${domain.color}30`} strokeWidth={1.5} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const RegionSelector = ({ selectedRegion, onSelectRegion, countryData, activeDomain }) => {
    const regions = REGIONS.map(r => {
        const avgMetric = r.countries.reduce((sum, c) => {
            const country = countryData.find(cd => cd.country === c);
            return sum + (country?.metrics?.[activeDomain]?.current || 50);
        }, 0) / r.countries.length;
        return { ...r, avgMetric };
    });

    return (
        <div className="space-y-1">
            {regions.map(region => (
                <button key={region.id} onClick={() => onSelectRegion(region.id)}
                    className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between ${
                        selectedRegion === region.id ? 'bg-purple-50 border border-purple-500' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span className="font-medium text-xs text-gray-700">{region.name}</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{Math.round(region.avgMetric)}</span>
                </button>
            ))}
        </div>
    );
};

const CountryTable = ({ countryData, activeDomain, selectedRegion }) => {
    const regionInfo = REGIONS.find(r => r.id === selectedRegion);
    const filteredData = regionInfo ? countryData.filter(c => regionInfo.countries.includes(c.country)) : countryData;
    const domainInfo = DOMAINS.find(d => d.id === activeDomain);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Rankings</h3>
                <span className="text-xs text-gray-500">{filteredData.length} countries</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                        <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Country</th>
                            <th className="px-3 py-2 text-right">Score</th>
                            <th className="px-3 py-2 text-right">Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredData
                            .sort((a, b) => (b.metrics?.[activeDomain]?.current || 0) - (a.metrics?.[activeDomain]?.current || 0))
                            .slice(0, 8)
                            .map((row, i) => {
                                const metric = row.metrics?.[activeDomain];
                                const change = metric?.change || 0;
                                return (
                                    <tr key={row.country} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                                        </td>
                                        <td className="px-3 py-2 font-medium text-gray-900">{row.country}</td>
                                        <td className="px-3 py-2 text-right font-semibold" style={{ color: domainInfo?.color }}>{metric?.current || 0}</td>
                                        <td className={`px-3 py-2 text-right text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {change >= 0 ? '+' : ''}{change}%
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FrameworkSelector = ({ label, value, onChange, options }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <label className="text-purple-600 font-semibold text-sm mb-3 block">{label}</label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

const MetricDisplay = ({ label, value, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-purple-600 text-sm font-medium">{label}</div>
        {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
    </div>
);

export default function Geospatial() {
    const [activeDomain, setActiveDomain] = useState('governance');
    const [selectedRegion, setSelectedRegion] = useState('north-america');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [scenarioFramework, setScenarioFramework] = useState('Envisaged Contingency');
    const [anomalyDetection, setAnomalyDetection] = useState('Heteroclite Patterns');
    
    const countryData = useMemo(() => generateCountryData(), []);
    const selectedCountryData = countryData.find(c => c.region === REGIONS.find(r => r.id === selectedRegion)?.name);
    const domainInfo = DOMAINS.find(d => d.id === activeDomain);

    const filteredDomains = DOMAINS.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Geospatial Intelligence</h1>
                            <p className="text-xs text-gray-500">18 domains • 6 regions • 25 countries</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 w-48 h-9 text-sm bg-white border-gray-200" />
                        </div>
                        <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-white border border-gray-200">
                        <TabsTrigger value="dashboard" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Eye className="w-3.5 h-3.5" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="map" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Map className="w-3.5 h-3.5" /> Geospatial Map
                        </TabsTrigger>
                        <TabsTrigger value="frameworks" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Target className="w-3.5 h-3.5" /> Frameworks
                        </TabsTrigger>
                        <TabsTrigger value="scenarios" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Sparkles className="w-3.5 h-3.5" /> AI Scenarios
                        </TabsTrigger>
                        <TabsTrigger value="predictive" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Brain className="w-3.5 h-3.5" /> Predictive
                        </TabsTrigger>
                        <TabsTrigger value="spatial" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Layers className="w-3.5 h-3.5" /> Spatial Query
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-4">
                        {/* Domain Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
                            {filteredDomains.map(domain => (
                                <DomainCard key={domain.id} domain={domain} isActive={activeDomain === domain.id} onClick={() => setActiveDomain(domain.id)} data={selectedCountryData} />
                            ))}
                        </div>

                        {/* Framework Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FrameworkSelector label="Scenario Framework" value={scenarioFramework} onChange={setScenarioFramework} options={SCENARIO_FRAMEWORKS} />
                            <FrameworkSelector label="Anomaly Detection" value={anomalyDetection} onChange={setAnomalyDetection} options={ANOMALY_DETECTION} />
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricDisplay label="Detection Rate" value="24%" subtitle="Anomaly threshold" />
                            <MetricDisplay label="Confidence" value="82%" subtitle="Model accuracy" />
                            <MetricDisplay label="Coverage" value="96%" subtitle="Data completeness" />
                            <MetricDisplay label="Alerts" value="12" subtitle="Active warnings" />
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="space-y-4">
                                <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
                                    <h3 className="font-semibold text-cyan-300 text-sm mb-3">Regions</h3>
                                    <RegionSelector selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} countryData={countryData} activeDomain={activeDomain} />
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <InteractiveMap countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} onSelectCountry={setSelectedCountry} />
                            </div>
                            <div>
                                <CountryTable countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} />
                            </div>
                        </div>

                        {/* Strategic Analysis */}
                        <DynamicFrameworks activeDomain={activeDomain} countryData={countryData} selectedRegion={selectedRegion} domainInfo={domainInfo} />
                    </TabsContent>

                    {/* Map Tab */}
                    <TabsContent value="map" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FrameworkSelector label="Scenario Framework" value={scenarioFramework} onChange={setScenarioFramework} options={SCENARIO_FRAMEWORKS} />
                            <FrameworkSelector label="Anomaly Detection" value={anomalyDetection} onChange={setAnomalyDetection} options={ANOMALY_DETECTION} />
                        </div>
                        <InteractiveMap countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} onSelectCountry={setSelectedCountry} />
                    </TabsContent>

                    {/* Frameworks Tab */}
                    <TabsContent value="frameworks" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FrameworkSelector label="Scenario Framework" value={scenarioFramework} onChange={setScenarioFramework} options={SCENARIO_FRAMEWORKS} />
                            <FrameworkSelector label="Anomaly Detection" value={anomalyDetection} onChange={setAnomalyDetection} options={ANOMALY_DETECTION} />
                        </div>
                        <DynamicFrameworks activeDomain={activeDomain} countryData={countryData} selectedRegion={selectedRegion} domainInfo={domainInfo} />
                    </TabsContent>

                    {/* AI Scenarios Tab */}
                    <TabsContent value="scenarios" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FrameworkSelector label="Scenario Framework" value={scenarioFramework} onChange={setScenarioFramework} options={SCENARIO_FRAMEWORKS} />
                            <FrameworkSelector label="Anomaly Detection" value={anomalyDetection} onChange={setAnomalyDetection} options={ANOMALY_DETECTION} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <AIScenarios activeDomain={activeDomain} domainInfo={domainInfo} />
                            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                                <h3 className="text-cyan-400 font-semibold mb-4">Active Scenario: {scenarioFramework}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricDisplay label="Probability" value="67%" />
                                    <MetricDisplay label="Impact" value="High" />
                                    <MetricDisplay label="Timeline" value="Q2 2025" />
                                    <MetricDisplay label="Confidence" value="78%" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Predictive Tab */}
                    <TabsContent value="predictive" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FrameworkSelector label="Scenario Framework" value={scenarioFramework} onChange={setScenarioFramework} options={SCENARIO_FRAMEWORKS} />
                            <FrameworkSelector label="Anomaly Detection" value={anomalyDetection} onChange={setAnomalyDetection} options={ANOMALY_DETECTION} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <PredictiveAnalytics activeDomain={activeDomain} domainInfo={domainInfo} countryData={countryData} selectedRegion={selectedRegion} />
                            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
                                <h3 className="text-cyan-400 font-semibold mb-4">Anomaly: {anomalyDetection}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricDisplay label="Detection Rate" value="24%" />
                                    <MetricDisplay label="Accuracy" value="82%" />
                                    <MetricDisplay label="False Positives" value="3%" />
                                    <MetricDisplay label="Patterns Found" value="47" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Spatial Query Tab */}
                    <TabsContent value="spatial" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <SpatialQuery activeDomain={activeDomain} />
                            <div className="lg:col-span-2">
                                <InteractiveMap countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} onSelectCountry={setSelectedCountry} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}