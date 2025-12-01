import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { base44 } from '@/api/base44Client';

export default function MarketOverviewChart({ stocks, onFilterByGroup }) {
    const [viewMode, setViewMode] = useState('sector'); // 'sector' or 'industry'
    const [timeRange, setTimeRange] = useState('24h'); // '24h', '48h', 'week'
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    // Get unique sectors and industries from stocks
    const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))].sort();
    const industries = [...new Set(stocks.map(s => s.industry).filter(Boolean))].sort();

    // Create a map of stocks by sector/industry for tooltips
    const stocksByGroup = useMemo(() => {
        const map = {};
        stocks.forEach(stock => {
            const key = viewMode === 'sector' ? stock.sector : stock.industry;
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(stock);
            }
        });
        return map;
    }, [stocks, viewMode]);

    useEffect(() => {
        if (stocks.length > 0) {
            fetchMarketData();
        }
    }, [stocks, viewMode, timeRange]);

    const fetchMarketData = async () => {
        setLoading(true);
        const timeLabel = timeRange === '24h' ? '24 hours' : timeRange === '48h' ? '48 hours' : 'week';
        try {
            const items = viewMode === 'sector' ? sectors : industries.slice(0, 20);
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide realistic ${timeLabel} market performance data for these ${viewMode === 'sector' ? 'sectors' : 'industries'}: ${items.join(', ')}

For each, provide:
- Percentage change in the last ${timeLabel} (between -8% and +8% for week, -5% and +5% for 24/48h, realistic based on current market conditions)
- Brief 5-word market sentiment

Make the data realistic and varied - some should be up, some down.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    change: { type: "number" },
                                    sentiment: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const llmData = response?.data || [];
            
            // Map to chart data format
            const formattedData = items.map(item => {
                const llmItem = llmData.find(d => d.name?.toLowerCase() === item.toLowerCase());
                const stocksInItem = stocks.filter(s => 
                    viewMode === 'sector' ? s.sector === item : s.industry === item
                );
                const avgChange = stocksInItem.length > 0 
                    ? stocksInItem.reduce((sum, s) => sum + (s.change || 0), 0) / stocksInItem.length
                    : 0;
                
                return {
                    name: item.length > 15 ? item.substring(0, 12) + '...' : item,
                    fullName: item,
                    change: llmItem?.change ?? Math.round(avgChange * 100) / 100,
                    sentiment: llmItem?.sentiment || (avgChange >= 0 ? 'Positive momentum' : 'Slight pullback'),
                    stockCount: stocksInItem.length
                };
            }).sort((a, b) => b.change - a.change);

            setChartData(formattedData);
        } catch (error) {
            console.error('Error fetching market data:', error);
            // Fallback to calculated data from stocks
            const items = viewMode === 'sector' ? sectors : industries.slice(0, 20);
            const fallbackData = items.map(item => {
                const stocksInItem = stocks.filter(s => 
                    viewMode === 'sector' ? s.sector === item : s.industry === item
                );
                const avgChange = stocksInItem.length > 0 
                    ? stocksInItem.reduce((sum, s) => sum + (s.change || 0), 0) / stocksInItem.length
                    : (Math.random() - 0.5) * 4;
                
                return {
                    name: item.length > 15 ? item.substring(0, 12) + '...' : item,
                    fullName: item,
                    change: Math.round(avgChange * 100) / 100,
                    sentiment: avgChange >= 0 ? 'Bullish trend' : 'Bearish pressure',
                    stockCount: stocksInItem.length
                };
            }).sort((a, b) => b.change - a.change);
            
            setChartData(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    const gainers = chartData.filter(d => d.change > 0).length;
    const losers = chartData.filter(d => d.change < 0).length;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const groupStocks = stocksByGroup[data.fullName] || [];
            // Sort by change and take top 5 movers
            const topStocks = [...groupStocks]
                .sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0))
                .slice(0, 5);
            
            return (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[220px] max-w-[280px]">
                    <p className="font-semibold text-gray-900 text-sm">{data.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {data.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-bold ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{data.sentiment}</p>
                    
                    {/* Top Stocks in this group */}
                    {topStocks.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-1">Top Movers ({groupStocks.length} stocks)</p>
                            <div className="space-y-1">
                                {topStocks.map(stock => (
                                    <div key={stock.ticker} className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-800">{stock.ticker}</span>
                                        <span className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {stock.change >= 0 ? '+' : ''}{(stock.change || 0).toFixed(2)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-semibold text-gray-900">Market Overview</h3>
                        <p className="text-xs text-gray-500">Performance by {viewMode}</p>
                    </div>
                    
                    {/* Time Range Toggle */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {[
                            { id: '24h', label: '24h' },
                            { id: '48h', label: '48h' },
                            { id: 'week', label: 'Week' }
                        ].map(range => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                                    timeRange === range.id 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">{gainers} up</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-gray-600">{losers} down</span>
                        </div>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setViewMode('sector')}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'sector' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Sectors
                        </button>
                        <button
                            onClick={() => setViewMode('industry')}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'industry' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Industries
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="flex items-center justify-center h-[320px]">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                </div>
            ) : (
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={chartData} 
                            margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                        >
                            <XAxis 
                                type="category" 
                                dataKey="name"
                                tick={{ fontSize: 9, angle: -45, textAnchor: 'end' }}
                                height={80}
                                interval={0}
                                tickMargin={5}
                            />
                            <YAxis 
                                type="number"
                                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                                tick={{ fontSize: 10 }}
                                width={50}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                            <Bar 
                                dataKey="change" 
                                radius={[4, 4, 0, 0]}
                                cursor="pointer"
                                onClick={(data) => {
                                    setSelectedItem(data.fullName);
                                    if (onFilterByGroup) {
                                        onFilterByGroup(viewMode, data.fullName);
                                    }
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.change >= 0 ? '#22c55e' : '#ef4444'}
                                        opacity={selectedItem === entry.fullName ? 1 : 0.8}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Selected Item Details */}
            {selectedItem && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Filtering by: {selectedItem}</span>
                        <button 
                            onClick={() => {
                                setSelectedItem(null);
                                if (onFilterByGroup) onFilterByGroup(null, null);
                            }}
                            className="text-xs text-purple-600 hover:text-purple-700"
                        >
                            Clear filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}