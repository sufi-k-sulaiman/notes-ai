import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Award, Trophy, Target, Sparkles, Play, Search, Rocket, Crosshair, Zap, Compass, Radio, Shield, Cpu, Globe, Atom, Code, TrendingUp, Brain, Lightbulb, Bug, Ghost, Skull, Bot, Bomb } from 'lucide-react';
import { LOGO_URL } from '@/components/NavigationConfig';

export default function SpaceBattleGame({ onExit }) {
    const [screen, setScreen] = useState('menu');
    const [activeCategory, setActiveCategory] = useState('trending');
    const [generatedTopics, setGeneratedTopics] = useState({});
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [gameScore, setGameScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [awards, setAwards] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [levelComplete, setLevelComplete] = useState(false);
    const canvasRef = useRef(null);
    const gameStateRef = useRef(null);

    // Alien colors from the image
    const ALIEN_COLORS = [
        '#4f46e5', // indigo (like Geospatial)
        '#7c3aed', // purple (like Qwirey)
        '#06b6d4', // cyan (like SearchPods)
        '#ec4899', // pink (like MindMap)
        '#8b5cf6', // violet (like Intelligence)
        '#10b981', // emerald (like Resume Builder)
        '#f97316', // orange (like Markets)
        '#14b8a6', // teal (like Learning)
        '#a855f7', // purple (like Tasks)
        '#f43f5e', // rose (like Notes)
        '#ef4444', // red (like News)
        '#d946ef', // fuchsia (like Games)
    ];

    const TABS = [
        { id: 'trending', label: 'Trending', color: 'from-cyan-600 to-cyan-700' },
        { id: 'programming', label: 'Programming', color: 'from-blue-600 to-blue-700' },
        { id: 'science', label: 'Science', color: 'from-green-600 to-green-700' },
        { id: 'business', label: 'Business', color: 'from-amber-600 to-amber-700' },
        { id: 'sports', label: 'Sports', color: 'from-orange-600 to-orange-700' },
        { id: 'finance', label: 'Finance', color: 'from-emerald-600 to-emerald-700' },
        { id: 'investment', label: 'Investment', color: 'from-purple-600 to-purple-700' },
        { id: 'health', label: 'Health', color: 'from-rose-600 to-rose-700' },
        { id: 'wellness', label: 'Wellness', color: 'from-teal-600 to-teal-700' },
        { id: 'global', label: 'Global', color: 'from-indigo-600 to-indigo-700' },
    ];

    useEffect(() => {
        generateAllTopics();
    }, []);

    const generateAllTopics = async () => {
        setLoadingTopics(true);
        const allTopics = {};
        
        const prompts = {
            trending: 'Generate 9 trending tech and knowledge topics people should learn about right now. Include AI, cybersecurity, space, and emerging technologies.',
            programming: 'Generate 9 programming and software development topics including languages, frameworks, algorithms, and development practices.',
            science: 'Generate 9 science topics across physics, chemistry, biology, astronomy, and earth sciences.',
            business: 'Generate 9 business and entrepreneurship topics including finance, marketing, strategy, and leadership.',
            sports: 'Generate 9 sports topics including athletics, team sports, Olympics, fitness training, and sports science.',
            finance: 'Generate 9 finance topics including banking, economics, monetary policy, financial markets, and personal finance.',
            investment: 'Generate 9 investment topics including stocks, bonds, real estate, portfolio management, and investment strategies.',
            health: 'Generate 9 health topics including medical science, diseases, treatments, nutrition, and public health.',
            wellness: 'Generate 9 wellness topics including mental health, mindfulness, self-care, stress management, and holistic living.',
            global: 'Generate 9 global affairs topics including geopolitics, international relations, world events, and global challenges.'
        };

        for (const tab of TABS) {
            try {
                const result = await base44.integrations.Core.InvokeLLM({
                    prompt: `${prompts[tab.id]} Return as JSON: { "topics": [{ "id": "topic-id", "label": "Topic Name", "description": "Brief compelling description" }] }`,
                    add_context_from_internet: tab.id === 'trending',
                    response_json_schema: {
                        type: "object",
                        properties: {
                            topics: { 
                                type: "array", 
                                items: { 
                                    type: "object", 
                                    properties: { 
                                        id: { type: "string" }, 
                                        label: { type: "string" }, 
                                        description: { type: "string" } 
                                    } 
                                } 
                            }
                        }
                    }
                });
                allTopics[tab.id] = result?.topics || [];
            } catch (error) {
                console.error(`Failed to generate ${tab.id} topics:`, error);
                allTopics[tab.id] = [];
            }
        }
        
        setGeneratedTopics(allTopics);
        setLoadingTopics(false);
    };

    const startGame = async (topic) => {
        if (topic === 'custom') {
            if (!searchQuery.trim()) return;
            setSelectedTopic({ label: searchQuery, description: 'Custom topic' });
        } else {
            setSelectedTopic(topic);
        }
        
        setLoading(true);
        setScreen('loading');
        
        try {
            const topicLabel = topic === 'custom' ? searchQuery : topic.label;
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 10 educational Yes/No questions for: "${topicLabel}". Each should test real knowledge. Return: { "questions": [{ "question": "Is X true?", "answer": true, "explanation": "Brief explanation" }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "boolean" }, explanation: { type: "string" } } } }
                    }
                }
            });
            setQuestions(result.questions || []);
            setGameScore(0);
            setScore(0);
            setCurrentQuestion(0);
            setAwards([]);
            setCurrentLevel(1);
            setLevelComplete(false);
            setScreen('game');
        } catch (error) {
            console.error('Failed to generate questions:', error);
            setScreen('menu');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (screen !== 'game' || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // FPS-style 3D perspective state
        const state = {
            player: { x: 0, y: 0, angle: 0, health: 3 },
            bullets: [],
            lasers: [],
            enemies: [],
            particles: [],
            // Parallax background layers
            bgLayers: {
                farMountains: [],
                nearMountains: [],
                ground: []
            },
            score: 0,
            levelScore: 0,
            levelTarget: 500 * currentLevel,
            gameOver: false,
            levelComplete: false,
            enemySpawnTimer: 100,
            cameraShake: 0,
            fov: 90,
            viewAngle: 0,
            mouseX: canvas.width / 2,
            mouseY: canvas.height / 2,
            bombs: 3,
            alienTypes: ['truck', 'spacesuit', 'spaceship', 'rocket', 'ufo', 'mech'],
        };
        gameStateRef.current = state;

        // Initialize parallax mountain layers
        for (let i = 0; i < 8; i++) {
            state.bgLayers.farMountains.push({
                x: i * 300 - 600,
                height: 80 + Math.random() * 60,
                width: 250 + Math.random() * 100
            });
        }
        for (let i = 0; i < 12; i++) {
            state.bgLayers.nearMountains.push({
                x: i * 200 - 400,
                height: 120 + Math.random() * 80,
                width: 180 + Math.random() * 80
            });
        }

        const keys = {};
        const handleKeyDown = (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                // Fire laser from crosshair position
                state.lasers.push({ 
                    startX: canvas.width / 2,
                    startY: canvas.height * 0.85,
                    targetX: state.mouseX,
                    targetY: state.mouseY,
                    progress: 0,
                    speed: 0.08,
                    color: ALIEN_COLORS[Math.floor(Math.random() * ALIEN_COLORS.length)]
                });
                state.cameraShake = 3;
            }
            if (e.key.toLowerCase() === 'b' && state.bombs > 0) {
                e.preventDefault();
                state.bombs--;
                // Bomb destroys all enemies
                state.enemies.forEach(enemy => {
                    for (let j = 0; j < 30; j++) {
                        state.particles.push({
                            x: canvas.width / 2 + (enemy.x - state.viewAngle * 2) * enemy.z * 3,
                            y: canvas.height * 0.45 + (canvas.height - canvas.height * 0.45) * enemy.z * 0.8,
                            vx: (Math.random() - 0.5) * 20,
                            vy: (Math.random() - 0.5) * 20 - 5,
                            life: 60, maxLife: 60,
                            color: ['#ff6b35', '#ffaa00', '#ff4444'][Math.floor(Math.random() * 3)]
                        });
                    }
                    state.score += 100;
                });
                state.enemies = [];
                state.cameraShake = 15;
            }
        };
        const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Mouse tracking for aiming
        const handleMouseMove = (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const gameLoop = () => {
            if (state.gameOver) {
                setGameScore(state.score);
                setScreen('quiz');
                return;
            }
            
            // Check level completion
            if (state.levelScore >= state.levelTarget && !state.levelComplete) {
                state.levelComplete = true;
                setGameScore(state.score);
                setLevelComplete(true);
                setScreen('quiz');
                return;
            }

            const centerX = canvas.width / 2;
            const horizon = canvas.height * 0.45;
            
            // Camera shake effect
            const shakeX = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake * 2 : 0;
            const shakeY = state.cameraShake > 0 ? (Math.random() - 0.5) * state.cameraShake * 2 : 0;
            state.cameraShake *= 0.9;
            
            ctx.save();
            ctx.translate(shakeX, shakeY);

            // Sky gradient (dark atmosphere)
            const skyGradient = ctx.createLinearGradient(0, 0, 0, horizon);
            skyGradient.addColorStop(0, '#0a0f1a');
            skyGradient.addColorStop(0.5, '#1a2744');
            skyGradient.addColorStop(1, '#2d3a52');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, horizon);

            // Draw stars with parallax
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            for (let i = 0; i < 100; i++) {
                const starX = ((i * 73 + state.viewAngle * 0.1) % canvas.width);
                const starY = (i * 37) % (horizon * 0.8);
                ctx.beginPath();
                ctx.arc(starX, starY, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Far mountains (slowest parallax)
            ctx.fillStyle = '#1a2235';
            state.bgLayers.farMountains.forEach(m => {
                const parallaxX = m.x - state.viewAngle * 0.2;
                const wrappedX = ((parallaxX % (canvas.width + 600)) + canvas.width + 600) % (canvas.width + 600) - 300;
                ctx.beginPath();
                ctx.moveTo(wrappedX - m.width/2, horizon);
                ctx.lineTo(wrappedX, horizon - m.height);
                ctx.lineTo(wrappedX + m.width/2, horizon);
                ctx.fill();
            });

            // Near mountains (faster parallax)
            ctx.fillStyle = '#252d40';
            state.bgLayers.nearMountains.forEach(m => {
                const parallaxX = m.x - state.viewAngle * 0.5;
                const wrappedX = ((parallaxX % (canvas.width + 400)) + canvas.width + 400) % (canvas.width + 400) - 200;
                ctx.beginPath();
                ctx.moveTo(wrappedX - m.width/2, horizon);
                ctx.lineTo(wrappedX, horizon - m.height);
                ctx.lineTo(wrappedX + m.width/2, horizon);
                ctx.fill();
            });

            // Ground plane with perspective grid
            const groundGradient = ctx.createLinearGradient(0, horizon, 0, canvas.height);
            groundGradient.addColorStop(0, '#2d3a52');
            groundGradient.addColorStop(1, '#1a2235');
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);

            // Perspective grid lines (FPS depth effect)
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
            ctx.lineWidth = 1;
            
            // Horizontal lines with perspective
            for (let i = 0; i < 20; i++) {
                const yOffset = Math.pow(i / 20, 2) * (canvas.height - horizon);
                const y = horizon + yOffset;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Vertical lines converging to horizon (vanishing point)
            for (let i = -10; i <= 10; i++) {
                const baseX = centerX + i * 150 - (state.viewAngle % 150);
                ctx.beginPath();
                ctx.moveTo(baseX, horizon);
                const endX = centerX + (baseX - centerX) * 4;
                ctx.lineTo(endX, canvas.height);
                ctx.stroke();
            }

            // Player view rotation based on mouse
            const targetAngle = ((state.mouseX - centerX) / centerX) * 30;
            state.viewAngle += (targetAngle - state.viewAngle) * 0.1;

            // Keyboard movement for arrow keys
            if (keys.arrowleft) state.mouseX = Math.max(100, state.mouseX - 8);
            if (keys.arrowright) state.mouseX = Math.min(canvas.width - 100, state.mouseX + 8);
            if (keys.arrowup) state.mouseY = Math.max(100, state.mouseY - 8);
            if (keys.arrowdown) state.mouseY = Math.min(canvas.height - 100, state.mouseY + 8);
            if (keys.a) state.viewAngle -= 3;
            if (keys.d) state.viewAngle += 3;

            // Spawn enemies in 3D space
            state.enemySpawnTimer--;
            if (state.enemySpawnTimer <= 0) {
                const alienType = state.alienTypes[Math.floor(Math.random() * state.alienTypes.length)];
                const alienColor = ALIEN_COLORS[Math.floor(Math.random() * ALIEN_COLORS.length)];
                state.enemies.push({
                    x: (Math.random() - 0.5) * 400,
                    z: 0.1,
                    type: alienType,
                    color: alienColor,
                    health: 1,
                    wobble: Math.random() * Math.PI * 2
                });
                state.enemySpawnTimer = Math.max(30, 120 - state.score / 50);
            }

            // Update and draw enemies with 3D perspective
            state.enemies = state.enemies.filter((enemy) => {
                enemy.z += 0.003;
                enemy.wobble += 0.05;
                
                // 3D to 2D projection with wobble
                const scale = enemy.z * 3;
                const screenX = centerX + (enemy.x - state.viewAngle * 2) * scale + Math.sin(enemy.wobble) * 5;
                const screenY = horizon + (canvas.height - horizon) * enemy.z * 0.8;
                const size = 80 * scale; // Larger aliens

                if (enemy.z > 1.2) {
                    state.player.health--;
                    state.cameraShake = 10;
                    if (state.player.health <= 0) state.gameOver = true;
                    return false;
                }

                // Draw enemy based on type
                ctx.save();
                ctx.translate(screenX, screenY);

                ctx.fillStyle = enemy.color;
                ctx.shadowBlur = 25;
                ctx.shadowColor = enemy.color;
                
                // Draw different alien types
                if (enemy.type === 'truck') {
                    // Truck/Bus front view
                    ctx.fillRect(-size/2.5, -size/4, size/1.25, size/2);
                    // Windshield
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fillRect(-size/3.5, -size/5, size/1.75, size/4);
                    // Headlights
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(-size/3.5, size/6, size/10, 0, Math.PI * 2);
                    ctx.arc(size/3.5, size/6, size/10, 0, Math.PI * 2);
                    ctx.fill();
                    // Grill
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(-size/5, size/12, size/2.5, size/8);
                } else if (enemy.type === 'spacesuit') {
                    // Space suit robot - humanoid shape
                    // Helmet
                    ctx.beginPath();
                    ctx.arc(0, -size/4, size/4, 0, Math.PI * 2);
                    ctx.fill();
                    // Visor
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.beginPath();
                    ctx.ellipse(0, -size/4, size/6, size/8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Body
                    ctx.fillStyle = enemy.color;
                    ctx.beginPath();
                    ctx.ellipse(0, size/8, size/3, size/4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Arms
                    ctx.beginPath();
                    ctx.arc(-size/2.5, 0, size/8, 0, Math.PI * 2);
                    ctx.arc(size/2.5, 0, size/8, 0, Math.PI * 2);
                    ctx.fill();
                    // Legs
                    ctx.beginPath();
                    ctx.ellipse(-size/6, size/3, size/10, size/6, 0, 0, Math.PI * 2);
                    ctx.ellipse(size/6, size/3, size/10, size/6, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else if (enemy.type === 'spaceship') {
                    // Aggressive spaceship - angular design
                    ctx.beginPath();
                    ctx.moveTo(0, -size/3);
                    ctx.lineTo(-size/2, size/4);
                    ctx.lineTo(-size/4, size/6);
                    ctx.lineTo(-size/6, size/3);
                    ctx.lineTo(size/6, size/3);
                    ctx.lineTo(size/4, size/6);
                    ctx.lineTo(size/2, size/4);
                    ctx.closePath();
                    ctx.fill();
                    // Cockpit
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.beginPath();
                    ctx.arc(0, -size/8, size/8, 0, Math.PI * 2);
                    ctx.fill();
                    // Wings detail
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath();
                    ctx.moveTo(-size/3, size/8);
                    ctx.lineTo(-size/2, size/4);
                    ctx.lineTo(-size/4, size/6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(size/3, size/8);
                    ctx.lineTo(size/2, size/4);
                    ctx.lineTo(size/4, size/6);
                    ctx.closePath();
                    ctx.fill();
                } else if (enemy.type === 'rocket') {
                    // Rocket ship - pointed design
                    ctx.beginPath();
                    ctx.moveTo(0, -size/2);
                    ctx.quadraticCurveTo(size/4, -size/4, size/5, size/6);
                    ctx.lineTo(size/3, size/3);
                    ctx.lineTo(size/8, size/4);
                    ctx.lineTo(0, size/3);
                    ctx.lineTo(-size/8, size/4);
                    ctx.lineTo(-size/3, size/3);
                    ctx.lineTo(-size/5, size/6);
                    ctx.quadraticCurveTo(-size/4, -size/4, 0, -size/2);
                    ctx.closePath();
                    ctx.fill();
                    // Window
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.beginPath();
                    ctx.arc(0, -size/6, size/10, 0, Math.PI * 2);
                    ctx.fill();
                    // Flames
                    ctx.fillStyle = '#ff6b35';
                    ctx.beginPath();
                    ctx.moveTo(-size/10, size/3);
                    ctx.lineTo(0, size/2);
                    ctx.lineTo(size/10, size/3);
                    ctx.closePath();
                    ctx.fill();
                } else if (enemy.type === 'ufo') {
                    // UFO - classic flying saucer
                    ctx.beginPath();
                    ctx.ellipse(0, 0, size/2, size/6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(0, -size/8, size/4, Math.PI, 0, false);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.beginPath();
                    ctx.arc(0, -size/6, size/6, Math.PI, 0, false);
                    ctx.fill();
                    // Lights
                    ctx.fillStyle = '#fff';
                    for (let i = -2; i <= 2; i++) {
                        ctx.beginPath();
                        ctx.arc(i * size/6, size/12, size/20, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (enemy.type === 'mech') {
                    // Mech robot - bulky design
                    // Head
                    ctx.fillRect(-size/6, -size/3, size/3, size/5);
                    // Visor
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(-size/8, -size/3.5, size/4, size/10);
                    // Body
                    ctx.fillStyle = enemy.color;
                    ctx.fillRect(-size/3, -size/8, size/1.5, size/3);
                    // Arms
                    ctx.fillRect(-size/2, -size/10, size/6, size/3);
                    ctx.fillRect(size/3, -size/10, size/6, size/3);
                    // Legs
                    ctx.fillRect(-size/4, size/5, size/6, size/4);
                    ctx.fillRect(size/12, size/5, size/6, size/4);
                    // Shoulder pads
                    ctx.beginPath();
                    ctx.arc(-size/3, -size/10, size/8, 0, Math.PI * 2);
                    ctx.arc(size/3, -size/10, size/8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;

                ctx.restore();

                // Collision with lasers
                for (let i = state.lasers.length - 1; i >= 0; i--) {
                    const laser = state.lasers[i];
                    if (laser.progress < 0.3) continue;
                    
                    const laserX = laser.startX + (laser.targetX - laser.startX) * laser.progress;
                    const laserY = laser.startY + (laser.targetY - laser.startY) * laser.progress;
                    
                    if (Math.abs(laserX - screenX) < size/2 && 
                        Math.abs(laserY - screenY) < size/2) {
                        // Explosion
                        for (let j = 0; j < 30; j++) {
                            state.particles.push({
                                x: screenX, y: screenY,
                                vx: (Math.random() - 0.5) * 15,
                                vy: (Math.random() - 0.5) * 15 - 5,
                                life: 40, maxLife: 40,
                                color: enemy.color
                            });
                        }
                        state.lasers.splice(i, 1);
                        state.score += 100;
                        state.levelScore += 100;
                        state.cameraShake = 5;
                        return false;
                    }
                }

                return true;
            });

            // Update and draw lasers
            state.lasers = state.lasers.filter(laser => {
                laser.progress += laser.speed;
                
                const currentX = laser.startX + (laser.targetX - laser.startX) * laser.progress;
                const currentY = laser.startY + (laser.targetY - laser.startY) * laser.progress;
                
                // Draw laser beam
                const gradient = ctx.createLinearGradient(laser.startX, laser.startY, currentX, currentY);
                gradient.addColorStop(0, 'transparent');
                gradient.addColorStop(0.3, laser.color);
                gradient.addColorStop(1, '#fff');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 4;
                ctx.shadowBlur = 20;
                ctx.shadowColor = laser.color;
                ctx.beginPath();
                ctx.moveTo(laser.startX, laser.startY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                // Laser head glow
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.shadowBlur = 0;

                return laser.progress < 1.2;
            });

            // Update and draw particles
            state.particles = state.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3;
                p.life--;
                ctx.fillStyle = p.color || `rgba(255, 180, 80, ${p.life / p.maxLife})`;
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                return p.life > 0;
            });

            // Draw crosshair at mouse position (FPS style)
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            const crossSize = 25;
            const crossX = state.mouseX;
            const crossY = state.mouseY;
            
            // Crosshair frame
            ctx.beginPath();
            ctx.moveTo(crossX - crossSize - 10, crossY - crossSize);
            ctx.lineTo(crossX - crossSize, crossY - crossSize);
            ctx.lineTo(crossX - crossSize, crossY - crossSize - 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(crossX + crossSize + 10, crossY - crossSize);
            ctx.lineTo(crossX + crossSize, crossY - crossSize);
            ctx.lineTo(crossX + crossSize, crossY - crossSize - 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(crossX - crossSize - 10, crossY + crossSize);
            ctx.lineTo(crossX - crossSize, crossY + crossSize);
            ctx.lineTo(crossX - crossSize, crossY + crossSize + 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(crossX + crossSize + 10, crossY + crossSize);
            ctx.lineTo(crossX + crossSize, crossY + crossSize);
            ctx.lineTo(crossX + crossSize, crossY + crossSize + 10);
            ctx.stroke();
            
            // Center dot
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(crossX, crossY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Distance markers below crosshair
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.textAlign = 'center';
            ctx.font = '10px monospace';
            for (let i = -5; i <= 5; i++) {
                if (i !== 0) {
                    const markerX = crossX + i * 20;
                    ctx.fillRect(markerX - 1, crossY + crossSize + 25, 2, i % 5 === 0 ? 10 : 5);
                }
            }
            ctx.fillText('10', crossX - 100, crossY + crossSize + 50);
            ctx.fillText('10', crossX + 100, crossY + crossSize + 50);

            ctx.restore();

            // HUD Elements
            drawHUD(ctx, canvas, state);

            animationId = requestAnimationFrame(gameLoop);
        };

        const drawHUD = (ctx, canvas, state) => {
            // Radar (bottom left)
            const radarX = 120;
            const radarY = canvas.height - 120;
            const radarR = 80;
            
            ctx.strokeStyle = 'rgba(0, 200, 150, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(radarX, radarY, radarR, 0, Math.PI * 2);
            ctx.stroke();
            
            // Radar grid
            ctx.strokeStyle = 'rgba(0, 200, 150, 0.2)';
            ctx.beginPath();
            ctx.arc(radarX, radarY, radarR * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(radarX - radarR, radarY);
            ctx.lineTo(radarX + radarR, radarY);
            ctx.moveTo(radarX, radarY - radarR);
            ctx.lineTo(radarX, radarY + radarR);
            ctx.stroke();
            
            // Enemy blips on radar
            state.enemies.forEach(e => {
                const blipX = radarX + (e.x / 400) * radarR * 0.8;
                const blipY = radarY - e.z * radarR * 0.8;
                ctx.fillStyle = e.type === 'tank' ? '#00ff88' : '#00aaff';
                ctx.beginPath();
                ctx.arc(blipX, blipY, 4, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Player blip
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(radarX, radarY + 8);
            ctx.lineTo(radarX - 6, radarY - 4);
            ctx.lineTo(radarX + 6, radarY - 4);
            ctx.closePath();
            ctx.fill();

            // Compass (top right)
            const compassX = canvas.width - 100;
            const compassY = 100;
            const compassR = 60;
            
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(compassX, compassY, compassR, 0, Math.PI * 2);
            ctx.stroke();
            
            // Compass directions
            const compassAngle = -state.viewAngle * Math.PI / 180;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            const dirs = ['N', 'E', 'S', 'W'];
            dirs.forEach((d, i) => {
                const a = compassAngle + i * Math.PI / 2;
                const dx = Math.sin(a) * (compassR - 15);
                const dy = -Math.cos(a) * (compassR - 15);
                ctx.fillStyle = d === 'N' ? '#00ffff' : 'rgba(255,255,255,0.6)';
                ctx.fillText(d, compassX + dx, compassY + dy + 4);
            });
            
            // Compass needle
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(compassX, compassY - 20);
            ctx.lineTo(compassX, compassY + 20);
            ctx.stroke();
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(compassX, compassY - 25);
            ctx.lineTo(compassX - 5, compassY - 15);
            ctx.lineTo(compassX + 5, compassY - 15);
            ctx.closePath();
            ctx.fill();

            // Level progress display (top right, next to compass)
            const scoreX = canvas.width - 220;
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(scoreX, compassY, 50, 0, Math.PI * 2);
            ctx.stroke();
            
            // Level progress arc
            const progressPercent = Math.min(1, state.levelScore / state.levelTarget);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(scoreX, compassY, 45, -Math.PI/2, -Math.PI/2 + progressPercent * Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL ${currentLevel}`, scoreX, compassY - 15);
            
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(state.levelScore, scoreX, compassY + 5);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '10px monospace';
            ctx.fillText(`/ ${state.levelTarget}`, scoreX, compassY + 20);

            // Health (hearts) top left
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('HEALTH', 30, 35);
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = i < state.player.health ? '#ff4444' : 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                const hx = 30 + i * 30;
                const hy = 55;
                ctx.moveTo(hx + 10, hy + 5);
                ctx.bezierCurveTo(hx + 10, hy, hx, hy, hx, hy + 5);
                ctx.bezierCurveTo(hx, hy + 10, hx + 10, hy + 15, hx + 10, hy + 20);
                ctx.bezierCurveTo(hx + 10, hy + 15, hx + 20, hy + 10, hx + 20, hy + 5);
                ctx.bezierCurveTo(hx + 20, hy, hx + 10, hy, hx + 10, hy + 5);
                ctx.fill();
            }

            // Awards display (top center)
            ctx.fillStyle = '#00d4ff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Awards', canvas.width / 2, 30);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '12px monospace';
            ctx.fillText('Medals to be won', canvas.width / 2, 50);
            
            // Medal placeholders
            const medals = [
                { x: canvas.width / 2 - 40, earned: state.score >= 300 },
                { x: canvas.width / 2, earned: state.score >= 600 },
                { x: canvas.width / 2 + 40, earned: state.score >= 1000 }
            ];
            medals.forEach((m, i) => {
                ctx.strokeStyle = m.earned ? '#ffd700' : 'rgba(100, 150, 200, 0.3)';
                ctx.fillStyle = m.earned ? 'rgba(255, 215, 0, 0.3)' : 'transparent';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(m.x, 85, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                if (m.earned) {
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.moveTo(m.x, 75);
                    ctx.lineTo(m.x + 5, 90);
                    ctx.lineTo(m.x - 5, 90);
                    ctx.closePath();
                    ctx.fill();
                }
            });

            // Bombs display (bottom right)
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('BOMBS', canvas.width - 30, canvas.height - 60);
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = i < state.bombs ? '#fbbf24' : 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.arc(canvas.width - 30 - i * 30, canvas.height - 35, 10, 0, Math.PI * 2);
                ctx.fill();
            }

            // Controls hint
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('MOUSE/ARROWS to aim • SPACE to fire • B for bomb', canvas.width / 2, canvas.height - 20);
        };

        gameLoop();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [screen]);

    const handleAnswer = (answer) => {
        const correct = questions[currentQuestion]?.answer === answer;
        if (correct) {
            setScore(s => s + 1);
            if (score + 1 === 3) setAwards(a => [...a, 'bronze']);
            if (score + 1 === 7) setAwards(a => [...a, 'silver']);
            if (score + 1 === 10) setAwards(a => [...a, 'gold']);
        }
        
        // If level complete and answered enough questions, proceed to next level
        if (levelComplete) {
            if (correct && score >= currentLevel) {
                // Move to next level
                setCurrentLevel(c => c + 1);
                setCurrentQuestion(0);
                setLevelComplete(false);
                setScreen('game');
            } else if (currentQuestion < Math.min(questions.length - 1, currentLevel + 1)) {
                setCurrentQuestion(c => c + 1);
            } else if (!correct) {
                // Failed quiz - game over
                setScreen('results');
            } else {
                setCurrentLevel(c => c + 1);
                setCurrentQuestion(0);
                setLevelComplete(false);
                setScreen('game');
            }
        } else {
            // Normal game over quiz
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(c => c + 1);
            } else {
                setScreen('results');
            }
        }
    };

    const filteredTopics = (topics) => {
        if (!searchQuery.trim()) return topics;
        return topics.filter(t => 
            t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };
    
    if (screen === 'loading') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1a] z-[9999]">
                <div className="text-center">
                    <Loader2 className="w-20 h-20 animate-spin mx-auto mb-6 text-cyan-400" />
                    <h2 className="text-3xl font-bold mb-2 text-white">Initializing Battle Zone...</h2>
                    <p className="text-lg text-gray-400">AI is generating your mission</p>
                </div>
            </div>
        );
    }
    
    if (screen === 'quiz') {
        const q = questions[currentQuestion];
        const questionsNeeded = levelComplete ? currentLevel + 1 : questions.length;
        return (
            <div className="fixed inset-0 bg-[#0a0f1a] z-[9999] flex">
                {/* Left panel - Radar */}
                <div className="w-80 p-6 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,200,150,0.3)" strokeWidth="2"/>
                            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0,200,150,0.2)" strokeWidth="1"/>
                            <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0,200,150,0.2)" strokeWidth="1"/>
                            <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0,200,150,0.2)" strokeWidth="1"/>
                            <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0,200,150,0.2)" strokeWidth="1"/>
                            {/* Blips */}
                            <circle cx="60" cy="50" r="5" fill="#00ffff"/>
                            <circle cx="140" cy="80" r="5" fill="#00ffff"/>
                            <circle cx="100" cy="150" r="6" fill="#00ff88"/>
                        </svg>
                        {levelComplete && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
                                    <p className="text-cyan-400 font-bold">LEVEL {currentLevel}</p>
                                    <p className="text-white text-sm">COMPLETE!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right panel - Question */}
                <div className="flex-1 flex flex-col justify-center p-8">
                    {levelComplete && (
                        <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border border-cyan-500/50 rounded-lg p-4 mb-4 max-w-2xl">
                            <p className="text-cyan-400 font-bold text-lg">🎯 Level {currentLevel} Complete!</p>
                            <p className="text-gray-300">Answer {currentLevel + 1} questions correctly to unlock Level {currentLevel + 1}</p>
                            <p className="text-green-400 mt-2">Correct answers: {score} / {currentLevel + 1} needed</p>
                        </div>
                    )}
                    <div className="bg-[#0d1420] border border-gray-700 rounded-lg p-8 max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-cyan-400 font-mono">{levelComplete ? `Level ${currentLevel} Quiz` : 'Technical track'}</span>
                            <div className="flex items-center gap-2">
                                <img src={LOGO_URL} alt="1cPublishing" className="w-6 h-6 rounded" />
                                <span className="text-gray-400 font-mono">1cPublishing</span>
                            </div>
                        </div>
                        <h3 className="text-2xl text-white mb-8 leading-relaxed">{q?.question}</h3>
                        <div className="flex gap-4">
                            <Button onClick={() => handleAnswer(false)} 
                                className="flex-1 h-14 text-lg font-mono border-2 border-red-500/50 bg-transparent hover:bg-red-500/20 text-red-400 rounded-full">
                                No
                            </Button>
                            <Button onClick={() => handleAnswer(true)} 
                                className="flex-1 h-14 text-lg font-mono border-2 border-green-500/50 bg-transparent hover:bg-green-500/20 text-green-400 rounded-full">
                                Yes
                            </Button>
                        </div>
                        <p className="text-right text-gray-500 mt-6 font-mono">Question {currentQuestion + 1} {levelComplete ? `/ ${questionsNeeded}` : ''}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (screen === 'results') {
        const totalScore = gameScore + (score * 50);
        return (
            <div className="fixed inset-0 bg-[#0a0f1a] z-[9999] flex items-center justify-center">
                <Card className="p-10 bg-[#0d1a2d] border-cyan-500/50 text-center max-w-lg">
                    <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-400" />
                    <h2 className="text-4xl font-bold text-white mb-4">Mission Complete!</h2>
                    <p className="text-xl text-gray-400">Combat Score: {gameScore}</p>
                    <p className="text-xl text-gray-400">Knowledge Score: {score}/{questions.length}</p>
                    <p className="text-2xl text-cyan-400 mb-6">Total Score: {totalScore}</p>
                    <div className="flex justify-center gap-4 mb-8">
                        {awards.includes('gold') && <Award className="w-12 h-12 text-yellow-400" />}
                        {awards.includes('silver') && <Award className="w-12 h-12 text-gray-300" />}
                        {awards.includes('bronze') && <Award className="w-12 h-12 text-amber-600" />}
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => setScreen('menu')} className="flex-1 bg-gray-700 hover:bg-gray-600">New Mission</Button>
                        <Button onClick={onExit} className="flex-1 bg-cyan-600 hover:bg-cyan-700">Exit</Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (screen === 'game') {
        return (
            <div className="fixed inset-0 bg-[#0a0f1a] z-[9999]">
                <canvas ref={canvasRef} className="absolute inset-0" />
                <Button onClick={onExit} className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-700">
                    <X className="w-4 h-4 mr-1" /> Exit
                </Button>
            </div>
        );
    }

    // Menu screen - light theme matching WordShooter
    return (
        <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-auto p-8">
            <Button onClick={onExit} variant="ghost" className="absolute top-4 right-4 text-gray-500 hover:text-red-500 hover:bg-red-50">
                <X className="w-5 h-5" />
            </Button>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🎯</div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">SPACE BATTLE</h1>
                    <p className="text-gray-500">FPS Combat Learning Game</p>
                </div>

                {/* Search bar */}
                <div className="bg-white rounded-2xl border border-purple-200 p-4 mb-6 shadow-sm">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search decks or enter custom topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) startGame('custom'); }}
                                className="pl-12 h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl" />
                        </div>
                        <Button onClick={() => searchQuery.trim() ? startGame('custom') : startGame(generatedTopics[activeCategory]?.[0])} 
                            disabled={loading}
                            className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl">
                            <Play className="w-4 h-4 mr-2" /> Start Game
                        </Button>
                    </div>
                </div>

                {/* Categories and Topics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                    {/* Category tabs */}
                    <div className="flex gap-2 mb-6">
                        {TABS.map(tab => (
                            <Button key={tab.id} onClick={() => setActiveCategory(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeCategory === tab.id 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {/* Topics grid */}
                    {loadingTopics ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-purple-500" />
                            <p className="text-gray-500">Generating topics with AI...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredTopics(generatedTopics[activeCategory] || []).slice(0, 9).map((topic, i) => {
                                const icons = [Shield, Cpu, Globe, Atom, Code, TrendingUp, Brain, Lightbulb];
                                const TopicIcon = icons[i % icons.length];
                                return (
                                    <button key={topic.id || i} onClick={() => startGame(topic)}
                                        className="h-auto py-6 px-5 bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-left rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg">
                                        <TopicIcon className="w-6 h-6 text-white/70 mb-3" />
                                        <p className="font-semibold text-white text-base leading-tight">{topic.label}</p>
                                        <p className="text-sm text-white/70 line-clamp-2 mt-2">{topic.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Crosshair, title: 'FPS Combat', desc: 'First-person perspective with parallax depth', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
                        { icon: Sparkles, title: 'Knowledge Quiz', desc: 'Answer questions after battle', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
                        { icon: Trophy, title: 'Earn Awards', desc: 'Collect medals and achievements', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                            <div className={`w-12 h-12 ${item.bgColor} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">{item.title}</h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}