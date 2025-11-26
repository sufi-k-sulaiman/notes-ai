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
import { LOGO_URL, menuItems, footerLinks } from '../components/NavigationConfig';
import StockCard from '../components/markets/StockCard';
import StockTicker from '../components/markets/StockTicker';
import FilterChips from '../components/markets/FilterChips';
import StockDetailModal from '../components/markets/StockDetailModal';

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

// Stock universe - 300 stocks enriched with live AI data
const STOCK_UNIVERSE = [
    // Tech Giants
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'ADBE',
    'CRM', 'CSCO', 'ACN', 'IBM', 'INTC', 'AMD', 'QCOM', 'TXN', 'NOW', 'INTU',
    'AMAT', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL', 'ADI', 'NXPI', 'MCHP',
    // Cloud & Software
    'SNOW', 'PLTR', 'CRWD', 'NET', 'DDOG', 'ZS', 'OKTA', 'MDB', 'TEAM', 'WDAY',
    'PANW', 'FTNT', 'SPLK', 'ZM', 'DOCU', 'TWLO', 'SQ', 'SHOP', 'SPOT', 'UBER',
    // Finance
    'BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'C', 'SCHW',
    'BLK', 'AXP', 'PYPL', 'COF', 'USB', 'PNC', 'TFC', 'SPGI', 'MCO', 'ICE',
    'CME', 'MSCI', 'FIS', 'FISV', 'GPN', 'ADP', 'PAYX', 'FI', 'COIN', 'HOOD',
    // Healthcare
    'JNJ', 'UNH', 'PFE', 'LLY', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY',
    'AMGN', 'GILD', 'REGN', 'VRTX', 'MRNA', 'BIIB', 'ISRG', 'MDT', 'SYK', 'BSX',
    'ZBH', 'EW', 'DXCM', 'ILMN', 'A', 'IQV', 'CI', 'HUM', 'CVS', 'MCK',
    // Consumer
    'WMT', 'PG', 'HD', 'COST', 'KO', 'PEP', 'MCD', 'NKE', 'SBUX', 'LOW',
    'TGT', 'TJX', 'ROST', 'DG', 'DLTR', 'ORLY', 'AZO', 'BKNG', 'ABNB', 'MAR',
    'HLT', 'YUM', 'DPZ', 'CMG', 'LULU', 'GPS', 'ANF', 'DECK', 'CROX', 'BIRD',
    // Media & Entertainment
    'DIS', 'NFLX', 'CMCSA', 'WBD', 'PARA', 'FOX', 'RBLX', 'TTWO', 'EA', 'ATVI',
    // Telecom
    'T', 'VZ', 'TMUS', 'CHTR', 'LUMN',
    // Energy
    'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'PSX', 'VLO', 'MPC', 'OXY', 'HAL',
    'DVN', 'PXD', 'FANG', 'HES', 'BKR', 'KMI', 'WMB', 'OKE', 'ET', 'EPD',
    // Industrials
    'BA', 'CAT', 'GE', 'MMM', 'UPS', 'DE', 'LMT', 'GD', 'NOC', 'RTX',
    'HON', 'UNP', 'CSX', 'NSC', 'FDX', 'WM', 'RSG', 'EMR', 'ETN', 'ITW',
    'PH', 'ROK', 'DOV', 'IR', 'XYL', 'SWK', 'FAST', 'GWW', 'CTAS',
    // Materials
    'LIN', 'APD', 'SHW', 'ECL', 'DD', 'NEM', 'FCX', 'NUE', 'VMC', 'MLM',
    // Real Estate
    'AMT', 'PLD', 'CCI', 'EQIX', 'SPG', 'PSA', 'DLR', 'O', 'WELL', 'AVB',
    // Utilities
    'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'WEC',
    // Additional 100 stocks
    'ANET', 'ANSS', 'APH', 'ARE', 'ATO', 'AWK', 'AZN', 'BALL', 'BAX', 'BDX',
    'BIO', 'BK', 'BKNG', 'BLL', 'BR', 'BRO', 'BSY', 'BWA', 'CAG', 'CAH',
    'CARR', 'CBOE', 'CBRE', 'CDW', 'CE', 'CERN', 'CF', 'CFG', 'CHD', 'CHRW',
    'CINF', 'CL', 'CLX', 'CMS', 'CNC', 'CNP', 'CPRT', 'CRL', 'CTLT', 'CTSH',
    'CTVA', 'CZR', 'DFS', 'DGX', 'DLR', 'DLTR', 'DOW', 'DPZ', 'DRE', 'DRI',
    'DTE', 'DVA', 'DXC', 'EBAY', 'ECL', 'ED', 'EFX', 'EIX', 'EL', 'EMN',
    'ENPH', 'EOG', 'EPAM', 'EQR', 'ES', 'ESS', 'ETSY', 'EVRG', 'EXR', 'F',
    'FANG', 'FAST', 'FBHS', 'FCX', 'FDS', 'FE', 'FFIV', 'FIS', 'FITB', 'FLT',
    'FMC', 'FOX', 'FOXA', 'FRC', 'FRT', 'FTNT', 'FTV', 'GD', 'GE', 'GILD',
    'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GPC', 'GPN', 'GRMN', 'GWW', 'HAL'
];

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
    const [selectedStock, setSelectedStock] = useState(null);
    const [showStockModal, setShowStockModal] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const STOCKS_PER_PAGE = 25;

    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadStocks(0);
    }, []);

    const loadStocks = async (page) => {
        const isFirstPage = page === 0;
        if (isFirstPage) {
            setIsLoading(true);
            setStocks([]);
        } else {
            setIsLoadingMore(true);
        }
        setLoadingProgress(0);
        
        try {
            const startIdx = page * STOCKS_PER_PAGE;
            const batch = STOCK_UNIVERSE.slice(startIdx, startIdx + STOCKS_PER_PAGE);
            
            if (batch.length === 0) {
                setHasMore(false);
                return;
            }

            setLoadingProgress(50);
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a financial data API. Return CURRENT real market data for these stocks: ${batch.join(', ')}.
                    
For EACH stock provide accurate current data:
- ticker: stock symbol
- name: full company name  
- price: current stock price (use real approximate prices as of late 2024)
- change: today's % change (realistic between -5% and +5%)
- volume: trading volume like "45.2M"
- marketCap: market cap in billions like "2890"
- sector: company sector
- industry: specific industry
- moat: competitive moat score 40-99 based on real competitive advantages
- sgr: sustainable growth rate 5-30%
- roe: return on equity (use real approximate values)
- roic: return on invested capital
- roa: return on assets  
- eps: earnings per share (real values)
- pe: P/E ratio (real values)
- peg: PEG ratio
- fcf: free cash flow in millions
- eva: economic value added score 20-99
- zscore: Altman Z-Score (real assessment)
- dividend: dividend yield %
- beta: stock beta
- aiRating: AI investment rating 60-99
- history: array of 20 numbers showing 20-day price trend

Return accurate, realistic financial data.`,
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
                                    marketCap: { type: "string" },
                                    sector: { type: "string" },
                                    industry: { type: "string" },
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
                                    dividend: { type: "number" },
                                    beta: { type: "number" },
                                    aiRating: { type: "number" },
                                    history: { type: "array", items: { type: "number" } }
                                }
                            }
                        }
                    }
                }
            });

            setLoadingProgress(100);

            if (response?.stocks && response.stocks.length > 0) {
                if (isFirstPage) {
                    setStocks(response.stocks);
                } else {
                    setStocks(prev => [...prev, ...response.stocks]);
                }
                setCurrentPage(page);
                setHasMore(startIdx + STOCKS_PER_PAGE < STOCK_UNIVERSE.length);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading stocks:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMoreStocks = () => {
        if (!isLoadingMore && hasMore) {
            loadStocks(currentPage + 1);
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        setCurrentPage(0);
        setHasMore(true);
        await loadStocks(0);
        setIsRefreshing(false);
    };

    const handleStockClick = (stock) => {
        setSelectedStock(stock);
        setShowStockModal(true);
    };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.ticker?.toLowerCase().includes(q) || 
                s.name?.toLowerCase().includes(q)
            );
        }

        if (activePreset === 'wide-moats') {
            result = result.filter(s => s.moat >= 70);
        } else if (activePreset === 'undervalued') {
            result = result.filter(s => s.pe < 20);
        } else if (activePreset === 'high-growth') {
            result = result.filter(s => s.sgr >= 15);
        } else if (activePreset === 'avg-change') {
            result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        }

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
        if (filters.sector !== 'All Sectors') {
            result = result.filter(s => s.sector === filters.sector);
        }

        return result;
    }, [stocks, searchQuery, activePreset, filters]);

    const topMovers = useMemo(() => {
        return [...stocks]
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 20);
    }, [stocks]);

    const sectors = useMemo(() => {
        const uniqueSectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
        return ['All Sectors', ...uniqueSectors];
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
                                <span className="text-xl font-bold text-gray-900">1cPublishing</span>
                                <p className="text-xs font-medium text-purple-600">Ai Markets</p>
                            </div>
                        </Link>
                    </div>

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

                <StockTicker stocks={topMovers} />
            </header>

            <div className="flex flex-1">
                {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

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

                    <FilterChips filters={filters} setFilters={setFilters} filterOptions={FILTER_OPTIONS} sectors={sectors} />

                    <div className="flex items-center justify-between mb-4 mt-6">
                        <p className="text-gray-600">
                            Showing <span className="font-bold text-gray-900">{filteredStocks.length}</span> stocks
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Live AI-powered market data
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                            <p className="text-gray-600 mb-2">Loading market data with AI...</p>
                            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{loadingProgress}% complete</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredStocks.map((stock, i) => (
                                <StockCard key={stock.ticker || i} stock={stock} onClick={handleStockClick} />
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredStocks.length === 0 && (
                        <div className="text-center py-20">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No stocks match your current filters</p>
                            <Button 
                                onClick={() => {
                                    setFilters({
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
                                    setActivePreset('suggested');
                                    setSearchQuery('');
                                }}
                                variant="outline"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}

                    {/* Load More Button */}
                    {!isLoading && filteredStocks.length > 0 && hasMore && (
                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={loadMoreStocks}
                                disabled={isLoadingMore}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading more stocks...
                                    </>
                                ) : (
                                    <>Load More Stocks ({STOCK_UNIVERSE.length - stocks.length} remaining)</>
                                )}
                            </Button>
                        </div>
                    )}

                    {!isLoading && !hasMore && stocks.length > 0 && (
                        <div className="text-center mt-8 text-gray-500">
                            All {stocks.length} stocks loaded
                        </div>
                    )}
                </main>
            </div>

            <footer className="py-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <a key={i} href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        © 2025 1cPublishing.com
                    </div>
                </div>
            </footer>

            <StockDetailModal 
                stock={selectedStock} 
                isOpen={showStockModal} 
                onClose={() => setShowStockModal(false)} 
            />
        </div>
    );
}