import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Award, Trophy, Target, Sparkles, Play, Search, Rocket, Crosshair, Zap, Compass, Radio, Shield, Cpu, Globe, Atom, Code, TrendingUp, Brain, Lightbulb, Bug, Ghost, Skull, Bot, Bomb } from 'lucide-react';
import { LOGO_URL } from '@/components/NavigationConfig';

// UFO ship images
const ENEMY_SHIPS = [
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/adfcb0160_ship1.png',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/1ade34330_ship2.png',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/f12015712_ship3.png',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/4657e6c28_ship4.png',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/52957b8d6_ship5.png',
];

// Space background images per level
const SPACE_BACKGROUNDS = [
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/5319c6157_9791334.jpg',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/d2ddee7b0_9791314.jpg',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/cd1f98f84_9791329.jpg',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/092f6eef4_9805703.jpg',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/cf4d32f1a_5438748.jpg',
    'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/7ae729873_9742184.jpg',
];

export default function SpaceBattleGame({ onExit }) {
    const [screen, setScreen] = useState('menu');
    const [activeCategory, setActiveCategory] = useState('trending');
    const [generatedTopics, setGeneratedTopics] = useState({});
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentLoadingTab, setCurrentLoadingTab] = useState('');
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
        // Only load the first tab initially
        loadTabTopics('trending');
    }, []);

    const loadTabTopics = async (tabId) => {
        if (generatedTopics[tabId]?.length) return; // Already loaded
        setLoadingTopics(true);
        setCurrentLoadingTab(TABS.find(t => t.id === tabId)?.label || tabId);
        const topics = await generateTopicsForTab(tabId);
        setGeneratedTopics(prev => ({ ...prev, [tabId]: topics }));
        setLoadingTopics(false);
    };

    const handleTabClick = (tabId) => {
        setActiveCategory(tabId);
        loadTabTopics(tabId);
    };

    const generateTopicsForTab = async (tabId) => {
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

        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `${prompts[tabId]} Return as JSON: { "topics": [{ "id": "topic-id", "label": "Topic Name", "description": "Brief compelling description" }] }`,
                add_context_from_internet: tabId === 'trending',
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
            return result?.topics || [];
        } catch (error) {
            console.error(`Failed to generate ${tabId} topics:`, error);
            return [];
        }
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
                prompt: `Generate 10 educational Yes/No questions for: "${topicLabel}". Each should test real knowledge. Include a helpful tip for each question. Return: { "questions": [{ "question": "Is X true?", "answer": true, "explanation": "Brief explanation", "tip": "A helpful hint to guide thinking" }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "boolean" }, explanation: { type: "string" }, tip: { type: "string" } } } }
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
                ground: [],
                planets: [],
                stars: [],
                galaxies: []
            },
            score: 0,
            levelScore: 0,
            levelTarget: 1000 * currentLevel, // 10 aliens * 100 points each
            aliensKilled: 0,
            minAliensToKill: 10,
            maxEnemiesOnScreen: 10,
            gameOver: false,
            levelComplete: false,
            enemySpawnTimer: 180,
            enemyImages: [],
            backgroundImage: null,
            bgOffsetX: 0,
            bgOffsetY: 0,
            cameraShake: 0,
            fov: 90,
            viewAngle: 0,
            mouseX: canvas.width / 2,
            mouseY: canvas.height / 2,
            bombs: 3,
            alienTypes: ['truck', 'spacesuit', 'spaceship', 'rocket', 'ufo', 'mech'],
            floorOffset: 0,
            time: 0,
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

        // Initialize space elements - planets
        for (let i = 0; i < 3; i++) {
            state.bgLayers.planets.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.3 + 50,
                radius: 30 + Math.random() * 50,
                color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da'][Math.floor(Math.random() * 6)],
                rings: Math.random() > 0.5,
                speed: 0.1 + Math.random() * 0.2
            });
        }

        // Initialize stars
        for (let i = 0; i < 150; i++) {
            state.bgLayers.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.5,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.05 + Math.random() * 0.1
            });
        }

        // Initialize galaxies/nebulae
        for (let i = 0; i < 2; i++) {
            state.bgLayers.galaxies.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.25 + 20,
                width: 100 + Math.random() * 150,
                height: 50 + Math.random() * 80,
                color: ['rgba(138, 43, 226, 0.3)', 'rgba(0, 191, 255, 0.3)', 'rgba(255, 105, 180, 0.3)'][Math.floor(Math.random() * 3)],
                rotation: Math.random() * Math.PI,
                speed: 0.02 + Math.random() * 0.05
            });
        }

        // Preload enemy ship images
        ENEMY_SHIPS.forEach((src, i) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                state.enemyImages[i] = img;
            };
        });

        // Load background image for current level
        const bgIndex = (currentLevel - 1) % SPACE_BACKGROUNDS.length;
        const bgImg = new Image();
        bgImg.src = SPACE_BACKGROUNDS[bgIndex];
        bgImg.onload = () => {
            state.backgroundImage = bgImg;
        };

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
                // Electronic wave bomb - create expanding ripple
                state.waveEffects = state.waveEffects || [];
                state.waveEffects.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    radius: 0,
                    maxRadius: Math.max(canvas.width, canvas.height),
                    speed: 15,
                    life: 60,
                    maxLife: 60
                });
                // Destroy all enemies with electric sparks
                state.enemies.forEach(enemy => {
                    const ex = canvas.width / 2 + (enemy.x - state.viewAngle * 2) * enemy.z * 3;
                    const ey = enemy.screenY || canvas.height * 0.3;
                    // Electric sparks
                    for (let j = 0; j < 25; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        state.particles.push({
                            x: ex, y: ey,
                            vx: Math.cos(angle) * (5 + Math.random() * 10),
                            vy: Math.sin(angle) * (5 + Math.random() * 10),
                            life: 30 + Math.random() * 20, maxLife: 50,
                            color: ['#00ffff', '#0088ff', '#00aaff', '#ffffff', '#88ffff'][Math.floor(Math.random() * 5)],
                            size: 2 + Math.random() * 4,
                            isElectric: true
                        });
                    }
                    state.score += 100;
                    state.aliensKilled += 1;
                });
                state.enemies = [];
                state.cameraShake = 20;
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

        // Mobile touch controls
        let autoShootInterval = null;
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            state.mouseX = touch.clientX;
            state.mouseY = touch.clientY;
            // Start auto-shooting on mobile
            if (!autoShootInterval) {
                autoShootInterval = setInterval(() => {
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
                }, 400);
            }
        };
        
        const handleTouchMove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            state.mouseX = touch.clientX;
            state.mouseY = touch.clientY;
        };
        
        const handleTouchEnd = () => {
            if (autoShootInterval) {
                clearInterval(autoShootInterval);
                autoShootInterval = null;
            }
        };
        
        if (isMobile) {
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
        }

        const gameLoop = () => {
            if (state.gameOver) {
                setGameScore(state.score);
                setScreen('quiz');
                return;
            }
            
            // Update time and floor animation (reversed - moving away from player)
            state.time += 1;
            state.floorOffset = (state.floorOffset - 2 + 500) % 500;

            // Check level completion - must kill at least 10 aliens
            if (state.aliensKilled >= state.minAliensToKill && !state.levelComplete) {
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

            // Very slow zoom animation for space effect
            const zoomSpeed = 0.00005;
            const baseScale = 1.1;
            const zoomScale = baseScale + Math.sin(state.time * zoomSpeed) * 0.05;
            
            // Subtle drift
            state.bgOffsetX = Math.sin(state.time * 0.0005) * 15;
            state.bgOffsetY = Math.cos(state.time * 0.0003) * 10;

            // Draw background image if loaded - high res, slow zoom
            if (state.backgroundImage && state.backgroundImage.complete) {
                const imgRatio = state.backgroundImage.width / state.backgroundImage.height;
                const canvasRatio = canvas.width / canvas.height;
                let baseWidth, baseHeight;
                
                if (imgRatio > canvasRatio) {
                    baseHeight = canvas.height;
                    baseWidth = baseHeight * imgRatio;
                } else {
                    baseWidth = canvas.width;
                    baseHeight = baseWidth / imgRatio;
                }
                
                // Apply zoom scale
                const drawWidth = baseWidth * zoomScale;
                const drawHeight = baseHeight * zoomScale;
                const drawX = (canvas.width - drawWidth) / 2 + state.bgOffsetX;
                const drawY = (canvas.height - drawHeight) / 2 + state.bgOffsetY;
                
                ctx.drawImage(state.backgroundImage, drawX, drawY, drawWidth, drawHeight);
            } else {
                // Fallback gradient
                const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                skyGradient.addColorStop(0, '#0a0f1a');
                skyGradient.addColorStop(0.5, '#1a2744');
                skyGradient.addColorStop(1, '#2d3a52');
                ctx.fillStyle = skyGradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw subtle animated stars overlay
            ctx.globalAlpha = 0.6;
            state.bgLayers.stars.forEach(star => {
                star.twinkle += 0.05;
                const opacity = 0.3 + Math.sin(star.twinkle) * 0.4;
                ctx.fillStyle = `rgba(255,255,255,${opacity})`;
                ctx.beginPath();
                ctx.arc(star.x - state.viewAngle * star.speed * 0.5, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

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

            // Spawn enemies - max 10 on screen at a time, spawn from top
            state.enemySpawnTimer--;
            if (state.enemySpawnTimer <= 0 && state.enemies.length < state.maxEnemiesOnScreen) {
                // Spawn 1-3 enemies at a time
                const spawnCount = Math.min(
                    Math.floor(Math.random() * 3) + 1,
                    state.maxEnemiesOnScreen - state.enemies.length
                );
                
                for (let s = 0; s < spawnCount; s++) {
                    const shipImageIndex = Math.floor(Math.random() * ENEMY_SHIPS.length);
                    const alienColor = ALIEN_COLORS[Math.floor(Math.random() * ALIEN_COLORS.length)];
                    
                    // Spawn from various top positions - spread out more
                    const spawnZone = Math.random();
                    let startX, startScreenY;
                    
                    if (spawnZone < 0.3) {
                        // Top left corner
                        startX = -300 - Math.random() * 150;
                        startScreenY = -60 - Math.random() * 80;
                    } else if (spawnZone < 0.6) {
                        // Top right corner
                        startX = 300 + Math.random() * 150;
                        startScreenY = -60 - Math.random() * 80;
                    } else {
                        // Spread across entire top width (avoid center)
                        const side = Math.random() > 0.5 ? 1 : -1;
                        startX = side * (100 + Math.random() * 350);
                        startScreenY = -40 - Math.random() * 100;
                    }
                    
                    state.enemies.push({
                        x: startX,
                        z: 0.05 + Math.random() * 0.1,
                        screenY: startScreenY,
                        shipImageIndex: shipImageIndex,
                        color: alienColor,
                        health: 1,
                        wobble: Math.random() * Math.PI * 2,
                        hoverDirection: Math.random() > 0.5 ? 1 : -1,
                        hoverSpeed: 1 + Math.random() * 2,
                        hoverTime: 0,
                        hoverDuration: 60 + Math.random() * 120, // How long to hover before attacking
                        attacking: false,
                        attackSpeed: 0.5 + Math.random() * 0.5,
                    });
                }
                state.enemySpawnTimer = 150 + Math.random() * 100;
            }

            // Update and draw enemies - hover left/right then attack
            state.enemies = state.enemies.filter((enemy) => {
                enemy.wobble += 0.03;
                enemy.hoverTime++;
                
                // Movement behavior: hover left/right, then randomly attack
                if (!enemy.attacking) {
                    // Hover left and right
                    enemy.x += enemy.hoverDirection * enemy.hoverSpeed;
                    
                    // Bounce off screen edges
                    if (enemy.x > 350) enemy.hoverDirection = -1;
                    if (enemy.x < -350) enemy.hoverDirection = 1;
                    
                    // Move down slowly to visible area
                    if (enemy.screenY < canvas.height * 0.25) {
                        enemy.screenY += 1.5;
                    }
                    
                    // Randomly start attacking after hover duration
                    if (enemy.hoverTime > enemy.hoverDuration && Math.random() < 0.02) {
                        enemy.attacking = true;
                    }
                } else {
                    // Attacking - move toward player (increase z)
                    enemy.z += 0.002 * enemy.attackSpeed;
                    // Continue slight horizontal movement
                    enemy.x += Math.sin(enemy.wobble * 2) * 1.5;
                    // Move down screen
                    enemy.screenY += 2;
                }
                
                // 3D to 2D projection
                const scale = enemy.z * 3;
                const screenX = centerX + (enemy.x - state.viewAngle * 2) * scale + Math.sin(enemy.wobble) * 8;
                let screenY = enemy.screenY !== undefined ? enemy.screenY : horizon * 0.5;
                
                // When attacking, also move screen position based on z
                if (enemy.attacking) {
                    screenY = Math.min(screenY, horizon + (canvas.height - horizon) * enemy.z * 0.6);
                }
                
                const size = 107 * scale; // 33% smaller

                if (enemy.z > 1.2) {
                    state.player.health--;
                    state.cameraShake = 10;
                    if (state.player.health <= 0) state.gameOver = true;
                    return false;
                }

                // Draw enemy UFO ship image
                ctx.save();
                ctx.translate(screenX, screenY);

                // Draw ship image if loaded - no glow
                const shipImg = state.enemyImages[enemy.shipImageIndex];
                if (shipImg && shipImg.complete) {
                    const imgWidth = size * 1.3;
                    const imgHeight = size * 0.8;
                    ctx.drawImage(shipImg, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
                } else {
                    // Fallback UFO drawing
                    ctx.fillStyle = enemy.color;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, size/2, size/6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(0, -size/8, size/4, Math.PI, 0, false);
                    ctx.fill();
                }

                ctx.restore();

                // Collision with lasers
                for (let i = state.lasers.length - 1; i >= 0; i--) {
                    const laser = state.lasers[i];
                    if (laser.progress < 0.3) continue;
                    
                    const laserX = laser.startX + (laser.targetX - laser.startX) * laser.progress;
                    const laserY = laser.startY + (laser.targetY - laser.startY) * laser.progress;
                    
                    if (Math.abs(laserX - screenX) < size/2 && 
                        Math.abs(laserY - screenY) < size/2) {
                        // Fireball explosion
                        for (let j = 0; j < 50; j++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 2 + Math.random() * 12;
                            state.particles.push({
                                x: screenX, y: screenY,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed - 3,
                                life: 50 + Math.random() * 30, maxLife: 80,
                                color: ['#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00', '#ffffff'][Math.floor(Math.random() * 6)],
                                size: 3 + Math.random() * 8,
                                isFireball: true
                            });
                        }
                        // Add smoke particles
                        for (let j = 0; j < 20; j++) {
                            state.particles.push({
                                x: screenX + (Math.random() - 0.5) * 30,
                                y: screenY + (Math.random() - 0.5) * 30,
                                vx: (Math.random() - 0.5) * 3,
                                vy: -1 - Math.random() * 2,
                                life: 60, maxLife: 60,
                                color: '#444444',
                                size: 10 + Math.random() * 15,
                                isSmoke: true
                            });
                        }
                        state.lasers.splice(i, 1);
                        state.score += 100;
                        state.levelScore += 100;
                        state.aliensKilled += 1;
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

            // Update and draw wave effects (electronic bomb)
            if (state.waveEffects) {
                state.waveEffects = state.waveEffects.filter(wave => {
                    wave.radius += wave.speed;
                    wave.life--;
                    const alpha = wave.life / wave.maxLife;
                    
                    // Draw multiple ripple rings
                    for (let i = 0; i < 3; i++) {
                        const ringRadius = wave.radius - i * 30;
                        if (ringRadius > 0) {
                            ctx.strokeStyle = `rgba(0, 200, 255, ${alpha * (1 - i * 0.3)})`;
                            ctx.lineWidth = 4 - i;
                            ctx.beginPath();
                            ctx.arc(wave.x, wave.y, ringRadius, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            // Add electric arc segments
                            ctx.strokeStyle = `rgba(150, 230, 255, ${alpha * 0.8})`;
                            ctx.lineWidth = 2;
                            for (let a = 0; a < 12; a++) {
                                const arcAngle = (a / 12) * Math.PI * 2 + wave.radius * 0.02;
                                const x1 = wave.x + Math.cos(arcAngle) * ringRadius;
                                const y1 = wave.y + Math.sin(arcAngle) * ringRadius;
                                const x2 = wave.x + Math.cos(arcAngle) * (ringRadius + 15 + Math.random() * 10);
                                const y2 = wave.y + Math.sin(arcAngle) * (ringRadius + 15 + Math.random() * 10);
                                ctx.beginPath();
                                ctx.moveTo(x1, y1);
                                ctx.lineTo(x2, y2);
                                ctx.stroke();
                            }
                        }
                    }
                    return wave.life > 0 && wave.radius < wave.maxRadius;
                });
            }

            // Update and draw particles
            state.particles = state.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.isSmoke) {
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                    p.size *= 1.02;
                } else if (p.isElectric) {
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                } else if (p.isFireball) {
                    p.vy += 0.1;
                    p.vx *= 0.98;
                    p.size *= 0.97;
                } else {
                    p.vy += 0.3;
                }
                p.life--;
                
                const alpha = p.life / p.maxLife;
                const size = p.size || 4;
                
                if (p.isSmoke) {
                    ctx.fillStyle = `rgba(80, 80, 80, ${alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.isElectric) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else if (p.isFireball) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#ff4400';
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = p.color || `rgba(255, 180, 80, ${alpha})`;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
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
            ctx.fillText(state.aliensKilled, scoreX, compassY + 5);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '10px monospace';
            ctx.fillText(`/ ${state.minAliensToKill} kills`, scoreX, compassY + 20);

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
            if (isMobile) {
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
            }
            if (autoShootInterval) clearInterval(autoShootInterval);
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
            <div className="fixed inset-0 bg-[#0a0f1a] z-[9999] flex items-center justify-center">
                {/* Centered Question Panel */}
                <div className="w-full max-w-2xl mx-auto p-6">
                    {levelComplete && (
                        <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border border-cyan-500/50 rounded-lg p-4 mb-4 text-center">
                            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                            <p className="text-cyan-400 font-bold text-xl">🎯 Level {currentLevel} Complete!</p>
                            <p className="text-gray-300">Answer {currentLevel + 1} questions correctly to unlock Level {currentLevel + 1}</p>
                            <p className="text-green-400 mt-2">Correct answers: {score} / {currentLevel + 1} needed</p>
                        </div>
                    )}
                    <div className="bg-[#0d1420] border border-gray-700 rounded-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-cyan-400 font-mono text-lg">{levelComplete ? `Level ${currentLevel} Quiz` : 'Knowledge Check'}</span>
                            <div className="flex items-center gap-2">
                                <img src={LOGO_URL} alt="1cPublishing" className="w-8 h-8 rounded" />
                            </div>
                        </div>
                        
                        <h3 className="text-2xl text-white mb-6 leading-relaxed text-center">{q?.question}</h3>
                        
                        {/* Tip Section */}
                        {q?.tip && (
                            <div className="bg-amber-900/30 border border-amber-500/40 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-amber-400 font-semibold text-sm mb-1">TIP</p>
                                        <p className="text-amber-200/80 text-sm">{q.tip}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => handleAnswer(false)} 
                                className="w-40 h-14 text-lg font-mono border-2 border-red-500/50 bg-transparent hover:bg-red-500/20 text-red-400 rounded-full">
                                No
                            </Button>
                            <Button onClick={() => handleAnswer(true)} 
                                className="w-40 h-14 text-lg font-mono border-2 border-green-500/50 bg-transparent hover:bg-green-500/20 text-green-400 rounded-full">
                                Yes
                            </Button>
                        </div>
                        <p className="text-center text-gray-500 mt-6 font-mono">Question {currentQuestion + 1} {levelComplete ? `/ ${questionsNeeded}` : `/ ${questions.length}`}</p>
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
                <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
                <Button onClick={onExit} className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-700">
                    <X className="w-4 h-4 mr-1" /> Exit
                </Button>
                <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/8ecb3ee83_image-loading-logo.png" 
                    alt="Watermark" 
                    className="absolute bottom-4 right-4 w-16 h-16 opacity-30 pointer-events-none"
                />
            </div>
        );
    }

    // Menu screen - light theme matching WordShooter
    return (
        <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-auto p-4">
            <Button onClick={onExit} variant="ghost" className="absolute top-2 right-2 text-gray-500 hover:text-red-500 hover:bg-red-50">
                <X className="w-5 h-5" />
            </Button>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-4">
                    <img src={LOGO_URL} alt="1cPublishing" className="w-14 h-14 mx-auto mb-2 rounded-xl" />
                    <h1 className="text-4xl font-black text-gray-900 mb-1">SPACE BATTLE</h1>
                    <p className="text-gray-500">FPS Combat Learning Game</p>
                </div>

                {/* Search bar */}
                <div className="bg-white rounded-xl border border-purple-200 p-3 mb-4 shadow-sm">
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
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {TABS.map(tab => (
                            <Button key={tab.id} onClick={() => handleTabClick(tab.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    activeCategory === tab.id 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {/* Topics grid */}
                    {loadingTopics && !generatedTopics[activeCategory]?.length ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-purple-500" />
                            <p className="text-gray-600 font-medium mb-1">Loading {currentLoadingTab}...</p>
                            <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                            <p className="text-gray-400 text-sm mt-2">{Math.round(loadingProgress)}% complete</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredTopics(generatedTopics[activeCategory] || []).slice(0, 9).map((topic, i) => {
                                const icons = [Shield, Cpu, Globe, Atom, Code, TrendingUp, Brain, Lightbulb];
                                const TopicIcon = icons[i % icons.length];
                                return (
                                    <button key={topic.id || i} onClick={() => startGame(topic)}
                                        className="h-36 py-4 px-4 bg-gradient-to-br from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-left rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg">
                                        <TopicIcon className="w-6 h-6 text-white/70 mb-2" />
                                        <p className="font-semibold text-white text-base leading-tight line-clamp-2">{topic.label}</p>
                                        <p className="text-sm text-white/70 line-clamp-2 mt-1">{topic.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Crosshair, title: 'FPS Combat', desc: 'First-person perspective with parallax depth', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
                        { icon: Sparkles, title: 'Knowledge Quiz', desc: 'Answer questions after battle', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
                        { icon: Trophy, title: 'Earn Awards', desc: 'Collect medals and achievements', bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                            <div className={`w-12 h-12 ${item.bgColor} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-gray-900 font-semibold text-base mb-1">{item.title}</h3>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}