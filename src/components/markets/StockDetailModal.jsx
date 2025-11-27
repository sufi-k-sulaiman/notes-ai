import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
    X, Star, TrendingUp, TrendingDown, Eye, DollarSign, BarChart3, 
    LineChart, Activity, Brain, Shield, AlertTriangle, List, 
    Sparkles, ChevronRight, Info, Loader2, Target, Zap, Building,
    Users, Globe, Calendar, FileText, PieChart, Percent, ArrowUpRight, ArrowDownRight,
    Calculator, ThumbsUp, ThumbsDown, Download, ExternalLink, Play
} from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line } from 'recharts';

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'invest', label: 'Invest', icon: DollarSign },
    { id: 'valuation', label: 'Valuation', icon: BarChart3 },
    { id: 'simulator', label: 'Simulator', icon: Target },
    { id: 'dcf', label: 'DCF Calculator', icon: Activity },
    { id: 'bullbear', label: 'Bull/Bear Case', icon: TrendingUp },
    { id: 'fundamentals', label: 'Fundamentals', icon: LineChart },
    { id: 'financials', label: 'Financials', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'technicals', label: 'Technicals', icon: TrendingUp },
    { id: 'sentiment', label: 'Sentiment', icon: Brain },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'risk', label: 'Risk', icon: AlertTriangle },
    { id: 'news', label: 'News', icon: FileText },
    { id: 'dividends', label: 'Dividends', icon: Percent },
    { id: 'peers', label: 'Peers', icon: Users },
];

const CHART_COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];

function MoatBar({ label, value, color = '#8B5CF6' }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32">{label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12 text-right">{value}%</span>
        </div>
    );
}

function PriceStatCard({ label, value, color }) {
    return (
        <div className="text-center px-4 py-3 rounded-lg" style={{ backgroundColor: color }}>
            <p className="text-xs text-white/80 mb-1">{label}</p>
            <p className="text-lg font-bold text-white">${value}</p>
        </div>
    );
}

