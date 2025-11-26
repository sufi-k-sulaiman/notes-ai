import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StockTicker({ stocks }) {
    if (!stocks || stocks.length === 0) return null;

    // Duplicate for seamless loop
    const tickerItems = [...stocks, ...stocks];

    return (
        <div className="bg-gray-100 border-t border-gray-200 overflow-hidden">
            <div className="flex animate-marquee">
                {tickerItems.map((stock, i) => {
                    const isPositive = stock.change >= 0;
                    return (
                        <div 
                            key={`${stock.ticker}-${i}`}
                            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                        >
                            <span className="font-bold text-gray-900">{stock.ticker}</span>
                            <span className="text-gray-700">${stock.price?.toFixed(2)}</span>
                            <span className={`flex items-center gap-0.5 text-sm font-medium ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isPositive ? '+' : ''}{stock.change?.toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}