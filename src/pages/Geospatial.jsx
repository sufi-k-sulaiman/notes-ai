import React, { useState, useEffect } from 'react';
import { 
    Globe, Map, Layers, Train, Zap, Droplets, Wifi, Building2, Shield,
    Factory, Landmark, GraduationCap, Heart, Scale, Briefcase, Users,
    TreePine, Leaf, Sun, Wind, Database, TrendingUp, BarChart3, PieChart,
    Network, Fuel, Anchor, Plane, Radio, Server, Lock, Coins, Award,
    BookOpen, Stethoscope, ShieldCheck, Vote, Banknote, Ship, Loader2,
    RefreshCw, Filter, Download, ChevronRight, MapPin, Activity, Cpu, Lightbulb
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RechartsPie, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';

import CategorySection from '@/components/geospatial/CategorySection';
import AssetCard from '@/components/geospatial/AssetCard';
import ResourcesChart from '@/components/geospatial/ResourcesChart';
import InfrastructureStats from '@/components/geospatial/InfrastructureStats';
import DataTable from '@/components/geospatial/DataTable';
import MultiSelectDropdown from '@/components/intelligence/MultiSelectDropdown';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16'];

const CATEGORIES = [
    { id: 'infrastructure', name: 'Core Infrastructure', icon: Building2, color: '#3B82F6' },
    { id: 'resources', name: 'Natural & Strategic Resources', icon: Fuel, color: '#10B981' },
    { id: 'assets', name: 'National Assets', icon: Landmark, color: '#F59E0B' },
    { id: 'governance', name: 'Governance & Institutions', icon: Scale, color: '#8B5CF6' },
    { id: 'economic', name: 'Economic Systems', icon: Briefcase, color: '#EF4444' },
    { id: 'social', name: 'Social & Human Development', icon: Users, color: '#EC4899' },
    { id: 'global', name: 'Global & Strategic Positioning', icon: Globe, color: '#06B6D4' },
    { id: 'environment', name: 'Environmental & Sustainability', icon: Leaf, color: '#84CC16' }
];

export default function Geospatial() {
    useEffect(() => {
        document.title = 'Geospatial Infrastructure & Resources Analytics';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Comprehensive geospatial analysis of infrastructure, resources, and national assets.');
    }, []);

    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [dynamicData, setDynamicData] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);

    const COUNTRIES = ['USA', 'China', 'India', 'Germany', 'UK', 'France', 'Japan', 'Brazil', 'Canada', 'Australia', 'South Korea', 'Spain', 'Italy', 'Mexico', 'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland', 'Poland', 'Russia', 'South Africa', 'Nigeria', 'Egypt', 'UAE'];

    const [loadingSection, setLoadingSection] = useState(null);

    // Load dynamic data when countries change - start with fallback immediately
    useEffect(() => {
        if (selectedCountries.length > 0) {
            // Immediately show fallback data
            const fallback = generateFallbackData();
            setDynamicData(fallback);
            setAnalysisData({ summary: fallback.summary, keyInsights: fallback.keyInsights });
            // Then load real data in chunks
            loadDataInChunks();
        } else {
            setDynamicData(null);
            setAnalysisData(null);
        }
    }, [selectedCountries]);

    const loadSectionData = async (sectionName, prompt, schema) => {
        const countriesStr = selectedCountries.join(', ');
        try {
            setLoadingSection(sectionName);
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `For ${countriesStr}: ${prompt}`,
                add_context_from_internet: true,
                response_json_schema: schema
            });
            if (response) {
                setDynamicData(prev => ({ ...prev, ...response }));
            }
        } catch (error) {
            console.error(`Failed to load ${sectionName}:`, error);
        } finally {
            setLoadingSection(null);
        }
    };

    const loadDataInChunks = async () => {
        setDataLoading(true);
        const countriesStr = selectedCountries.join(', ');

        // Chunk 1: Core Infrastructure
        loadSectionData('infrastructure', 
            `Generate transportation, energy, telecom, water infrastructure data. Return: transportData (5 items: type, count, capacity, condition, investment), transportStats (4 items: title, value, unit), energyData (6 items: source, capacity, share, growth, plants), energyStats (4), telecomData (4 items: type, count, coverage, investment, growth), telecomStats (4), waterData (4 items: type, count, capacity, condition, age), waterStats (4).`,
            { type: "object", properties: { transportData: { type: "array", items: { type: "object" } }, transportStats: { type: "array", items: { type: "object" } }, energyData: { type: "array", items: { type: "object" } }, energyStats: { type: "array", items: { type: "object" } }, telecomData: { type: "array", items: { type: "object" } }, telecomStats: { type: "array", items: { type: "object" } }, waterData: { type: "array", items: { type: "object" } }, waterStats: { type: "array", items: { type: "object" } } } }
        );

        // Chunk 2: Resources
        setTimeout(() => loadSectionData('resources',
            `Generate natural resources data. Return: resourcesData (5 items: resource, reserves, production, value, rank), resourceStats (4), mineralsData (5 items: mineral, reserves, production, globalRank, value), mineralStats (4), agriculturalData (4 items: resource, amount, utilization, output, globalRank), agriculturalStats (4).`,
            { type: "object", properties: { resourcesData: { type: "array", items: { type: "object" } }, resourceStats: { type: "array", items: { type: "object" } }, mineralsData: { type: "array", items: { type: "object" } }, mineralStats: { type: "array", items: { type: "object" } }, agriculturalData: { type: "array", items: { type: "object" } }, agriculturalStats: { type: "array", items: { type: "object" } } } }
        ), 2000);

        // Chunk 3: National Assets
        setTimeout(() => loadSectionData('assets',
            `Generate national assets data. Return: financialData (4 items: asset, value, change, type), financialStats (4), industrialData (4 items: sector, count, employment, output, growth), industrialStats (4), intellectualData (4 items: category, count, annual, value, globalShare), intellectualStats (4), strategicReservesData (4 items: reserve, capacity, current, value, days), strategicStats (4), digitalAssetsData (4 items: asset, count, capacity, investment, growth), digitalStats (4).`,
            { type: "object", properties: { financialData: { type: "array", items: { type: "object" } }, financialStats: { type: "array", items: { type: "object" } }, industrialData: { type: "array", items: { type: "object" } }, industrialStats: { type: "array", items: { type: "object" } }, intellectualData: { type: "array", items: { type: "object" } }, intellectualStats: { type: "array", items: { type: "object" } }, strategicReservesData: { type: "array", items: { type: "object" } }, strategicStats: { type: "array", items: { type: "object" } }, digitalAssetsData: { type: "array", items: { type: "object" } }, digitalStats: { type: "array", items: { type: "object" } } } }
        ), 4000);

        // Chunk 4: Governance & Economic
        setTimeout(() => loadSectionData('governance',
            `Generate governance and economic data. Return: governanceData (4 items: institution, count, personnel, budget, efficiency), governanceStats (4), lawEnforcementData (4 items: agency, personnel, budget, jurisdiction, clearRate), lawEnforcementStats (4), financialInfraData (4 items: type, count, assets, coverage, rating), financialInfraStats (4), tradeNetworksData (4 items: network, count, volume, value, globalRank), tradeStats (4), laborMarketData (4 items: metric, value, change, rate), laborStats (4).`,
            { type: "object", properties: { governanceData: { type: "array", items: { type: "object" } }, governanceStats: { type: "array", items: { type: "object" } }, lawEnforcementData: { type: "array", items: { type: "object" } }, lawEnforcementStats: { type: "array", items: { type: "object" } }, financialInfraData: { type: "array", items: { type: "object" } }, financialInfraStats: { type: "array", items: { type: "object" } }, tradeNetworksData: { type: "array", items: { type: "object" } }, tradeStats: { type: "array", items: { type: "object" } }, laborMarketData: { type: "array", items: { type: "object" } }, laborStats: { type: "array", items: { type: "object" } } } }
        ), 6000);

        // Chunk 5: Social
        setTimeout(() => loadSectionData('social',
            `Generate social data. Return: educationData (4 items: level, institutions, enrollment, teachers, spending), educationStats (4), healthcareData (4 items: facility, count, capacity, staff, spending), healthcareStats (4), socialSafetyData (4 items: program, beneficiaries, annual, coverage, fundStatus), socialSafetyStats (4), humanCapitalData (4 items: metric, value, growth, globalRank), humanCapitalStats (4).`,
            { type: "object", properties: { educationData: { type: "array", items: { type: "object" } }, educationStats: { type: "array", items: { type: "object" } }, healthcareData: { type: "array", items: { type: "object" } }, healthcareStats: { type: "array", items: { type: "object" } }, socialSafetyData: { type: "array", items: { type: "object" } }, socialSafetyStats: { type: "array", items: { type: "object" } }, humanCapitalData: { type: "array", items: { type: "object" } }, humanCapitalStats: { type: "array", items: { type: "object" } } } }
        ), 8000);

        // Chunk 6: Global & Environment
        setTimeout(() => loadSectionData('global',
            `Generate global positioning and environment data. Return: diplomaticData (4 items: type, count, personnel, regions, budget), diplomaticStats (4), geopoliticalData (4 items: asset, size, value, rank, control), geopoliticalStats (4), softPowerData (4 items: category, value, reach, rank, growth), softPowerStats (4), climateResilienceData (4 items: system, count, capacity, investment, condition), climateStats (4), protectedAreasData (4 items: type, count, area, visitors, budget), protectedStats (4), renewablePotentialData (4 items: source, potential, installed, utilization, growth), renewableStats (4).`,
            { type: "object", properties: { diplomaticData: { type: "array", items: { type: "object" } }, diplomaticStats: { type: "array", items: { type: "object" } }, geopoliticalData: { type: "array", items: { type: "object" } }, geopoliticalStats: { type: "array", items: { type: "object" } }, softPowerData: { type: "array", items: { type: "object" } }, softPowerStats: { type: "array", items: { type: "object" } }, climateResilienceData: { type: "array", items: { type: "object" } }, climateStats: { type: "array", items: { type: "object" } }, protectedAreasData: { type: "array", items: { type: "object" } }, protectedStats: { type: "array", items: { type: "object" } }, renewablePotentialData: { type: "array", items: { type: "object" } }, renewableStats: { type: "array", items: { type: "object" } } } }
        ), 10000);

        // Chunk 7: Defense & Public Facilities
        setTimeout(() => loadSectionData('defense',
            `Generate defense and public facilities data. Return: defenseData (4 items: type, count, personnel, status, budget), defenseStats (4), publicFacilitiesData (4 items: type, count, capacity, condition, funding), publicFacilitiesStats (4).`,
            { type: "object", properties: { defenseData: { type: "array", items: { type: "object" } }, defenseStats: { type: "array", items: { type: "object" } }, publicFacilitiesData: { type: "array", items: { type: "object" } }, publicFacilitiesStats: { type: "array", items: { type: "object" } } } }
        ), 12000);

        // Final: Summary and trends
        setTimeout(async () => {
            try {
                const response = await base44.integrations.Core.InvokeLLM({
                    prompt: `For ${countriesStr}: Generate summary analysis and comparison. Return: summary (string with key findings), keyInsights (4 strings), trendData (12 monthly objects with period, infrastructure 50-95, energy 50-95, digital 50-95), countryComparison (one object per country with country name, infrastructure 50-95, resources 50-95, digital 50-95).`,
                    add_context_from_internet: true,
                    response_json_schema: { type: "object", properties: { summary: { type: "string" }, keyInsights: { type: "array", items: { type: "string" } }, trendData: { type: "array", items: { type: "object" } }, countryComparison: { type: "array", items: { type: "object" } } } }
                });
                if (response) {
                    setDynamicData(prev => ({ ...prev, ...response }));
                    setAnalysisData({ summary: response.summary, keyInsights: response.keyInsights });
                }
            } catch (error) {
                console.error('Failed to load summary:', error);
            } finally {
                setDataLoading(false);
            }
        }, 14000);
    };

    const generateFallbackData = () => {
        const countries = selectedCountries.join(', ');
        return {
            summary: `Comprehensive infrastructure analysis for ${countries} showing key development metrics and investment opportunities.`,
            keyInsights: [
                `Transportation networks in ${countries} show strong development`,
                'Energy infrastructure modernization ongoing with renewable focus',
                'Digital connectivity expanding rapidly across regions',
                'Strategic resources provide competitive advantages'
            ],
            transportData: [
                { type: 'Highways', count: '150,000+ km', capacity: 'High', condition: 'Good', investment: '$120B' },
                { type: 'Railways', count: '80,000 km', capacity: 'High', condition: 'Good', investment: '$85B' },
                { type: 'Airports', count: '500+', capacity: 'High', condition: 'Excellent', investment: '$95B' },
                { type: 'Seaports', count: '120+', capacity: 'High', condition: 'Good', investment: '$45B' },
                { type: 'Bridges', count: '100,000+', capacity: 'Medium', condition: 'Fair', investment: '$35B' }
            ],
            transportStats: [
                { title: 'Highway Network', value: '150,000', unit: 'km' },
                { title: 'Railway Lines', value: '80,000', unit: 'km' },
                { title: 'Airports', value: '500+', unit: 'facilities' },
                { title: 'Seaports', value: '120', unit: 'major' }
            ],
            energyData: [
                { source: 'Coal', capacity: '400 GW', share: '45%', growth: '-3%', plants: '2,500' },
                { source: 'Natural Gas', capacity: '150 GW', share: '18%', growth: '+5%', plants: '800' },
                { source: 'Hydro', capacity: '120 GW', share: '15%', growth: '+2%', plants: '500' },
                { source: 'Nuclear', capacity: '55 GW', share: '8%', growth: '+8%', plants: '55' },
                { source: 'Solar', capacity: '80 GW', share: '9%', growth: '+25%', plants: '15,000+' },
                { source: 'Wind', capacity: '40 GW', share: '5%', growth: '+18%', plants: '8,000+' }
            ],
            energyStats: [
                { title: 'Power Plants', value: '25,000+', unit: 'facilities' },
                { title: 'Grid Capacity', value: '850', unit: 'GW' },
                { title: 'Renewable Share', value: '32', unit: '%' },
                { title: 'Pipelines', value: '200,000', unit: 'km' }
            ],
            telecomData: [
                { type: '5G Base Stations', count: '2.3M', coverage: '95%', investment: '$180B', growth: '+35%' },
                { type: 'Fiber Optic', count: '5.8M km', coverage: '85%', investment: '$120B', growth: '+12%' },
                { type: 'Data Centers', count: '2,800', coverage: 'National', investment: '$95B', growth: '+28%' },
                { type: 'Satellites', count: '650+', coverage: 'Global', investment: '$45B', growth: '+22%' }
            ],
            telecomStats: [
                { title: '5G Towers', value: '2.3M', unit: 'active' },
                { title: 'Fiber Network', value: '5.8M', unit: 'km' },
                { title: 'Data Centers', value: '2,800', unit: 'facilities' },
                { title: 'Satellites', value: '650+', unit: 'active' }
            ],
            waterData: [
                { type: 'Major Dams', count: '98,000', capacity: '850 km³', condition: 'Good', age: '35 yrs' },
                { type: 'Reservoirs', count: '85,000', capacity: '680 km³', condition: 'Good', age: '28 yrs' },
                { type: 'Treatment Plants', count: '45,000', capacity: '120B L/day', condition: 'Fair', age: '22 yrs' },
                { type: 'Desalination', count: '180', capacity: '8B L/day', condition: 'Excellent', age: '8 yrs' }
            ],
            waterStats: [
                { title: 'Dams', value: '98,000', unit: 'total' },
                { title: 'Reservoirs', value: '85,000', unit: 'capacity' },
                { title: 'Treatment Plants', value: '45,000', unit: 'facilities' },
                { title: 'Pipeline Network', value: '1.2M', unit: 'km' }
            ],
            resourcesData: [
                { resource: 'Crude Oil', reserves: '25B barrels', production: '5M bpd', value: '$180B/yr', rank: '#5' },
                { resource: 'Natural Gas', reserves: '280 Tcf', production: '12 Tcf/yr', value: '$85B/yr', rank: '#3' },
                { resource: 'Coal', reserves: '150B tonnes', production: '4B t/yr', value: '$120B/yr', rank: '#1' },
                { resource: 'Rare Earth', reserves: '44M tonnes', production: '140K t/yr', value: '$8B/yr', rank: '#1' }
            ],
            resourceStats: [
                { title: 'Oil Reserves', value: '25B', unit: 'barrels' },
                { title: 'Gas Reserves', value: '280', unit: 'Tcf' },
                { title: 'Coal Reserves', value: '150B', unit: 'tonnes' },
                { title: 'Rare Earth', value: '44M', unit: 'tonnes' }
            ],
            mineralsData: [
                { mineral: 'Iron Ore', reserves: '20B tonnes', production: '880M t/yr', globalRank: '#1', value: '$95B' },
                { mineral: 'Copper', reserves: '30M tonnes', production: '1.8M t/yr', globalRank: '#2', value: '$18B' },
                { mineral: 'Gold', reserves: '2,000 tonnes', production: '380 t/yr', globalRank: '#1', value: '$25B' },
                { mineral: 'Aluminum', reserves: '830M tonnes', production: '38M t/yr', globalRank: '#1', value: '$65B' }
            ],
            mineralStats: [
                { title: 'Iron Ore', value: '20B', unit: 'tonnes' },
                { title: 'Copper', value: '30M', unit: 'tonnes' },
                { title: 'Gold', value: '2,000', unit: 'tonnes' },
                { title: 'Rare Earth', value: '44M', unit: 'tonnes' }
            ],
            financialData: [
                { asset: 'Foreign Reserves', value: '$3.2T', change: '+2.5%', type: 'Liquid' },
                { asset: 'Gold Reserves', value: '$180B', change: '+4.2%', type: 'Commodity' },
                { asset: 'Sovereign Wealth', value: '$1.8T', change: '+8.5%', type: 'Investment' },
                { asset: 'Banking Assets', value: '$52T', change: '+6.8%', type: 'Financial' }
            ],
            financialStats: [
                { title: 'Foreign Reserves', value: '$3.2T', unit: '' },
                { title: 'Gold Reserves', value: '2,100', unit: 'tonnes' },
                { title: 'Pension Assets', value: '$8.5T', unit: '' },
                { title: 'Banking Assets', value: '$52T', unit: '' }
            ],
            industrialData: [
                { sector: 'Manufacturing', count: '380,000', employment: '112M', output: '$4.8T', growth: '+5.2%' },
                { sector: 'Technology', count: '85,000', employment: '22M', output: '$1.8T', growth: '+12%' },
                { sector: 'Automotive', count: '12,000', employment: '8M', output: '$890B', growth: '+4.5%' },
                { sector: 'Pharmaceuticals', count: '8,500', employment: '2.8M', output: '$350B', growth: '+8.2%' }
            ],
            industrialStats: [
                { title: 'Manufacturing', value: '380,000', unit: 'plants' },
                { title: 'Tech Hubs', value: '85', unit: 'major' },
                { title: 'Industrial Parks', value: '2,500', unit: '' },
                { title: 'R&D Centers', value: '25,000+', unit: '' }
            ],
            educationData: [
                { level: 'Primary', institutions: '520,000', enrollment: '110M', teachers: '6.2M', spending: '$180B' },
                { level: 'Secondary', institutions: '85,000', enrollment: '95M', teachers: '5.8M', spending: '$145B' },
                { level: 'Higher Education', institutions: '2,900', enrollment: '45M', teachers: '1.8M', spending: '$95B' },
                { level: 'Vocational', institutions: '12,000', enrollment: '18M', teachers: '850K', spending: '$35B' }
            ],
            educationStats: [
                { title: 'Schools', value: '605,000', unit: 'total' },
                { title: 'Universities', value: '2,900', unit: '' },
                { title: 'Enrollment', value: '268M', unit: 'students' },
                { title: 'Ed Spending', value: '$455B', unit: '/year' }
            ],
            healthcareData: [
                { facility: 'Hospitals', count: '35,000', capacity: '7.2M beds', staff: '12M', spending: '$980B' },
                { facility: 'Clinics', count: '980,000', capacity: '2.5B visits/yr', staff: '8.5M', spending: '$320B' },
                { facility: 'Pharmacies', count: '560,000', capacity: 'National', staff: '1.8M', spending: '$180B' },
                { facility: 'Research Centers', count: '2,800', capacity: 'N/A', staff: '450K', spending: '$85B' }
            ],
            healthcareStats: [
                { title: 'Hospitals', value: '35,000', unit: '' },
                { title: 'Hospital Beds', value: '7.2M', unit: '' },
                { title: 'Pharmacies', value: '560,000', unit: '' },
                { title: 'Health Spending', value: '$1.5T', unit: '/year' }
            ],
            publicFacilitiesData: [
                { type: 'Schools', count: '605,000', capacity: '268M students', condition: 'Good', funding: '$455B' },
                { type: 'Hospitals', count: '35,000', capacity: '7.2M beds', condition: 'Good', funding: '$980B' },
                { type: 'Fire Stations', count: '55,000', capacity: '1.8M personnel', condition: 'Good', funding: '$42B' },
                { type: 'Police Stations', count: '85,000', capacity: '2.1M officers', condition: 'Fair', funding: '$125B' }
            ],
            publicFacilitiesStats: [
                { title: 'Schools', value: '605,000', unit: '' },
                { title: 'Hospitals', value: '35,000', unit: '' },
                { title: 'Fire Stations', value: '55,000', unit: '' },
                { title: 'Police Stations', value: '85,000', unit: '' }
            ],
            defenseData: [
                { type: 'Military Bases', count: '2,200+', personnel: '2.1M', status: 'Active', budget: '$230B' },
                { type: 'Naval Bases', count: '85', personnel: '350K', status: 'Active', budget: '$65B' },
                { type: 'Air Bases', count: '150', personnel: '400K', status: 'Active', budget: '$85B' },
                { type: 'Missile Sites', count: '200+', personnel: '45K', status: 'Operational', budget: '$45B' }
            ],
            defenseStats: [
                { title: 'Military Bases', value: '2,200+', unit: '' },
                { title: 'Naval Bases', value: '85', unit: 'major' },
                { title: 'Air Bases', value: '150', unit: '' },
                { title: 'Defense Budget', value: '$425B', unit: '/year' }
            ],
            agriculturalData: [
                { resource: 'Arable Land', amount: '165M hectares', utilization: '95%', output: '$1.2T/yr', globalRank: '#3' },
                { resource: 'Forests', amount: '220M hectares', utilization: '35%', output: '$85B/yr', globalRank: '#5' },
                { resource: 'Freshwater', amount: '2,840 km³/yr', utilization: '22%', output: 'N/A', globalRank: '#6' },
                { resource: 'Fisheries', amount: '18M sq km EEZ', utilization: '65%', output: '$35B/yr', globalRank: '#1' }
            ],
            agriculturalStats: [
                { title: 'Arable Land', value: '165M', unit: 'hectares' },
                { title: 'Forests', value: '220M', unit: 'hectares' },
                { title: 'Freshwater', value: '2,840', unit: 'km³/yr' },
                { title: 'Marine EEZ', value: '18M', unit: 'sq km' }
            ],
            humanCapitalData: [
                { metric: 'Population', value: '1.4B', growth: '+0.1%/yr', globalRank: '#1' },
                { metric: 'Labor Force', value: '785M', growth: '+0.5%/yr', globalRank: '#1' },
                { metric: 'STEM Graduates', value: '4.7M/yr', growth: '+8%/yr', globalRank: '#1' },
                { metric: 'Skilled Workers', value: '220M', growth: '+3.5%/yr', globalRank: '#1' }
            ],
            humanCapitalStats: [
                { title: 'Population', value: '1.4B', unit: '' },
                { title: 'Labor Force', value: '785M', unit: '' },
                { title: 'STEM Grads', value: '4.7M', unit: '/year' },
                { title: 'Skilled Workers', value: '220M', unit: '' }
            ],
            intellectualData: [
                { category: 'Patents', count: '1.5M', annual: '+320K/yr', value: '$2.8T', globalShare: '32%' },
                { category: 'Research Unis', count: '2,900', annual: '$68B R&D', value: 'N/A', globalShare: '18%' },
                { category: 'Publications', count: '680K/yr', annual: '+8%', value: 'N/A', globalShare: '24%' },
                { category: 'Tech Patents', count: '450K', annual: '+85K/yr', value: '$850B', globalShare: '28%' }
            ],
            intellectualStats: [
                { title: 'Active Patents', value: '1.5M', unit: '' },
                { title: 'Research Unis', value: '2,900', unit: '' },
                { title: 'Publications', value: '680K', unit: '/year' },
                { title: 'R&D Spending', value: '$540B', unit: '' }
            ],
            strategicReservesData: [
                { reserve: 'Petroleum Reserve', capacity: '500M barrels', current: '380M (76%)', value: '$32B', days: '90 days' },
                { reserve: 'Grain Reserves', capacity: '180M tonnes', current: '150M (83%)', value: '$45B', days: '120 days' },
                { reserve: 'Rare Earth', capacity: '200K tonnes', current: '85K (42%)', value: '$12B', days: '365 days' },
                { reserve: 'Medical Supplies', capacity: '$25B', current: '$18B (72%)', value: '$18B', days: '180 days' }
            ],
            strategicStats: [
                { title: 'Petroleum', value: '380M', unit: 'barrels' },
                { title: 'Grain Reserve', value: '150M', unit: 'tonnes' },
                { title: 'Rare Earth', value: '85K', unit: 'tonnes' },
                { title: 'Medical', value: '$18B', unit: '' }
            ],
            digitalAssetsData: [
                { asset: 'Data Centers', count: '2,800', capacity: '8,500 MW', investment: '$95B', growth: '+28%' },
                { asset: 'Cloud Regions', count: '45', capacity: 'National', investment: '$65B', growth: '+35%' },
                { asset: 'AI Clusters', count: '280', capacity: '15 ExaFLOPS', investment: '$38B', growth: '+85%' },
                { asset: 'Cyber Centers', count: '850', capacity: 'National', investment: '$22B', growth: '+18%' }
            ],
            digitalStats: [
                { title: 'Data Centers', value: '2,800', unit: '' },
                { title: 'Cloud Regions', value: '45', unit: '' },
                { title: 'AI Clusters', value: '280', unit: '' },
                { title: 'Cyber Centers', value: '850', unit: '' }
            ],
            governanceData: [
                { institution: 'Courts', count: '3,500 districts', personnel: '450K', budget: '$28B', efficiency: '72%' },
                { institution: 'Government Agencies', count: '85', personnel: '8.5M', budget: '$1.2T', efficiency: '68%' },
                { institution: 'Local Government', count: '2,800+', personnel: '45M', budget: '$850B', efficiency: '65%' },
                { institution: 'Regulatory Bodies', count: '120', personnel: '380K', budget: '$45B', efficiency: '74%' }
            ],
            governanceStats: [
                { title: 'Courts', value: '3,500', unit: 'districts' },
                { title: 'Agencies', value: '85', unit: 'federal' },
                { title: 'Regulatory', value: '120', unit: 'bodies' },
                { title: 'Local Govts', value: '2,800+', unit: '' }
            ],
            lawEnforcementData: [
                { agency: 'National Police', personnel: '1.6M', budget: '$85B', jurisdiction: 'National', clearRate: '45%' },
                { agency: 'Local Police', personnel: '2.8M', budget: '$120B', jurisdiction: 'Local', clearRate: '52%' },
                { agency: 'Border Security', personnel: '350K', budget: '$28B', jurisdiction: 'Borders', clearRate: 'N/A' },
                { agency: 'Intelligence', personnel: '180K', budget: '$45B', jurisdiction: 'National', clearRate: 'N/A' }
            ],
            lawEnforcementStats: [
                { title: 'National Police', value: '1.6M', unit: '' },
                { title: 'Local Police', value: '2.8M', unit: '' },
                { title: 'Border Security', value: '350K', unit: '' },
                { title: 'Intelligence', value: '180K+', unit: '' }
            ],
            financialInfraData: [
                { type: 'Commercial Banks', count: '4,500', assets: '$52T', coverage: 'National', rating: 'A' },
                { type: 'Stock Exchanges', count: '15', assets: '$18T mkt cap', coverage: 'National', rating: 'A+' },
                { type: 'Insurance', count: '280', assets: '$3.8T', coverage: 'National', rating: 'A' },
                { type: 'Investment Banks', count: '180', assets: '$2.5T', coverage: 'Global', rating: 'A' }
            ],
            financialInfraStats: [
                { title: 'Banks', value: '4,500', unit: '' },
                { title: 'Exchanges', value: '15', unit: 'major' },
                { title: 'Insurance', value: '280', unit: 'companies' },
                { title: 'Market Cap', value: '$18T', unit: '' }
            ],
            tradeNetworksData: [
                { network: 'Container Ports', count: '850', volume: '250M TEU/yr', value: '$4.2T', globalRank: '#1' },
                { network: 'Trade Zones', count: '180', volume: '$1.8T', value: 'N/A', globalRank: '#1' },
                { network: 'Logistics Hubs', count: '2,500', volume: '12B tonnes/yr', value: '$2.8T', globalRank: '#1' },
                { network: 'Trade Agreements', count: '25 FTAs', volume: '140 countries', value: '$5.5T', globalRank: '#1' }
            ],
            tradeStats: [
                { title: 'Container Ports', value: '850', unit: '' },
                { title: 'Trade Volume', value: '$6.3T', unit: '/year' },
                { title: 'FTAs', value: '25', unit: 'agreements' },
                { title: 'Logistics Hubs', value: '2,500', unit: '' }
            ],
            laborMarketData: [
                { metric: 'Employment', value: '745M', change: '+8M/yr', rate: '94.8%' },
                { metric: 'Manufacturing', value: '112M', change: '+2.5M/yr', rate: '15%' },
                { metric: 'Services', value: '380M', change: '+12M/yr', rate: '51%' },
                { metric: 'Technology', value: '22M', change: '+1.8M/yr', rate: '3%' }
            ],
            laborStats: [
                { title: 'Employment', value: '745M', unit: '' },
                { title: 'Tech Jobs', value: '22M', unit: '' },
                { title: 'Services', value: '380M', unit: '' },
                { title: 'Unemployment', value: '5.2%', unit: '' }
            ],
            socialSafetyData: [
                { program: 'Pension System', beneficiaries: '285M', annual: '$580B', coverage: '95%', fundStatus: 'Stable' },
                { program: 'Healthcare', beneficiaries: '1.4B', annual: '$980B', coverage: '95%', fundStatus: 'Funded' },
                { program: 'Unemployment', beneficiaries: '38M', annual: '$65B', coverage: '85%', fundStatus: 'Funded' },
                { program: 'Social Assistance', beneficiaries: '180M', annual: '$120B', coverage: '100%', fundStatus: 'Funded' }
            ],
            socialSafetyStats: [
                { title: 'Pension', value: '285M', unit: 'beneficiaries' },
                { title: 'Healthcare', value: '1.4B', unit: 'covered' },
                { title: 'Unemployment', value: '38M', unit: 'beneficiaries' },
                { title: 'Social Aid', value: '180M', unit: 'beneficiaries' }
            ],
            diplomaticData: [
                { type: 'Embassies', count: '175', personnel: '15,000', regions: 'Global', budget: '$8.5B' },
                { type: 'Consulates', count: '280', personnel: '12,000', regions: 'Global', budget: '$4.2B' },
                { type: 'Trade Missions', count: '350', personnel: '8,500', regions: 'Global', budget: '$2.8B' },
                { type: 'Alliances', count: '12', personnel: 'N/A', regions: 'Global', budget: 'N/A' }
            ],
            diplomaticStats: [
                { title: 'Embassies', value: '175', unit: '' },
                { title: 'Consulates', value: '280', unit: '' },
                { title: 'Alliances', value: '12', unit: 'major' },
                { title: 'Trade Missions', value: '350', unit: '' }
            ],
            geopoliticalData: [
                { asset: 'EEZ', size: '18M km²', value: 'Incalculable', rank: '#3 globally', control: 'Full' },
                { asset: 'Airspace', size: '9.6M km²', value: 'Incalculable', rank: '#3 globally', control: 'Full' },
                { asset: 'Satellites', size: '650+', value: '$85B', rank: '#2 globally', control: 'Full' },
                { asset: 'Maritime Routes', size: '8 major', value: '$8T flow', rank: 'Strategic', control: 'Strong' }
            ],
            geopoliticalStats: [
                { title: 'EEZ', value: '18M', unit: 'km²' },
                { title: 'Airspace', value: '9.6M', unit: 'km²' },
                { title: 'Satellites', value: '650+', unit: '' },
                { title: 'Maritime Routes', value: '8', unit: 'major' }
            ],
            softPowerData: [
                { category: 'Cultural Exports', value: '$85B/yr', reach: 'Global', rank: '#2', growth: '+8.5%' },
                { category: 'Intl Students', value: '950K', reach: 'Global', rank: '#3', growth: '+12%' },
                { category: 'Media', value: '$320B/yr', reach: 'Global', rank: '#2', growth: '+6.8%' },
                { category: 'Tourism', value: '145M visitors', reach: 'Global', rank: '#1', growth: '+18%' }
            ],
            softPowerStats: [
                { title: 'Cultural Exports', value: '$85B', unit: '/year' },
                { title: 'Intl Students', value: '950K', unit: '' },
                { title: 'Media', value: '$320B', unit: '/year' },
                { title: 'Tourism', value: '145M', unit: 'visitors' }
            ],
            climateResilienceData: [
                { system: 'Flood Control', count: '8,500 systems', capacity: '2.5B people', investment: '$85B', condition: 'Good' },
                { system: 'Drought Management', count: '2,800', capacity: 'National', investment: '$32B', condition: 'Fair' },
                { system: 'Storm Shelters', count: '15,000', capacity: '45M people', investment: '$18B', condition: 'Good' },
                { system: 'Early Warning', count: '850 stations', capacity: 'National', investment: '$8.5B', condition: 'Excellent' }
            ],
            climateStats: [
                { title: 'Flood Control', value: '8,500', unit: 'systems' },
                { title: 'Drought Mgmt', value: '2,800', unit: '' },
                { title: 'Shelters', value: '15,000', unit: '' },
                { title: 'Warning Systems', value: '850', unit: 'stations' }
            ],
            protectedAreasData: [
                { type: 'National Parks', count: '580', area: '150M hectares', visitors: '850M/yr', budget: '$12B' },
                { type: 'Nature Reserves', count: '2,750', area: '180M hectares', visitors: '120M/yr', budget: '$8.5B' },
                { type: 'Marine Protected', count: '280', area: '8.5M km²', visitors: '45M/yr', budget: '$2.8B' },
                { type: 'Forests', count: '1,200', area: '220M hectares', visitors: '280M/yr', budget: '$15B' }
            ],
            protectedStats: [
                { title: 'National Parks', value: '580', unit: '' },
                { title: 'Nature Reserves', value: '2,750', unit: '' },
                { title: 'Marine Areas', value: '280', unit: '' },
                { title: 'Protected Forests', value: '1,200', unit: '' }
            ],
            renewablePotentialData: [
                { source: 'Solar', potential: '2,400 GW', installed: '450 GW', utilization: '18.7%', growth: '+28%' },
                { source: 'Wind', potential: '1,200 GW', installed: '380 GW', utilization: '31.6%', growth: '+22%' },
                { source: 'Hydro', potential: '500 GW', installed: '420 GW', utilization: '84%', growth: '+2%' },
                { source: 'Geothermal', potential: '45 GW', installed: '8 GW', utilization: '17.7%', growth: '+8%' }
            ],
            renewableStats: [
                { title: 'Solar', value: '450', unit: 'GW' },
                { title: 'Wind', value: '380', unit: 'GW' },
                { title: 'Hydro', value: '420', unit: 'GW' },
                { title: 'Geothermal', value: '8', unit: 'GW' }
            ],
            trendData: Array.from({ length: 12 }, (_, i) => ({
                period: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
                infrastructure: Math.round(65 + Math.random() * 25),
                energy: Math.round(60 + Math.random() * 28),
                digital: Math.round(70 + Math.random() * 22)
            })),
            countryComparison: selectedCountries.map(country => ({
                country,
                infrastructure: Math.round(55 + Math.random() * 40),
                resources: Math.round(50 + Math.random() * 45),
                digital: Math.round(60 + Math.random() * 35)
            }))
        };
    };

    // Generate comprehensive data
    const infrastructureData = {
        transportation: [
            { name: 'Highways', value: 164000, unit: 'miles' },
            { name: 'Railways', value: 140000, unit: 'miles' },
            { name: 'Airports', value: 5080, unit: 'facilities' },
            { name: 'Seaports', value: 360, unit: 'ports' }
        ],
        energy: [
            { name: 'Power Plants', value: 10800, capacity: '1,200 GW' },
            { name: 'Oil Refineries', value: 135, capacity: '18.1 mbpd' },
            { name: 'Natural Gas', value: 305000, unit: 'miles pipeline' },
            { name: 'Renewables', value: 29, unit: '% of grid' }
        ],
        telecom: [
            { name: '5G Towers', value: 418000 },
            { name: 'Fiber Optic', value: 2100000, unit: 'miles' },
            { name: 'Data Centers', value: 5375 },
            { name: 'Satellites', value: 3400 }
        ]
    };

    const resourcesData = {
        energy: [
            { name: 'Oil Reserves', value: 68.8, unit: 'billion barrels' },
            { name: 'Natural Gas', value: 625, unit: 'tcf' },
            { name: 'Coal', value: 253, unit: 'billion tons' },
            { name: 'Uranium', value: 62, unit: 'thousand tons' }
        ],
        minerals: [
            { name: 'Iron Ore', value: 3 },
            { name: 'Copper', value: 48 },
            { name: 'Gold', value: 3000 },
            { name: 'Rare Earth', value: 1.5 }
        ]
    };

    const trendData = Array.from({ length: 12 }, (_, i) => ({
        period: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        infrastructure: Math.round(65 + Math.random() * 20),
        energy: Math.round(55 + Math.random() * 25),
        digital: Math.round(70 + Math.random() * 20)
    }));

    const distributionData = [
        { name: 'Transportation', value: 28 },
        { name: 'Energy', value: 24 },
        { name: 'Telecom', value: 18 },
        { name: 'Water', value: 15 },
        { name: 'Defense', value: 10 },
        { name: 'Public', value: 5 }
    ];

    const countryComparison = [
        { country: 'USA', infrastructure: 92, resources: 85, digital: 94 },
        { country: 'China', infrastructure: 88, resources: 78, digital: 89 },
        { country: 'Germany', infrastructure: 90, resources: 45, digital: 86 },
        { country: 'Japan', infrastructure: 94, resources: 35, digital: 92 },
        { country: 'India', infrastructure: 65, resources: 72, digital: 71 },
        { country: 'Brazil', infrastructure: 58, resources: 88, digital: 64 }
    ];

    const radarData = [
        { dimension: 'Transportation', value: 85 },
        { dimension: 'Energy', value: 78 },
        { dimension: 'Digital', value: 92 },
        { dimension: 'Water', value: 72 },
        { dimension: 'Defense', value: 95 },
        { dimension: 'Public Services', value: 68 }
    ];

    const transportTable = [
        { type: 'Interstate Highways', length: '48,756 mi', condition: 'Good', investment: '$156B', utilization: '78%' },
        { type: 'State Highways', length: '115,244 mi', condition: 'Fair', investment: '$89B', utilization: '65%' },
        { type: 'Railways (Freight)', length: '140,000 mi', condition: 'Good', investment: '$89B', utilization: '72%' },
        { type: 'Railways (Passenger)', length: '21,400 mi', condition: 'Fair', investment: '$45B', utilization: '45%' },
        { type: 'Major Airports', length: '520', condition: 'Excellent', investment: '$234B', utilization: '82%' },
        { type: 'Regional Airports', length: '4,560', condition: 'Good', investment: '$67B', utilization: '58%' },
        { type: 'Deep-water Ports', length: '150', condition: 'Good', investment: '$42B', utilization: '85%' },
        { type: 'Inland Waterways', length: '25,000 mi', condition: 'Fair', investment: '$28B', utilization: '52%' },
        { type: 'Bridges', length: '617,000', condition: 'Fair', investment: '$125B', utilization: '71%' },
        { type: 'Tunnels', length: '545', condition: 'Good', investment: '$18B', utilization: '68%' }
    ];

    const energyTable = [
        { source: 'Natural Gas', capacity: '549 GW', share: '38%', growth: '+5.2%', plants: '1,875' },
        { source: 'Coal', capacity: '213 GW', share: '22%', growth: '-8.1%', plants: '241' },
        { source: 'Nuclear', capacity: '95 GW', share: '19%', growth: '+0.5%', plants: '93' },
        { source: 'Wind', capacity: '141 GW', share: '11%', growth: '+14.2%', plants: '72,000+' },
        { source: 'Solar', capacity: '97 GW', share: '6%', growth: '+23.6%', plants: '2.5M+' },
        { source: 'Hydro', capacity: '80 GW', share: '4%', growth: '+1.2%', plants: '2,198' }
    ];

    const waterInfraTable = [
        { type: 'Major Dams', count: '91,457', capacity: '1,200 km³', condition: 'Fair', age: '57 yrs avg' },
        { type: 'Reservoirs', count: '53,000+', capacity: '180,000 GL', condition: 'Good', age: '45 yrs avg' },
        { type: 'Water Treatment Plants', count: '16,000', capacity: '150B gal/day', condition: 'Fair', age: '35 yrs avg' },
        { type: 'Sewage Treatment', count: '14,748', capacity: '85B gal/day', condition: 'Fair', age: '40 yrs avg' },
        { type: 'Irrigation Systems', count: '58M acres', capacity: 'N/A', condition: 'Good', age: '30 yrs avg' },
        { type: 'Desalination Plants', count: '247', capacity: '2.1B gal/day', condition: 'Excellent', age: '12 yrs avg' }
    ];

    const telecomTable = [
        { type: '5G Base Stations', count: '418,000', coverage: '93%', investment: '$275B', growth: '+45%' },
        { type: '4G/LTE Towers', count: '417,000', coverage: '99%', investment: '$180B', growth: '+2%' },
        { type: 'Fiber Optic Network', count: '2.1M mi', coverage: '78%', investment: '$156B', growth: '+18%' },
        { type: 'Data Centers', count: '5,375', coverage: 'N/A', investment: '$212B', growth: '+22%' },
        { type: 'Undersea Cables', count: '78', coverage: 'Global', investment: '$45B', growth: '+8%' },
        { type: 'Satellites (Active)', count: '3,400+', coverage: 'Global', investment: '$89B', growth: '+35%' },
        { type: 'Internet Exchange Points', count: '292', coverage: 'National', investment: '$12B', growth: '+5%' }
    ];

    const publicFacilitiesTable = [
        { type: 'K-12 Schools', count: '130,930', capacity: '50.7M students', condition: 'Fair', funding: '$795B' },
        { type: 'Universities', count: '5,916', capacity: '19.6M students', condition: 'Good', funding: '$672B' },
        { type: 'Hospitals', count: '6,090', capacity: '920,000 beds', condition: 'Good', funding: '$1.3T' },
        { type: 'Clinics & Health Centers', count: '28,000+', capacity: 'N/A', condition: 'Fair', funding: '$245B' },
        { type: 'Fire Stations', count: '29,705', capacity: '1.1M personnel', condition: 'Good', funding: '$52B' },
        { type: 'Police Stations', count: '18,000+', capacity: '700K officers', condition: 'Fair', funding: '$123B' },
        { type: 'Government Buildings', count: '500,000+', capacity: 'N/A', condition: 'Fair', funding: '$89B' }
    ];

    const defenseTable = [
        { type: 'Military Bases (Domestic)', count: '750+', personnel: '1.3M', status: 'Active', budget: '$350B' },
        { type: 'Military Bases (Overseas)', count: '750+', personnel: '200K', status: 'Active', budget: '$85B' },
        { type: 'Naval Ports', count: '28', personnel: '340K', status: 'Active', budget: '$175B' },
        { type: 'Air Force Bases', count: '156', personnel: '325K', status: 'Active', budget: '$156B' },
        { type: 'Defense Comm Systems', count: 'Classified', personnel: '45K', status: 'Operational', budget: '$68B' },
        { type: 'Missile Defense Sites', count: '44', personnel: '12K', status: 'Active', budget: '$24B' }
    ];

    const mineralResourcesTable = [
        { mineral: 'Iron Ore', reserves: '3B tonnes', production: '48M tonnes/yr', globalRank: '#4', value: '$4.2B' },
        { mineral: 'Copper', reserves: '48M tonnes', production: '1.2M tonnes/yr', globalRank: '#5', value: '$8.9B' },
        { mineral: 'Gold', reserves: '3,000 tonnes', production: '190 tonnes/yr', globalRank: '#4', value: '$11.4B' },
        { mineral: 'Rare Earth Elements', reserves: '1.5M tonnes', production: '43K tonnes/yr', globalRank: '#2', value: '$1.2B' },
        { mineral: 'Lithium', reserves: '750K tonnes', production: '900 tonnes/yr', globalRank: '#7', value: '$420M' },
        { mineral: 'Uranium', reserves: '62K tonnes', production: '75 tonnes/yr', globalRank: '#9', value: '$38M' },
        { mineral: 'Coal', reserves: '253B tonnes', production: '535M tonnes/yr', globalRank: '#3', value: '$28B' }
    ];

    const energyResourcesTable = [
        { resource: 'Crude Oil Reserves', amount: '68.8B barrels', production: '11.9M bpd', lifespan: '15.8 yrs', value: '$5.1T' },
        { resource: 'Natural Gas Reserves', amount: '625 Tcf', production: '34 Tcf/yr', lifespan: '18.4 yrs', value: '$2.8T' },
        { resource: 'Coal Reserves', amount: '253B tonnes', production: '535M t/yr', lifespan: '473 yrs', value: '$1.2T' },
        { resource: 'Shale Oil', amount: '78.2B barrels', production: '8.1M bpd', lifespan: '26.4 yrs', value: '$5.8T' },
        { resource: 'Hydropower Potential', amount: '376 GW', production: '80 GW installed', lifespan: 'Renewable', value: 'N/A' },
        { resource: 'Geothermal Potential', amount: '30 GW', production: '3.7 GW installed', lifespan: 'Renewable', value: 'N/A' }
    ];

    const agriculturalTable = [
        { resource: 'Arable Land', amount: '915M acres', utilization: '52%', output: '$428B/yr', globalRank: '#3' },
        { resource: 'Forests', amount: '766M acres', utilization: '28%', output: '$23B/yr', globalRank: '#4' },
        { resource: 'Freshwater', amount: '3,069 km³/yr', utilization: '15%', output: 'N/A', globalRank: '#4' },
        { resource: 'Fisheries (Marine)', amount: '4.4M sq mi EEZ', utilization: '35%', output: '$5.6B/yr', globalRank: '#3' },
        { resource: 'Fisheries (Freshwater)', amount: '95,000 sq mi', utilization: '42%', output: '$1.2B/yr', globalRank: '#5' },
        { resource: 'Grazing Land', amount: '587M acres', utilization: '68%', output: '$78B/yr', globalRank: '#1' }
    ];

    const humanCapitalTable = [
        { metric: 'Total Population', value: '335M', growth: '+0.4%/yr', globalRank: '#3' },
        { metric: 'Working Age (15-64)', value: '209M', growth: '+0.2%/yr', globalRank: '#3' },
        { metric: 'Labor Force Participation', value: '62.3%', growth: '+0.5%', globalRank: '#12' },
        { metric: 'Tertiary Education Rate', value: '50.2%', growth: '+1.2%', globalRank: '#6' },
        { metric: 'STEM Graduates/yr', value: '568,000', growth: '+3.2%', globalRank: '#2' },
        { metric: 'Skilled Workers', value: '85M', growth: '+1.8%', globalRank: '#2' },
        { metric: 'Median Age', value: '38.5 yrs', growth: '+0.2 yrs', globalRank: '#42' }
    ];

    const financialAssetsTable = [
        { asset: 'Central Bank Reserves', value: '$242B', change: '-1.2%', type: 'Liquid' },
        { asset: 'Gold Reserves', value: '$512B (8,133t)', change: '+2.1%', type: 'Commodity' },
        { asset: 'Sovereign Wealth Funds', value: '$156B', change: '+8.5%', type: 'Investment' },
        { asset: 'Pension Fund Assets', value: '$35.4T', change: '+6.2%', type: 'Long-term' },
        { asset: 'Insurance Assets', value: '$8.2T', change: '+4.8%', type: 'Financial' },
        { asset: 'Total Banking Assets', value: '$23.7T', change: '+3.5%', type: 'Financial' }
    ];

    const industrialAssetsTable = [
        { sector: 'Manufacturing Plants', count: '292,825', employment: '12.8M', output: '$2.3T', growth: '+2.1%' },
        { sector: 'Technology Hubs', count: '45 major', employment: '5.2M', output: '$1.8T', growth: '+8.5%' },
        { sector: 'Industrial Parks', count: '1,200+', employment: '8.4M', output: '$890B', growth: '+3.2%' },
        { sector: 'R&D Centers', count: '15,000+', employment: '1.5M', output: '$680B', growth: '+5.8%' },
        { sector: 'Refineries', count: '135', employment: '65K', output: '$320B', growth: '+1.2%' },
        { sector: 'Pharmaceutical Plants', count: '825', employment: '315K', output: '$450B', growth: '+6.5%' }
    ];

    const intellectualAssetsTable = [
        { category: 'Active Patents', count: '3.4M', annual: '+285K/yr', value: '$5.5T', globalShare: '22%' },
        { category: 'Trademarks', count: '2.8M', annual: '+420K/yr', value: '$2.1T', globalShare: '18%' },
        { category: 'Research Universities', count: '418', annual: '$83B R&D', value: 'N/A', globalShare: '38%' },
        { category: 'Nobel Laureates', count: '403', annual: '~4/yr', value: 'N/A', globalShare: '33%' },
        { category: 'Scientific Publications', count: '455K/yr', annual: '+3.2%', value: 'N/A', globalShare: '17%' }
    ];

    const strategicReservesTable = [
        { reserve: 'Strategic Petroleum Reserve', capacity: '714M barrels', current: '372M (52%)', value: '$28B', days: '35 days import' },
        { reserve: 'National Defense Stockpile', capacity: '$1.2B', current: '$888M (74%)', value: '$888M', days: 'N/A' },
        { reserve: 'Emergency Food Reserves', capacity: '180 days', current: '120 days (67%)', value: '$4.2B', days: '120 days' },
        { reserve: 'Medical Countermeasures', capacity: '$15B', current: '$12B (80%)', value: '$12B', days: 'N/A' },
        { reserve: 'Rare Earth Stockpile', capacity: '50K tonnes', current: '12K (24%)', value: '$1.5B', days: '180 days' }
    ];

    const digitalAssetsTable = [
        { asset: 'Hyperscale Data Centers', count: '2,700+', capacity: '2,100 MW', investment: '$156B', growth: '+24%' },
        { asset: 'Colocation Facilities', count: '2,675', capacity: '5,400 MW', investment: '$56B', growth: '+18%' },
        { asset: 'Cloud Regions', count: '32', capacity: 'N/A', investment: '$89B', growth: '+35%' },
        { asset: 'AI Compute Clusters', count: '156', capacity: '8.5 ExaFLOPS', investment: '$42B', growth: '+85%' },
        { asset: 'Cybersecurity Centers', count: '450+', capacity: 'N/A', investment: '$18B', growth: '+22%' }
    ];

    const governanceTable = [
        { institution: 'Federal Courts', count: '94 districts', personnel: '34,000', budget: '$8.2B', efficiency: '78%' },
        { institution: 'State Courts', count: '50 systems', personnel: '30,000', budget: '$46B', efficiency: '72%' },
        { institution: 'Federal Agencies', count: '438', personnel: '2.9M', budget: '$6.3T', efficiency: '68%' },
        { institution: 'State/Local Gov', count: '90,000+', personnel: '19.7M', budget: '$3.8T', efficiency: '65%' },
        { institution: 'Regulatory Bodies', count: '115', personnel: '280K', budget: '$72B', efficiency: '74%' }
    ];

    const lawEnforcementTable = [
        { agency: 'Federal Law Enforcement', personnel: '137,000', budget: '$32B', jurisdiction: 'Federal', clearRate: '45%' },
        { agency: 'State Police', personnel: '60,000', budget: '$12B', jurisdiction: 'State', clearRate: '52%' },
        { agency: 'Local Police', personnel: '650,000', budget: '$115B', jurisdiction: 'Local', clearRate: '48%' },
        { agency: 'Border Patrol', personnel: '21,000', budget: '$4.9B', jurisdiction: 'Borders', clearRate: 'N/A' },
        { agency: 'Intelligence Agencies', personnel: '100,000+', budget: '$89B', jurisdiction: 'National', clearRate: 'N/A' }
    ];

    const financialInfraTable = [
        { type: 'Commercial Banks', count: '4,844', assets: '$23.7T', coverage: 'National', rating: 'A+' },
        { type: 'Credit Unions', count: '4,853', assets: '$2.1T', coverage: 'National', rating: 'A' },
        { type: 'Stock Exchanges', count: '13', assets: '$53T mkt cap', coverage: 'Global', rating: 'AAA' },
        { type: 'Insurance Companies', count: '5,929', assets: '$8.2T', coverage: 'National', rating: 'A+' },
        { type: 'Investment Banks', count: '156', assets: '$4.5T', coverage: 'Global', rating: 'A+' },
        { type: 'Payment Networks', count: '12 major', assets: '$450T/yr vol', coverage: 'Global', rating: 'AAA' }
    ];

    const tradeNetworksTable = [
        { network: 'Container Ports', count: '360', volume: '55M TEU/yr', value: '$1.2T', globalRank: '#3' },
        { network: 'Customs Ports of Entry', count: '328', volume: '$4.6T/yr', value: 'N/A', globalRank: '#1' },
        { network: 'Free Trade Zones', count: '293', volume: '$890B', value: 'N/A', globalRank: '#2' },
        { network: 'Logistics Hubs', count: '1,200+', volume: '19B tonnes/yr', value: '$1.6T', globalRank: '#2' },
        { network: 'Trade Agreements', count: '14 FTAs', volume: '20 countries', value: '$2.8T', globalRank: '#3' }
    ];

    const laborMarketTable = [
        { metric: 'Total Employment', value: '161M', change: '+2.8M/yr', rate: '96.4%' },
        { metric: 'Manufacturing Jobs', value: '12.8M', change: '+125K/yr', rate: '7.9%' },
        { metric: 'Service Jobs', value: '108M', change: '+1.8M/yr', rate: '67%' },
        { metric: 'Tech Jobs', value: '12.1M', change: '+450K/yr', rate: '7.5%' },
        { metric: 'Union Membership', value: '14.3M', change: '-0.2%', rate: '10.1%' },
        { metric: 'Gig Economy Workers', value: '59M', change: '+12%/yr', rate: '36%' }
    ];

    const healthcareTable = [
        { facility: 'Hospitals (General)', count: '5,139', beds: '792,000', staff: '6.1M', spending: '$1.1T' },
        { facility: 'Specialty Hospitals', count: '951', beds: '128,000', staff: '890K', spending: '$245B' },
        { facility: 'Outpatient Centers', count: '28,000+', beds: 'N/A', staff: '2.1M', spending: '$312B' },
        { facility: 'Nursing Homes', count: '15,300', beds: '1.3M', staff: '1.5M', spending: '$186B' },
        { facility: 'Pharmacies', count: '88,000', beds: 'N/A', staff: '420K', spending: '$456B' },
        { facility: 'Pharma Manufacturers', count: '825', beds: 'N/A', staff: '315K', spending: '$550B' }
    ];

    const educationTable = [
        { level: 'Early Childhood', institutions: '129,000', enrollment: '8.2M', teachers: '580K', spending: '$62B' },
        { level: 'Elementary (K-5)', institutions: '67,408', enrollment: '24.3M', teachers: '1.7M', spending: '$312B' },
        { level: 'Middle School', institutions: '13,477', enrollment: '12.8M', teachers: '640K', spending: '$156B' },
        { level: 'High School', institutions: '27,468', enrollment: '14.9M', teachers: '980K', spending: '$245B' },
        { level: 'Community Colleges', institutions: '1,043', enrollment: '6.8M', teachers: '280K', spending: '$78B' },
        { level: 'Universities', institutions: '4,873', enrollment: '19.6M', teachers: '1.5M', spending: '$672B' },
        { level: 'Vocational Training', institutions: '8,500+', enrollment: '5.2M', teachers: '185K', spending: '$45B' }
    ];

    const socialSafetyTable = [
        { program: 'Social Security', beneficiaries: '66M', annual: '$1.3T', coverage: '96%', fundStatus: '2034 projection' },
        { program: 'Medicare', beneficiaries: '65M', annual: '$900B', coverage: '99%', fundStatus: '2031 projection' },
        { program: 'Medicaid', beneficiaries: '85M', annual: '$756B', coverage: '100%', fundStatus: 'Funded' },
        { program: 'Unemployment Insurance', beneficiaries: '5.8M', annual: '$42B', coverage: '100%', fundStatus: 'Funded' },
        { program: 'SNAP (Food Stamps)', beneficiaries: '42M', annual: '$119B', coverage: '100%', fundStatus: 'Funded' },
        { program: 'Housing Assistance', beneficiaries: '5.2M', annual: '$52B', coverage: '24%', fundStatus: 'Funded' }
    ];

    const diplomaticTable = [
        { type: 'Embassies', count: '168', personnel: '13,000', regions: 'Global', budget: '$12B' },
        { type: 'Consulates', count: '88', personnel: '8,500', regions: 'Global', budget: '$4.5B' },
        { type: 'Military Alliances', count: '7 major', personnel: 'N/A', regions: 'Global', budget: 'N/A' },
        { type: 'UN Memberships', count: '193 recognized', personnel: '1,200', regions: 'Global', budget: '$11B' },
        { type: 'Trade Missions', count: '275', personnel: '2,800', regions: 'Global', budget: '$850M' }
    ];

    const geopoliticalTable = [
        { asset: 'Exclusive Economic Zone', size: '11.4M km²', value: 'Incalculable', rank: '#2 globally', control: 'Full' },
        { asset: 'Airspace Control', size: '24.7M km²', value: 'Incalculable', rank: '#1 globally', control: 'Full' },
        { asset: 'Maritime Chokepoints', size: '3 major', value: '$8T trade flow', rank: 'Strategic', control: 'Influence' },
        { asset: 'Space Assets', size: '5,500+ satellites', value: '$400B', rank: '#1 globally', control: 'Operational' },
        { asset: 'Arctic Claims', size: '1.7M km²', value: 'TBD', rank: '#4 Arctic', control: 'Partial' }
    ];

    const softPowerTable = [
        { category: 'Cultural Exports', value: '$178B/yr', reach: 'Global', rank: '#1', growth: '+4.2%' },
        { category: 'Higher Ed (Intl Students)', value: '1.1M students', reach: 'Global', rank: '#1', growth: '+7.5%' },
        { category: 'Media & Entertainment', value: '$820B/yr', reach: 'Global', rank: '#1', growth: '+5.8%' },
        { category: 'Technology Platforms', value: '$2.1T mkt cap', reach: '4.5B users', rank: '#1', growth: '+12%' },
        { category: 'Sports Leagues', value: '$78B/yr', reach: 'Global', rank: '#1', growth: '+6.2%' },
        { category: 'Tourism', value: '$195B/yr', reach: '79M visitors', rank: '#3', growth: '+15%' }
    ];

    const climateResilienceTable = [
        { system: 'Flood Control Systems', count: '2,500+ levees', capacity: 'N/A', investment: '$45B', condition: 'Fair' },
        { system: 'Wildfire Management', count: '660M acres', capacity: '30K personnel', investment: '$3.5B', condition: 'Strained' },
        { system: 'Hurricane Shelters', count: '3,200', capacity: '1.2M people', investment: '$8B', condition: 'Good' },
        { system: 'Earthquake Systems', count: '8,500 sensors', capacity: 'National', investment: '$2.1B', condition: 'Excellent' },
        { system: 'Tornado Warning', count: '122 radars', capacity: 'National', investment: '$1.8B', condition: 'Excellent' },
        { system: 'FEMA Resources', count: '28 regions', capacity: '$28B budget', investment: '$28B', condition: 'Good' }
    ];

    const protectedAreasTable = [
        { type: 'National Parks', count: '63', area: '85M acres', visitors: '312M/yr', budget: '$3.5B' },
        { type: 'National Forests', count: '154', area: '193M acres', visitors: '145M/yr', budget: '$5.8B' },
        { type: 'Wildlife Refuges', count: '568', area: '150M acres', visitors: '62M/yr', budget: '$1.6B' },
        { type: 'Marine Sanctuaries', count: '15', area: '620K sq mi', visitors: '38M/yr', budget: '$56M' },
        { type: 'Wilderness Areas', count: '803', area: '111M acres', visitors: '15M/yr', budget: 'Included' },
        { type: 'State Parks', count: '10,234', area: '18M acres', visitors: '807M/yr', budget: '$8.2B' }
    ];

    const renewablePotentialTable = [
        { source: 'Solar (Utility)', potential: '10,000+ GW', installed: '97 GW', utilization: '0.97%', growth: '+23.6%' },
        { source: 'Solar (Rooftop)', potential: '1,100 GW', installed: '39 GW', utilization: '3.5%', growth: '+18%' },
        { source: 'Onshore Wind', potential: '10,500 GW', installed: '141 GW', utilization: '1.3%', growth: '+14.2%' },
        { source: 'Offshore Wind', potential: '2,000 GW', installed: '42 MW', utilization: '0.002%', growth: '+120%' },
        { source: 'Geothermal', potential: '30 GW', installed: '3.7 GW', utilization: '12.3%', growth: '+2.5%' },
        { source: 'Hydropower', potential: '376 GW', installed: '80 GW', utilization: '21.3%', growth: '+1.2%' }
    ];

    const runAnalysis = async () => {
        setLoading(true);
        const countriesContext = selectedCountries.length > 0 ? selectedCountries.join(', ') : 'global overview';
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate comprehensive geospatial infrastructure analysis for ${countriesContext} with key insights, trends, and recommendations. Include data about transportation networks, energy systems, digital infrastructure, and strategic resources specific to these regions.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        summary: { type: "string" },
                        keyInsights: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        riskFactors: { type: "array", items: { type: "string" } }
                    }
                }
            });
            setAnalysisData(response);
        } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysisData({
                summary: `Comprehensive infrastructure analysis for ${countriesContext} reveals significant assets with opportunities for modernization and sustainability improvements.`,
                keyInsights: [
                    `Transportation networks in ${countriesContext} require major upgrades over the next decade`,
                    'Renewable energy capacity growing at 15% annually',
                    'Digital infrastructure investments accelerating',
                    'Water infrastructure modernization needed'
                ],
                recommendations: [
                    'Prioritize critical infrastructure maintenance',
                    'Accelerate renewable energy grid integration',
                    'Expand broadband coverage',
                    'Modernize water treatment facilities'
                ],
                riskFactors: [
                    'Aging infrastructure in urban areas',
                    'Cybersecurity vulnerabilities',
                    'Climate change impact on infrastructure'
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <Globe className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Geospatial Intelligence</h1>
                                <p className="text-white/80">Infrastructure, Resources & National Assets Analytics</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <MultiSelectDropdown
                                options={COUNTRIES}
                                selected={selectedCountries}
                                onChange={setSelectedCountries}
                                placeholder="Select Countries"
                                icon={Globe}
                            />
                        </div>
                    </div>
                </div>

                {/* Instruction or Selected Countries Display */}
                {selectedCountries.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Countries to Begin</h3>
                        <p className="text-sm text-gray-500">Choose one or more countries from the dropdown above to view infrastructure and resource data</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-semibold">Analyzing:</span> {selectedCountries.join(', ')}
                            </p>
                        </div>

                        {/* Category Titles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${activeCategory === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                                            <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Analysis Results */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && analysisData && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                        <h3 className="font-bold text-gray-900 mb-3">AI Analysis Summary - {selectedCountries.join(', ')}</h3>
                        <p className="text-gray-700 mb-4">{analysisData.summary}</p>
                        <div className="bg-white rounded-xl p-4">
                            <h4 className="font-semibold text-emerald-700 mb-2">Key Insights</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {analysisData.keyInsights?.map((item, i) => (
                                    <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {dataLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600">Loading data for {selectedCountries.join(', ')}...</p>
                    </div>
                )}

                {/* Main Dashboard */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Infrastructure Trend */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Development Index - {selectedCountries.join(', ')}</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dynamicData.trendData || trendData}>
                                    <defs>
                                        <linearGradient id="infraGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="digitalGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="period" fontSize={11} />
                                    <YAxis fontSize={11} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="infrastructure" name="Infrastructure" stroke="#3B82F6" fill="url(#infraGrad)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="energy" name="Energy" stroke="#10B981" fill="url(#energyGrad)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="digital" name="Digital" stroke="#8B5CF6" fill="url(#digitalGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Country Comparison */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Country Comparison</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dynamicData.countryComparison || countryComparison}>
                                    <XAxis dataKey="country" fontSize={10} />
                                    <YAxis fontSize={10} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="infrastructure" name="Infrastructure" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="resources" name="Resources" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="digital" name="Digital" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>}

                {/* CORE INFRASTRUCTURE */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'infrastructure') && (
                    <CategorySection
                        title={`Core Infrastructure - ${selectedCountries.join(', ')}`}
                        description="Transportation, energy, water, telecommunications, and defense systems"
                        icon={Building2}
                        color="#3B82F6"
                        stats={[]}
                    >
                        <Tabs defaultValue="transportation" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="transportation" className="gap-2"><Train className="w-4 h-4" /> Transportation</TabsTrigger>
                                <TabsTrigger value="energy" className="gap-2"><Zap className="w-4 h-4" /> Energy</TabsTrigger>
                                <TabsTrigger value="telecom" className="gap-2"><Wifi className="w-4 h-4" /> Telecom</TabsTrigger>
                                <TabsTrigger value="water" className="gap-2"><Droplets className="w-4 h-4" /> Water</TabsTrigger>
                                <TabsTrigger value="public" className="gap-2"><Building2 className="w-4 h-4" /> Public Facilities</TabsTrigger>
                                <TabsTrigger value="defense" className="gap-2"><Shield className="w-4 h-4" /> Defense</TabsTrigger>
                            </TabsList>

                            <TabsContent value="transportation">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.transportStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Train, Train, Plane, Anchor][i]} color={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Transportation Infrastructure - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'condition', label: 'Condition', render: (val) => (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : val === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{val}</span>
                                        )},
                                        { key: 'investment', label: 'Investment' }
                                    ]}
                                    data={dynamicData?.transportData || []}
                                    maxRows={10}
                                />
                            </TabsContent>

                            <TabsContent value="energy">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.energyStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Zap, Zap, Sun, Fuel][i]} color={['#F59E0B', '#EF4444', '#10B981', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h4 className="font-semibold text-gray-900 mb-4">Energy Mix</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={energyTable} layout="vertical">
                                                    <XAxis type="number" fontSize={10} />
                                                    <YAxis type="category" dataKey="source" fontSize={10} width={80} />
                                                    <Tooltip />
                                                    <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                                                        {energyTable.map((entry, index) => (
                                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <DataTable
                                        title={`Power Generation - ${selectedCountries.join(', ')}`}
                                        columns={[
                                            { key: 'source', label: 'Source' },
                                            { key: 'capacity', label: 'Capacity' },
                                            { key: 'share', label: 'Share' },
                                            { key: 'plants', label: 'Plants' },
                                            { key: 'growth', label: 'Growth', render: (val) => (
                                                <span className={val?.startsWith?.('+') ? 'text-emerald-600' : 'text-red-600'}>{val}</span>
                                            )}
                                        ]}
                                        data={dynamicData?.energyData || []}
                                    />
                                </div>
                                <DataTable
                                    title={`Energy Resources - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'resource', label: 'Resource' },
                                        { key: 'reserves', label: 'Reserves' },
                                        { key: 'production', label: 'Production' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'rank', label: 'Rank' }
                                    ]}
                                    data={dynamicData?.resourcesData || []}
                                />
                            </TabsContent>

                            <TabsContent value="telecom">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.telecomStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Radio, Network, Server, Globe][i]} color={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Telecommunications - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'coverage', label: 'Coverage' },
                                        { key: 'investment', label: 'Investment' },
                                        { key: 'growth', label: 'Growth', render: (val) => (
                                            <span className="text-emerald-600">{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.telecomData || []}
                                />
                            </TabsContent>

                            <TabsContent value="water">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.waterStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={Droplets} color={['#06B6D4', '#3B82F6', '#10B981', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Water Infrastructure - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'condition', label: 'Condition', render: (val) => (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : val === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{val}</span>
                                        )},
                                        { key: 'age', label: 'Avg Age' }
                                    ]}
                                    data={dynamicData?.waterData || []}
                                />
                            </TabsContent>

                            <TabsContent value="public">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.publicFacilitiesStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[GraduationCap, Stethoscope, Shield, ShieldCheck][i]} color={['#EC4899', '#EF4444', '#F59E0B', '#3B82F6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Public Facilities - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'condition', label: 'Condition', render: (val) => (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : val === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{val}</span>
                                        )},
                                        { key: 'funding', label: 'Annual Funding' }
                                    ]}
                                    data={dynamicData?.publicFacilitiesData || []}/>
                            </TabsContent>

                            <TabsContent value="defense">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.defenseStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Shield, Anchor, Plane, Shield][i]} color={['#EF4444', '#3B82F6', '#8B5CF6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Defense Infrastructure - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'personnel', label: 'Personnel' },
                                        { key: 'status', label: 'Status', render: (val) => (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{val}</span>
                                        )},
                                        { key: 'budget', label: 'Budget' }
                                    ]}
                                    data={dynamicData?.defenseData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* NATURAL & STRATEGIC RESOURCES */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'resources') && (
                    <CategorySection
                        title={`Natural & Strategic Resources - ${selectedCountries.join(', ')}`}
                        description="Energy reserves, minerals, agricultural resources, human capital, and biodiversity"
                        icon={Fuel}
                        color="#10B981"
                        stats={[]}
                    >
                        <Tabs defaultValue="energy" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="energy" className="gap-2"><Fuel className="w-4 h-4" /> Energy Resources</TabsTrigger>
                                <TabsTrigger value="minerals" className="gap-2"><Database className="w-4 h-4" /> Minerals</TabsTrigger>
                                <TabsTrigger value="agricultural" className="gap-2"><Leaf className="w-4 h-4" /> Agricultural</TabsTrigger>
                                <TabsTrigger value="human" className="gap-2"><Users className="w-4 h-4" /> Human Capital</TabsTrigger>
                            </TabsList>

                            <TabsContent value="energy">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.resourceStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={Fuel} color={['#F59E0B', '#3B82F6', '#6B7280', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Energy Resources - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'resource', label: 'Resource' },
                                        { key: 'reserves', label: 'Reserves' },
                                        { key: 'production', label: 'Production' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'rank', label: 'Rank' }
                                    ]}
                                    data={dynamicData?.resourcesData || []}
                                />
                            </TabsContent>

                            <TabsContent value="minerals">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.mineralStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Database, Database, Coins, Database][i]} color={['#EF4444', '#F59E0B', '#F59E0B', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Mineral Resources - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'mineral', label: 'Mineral' },
                                        { key: 'reserves', label: 'Reserves' },
                                        { key: 'production', label: 'Annual Production' },
                                        { key: 'globalRank', label: 'Global Rank' },
                                        { key: 'value', label: 'Annual Value' }
                                    ]}
                                    data={dynamicData?.mineralsData || []}
                                />
                            </TabsContent>

                            <TabsContent value="agricultural">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.agriculturalStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Leaf, TreePine, Droplets, Anchor][i]} color={['#10B981', '#059669', '#06B6D4', '#3B82F6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Agricultural & Natural Resources - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'resource', label: 'Resource' },
                                        { key: 'amount', label: 'Amount' },
                                        { key: 'utilization', label: 'Utilization' },
                                        { key: 'output', label: 'Annual Output' },
                                        { key: 'globalRank', label: 'Global Rank' }
                                    ]}
                                    data={dynamicData?.agriculturalData || []}/>
                            </TabsContent>

                            <TabsContent value="human">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.humanCapitalStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Users, Briefcase, GraduationCap, Award][i]} color={['#EC4899', '#3B82F6', '#8B5CF6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Human Capital - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'metric', label: 'Metric' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'growth', label: 'Growth' },
                                        { key: 'globalRank', label: 'Global Rank' }
                                    ]}
                                    data={dynamicData?.humanCapitalData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* NATIONAL ASSETS */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'assets') && (
                    <CategorySection
                        title={`National Assets - ${selectedCountries.join(', ')}`}
                        description="Financial, industrial, cultural, intellectual, strategic reserves, and digital assets"
                        icon={Landmark}
                        color="#F59E0B"
                        stats={[]}
                    >
                        <Tabs defaultValue="financial" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="financial" className="gap-2"><Banknote className="w-4 h-4" /> Financial</TabsTrigger>
                                <TabsTrigger value="industrial" className="gap-2"><Factory className="w-4 h-4" /> Industrial</TabsTrigger>
                                <TabsTrigger value="intellectual" className="gap-2"><Award className="w-4 h-4" /> Intellectual</TabsTrigger>
                                <TabsTrigger value="strategic" className="gap-2"><Shield className="w-4 h-4" /> Strategic Reserves</TabsTrigger>
                                <TabsTrigger value="digital" className="gap-2"><Server className="w-4 h-4" /> Digital Assets</TabsTrigger>
                            </TabsList>

                            <TabsContent value="financial">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.financialStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Coins, Banknote, Landmark, Landmark][i]} color={['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Financial Assets - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'asset', label: 'Asset' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'change', label: 'Change', render: (val) => (
                                            <span className={val?.startsWith?.('+') ? 'text-emerald-600' : 'text-red-600'}>{val}</span>
                                        )},
                                        { key: 'type', label: 'Type' }
                                    ]}
                                    data={dynamicData?.financialData || []}
                                />
                            </TabsContent>

                            <TabsContent value="industrial">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.industrialStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Factory, Cpu, Building2, Lightbulb][i]} color={['#EF4444', '#8B5CF6', '#3B82F6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Industrial Assets - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'sector', label: 'Sector' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'employment', label: 'Employment' },
                                        { key: 'output', label: 'Output' },
                                        { key: 'growth', label: 'Growth', render: (val) => (
                                            <span className="text-emerald-600">{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.industrialData || []}
                                />
                            </TabsContent>

                            <TabsContent value="intellectual">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.intellectualStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Award, GraduationCap, Award, Lightbulb][i]} color={['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Intellectual Assets - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'category', label: 'Category' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'annual', label: 'Annual' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'globalShare', label: 'Global Share' }
                                    ]}
                                    data={dynamicData?.intellectualData || []}/>
                            </TabsContent>

                            <TabsContent value="strategic">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.strategicStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Fuel, Shield, Leaf, Stethoscope][i]} color={['#F59E0B', '#EF4444', '#10B981', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Strategic Reserves - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'reserve', label: 'Reserve' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'current', label: 'Current Level' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'days', label: 'Coverage' }
                                    ]}
                                    data={dynamicData?.strategicReservesData || []}/>
                            </TabsContent>

                            <TabsContent value="digital">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.digitalStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Server, Globe, Cpu, Lock][i]} color={['#8B5CF6', '#3B82F6', '#10B981', '#EF4444'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Digital Assets - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'asset', label: 'Asset' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'investment', label: 'Investment' },
                                        { key: 'growth', label: 'Growth', render: (val) => (
                                            <span className="text-emerald-600">{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.digitalAssetsData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* GOVERNANCE & INSTITUTIONS */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'governance') && (
                    <CategorySection
                        title={`Governance & Institutions - ${selectedCountries.join(', ')}`}
                        description="Legal system, political institutions, law enforcement, and public administration"
                        icon={Scale}
                        color="#8B5CF6"
                        stats={[]}
                    >
                        <Tabs defaultValue="legal" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="legal" className="gap-2"><Scale className="w-4 h-4" /> Legal System</TabsTrigger>
                                <TabsTrigger value="law" className="gap-2"><ShieldCheck className="w-4 h-4" /> Law Enforcement</TabsTrigger>
                            </TabsList>

                            <TabsContent value="legal">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.governanceStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Scale, Scale, Building2, ShieldCheck][i]} color={['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Government Institutions - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'institution', label: 'Institution' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'personnel', label: 'Personnel' },
                                        { key: 'budget', label: 'Budget' },
                                        { key: 'efficiency', label: 'Efficiency' }
                                    ]}
                                    data={dynamicData?.governanceData || []}/>
                            </TabsContent>

                            <TabsContent value="law">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.lawEnforcementStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[ShieldCheck, ShieldCheck, Shield, Lock][i]} color={['#EF4444', '#3B82F6', '#10B981', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Law Enforcement - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'agency', label: 'Agency' },
                                        { key: 'personnel', label: 'Personnel' },
                                        { key: 'budget', label: 'Budget' },
                                        { key: 'jurisdiction', label: 'Jurisdiction' },
                                        { key: 'clearRate', label: 'Clear Rate' }
                                    ]}
                                    data={dynamicData?.lawEnforcementData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* ECONOMIC SYSTEMS */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'economic') && (
                    <CategorySection
                        title={`Economic Systems - ${selectedCountries.join(', ')}`}
                        description="Financial infrastructure, trade networks, industrial base, and labor markets"
                        icon={Briefcase}
                        color="#EF4444"
                        stats={[]}
                    >
                        <Tabs defaultValue="financial" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="financial" className="gap-2"><Banknote className="w-4 h-4" /> Financial Infra</TabsTrigger>
                                <TabsTrigger value="trade" className="gap-2"><Ship className="w-4 h-4" /> Trade Networks</TabsTrigger>
                                <TabsTrigger value="labor" className="gap-2"><Users className="w-4 h-4" /> Labor Market</TabsTrigger>
                            </TabsList>

                            <TabsContent value="financial">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.financialInfraStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Landmark, BarChart3, Shield, TrendingUp][i]} color={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Financial Infrastructure - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'assets', label: 'Assets/Volume' },
                                        { key: 'coverage', label: 'Coverage' },
                                        { key: 'rating', label: 'Rating' }
                                    ]}
                                    data={dynamicData?.financialInfraData || []}/>
                            </TabsContent>

                            <TabsContent value="trade">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.tradeStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Anchor, Ship, Globe, Network][i]} color={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Trade Networks - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'network', label: 'Network' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'volume', label: 'Volume' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'globalRank', label: 'Global Rank' }
                                    ]}
                                    data={dynamicData?.tradeNetworksData || []}/>
                            </TabsContent>

                            <TabsContent value="labor">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.laborStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Users, Cpu, Briefcase, Users][i]} color={['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Labor Market - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'metric', label: 'Metric' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'change', label: 'Change' },
                                        { key: 'rate', label: 'Rate/Share' }
                                    ]}
                                    data={dynamicData?.laborMarketData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* SOCIAL & HUMAN DEVELOPMENT */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'social') && (
                    <CategorySection
                        title={`Social & Human Development - ${selectedCountries.join(', ')}`}
                        description="Education systems, healthcare, social safety nets, and cultural institutions"
                        icon={Users}
                        color="#EC4899"
                        stats={[]}
                    >
                        <Tabs defaultValue="education" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="education" className="gap-2"><GraduationCap className="w-4 h-4" /> Education</TabsTrigger>
                                <TabsTrigger value="healthcare" className="gap-2"><Stethoscope className="w-4 h-4" /> Healthcare</TabsTrigger>
                                <TabsTrigger value="safety" className="gap-2"><Shield className="w-4 h-4" /> Social Safety Nets</TabsTrigger>
                            </TabsList>

                            <TabsContent value="education">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.educationStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[GraduationCap, BookOpen, GraduationCap, Banknote][i]} color={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Education Systems - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'level', label: 'Level' },
                                        { key: 'institutions', label: 'Institutions' },
                                        { key: 'enrollment', label: 'Enrollment' },
                                        { key: 'teachers', label: 'Teachers' },
                                        { key: 'spending', label: 'Spending' }
                                    ]}
                                    data={dynamicData?.educationData || []}
                                />
                            </TabsContent>

                            <TabsContent value="healthcare">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.healthcareStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Stethoscope, Heart, Stethoscope, Banknote][i]} color={['#EF4444', '#EC4899', '#10B981', '#3B82F6'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Healthcare Systems - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'facility', label: 'Facility Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'staff', label: 'Staff' },
                                        { key: 'spending', label: 'Spending' }
                                    ]}
                                    data={dynamicData?.healthcareData || []}
                                />
                            </TabsContent>

                            <TabsContent value="safety">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.socialSafetyStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Users, Heart, Heart, Leaf][i]} color={['#8B5CF6', '#EF4444', '#10B981', '#F59E0B'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Social Safety Net - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'program', label: 'Program' },
                                        { key: 'beneficiaries', label: 'Beneficiaries' },
                                        { key: 'annual', label: 'Annual Budget' },
                                        { key: 'coverage', label: 'Coverage' },
                                        { key: 'fundStatus', label: 'Fund Status' }
                                    ]}
                                    data={dynamicData?.socialSafetyData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* GLOBAL & STRATEGIC POSITIONING */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'global') && (
                    <CategorySection
                        title={`Global & Strategic Positioning - ${selectedCountries.join(', ')}`}
                        description="Diplomatic networks, geopolitical assets, soft power, and cyber infrastructure"
                        icon={Globe}
                        color="#06B6D4"
                        stats={[]}
                    >
                        <Tabs defaultValue="diplomatic" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="diplomatic" className="gap-2"><Globe className="w-4 h-4" /> Diplomatic</TabsTrigger>
                                <TabsTrigger value="geopolitical" className="gap-2"><Map className="w-4 h-4" /> Geopolitical</TabsTrigger>
                                <TabsTrigger value="softpower" className="gap-2"><Award className="w-4 h-4" /> Soft Power</TabsTrigger>
                            </TabsList>

                            <TabsContent value="diplomatic">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.diplomaticStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Building2, Building2, Shield, Briefcase][i]} color={['#06B6D4', '#3B82F6', '#EF4444', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Diplomatic Networks - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'personnel', label: 'Personnel' },
                                        { key: 'regions', label: 'Regions' },
                                        { key: 'budget', label: 'Budget' }
                                    ]}
                                    data={dynamicData?.diplomaticData || []}/>
                            </TabsContent>

                            <TabsContent value="geopolitical">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.geopoliticalStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Anchor, Plane, Globe, Ship][i]} color={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Geopolitical Assets - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'asset', label: 'Asset' },
                                        { key: 'size', label: 'Size/Count' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'rank', label: 'Global Rank' },
                                        { key: 'control', label: 'Control' }
                                    ]}
                                    data={dynamicData?.geopoliticalData || []}/>
                            </TabsContent>

                            <TabsContent value="softpower">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.softPowerStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Award, GraduationCap, Radio, Globe][i]} color={['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Soft Power - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'category', label: 'Category' },
                                        { key: 'value', label: 'Value' },
                                        { key: 'reach', label: 'Reach' },
                                        { key: 'rank', label: 'Global Rank' },
                                        { key: 'growth', label: 'Growth', render: (val) => (
                                            <span className="text-emerald-600">{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.softPowerData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}

                {/* ENVIRONMENTAL & SUSTAINABILITY */}
                {selectedCountries.length > 0 && dynamicData && !dataLoading && (activeCategory === 'all' || activeCategory === 'environment') && (
                    <CategorySection
                        title={`Environmental & Sustainability - ${selectedCountries.join(', ')}`}
                        description="Climate resilience, protected areas, and renewable energy potential"
                        icon={Leaf}
                        color="#84CC16"
                        stats={[]}
                    >
                        <Tabs defaultValue="climate" className="mt-4">
                            <TabsList className="mb-4 flex-wrap">
                                <TabsTrigger value="climate" className="gap-2"><Shield className="w-4 h-4" /> Climate Resilience</TabsTrigger>
                                <TabsTrigger value="protected" className="gap-2"><TreePine className="w-4 h-4" /> Protected Areas</TabsTrigger>
                                <TabsTrigger value="renewable" className="gap-2"><Sun className="w-4 h-4" /> Renewable Potential</TabsTrigger>
                            </TabsList>

                            <TabsContent value="climate">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.climateStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Droplets, Zap, Shield, Shield][i]} color={['#06B6D4', '#EF4444', '#3B82F6', '#10B981'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Climate Resilience - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'system', label: 'System' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'capacity', label: 'Capacity' },
                                        { key: 'investment', label: 'Investment' },
                                        { key: 'condition', label: 'Condition', render: (val) => (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : val === 'Good' ? 'bg-blue-100 text-blue-700' : val === 'Strained' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.climateResilienceData || []}/>
                            </TabsContent>

                            <TabsContent value="protected">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.protectedStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[TreePine, TreePine, Leaf, Anchor][i]} color={['#84CC16', '#10B981', '#059669', '#06B6D4'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Protected Areas - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'type', label: 'Type' },
                                        { key: 'count', label: 'Count' },
                                        { key: 'area', label: 'Area' },
                                        { key: 'visitors', label: 'Annual Visitors' },
                                        { key: 'budget', label: 'Budget' }
                                    ]}
                                    data={dynamicData?.protectedAreasData || []}/>
                            </TabsContent>

                            <TabsContent value="renewable">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {(dynamicData?.renewableStats || []).map((stat, i) => (
                                        <AssetCard key={i} title={stat.title} value={stat.value} unit={stat.unit} icon={[Sun, Wind, Droplets, Zap][i]} color={['#F59E0B', '#3B82F6', '#06B6D4', '#EF4444'][i]} />
                                    ))}
                                </div>
                                <DataTable
                                    title={`Renewable Energy - ${selectedCountries.join(', ')}`}
                                    columns={[
                                        { key: 'source', label: 'Source' },
                                        { key: 'potential', label: 'Potential' },
                                        { key: 'installed', label: 'Installed' },
                                        { key: 'utilization', label: 'Utilization' },
                                        { key: 'growth', label: 'Growth', render: (val) => (
                                            <span className="text-emerald-600">{val}</span>
                                        )}
                                    ]}
                                    data={dynamicData?.renewablePotentialData || []}/>
                            </TabsContent>
                        </Tabs>
                    </CategorySection>
                )}
            </div>
        </div>
    );
}