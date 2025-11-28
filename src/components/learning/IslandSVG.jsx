import React from 'react';
import { Island1, Island2, Island3, Island4, Island5, Island6, Island7, Island8, Island9 } from '@/components/islands/IslandSVGs';
import { Island10, Island11, Island12, Island13, Island14, Island15, Island16, Island17, Island18 } from '@/components/islands/IslandSVGs2';
import { Island19, Island20, Island21, Island22, Island23, Island24, Island25, Island26, Island27 } from '@/components/islands/IslandSVGs3';

// All 27 island components
const ALL_ISLANDS = [
    Island1, Island2, Island3, Island4, Island5, Island6, Island7, Island8, Island9,
    Island10, Island11, Island12, Island13, Island14, Island15, Island16, Island17, Island18,
    Island19, Island20, Island21, Island22, Island23, Island24, Island25, Island26, Island27
];

// Portal theme colors from the app
const PORTAL_COLORS = [
    '#8B5CF6', // Purple (Geospatial)
    '#3B82F6', // Blue (Qwirey)
    '#10B981', // Green (SearchPods, Resume Builder)
    '#EC4899', // Pink (MindMap)
    '#14B8A6', // Teal (Intelligence)
    '#F97316', // Orange (Markets)
    '#06B6D4', // Cyan (Learning)
    '#8B5CF6', // Purple (Tasks)
    '#EF4444', // Red (Notes)
    '#F97316', // Orange (News)
    '#EC4899', // Pink/Magenta (Games)
];

const APP_COLORS = {
    primary: '#8B5CF6',
    secondary: '#6366F1',
    success: '#10B981',
};

// Simple hash function for consistent randomization
function hashIndex(index, seed = 0) {
    return ((index * 7 + seed * 13 + 3) * 17) % ALL_ISLANDS.length;
}

export default function IslandSVG({ index, color, completed, progress = 0, variant = 0 }) {
    // Create a unique island selection based on index and variant
    const islandIndex = hashIndex(index, variant);
    const IslandComponent = ALL_ISLANDS[islandIndex];
    
    // Use provided color or pick from portal colors based on index
    const islandColor = color || PORTAL_COLORS[index % PORTAL_COLORS.length];
    
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Border circle */}
            <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full">
                <circle
                    cx="60"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={APP_COLORS.secondary}
                    strokeWidth="2"
                    opacity="0.4"
                />
            </svg>
            
            {/* Island */}
            <IslandComponent className="w-24 h-20 relative z-10" color={islandColor} />
            
            {/* Progress ring overlay */}
            {progress > 0 && progress < 100 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 100">
                    <circle
                        cx="60"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke={APP_COLORS.secondary}
                        strokeWidth="2"
                        strokeDasharray={`${progress * 2.76} 276`}
                        strokeLinecap="round"
                        transform="rotate(-90, 60, 50)"
                    />
                </svg>
            )}
            
            {/* Completed badge */}
            {completed && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 100">
                    <circle cx="100" cy="20" r="10" fill={APP_COLORS.success} />
                    <path d="M95,20 L98,23 L105,16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}