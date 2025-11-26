import React, { useState } from 'react';

export default function LiquidGauge({ 
    percentage = 60,
    label = '',
    color = '#50C8E8',
    trackColor = '#E5E7EB',
    size = 100,
    onClick = null
}) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div 
                className="relative rounded-full border-4 overflow-hidden"
                style={{ width: size, height: size, borderColor: trackColor }}
            >
                <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                    style={{ 
                        height: `${percentage}%`, 
                        backgroundColor: color,
                        boxShadow: isHovered ? `0 0 20px ${color}50` : 'none'
                    }}
                />
                <div 
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: '#9CA3AF', opacity: 1 - percentage / 100 }}
                />
            </div>
            <p className="mt-3 text-lg font-bold" style={{ color }}>{percentage}%</p>
            {label && <p className="text-sm text-gray-500">{label}</p>}
        </div>
    );
}

export function LiquidGaugeRow({ 
    title = 'Progress Indicators',
    gauges = [
        { percentage: 90, color: '#0D4F5C', label: 'Task A' },
        { percentage: 60, color: '#0D4F5C', label: 'Task B' },
        { percentage: 35, color: '#0D4F5C', label: 'Task C' },
        { percentage: 90, color: '#50C8E8', label: 'Task D' },
        { percentage: 60, color: '#50C8E8', label: 'Task E' },
        { percentage: 35, color: '#9CA3AF', label: 'Task F' }
    ],
    onGaugeClick = null
}) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>}
            <div className="flex flex-wrap justify-center gap-6">
                {gauges.map((gauge, index) => (
                    <LiquidGauge 
                        key={index}
                        {...gauge}
                        onClick={() => onGaugeClick?.(gauge, index)}
                    />
                ))}
            </div>
        </div>
    );
}