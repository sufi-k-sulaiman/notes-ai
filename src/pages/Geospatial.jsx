import React, { useState, useMemo } from 'react';
import { 
    Globe, Building2, Scale, Shield, Users, DollarSign, Heart, GraduationCap, 
    Home, Palette, TrendingUp, Percent, Ship, Briefcase, HardHat, Wrench,
    Plane, Package, Pickaxe, ChevronRight, MapPin, BarChart3, Activity,
    Filter, Search, Maximize2, Download, RefreshCw, Layers, Eye, Map
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import InteractiveMap from '../components/geospatial/InteractiveMap';
import AnalysisFrameworks from '../components/geospatial/AnalysisFrameworks';

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

const generateMetricData = () => {
    const base = Math.random() * 100;
    return {
        current: Math.round(base),
        change: Math.round((Math.random() - 0.5) * 20),
        trend: Array.from({ length: 12 }, () => Math.round(40 + Math.random() * 60)),
        breakdown: [
            { name: 'Category A', value: Math.round(20 + Math.random() * 30) },
            { name: 'Category B', value: Math.round(15 + Math.random() * 25) },
            { name: 'Category C', value: Math.round(10 + Math.random() * 20) },
            { name: 'Category D', value: Math.round(5 + Math.random() * 15) },
        ]
    };
};

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
        <div 
            onClick={onClick}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
                isActive ? 'bg-white shadow-lg border-2' : 'bg-white/50 hover:bg-white hover:shadow-md border-gray-200'
            }`}
            style={{ borderColor: isActive ? domain.color : undefined }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${domain.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: domain.color }} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{domain.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{domain.description}</p>
            <div className="h-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric?.trend?.map((v) => ({ v })) || []}>
                        <Area type="monotone" dataKey="v" stroke={domain.color} fill={`${domain.color}30`} strokeWidth={2} />
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Regions</h3>
            <div className="space-y-2">
                {regions.map(region => (
                    <button
                        key={region.id}
                        onClick={() => onSelectRegion(region.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                            selectedRegion === region.id ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-sm">{region.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-indigo-600">{Math.round(region.avgMetric)}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CountryTable = ({ countryData, activeDomain, selectedRegion }) => {
    const regionInfo = REGIONS.find(r => r.id === selectedRegion);
    const filteredData = regionInfo ? countryData.filter(c => regionInfo.countries.includes(c.country)) : countryData;
    const domainInfo = DOMAINS.find(d => d.id === activeDomain);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Country Rankings</h3>
                <span className="text-sm text-gray-500">{filteredData.length} countries</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Rank</th>
                            <th className="px-4 py-3 text-left">Country</th>
                            <th className="px-4 py-3 text-left">Region</th>
                            <th className="px-4 py-3 text-right">Score</th>
                            <th className="px-4 py-3 text-right">Change</th>
                            <th className="px-4 py-3 text-left">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData
                            .sort((a, b) => (b.metrics?.[activeDomain]?.current || 0) - (a.metrics?.[activeDomain]?.current || 0))
                            .slice(0, 10)
                            .map((row, i) => {
                                const metric = row.metrics?.[activeDomain];
                                const change = metric?.change || 0;
                                return (
                                    <tr key={row.country} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.country}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{row.region}</td>
                                        <td className="px-4 py-3 text-right font-semibold" style={{ color: domainInfo?.color }}>{metric?.current || 0}</td>
                                        <td className={`px-4 py-3 text-right text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {change >= 0 ? '+' : ''}{change}%
                                        </td>
                                        <td className="px-4 py-3 w-24">
                                            <div className="h-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={metric?.trend?.slice(-6).map(v => ({ v })) || []}>
                                                        <Area type="monotone" dataKey="v" stroke={domainInfo?.color} fill={`${domainInfo?.color}30`} strokeWidth={1.5} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
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

export default function Geospatial() {
    const [activeDomain, setActiveDomain] = useState('governance');
    const [selectedRegion, setSelectedRegion] = useState('north-america');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCountry, setSelectedCountry] = useState(null);
    
    const countryData = useMemo(() => generateCountryData(), []);
    const selectedCountryData = countryData.find(c => c.region === REGIONS.find(r => r.id === selectedRegion)?.name);

    const filteredDomains = DOMAINS.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Geospatial Intelligence</h1>
                            <p className="text-gray-500">18 domains • 6 regions • 25 countries</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search domains..." className="pl-10 w-64" />
                        </div>
                        <Button variant="outline" size="icon"><RefreshCw className="w-4 h-4" /></Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-gray-200">
                        <TabsTrigger value="overview" className="gap-2"><Eye className="w-4 h-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="map" className="gap-2"><Map className="w-4 h-4" /> Map</TabsTrigger>
                        <TabsTrigger value="analysis" className="gap-2"><BarChart3 className="w-4 h-4" /> Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Domain</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {filteredDomains.map(domain => (
                                    <DomainCard key={domain.id} domain={domain} isActive={activeDomain === domain.id} onClick={() => setActiveDomain(domain.id)} data={selectedCountryData} />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <RegionSelector selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} countryData={countryData} activeDomain={activeDomain} />
                            <div className="lg:col-span-3">
                                <InteractiveMap countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} onSelectCountry={setSelectedCountry} />
                            </div>
                        </div>

                        <CountryTable countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} />
                    </TabsContent>

                    <TabsContent value="map" className="mt-6">
                        <InteractiveMap countryData={countryData} activeDomain={activeDomain} selectedRegion={selectedRegion} onSelectCountry={setSelectedCountry} />
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-6">
                        <AnalysisFrameworks activeDomain={activeDomain} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}