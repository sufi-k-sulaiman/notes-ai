import React, { useState, useMemo } from 'react';
import { 
    Globe, Building2, TrendingUp, Heart, GraduationCap, Shield, Ship, Briefcase, Plane,
    Layers, Database, Cpu, Search, MapPin, ArrowUp, ArrowDown, ChevronDown, ChevronUp,
    Satellite, BarChart3, Bell, FileText, Lock, Languages
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import InteractiveMap from '../components/geospatial/InteractiveMap';
import DomainCard from '../components/geospatial/DomainCard';
import CapabilityPanel from '../components/geospatial/CapabilityPanel';
import DataPipelineVisual from '../components/geospatial/DataPipelineVisual';
import DomainFeatures from '../components/geospatial/DomainFeatures';
import AnalyticsModules from '../components/geospatial/AnalyticsModules';

const DOMAINS = [
    { id: 'governance', name: 'Governance', icon: Building2, color: '#6366F1', description: 'Administrative mapping, infrastructure oversight, policy simulation' },
    { id: 'economy', name: 'Economy', icon: TrendingUp, color: '#22C55E', description: 'Activity hotspots, agriculture, resources, resilience' },
    { id: 'health', name: 'Health', icon: Heart, color: '#EC4899', description: 'Outbreak intelligence, healthcare access, environmental health' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: '#10B981', description: 'School mapping, equity dashboards, planning tools' },
    { id: 'defense', name: 'Defense', icon: Shield, color: '#EF4444', description: 'Border awareness, asset tracking, incident management' },
    { id: 'trade', name: 'Trade', icon: Ship, color: '#3B82F6', description: 'Route intelligence, port analytics, supply chain' },
    { id: 'labor', name: 'Labor', icon: Briefcase, color: '#F97316', description: 'Workforce distribution, market dynamics, urbanization' },
    { id: 'tourism', name: 'Tourism', icon: Plane, color: '#0EA5E9', description: 'Attraction mapping, visitor dynamics, sustainability' },
];

const REGIONS = [
    { id: 'all', name: 'Global' },
    { id: 'north-america', name: 'North America', countries: ['USA', 'Canada', 'Mexico'] },
    { id: 'europe', name: 'Europe', countries: ['UK', 'Germany', 'France', 'Italy', 'Spain'] },
    { id: 'asia-pacific', name: 'Asia Pacific', countries: ['China', 'Japan', 'India', 'Australia'] },
    { id: 'latin-america', name: 'Latin America', countries: ['Brazil', 'Argentina', 'Chile'] },
    { id: 'middle-east', name: 'Middle East', countries: ['UAE', 'Saudi Arabia', 'Israel'] },
    { id: 'africa', name: 'Africa', countries: ['South Africa', 'Nigeria', 'Kenya', 'Egypt'] },
];

const generateCountryData = () => {
    const countries = REGIONS.filter(r => r.id !== 'all').flatMap(r => 
        r.countries.map(c => ({ country: c, region: r.name, regionId: r.id }))
    );
    return countries.map(c => ({
        ...c,
        score: Math.round(40 + Math.random() * 55),
        change: Math.round((Math.random() - 0.5) * 20),
        trend: Array.from({ length: 8 }, () => Math.round(40 + Math.random() * 50)),
        dataSources: Math.floor(12 + Math.random() * 20),
        lastUpdate: '2h ago',
    }));
};

const PLATFORM_STATS = [
    { label: 'Countries', value: '195', icon: Globe },
    { label: 'Data Sources', value: '2.4K', icon: Database },
    { label: 'Layers', value: '850+', icon: Layers },
    { label: 'Daily Updates', value: '15M', icon: Cpu },
];

export default function Geospatial() {
    const [activeDomain, setActiveDomain] = useState('economy');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showPipeline, setShowPipeline] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const countryData = useMemo(() => generateCountryData(), []);

    const filteredCountries = useMemo(() => {
        let data = [...countryData];
        if (selectedRegion !== 'all') {
            data = data.filter(c => c.regionId === selectedRegion);
        }
        if (searchQuery) {
            data = data.filter(c => c.country.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return data.sort((a, b) => b.score - a.score);
    }, [countryData, selectedRegion, searchQuery]);

    const domainInfo = DOMAINS.find(d => d.id === activeDomain);
    const topCountries = filteredCountries.slice(0, 5);
    const avgScore = filteredCountries.length > 0 
        ? Math.round(filteredCountries.reduce((sum, c) => sum + c.score, 0) / filteredCountries.length) 
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <Globe className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Geospatial Intelligence Platform</h1>
                                <p className="text-white/80 text-sm">Multi-source data analysis delivering decision-ready insights across 8 domains</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            {PLATFORM_STATS.map(stat => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-white/70">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="bg-white border border-gray-200">
                        <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Globe className="w-4 h-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="domains" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Layers className="w-4 h-4" /> Domains
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4" /> Analytics
                        </TabsTrigger>
                        <TabsTrigger value="architecture" className="gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Database className="w-4 h-4" /> Architecture
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {activeTab === 'overview' && (
                    <>
                        {/* Capabilities Bar */}
                        <div className="mb-6">
                            <CapabilityPanel />
                        </div>

                        {/* Domain Selection & Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                                {DOMAINS.map(domain => {
                                    const Icon = domain.icon;
                                    return (
                                        <button key={domain.id} onClick={() => setActiveDomain(domain.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                                                activeDomain === domain.id
                                                    ? 'bg-white shadow-md border-2 text-gray-900'
                                                    : 'bg-white/70 text-gray-600 hover:bg-white border border-gray-200'
                                            }`}
                                            style={{ borderColor: activeDomain === domain.id ? domain.color : undefined }}>
                                            <Icon className="w-4 h-4" style={{ color: domain.color }} />
                                            <span className="font-medium text-sm">{domain.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search countries..." className="pl-9 w-44 bg-white" />
                                </div>
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger className="w-36 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {REGIONS.map(r => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Map */}
                            <div className="lg:col-span-2">
                                <InteractiveMap
                                    countryData={countryData}
                                    activeDomain={activeDomain}
                                    selectedRegion={selectedRegion}
                                    onSelectCountry={setSelectedCountry}
                                />
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                                {/* Domain Summary */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <domainInfo.icon className="w-5 h-5" style={{ color: domainInfo?.color }} />
                                        <h3 className="font-semibold text-gray-900">{domainInfo?.name} Intelligence</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">{domainInfo?.description}</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xl font-bold" style={{ color: domainInfo?.color }}>{avgScore}</p>
                                            <p className="text-[10px] text-gray-500">Avg Score</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xl font-bold text-gray-900">{filteredCountries.length}</p>
                                            <p className="text-[10px] text-gray-500">Countries</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xl font-bold text-emerald-600">Live</p>
                                            <p className="text-[10px] text-gray-500">Status</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Rankings */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Top Performers</h3>
                                    <div className="space-y-2">
                                        {topCountries.map((country, i) => (
                                            <div key={country.country} onClick={() => setSelectedCountry(country)}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedCountry?.country === country.country
                                                        ? 'bg-purple-50 border border-purple-200'
                                                        : 'hover:bg-gray-50'
                                                }`}>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                }`}>{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm">{country.country}</p>
                                                    <p className="text-xs text-gray-500">{country.dataSources} sources</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm" style={{ color: domainInfo?.color }}>{country.score}</p>
                                                    <p className={`text-xs ${country.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {country.change >= 0 ? '+' : ''}{country.change}%
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Country */}
                                {selectedCountry && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{selectedCountry.country}</h3>
                                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{selectedCountry.region}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div>
                                                <p className="text-3xl font-bold" style={{ color: domainInfo?.color }}>{selectedCountry.score}</p>
                                                <p className="text-xs text-gray-500">Domain Score</p>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                                selectedCountry.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                                {selectedCountry.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                                <span className="text-sm font-medium">{Math.abs(selectedCountry.change)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-16">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={selectedCountry.trend.map((v, i) => ({ i, v }))}>
                                                    <Area type="monotone" dataKey="v" stroke={domainInfo?.color} fill={`${domainInfo?.color}30`} strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparison Chart */}
                        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">{domainInfo?.name} Scores by Country</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filteredCountries.slice(0, 12)} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="country" width={80} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="score" fill={domainInfo?.color} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'domains' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {DOMAINS.map(domain => (
                                <DomainCard
                                    key={domain.id}
                                    domain={domain}
                                    isActive={activeDomain === domain.id}
                                    onClick={() => setActiveDomain(domain.id)}
                                    stats={[
                                        { label: 'Countries', value: '195' },
                                        { label: 'Layers', value: Math.floor(80 + Math.random() * 50) },
                                        { label: 'Sources', value: Math.floor(150 + Math.random() * 100) },
                                    ]}
                                />
                            ))}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <domainInfo.icon className="w-6 h-6" style={{ color: domainInfo?.color }} />
                                <div>
                                    <h2 className="font-bold text-gray-900 text-lg">{domainInfo?.name} Features</h2>
                                    <p className="text-sm text-gray-500">{domainInfo?.description}</p>
                                </div>
                            </div>
                            <DomainFeatures domainId={activeDomain} color={domainInfo?.color} />
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <AnalyticsModules />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">User Experience & Workflows</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-600" /> Layer composer with save/share configurations</li>
                                    <li className="flex items-center gap-2"><Search className="w-4 h-4 text-purple-600" /> No-code spatial query builder</li>
                                    <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-600" /> Case management with audit trails</li>
                                    <li className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /> Scenario sandbox for what-if analysis</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">Governance & Compliance</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-600" /> Privacy-safe aggregates, differential privacy</li>
                                    <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-red-600" /> Encryption, secure enclaves, access logs</li>
                                    <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-red-600" /> OGC-compliant, ISO geospatial metadata</li>
                                    <li className="flex items-center gap-2"><Languages className="w-4 h-4 text-red-600" /> Multilingual, local administrative hierarchies</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'architecture' && (
                    <div className="space-y-6">
                        <DataPipelineVisual expanded={true} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                                    <Satellite className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Data Sources</h3>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• Satellite imagery (optical, SAR)</li>
                                    <li>• IoT sensors & mobile aggregates</li>
                                    <li>• Government GIS & customs logs</li>
                                    <li>• Traffic feeds & environmental monitors</li>
                                    <li>• Crowdsourced reports</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                                    <Database className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Storage</h3>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• Spatially indexed data lake</li>
                                    <li>• Vector/raster hybrid storage</li>
                                    <li>• Temporal snapshots & versions</li>
                                    <li>• Access-controlled datasets</li>
                                    <li>• Edge nodes for low-latency</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                                    <Cpu className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">APIs & Integrations</h3>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• REST/GraphQL queries</li>
                                    <li>• WebSocket live streams</li>
                                    <li>• OGC standards (WMS/WFS/WMTS)</li>
                                    <li>• ERP, EMR, customs connectors</li>
                                    <li>• Plugin SDK for extensions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}