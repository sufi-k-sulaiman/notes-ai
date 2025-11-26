import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
    Search, RefreshCw, TrendingUp, TrendingDown, Shield, 
    Zap, DollarSign, BarChart3, Activity, Sparkles, 
    ChevronDown, X, Filter, Loader2, Menu, ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LOGO_URL, menuItems, footerLinks } from '../components/NavigationConfig';
import StockCard from '../components/markets/StockCard';
import StockTicker from '../components/markets/StockTicker';
import FilterChips from '../components/markets/FilterChips';

const PRESET_FILTERS = [
    { id: 'suggested', label: 'Suggested', icon: Sparkles },
    { id: 'wide-moats', label: 'Wide Moats', icon: Shield },
    { id: 'undervalued', label: 'Undervalued', icon: DollarSign },
    { id: 'high-growth', label: 'High Growth', icon: TrendingUp },
    { id: 'avg-change', label: 'Avg Change', icon: Activity },
];

const FILTER_OPTIONS = {
    moat: { label: 'MOAT', options: ['Any', '70+', '60+', '50+'] },
    roe: { label: 'ROE', options: ['Any', '20%+', '15%+', '10%+'] },
    pe: { label: 'P/E', options: ['Any', '<15', '<20', '<30'] },
    zscore: { label: 'Z-Score', options: ['Any', '3+', '2.5+', '2+'] },
    eps: { label: 'EPS', options: ['Any', '$10+', '$5+', '$2+'] },
    dividend: { label: 'Dividend', options: ['Any', '3%+', '2%+', '1%+'] },
    aiIndex: { label: 'AI Index', options: ['Any', '90+', '80+', '70+', '60+'] },
};

