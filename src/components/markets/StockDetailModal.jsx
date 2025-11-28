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

import { Award } from 'lucide-react';

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'moat', label: 'MOAT Analysis', icon: Shield },
    { id: 'valuation', label: 'Valuation', icon: BarChart3 },
    { id: 'simulator', label: 'Simulator', icon: Target },
    { id: 'dcf', label: 'DCF Calculator', icon: Activity },
    { id: 'bullbear', label: 'Bull/Bear Case', icon: TrendingUp },
    { id: 'fundamentals', label: 'Fundamentals', icon: LineChart },
    { id: 'financials', label: 'Financials', icon: Activity },
    { id: 'technicals', label: 'Technicals', icon: TrendingUp },
    { id: 'sentiment', label: 'Sentiment', icon: Brain },
    { id: 'risk', label: 'Risk & Macro', icon: AlertTriangle },
    { id: 'dividends', label: 'Dividends', icon: Percent },
    { id: 'peers', label: 'Peers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'investor-relations', label: 'Investor Relations', icon: Building },
    { id: 'legends', label: 'Legends', icon: Award },
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
    const [activeReportTab, setActiveReportTab] = useState('annual');

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

                case 'moat':
                    prompt = `MOAT analysis for ${stock.ticker}:
                    - Detailed breakdown: brand power, switching costs, network effects, cost advantages, scale advantage, regulatory moat (each 0-100)
                    - Competitive position assessment
                    - Competitive advantages (list 5-7 key advantages)
                    - Investment thesis summary`;
                    schema = {
                        type: "object",
                        properties: {
                            moatBreakdown: { type: "object", properties: { brandPower: { type: "number" }, switchingCosts: { type: "number" }, networkEffects: { type: "number" }, costAdvantages: { type: "number" }, scaleAdvantage: { type: "number" }, regulatoryMoat: { type: "number" } } },
                            position: { type: "string" },
                            advantages: { type: "array", items: { type: "string" } },
                            thesis: { type: "string" }
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

                case 'investor-relations':
                    prompt = `Investor relations information for ${stock.ticker}:
                    - Fiscal year end month
                    - Next earnings date
                    - Latest 3 annual reports (10-K) with title, date, and description
                    - Latest 4 quarterly reports (10-Q) with title, date, and description
                    - Latest 3 investor presentations with title and date
                    - Latest 4 earnings releases with title and date
                    - Latest 3 P&L statements
                    - Latest 3 fiscal year data summaries`;
                    schema = {
                        type: "object",
                        properties: {
                            fiscalYearEnd: { type: "string" },
                            nextEarnings: { type: "string" },
                            annualReports: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, description: { type: "string" }, size: { type: "string" } } } },
                            quarterlyReports: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, description: { type: "string" } } } },
                            investorPresentations: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" } } } },
                            earningsReleases: { type: "array", items: { type: "object", properties: { title: { type: "string" }, date: { type: "string" } } } },
                            plStatements: { type: "array", items: { type: "object", properties: { year: { type: "string" }, revenue: { type: "string" }, netIncome: { type: "string" } } } },
                            fiscalYearData: { type: "array", items: { type: "object", properties: { year: { type: "string" }, revenue: { type: "string" }, earnings: { type: "string" }, assets: { type: "string" } } } }
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
                const priceData = data.priceHistory || Array.from({ length: 36 }, (_, i) => ({
                    month: `M${i + 1}`,
                    price: stock.price * (0.7 + Math.random() * 0.6)
                }));
                const startPrice = priceData[0]?.price || stock.price * 0.8;
                const highPrice = Math.max(...priceData.map(p => p.price));
                const lowPrice = Math.min(...priceData.map(p => p.price));
                const currentPrice = stock.price;
                
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

                        {/* 36-Month Price History Chart with Hover Events */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <LineChart className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">36-Month Price History</h3>
                                </div>
                                <span className="text-sm text-gray-500">Hover for details</span>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={priceData}>
                                        <defs>
                                            <linearGradient id="priceGradientOverview" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
                                        <Tooltip 
                                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}
                                            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Area type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} fill="url(#priceGradientOverview)" 
                                            activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Starting Point</p>
                                    <p className="text-lg font-bold text-blue-600">${startPrice.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">High Point</p>
                                    <p className="text-lg font-bold text-green-600">${highPrice.toFixed(2)}</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Low Point</p>
                                    <p className="text-lg font-bold text-red-600">${lowPrice.toFixed(2)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Current Position</p>
                                    <p className="text-lg font-bold text-purple-600">${currentPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Metrics Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-gray-600">Competitive Position</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stock.moat >= 70 ? 'Strong' : stock.moat >= 50 ? 'Moderate' : 'Limited'}</p>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${stock.moat}%` }} />
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-600">Equity Returns</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{stock.roe}%</p>
                                <p className="text-xs text-gray-500 mt-1">{stock.roe >= 20 ? 'Efficient' : 'Average'}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-gray-600">Z-Score Risk</span>
                                </div>
                                <p className={`text-2xl font-bold ${stock.zscore >= 3 ? 'text-green-600' : stock.zscore >= 1.8 ? 'text-yellow-600' : 'text-red-600'}`}>{stock.zscore?.toFixed(2)}</p>
                                <p className="text-xs text-gray-500 mt-1">{stock.zscore >= 3 ? 'Safe Zone' : stock.zscore >= 1.8 ? 'Grey Zone' : 'Risk Zone'}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-600">Margin of Safety</span>
                                </div>
                                <p className={`text-2xl font-bold ${(data.marginOfSafety || 8) > 15 ? 'text-green-600' : 'text-yellow-600'}`}>{data.marginOfSafety || 8}%</p>
                                <p className="text-xs text-gray-500 mt-1">{(data.marginOfSafety || 8) > 15 ? 'Attractive' : 'Limited'}</p>
                            </div>
                        </div>
                    </div>
                );
            
            case 'moat':
                const moatRadarData = [
                    { subject: 'Brand', A: data.moatBreakdown?.brandPower || 73, fullMark: 100 },
                    { subject: 'Switching', A: data.moatBreakdown?.switchingCosts || 87, fullMark: 100 },
                    { subject: 'Network', A: data.moatBreakdown?.networkEffects || 65, fullMark: 100 },
                    { subject: 'Cost', A: data.moatBreakdown?.costAdvantages || 45, fullMark: 100 },
                    { subject: 'Scale', A: 68, fullMark: 100 },
                    { subject: 'Regulation', A: 55, fullMark: 100 },
                ];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">MOAT Score</h3>
                                    </div>
                                    <span className="text-3xl font-bold text-purple-600">{stock.moat}<span className="text-lg text-gray-400">/100</span></span>
                                </div>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={moatRadarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                            <Radar name="Score" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Competitive Advantages</h3>
                                <div className="space-y-3">
                                    <MoatBar label="Brand Strength" value={data.moatBreakdown?.brandPower || 73} />
                                    <MoatBar label="Switching Difficulty" value={data.moatBreakdown?.switchingCosts || 87} color="#10B981" />
                                    <MoatBar label="Network Effect" value={data.moatBreakdown?.networkEffects || 65} />
                                    <MoatBar label="Cost Advantage" value={data.moatBreakdown?.costAdvantages || 45} color="#F59E0B" />
                                    <MoatBar label="Scale Advantage" value={68} color="#3B82F6" />
                                    <MoatBar label="Regulatory Moat" value={55} color="#EC4899" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Return on Equity</h3>
                                </div>
                                <div className="text-center mb-4">
                                    <span className="text-5xl font-bold text-green-600">{stock.roe}%</span>
                                </div>
                                <p className="text-sm text-gray-600 text-center">{stock.roe >= 20 ? 'Strong financial efficiency' : 'Average efficiency'}</p>
                                <div className="mt-4 h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'ROE', value: stock.roe, fill: '#10B981' },
                                            { name: 'ROA', value: stock.roa || 12, fill: '#3B82F6' },
                                            { name: 'ROIC', value: stock.roic || 18, fill: '#8B5CF6' }
                                        ]}>
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                                            <Tooltip formatter={(v) => `${v}%`} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {[0, 1, 2].map((_, i) => <Cell key={i} fill={['#10B981', '#3B82F6', '#8B5CF6'][i]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <h3 className="font-semibold text-gray-900">Altman Z-Score</h3>
                                </div>
                                <div className="text-center mb-4">
                                    <span className={`text-5xl font-bold ${stock.zscore >= 3 ? 'text-green-600' : stock.zscore >= 1.8 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {stock.zscore?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center justify-between p-2 rounded bg-green-50">
                                        <span className="text-sm">Safe Zone (&gt;3.0)</span>
                                        <span className="text-sm font-medium text-green-600">Low Risk</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-yellow-50">
                                        <span className="text-sm">Grey Zone (1.8-3.0)</span>
                                        <span className="text-sm font-medium text-yellow-600">Monitor</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-red-50">
                                        <span className="text-sm">Distress Zone (&lt;1.8)</span>
                                        <span className="text-sm font-medium text-red-600">High Risk</span>
                                    </div>
                                </div>
                                <div className="mt-4 h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full relative">
                                    <div className="absolute -top-1 w-4 h-4 bg-white border-2 border-purple-600 rounded-full" 
                                        style={{ left: `${Math.min(Math.max((stock.zscore / 5) * 100, 0), 100)}%`, transform: 'translateX(-50%)' }} />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Investment Thesis</h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600">{data.thesis || `${stock.name} demonstrates a solid competitive position with ${stock.moat >= 70 ? 'strong' : 'moderate'} moat characteristics.`}</p>
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">Full Analysis Available</p>
                                        <ul className="space-y-1.5">
                                            {(data.advantages || ['Strong brand recognition', 'High switching costs', 'Network effects present']).map((adv, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                    {adv}
                                                </li>
                                            ))}
                                        </ul>
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
                const sentimentGaugeData = [
                    { name: 'Fear', value: 35, fill: '#EF4444' },
                    { name: 'Neutral', value: 30, fill: '#F59E0B' },
                    { name: 'Greed', value: 35, fill: '#10B981' }
                ];
                const currentSentiment = (data.sentimentScore || 42) > 65 ? 2 : (data.sentimentScore || 42) > 35 ? 1 : 0;
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Sentiment Indicator</h3>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-5xl font-bold text-orange-600">{data.sentimentScore || 42}</p>
                                    <p className="text-sm text-gray-500 mt-1">Fear Index</p>
                                </div>
                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie data={sentimentGaugeData} dataKey="value" cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80}>
                                                {sentimentGaugeData.map((entry, i) => <Cell key={i} fill={entry.fill} opacity={i === currentSentiment ? 1 : 0.3} />)}
                                            </Pie>
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-2">Current: <span className="font-bold text-orange-700">Pessimism Elevated</span></p>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Analyst Ratings</h3>
                                <div className="grid grid-cols-3 gap-3 mb-4">
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
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-700">Market Expectations: <span className="font-bold text-purple-700">Aggressive</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Risks under-recognized, contrarian opportunity</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Ownership & Activity</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Institutional Ownership</p>
                                    <p className={`text-xl font-bold mt-1 ${data.institutionalChange === 'Increasing' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {data.institutionalChange || 'Increasing'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Insider Activity</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1">{data.insiderActivity || 'Net buying'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Short Interest</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1">{data.shortInterest || 2.4}%</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Contrarian View
                            </h4>
                            <p className="text-sm text-blue-800">Value investor framework highlights opportunity when sentiment is depressed. Current fear levels may indicate attractive entry point for long-term investors.</p>
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
                const valuationComparison = [
                    { metric: 'Current', value: stock.price, fill: '#8B5CF6' },
                    { metric: 'Intrinsic', value: data.fairValue || (stock.price * 1.1), fill: '#10B981' },
                    { metric: 'Market Avg', value: data.sectorAvgPE ? (stock.eps * data.sectorAvgPE) : (stock.price * 0.95), fill: '#6B7280' }
                ];
                const valuationMetrics = [
                    { metric: 'P/E Ratio', current: stock.pe || 20, historical: 18, sector: data.sectorAvgPE || 22 },
                    { metric: 'P/B Ratio', current: 3.2, historical: 2.8, sector: 3.5 },
                    { metric: 'EV/EBITDA', current: 12.5, historical: 11.2, sector: 14.0 },
                    { metric: 'Price/Sales', current: 4.8, historical: 4.2, sector: 5.2 }
                ];
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Valuation Overview</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    data.marginOfSafety > 15 ? 'bg-green-100 text-green-700' : 
                                    data.marginOfSafety > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {data.marginOfSafety > 15 ? 'Undervalued' : data.marginOfSafety > 0 ? 'Fair Value' : 'Overvalued'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={valuationComparison} layout="horizontal">
                                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                                            <YAxis type="category" dataKey="metric" tick={{ fontSize: 11 }} width={70} />
                                            <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                {valuationComparison.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-4 bg-purple-50 rounded-xl">
                                        <p className="text-sm text-gray-600">Intrinsic Valuation</p>
                                        <p className="text-2xl font-bold text-purple-600">${data.fairValue || (stock.price * 1.1).toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <p className="text-sm text-gray-600">Margin of Safety</p>
                                        <p className={`text-2xl font-bold ${(data.marginOfSafety || 8) > 0 ? 'text-green-600' : 'text-red-600'}`}>{data.marginOfSafety || 8}%</p>
                                        <p className="text-xs text-gray-500 mt-1">{(data.marginOfSafety || 8) > 15 ? 'Attractive' : (data.marginOfSafety || 8) > 0 ? 'Limited' : 'Overvalued'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-600">Current vs Long-Term Avg</p>
                                        <p className="text-lg font-bold text-gray-900">{stock.pe}x vs 18.5x</p>
                                        <p className="text-xs text-red-500 mt-1">Above average</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Key Valuation Ratios</h4>
                            <div className="space-y-4">
                                {valuationMetrics.map((m, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">{m.metric}</span>
                                            <div className="flex gap-3 text-sm">
                                                <span className="text-purple-600 font-medium">Current: {m.current}</span>
                                                <span className="text-gray-500">Hist: {m.historical}</span>
                                                <span className="text-gray-500">Sector: {m.sector}</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                            <div className="bg-purple-400" style={{ width: `${(m.current / m.sector) * 50}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'fundamentals':
                const revenueData = data.revenueGrowth || [
                    { year: '2020', growth: 12, revenue: 78 },
                    { year: '2021', growth: 18, revenue: 92 },
                    { year: '2022', growth: 15, revenue: 106 },
                    { year: '2023', growth: 22, revenue: 129 },
                    { year: '2024', growth: 28, revenue: 165 }
                ];
                const marginTrends = [
                    { year: '2020', gross: 38, operating: 24, net: 15 },
                    { year: '2021', gross: 40, operating: 26, net: 16 },
                    { year: '2022', gross: 41, operating: 27, net: 17 },
                    { year: '2023', gross: 42, operating: 28, net: 18 },
                    { year: '2024', gross: 42, operating: 28, net: 18 }
                ];
                const competitivePos = [
                    { category: 'Brand', score: 85 },
                    { category: 'Technology', score: 78 },
                    { category: 'Distribution', score: 72 },
                    { category: 'Pricing', score: 68 },
                    { category: 'Customer Base', score: 82 }
                ];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" /> Revenue & Profit Growth
                                </h3>
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}B`} />
                                            <Tooltip />
                                            <Bar yAxisId="right" dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Revenue ($B)" />
                                            <Bar yAxisId="left" dataKey="growth" fill="#10B981" radius={[4, 4, 0, 0]} name="Growth (%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Margin Trends</h3>
                                <div className="h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ReLineChart data={marginTrends}>
                                            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip formatter={(v) => `${v}%`} />
                                            <Line type="monotone" dataKey="gross" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Gross" />
                                            <Line type="monotone" dataKey="operating" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Operating" />
                                            <Line type="monotone" dataKey="net" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} name="Net" />
                                        </ReLineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-3 mt-3 justify-center text-xs">
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Gross: Stable</span>
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Operating: Stable</span>
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /> Net: Stable</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Cash Flow Quality</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Operating Cash Flow</span>
                                        <span className="font-bold text-green-600">Positive</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">FCF Yield</span>
                                        <span className="font-bold text-gray-900">4.2%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Revenue Diversified</span>
                                        <span className="font-medium text-green-600">Yes</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Competitive Position</h3>
                                <div className="space-y-2">
                                    {competitivePos.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600 w-28">{c.category}</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.score}%` }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 w-8">{c.score}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Strong across categories</p>
                            </div>
                        </div>
                    </div>
                );

            case 'financials':
                const roeBreakdown = [
                    { factor: 'Margin Contribution', value: 28, fill: '#10B981' },
                    { factor: 'Asset Usage', value: 32, fill: '#3B82F6' },
                    { factor: 'Leverage Effect', value: 40, fill: '#8B5CF6' }
                ];
                const financialRatios = [
                    { ratio: 'Earnings (P/E)', value: stock.pe || 20, benchmark: 22, status: 'Attractive' },
                    { ratio: 'Growth (PEG)', value: stock.peg || 1.2, benchmark: 1.5, status: 'Attractive' },
                    { ratio: 'Capital Efficiency', value: 18, benchmark: 15, status: 'Solid' },
                    { ratio: 'Asset Efficiency', value: 0.8, benchmark: 1.2, status: 'Low' },
                    { ratio: 'Debt Level', value: 0.45, benchmark: 0.5, status: 'Moderate' },
                    { ratio: 'Liquidity', value: 2.1, benchmark: 2.0, status: 'Reasonable' }
                ];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-green-600" /> Equity Efficiency
                                </h3>
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">ROE</span>
                                        <span className="text-2xl font-bold text-green-600">{stock.roe}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Adjusted equity returns: {stock.roe}% (boosted by efficiency)</p>
                                </div>
                                <div className="h-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={roeBreakdown} layout="horizontal">
                                            <XAxis type="number" tick={{ fontSize: 10 }} />
                                            <YAxis type="category" dataKey="factor" tick={{ fontSize: 10 }} width={120} />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                {roeBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Growth Sustainability</h3>
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Retained Earnings</span>
                                            <span className="font-bold text-green-600">55%</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Support expansion</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Self-Funded Growth</span>
                                            <span className="font-bold text-blue-600">Possible</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Minimal dilution risk</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Earnings Quality</span>
                                            <span className="font-bold text-purple-600">Consistent</span>
                                        </div>
                                        <p className="text-xs text-gray-500">Low volatility in EPS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Key Financial Ratios</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {financialRatios.map((r, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">{r.ratio}</span>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                                r.status === 'Attractive' || r.status === 'Solid' ? 'bg-green-100 text-green-700' :
                                                r.status === 'Moderate' || r.status === 'Reasonable' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{r.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">vs {r.benchmark}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Capital Structure</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500">Debt to Equity</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.debtToEquity || 0.45}</p>
                                    <p className="text-xs text-green-600 mt-1">Stable</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500">Interest Coverage</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.interestCoverage || 12.5}x</p>
                                    <p className="text-xs text-green-600 mt-1">Strong</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500">Dividend Yield</p>
                                    <p className="text-2xl font-bold text-gray-900">{stock.dividend || 2.4}%</p>
                                    <p className="text-xs text-gray-500 mt-1">Sector Dependent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'technicals':
                const priceActionData = stock.history?.slice(-20).map((p, i) => ({
                    day: `D${i + 1}`,
                    price: p,
                    ma50: data.ma50 || stock.price * 0.95,
                    support: stock.price * 0.92,
                    resistance: stock.price * 1.08
                })) || [];
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Price Level Action</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    data.trend === 'Bullish' ? 'bg-green-100 text-green-700' :
                                    data.trend === 'Bearish' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {data.trend || 'Mixed'}
                                </span>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart data={priceActionData}>
                                        <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
                                        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                                        <Line type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Price" />
                                        <Line type="monotone" dataKey="ma50" stroke="#10B981" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="50-MA" />
                                        <Line type="monotone" dataKey="support" stroke="#3B82F6" strokeWidth={1} dot={false} strokeDasharray="3 3" name="Support" />
                                        <Line type="monotone" dataKey="resistance" stroke="#EF4444" strokeWidth={1} dot={false} strokeDasharray="3 3" name="Resistance" />
                                    </ReLineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Current</p>
                                    <p className="text-lg font-bold text-purple-600">${stock.price?.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">50-MA</p>
                                    <p className="text-lg font-bold text-green-600">${data.ma50 || (stock.price * 0.95).toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Support</p>
                                    <p className="text-lg font-bold text-blue-600">${(stock.price * 0.92).toFixed(2)}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Resistance</p>
                                    <p className="text-lg font-bold text-red-600">${(stock.price * 1.08).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Momentum Indicator</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">RSI (14)</span>
                                            <span className={`font-bold text-sm ${(data.rsi || 72) > 70 ? 'text-red-600' : (data.rsi || 72) < 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {data.rsi || 72} - {(data.rsi || 72) > 70 ? 'Overbought' : (data.rsi || 72) < 30 ? 'Oversold' : 'Neutral'}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 w-1 h-full bg-purple-700" style={{ left: `${data.rsi || 72}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0 (Oversold)</span>
                                            <span>50</span>
                                            <span>100 (Overbought)</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">MACD</span>
                                            <span className={`font-medium ${data.macdSignal === 'Bullish' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {data.macdSignal || 'Weakening'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">Momentum weakening, cautious entry suggested</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Trading Metrics</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Trend Below</span>
                                        <span className="font-medium text-yellow-600">Stability Threshold</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Volume</span>
                                        <span className="font-medium text-green-600">{data.volumeTrend || 'Elevated'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Institutional Interest</span>
                                        <span className="font-medium text-green-600">Present</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <span className="text-sm text-gray-700 font-medium">Recommendation</span>
                                        <span className="font-bold text-yellow-700">Cautious</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'risk':
                const drawdownData = [
                    { month: 'Jan', drawdown: -5 },
                    { month: 'Mar', drawdown: -12 },
                    { month: 'May', drawdown: -8 },
                    { month: 'Jul', drawdown: -15 },
                    { month: 'Sep', drawdown: -6 },
                    { month: 'Nov', drawdown: -18 },
                ];
                const scenarioData = [
                    { scenario: 'Recession', impact: -35, probability: 15 },
                    { scenario: 'Rate Hikes', impact: -20, probability: 25 },
                    { scenario: 'Tech Disruption', impact: -25, probability: 20 },
                    { scenario: 'Inflation', impact: -15, probability: 30 },
                    { scenario: 'Moat Erosion', impact: -40, probability: 10 },
                ];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900">Risk Score</h3>
                                    </div>
                                    <span className="text-3xl font-bold text-orange-600">{data.riskScore || 4.2}<span className="text-lg text-gray-400">/10</span></span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">Volatility</p>
                                        <p className="text-lg font-bold text-gray-900">{data.volatility || 'Medium-High'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">Beta</p>
                                        <p className="text-lg font-bold text-gray-900">{data.beta || 1.15}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">Sharpe Ratio</p>
                                        <p className="text-lg font-bold text-gray-900">{data.sharpeRatio || 1.2}</p>
                                    </div>
                                </div>
                                <div className="h-40">
                                    <p className="text-sm text-gray-600 mb-2">Drawdown History</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={drawdownData}>
                                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip formatter={(v) => `${v}%`} />
                                            <Bar dataKey="drawdown" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Stress Test Scenarios</h3>
                                <div className="space-y-3">
                                    {scenarioData.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600 w-28">{s.scenario}</span>
                                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.abs(s.impact)}%` }} />
                                            </div>
                                            <span className="text-sm font-medium text-red-600 w-12">{s.impact}%</span>
                                            <span className="text-xs text-gray-400 w-10">{s.probability}% prob</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-800">Permanent Loss Simulation: <span className="font-bold">-{data.maxDrawdown || 35}%</span> worst case</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4" /> Company Risks
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(data.companyRisks || ['Market pressure', 'Competition', 'Regulation']).map((r, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">{r}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Macro Risks
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(data.macroRisks || ['Interest rates', 'Inflation', 'Recession']).map((r, i) => (
                                        <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">{r}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Economic Environment</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Economic Cycle</span>
                                        <span className="font-medium text-green-600">Expansion</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Sector Trend</span>
                                        <span className="font-medium text-green-600">Favorable</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Currency Exposure</span>
                                        <span className="font-medium text-yellow-600">Global</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Geopolitical Risk</span>
                                        <span className="font-medium text-yellow-600">Moderate</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Market & Trading Profile</h4>
                            <div className="grid grid-cols-6 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Market Cap</p>
                                    <p className="text-lg font-bold text-gray-900">${stock.marketCap}B</p>
                                    <p className="text-xs text-green-600">Large Cap</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Volume</p>
                                    <p className="text-lg font-bold text-gray-900">{stock.volume}</p>
                                    <p className="text-xs text-green-600">Strong</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Trading Range</p>
                                    <p className="text-lg font-bold text-gray-900">${(stock.price * 0.7).toFixed(0)}-${(stock.price * 1.3).toFixed(0)}</p>
                                    <p className="text-xs text-yellow-600">Wide</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Commodity</p>
                                    <p className="text-lg font-bold text-gray-900">Low</p>
                                    <p className="text-xs text-gray-500">Sensitivity</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Institutional</p>
                                    <p className="text-lg font-bold text-gray-900">78%</p>
                                    <p className="text-xs text-green-600">Present</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Risk-Adjusted</p>
                                    <p className="text-lg font-bold text-green-600">Stable</p>
                                    <p className="text-xs text-gray-500">Return</p>
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
                const yieldStrategy = {
                    dividendYield: data.yield || stock.dividend || 2.4,
                    growthExpectation: data.growthRate || 8.5,
                    totalYield: (data.yield || stock.dividend || 2.4) + (data.growthRate || 8.5)
                };
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Yield Strategy</h3>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                    Income & Growth
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Dividend Provided</p>
                                    <p className="text-2xl font-bold text-green-600">{yieldStrategy.dividendYield}%</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Growth Expectation</p>
                                    <p className="text-2xl font-bold text-blue-600">{yieldStrategy.growthExpectation}%</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Total Yield Combo</p>
                                    <p className="text-2xl font-bold text-purple-600">{yieldStrategy.totalYield.toFixed(1)}%</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">Strategy suitable for income and growth investors seeking {yieldStrategy.dividendYield}% current yield with {yieldStrategy.growthExpectation}% dividend growth potential.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Dividend Metrics</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        (data.safetyScore || 75) >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        Safety: {data.safetyScore || 75}/100
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">Annual Dividend</p>
                                        <p className="text-xl font-bold text-purple-600">${data.annualDividend || 4.40}</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">Payout Ratio</p>
                                        <p className="text-xl font-bold text-orange-600">{data.payoutRatio || 45}%</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Dividend Schedule</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Ex-Dividend Date</span>
                                        <span className="text-sm font-medium text-gray-900">{data.exDividendDate || 'Feb 15, 2025'}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Payment Date</span>
                                        <span className="text-sm font-medium text-gray-900">Mar 1, 2025</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Frequency</span>
                                        <span className="text-sm font-medium text-gray-900">Quarterly</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Dividend Growth History</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart data={dividendHistory}>
                                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip formatter={(v) => [`$${v}`, 'Annual Dividend']} />
                                        <Line type="monotone" dataKey="dividend" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
                                    </ReLineChart>
                                </ResponsiveContainer>
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
                    const annualDividend = (stock.dividend || 2) * shares;
                    const totalDividends = annualDividend * yearsToHold;
                    return { 
                        shares: shares.toFixed(2), 
                        futurePrice: futurePrice.toFixed(2), 
                        futureValue: futureValue.toFixed(2), 
                        profit: (futureValue - investmentAmount).toFixed(2),
                        annualDividend: annualDividend.toFixed(2),
                        totalDividends: totalDividends.toFixed(2),
                        totalReturn: (futureValue + totalDividends - investmentAmount).toFixed(2)
                    };
                };
                const simResult = calculateFutureValue();
                const projectionData = Array.from({ length: yearsToHold + 1 }, (_, i) => ({
                    year: `Year ${i}`,
                    value: investmentAmount * Math.pow(1 + expectedReturn / 100, i),
                    withDividends: investmentAmount * Math.pow(1 + expectedReturn / 100, i) + ((stock.dividend || 2) * (investmentAmount / stock.price) * i)
                }));
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Investment Simulator</h3>
                                </div>
                                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">$100 to $4,000,000</span>
                            </div>
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Investment Amount</label>
                                    <div className="flex flex-wrap gap-1 mb-2">
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
                            <div className="grid grid-cols-5 gap-3">
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">Shares Ownership</p>
                                    <p className="text-xl font-bold text-gray-900">{simResult.shares}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">Future Price</p>
                                    <p className="text-xl font-bold text-blue-600">${simResult.futurePrice}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">Future Value</p>
                                    <p className="text-xl font-bold text-purple-600">${Number(simResult.futureValue).toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">Annual Dividend</p>
                                    <p className="text-xl font-bold text-green-600">${Number(simResult.annualDividend).toLocaleString()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-xs text-gray-500">Total Return</p>
                                    <p className={`text-xl font-bold ${Number(simResult.totalReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(simResult.totalReturn) >= 0 ? '+' : ''}${Number(simResult.totalReturn).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Investment Projection</h4>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={projectionData}>
                                            <defs>
                                                <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="divGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                                            <Area type="monotone" dataKey="withDividends" stroke="#10B981" strokeWidth={2} fill="url(#divGradient)" name="With Dividends" />
                                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#projGradient)" name="Capital Only" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Investment Strategy</h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <p className="text-sm font-medium text-blue-900">Dollar-Cost Averaging Suggested</p>
                                        <p className="text-xs text-blue-700 mt-1">Consider investing ${(investmentAmount / 12).toFixed(0)}/month over 12 months</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <p className="text-sm font-medium text-green-900">Guidance: Start Gradually</p>
                                        <p className="text-xs text-green-700 mt-1">Begin with 25% position, add on pullbacks</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <p className="text-xs text-gray-500">Total Dividends</p>
                                            <p className="text-lg font-bold text-green-600">${Number(simResult.totalDividends).toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <p className="text-xs text-gray-500">Yield on Cost</p>
                                            <p className="text-lg font-bold text-purple-600">{((Number(simResult.annualDividend) / investmentAmount) * 100).toFixed(2)}%</p>
                                        </div>
                                    </div>
                                </div>
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
                const scenarios = [
                    { name: 'Bear', target: data.bearTarget || (stock.price * 0.6), probability: data.bearProbability || 20, color: '#EF4444' },
                    { name: 'Base', target: stock.price, probability: 100 - (data.bearProbability || 20) - (data.bullProbability || 35), color: '#F59E0B' },
                    { name: 'Bull', target: data.bullTarget || (stock.price * 1.5), probability: data.bullProbability || 35, color: '#10B981' }
                ];
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
                                        ${data.bullTarget || (stock.price * 1.5).toFixed(2)}
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
                                        ${data.bearTarget || (stock.price * 0.6).toFixed(2)}
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
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Price Target Scenarios</h4>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={scenarios} layout="horizontal">
                                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                                            <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                                            <Bar dataKey="target" radius={[0, 8, 8, 0]}>
                                                {scenarios.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Scenario Probability</h4>
                                <div className="space-y-4 mb-4">
                                    {scenarios.map((s, i) => (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium" style={{ color: s.color }}>{s.name} Scenario</span>
                                                <span className="text-sm font-bold text-gray-900">{s.probability}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${s.probability}%`, backgroundColor: s.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-purple-800">Probability of undervaluation: <span className="font-bold">Medium-High</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Future Outlook</h4>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 text-center p-4 bg-red-50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Bear Scenario</p>
                                    <p className="text-2xl font-bold text-red-600">${scenarios[0].target.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{scenarios[0].probability}% probability</p>
                                </div>
                                <div className="flex-1 text-center p-4 bg-yellow-50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Base Scenario</p>
                                    <p className="text-2xl font-bold text-yellow-600">${scenarios[1].target.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{scenarios[1].probability}% probability</p>
                                </div>
                                <div className="flex-1 text-center p-4 bg-green-50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Bull Scenario</p>
                                    <p className="text-2xl font-bold text-green-600">${scenarios[2].target.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{scenarios[2].probability}% probability</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'investor-relations':
                const irData = sectionData['investor-relations'] || {};
                const reportTabs = [
                    { id: 'annual', label: 'Annual Reports', count: 3, icon: FileText },
                    { id: 'quarterly', label: 'Quarterly Reports', count: 4, icon: FileText },
                    { id: 'presentations', label: 'Investor Presentations', count: 3, icon: Play },
                    { id: 'earnings', label: 'Earnings Releases', count: 4, icon: TrendingUp },
                    { id: 'pnl', label: 'P&L Statements', count: 3, icon: DollarSign },
                    { id: 'fiscal', label: 'Fiscal Year Data', count: 3, icon: Calendar },
                ];
                
                return (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Building className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{stock.name} Investor Relations</h2>
                                        <p className="text-sm text-gray-500">{stock.ticker} • {stock.sector}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Fiscal Year End</p>
                                    <p className="text-sm font-semibold text-gray-900">{irData.fiscalYearEnd || 'December 31'}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Next Earnings: {irData.nextEarnings || 'January 2025'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-1">
                            {reportTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveReportTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                        activeReportTab === tab.id 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${activeReportTab === tab.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            {activeReportTab === 'annual' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-gray-900">Annual Reports</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(irData.annualReports || [
                                            { title: `Annual Report 2024`, date: 'February 28, 2025', description: `Comprehensive financial and operational overview for the fiscal year ending December 31, 2024.` },
                                            { title: `Annual Report 2023`, date: 'February 28, 2024', description: `Comprehensive financial and operational overview for the fiscal year ending December 31, 2023.` },
                                            { title: `Annual Report 2022`, date: 'February 28, 2023', description: `Comprehensive financial and operational overview for the fiscal year ending December 31, 2022.` }
                                        ]).map((r, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FileText className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{r.title}</p>
                                                    <p className="text-sm text-gray-500">{r.date} •</p>
                                                    <p className="text-xs text-gray-400 mt-1">{r.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeReportTab === 'quarterly' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900">Quarterly Reports</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(irData.quarterlyReports || [
                                            { title: `Q4 2024 Report (10-Q)`, date: 'January 2025', description: 'Fourth quarter financial results' },
                                            { title: `Q3 2024 Report (10-Q)`, date: 'October 2024', description: 'Third quarter financial results' },
                                            { title: `Q2 2024 Report (10-Q)`, date: 'July 2024', description: 'Second quarter financial results' },
                                            { title: `Q1 2024 Report (10-Q)`, date: 'April 2024', description: 'First quarter financial results' }
                                        ]).map((r, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{r.title}</p>
                                                    <p className="text-sm text-gray-500">{r.date} •</p>
                                                    <p className="text-xs text-gray-400 mt-1">{r.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeReportTab === 'presentations' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Play className="w-5 h-5 text-cyan-600" />
                                        <h3 className="font-semibold text-gray-900">Investor Presentations</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(irData.investorPresentations || [
                                            { title: `Investor Day 2024`, date: 'November 2024' },
                                            { title: `Capital Markets Day`, date: 'September 2024' },
                                            { title: `Technology Summit Presentation`, date: 'June 2024' }
                                        ]).map((r, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                                <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                                    <Play className="w-4 h-4 text-cyan-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{r.title}</p>
                                                    <p className="text-sm text-gray-500">{r.date}</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeReportTab === 'earnings' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-gray-900">Earnings Releases</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(irData.earningsReleases || [
                                            { title: `Q4 2024 Earnings Release`, date: 'January 28, 2025' },
                                            { title: `Q3 2024 Earnings Release`, date: 'October 25, 2024' },
                                            { title: `Q2 2024 Earnings Release`, date: 'July 24, 2024' },
                                            { title: `Q1 2024 Earnings Release`, date: 'April 25, 2024' }
                                        ]).map((r, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                                                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{r.title}</p>
                                                    <p className="text-sm text-gray-500">{r.date}</p>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeReportTab === 'pnl' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900">P&L Statements</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {(irData.plStatements || [
                                            { year: 'FY 2024', revenue: '$98.5B', netIncome: '$24.2B' },
                                            { year: 'FY 2023', revenue: '$88.2B', netIncome: '$21.8B' },
                                            { year: 'FY 2022', revenue: '$79.5B', netIncome: '$19.4B' }
                                        ]).map((r, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <DollarSign className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{r.year} P&L Statement</p>
                                                    <p className="text-sm text-gray-500">Revenue: {r.revenue} • Net Income: {r.netIncome}</p>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeReportTab === 'fiscal' && (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-semibold text-gray-900">Fiscal Year Data</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Year</th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Earnings</th>
                                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Assets</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(irData.fiscalYearData || [
                                                    { year: 'FY 2024', revenue: '$98.5B', earnings: '$24.2B', assets: '$412B' },
                                                    { year: 'FY 2023', revenue: '$88.2B', earnings: '$21.8B', assets: '$385B' },
                                                    { year: 'FY 2022', revenue: '$79.5B', earnings: '$19.4B', assets: '$352B' }
                                                ]).map((fy, i) => (
                                                    <tr key={i} className="border-b border-gray-100">
                                                        <td className="py-3 px-4 font-medium text-gray-900">{fy.year}</td>
                                                        <td className="py-3 px-4 text-right text-gray-700">{fy.revenue}</td>
                                                        <td className="py-3 px-4 text-right text-green-600 font-medium">{fy.earnings}</td>
                                                        <td className="py-3 px-4 text-right text-gray-700">{fy.assets}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
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

            case 'legends':
                const legendaryFrameworks = [
                    { 
                        name: 'Warren Buffett', style: 'Value / Moat', color: '#8B5CF6',
                        metrics: [
                            { label: 'MOAT Score', value: stock.moat, max: 100, good: 70 },
                            { label: 'ROE', value: stock.roe, max: 40, good: 15 },
                            { label: 'Debt/Equity', value: 45, max: 100, good: 50, inverse: true }
                        ],
                        verdict: stock.moat >= 70 && stock.roe >= 15 ? 'Strong Buy' : stock.moat >= 50 ? 'Hold' : 'Avoid'
                    },
                    { 
                        name: 'Peter Lynch', style: 'GARP', color: '#10B981',
                        metrics: [
                            { label: 'PEG Ratio', value: stock.peg || 1.2, max: 3, good: 1, inverse: true },
                            { label: 'Earnings Growth', value: stock.sgr || 15, max: 40, good: 15 },
                            { label: 'P/E Ratio', value: stock.pe || 20, max: 40, good: 20, inverse: true }
                        ],
                        verdict: (stock.peg || 1.2) <= 1 ? 'Strong Buy' : (stock.peg || 1.2) <= 1.5 ? 'Buy' : 'Hold'
                    },
                    { 
                        name: 'Joel Greenblatt', style: 'Magic Formula', color: '#3B82F6',
                        metrics: [
                            { label: 'ROIC', value: stock.roic || 18, max: 40, good: 15 },
                            { label: 'Earnings Yield', value: 8.5, max: 20, good: 8 },
                            { label: 'EV/EBIT', value: 12, max: 25, good: 12, inverse: true }
                        ],
                        verdict: (stock.roic || 18) >= 20 ? 'Top Quartile' : (stock.roic || 18) >= 12 ? 'Above Avg' : 'Below Avg'
                    },
                    { 
                        name: 'John Templeton', style: 'Global Contrarian', color: '#F59E0B',
                        metrics: [
                            { label: 'Pessimism Index', value: 65, max: 100, good: 70 },
                            { label: 'Global Value', value: 72, max: 100, good: 60 },
                            { label: 'Contrarian Signal', value: 78, max: 100, good: 65 }
                        ],
                        verdict: 'Contrarian Buy'
                    },
                    { 
                        name: 'Aswath Damodaran', style: 'Academic DCF', color: '#EC4899',
                        metrics: [
                            { label: 'DCF Value vs Price', value: 15, max: 50, good: 10 },
                            { label: 'WACC', value: 9.5, max: 15, good: 10, inverse: true },
                            { label: 'Growth Rate', value: stock.sgr || 12, max: 30, good: 10 }
                        ],
                        verdict: 'Fairly Valued'
                    },
                    { 
                        name: 'Cathie Wood', style: 'Disruptive Innovation', color: '#6366F1',
                        metrics: [
                            { label: 'Innovation Score', value: 75, max: 100, good: 70 },
                            { label: 'TAM Growth', value: 85, max: 100, good: 60 },
                            { label: 'S-Curve Position', value: 65, max: 100, good: 50 }
                        ],
                        verdict: stock.sector === 'Technology' ? 'Innovation Play' : 'Not Focus'
                    },
                    { 
                        name: 'Benjamin Graham', style: 'Value Investing', color: '#14B8A6',
                        metrics: [
                            { label: 'Margin of Safety', value: 18, max: 50, good: 25 },
                            { label: 'Net-Net Score', value: 45, max: 100, good: 60 },
                            { label: 'Intrinsic Value Gap', value: 12, max: 40, good: 15 }
                        ],
                        verdict: stock.pe < 15 ? 'Graham Value' : 'Not Cheap Enough'
                    },
                    { 
                        name: 'Ray Dalio', style: 'Risk Parity', color: '#0EA5E9',
                        metrics: [
                            { label: 'Diversification', value: 72, max: 100, good: 70 },
                            { label: 'Cycle Position', value: 65, max: 100, good: 50 },
                            { label: 'Risk Balance', value: 78, max: 100, good: 70 }
                        ],
                        verdict: 'Portfolio Fit'
                    },
                    { 
                        name: 'George Soros', style: 'Reflexivity Theory', color: '#EF4444',
                        metrics: [
                            { label: 'Market Psychology', value: 58, max: 100, good: 40 },
                            { label: 'Momentum Signal', value: 72, max: 100, good: 60 },
                            { label: 'Macro Trend', value: 68, max: 100, good: 55 }
                        ],
                        verdict: 'Trend Following'
                    },
                    { 
                        name: 'Stanley Druckenmiller', style: 'Macro Opportunism', color: '#84CC16',
                        metrics: [
                            { label: 'Liquidity Flows', value: 75, max: 100, good: 60 },
                            { label: 'Fed Policy', value: 62, max: 100, good: 50 },
                            { label: 'Risk-On Signal', value: 70, max: 100, good: 60 }
                        ],
                        verdict: 'Macro Favorable'
                    },
                    { 
                        name: 'David Dreman', style: 'Contrarian Value', color: '#A855F7',
                        metrics: [
                            { label: 'Low P/E Score', value: stock.pe < 15 ? 85 : stock.pe < 20 ? 60 : 35, max: 100, good: 70 },
                            { label: 'Behavioral Bias', value: 72, max: 100, good: 65 },
                            { label: 'Overreaction Index', value: 68, max: 100, good: 60 }
                        ],
                        verdict: stock.pe < 15 ? 'Contrarian Buy' : 'Wait for Dip'
                    },
                    { 
                        name: 'John Bogle', style: 'Index / Passive', color: '#64748B',
                        metrics: [
                            { label: 'Cost Efficiency', value: 88, max: 100, good: 80 },
                            { label: 'Diversification', value: 75, max: 100, good: 70 },
                            { label: 'Long-Term Compound', value: 82, max: 100, good: 70 }
                        ],
                        verdict: 'Index Component'
                    },
                    { 
                        name: 'Seth Klarman', style: 'Deep Value', color: '#059669',
                        metrics: [
                            { label: 'Cash Optionality', value: 65, max: 100, good: 60 },
                            { label: 'Patience Score', value: 80, max: 100, good: 75 },
                            { label: 'Distress Signal', value: 35, max: 100, good: 30 }
                        ],
                        verdict: 'Margin of Safety OK'
                    },
                    { 
                        name: 'Jim Simons', style: 'Quantitative', color: '#7C3AED',
                        metrics: [
                            { label: 'Statistical Arbitrage', value: 78, max: 100, good: 70 },
                            { label: 'Data Patterns', value: 82, max: 100, good: 75 },
                            { label: 'Alpha Signal', value: 71, max: 100, good: 65 }
                        ],
                        verdict: 'Quant Signal: Neutral'
                    },
                    { 
                        name: 'Carl Icahn', style: 'Activist Investing', color: '#DC2626',
                        metrics: [
                            { label: 'Governance Score', value: 68, max: 100, good: 60 },
                            { label: 'Unlock Value', value: 55, max: 100, good: 50 },
                            { label: 'Strategic Pressure', value: 42, max: 100, good: 40 }
                        ],
                        verdict: 'No Activism Needed'
                    },
                    { 
                        name: 'David Tepper', style: 'Distressed Debt', color: '#EA580C',
                        metrics: [
                            { label: 'Credit Cycle', value: 72, max: 100, good: 60 },
                            { label: 'Capital Structure', value: 78, max: 100, good: 70 },
                            { label: 'Bold Risk Score', value: 65, max: 100, good: 55 }
                        ],
                        verdict: 'Opportunistic Hold'
                    }
                ];

                const legendRadarData = [
                    { subject: 'Value', Buffett: 85, Lynch: 70, Greenblatt: 80, Graham: 90 },
                    { subject: 'Growth', Buffett: 60, Lynch: 85, Greenblatt: 70, Graham: 40 },
                    { subject: 'Quality', Buffett: 90, Lynch: 75, Greenblatt: 85, Graham: 70 },
                    { subject: 'Momentum', Buffett: 30, Lynch: 65, Greenblatt: 50, Graham: 20 },
                    { subject: 'Safety', Buffett: 85, Lynch: 60, Greenblatt: 75, Graham: 95 }
                ];

                const overallScores = legendaryFrameworks.map(l => ({
                    name: l.name.split(' ')[1] || l.name.split(' ')[0],
                    score: Math.round(l.metrics.reduce((sum, m) => sum + (m.inverse ? (m.max - m.value) / m.max * 100 : m.value / m.max * 100), 0) / l.metrics.length),
                    color: l.color
                })).sort((a, b) => b.score - a.score);

                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Award className="w-8 h-8" />
                                <div>
                                    <h2 className="text-2xl font-bold">Legendary Investor Frameworks</h2>
                                    <p className="text-white/80">Analyze {stock.ticker} through 16 iconic investment philosophies</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {overallScores.slice(0, 4).map((s, i) => (
                                    <div key={i} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                                        <p className="text-sm text-white/80">#{i + 1} {s.name}</p>
                                        <p className="text-3xl font-bold">{s.score}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Value vs Growth Comparison</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={legendRadarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                            <Radar name="Buffett" dataKey="Buffett" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                                            <Radar name="Lynch" dataKey="Lynch" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                            <Radar name="Graham" dataKey="Graham" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 mt-2">
                                    <span className="flex items-center gap-1 text-xs"><div className="w-3 h-3 rounded-full bg-purple-500" /> Buffett</span>
                                    <span className="flex items-center gap-1 text-xs"><div className="w-3 h-3 rounded-full bg-green-500" /> Lynch</span>
                                    <span className="flex items-center gap-1 text-xs"><div className="w-3 h-3 rounded-full bg-teal-500" /> Graham</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Framework Ranking</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={overallScores.slice(0, 8)} layout="vertical">
                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                                            <Tooltip />
                                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                                {overallScores.slice(0, 8).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {legendaryFrameworks.map((legend, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: legend.color }}>
                                            {legend.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{legend.name}</p>
                                            <p className="text-xs text-gray-500">{legend.style}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        {legend.metrics.map((m, j) => (
                                            <div key={j}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600">{m.label}</span>
                                                    <span className="font-medium">{typeof m.value === 'number' ? m.value.toFixed(1) : m.value}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all" 
                                                        style={{ 
                                                            width: `${Math.min((m.value / m.max) * 100, 100)}%`,
                                                            backgroundColor: (m.inverse ? m.value < m.good : m.value >= m.good) ? '#10B981' : '#F59E0B'
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            legend.verdict.includes('Buy') || legend.verdict.includes('Strong') || legend.verdict.includes('Top') ? 'bg-green-100 text-green-700' :
                                            legend.verdict.includes('Hold') || legend.verdict.includes('OK') || legend.verdict.includes('Fit') ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {legend.verdict}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Framework Consensus
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Bullish Frameworks</p>
                                    <p className="text-3xl font-bold text-green-600">{legendaryFrameworks.filter(l => l.verdict.includes('Buy') || l.verdict.includes('Strong')).length}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Neutral Frameworks</p>
                                    <p className="text-3xl font-bold text-yellow-600">{legendaryFrameworks.filter(l => l.verdict.includes('Hold') || l.verdict.includes('OK') || l.verdict.includes('Neutral')).length}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-600">Bearish Frameworks</p>
                                    <p className="text-3xl font-bold text-red-600">{legendaryFrameworks.filter(l => l.verdict.includes('Avoid') || l.verdict.includes('Not')).length}</p>
                                </div>
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