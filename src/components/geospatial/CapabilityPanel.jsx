import React from 'react';
import { Map, Clock, BarChart3, Bell, FileText, Shield, Globe } from 'lucide-react';

const CAPABILITIES = [
    { id: 'maps', name: 'Interactive Maps', icon: Map, desc: 'Multi-layer composer with styling, filtering, spatial queries' },
    { id: 'temporal', name: 'Temporal Analysis', icon: Clock, desc: 'Time slider, event timelines, change detection' },
    { id: 'analytics', name: 'Geospatial Analytics', icon: BarChart3, desc: 'Heatmaps, clustering, isochrones, risk surfaces' },
    { id: 'alerts', name: 'Alerting & Workflows', icon: Bell, desc: 'Geofences, thresholds, case management' },
    { id: 'reports', name: 'Dashboards & Reports', icon: FileText, desc: 'Custom KPIs, automated briefings, exports' },
    { id: 'access', name: 'Access Controls', icon: Shield, desc: 'Role-based, dataset entitlements, redaction' },
    { id: 'global', name: 'Global Coverage', icon: Globe, desc: 'All countries, multilingual, local units' },
];

export default function CapabilityPanel({ compact = false }) {
    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {CAPABILITIES.map(cap => (
                    <div key={cap.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                        <cap.icon className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-gray-700">{cap.name}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CAPABILITIES.map(cap => (
                <div key={cap.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                        <cap.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 text-xs">{cap.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{cap.desc}</p>
                </div>
            ))}
        </div>
    );
}