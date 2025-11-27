import React from 'react';
import { GitCompare, AlertTriangle, LineChart, Settings2 } from 'lucide-react';

const MODULES = [
    { 
        icon: GitCompare, 
        name: 'Change Detection', 
        desc: 'Multi-temporal raster comparisons with semantic labels and confidence scoring',
        color: '#3B82F6'
    },
    { 
        icon: AlertTriangle, 
        name: 'Risk Modeling', 
        desc: 'Composite indices combining hazard, exposure, and vulnerability',
        color: '#EF4444'
    },
    { 
        icon: LineChart, 
        name: 'Forecasting', 
        desc: 'Time-series predictions for flows, capacity, demand, and incidents',
        color: '#10B981'
    },
    { 
        icon: Settings2, 
        name: 'Optimization', 
        desc: 'Site selection, route planning, resource allocation with constraints',
        color: '#8B5CF6'
    },
];

export default function AnalyticsModules() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODULES.map(mod => (
                <div key={mod.name} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${mod.color}15` }}>
                        <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{mod.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{mod.desc}</p>
                </div>
            ))}
        </div>
    );
}