export default function StockDetailModal({ stock, isOpen, onClose }) {
    const [activeNav, setActiveNav] = useState('overview');
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [sectionData, setSectionData] = useState({});
    const [loadingSection, setLoadingSection] = useState(null);
    const [investmentAmount, setInvestmentAmount] = useState(10000);
    const [yearsToHold, setYearsToHold] = useState(5);
    const [expectedReturn, setExpectedReturn] = useState(12);

    useEffect(() => {
        if (isOpen && stock) {
            loadSectionData('overview');
        }
    }, [isOpen, stock]);

    useEffect(() => {
        if (stock && !sectionData[activeNav]) {
            loadSectionData(activeNav);
        }
    }, [activeNav, stock]);

    const loadSectionData = async (section) => {
        if (!stock || sectionData[section]) return;
        
        setLoadingSection(section);
        
        try {
            let prompt = '';
            let schema = {};

            switch (section) {
                case 'overview':
                    prompt = `Provide comprehensive overview for ${stock.ticker} (${stock.name}):
- Company description (2-3 sentences)
- Key competitive advantages
- Main revenue streams
- Recent major developments
- 36-month price history data points (monthly)
- MOAT breakdown: brand power, switching costs, network effects, cost advantages, intangibles (each 0-100)
- Investment thesis summary`;
                    schema = {
                        type: "object",
                        properties: {
                            description: { type: "string" },
                            advantages: { type: "array", items: { type: "string" } },
                            revenueStreams: { type: "array", items: { type: "string" } },
                            developments: { type: "array", items: { type: "string" } },
                            priceHistory: { type: "array", items: { type: "object", properties: { month: { type: "string" }, price: { type: "number" } } } },
                            moatBreakdown: { type: "object", properties: { brandPower: { type: "number" }, switchingCosts: { type: "number" }, networkEffects: { type: "number" }, costAdvantages: { type: "number" }, intangibles: { type: "number" } } },
                            thesis: { type: "string" }
                        }
                    };
                    break;

                case 'invest':
                    prompt = `Investment analysis for ${stock.ticker}:
- Buy/Hold/Sell recommendation with confidence %
- Price targets: low, mid, high
- Entry point suggestions
- Position sizing recommendation
- Time horizon suggestion
- Key catalysts for the stock
- Risks to consider`;
                    schema = {
                        type: "object",
                        properties: {
                            recommendation: { type: "string" },
                            confidence: { type: "number" },
                            priceTargets: { type: "object", properties: { low: { type: "number" }, mid: { type: "number" }, high: { type: "number" } } },
                            entryPoint: { type: "number" },
                            positionSize: { type: "string" },
                            timeHorizon: { type: "string" },
                            catalysts: { type: "array", items: { type: "string" } },
                            risks: { type: "array", items: { type: "string" } }
                        }
                    };
                    break;

                case 'valuation':
                    prompt = `Valuation analysis for ${stock.ticker}:
- Fair value estimate
- DCF valuation
- Comparable company analysis
- Historical valuation metrics
- Valuation vs sector average
- Margin of safety %
- Valuation grade (A-F)`;
                    schema = {
                        type: "object",
                        properties: {
                            fairValue: { type: "number" },
                            dcfValue: { type: "number" },
                            comparables: { type: "array", items: { type: "object", properties: { ticker: { type: "string" }, pe: { type: "number" } } } },
                            historicalPE: { type: "array", items: { type: "object", properties: { year: { type: "string" }, pe: { type: "number" } } } },
                            sectorAvgPE: { type: "number" },
                            marginOfSafety: { type: "number" },
                            grade: { type: "string" }
                        }
                    };
                    break;

                case 'fundamentals':
                    prompt = `Fundamental analysis for ${stock.ticker}:
- Revenue growth (5 year trend)
- Earnings growth trend
- Profit margins (gross, operating, net)
- Balance sheet strength
- Cash flow quality
- Debt levels and coverage
- Return metrics (ROE, ROA, ROIC)`;
                    schema = {
                        type: "object",
                        properties: {
                            revenueGrowth: { type: "array", items: { type: "object", properties: { year: { type: "string" }, growth: { type: "number" } } } },
                            earningsGrowth: { type: "array", items: { type: "object", properties: { year: { type: "string" }, growth: { type: "number" } } } },
                            margins: { type: "object", properties: { gross: { type: "number" }, operating: { type: "number" }, net: { type: "number" } } },
                            balanceSheetScore: { type: "number" },
                            cashFlowScore: { type: "number" },
                            debtToEquity: { type: "number" },
                            interestCoverage: { type: "number" }
                        }
                    };
                    break;

                case 'technicals':
                    prompt = `Technical analysis for ${stock.ticker}:
- Current trend (bullish/bearish/neutral)
- Support and resistance levels
- Moving averages (50, 100, 200 day)
- RSI, MACD signals
- Volume analysis
- Chart patterns detected
- Technical rating (1-10)`;
                    schema = {
                        type: "object",
                        properties: {
                            trend: { type: "string" },
                            support: { type: "array", items: { type: "number" } },
                            resistance: { type: "array", items: { type: "number" } },
                            ma50: { type: "number" },
                            ma100: { type: "number" },
                            ma200: { type: "number" },
                            rsi: { type: "number" },
                            macdSignal: { type: "string" },
                            volumeTrend: { type: "string" },
                            patterns: { type: "array", items: { type: "string" } },
                            rating: { type: "number" }
                        }
                    };
                    break;

                case 'sentiment':
                    prompt = `Market sentiment analysis for ${stock.ticker}:
- Overall sentiment score (0-100)
- Analyst ratings breakdown (buy/hold/sell counts)
- Institutional ownership changes
- Insider trading activity
- Social media sentiment
- News sentiment
- Short interest %`;
                    schema = {
                        type: "object",
                        properties: {
                            sentimentScore: { type: "number" },
                            analystRatings: { type: "object", properties: { buy: { type: "number" }, hold: { type: "number" }, sell: { type: "number" } } },
                            institutionalChange: { type: "string" },
                            insiderActivity: { type: "string" },
                            socialSentiment: { type: "string" },
                            newsSentiment: { type: "string" },
                            shortInterest: { type: "number" }
                        }
                    };
                    break;

                case 'ai-insights':
                    prompt = `AI-powered insights for ${stock.ticker}:
- AI confidence score (0-100)
- Key AI predictions
- Unusual patterns detected
- Earnings surprise probability
- Sector rotation signals
- Smart money flow indicators
- AI risk alerts`;
                    schema = {
                        type: "object",
                        properties: {
                            aiConfidence: { type: "number" },
                            predictions: { type: "array", items: { type: "string" } },
                            patterns: { type: "array", items: { type: "string" } },
                            earningsSurprise: { type: "string" },
                            sectorRotation: { type: "string" },
                            smartMoneyFlow: { type: "string" },
                            riskAlerts: { type: "array", items: { type: "string" } }
                        }
                    };
                    break;

                case 'risk':
                    prompt = `Risk assessment for ${stock.ticker}:
- Overall risk score (1-10)
- Volatility assessment
- Beta analysis
- Drawdown history
- Sector-specific risks
- Company-specific risks
- Macroeconomic risks
- Risk-adjusted return metrics`;
                    schema = {
                        type: "object",
                        properties: {
                            riskScore: { type: "number" },
                            volatility: { type: "string" },
                            beta: { type: "number" },
                            maxDrawdown: { type: "number" },
                            sectorRisks: { type: "array", items: { type: "string" } },
                            companyRisks: { type: "array", items: { type: "string" } },
                            macroRisks: { type: "array", items: { type: "string" } },
                            sharpeRatio: { type: "number" }
                        }
                    };
                    break;

                case 'news':
                    prompt = `Recent news and events for ${stock.ticker}:
                - Latest 5 news headlines with dates and sentiment
                - Upcoming events (earnings, conferences)
                - Recent SEC filings summary
                - Management commentary highlights`;
                    schema = {
                        type: "object",
                        properties: {
                            news: { type: "array", items: { type: "object", properties: { headline: { type: "string" }, date: { type: "string" }, sentiment: { type: "string" } } } },
                            upcomingEvents: { type: "array", items: { type: "object", properties: { event: { type: "string" }, date: { type: "string" } } } },
                            filings: { type: "array", items: { type: "string" } },
                            managementNotes: { type: "array", items: { type: "string" } }
                        }
                    };
                    break;

                case 'dividends':
                    prompt = `Dividend analysis for ${stock.ticker}:
                - Current dividend yield
                - Annual dividend per share
                - Dividend growth rate (5 year)
                - Payout ratio
                - Ex-dividend date
                - Dividend history (last 5 years)
                - Dividend safety score`;
                    schema = {
                        type: "object",
                        properties: {
                            yield: { type: "number" },
                            annualDividend: { type: "number" },
                            growthRate: { type: "number" },
                            payoutRatio: { type: "number" },
                            exDividendDate: { type: "string" },
                            history: { type: "array", items: { type: "object", properties: { year: { type: "string" }, dividend: { type: "number" } } } },
                            safetyScore: { type: "number" }
                        }
                    };
                    break;

                case 'peers':
                    prompt = `Peer comparison for ${stock.ticker}:
                    - Top 5 competitor companies with ticker, name, market cap, P/E, ROE, and revenue growth
                    - Industry average metrics
                    - Competitive advantages vs peers
                    - Market share comparison`;
                    schema = {
                        type: "object",
                        properties: {
                            peers: { type: "array", items: { type: "object", properties: { ticker: { type: "string" }, name: { type: "string" }, marketCap: { type: "string" }, pe: { type: "number" }, roe: { type: "number" }, growth: { type: "number" } } } },
                            industryAvg: { type: "object", properties: { pe: { type: "number" }, roe: { type: "number" }, growth: { type: "number" } } },
                            advantages: { type: "array", items: { type: "string" } },
                            marketShare: { type: "number" }
                        }
                    };
                    break;

                case 'bullbear':
                    prompt = `Bull and Bear case analysis for ${stock.ticker}:
                    - Top 5 bull case arguments with potential upside
                    - Top 5 bear case arguments with potential downside
                    - Bull case price target
                    - Bear case price target
                    - Probability assessment`;
                    schema = {
                        type: "object",
                        properties: {
                            bullCase: { type: "array", items: { type: "string" } },
                            bearCase: { type: "array", items: { type: "string" } },
                            bullTarget: { type: "number" },
                            bearTarget: { type: "number" },
                            bullProbability: { type: "number" },
                            bearProbability: { type: "number" }
                        }
                    };
                    break;

                case 'dcf':
                    prompt = `DCF Intrinsic Value calculation for ${stock.ticker}:
                    - Current stock price
                    - Intrinsic value estimate
                    - Margin of safety percentage
                    - Verdict (undervalued/fairly valued/overvalued)
                    - Price target range (low, mid, high)
                    - Key DCF assumptions (growth rate, discount rate, terminal growth)
                    - Sensitivity analysis`;
                    schema = {
                        type: "object",
                        properties: {
                            currentPrice: { type: "number" },
                            intrinsicValue: { type: "number" },
                            marginOfSafety: { type: "number" },
                            verdict: { type: "string" },
                            priceTargets: { type: "object", properties: { low: { type: "number" }, mid: { type: "number" }, high: { type: "number" } } },
                            assumptions: { type: "object", properties: { growthRate: { type: "number" }, discountRate: { type: "number" }, terminalGrowth: { type: "number" } } }
                        }
                    };
                    break;

                case 'reports':
                    prompt = `Company reports and filings for ${stock.ticker}:
                    - Latest 3 annual reports with titles and dates
                    - Latest 4 quarterly reports with titles and dates
                    - Latest 3 investor presentations with titles and dates
                    - Latest 4 earnings releases with titles and dates
                    - Latest 3 P&L statements summary
                    - Last 3 fiscal years data summary`;
                    schema = {
                        type: "object",
                        properties: {
                            annualReports: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, year: { type: "string" } } } },
                            quarterlyReports: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, quarter: { type: "string" } } } },
                            investorPresentations: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" } } } },
                            earningsReleases: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, eps: { type: "string" } } } },
                            plStatements: { type: "array", items: { type: "object", properties: { year: { type: "string" }, revenue: { type: "string" }, netIncome: { type: "string" } } } },
                            fiscalYearData: { type: "array", items: { type: "object", properties: { year: { type: "string" }, revenue: { type: "string" }, earnings: { type: "string" }, assets: { type: "string" } } } }
                        }
                    };
                    break;

                default:
                    return;
                }

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `${prompt}\n\nProvide accurate, current data for ${stock.ticker} (${stock.name}). Current price: $${stock.price}`,
                add_context_from_internet: true,
                response_json_schema: schema
            });

            setSectionData(prev => ({ ...prev, [section]: response }));
        } catch (error) {
            console.error('Error loading section data:', error);
        } finally {
            setLoadingSection(null);
        }
    };

    if (!stock) return null;

    const isPositive = stock.change >= 0;
    const data = sectionData[activeNav] || {};

    const renderSectionContent = () => {
        if (loadingSection === activeNav) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                    <p className="text-gray-600">Loading {activeNav} data with AI...</p>
                </div>
            );
        }

        switch (activeNav) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Company Overview */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-2xl font-bold text-gray-900">{stock.name}</h1>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg font-medium">{stock.ticker}</span>
                                    </div>
                                    <p className="text-gray-500">{stock.sector} • {stock.industry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">${stock.price?.toFixed(2)}</p>
                                    <p className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{data.description || `${stock.name} is a leading company in the ${stock.sector} sector.`}</p>
                            
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                                    {stock.aiRating >= 80 ? 'Strong Buy' : stock.aiRating >= 60 ? 'Buy' : 'Hold'}
                                </span>
                                <span className="text-sm text-gray-500">AI Confidence: {stock.aiRating || stock.moat}%</span>
                            </div>
                        </div>

                        {/* Price History Chart */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <LineChart className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Price History</h3>
                                </div>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Sparkles className="w-4 h-4 text-purple-600" /> AI-generated analysis
                                </span>
                            </div>

                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.priceHistory || stock.history?.map((p, i) => ({ month: `M${i+1}`, price: p })) || []}>
                                        <defs>
                                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                                        <Area type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} fill="url(#priceGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mt-4">
                                <PriceStatCard label="52W Low" value={(stock.price * 0.7).toFixed(2)} color="#EF4444" />
                                <PriceStatCard label="52W High" value={(stock.price * 1.3).toFixed(2)} color="#10B981" />
                                <PriceStatCard label="Avg Price" value={(stock.price * 0.95).toFixed(2)} color="#6B7280" />
                                <PriceStatCard label="Current" value={stock.price?.toFixed(2)} color="#8B5CF6" />
                            </div>
                        </div>

                        {/* MOAT Analysis & ROE */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">MOAT Analysis</h3>
                                    </div>
                                    <span className="text-3xl font-bold text-purple-600">{stock.moat}<span className="text-lg text-gray-400">/100</span></span>
                                </div>
                                <div className="space-y-3">
                                    <MoatBar label="Brand Power" value={data.moatBreakdown?.brandPower || 73} />
                                    <MoatBar label="Switching Costs" value={data.moatBreakdown?.switchingCosts || 87} color="#10B981" />
                                    <MoatBar label="Network Effects" value={data.moatBreakdown?.networkEffects || 65} />
                                    <MoatBar label="Cost Advantages" value={data.moatBreakdown?.costAdvantages || 45} color="#F59E0B" />
                                    <MoatBar label="Intangibles" value={data.moatBreakdown?.intangibles || 62} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Sparkles className="w-5 h-5 text-green-600" />
                                                <h3 className="font-semibold text-gray-900">Return on Equity</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">ROE of {stock.roe}% indicates efficient use of equity</p>
                                            <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${stock.roe >= 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                <Star className="w-3 h-3" /> {stock.roe >= 20 ? 'Excellent' : 'Good'}
                                            </span>
                                        </div>
                                        <span className="text-4xl font-bold text-green-600">{stock.roe}<span className="text-xl">%</span></span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                <h3 className="font-semibold text-gray-900">Altman Z-Score</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {stock.zscore >= 3 ? 'Low bankruptcy risk' : 'Monitor closely'}
                                            </p>
                                        </div>
                                        <span className={`text-4xl font-bold ${stock.zscore >= 3 ? 'text-green-600' : 'text-yellow-600'}`}>{stock.zscore?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'invest':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Investment Recommendation</h3>
                            </div>
                            <div className="flex items-center gap-6 mb-6">
                                <div className={`px-6 py-3 rounded-xl text-xl font-bold ${
                                    data.recommendation === 'Buy' ? 'bg-green-100 text-green-700' :
                                    data.recommendation === 'Sell' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {data.recommendation || 'Buy'}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">AI Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.confidence || 78}%</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-red-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Low Target</p>
                                    <p className="text-xl font-bold text-red-600">${data.priceTargets?.low || (stock.price * 0.8).toFixed(2)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Mid Target</p>
                                    <p className="text-xl font-bold text-purple-600">${data.priceTargets?.mid || (stock.price * 1.15).toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">High Target</p>
                                    <p className="text-xl font-bold text-green-600">${data.priceTargets?.high || (stock.price * 1.4).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-green-600" /> Key Catalysts
                                </h4>
                                <ul className="space-y-2">
                                    {(data.catalysts || ['Strong earnings growth', 'New product launches', 'Market expansion']).map((c, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600" /> Risks to Consider
                                </h4>
                                <ul className="space-y-2">
                                    {(data.risks || ['Market volatility', 'Competition', 'Regulatory changes']).map((r, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'sentiment':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Market Sentiment</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-purple-600">{data.sentimentScore || 72}</p>
                                    <p className="text-sm text-gray-500">Sentiment Score</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-green-600">{data.analystRatings?.buy || 18}</p>
                                    <p className="text-sm text-gray-600">Buy</p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{data.analystRatings?.hold || 8}</p>
                                    <p className="text-sm text-gray-600">Hold</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-red-600">{data.analystRatings?.sell || 2}</p>
                                    <p className="text-sm text-gray-600">Sell</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Institutional Ownership</span>
                                    <span className={`font-medium ${data.institutionalChange === 'Increasing' ? 'text-green-600' : 'text-gray-700'}`}>
                                        {data.institutionalChange || 'Increasing'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Insider Activity</span>
                                    <span className="font-medium text-gray-700">{data.insiderActivity || 'Net buying'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Short Interest</span>
                                    <span className="font-medium text-gray-700">{data.shortInterest || 2.4}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'ai-insights':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">AI Confidence Score</p>
                                    <p className="text-4xl font-bold text-purple-600">{data.aiConfidence || stock.aiRating || 82}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Earnings Surprise Probability</p>
                                    <p className="text-xl font-bold text-gray-900">{data.earningsSurprise || 'Likely Beat'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">AI Predictions</h4>
                            <ul className="space-y-3">
                                {(data.predictions || [
                                    'Strong momentum likely to continue for next quarter',
                                    'Technical breakout pattern detected',
                                    'Earnings estimates trending higher'
                                ]).map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                                        <span className="text-gray-700">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {data.riskAlerts?.length > 0 && (
                            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                                <h4 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> AI Risk Alerts
                                </h4>
                                <ul className="space-y-2">
                                    {data.riskAlerts.map((r, i) => (
                                        <li key={i} className="text-sm text-red-700">{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'valuation':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Valuation Analysis</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    data.grade === 'A' || data.grade === 'B' ? 'bg-green-100 text-green-700' :
                                    data.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    Grade: {data.grade || 'B+'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Fair Value</p>
                                    <p className="text-2xl font-bold text-purple-600">${data.fairValue || (stock.price * 1.1).toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">DCF Value</p>
                                    <p className="text-2xl font-bold text-blue-600">${data.dcfValue || (stock.price * 1.15).toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Margin of Safety</p>
                                    <p className="text-2xl font-bold text-green-600">{data.marginOfSafety || 12}%</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Sector Avg P/E</span>
                                    <span className="font-medium text-gray-700">{data.sectorAvgPE || 22.5}x</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Current P/E</span>
                                    <span className="font-medium text-gray-700">{stock.pe || 18.3}x</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'fundamentals':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <LineChart className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Fundamental Analysis</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Gross Margin</p>
                                    <p className="text-2xl font-bold text-green-600">{data.margins?.gross || 42}%</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Operating Margin</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.margins?.operating || 28}%</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Net Margin</p>
                                    <p className="text-2xl font-bold text-purple-600">{data.margins?.net || 18}%</p>
                                </div>
                            </div>
                            <div className="h-48 mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.revenueGrowth || [
                                        { year: '2020', growth: 12 },
                                        { year: '2021', growth: 18 },
                                        { year: '2022', growth: 15 },
                                        { year: '2023', growth: 22 },
                                        { year: '2024', growth: 28 }
                                    ]}>
                                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip />
                                        <Bar dataKey="growth" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Debt to Equity</p>
                                    <p className="text-xl font-bold text-gray-900">{data.debtToEquity || 0.45}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Interest Coverage</p>
                                    <p className="text-xl font-bold text-gray-900">{data.interestCoverage || 12.5}x</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'financials':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Financial Health</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Balance Sheet Score</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${data.balanceSheetScore || 78}%` }} />
                                        </div>
                                        <span className="font-bold text-gray-900">{data.balanceSheetScore || 78}/100</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Cash Flow Score</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.cashFlowScore || 85}%` }} />
                                        </div>
                                        <span className="font-bold text-gray-900">{data.cashFlowScore || 85}/100</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">ROE</p>
                                    <p className="text-lg font-bold text-purple-600">{stock.roe || 24}%</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">ROA</p>
                                    <p className="text-lg font-bold text-blue-600">12%</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">ROIC</p>
                                    <p className="text-lg font-bold text-green-600">18%</p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">FCF Yield</p>
                                    <p className="text-lg font-bold text-yellow-600">4.2%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'technicals':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Technical Analysis</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    data.trend === 'Bullish' ? 'bg-green-100 text-green-700' :
                                    data.trend === 'Bearish' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {data.trend || 'Bullish'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">50-Day MA</p>
                                    <p className="text-lg font-bold text-gray-900">${data.ma50 || (stock.price * 0.95).toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">100-Day MA</p>
                                    <p className="text-lg font-bold text-gray-900">${data.ma100 || (stock.price * 0.92).toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">200-Day MA</p>
                                    <p className="text-lg font-bold text-gray-900">${data.ma200 || (stock.price * 0.88).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">RSI (14)</span>
                                        <span className={`font-bold ${(data.rsi || 58) > 70 ? 'text-red-600' : (data.rsi || 58) < 30 ? 'text-green-600' : 'text-gray-900'}`}>
                                            {data.rsi || 58}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.rsi || 58}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">MACD Signal</span>
                                        <span className={`font-bold ${data.macdSignal === 'Bullish' ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.macdSignal || 'Bullish'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Volume: {data.volumeTrend || 'Above Average'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-2">Support Levels</p>
                                    <div className="flex gap-2">
                                        {(data.support || [stock.price * 0.95, stock.price * 0.9]).map((s, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">${s?.toFixed?.(2) || s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-red-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-2">Resistance Levels</p>
                                    <div className="flex gap-2">
                                        {(data.resistance || [stock.price * 1.05, stock.price * 1.1]).map((r, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded">${r?.toFixed?.(2) || r}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'risk':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-orange-600">{data.riskScore || 4.2}<span className="text-lg text-gray-400">/10</span></p>
                                    <p className="text-sm text-gray-500">Risk Score</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Volatility</p>
                                    <p className="text-lg font-bold text-gray-900">{data.volatility || 'Medium'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Beta</p>
                                    <p className="text-lg font-bold text-gray-900">{data.beta || 1.15}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Max Drawdown</p>
                                    <p className="text-lg font-bold text-red-600">-{data.maxDrawdown || 18}%</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Sector Risks</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(data.sectorRisks || ['Market cyclicality', 'Regulatory changes', 'Competition']).map((r, i) => (
                                            <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">{r}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Company Risks</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(data.companyRisks || ['Key person dependency', 'Debt levels']).map((r, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">{r}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'news':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Recent News</h3>
                            </div>
                            <div className="space-y-4">
                                {(data.news || [
                                    { headline: `${stock.name} Reports Strong Q3 Earnings`, date: '2 days ago', sentiment: 'Positive' },
                                    { headline: `Analysts Raise Price Target for ${stock.ticker}`, date: '5 days ago', sentiment: 'Positive' },
                                    { headline: `${stock.name} Announces New Product Launch`, date: '1 week ago', sentiment: 'Neutral' },
                                    { headline: `${stock.ticker} Expands Into New Markets`, date: '2 weeks ago', sentiment: 'Positive' },
                                    { headline: `Industry Report Highlights ${stock.name} Growth`, date: '3 weeks ago', sentiment: 'Neutral' }
                                ]).map((n, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                            n.sentiment === 'Positive' ? 'bg-green-500' :
                                            n.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{n.headline}</p>
                                            <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded ${
                                            n.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                            n.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {n.sentiment}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Upcoming Events
                            </h4>
                            <div className="space-y-3">
                                {(data.upcomingEvents || [
                                    { event: 'Q4 Earnings Call', date: 'Jan 28, 2025' },
                                    { event: 'Annual Shareholder Meeting', date: 'Mar 15, 2025' }
                                ]).map((e, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm text-gray-900">{e.event}</span>
                                        <span className="text-sm text-purple-600 font-medium">{e.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'dividends':
                const dividendHistory = data.history || [
                    { year: '2020', dividend: 2.8 },
                    { year: '2021', dividend: 3.2 },
                    { year: '2022', dividend: 3.6 },
                    { year: '2023', dividend: 4.0 },
                    { year: '2024', dividend: 4.4 }
                ];
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Dividend Overview</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    (data.safetyScore || 75) >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    Safety: {data.safetyScore || 75}/100
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Yield</p>
                                    <p className="text-2xl font-bold text-purple-600">{data.yield || stock.dividend || 2.4}%</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Annual</p>
                                    <p className="text-2xl font-bold text-green-600">${data.annualDividend || 4.40}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Growth (5Y)</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.growthRate || 8.5}%</p>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Payout Ratio</p>
                                    <p className="text-2xl font-bold text-orange-600">{data.payoutRatio || 45}%</p>
                                </div>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dividendHistory}>
                                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip formatter={(v) => `$${v}`} />
                                        <Bar dataKey="dividend" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Dividend Schedule</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Ex-Dividend Date</p>
                                    <p className="text-lg font-bold text-gray-900">{data.exDividendDate || 'Feb 15, 2025'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500">Payment Date</p>
                                    <p className="text-lg font-bold text-gray-900">Mar 1, 2025</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'peers':
                const peerData = data.peers || [
                    { ticker: 'COMP1', name: 'Competitor A', marketCap: '150B', pe: 22, roe: 18, growth: 12 },
                    { ticker: 'COMP2', name: 'Competitor B', marketCap: '120B', pe: 28, roe: 15, growth: 8 },
                    { ticker: 'COMP3', name: 'Competitor C', marketCap: '80B', pe: 18, roe: 22, growth: 15 },
                    { ticker: 'COMP4', name: 'Competitor D', marketCap: '60B', pe: 25, roe: 12, growth: 10 },
                    { ticker: 'COMP5', name: 'Competitor E', marketCap: '45B', pe: 20, roe: 20, growth: 18 }
                ];
                const radarData = [
                    { metric: 'P/E', company: stock.pe || 20, industry: data.industryAvg?.pe || 22 },
                    { metric: 'ROE', company: stock.roe || 25, industry: data.industryAvg?.roe || 18 },
                    { metric: 'Growth', company: stock.sgr || 15, industry: data.industryAvg?.growth || 12 },
                    { metric: 'MOAT', company: stock.moat || 70, industry: 60 },
                    { metric: 'Margin', company: 28, industry: 22 }
                ];
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Peer Comparison</h3>
                                </div>
                                <span className="text-sm text-gray-500">Market Share: {data.marketShare || 15}%</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Company</th>
                                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Mkt Cap</th>
                                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">P/E</th>
                                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">ROE</th>
                                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-50 bg-purple-50">
                                            <td className="py-3 px-2">
                                                <span className="font-bold text-purple-700">{stock.ticker}</span>
                                                <span className="text-xs text-gray-500 ml-2">(You)</span>
                                            </td>
                                            <td className="py-3 px-2 text-right text-gray-700">${stock.marketCap}B</td>
                                            <td className="py-3 px-2 text-right text-gray-700">{stock.pe?.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-right text-gray-700">{stock.roe}%</td>
                                            <td className="py-3 px-2 text-right text-gray-700">{stock.sgr}%</td>
                                        </tr>
                                        {peerData.map((peer, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-3 px-2 font-medium text-gray-900">{peer.ticker}</td>
                                                <td className="py-3 px-2 text-right text-gray-700">${peer.marketCap}</td>
                                                <td className="py-3 px-2 text-right text-gray-700">{peer.pe}</td>
                                                <td className="py-3 px-2 text-right text-gray-700">{peer.roe}%</td>
                                                <td className="py-3 px-2 text-right">
                                                    <span className={`flex items-center justify-end gap-1 ${peer.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {peer.growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {peer.growth}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">vs Industry Average</h4>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                                            <PolarRadiusAxis tick={{ fontSize: 10 }} />
                                            <Radar name="Company" dataKey="company" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                                            <Radar name="Industry" dataKey="industry" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-green-600" /> Competitive Advantages
                                </h4>
                                <ul className="space-y-2">
                                    {(data.advantages || ['Strong brand recognition', 'Leading market position', 'Superior technology', 'Economies of scale']).map((adv, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                            {adv}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'simulator':
                const calculateFutureValue = () => {
                    const shares = investmentAmount / stock.price;
                    const futurePrice = stock.price * Math.pow(1 + expectedReturn / 100, yearsToHold);
                    const futureValue = shares * futurePrice;
                    return { shares: shares.toFixed(2), futurePrice: futurePrice.toFixed(2), futureValue: futureValue.toFixed(2), profit: (futureValue - investmentAmount).toFixed(2) };
                };
                const simResult = calculateFutureValue();
                const projectionData = Array.from({ length: yearsToHold + 1 }, (_, i) => ({
                    year: `Year ${i}`,
                    value: investmentAmount * Math.pow(1 + expectedReturn / 100, i)
                }));
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Calculator className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Investment Simulator</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Investment Amount</label>
                                    <div className="flex gap-2 mb-2">
                                        {[100, 1000, 10000, 100000, 1000000, 4000000].map(amt => (
                                            <button key={amt} onClick={() => setInvestmentAmount(amt)} className={`px-2 py-1 text-xs rounded ${investmentAmount === amt ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border'}`}>
                                                ${amt >= 1000000 ? `${amt/1000000}M` : amt >= 1000 ? `${amt/1000}K` : amt}
                                            </button>
                                        ))}
                                    </div>
                                    <Input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(Number(e.target.value))} className="w-full" min={100} max={4000000} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Years to Hold: {yearsToHold}</label>
                                    <Slider value={[yearsToHold]} onValueChange={(v) => setYearsToHold(v[0])} min={1} max={30} step={1} className="mt-4" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Expected Annual Return: {expectedReturn}%</label>
                                    <Slider value={[expectedReturn]} onValueChange={(v) => setExpectedReturn(v[0])} min={-20} max={50} step={1} className="mt-4" />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Shares Bought</p>
                                    <p className="text-2xl font-bold text-gray-900">{simResult.shares}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Future Price</p>
                                    <p className="text-2xl font-bold text-blue-600">${simResult.futurePrice}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Future Value</p>
                                    <p className="text-2xl font-bold text-purple-600">${Number(simResult.futureValue).toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500">Total Profit</p>
                                    <p className={`text-2xl font-bold ${Number(simResult.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(simResult.profit) >= 0 ? '+' : ''}${Number(simResult.profit).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Investment Projection</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={projectionData}>
                                        <defs>
                                            <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                                        <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#projGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );

            case 'dcf':
                const intrinsicValue = data.intrinsicValue || (stock.price * 1.15);
                const marginSafety = data.marginOfSafety || Math.round(((intrinsicValue - stock.price) / intrinsicValue) * 100);
                const verdict = marginSafety > 20 ? 'Undervalued' : marginSafety > 0 ? 'Fairly Valued' : 'Overvalued';
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Calculator className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">DCF Intrinsic Value Calculator</h3>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-1">Current Price</p>
                                    <p className="text-2xl font-bold text-gray-900">${stock.price?.toFixed(2)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-1">Intrinsic Value</p>
                                    <p className="text-2xl font-bold text-purple-600">${intrinsicValue.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-1">Margin of Safety</p>
                                    <p className={`text-2xl font-bold ${marginSafety > 0 ? 'text-green-600' : 'text-red-600'}`}>{marginSafety}%</p>
                                </div>
                                <div className={`rounded-xl p-4 text-center ${verdict === 'Undervalued' ? 'bg-green-100' : verdict === 'Overvalued' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    <p className="text-sm text-gray-500 mb-1">Verdict</p>
                                    <p className={`text-xl font-bold ${verdict === 'Undervalued' ? 'text-green-700' : verdict === 'Overvalued' ? 'text-red-700' : 'text-yellow-700'}`}>{verdict}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Price Target Range</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 text-center">
                                        <p className="text-sm text-gray-500">Bear Case</p>
                                        <p className="text-lg font-bold text-red-600">${data.priceTargets?.low || (stock.price * 0.75).toFixed(2)}</p>
                                    </div>
                                    <div className="flex-1 h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full relative">
                                        <div className="absolute -top-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white" style={{ left: `${Math.min(Math.max(((stock.price - (stock.price * 0.75)) / ((stock.price * 1.4) - (stock.price * 0.75))) * 100, 0), 100)}%` }} />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-sm text-gray-500">Base Case</p>
                                        <p className="text-lg font-bold text-yellow-600">${data.priceTargets?.mid || (stock.price * 1.1).toFixed(2)}</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-sm text-gray-500">Bull Case</p>
                                        <p className="text-lg font-bold text-green-600">${data.priceTargets?.high || (stock.price * 1.4).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Growth Rate</p>
                                    <p className="text-lg font-bold text-gray-900">{data.assumptions?.growthRate || 12}%</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Discount Rate</p>
                                    <p className="text-lg font-bold text-gray-900">{data.assumptions?.discountRate || 10}%</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500">Terminal Growth</p>
                                    <p className="text-lg font-bold text-gray-900">{data.assumptions?.terminalGrowth || 2.5}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bullbear':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-green-900">Bull Case</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                        Target: ${data.bullTarget || (stock.price * 1.5).toFixed(2)}
                                    </span>
                                </div>
                                <ul className="space-y-3">
                                    {(data.bullCase || [
                                        'Strong revenue growth momentum continuing',
                                        'Expanding market share in key segments',
                                        'New product launches gaining traction',
                                        'Operating margin expansion expected',
                                        'Favorable industry tailwinds'
                                    ]).map((point, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <p className="text-sm text-gray-600">Probability: <span className="font-bold text-green-700">{data.bullProbability || 35}%</span></p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ThumbsDown className="w-5 h-5 text-red-600" />
                                        <h3 className="font-semibold text-red-900">Bear Case</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                                        Target: ${data.bearTarget || (stock.price * 0.6).toFixed(2)}
                                    </span>
                                </div>
                                <ul className="space-y-3">
                                    {(data.bearCase || [
                                        'Competitive pressure intensifying',
                                        'Slowing growth in core markets',
                                        'Rising input costs squeezing margins',
                                        'Regulatory headwinds increasing',
                                        'Potential for multiple compression'
                                    ]).map((point, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ArrowDownRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 pt-4 border-t border-red-200">
                                    <p className="text-sm text-gray-600">Probability: <span className="font-bold text-red-700">{data.bearProbability || 20}%</span></p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Scenario Analysis</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-center">
                                    <p className="text-sm text-gray-500">Bear</p>
                                    <p className="text-lg font-bold text-red-600">${data.bearTarget || (stock.price * 0.6).toFixed(2)}</p>
                                </div>
                                <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                                    <div className="bg-red-400 h-full" style={{ width: `${data.bearProbability || 20}%` }} />
                                    <div className="bg-yellow-400 h-full" style={{ width: `${100 - (data.bearProbability || 20) - (data.bullProbability || 35)}%` }} />
                                    <div className="bg-green-400 h-full" style={{ width: `${data.bullProbability || 35}%` }} />
                                </div>
                                <div className="w-24 text-center">
                                    <p className="text-sm text-gray-500">Bull</p>
                                    <p className="text-lg font-bold text-green-600">${data.bullTarget || (stock.price * 1.5).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'reports':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">Annual Reports</h3>
                                    </div>
                                    <span className="text-xs text-gray-500">3 Reports</span>
                                </div>
                                <div className="space-y-3">
                                    {(data.annualReports || [
                                        { title: `${stock.ticker} Annual Report 2024`, date: 'Feb 2025', year: '2024' },
                                        { title: `${stock.ticker} Annual Report 2023`, date: 'Feb 2024', year: '2023' },
                                        { title: `${stock.ticker} Annual Report 2022`, date: 'Feb 2023', year: '2022' }
                                    ]).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.date}</p>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">Quarterly Reports</h3>
                                    </div>
                                    <span className="text-xs text-gray-500">4 Reports</span>
                                </div>
                                <div className="space-y-3">
                                    {(data.quarterlyReports || [
                                        { title: `Q4 2024 Report`, date: 'Jan 2025', quarter: 'Q4' },
                                        { title: `Q3 2024 Report`, date: 'Oct 2024', quarter: 'Q3' },
                                        { title: `Q2 2024 Report`, date: 'Jul 2024', quarter: 'Q2' },
                                        { title: `Q1 2024 Report`, date: 'Apr 2024', quarter: 'Q1' }
                                    ]).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.date}</p>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Play className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-gray-900">Investor Presentations</h3>
                                    </div>
                                    <span className="text-xs text-gray-500">3 Presentations</span>
                                </div>
                                <div className="space-y-3">
                                    {(data.investorPresentations || [
                                        { title: `Investor Day 2024`, date: 'Nov 2024' },
                                        { title: `Capital Markets Day`, date: 'Sep 2024' },
                                        { title: `Technology Summit`, date: 'Jun 2024' }
                                    ]).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.date}</p>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900">Earnings Releases</h3>
                                    </div>
                                    <span className="text-xs text-gray-500">4 Releases</span>
                                </div>
                                <div className="space-y-3">
                                    {(data.earningsReleases || [
                                        { title: `Q4 2024 Earnings`, date: 'Jan 28, 2025', eps: '$3.45' },
                                        { title: `Q3 2024 Earnings`, date: 'Oct 25, 2024', eps: '$3.12' },
                                        { title: `Q2 2024 Earnings`, date: 'Jul 24, 2024', eps: '$2.98' },
                                        { title: `Q1 2024 Earnings`, date: 'Apr 25, 2024', eps: '$2.75' }
                                    ]).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.date}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-600">{r.eps}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Fiscal Year Data</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Year</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Earnings</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Assets</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data.fiscalYearData || [
                                            { year: 'FY 2024', revenue: '$98.5B', earnings: '$24.2B', assets: '$412B' },
                                            { year: 'FY 2023', revenue: '$88.2B', earnings: '$21.8B', assets: '$385B' },
                                            { year: 'FY 2022', revenue: '$79.5B', earnings: '$19.4B', assets: '$352B' }
                                        ]).map((fy, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">{fy.year}</td>
                                                <td className="py-3 px-4 text-right text-gray-700">{fy.revenue}</td>
                                                <td className="py-3 px-4 text-right text-green-600 font-medium">{fy.earnings}</td>
                                                <td className="py-3 px-4 text-right text-gray-700">{fy.assets}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex flex-col items-center justify-center py-12">
                            <Info className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500">Select a section to view detailed analysis</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1400px] max-h-[90vh] p-0 overflow-hidden bg-gray-50">
                <div className="flex h-[85vh]">
                    {/* Left Sidebar */}
                    <div className="w-52 bg-white border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl font-bold text-gray-900">{stock.ticker}</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">US</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{stock.name}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">${stock.price?.toFixed(2)}</span>
                                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                                </span>
                            </div>
                            <Button 
                                onClick={() => setIsWatchlisted(!isWatchlisted)}
                                className={`w-full mt-3 ${isWatchlisted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                            >
                                <Star className={`w-4 h-4 mr-2 ${isWatchlisted ? 'fill-white' : ''}`} />
                                {isWatchlisted ? 'Watching' : 'Add to Watchlist'}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Navigation</p>
                            <nav className="px-2">
                                {NAV_ITEMS.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveNav(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            activeNav === item.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                        {loadingSection === item.id && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeNav.replace('-', ' ')}</h2>
                                <span className="text-sm text-gray-500">
                                    MCap: ${stock.marketCap}B • Vol: {stock.volume}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            {renderSectionContent()}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}