import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Rocket, Target, Zap, Trophy, Star, Play, Pause, RotateCcw, 
    Crosshair, Award, Clock, Heart, Shield, Sparkles, Medal, Compass,
    Gamepad2, ChevronRight, Lock, Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageLayout from '../components/PageLayout';

// Tank SVG Component
function TankSVG({ color = '#4FD1C5', direction = 'right', size = 80 }) {
    const flip = direction === 'left' ? 'scale(-1, 1)' : '';
    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 100 60" style={{ transform: flip }}>
            {/* Tracks */}
            <ellipse cx="50" cy="50" rx="45" ry="10" fill="#1a1a2e" />
            <ellipse cx="50" cy="50" rx="42" ry="8" fill="#2d2d44" />
            {/* Track wheels */}
            {[15, 35, 50, 65, 85].map((x, i) => (
                <circle key={i} cx={x} cy="50" r="6" fill="#1a1a2e" stroke="#3d3d5c" strokeWidth="2" />
            ))}
            {/* Body */}
            <rect x="10" y="30" width="80" height="20" rx="3" fill={color} />
            <rect x="15" y="32" width="70" height="16" rx="2" fill="#1a1a2e" opacity="0.3" />
            {/* Turret */}
            <ellipse cx="45" cy="30" rx="20" ry="12" fill={color} />
            <ellipse cx="45" cy="28" rx="15" ry="8" fill="#1a1a2e" opacity="0.2" />
            {/* Cannon */}
            <rect x="55" y="26" width="40" height="8" rx="2" fill={color} />
            <rect x="90" y="24" width="8" height="12" rx="1" fill={color} />
            {/* Details */}
            <circle cx="45" cy="28" r="4" fill="#1a1a2e" opacity="0.5" />
            <rect x="20" y="35" width="8" height="10" rx="1" fill="#1a1a2e" opacity="0.4" />
        </svg>
    );
}

