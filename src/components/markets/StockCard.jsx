import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function MiniSparkline({ data, isPositive }) {
    if (!data || data.length === 0) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    
    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MetricBadge({ label, value, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-700',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        orange: 'bg-orange-100 text-orange-700',
    };

    return (
        <div className={`px-2 py-1 rounded text-xs ${colors[color]}`}>
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold ml-1">{value}</span>
        </div>
    );
}

export default function StockCard({ stock }) {
    const isPositive = stock.change >= 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{stock.ticker}</h3>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">US</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">{stock.name}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                </div>
            </div>

            {/* Price & Volume */}
            <div className="flex items-end justify-between mb-3">
                <div>
                    <p className="text-2xl font-bold text-gray-900">${stock.price?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Vol: {stock.volume}</p>
                </div>
                <MiniSparkline data={stock.history} isPositive={isPositive} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
                <MetricBadge label="MOAT" value={stock.moat} color={stock.moat >= 70 ? 'green' : 'gray'} />
                <MetricBadge label="SGR" value={stock.sgr} color="blue" />
                <MetricBadge label="ROE" value={`${stock.roe}%`} color={stock.roe >= 20 ? 'green' : 'gray'} />
                <MetricBadge label="ROIC" value={stock.roic} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
                <MetricBadge label="ROA" value={`${stock.roa}%`} color="gray" />
                <MetricBadge label="EPS" value={`$${stock.eps}`} color="gray" />
                <MetricBadge label="P/E" value={stock.pe?.toFixed(1)} color={stock.pe < 20 ? 'green' : 'orange'} />
                <MetricBadge label="PEG" value={stock.peg?.toFixed(1)} color="gray" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
                <MetricBadge label="FCF" value={`$${stock.fcf}`} color="blue" />
                <MetricBadge label="EVA" value={stock.eva} color="purple" />
                <MetricBadge label="Z" value={stock.zscore?.toFixed(1)} color={stock.zscore >= 3 ? 'green' : 'gray'} />
                <div />
            </div>
        </div>
    );
}