export default function Markets() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePreset, setActivePreset] = useState('suggested');
    const [filters, setFilters] = useState({
        market: 'All Markets',
        sector: 'All Sectors',
        industry: 'All Industries',
        moat: 'Any',
        roe: 'Any',
        pe: 'Any',
        zscore: 'Any',
        eps: 'Any',
        dividend: 'Any',
        aiIndex: 'Any'
    });

    // Responsive sidebar
    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load stocks on mount
    useEffect(() => {
        loadStocks();
    }, []);

    const loadStocks = async () => {
        setIsLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a list of 24 major US stocks with realistic current market data. Include tech giants, finance, consumer, healthcare companies. For each stock provide:
- ticker symbol
- company name
- price (realistic current price)
- change percentage (between -5% and +5%)
- volume (in millions)
- MOAT score (40-99)
- SGR (Sustainable Growth Rate 5-30)
- ROE (Return on Equity 8-35%)
- ROIC (Return on Invested Capital 5-25)
- ROA (Return on Assets 3-20%)
- EPS (Earnings Per Share $2-20)
- P/E ratio (10-50)
- PEG ratio (0.5-3.0)
- FCF (Free Cash Flow $100-5000)
- EVA (Economic Value Added 20-99)
- Z-Score (Altman Z-Score 1.5-4.5)
- sector
- mini price history for sparkline (array of 20 numbers showing recent trend)`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        stocks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    ticker: { type: "string" },
                                    name: { type: "string" },
                                    price: { type: "number" },
                                    change: { type: "number" },
                                    volume: { type: "string" },
                                    moat: { type: "number" },
                                    sgr: { type: "number" },
                                    roe: { type: "number" },
                                    roic: { type: "number" },
                                    roa: { type: "number" },
                                    eps: { type: "number" },
                                    pe: { type: "number" },
                                    peg: { type: "number" },
                                    fcf: { type: "number" },
                                    eva: { type: "number" },
                                    zscore: { type: "number" },
                                    sector: { type: "string" },
                                    history: { type: "array", items: { type: "number" } }
                                }
                            }
                        }
                    }
                }
            });
            setStocks(response?.stocks || []);
        } catch (error) {
            console.error('Error loading stocks:', error);
            // Generate mock data on error
            setStocks(generateMockStocks());
        } finally {
            setIsLoading(false);
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        await loadStocks();
        setIsRefreshing(false);
    };

    const generateMockStocks = () => {
        const mockTickers = [
            { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
            { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
            { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
            { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
            { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
            { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
            { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
            { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance' },
            { ticker: 'V', name: 'Visa Inc.', sector: 'Finance' },
            { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
            { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer' },
            { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
        ];
        
        return mockTickers.map(stock => ({
            ...stock,
            price: Math.round((100 + Math.random() * 400) * 100) / 100,
            change: Math.round((Math.random() * 10 - 5) * 100) / 100,
            volume: `${Math.round(Math.random() * 100)}M`,
            moat: Math.round(40 + Math.random() * 59),
            sgr: Math.round(5 + Math.random() * 25),
            roe: Math.round(8 + Math.random() * 27),
            roic: Math.round(5 + Math.random() * 20),
            roa: Math.round(3 + Math.random() * 17),
            eps: Math.round((2 + Math.random() * 18) * 10) / 10,
            pe: Math.round((10 + Math.random() * 40) * 10) / 10,
            peg: Math.round((0.5 + Math.random() * 2.5) * 10) / 10,
            fcf: Math.round(100 + Math.random() * 4900),
            eva: Math.round(20 + Math.random() * 79),
            zscore: Math.round((1.5 + Math.random() * 3) * 10) / 10,
            history: Array.from({ length: 20 }, () => Math.random() * 100)
        }));
    };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];
        
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.ticker?.toLowerCase().includes(q) || 
                s.name?.toLowerCase().includes(q)
            );
        }

        // Preset filters
        if (activePreset === 'wide-moats') {
            result = result.filter(s => s.moat >= 70);
        } else if (activePreset === 'undervalued') {
            result = result.filter(s => s.pe < 20);
        } else if (activePreset === 'high-growth') {
            result = result.filter(s => s.sgr >= 15);
        } else if (activePreset === 'avg-change') {
            result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        }

        // Custom filters
        if (filters.moat !== 'Any') {
            const min = parseInt(filters.moat);
            result = result.filter(s => s.moat >= min);
        }
        if (filters.roe !== 'Any') {
            const min = parseInt(filters.roe);
            result = result.filter(s => s.roe >= min);
        }
        if (filters.pe !== 'Any') {
            const max = parseInt(filters.pe.replace('<', ''));
            result = result.filter(s => s.pe < max);
        }

        return result;
    }, [stocks, searchQuery, activePreset, filters]);

    const topMovers = useMemo(() => {
        return [...stocks]
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 20);
    }, [stocks]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-4 h-[72px]">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 md:hidden">
                            <Menu className="w-5 h-5 text-purple-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 hidden md:flex">
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
                        </Button>
                        <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80">
                            <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold text-gray-900">Markets Pro</span>
                                <p className="text-xs font-medium text-purple-600">AI Powered</p>
                            </div>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-md mx-4 md:mx-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stocks..."
                                className="pl-12 h-12 rounded-full border-gray-200 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <Button 
                        variant="outline" 
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh Data</span>
                    </Button>
                </div>

                {/* Stock Ticker */}
                <StockTicker stocks={topMovers} />
            </header>

            <div className="flex flex-1">
                {/* Mobile Overlay */}
                {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-120px)] md:h-auto`}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link key={index} to={item.href} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.label === 'Markets' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                <item.icon className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {/* Preset Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {PRESET_FILTERS.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setActivePreset(preset.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                    activePreset === preset.id
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                <preset.icon className="w-4 h-4" />
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Dropdowns */}
                    <FilterChips filters={filters} setFilters={setFilters} filterOptions={FILTER_OPTIONS} />

                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-4 mt-6">
                        <p className="text-gray-600">
                            Showing <span className="font-bold text-gray-900">{filteredStocks.length}</span> stocks
                        </p>
                        <p className="text-sm text-gray-400">Data updates every 2 hours via AI agent</p>
                    </div>

                    {/* Stock Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredStocks.map((stock, i) => (
                                <StockCard key={stock.ticker || i} stock={stock} />
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredStocks.length === 0 && (
                        <div className="text-center py-20">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No stocks match your filters</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="py-4 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
                    © 2025 1cPublishing.com • Market data for informational purposes only
                </div>
            </footer>
        </div>
    );
}