// Explosion Effect
function Explosion({ x, y, content, onComplete }) {
    const [phase, setPhase] = useState(0);
    
    useEffect(() => {
        const timer1 = setTimeout(() => setPhase(1), 100);
        const timer2 = setTimeout(() => setPhase(2), 300);
        const timer3 = setTimeout(() => setPhase(3), 500);
        const timer4 = setTimeout(onComplete, 4000);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
    }, [onComplete]);

    return (
        <div className="absolute z-50 pointer-events-none" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            {phase < 3 && (
                <div className={`transition-all duration-200 ${phase === 0 ? 'scale-50 opacity-100' : phase === 1 ? 'scale-150 opacity-80' : 'scale-200 opacity-0'}`}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 animate-ping" />
                </div>
            )}
            {phase >= 2 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full animate-fade-in">
                    <div className="bg-gray-900/95 border border-cyan-500/50 rounded-xl p-4 min-w-[300px] max-w-[400px] backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-semibold text-sm">{content.subject}</span>
                        </div>
                        <h3 className="text-white font-bold mb-2">{content.term}</h3>
                        <p className="text-gray-300 text-sm mb-3">{content.definition}</p>
                        <div className="bg-cyan-500/10 rounded-lg p-2">
                            <p className="text-cyan-300 text-xs"><span className="font-semibold">💡 Fun Fact:</span> {content.funFact}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Crosshair component
function GameCrosshair({ position }) {
    return (
        <div 
            className="fixed pointer-events-none z-40 transition-all duration-75"
            style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
        >
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg opacity-50" />
                <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-cyan-400 -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-cyan-400 -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-cyan-400 -translate-x-1/2" />
                <div className="absolute left-1/2 bottom-0 w-0.5 h-4 bg-cyan-400 -translate-x-1/2" />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 border border-red-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
}

// Compass HUD
function CompassHUD({ score, maxScore }) {
    const angle = (score / maxScore) * 360;
    return (
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-gray-600 bg-gray-900/80" />
            <div className="absolute inset-2 rounded-full border border-gray-700" />
            {['N', 'E', 'S', 'W'].map((dir, i) => (
                <span key={dir} className="absolute text-xs text-gray-400 font-bold" style={{
                    top: i === 0 ? '4px' : i === 2 ? 'auto' : '50%',
                    bottom: i === 2 ? '4px' : 'auto',
                    left: i === 3 ? '4px' : i === 1 ? 'auto' : '50%',
                    right: i === 1 ? '4px' : 'auto',
                    transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)'
                }}>{dir}</span>
            ))}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-cyan-400 origin-bottom -translate-x-1/2" 
                 style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
    );
}

// Score Gauge
function ScoreGauge({ score, maxScore }) {
    const percentage = Math.min((score / maxScore) * 100, 100);
    return (
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-gray-600 bg-gray-900/80" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="#10b981" strokeWidth="6" 
                        strokeDasharray={`${percentage * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400">Score</span>
                <span className="text-lg font-bold text-green-400">{score}</span>
            </div>
        </div>
    );
}

// Tank data with educational content
const TANK_DATA = [
    { id: 1, subject: 'Programming', term: 'Algorithm', definition: 'A step-by-step procedure for solving a problem or accomplishing a task.', funFact: 'The word comes from the 9th-century Persian mathematician Al-Khwarizmi!', color: '#4FD1C5' },
    { id: 2, subject: 'Web Dev', term: 'API', definition: 'Application Programming Interface - a way for software to communicate.', funFact: 'There are over 24,000 public APIs available on the internet!', color: '#63B3ED' },
    { id: 3, subject: 'Database', term: 'SQL', definition: 'Structured Query Language for managing relational databases.', funFact: 'SQL was developed at IBM in the early 1970s!', color: '#F6AD55' },
    { id: 4, subject: 'Security', term: 'Encryption', definition: 'Converting data into a coded format to prevent unauthorized access.', funFact: 'The first encryption dates back to ancient Egypt around 1900 BC!', color: '#FC8181' },
    { id: 5, subject: 'Cloud', term: 'Serverless', definition: 'Cloud execution model where the provider manages server infrastructure.', funFact: 'Serverless can reduce costs by up to 90% for sporadic workloads!', color: '#B794F4' },
    { id: 6, subject: 'AI', term: 'Neural Network', definition: 'Computing system inspired by biological neural networks in brains.', funFact: 'GPT-4 has an estimated 1.76 trillion parameters!', color: '#F687B3' },
    { id: 7, subject: 'DevOps', term: 'Container', definition: 'Lightweight, standalone package containing everything needed to run software.', funFact: 'Docker containers can start in milliseconds vs minutes for VMs!', color: '#68D391' },
    { id: 8, subject: 'React', term: 'Component', definition: 'Reusable, self-contained piece of UI in React applications.', funFact: 'Facebook created React in 2011 for their newsfeed feature!', color: '#90CDF4' },
    { id: 9, subject: 'JavaScript', term: 'Promise', definition: 'Object representing eventual completion of an async operation.', funFact: 'JavaScript was created in just 10 days by Brendan Eich!', color: '#FBD38D' },
    { id: 10, subject: 'Data', term: 'Big Data', definition: 'Extremely large datasets that require special processing methods.', funFact: 'Humans create 2.5 quintillion bytes of data every day!', color: '#C6F6D5' },
];

// Main Game Component
function TankBattleGame({ onBack }) {
    const gameRef = useRef(null);
    const [tanks, setTanks] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lives, setLives] = useState(5);
    const [timeLeft, setTimeLeft] = useState(90);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [explosions, setExplosions] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [tanksDestroyed, setTanksDestroyed] = useState(0);

    // Initialize tanks
    useEffect(() => {
        const spawnTank = () => {
            if (gameOver || isPaused) return;
            const tankInfo = TANK_DATA[Math.floor(Math.random() * TANK_DATA.length)];
            const fromLeft = Math.random() > 0.5;
            const lane = Math.floor(Math.random() * 3);
            const yPositions = [180, 280, 380];
            
            const newTank = {
                id: Date.now() + Math.random(),
                ...tankInfo,
                x: fromLeft ? -100 : window.innerWidth + 100,
                y: yPositions[lane],
                speed: 1 + Math.random() * 2,
                direction: fromLeft ? 'right' : 'left',
            };
            setTanks(prev => [...prev, newTank]);
        };

        const interval = setInterval(spawnTank, 2000);
        spawnTank(); // Initial tank
        return () => clearInterval(interval);
    }, [gameOver, isPaused]);

    // Move tanks
    useEffect(() => {
        if (gameOver || isPaused) return;
        const moveInterval = setInterval(() => {
            setTanks(prev => {
                const updated = prev.map(tank => ({
                    ...tank,
                    x: tank.direction === 'right' ? tank.x + tank.speed : tank.x - tank.speed
                })).filter(tank => {
                    const escaped = tank.direction === 'right' ? tank.x > window.innerWidth + 100 : tank.x < -100;
                    if (escaped) {
                        setLives(l => Math.max(0, l - 1));
                        setCombo(0);
                    }
                    return !escaped;
                });
                return updated;
            });
        }, 16);
        return () => clearInterval(moveInterval);
    }, [gameOver, isPaused]);

    // Timer
    useEffect(() => {
        if (gameOver || isPaused) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameOver, isPaused]);

    // Check lives
    useEffect(() => {
        if (lives <= 0) setGameOver(true);
    }, [lives]);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Shoot tank
    const handleShoot = (e) => {
        if (gameOver || isPaused) return;
        
        const rect = gameRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if any tank was hit
        const hitTank = tanks.find(tank => {
            const tankWidth = 80;
            const tankHeight = 50;
            return clickX >= tank.x - tankWidth/2 && clickX <= tank.x + tankWidth/2 &&
                   clickY >= tank.y - tankHeight/2 && clickY <= tank.y + tankHeight/2;
        });

        if (hitTank) {
            // Create explosion
            setExplosions(prev => [...prev, {
                id: Date.now(),
                x: hitTank.x,
                y: hitTank.y,
                content: hitTank
            }]);

            // Remove tank
            setTanks(prev => prev.filter(t => t.id !== hitTank.id));

            // Update score
            const comboBonus = combo * 10;
            setScore(s => s + 100 + comboBonus);
            setCombo(c => c + 1);
            setTanksDestroyed(t => t + 1);
        }
    };

    const removeExplosion = (id) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    };

    return (
        <div className="relative w-full h-[600px] bg-gradient-to-b from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] rounded-2xl overflow-hidden cursor-none"
             ref={gameRef} onClick={handleShoot}>
            
            {/* Background mountains */}
            <svg className="absolute bottom-32 left-0 right-0 h-40 opacity-30" viewBox="0 0 1200 200" preserveAspectRatio="none">
                <polygon fill="#1a2744" points="0,200 100,120 200,160 350,80 500,140 650,60 800,130 950,90 1100,150 1200,100 1200,200" />
                <polygon fill="#0f1a2e" points="0,200 150,140 300,180 450,100 600,160 750,80 900,150 1050,110 1200,170 1200,200" />
            </svg>

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a2744] to-transparent" />

            {/* HUD - Top */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
                {/* Left panel - Topics */}
                <div className="space-y-2">
                    <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                        Tank Battle
                    </div>
                    <div className="bg-gray-800/80 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                        Programming Concepts
                    </div>
                    <div className="bg-gray-800/80 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                        Web Development
                    </div>
                    <div className="bg-gray-800/80 text-gray-300 px-3 py-1.5 rounded-lg text-xs">
                        Data Science
                    </div>
                </div>

                {/* Center - Awards */}
                <div className="text-center">
                    <p className="text-cyan-400 text-sm font-semibold mb-1">Awards</p>
                    <p className="text-gray-400 text-xs mb-2">Medals to be won</p>
                    <div className="flex gap-3">
                        <Medal className={`w-8 h-8 ${tanksDestroyed >= 5 ? 'text-cyan-400' : 'text-gray-600'}`} />
                        <Award className={`w-8 h-8 ${tanksDestroyed >= 10 ? 'text-yellow-400' : 'text-gray-600'}`} />
                        <Trophy className={`w-8 h-8 ${score >= 1000 ? 'text-amber-400' : 'text-gray-600'}`} />
                    </div>
                </div>

                {/* Right panel - Gauges */}
                <div className="flex gap-4">
                    <CompassHUD score={score} maxScore={2000} />
                    <ScoreGauge score={score} maxScore={2000} />
                </div>
            </div>

            {/* Center targeting display */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <div className="w-24 h-24 border-2 border-cyan-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 border border-red-500 rounded-full" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-8 text-gray-500 text-xs">
                    <span>{tanksDestroyed}</span>
                    <span>|</span>
                    <span>{tanksDestroyed}</span>
                </div>
            </div>

            {/* Tanks */}
            {tanks.map(tank => (
                <div key={tank.id} className="absolute transition-none cursor-crosshair"
                     style={{ left: tank.x, top: tank.y, transform: 'translate(-50%, -50%)' }}>
                    <TankSVG color={tank.color} direction={tank.direction} />
                </div>
            ))}

            {/* Explosions */}
            {explosions.map(exp => (
                <Explosion key={exp.id} x={exp.x} y={exp.y} content={exp.content} 
                           onComplete={() => removeExplosion(exp.id)} />
            ))}

            {/* Bottom HUD */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-30">
                {/* Radar */}
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/50 bg-gray-900/80" />
                    <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
                    <div className="absolute inset-8 rounded-full border border-cyan-500/20" />
                    {/* Radar sweep */}
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left animate-spin" 
                         style={{ animationDuration: '3s' }} />
                    {/* Tank dots on radar */}
                    {tanks.slice(0, 5).map((tank, i) => (
                        <div key={tank.id} className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                             style={{ 
                                 left: `${50 + (tank.x / window.innerWidth - 0.5) * 80}%`,
                                 top: `${50 + (tank.y / 600 - 0.5) * 80}%`
                             }} />
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-bold">{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-bold">x{combo}</span>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                        ))}
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} 
                            className="text-white hover:bg-white/20">
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Tank icon */}
                <div className="opacity-50">
                    <TankSVG color="#4FD1C5" size={60} />
                </div>
            </div>

            {/* Crosshair */}
            <GameCrosshair position={mousePos} />

            {/* Game Over / Pause overlay */}
            {(gameOver || isPaused) && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-900 border border-cyan-500/50 rounded-2xl p-8 text-center max-w-md">
                        {gameOver ? (
                            <>
                                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Mission Complete!</h2>
                                <div className="space-y-2 mb-6 text-gray-300">
                                    <p>Score: <span className="text-cyan-400 font-bold">{score}</span></p>
                                    <p>Tanks Destroyed: <span className="text-green-400 font-bold">{tanksDestroyed}</span></p>
                                    <p>Max Combo: <span className="text-orange-400 font-bold">x{combo}</span></p>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={onBack} variant="outline" className="border-gray-600 text-gray-300">
                                        Back
                                    </Button>
                                    <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700">
                                        <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Pause className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-4">Paused</h2>
                                <Button onClick={() => setIsPaused(false)} className="bg-cyan-600 hover:bg-cyan-700">
                                    <Play className="w-4 h-4 mr-2" /> Resume
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Games() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <PageLayout activePage="Games" showSearch={false}>
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] p-6">
                <div className="max-w-6xl mx-auto">
                    {!isPlaying ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-3 mb-4">
                                    <Gamepad2 className="w-10 h-10 text-cyan-400" />
                                    <h1 className="text-4xl font-bold text-white">Game Arcade</h1>
                                </div>
                                <p className="text-gray-400">Learn while you play!</p>
                            </div>

                            {/* Game Card */}
                            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                                        <Target className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Tank Battle</h2>
                                        <p className="text-gray-400">Shoot tanks to learn programming concepts!</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">Educational</span>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Action</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                                        <Target className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                                        <h3 className="text-white font-semibold">Shoot Tanks</h3>
                                        <p className="text-gray-400 text-sm">Click to destroy enemy tanks</p>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                                        <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                        <h3 className="text-white font-semibold">Learn Facts</h3>
                                        <p className="text-gray-400 text-sm">Each explosion reveals knowledge</p>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                                        <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                        <h3 className="text-white font-semibold">Earn Medals</h3>
                                        <p className="text-gray-400 text-sm">Complete challenges for awards</p>
                                    </div>
                                </div>

                                <Button onClick={() => setIsPlaying(true)} size="lg" 
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-lg py-6">
                                    <Play className="w-6 h-6 mr-2" /> Start Mission
                                </Button>
                            </div>
                        </>
                    ) : (
                        <TankBattleGame onBack={() => setIsPlaying(false)} />
                    )}
                </div>
            </div>
        </PageLayout>
    );
}