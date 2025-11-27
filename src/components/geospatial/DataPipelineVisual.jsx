import React from 'react';
import { Satellite, Database, Cpu, HardDrive, Code, ArrowRight } from 'lucide-react';

const PIPELINE_STAGES = [
    { 
        icon: Satellite, 
        name: 'Ingestion', 
        color: '#3B82F6',
        items: ['Satellite imagery', 'IoT sensors', 'Mobile location', 'Government GIS', 'Port/customs logs']
    },
    { 
        icon: Database, 
        name: 'Standardization', 
        color: '#8B5CF6',
        items: ['Schema harmonization', 'CRS management', 'Quality scoring', 'Deduplication', 'Lineage tracking']
    },
    { 
        icon: Cpu, 
        name: 'Processing', 
        color: '#EC4899',
        items: ['Raster pipelines', 'Vector ETL', 'Change detection', 'Anomaly clustering', 'Time-series indexing']
    },
    { 
        icon: HardDrive, 
        name: 'Storage', 
        color: '#F59E0B',
        items: ['Spatial data lake', 'Temporal snapshots', 'Versioned layers', 'Access-controlled']
    },
    { 
        icon: Code, 
        name: 'APIs', 
        color: '#10B981',
        items: ['REST/GraphQL', 'WebSocket streams', 'OGC standards', 'Batch export']
    },
];

export default function DataPipelineVisual({ expanded = false }) {
    return (
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Data Pipeline Architecture</h3>
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
                {PIPELINE_STAGES.map((stage, i) => (
                    <React.Fragment key={stage.name}>
                        <div className="flex-shrink-0 w-36">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                                    style={{ backgroundColor: `${stage.color}15` }}>
                                    <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                                </div>
                                <span className="font-medium text-xs text-gray-900">{stage.name}</span>
                            </div>
                            {expanded && (
                                <ul className="space-y-1">
                                    {stage.items.map((item, j) => (
                                        <li key={j} className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: stage.color }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}