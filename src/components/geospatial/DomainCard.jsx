import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function DomainCard({ domain, isActive, onClick, stats }) {
    const Icon = domain.icon;
    return (
        <button onClick={onClick}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isActive 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
            }`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                    style={{ backgroundColor: `${domain.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: domain.color }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{domain.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{domain.description}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90 text-purple-600' : 'text-gray-400'}`} />
            </div>
            {stats && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-lg font-bold" style={{ color: domain.color }}>{stat.value}</p>
                            <p className="text-[10px] text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </button>
    );
}