import React, { useState, useEffect } from 'react';
import { 
    Globe, Layers, Satellite, Map, Search, Compass,
    TreePine, Mountain, Cloud, Activity, TrendingUp, 
    Loader2, RefreshCw, Sparkles, Droplets, Leaf, 
    Beef, Zap, Heart, Gem, Wind, Fish, Volume2, 
    Sun, Flame, Radiation, FlaskConical, Thermometer,
    Waves, Shell, Bird, Package, Milk, Factory, Wheat, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import GeospatialMap from '@/components/geospatial/GeospatialMap';
import CountryComparison from '@/components/geospatial/CountryComparison';
import MapModal from '@/components/geospatial/MapModal';
import AnalysisFrameworks from '@/components/geospatial/AnalysisFrameworks';
import DynamicCardContent from '@/components/geospatial/DynamicCardContent';

// Group categories by tab
const MAP_TABS = [
    { id: 'environment', name: 'Environment', icon: Globe },
    { id: 'oceans', name: 'Oceans & Wildlife', icon: Waves },
    { id: 'agriculture', name: 'Agriculture', icon: Wheat },
    { id: 'energy', name: 'Energy & Health', icon: Zap },
    { id: 'pollution', name: 'Pollution', icon: AlertTriangle },
];

const USE_CASES = [
    // Environment categories
    { id: 'carbon', name: 'Carbon & Climate', icon: Cloud, color: '#EF4444', description: 'Carbon emissions, climate tracking, net zero', tab: 'environment' },
    { id: 'forests', name: 'Forests & Biodiversity', icon: TreePine, color: '#22C55E', description: 'Forest coverage, wildlife habitats', tab: 'environment' },
    { id: 'resources', name: 'Natural Resources', icon: Mountain, color: '#F97316', description: 'Mining, minerals, energy resources', tab: 'environment' },
    { id: 'sustainability', name: 'Sustainability', icon: Compass, color: '#8B5CF6', description: 'Renewable energy, green initiatives', tab: 'environment' },
    { id: 'treasures', name: 'National Treasures', icon: Sparkles, color: '#FBBF24', description: 'Protected areas, heritage sites, parks', tab: 'environment' },
    
    // Ocean & Wildlife categories
    { id: 'coastal', name: 'Coastal & Coral Ecosystem', icon: Shell, color: '#06B6D4', description: 'Coral reefs, coastal zones, marine habitats', tab: 'oceans' },
    { id: 'ocean', name: 'Ocean Sustainability', icon: Waves, color: '#0EA5E9', description: 'Ocean health, fisheries, marine conservation', tab: 'oceans' },
    { id: 'wildlife', name: 'Endangered Wildlife', icon: Bird, color: '#10B981', description: 'Species protection, habitat loss, conservation', tab: 'oceans' },
    
    // Agriculture & Food categories
    { id: 'biomass', name: 'Biomass', icon: Leaf, color: '#84CC16', description: 'Biofuel production, organic matter, composting', tab: 'agriculture' },
    { id: 'produce', name: 'Produce & Crops', icon: Leaf, color: '#65A30D', description: 'Agricultural yields, crop health, farming', tab: 'agriculture' },
    { id: 'dairy', name: 'Milk & Dairy', icon: Milk, color: '#60A5FA', description: 'Dairy production, processing, distribution', tab: 'agriculture' },
    { id: 'livestock', name: 'Livestock & Protein', icon: Beef, color: '#B45309', description: 'Cattle, poultry, meat production', tab: 'agriculture' },
    
    // Energy & Health categories
    { id: 'power', name: 'Power Consumption', icon: Zap, color: '#EAB308', description: 'Energy usage, grid demand, efficiency', tab: 'energy' },
    { id: 'wellness', name: 'Wellness & Health', icon: Heart, color: '#EC4899', description: 'Public health, disease, life expectancy', tab: 'energy' },
    { id: 'elements', name: 'Earth Elements', icon: Gem, color: '#7C3AED', description: 'Rare earth, minerals, geological resources', tab: 'energy' },
    
    // Pollution categories
    { id: 'airpollution', name: 'Air Pollution', icon: Wind, color: '#64748B', description: 'PM2.5, smog, ozone, emissions', tab: 'pollution' },
    { id: 'waterpollution', name: 'Water Pollution', icon: Droplets, color: '#0891B2', description: 'Contamination, runoff, marine debris', tab: 'pollution' },
    { id: 'soilpollution', name: 'Soil Pollution', icon: Mountain, color: '#78716C', description: 'Contaminated land, heavy metals, degradation', tab: 'pollution' },
    { id: 'plasticpollution', name: 'Plastic Pollution', icon: Package, color: '#F472B6', description: 'Ocean plastic, microplastics, waste', tab: 'pollution' },
    { id: 'noisepollution', name: 'Noise Pollution', icon: Volume2, color: '#A855F7', description: 'Urban noise, industrial sound, traffic', tab: 'pollution' },
    { id: 'lightpollution', name: 'Light Pollution', icon: Sun, color: '#FACC15', description: 'Sky glow, urban lighting, night visibility', tab: 'pollution' },
    { id: 'thermalpollution', name: 'Thermal Pollution', icon: Thermometer, color: '#F97316', description: 'Industrial heat, cooling water, temperature', tab: 'pollution' },
    { id: 'radioactive', name: 'Radioactive Pollution', icon: Radiation, color: '#22D3EE', description: 'Nuclear waste, radiation zones, contamination', tab: 'pollution' },
    { id: 'chemical', name: 'Chemical Pollution', icon: FlaskConical, color: '#A3E635', description: 'Industrial chemicals, pesticides, toxins', tab: 'pollution' },
    { id: 'climatepollution', name: 'Climate-Linked Pollution', icon: Flame, color: '#DC2626', description: 'GHG emissions, climate impact, warming', tab: 'pollution' },
];



export default function Geospatial() {
    useEffect(() => {
        document.title = 'Geospatial Intelligence Platform';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Geospatial intelligence platform with AI-powered spatial analytics, mapping, and visualization.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Geospatial, GIS, mapping, spatial analysis, satellite imagery');
    }, []);

    const [activeUseCases, setActiveUseCases] = useState(['carbon']);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('explore');
    const [activeMapTab, setActiveMapTab] = useState('environment');
    const [loading, setLoading] = useState(false);
    const [modalMap, setModalMap] = useState(null);

    const selectedUseCases = USE_CASES.filter(u => activeUseCases.includes(u.id));
    const currentUseCase = selectedUseCases[0] || USE_CASES[0];

    const toggleUseCase = (id) => {
        setActiveUseCases(prev => 
            prev.includes(id) 
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const filteredUseCases = USE_CASES.filter(uc => 
        uc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            {/* Top Row - Stats Left, Use Case Selector Right */}
            <div className="mx-4 md:mx-8 mt-4 flex flex-col lg:flex-row gap-4">
                {/* Stats Panel - Left */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-lg lg:w-1/2 flex flex-col justify-between min-h-[320px]">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Geospatial Intelligence</h1>
                        <p className="text-purple-200 text-sm">AI-Powered Spatial Analytics</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">{activeUseCases.length}</p>
                            <p className="text-xs text-purple-200">Active Layers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">4</p>
                            <p className="text-xs text-purple-200">Map Views</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">Global</p>
                            <p className="text-xs text-purple-200">Coverage</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">2.4M</p>
                            <p className="text-xs text-purple-200">Data Points</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">98.7%</p>
                            <p className="text-xs text-purple-200">Accuracy</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-bold text-white">Live</p>
                            <p className="text-xs text-purple-200">Updates</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-purple-200 mb-1">
                            <span>Data Quality</span>
                            <span>Excellent</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all bg-white/80" style={{ width: '87%' }} />
                        </div>
                    </div>

                    {/* Selected & Generate Button */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                        <span className="text-xs text-white/70">
                            {activeUseCases.length} selected: {selectedUseCases.map(s => s.name).join(', ').substring(0, 30)}{selectedUseCases.map(s => s.name).join(', ').length > 30 ? '...' : ''}
                        </span>
                        <Button 
                            onClick={() => setLoading(true)}
                            disabled={loading || activeUseCases.length === 0}
                            className="bg-white text-purple-700 hover:bg-white/90 text-sm"
                            size="sm"
                        >
                            <RefreshCw className={`w-3 h-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            Analyze Data
                        </Button>
                    </div>
                </div>

                {/* Use Case Selector - Right */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:w-1/2 flex flex-col">
                    {/* Search Bar */}
                    <div className="mb-2">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-gray-700 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Use Cases list */}
                    <div className="flex-1 overflow-y-auto max-h-[250px]">
                        <div className="space-y-1">
                            {filteredUseCases.map(useCase => {
                                const isSelected = activeUseCases.includes(useCase.id);
                                const Icon = useCase.icon;
                                return (
                                    <button
                                        key={useCase.id}
                                        onClick={() => toggleUseCase(useCase.id)}
                                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                                            isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${useCase.color}20` }}
                                        >
                                            <Icon className="w-4 h-4" style={{ color: useCase.color }} />
                                        </div>
                                        <span className="flex-1 text-left text-sm font-medium text-gray-700">
                                            {useCase.name}
                                        </span>
                                        {isSelected && (
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: useCase.color }}>✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {filteredUseCases.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No categories found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {/* Selected categories summary */}
                {activeUseCases.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="text-sm text-gray-500">Viewing:</span>
                        {selectedUseCases.map(uc => (
                            <span key={uc.id} className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: uc.color }}>
                                {uc.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* World Map - Full Width */}
                <div className="mb-6 relative">
                    {/* Map View Tabs - positioned on map */}
                    <div className="absolute top-4 left-4 z-[1000]">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                                <TabsTrigger value="explore" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Map className="w-3 h-3" /> Explore
                                </TabsTrigger>
                                <TabsTrigger value="satellite" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Satellite className="w-3 h-3" /> Satellite
                                </TabsTrigger>
                                <TabsTrigger value="heatmap" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Activity className="w-3 h-3" /> Heatmap
                                </TabsTrigger>
                                <TabsTrigger value="terrain" className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    <Mountain className="w-3 h-3" /> Terrain
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <GeospatialMap 
                        useCase={currentUseCase?.id || 'carbon'}
                        mapType={activeTab}
                        searchQuery={searchQuery}
                        color={currentUseCase?.color}
                        height="75vh"
                        isWorldMap={true}
                    />
                </div>

                {/* Analysis Frameworks */}
                <AnalysisFrameworks selectedCategories={activeUseCases} />

                {/* Country Comparison */}
                <CountryComparison selectedCategories={activeUseCases} />

                {/* Secondary Maps Grid - Grouped by Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <Tabs value={activeMapTab} onValueChange={setActiveMapTab}>
                        <div className="border-b border-gray-200 px-4 pt-4">
                            <TabsList className="bg-gray-100 p-1">
                                {MAP_TABS.map(tab => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <TabsTrigger 
                                            key={tab.id} 
                                            value={tab.id}
                                            className="gap-1.5 text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                                        >
                                            <TabIcon className="w-3 h-3" />
                                            {tab.name}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>

                        {MAP_TABS.map(tab => (
                            <TabsContent key={tab.id} value={tab.id} className="p-4 mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {USE_CASES.filter(uc => uc.tab === tab.id).map((useCase, index) => {
                                        const Icon = useCase.icon;
                                        const mapTypes = ['heatmap', 'satellite', 'terrain', 'default'];
                                        const mapType = mapTypes[index % mapTypes.length];
                                        return (
                                            <div 
                                                key={useCase.id}
                                                className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                                                style={{ '--hover-color': useCase.color }}
                                                onClick={() => setModalMap({ title: useCase.name, icon: Icon, color: useCase.color, useCase: useCase.id, mapType })}
                                            >
                                                <div className="p-4 border-b border-gray-100">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${useCase.color}20` }}>
                                                                <Icon className="w-4 h-4" style={{ color: useCase.color }} />
                                                            </div>
                                                            <span className="font-semibold text-base text-gray-900 truncate">{useCase.name}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-500 capitalize flex-shrink-0 ml-2">{mapType === 'default' ? 'Map' : mapType}</span>
                                                    </div>
                                                    <DynamicCardContent useCase={useCase.id} useCaseName={useCase.name} />
                                                </div>
                                                <GeospatialMap 
                                                    useCase={useCase.id}
                                                    mapType={mapType}
                                                    height="220px"
                                                    mini={true}
                                                    color={useCase.color}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>

            {/* Map Modal */}
            {modalMap && (
                <MapModal
                    isOpen={!!modalMap}
                    onClose={() => setModalMap(null)}
                    title={modalMap.title}
                    icon={modalMap.icon}
                    iconColor={modalMap.color}
                    useCase={modalMap.useCase}
                    mapType={modalMap.mapType}
                />
            )}
        </div>
    );
}