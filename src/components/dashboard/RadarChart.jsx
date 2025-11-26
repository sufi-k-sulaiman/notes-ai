import React, { useState } from 'react';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function RadarChartCard({ 
    title = 'Performance Metrics',
    data = [
        { subject: 'Marketing', A: 120, B: 110 },
        { subject: 'Sales', A: 98, B: 130 },
        { subject: 'Development', A: 86, B: 130 },
        { subject: 'Support', A: 99, B: 100 },
        { subject: 'Admin', A: 85, B: 90 },
        { subject: 'IT', A: 65, B: 85 }
    ],
    colors = ['#0D4F5C', '#50C8E8'],
    onPointClick = null
}) {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>}
            
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsRadar data={data}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                        <Radar 
                            name="Series A" 
                            dataKey="A" 
                            stroke={colors[0]} 
                            fill={colors[0]} 
                            fillOpacity={0.6}
                            className="cursor-pointer"
                        />
                        <Radar 
                            name="Series B" 
                            dataKey="B" 
                            stroke={colors[1]} 
                            fill={colors[1]} 
                            fillOpacity={0.4}
                            className="cursor-pointer"
                        />
                    </RechartsRadar>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
                {colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                        <span className="text-sm text-gray-600">Series {String.fromCharCode(65 + i)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}