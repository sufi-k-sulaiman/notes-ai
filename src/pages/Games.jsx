import React, { useState, useEffect, useRef } from 'react';
import { 
    Rocket, Target, Zap, Trophy, Star, Play, Pause, RotateCcw, 
    Award, Clock, Heart, Sparkles, Medal, Gamepad2, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageLayout from '../components/PageLayout';

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

// Explosion Effect
function Explosion({ x, y, content, onComplete }) {
    const [phase, setPhase] = useState(0);
    
    useEffect(() => {
        const timer1 = setTimeout(() => setPhase(1), 100);
        const timer2 = setTimeout(() => setPhase(2), 300);
        const timer3 = setTimeout(() => setPhase(3), 500);
        const timer4 = setTimeout(onComplete, 5000);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
    }, [onComplete]);

    return (
        <div className="absolute z-50 pointer-events-none" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
            {phase < 3 && (
                <div className={`transition-all duration-200 ${phase === 0 ? 'scale-50 opacity-100' : phase === 1 ? 'scale-150 opacity-80' : 'scale-200 opacity-0'}`}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 animate-ping" />
                </div>
            )}
            {phase >= 2 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full animate-fade-in">
                    <div className="bg-black/90 border border-cyan-500/50 rounded-xl p-4 min-w-[280px] max-w-[350px] backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-semibold text-sm">{content.subject}</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">{content.term}</h3>
                        <p className="text-gray-300 text-sm mb-3">{content.definition}</p>
                        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg p-3 border border-cyan-500/30">
                            <p className="text-cyan-300 text-xs"><span className="font-semibold">💡 Fun Fact:</span> {content.funFact}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// First Person Crosshair
function FPSCrosshair({ position }) {
    return (
        <div className="fixed pointer-events-none z-40" style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
                {/* Outer ring */}
                <div className="w-20 h-20 border-2 border-cyan-400/50 rounded-full" />
                {/* Inner targeting lines */}
                <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-cyan-400 -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-6 h-0.5 bg-cyan-400 -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 w-0.5 h-6 bg-cyan-400 -translate-x-1/2" />
                <div className="absolute left-1/2 bottom-0 w-0.5 h-6 bg-cyan-400 -translate-x-1/2" />
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-red-500/50" />
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            </div>
        </div>
    );
}

// Enemy data with educational content
const ENEMY_DATA = [
    { id: 1, subject: 'Programming', term: 'Algorithm', definition: 'A step-by-step procedure for solving a problem or accomplishing a task.', funFact: 'The word comes from the 9th-century Persian mathematician Al-Khwarizmi!', color: '#4FD1C5', type: 'ufo' },
    { id: 2, subject: 'Web Dev', term: 'API', definition: 'Application Programming Interface - a way for software to communicate.', funFact: 'There are over 24,000 public APIs available on the internet!', color: '#63B3ED', type: 'fighter' },
    { id: 3, subject: 'Database', term: 'SQL', definition: 'Structured Query Language for managing relational databases.', funFact: 'SQL was developed at IBM in the early 1970s!', color: '#F6AD55', type: 'alien' },
    { id: 4, subject: 'Security', term: 'Encryption', definition: 'Converting data into a coded format to prevent unauthorized access.', funFact: 'The first encryption dates back to ancient Egypt around 1900 BC!', color: '#FC8181', type: 'ufo' },
    { id: 5, subject: 'Cloud', term: 'Serverless', definition: 'Cloud execution model where the provider manages server infrastructure.', funFact: 'Serverless can reduce costs by up to 90% for sporadic workloads!', color: '#B794F4', type: 'fighter' },
    { id: 6, subject: 'AI', term: 'Neural Network', definition: 'Computing system inspired by biological neural networks in brains.', funFact: 'GPT-4 has an estimated 1.76 trillion parameters!', color: '#F687B3', type: 'alien' },
    { id: 7, subject: 'DevOps', term: 'Container', definition: 'Lightweight, standalone package containing everything needed to run software.', funFact: 'Docker containers can start in milliseconds vs minutes for VMs!', color: '#68D391', type: 'ufo' },
    { id: 8, subject: 'React', term: 'Component', definition: 'Reusable, self-contained piece of UI in React applications.', funFact: 'Facebook created React in 2011 for their newsfeed feature!', color: '#90CDF4', type: 'fighter' },
    { id: 9, subject: 'JavaScript', term: 'Promise', definition: 'Object representing eventual completion of an async operation.', funFact: 'JavaScript was created in just 10 days by Brendan Eich!', color: '#FBD38D', type: 'alien' },
    { id: 10, subject: 'Data', term: 'Big Data', definition: 'Extremely large datasets that require special processing methods.', funFact: 'Humans create 2.5 quintillion bytes of data every day!', color: '#C6F6D5', type: 'ufo' },
];

// Main Game Component
function SpaceBattleGame({ onExit }) {
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

    // Generate background stars
    useEffect(() => {
        const newStars = Array.from({ length: 200 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random() * 0.8 + 0.2
        }));
        setStars(newStars);
    }, []);

    // Spawn enemies
    useEffect(() => {
        if (gameOver || isPaused) return;
        const spawnEnemy = () => {
            const enemyInfo = ENEMY_DATA[Math.floor(Math.random() * ENEMY_DATA.length)];
            const fromLeft = Math.random() > 0.5;
            const yPos = Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.15;
            
            const newEnemy = {
                id: Date.now() + Math.random(),
                ...enemyInfo,
                x: fromLeft ? -100 : window.innerWidth + 100,
                y: yPos,
                speed: 2 + Math.random() * 3,
                direction: fromLeft ? 'right' : 'left',
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05 + Math.random() * 0.05
            };
            setEnemies(prev => [...prev, newEnemy]);
        };

        const interval = setInterval(spawnEnemy, 1500);
        spawnEnemy();
        return () => clearInterval(interval);
    }, [gameOver, isPaused]);

    // Move enemies with wobble effect
    useEffect(() => {
        if (gameOver || isPaused) return;
        const moveInterval = setInterval(() => {
            setEnemies(prev => {
                return prev.map(enemy => {
                    const newWobble = enemy.wobble + enemy.wobbleSpeed;
                    const wobbleY = Math.sin(newWobble) * 30;
                    return {
                        ...enemy,
                        x: enemy.direction === 'right' ? enemy.x + enemy.speed : enemy.x - enemy.speed,
                        y: enemy.y + wobbleY * 0.1,
                        wobble: newWobble
                    };
                }).filter(enemy => {
                    const escaped = enemy.direction === 'right' ? enemy.x > window.innerWidth + 100 : enemy.x < -100;
                    if (escaped) {
                        setLives(l => Math.max(0, l - 1));
                        setCombo(0);
                    }
                    return !escaped;
                });
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

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsPaused(p => !p);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Shoot enemy
    const handleShoot = (e) => {
        if (gameOver || isPaused) return;
        
        const clickX = e.clientX;
        const clickY = e.clientY;

        const hitEnemy = enemies.find(enemy => {
            const enemyWidth = 100;
            const enemyHeight = 60;
            return clickX >= enemy.x - enemyWidth/2 && clickX <= enemy.x + enemyWidth/2 &&
                   clickY >= enemy.y - enemyHeight/2 && clickY <= enemy.y + enemyHeight/2;
        });

        if (hitEnemy) {
            setExplosions(prev => [...prev, { id: Date.now(), x: hitEnemy.x, y: hitEnemy.y, content: hitEnemy }]);
            setEnemies(prev => prev.filter(e => e.id !== hitEnemy.id));
            const comboBonus = combo * 15;
            setScore(s => s + 100 + comboBonus);
            setCombo(c => c + 1);
            setEnemiesDestroyed(t => t + 1);
        }
    };

    const removeExplosion = (id) => {
        setExplosions(prev => prev.filter(e => e.id !== id));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black cursor-none" onClick={handleShoot}>
            {/* Starfield background */}
            <div className="absolute inset-0 overflow-hidden">
                {stars.map(star => (
                    <div key={star.id} className="absolute rounded-full bg-white animate-pulse"
                         style={{
                             left: `${star.x}%`,
                             top: `${star.y}%`,
                             width: star.size,
                             height: star.size,
                             opacity: star.opacity,
                             animationDuration: `${2 + Math.random() * 3}s`
                         }} />
                ))}
            </div>

            {/* Nebula effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

            {/* HUD - Top */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30 pointer-events-none">
                <div className="space-y-2 pointer-events-auto">
                    <div className="bg-cyan-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-sm">
                        🚀 Space Battle
                    </div>
                    <div className="bg-black/60 text-gray-300 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm border border-cyan-500/30">
                        Programming Concepts
                    </div>
                    <div className="bg-black/60 text-gray-300 px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm border border-purple-500/30">
                        Web Development
                    </div>
                </div>

                {/* Center - Score & Awards */}
                <div className="text-center">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl px-8 py-4 border border-cyan-500/30">
                        <p className="text-cyan-400 text-sm font-semibold mb-1">SCORE</p>
                        <p className="text-4xl font-bold text-white">{score}</p>
                        <div className="flex justify-center gap-4 mt-3">
                            <Medal className={`w-6 h-6 ${enemiesDestroyed >= 5 ? 'text-cyan-400' : 'text-gray-600'}`} />
                            <Award className={`w-6 h-6 ${enemiesDestroyed >= 10 ? 'text-yellow-400' : 'text-gray-600'}`} />
                            <Trophy className={`w-6 h-6 ${score >= 1000 ? 'text-amber-400' : 'text-gray-600'}`} />
                        </div>
                    </div>
                </div>

                {/* Right - Exit button */}
                <Button onClick={(e) => { e.stopPropagation(); onExit(); }} 
                        className="pointer-events-auto bg-red-600/80 hover:bg-red-700 backdrop-blur-sm">
                    <X className="w-4 h-4 mr-2" /> Exit
                </Button>
            </div>

            {/* Enemies */}
            {enemies.map(enemy => (
                <div key={enemy.id} className="absolute transition-none cursor-crosshair z-20"
                     style={{ left: enemy.x, top: enemy.y, transform: 'translate(-50%, -50%)' }}>
                    <SpaceshipSVG type={enemy.type} color={enemy.color} size={90} />
                </div>
            ))}

            {/* Explosions */}
            {explosions.map(exp => (
                <Explosion key={exp.id} x={exp.x} y={exp.y} content={exp.content} 
                           onComplete={() => removeExplosion(exp.id)} />
            ))}

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-30 pointer-events-none">
                {/* Left stats */}
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                            <span className="text-2xl font-bold text-white">{timeLeft}s</span>
                        </div>
                        <div className="text-center">
                            <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                            <span className="text-2xl font-bold text-white">x{combo}</span>
                        </div>
                        <div className="text-center">
                            <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <span className="text-2xl font-bold text-white">{enemiesDestroyed}</span>
                        </div>
                    </div>
                </div>

                {/* Center - Lives */}
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <Heart key={i} className={`w-8 h-8 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-lg' : 'text-gray-700'}`} />
                    ))}
                </div>

                {/* Right - Controls */}
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30 pointer-events-auto">
                    <Button onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} 
                            variant="ghost" className="text-white hover:bg-white/20">
                        {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Crosshair */}
            <FPSCrosshair position={mousePos} />

            {/* Game Over / Pause overlay */}
            {(gameOver || isPaused) && (
                <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/50 rounded-2xl p-10 text-center max-w-lg shadow-2xl shadow-cyan-500/20">
                        {gameOver ? (
                            <>
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-4">Mission Complete!</h2>
                                <div className="space-y-3 mb-8">
                                    <p className="text-xl text-gray-300">Final Score: <span className="text-cyan-400 font-bold">{score}</span></p>
                                    <p className="text-lg text-gray-300">Enemies Destroyed: <span className="text-green-400 font-bold">{enemiesDestroyed}</span></p>
                                    <p className="text-lg text-gray-300">Best Combo: <span className="text-orange-400 font-bold">x{combo}</span></p>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={onExit} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                                        Exit Game
                                    </Button>
                                    <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                                        <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Pause className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-6">Game Paused</h2>
                                <p className="text-gray-400 mb-6">Press ESC or click Resume to continue</p>
                                <Button onClick={() => setIsPaused(false)} size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                                    <Play className="w-5 h-5 mr-2" /> Resume
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

    if (isPlaying) {
        return <SpaceBattleGame onExit={() => setIsPlaying(false)} />;
    }

    return (
        <PageLayout activePage="Games" showSearch={false}>
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Gamepad2 className="w-10 h-10 text-cyan-400" />
                            <h1 className="text-4xl font-bold text-white">Game Arcade</h1>
                        </div>
                        <p className="text-gray-400">Learn while you play!</p>
                    </div>

                    {/* Game Card */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                            <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30">
                                <Rocket className="w-16 h-16 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white mb-2">Space Battle</h2>
                                <p className="text-gray-400 mb-3">Destroy alien ships to learn programming concepts!</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">First Person</span>
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Educational</span>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Action</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-black/30 rounded-xl p-5 text-center border border-cyan-500/20">
                                <Target className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                                <h3 className="text-white font-semibold mb-1">Shoot Aliens</h3>
                                <p className="text-gray-400 text-sm">Click to destroy UFOs, fighters & aliens</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-5 text-center border border-yellow-500/20">
                                <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                                <h3 className="text-white font-semibold mb-1">Learn Facts</h3>
                                <p className="text-gray-400 text-sm">Each explosion reveals knowledge & fun facts</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-5 text-center border border-amber-500/20">
                                <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                <h3 className="text-white font-semibold mb-1">Earn Medals</h3>
                                <p className="text-gray-400 text-sm">Complete challenges for achievements</p>
                            </div>
                        </div>

                        <Button onClick={() => setIsPlaying(true)} size="lg" 
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-xl py-7 shadow-xl shadow-cyan-500/30">
                            <Play className="w-7 h-7 mr-3" /> Launch Mission
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}