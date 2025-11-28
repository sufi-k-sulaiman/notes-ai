import React, { useState } from 'react';
import { 
    CheckCircle, Lock, Play, Star, Trophy, Zap, BookOpen,
    Brain, Shield, Users, GraduationCap, Cpu, Leaf, Heart, Building2,
    Scale, Telescope, Mountain, Waves, Cloud, TreePine, Bug, Flower2,
    Microscope, Dna, Activity, Smile, Footprints, Cog, FlaskConical,
    Rocket, Factory, Monitor, Code, Database, Bot, HardDrive, BarChart3,
    Network, TrendingUp, Landmark, Skull, Lightbulb, Languages, BookText,
    PenTool, Palette, Music, Film
} from 'lucide-react';
import IslandSVG from '@/components/learning/IslandSVG';

// Icon mapping for dynamic icon rendering
const ICON_MAP = {
    BookOpen, Brain, Shield, Users, GraduationCap, Cpu, Leaf, Heart, Building2,
    Scale, Telescope, Mountain, Waves, Cloud, TreePine, Bug, Flower2,
    Microscope, Dna, Activity, Smile, Footprints, Cog, FlaskConical,
    Rocket, Factory, Monitor, Code, Database, Bot, HardDrive, BarChart3,
    Network, TrendingUp, Landmark, Skull, Lightbulb, Languages, BookText,
    PenTool, Palette, Music, Film, Star, Trophy, Zap
};

export default function LearningIslandCard({ topic, index, progress = 0, onExplore, locked = false }) {
    const [hovered, setHovered] = useState(false);
    
    // Get icon component dynamically
    const Icon = ICON_MAP[topic.icon] || BookOpen;
    const isCompleted = progress >= 100;
    const xpReward = 100 + (index * 25);
    
    return (
        <div 
            className={`relative cursor-pointer transition-all duration-300 ${hovered && !locked ? 'scale-105 z-10' : ''} ${locked ? 'opacity-60' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => !locked && onExplore(topic)}
        >
            {/* XP Badge */}
            <div className="absolute -top-1 -right-1 z-20 flex items-center gap-1 px-2 py-0.5 bg-amber-400 rounded-full text-xs font-bold text-amber-900">
                <Zap className="w-3 h-3" />
                {xpReward} XP
            </div>
            
            {/* Priority number */}
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                style={{ backgroundColor: topic.color }}
            >
                {index + 1}
            </div>
            
            {/* Island SVG - varied by index for unique look */}
            <div className="w-44 h-36 mx-auto">
                <IslandSVG 
                    index={index} 
                    color={topic.color} 
                    completed={isCompleted}
                    progress={progress}
                    variant={(index % 5)}
                />
            </div>
            
            {/* Icon overlay - only show lock if locked */}
            {locked && (
                <div 
                    className="absolute top-[70px] left-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10"
                    style={{ 
                        backgroundColor: topic.color,
                        transform: hovered ? 'translate(-50%, -4px)' : 'translate(-50%, 0)'
                    }}
                >
                    <Lock className="w-4 h-4 text-white" />
                </div>
            )}
            
            {/* Label */}
            <div className="text-center mt-1">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{topic.name}</h3>
                
                {/* Progress bar */}
                {progress > 0 && !isCompleted && (
                    <div className="mt-2 mx-auto w-24">
                        <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all bg-purple-600"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{progress}% complete</p>
                    </div>
                )}
                
                {isCompleted && (
                    <div className="flex items-center justify-center gap-1 mt-1 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Completed</span>
                    </div>
                )}
                
                {locked && (
                    <p className="text-xs text-gray-400 mt-1">Complete previous to unlock</p>
                )}
            </div>
            
            {/* Hover play button */}
            {hovered && !locked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg animate-pulse">
                        <Play className="w-6 h-6 text-purple-600 ml-1" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    );
}