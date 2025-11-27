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
    ];

    useEffect(() => {
        generateAllTopics();
    }, []);

    const generateAllTopics = async () => {
        setLoadingTopics(true);
        const allTopics = {};
        
        const prompts = {
            trending: 'Generate 6 trending tech and knowledge topics people should learn about right now. Include AI, cybersecurity, space, and emerging technologies.',
            programming: 'Generate 6 programming and software development topics including languages, frameworks, algorithms, and development practices.',
            science: 'Generate 6 science topics across physics, chemistry, biology, astronomy, and earth sciences.',
            business: 'Generate 6 business and entrepreneurship topics including finance, marketing, strategy, and leadership.'
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
            alienTypes: ['bug', 'ghost', 'skull', 'bot', 'ufo', 'squid'],
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
                
                // 3D to 2D projection
                const scale = enemy.z * 3;
                const screenX = centerX + (enemy.x - state.viewAngle * 2) * scale;
                const screenY = horizon + (canvas.height - horizon) * enemy.z * 0.8;
                const size = 60 * scale;

                if (enemy.z > 1.2) {
                    state.player.health--;
                    state.cameraShake = 10;
                    if (state.player.health <= 0) state.gameOver = true;
                    return false;
                }

                // Draw enemy based on type
                ctx.save();
                ctx.translate(screenX, screenY);

                // Draw alien icons
                const alienColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];
                ctx.fillStyle = alienColors[Math.floor(enemy.x + enemy.z * 100) % alienColors.length];
                ctx.shadowBlur = 20;
                ctx.shadowColor = ctx.fillStyle;
                
                if (enemy.type === 'tank') {
                    // Bug alien - draw a bug shape
                    ctx.beginPath();
                    ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Antennae
                    ctx.strokeStyle = ctx.fillStyle;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(-size/4, -size/3);
                    ctx.lineTo(-size/3, -size/2);
                    ctx.moveTo(size/4, -size/3);
                    ctx.lineTo(size/3, -size/2);
                    ctx.stroke();
                    // Eyes
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(-size/6, -size/8, size/10, 0, Math.PI * 2);
                    ctx.arc(size/6, -size/8, size/10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(-size/6, -size/8, size/20, 0, Math.PI * 2);
                    ctx.arc(size/6, -size/8, size/20, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Ghost alien - draw a ghost shape
                    ctx.beginPath();
                    ctx.arc(0, -size/6, size/3, Math.PI, 0, false);
                    ctx.lineTo(size/3, size/4);
                    ctx.lineTo(size/6, size/8);
                    ctx.lineTo(0, size/4);
                    ctx.lineTo(-size/6, size/8);
                    ctx.lineTo(-size/3, size/4);
                    ctx.closePath();
                    ctx.fill();
                    // Eyes
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(-size/8, -size/6, size/10, 0, Math.PI * 2);
                    ctx.arc(size/8, -size/6, size/10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(-size/8, -size/6, size/20, 0, Math.PI * 2);
                    ctx.arc(size/8, -size/6, size/20, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;

                ctx.restore();

                // Collision with bullets
                for (let i = state.bullets.length - 1; i >= 0; i--) {
                    const b = state.bullets[i];
                    const bScreenX = centerX;
                    const bScreenY = canvas.height * 0.6 - (1 - b.z) * 400;
                    
                    if (Math.abs(bScreenX - screenX) < size && 
                        Math.abs(bScreenY - screenY) < size/2 && 
                        Math.abs(b.z - enemy.z) < 0.2) {
                        // Explosion
                        for (let j = 0; j < 30; j++) {
                            state.particles.push({
                                x: screenX, y: screenY,
                                vx: (Math.random() - 0.5) * 15,
                                vy: (Math.random() - 0.5) * 15 - 5,
                                life: 40, maxLife: 40,
                                color: Math.random() > 0.5 ? '#ff6b35' : '#ffaa00'
                            });
                        }
                        state.bullets.splice(i, 1);
                        state.score += 100;
                        state.cameraShake = 5;
                        return false;
                    }
                }

                return true;
            });

            // Update and draw bullets with 3D perspective
            state.bullets = state.bullets.filter(bullet => {
                bullet.z += bullet.speed;
                
                const scale = bullet.z;
                // Bullet moves toward target
                const startY = canvas.height * 0.8;
                const targetY = bullet.targetY || canvas.height * 0.3;
                const screenY = startY - (startY - targetY) * (bullet.z - 1) * 3;
                const screenX = centerX + (bullet.targetX - centerX) * (bullet.z - 1) * 2;
                const size = 8 / (bullet.z + 0.5);
                
                // Bullet tracer effect
                ctx.fillStyle = '#00ffff';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                return bullet.z < 1.5;
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

            // Score display (top right, next to compass)
            const scoreX = canvas.width - 220;
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(scoreX, compassY, 50, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText('Exam Score', scoreX, compassY - 20);
            
            const scorePercent = Math.min(100, Math.floor(state.score / 10));
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 18px monospace';
            ctx.fillText(scorePercent, scoreX - 10, compassY + 8);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '14px monospace';
            ctx.fillText('/100', scoreX + 15, compassY + 8);

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
        
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(c => c + 1);
        } else {
            setScreen('results');
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
                    </div>
                </div>

                {/* Right panel - Question */}
                <div className="flex-1 flex flex-col justify-end p-8">
                    <div className="bg-[#0d1420] border border-gray-700 rounded-lg p-8 max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-cyan-400 font-mono">Technical track</span>
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
                        <p className="text-right text-gray-500 mt-6 font-mono">Question {currentQuestion + 1}</p>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {filteredTopics(generatedTopics[activeCategory] || []).slice(0, 6).map((topic, i) => {
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