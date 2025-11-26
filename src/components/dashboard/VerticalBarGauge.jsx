import React, { useState } from 'react';
import { User, Package, Factory, Trash2, Heart } from 'lucide-react';

const iconMap = {
    user: User,
    package: Package,
    factory: Factory,
    recycle: Trash2,
    health: Heart
};

const GaugeBar = ({ percentage, icon, color = '#6B4EE6', isHovered, onClick }) => {
    const Icon = iconMap[icon] || User;
    
    return (
        <div 
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
            onClick={onClick}
        >
            <Icon className="w-8 h-8 mb-4" style={{ color }} />
            
            <div className="flex items-center gap-1">
                {/* Left scale */}
                <div className="flex flex-col text-[10px] text-gray-400 text-right">
                    {[90, 80, 70, 60, 50, 40, 30, 20, 10].map(val => (
                        <div key={val} className="h-4">{val}%</div>
                    ))}
                </div>
                
                {/* Bar */}
                <div 
                    className="w-16 h-40 rounded-full border-4 border-gray-200 relative overflow-hidden"
                    style={{ boxShadow: isHovered ? `0 0 20px ${color}40` : 'none' }}
                >
                    <div 
                        className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-500"
                        style={{ 
                            height: `${percentage}%`, 
                            background: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, ${color}80 2px, ${color}80 4px)`
                        }}
                    />
                </div>
                
                {/* Right scale */}
                <div className="flex flex-col text-[10px] text-gray-400">
                    {[90, 80, 70, 60, 50, 40, 30, 20, 10].map(val => (
                        <div key={val} className="h-4">{val}%</div>
                    ))}
                </div>
            </div>
            
            <p className="mt-4 text-2xl font-bold" style={{ color }}>{percentage}%</p>
        </div>
    );
};

export default function VerticalBarGauge({ 
    title = 'Category Metrics',
    gauges = [
        { percentage: 70, icon: 'user', color: '#6B4EE6' },
        { percentage: 40, icon: 'package', color: '#6B4EE6' },
        { percentage: 90, icon: 'factory', color: '#6B4EE6' },
        { percentage: 20, icon: 'recycle', color: '#6B4EE6' },
        { percentage: 60, icon: 'health', color: '#6B4EE6' }
    ],
    onGaugeClick = null
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">{title}</h3>}
            
            <div className="flex flex-wrap justify-center gap-8">
                {gauges.map((gauge, index) => (
                    <div 
                        key={index}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <GaugeBar 
                            {...gauge}
                            isHovered={hoveredIndex === index}
                            onClick={() => onGaugeClick?.(gauge, index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}