import React, { useState } from 'react';
import { Monitor, Rocket, BarChart3, Search, ArrowRight } from 'lucide-react';

const iconMap = {
    monitor: Monitor,
    rocket: Rocket,
    chart: BarChart3,
    search: Search
};

export default function ProcessSteps({ 
    title = '',
    steps = [
        { icon: 'monitor', title: 'OPTION 01', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', color: '#6B4EE6' },
        { icon: 'rocket', title: 'OPTION 02', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', color: '#3B82F6' },
        { icon: 'chart', title: 'OPTION 03', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', color: '#10B981' },
        { icon: 'search', title: 'OPTION 04', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', color: '#F59E0B' }
    ],
    onStepClick = null
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>}
            
            <div className="flex flex-wrap items-center justify-center gap-4">
                {steps.map((step, index) => {
                    const Icon = iconMap[step.icon] || Monitor;
                    const isHovered = hoveredIndex === index;
                    const isLast = index === steps.length - 1;
                    
                    return (
                        <React.Fragment key={index}>
                            <div 
                                className={`flex flex-col items-center text-center max-w-[200px] cursor-pointer transition-all duration-300 ${
                                    isHovered ? 'scale-105' : ''
                                }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => onStepClick?.(step, index)}
                            >
                                <div 
                                    className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 transition-all duration-300"
                                    style={{ 
                                        borderColor: step.color,
                                        boxShadow: isHovered ? `0 0 20px ${step.color}40` : 'none'
                                    }}
                                >
                                    <Icon className="w-8 h-8" style={{ color: step.color }} />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">{step.title}</h4>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                            
                            {!isLast && (
                                <ArrowRight className="w-6 h-6 text-gray-300 flex-shrink-0" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}