import React, { useState } from 'react';
import { Monitor, Rocket, BarChart3, Search } from 'lucide-react';

const iconMap = {
    monitor: Monitor,
    rocket: Rocket,
    chart: BarChart3,
    search: Search
};

export default function OptionCards({ 
    title = '',
    options = [
        { icon: 'monitor', title: 'OPTION 01', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam venenatis gravida orci.', color: '#EC4899' },
        { icon: 'rocket', title: 'OPTION 02', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam venenatis gravida orci.', color: '#F59E0B' },
        { icon: 'chart', title: 'OPTION 03', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam venenatis gravida orci.', color: '#10B981' },
        { icon: 'search', title: 'OPTION 04', description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam venenatis gravida orci.', color: '#3B82F6' }
    ],
    onOptionClick = null
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {options.map((option, index) => {
                    const Icon = iconMap[option.icon] || Monitor;
                    const isHovered = hoveredIndex === index;
                    
                    return (
                        <div 
                            key={index}
                            className={`relative cursor-pointer transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onOptionClick?.(option, index)}
                        >
                            {/* Angled top */}
                            <div 
                                className="h-16 rounded-t-xl flex items-center justify-center"
                                style={{ 
                                    backgroundColor: option.color,
                                    clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 100%)'
                                }}
                            >
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            
                            {/* Content */}
                            <div 
                                className="p-4 pt-6 rounded-b-xl border-2 border-t-0 text-center"
                                style={{ borderColor: option.color }}
                            >
                                <h4 className="font-bold text-gray-800 mb-2">{option.title}</h4>
                                <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}