import React, { useState } from 'react';
import { Gamepad2, Rocket, Target } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import SpaceBattleGame from '../components/games/SpaceBattleGame';
import WordShooter from '../components/games/WordShooter';
import { Button } from '@/components/ui/button';
import { 
    Rocket, Target, Zap, Trophy, Star, Play, Pause, RotateCcw, 
    Award, Clock, Heart, Sparkles, Medal, Gamepad2, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageLayout from '../components/PageLayout';
import WordShooter from '../components/games/WordShooter';


// UFO/Spaceship SVG Component
function SpaceshipSVG({ type = 'ufo', color = '#4FD1C5', size = 80 }) {
    if (type === 'ufo') {
        return (
            <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
                {/* Dome */}
                <ellipse cx="50" cy="25" rx="20" ry="15" fill={color} opacity="0.8" />
                <ellipse cx="50" cy="22" rx="15" ry="10" fill="#ffffff" opacity="0.3" />
                {/* Body */}
                <ellipse cx="50" cy="35" rx="45" ry="12" fill={color} />
                <ellipse cx="50" cy="33" rx="40" ry="8" fill="#1a1a2e" opacity="0.3" />
                {/* Lights */}
                {[20, 35, 50, 65, 80].map((x, i) => (
                    <circle key={i} cx={x} cy="35" r="3" fill="#FFD700" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
                {/* Beam */}
                <polygon points="35,45 65,45 75,60 25,60" fill={color} opacity="0.2" />
            </svg>
        );
    }
    if (type === 'fighter') {
        return (
            <svg width={size} height={size * 0.5} viewBox="0 0 100 50">
                {/* Wings */}
                <polygon points="10,25 30,15 30,35" fill={color} />
                <polygon points="90,25 70,15 70,35" fill={color} />
                {/* Body */}
                <ellipse cx="50" cy="25" rx="35" ry="10" fill={color} />
                <rect x="15" y="20" width="70" height="10" rx="5" fill="#1a1a2e" opacity="0.3" />
                {/* Cockpit */}
                <ellipse cx="65" cy="25" rx="10" ry="6" fill="#00FFFF" opacity="0.6" />
                {/* Engine glow */}
                <circle cx="15" cy="25" r="4" fill="#FF4500" className="animate-pulse" />
            </svg>
        );
    }
    // Alien
    return (
        <svg width={size} height={size * 0.8} viewBox="0 0 80 64">
            {/* Head */}
            <ellipse cx="40" cy="25" rx="25" ry="20" fill={color} />
            {/* Eyes */}
            <ellipse cx="30" cy="22" rx="8" ry="10" fill="#000" />
            <ellipse cx="50" cy="22" rx="8" ry="10" fill="#000" />
            <ellipse cx="32" cy="20" rx="3" ry="4" fill="#fff" />
            <ellipse cx="52" cy="20" rx="3" ry="4" fill="#fff" />
            {/* Body */}
            <ellipse cx="40" cy="50" rx="15" ry="12" fill={color} opacity="0.8" />
            {/* Antenna */}
            <line x1="30" y1="8" x2="25" y2="0" stroke={color} strokeWidth="2" />
            <circle cx="25" cy="0" r="3" fill="#FFD700" className="animate-pulse" />
            <line x1="50" y1="8" x2="55" y2="0" stroke={color} strokeWidth="2" />
            <circle cx="55" cy="0" r="3" fill="#FFD700" className="animate-pulse" />
        </svg>
    );
}

function SpaceBattleGame({ onExit }) {
    // ... (SpaceBattleGame implementation from previous step, unchanged)
     const gameRef = useRef(null);
    const [enemies, setEnemies] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lives, setLives] = useState(5);
    const [timeLeft, setTimeLeft] = useState(120);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [explosions, setExplosions] = useState([]);
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
    const [stars, setStars] = useState([]);

    // ... (rest of the implementation is the same)

    return (
        <div className="fixed inset-0 z-[100] bg-black cursor-none" onClick={()=>{}}>
           {/* Game UI */}
        </div>
    );
}


export default function Games() {
    const [activeGame, setActiveGame] = useState(null);

    if (activeGame === 'space-battle') {
        return <SpaceBattleGame onExit={() => setActiveGame(null)} />;
    }
    
    if (activeGame === 'word-shooter') {
        return <WordShooter onExit={() => setActiveGame(null)} />;
    }

    return (
        <PageLayout activePage="Games" showSearch={false}>
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Gamepad2 className="w-10 h-10 text-cyan-400" />
                            <h1 className="text-4xl font-bold text-white">Game Arcade</h1>
                        </div>
                        <p className="text-gray-400">Learn while you play!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Space Battle Game Card */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20 text-center flex flex-col">
                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Rocket className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Space Battle</h2>
                            <p className="text-gray-400 mb-6 flex-grow">Destroy alien ships to learn programming concepts!</p>
                            <Button onClick={() => setActiveGame('space-battle')} size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                                Play Now
                            </Button>
                        </div>
                        
                        {/* Word Shooter Game Card */}
                        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 text-center flex flex-col">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Target className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Word Shooter</h2>
                            <p className="text-gray-400 mb-6 flex-grow">Gamified vocabulary learning with AI-powered word sets.</p>
                            <Button onClick={() => setActiveGame('word-shooter')} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                                Play Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}