import React, { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
    Play, Pause, RotateCcw, Heart, Target, Trophy, X, Loader2, Search,
    Maximize2, Minimize2, Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp
} from 'lucide-react';
import { LOGO_URL } from '@/components/NavigationConfig';

// Tank images
const PLAYER_TANK = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/dca90a2df_tank1.png';
const ENEMY_TANK_1 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/be5b65846_tank2.png';
const ENEMY_TANK_2 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/f8e40db27_tank3.png';
const ENEMY_TANK_3 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/7870c2844_tank4.png';
const ENEMY_TANK_4 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/6f8df8187_tank5.png';
const BASE_LOGO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/1a9bef8b1_1c-logo.png';

const TILE = 60; // 25% larger tanks

// Tile types
const TILE_EMPTY = 0;
const TILE_WORD = 1;
const TILE_STEEL = 2;
const TILE_BASE = 5;
const TILE_BASE_D = 6;

const TABS = [
    { id: 'trending', label: 'Trending', color: 'from-purple-600 to-purple-700' },
    { id: 'education', label: 'Education', color: 'from-blue-600 to-blue-700' },
    { id: 'planet', label: 'Planet', color: 'from-green-600 to-green-700' },
    { id: 'sports', label: 'Sports', color: 'from-orange-600 to-orange-700' },
    { id: 'finance', label: 'Finance', color: 'from-emerald-600 to-emerald-700' },
    { id: 'health', label: 'Health', color: 'from-rose-600 to-rose-700' },
];

export default function TankCity({ onExit }) {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const keysRef = useRef({});
    const imagesRef = useRef({});
    
    const [screen, setScreen] = useState('title');
    const [loading, setLoading] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [generatedTopics, setGeneratedTopics] = useState({});
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [wordData, setWordData] = useState([]);
    
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [enemiesLeft, setEnemiesLeft] = useState(5);
    const [wordsDestroyed, setWordsDestroyed] = useState(0);
    const [totalWords, setTotalWords] = useState(0);
    const [level, setLevel] = useState(1);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('cosmicTankHighScore');
        return saved ? parseInt(saved) : 0;
    });

    // Load images
    useEffect(() => {
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });
        };

        Promise.all([
            loadImage(PLAYER_TANK),
            loadImage(ENEMY_TANK_1),
            loadImage(ENEMY_TANK_2),
            loadImage(ENEMY_TANK_3),
            loadImage(ENEMY_TANK_4),
            loadImage(BASE_LOGO),
        ]).then(([player, enemy1, enemy2, enemy3, enemy4, logo]) => {
            imagesRef.current = { player, enemy1, enemy2, enemy3, enemy4, logo };
        });
    }, []);

    // Load topics for tab
    useEffect(() => {
        loadTabTopics('trending');
    }, []);

    const loadTabTopics = async (tabId) => {
        if (generatedTopics[tabId]?.length) return;
        setLoadingTopics(true);
        try {
            const prompts = {
                trending: 'Generate 9 trending topics people should learn about. Include technology, AI, current events.',
                education: 'Generate 9 educational topics across science, history, mathematics, literature.',
                planet: 'Generate 9 environmental topics including climate, sustainability, conservation.',
                sports: 'Generate 9 sports topics including athletics, team sports, fitness.',
                finance: 'Generate 9 finance topics including markets, economics, investing.',
                health: 'Generate 9 health topics including medicine, nutrition, wellness.'
            };

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `${prompts[tabId]} Return as JSON: { "topics": [{ "id": "topic-id", "label": "Topic Name", "description": "Brief description" }] }`,
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
            setGeneratedTopics(prev => ({ ...prev, [tabId]: result?.topics || [] }));
        } catch (error) {
            console.error('Failed to load topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        loadTabTopics(tabId);
    };

    const generateWordData = async (topic) => {
        setCurrentTopic(topic); // Set topic FIRST before loading screen
        setLoading(true);
        setScreen('loading');
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate vocabulary data for: "${topic}". Return 15 terms. Format: { "words": [{ "primary": "term", "definition": "short definition" }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        words: { type: "array", items: { type: "object", properties: { primary: { type: "string" }, definition: { type: "string" } } } }
                    }
                }
            });
            const words = result?.words || [];
            setWordData(words);
            setTotalWords(words.length);
            setLevel(1);
            setWordsDestroyed(0);
            setLives(3);
            setScore(0);
            setScreen('game');
        } catch (error) {
            console.error('Failed to generate words:', error);
            setScreen('title');
        } finally {
            setLoading(false);
        }
    };

    const generateQuiz = async (topic) => {
        setScreen('loading');
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate 5 multiple choice quiz questions about "${topic}". Each question should have 4 options with one correct answer. Format: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "correct": 0 }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        questions: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    question: { type: "string" }, 
                                    options: { type: "array", items: { type: "string" } },
                                    correct: { type: "number" }
                                } 
                            } 
                        }
                    }
                }
            });
            setQuizQuestions(result?.questions || []);
            setQuizIndex(0);
            setQuizScore(0);
            setQuizAnswered(false);
            setScreen('quiz');
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            nextLevel();
        }
    };

    const handleQuizAnswer = (answerIndex) => {
        if (quizAnswered) return;
        setQuizAnswered(true);
        const isCorrect = answerIndex === quizQuestions[quizIndex].correct;
        if (isCorrect) {
            setQuizScore(prev => prev + 1);
            setScore(prev => prev + 50);
        }
        
        setTimeout(() => {
            if (quizIndex < quizQuestions.length - 1) {
                setQuizIndex(prev => prev + 1);
                setQuizAnswered(false);
            } else {
                nextLevel();
            }
        }, 1500);
    };

    const nextLevel = async () => {
        const nextLevelNum = level + 1;
        setLevel(nextLevelNum);
        setWordsDestroyed(0);
        setLives(3);
        setLoading(true);
        setScreen('loading');
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate vocabulary data for: "${currentTopic}" level ${nextLevelNum}. Return 15 different terms than before. Format: { "words": [{ "primary": "term", "definition": "short definition" }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        words: { type: "array", items: { type: "object", properties: { primary: { type: "string" }, definition: { type: "string" } } } }
                    }
                }
            });
            const words = result?.words || [];
            setWordData(words);
            setTotalWords(words.length);
            setEnemiesLeft(5 + nextLevelNum - 1);
            setScreen('game');
        } catch (error) {
            setScreen('title');
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = (topic) => {
        if (topic === 'custom') {
            if (!searchQuery.trim()) return;
            generateWordData(searchQuery);
        } else {
            generateWordData(topic.label);
        }
    };

    // Game logic
    useEffect(() => {
        if (screen !== 'game' || !canvasRef.current || wordData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let gameRunning = true;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const MAP_W = Math.floor(canvas.width / TILE);
        const MAP_H = Math.floor(canvas.height / TILE);

        // Generate maze with vertical and horizontal words
        const map = [];
        const wordBricks = [];
        const shuffledWords = [...wordData].sort(() => Math.random() - 0.5);
        
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                map[y * MAP_W + x] = TILE_EMPTY;
            }
        }

        // Brand colors
        const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#a855f7'];
        let wordIndex = 0;
        
        // Create word cloud maze with horizontal and vertical words
        const usedAreas = [];
        const checkOverlap = (x, y, w, h) => {
            for (const area of usedAreas) {
                if (x < area.x + area.w + 8 && x + w + 8 > area.x &&
                    y < area.y + area.h + 8 && y + h + 8 > area.y) {
                    return true;
                }
            }
            return false;
        };
        
        let wordIdx = 0;
        const fontSize = [14, 16, 18, 20, 15, 17]; // Bigger sizes
        
        // Fill the playable area with words
        for (let attempt = 0; attempt < 300 && wordIdx < shuffledWords.length; attempt++) {
            const word = shuffledWords[wordIdx];
            const isVertical = Math.random() > 0.65;
            const size = fontSize[wordIdx % fontSize.length];
            
            let wordW, wordH;
            if (isVertical) {
                // Vertical: stacked letters
                wordW = size + 16;
                wordH = word.primary.length * (size + 2) + 16;
            } else {
                wordW = word.primary.length * (size * 0.65) + 24;
                wordH = size + 16;
            }
            
            // Random position in play area
            const maxX = canvas.width - wordW - TILE * 2;
            const maxY = canvas.height - wordH - TILE * 5;
            const x = TILE + Math.random() * (maxX - TILE);
            const y = TILE + Math.random() * (maxY - TILE);
            
            if (!checkOverlap(x, y, wordW, wordH)) {
                wordBricks.push({
                    x, y,
                    width: wordW,
                    height: wordH,
                    word: word.primary,
                    definition: word.definition,
                    health: 1,
                    color: colors[wordIdx % colors.length],
                    vertical: isVertical,
                    fontSize: size
                });
                usedAreas.push({ x, y, w: wordW, h: wordH });
                wordIdx++;
            }
        }

        // Place base at bottom center
        const baseX = canvas.width / 2 - TILE;
        const baseY = canvas.height - TILE * 2;

        const state = {
            player: {
                x: canvas.width / 2 - TILE / 2,
                y: canvas.height - TILE * 5,
                dir: 0,
                speed: 4,
                shootTimer: 0,
            },
            enemies: [],
            bullets: [],
            particles: [],
            floatingTexts: [],
            score: 0,
            lives: 3,
            enemiesLeft: 5 + (level - 1),
            enemiesTotal: 5 + (level - 1),
            shieldHealth: 3, // 3 layer shield
            wordsDestroyed: 0,
            totalWords: wordBricks.length,
            spawnTimer: 0,
            gameOver: false,
            victory: false,
            paused: false,
            baseDestroyed: false,
            levelComplete: false,
            starOffset: 0,
        };

        setTotalWords(wordBricks.length);

        // Spawn initial enemies
        const spawnEnemy = () => {
            if (state.enemiesTotal <= 0) return;
            const spawnPoints = [
                [TILE * 2, TILE],
                [canvas.width / 2 - TILE / 2, TILE],
                [canvas.width - TILE * 3, TILE]
            ];
            const [x, y] = spawnPoints[Math.floor(Math.random() * 3)];
            
            const blocked = state.enemies.some(e => 
                Math.abs(e.x - x) < TILE * 2 && Math.abs(e.y - y) < TILE * 2
            );
            if (blocked) return;

            state.enemies.push({
                x, y,
                dir: 2, // Start facing down
                speed: 0.8 + Math.random() * 0.4, // Slower speed
                shootTimer: 60 + Math.random() * 60,
                type: Math.floor(Math.random() * 4) + 1, // 1-4 for different tanks
                health: 1,
            });
            state.enemiesTotal--;
        };

        spawnEnemy();
        spawnEnemy();

        const spawnParticles = (x, y, color = '#ff6600', count = 15) => {
            for (let i = 0; i < count; i++) {
                state.particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 30,
                    maxLife: 30,
                    color,
                    size: Math.random() * 4 + 2,
                });
            }
        };

        const addFloatingText = (x, y, text, color, bonus) => {
            // Queue all texts to show one after another
            state.textQueue = state.textQueue || [];
            state.textQueue.push({ text, color, bonus });
        };

        const keys = keysRef.current;
        const handleKeyDown = (e) => {
            keys[e.key.toLowerCase()] = true;
            keys[e.key] = true;
            if (e.code === 'Space') e.preventDefault();
            if (e.key.toLowerCase() === 'p') state.paused = !state.paused;
            if (e.key === 'Escape' && onExit) onExit();
        };
        const handleKeyUp = (e) => {
            keys[e.key.toLowerCase()] = false;
            keys[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Mobile controls
        let touchStartX = null;
        let touchStartY = null;
        let autoShootInterval = null;
        const isMobile = 'ontouchstart' in window;

        const handleTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            if (!autoShootInterval) {
                autoShootInterval = setInterval(() => {
                    if (!state.paused && !state.gameOver) shoot(state.player, true);
                }, 250);
            }
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            if (!touchStartX) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Determine direction based on touch movement
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 10) state.player.dir = 1;
                else if (deltaX < -10) state.player.dir = 3;
            } else {
                if (deltaY > 10) state.player.dir = 2;
                else if (deltaY < -10) state.player.dir = 0;
            }
            
            state.player.x += deltaX * 0.3;
            state.player.y += deltaY * 0.3;
            state.player.x = Math.max(0, Math.min(canvas.width - TILE, state.player.x));
            state.player.y = Math.max(0, Math.min(canvas.height - TILE, state.player.y));
            
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        };

        const handleTouchEnd = () => {
            touchStartX = null;
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

        const shoot = (tank, friendly) => {
            let bx = tank.x + TILE / 2;
            let by = tank.y + TILE / 2;
            const offset = TILE / 2 + 5;

            if (tank.dir === 0) by = tank.y - 5;
            else if (tank.dir === 1) bx = tank.x + TILE + 5;
            else if (tank.dir === 2) by = tank.y + TILE + 5;
            else if (tank.dir === 3) bx = tank.x - 5;

            state.bullets.push({
                x: bx,
                y: by,
                dir: tank.dir,
                speed: 10,
                friendly,
            });
        };

        const canMove = (x, y, size, entity) => {
            if (x < 0 || y < 0 || x + size > canvas.width || y + size > canvas.height) return false;
            
            // Check word brick collision
            for (const brick of wordBricks) {
                if (brick.health <= 0) continue;
                if (x < brick.x + brick.width && x + size > brick.x &&
                    y < brick.y + brick.height && y + size > brick.y) {
                    return false;
                }
            }
            
            // Check base collision
            if (x < baseX + TILE * 2 && x + size > baseX &&
                y < baseY + TILE * 1.5 && y + size > baseY) {
                return false;
            }
            
            // Check tank collision
            const others = entity === state.player ? state.enemies : [state.player, ...state.enemies.filter(e => e !== entity)];
            for (const o of others) {
                if (!o) continue;
                if (Math.abs(o.x - x) < TILE - 4 && Math.abs(o.y - y) < TILE - 4) {
                    return false;
                }
            }
            
            return true;
        };

        const updatePlayer = () => {
            if (state.player.shootTimer > 0) state.player.shootTimer--;

            let newX = state.player.x;
            let newY = state.player.y;
            let moved = false;

            if (keys.arrowup || keys.w) {
                state.player.dir = 0;
                newY -= state.player.speed;
                moved = true;
            } else if (keys.arrowright || keys.d) {
                state.player.dir = 1;
                newX += state.player.speed;
                moved = true;
            } else if (keys.arrowdown || keys.s) {
                state.player.dir = 2;
                newY += state.player.speed;
                moved = true;
            } else if (keys.arrowleft || keys.a) {
                state.player.dir = 3;
                newX -= state.player.speed;
                moved = true;
            }

            if (moved && canMove(newX, newY, TILE, state.player)) {
                state.player.x = newX;
                state.player.y = newY;
            }

            if ((keys[' '] || keys.space) && state.player.shootTimer === 0) {
                shoot(state.player, true);
                state.player.shootTimer = 15;
            }
        };

        const updateEnemies = () => {
            state.spawnTimer++;
            if (state.spawnTimer > 300 && state.enemies.length < 3 && state.enemiesTotal > 0) {
                spawnEnemy();
                state.spawnTimer = 0;
            }

            for (const enemy of state.enemies) {
                enemy.shootTimer--;

                const dx = state.player.x - enemy.x;
                const dy = state.player.y - enemy.y;

                // Shoot in the direction tank is facing
                if (enemy.shootTimer <= 0) {
                    shoot(enemy, false);
                    enemy.shootTimer = 80 + Math.random() * 60;
                }

                // Always move in the direction the tank is pointing
                let moveX = 0, moveY = 0;
                if (enemy.dir === 0) moveY = -enemy.speed;
                else if (enemy.dir === 1) moveX = enemy.speed;
                else if (enemy.dir === 2) moveY = enemy.speed;
                else if (enemy.dir === 3) moveX = -enemy.speed;

                const newX = enemy.x + moveX;
                const newY = enemy.y + moveY;

                if (canMove(newX, newY, TILE, enemy)) {
                    enemy.x = newX;
                    enemy.y = newY;
                } else {
                    // Hit obstacle - turn left or right only (never backwards)
                    const leftTurn = (enemy.dir + 3) % 4;
                    const rightTurn = (enemy.dir + 1) % 4;
                    
                    const leftClear = canMove(
                        enemy.x + (leftTurn === 1 ? enemy.speed : leftTurn === 3 ? -enemy.speed : 0),
                        enemy.y + (leftTurn === 0 ? -enemy.speed : leftTurn === 2 ? enemy.speed : 0),
                        TILE, enemy
                    );
                    const rightClear = canMove(
                        enemy.x + (rightTurn === 1 ? enemy.speed : rightTurn === 3 ? -enemy.speed : 0),
                        enemy.y + (rightTurn === 0 ? -enemy.speed : rightTurn === 2 ? enemy.speed : 0),
                        TILE, enemy
                    );
                    
                    if (leftClear && !rightClear) {
                        enemy.dir = leftTurn;
                    } else if (rightClear && !leftClear) {
                        enemy.dir = rightTurn;
                    } else if (leftClear && rightClear) {
                        enemy.dir = Math.random() > 0.5 ? leftTurn : rightTurn;
                    }
                }
            }
        };

        const updateBullets = () => {
            state.bullets = state.bullets.filter(bullet => {
                if (bullet.dir === 0) bullet.y -= bullet.speed;
                else if (bullet.dir === 1) bullet.x += bullet.speed;
                else if (bullet.dir === 2) bullet.y += bullet.speed;
                else if (bullet.dir === 3) bullet.x -= bullet.speed;

                if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                    return false;
                }

                // Check word brick collision - only player bullets can destroy words
                for (let i = wordBricks.length - 1; i >= 0; i--) {
                    const brick = wordBricks[i];
                    if (brick.health <= 0) continue;

                    if (bullet.x > brick.x && bullet.x < brick.x + brick.width &&
                        bullet.y > brick.y && bullet.y < brick.y + brick.height) {

                        // Only friendly (player) bullets destroy words
                        if (bullet.friendly) {
                            brick.health--;
                            spawnParticles(bullet.x, bullet.y, brick.color);

                            if (brick.health <= 0) {
                                state.score += 100;
                                state.wordsDestroyed++;
                                console.log('Word destroyed:', state.wordsDestroyed, '/', state.totalWords);
                                setScore(state.score);
                                setWordsDestroyed(state.wordsDestroyed);

                                // Show word and short definition
                                const shortDef = brick.definition ? brick.definition.split('.')[0].substring(0, 50) : '';
                                addFloatingText(brick.x + brick.width/2, brick.y, `${brick.word.toUpperCase()}: ${shortDef}`, brick.color, 100);
                            }
                        }
                        // Enemy bullets just bounce off words (block them)
                        return false;
                    }
                }

                // Check shield/base collision
                const distToBase = Math.sqrt(
                    Math.pow(bullet.x - (baseX + TILE), 2) + 
                    Math.pow(bullet.y - (baseY + TILE * 0.75), 2)
                );
                
                if (distToBase < TILE * 1.8 && state.shieldHealth > 0 && !bullet.friendly) {
                    state.shieldHealth--;
                    spawnParticles(bullet.x, bullet.y, '#00ddff', 20);
                    return false;
                }
                
                if (bullet.x > baseX && bullet.x < baseX + TILE * 2 &&
                    bullet.y > baseY && bullet.y < baseY + TILE * 1.5) {
                    state.baseDestroyed = true;
                    spawnParticles(baseX + TILE, baseY + TILE * 0.75, '#ffd700', 50);
                    state.gameOver = true;
                    return false;
                }

                // Tank collision
                if (bullet.friendly) {
                    for (let i = state.enemies.length - 1; i >= 0; i--) {
                        const enemy = state.enemies[i];
                        if (Math.abs(enemy.x + TILE/2 - bullet.x) < TILE/2 + 4 && 
                            Math.abs(enemy.y + TILE/2 - bullet.y) < TILE/2 + 4) {
                            spawnParticles(enemy.x + TILE/2, enemy.y + TILE/2, '#ff4444', 20);
                            state.enemies.splice(i, 1);
                            state.score += 200;
                            state.enemiesLeft--;
                            console.log('Enemy killed. Left:', state.enemiesLeft, 'Alive:', state.enemies.length, 'ToSpawn:', state.enemiesTotal);
                            setScore(state.score);
                            setEnemiesLeft(state.enemiesLeft);
                            return false;
                        }
                    }
                } else {
                    if (Math.abs(state.player.x + TILE/2 - bullet.x) < TILE/2 + 4 && 
                        Math.abs(state.player.y + TILE/2 - bullet.y) < TILE/2 + 4) {
                        spawnParticles(state.player.x + TILE/2, state.player.y + TILE/2, '#00ff00', 20);
                        state.lives--;
                        setLives(state.lives);
                        if (state.lives <= 0) {
                            state.gameOver = true;
                        } else {
                            state.player.x = canvas.width / 2 - TILE / 2;
                            state.player.y = canvas.height - TILE * 5;
                            state.player.dir = 0;
                        }
                        return false;
                    }
                }

                return true;
            });
        };

        const updateParticles = () => {
            state.particles = state.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.vy += 0.3;
                p.life--;
                return p.life > 0;
            });

            state.floatingTexts = state.floatingTexts.filter(ft => {
                ft.y += ft.vy;
                ft.life--;
                // Remove only when fully off the top of screen
                return ft.y > -150;
            });
            
            // Process queue - show next text when current one is high enough
            if (state.textQueue?.length > 0) {
                const lastText = state.floatingTexts[state.floatingTexts.length - 1];
                // Spawn next when no texts or last text has moved up enough
                if (!lastText || lastText.y < canvas.height * 0.6) {
                    const next = state.textQueue.shift();
                    state.floatingTexts.push({
                        x: canvas.width / 2,
                        y: canvas.height + 50,
                        vy: -1.5,
                        text: next.text,
                        bonus: next.bonus,
                        life: 600,
                        maxLife: 600,
                        color: next.color,
                        startY: canvas.height + 50,
                    });
                }
            }
        };

        const drawTank = (tank, image, dir) => {
            ctx.save();
            ctx.translate(tank.x + TILE/2, tank.y + TILE/2);
            const rotations = [0, Math.PI/2, Math.PI, -Math.PI/2];
            ctx.rotate(rotations[dir]);
            if (image) {
                ctx.drawImage(image, -TILE/2, -TILE/2, TILE, TILE);
            } else {
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(-TILE/2, -TILE/2, TILE, TILE);
            }
            ctx.restore();
        };

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;

            // Space background
            ctx.fillStyle = '#000011';
            ctx.fillRect(0, 0, w, h);

            // Draw moving stars (moving up)
            if (!state.stars) {
                state.stars = [];
                for (let i = 0; i < 200; i++) {
                    state.stars.push({
                        x: Math.random() * w,
                        y: Math.random() * h,
                        size: Math.random() * 2 + 0.5,
                        brightness: Math.random(),
                        speed: 0.5 + Math.random() * 1.5
                    });
                }
            }
            // Move stars up
            for (const star of state.stars) {
                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = h + 10;
                    star.x = Math.random() * w;
                }
                const flicker = 0.5 + Math.sin(Date.now() * 0.003 + star.brightness * 10) * 0.3;
                ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw word cloud maze with backgrounds
            for (const brick of wordBricks) {
                if (brick.health <= 0) continue;

                const fontSize = brick.fontSize || 14;

                // Draw background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
                ctx.fill();

                // Draw colored border
                ctx.strokeStyle = brick.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
                ctx.stroke();

                ctx.fillStyle = brick.color;
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (brick.vertical) {
                    // Draw vertical word as stacked letters (transposed, readable)
                    const letters = brick.word.toUpperCase().split('');
                    const letterHeight = fontSize + 2;
                    const startY = brick.y + 10;

                    letters.forEach((letter, i) => {
                        ctx.fillText(letter, brick.x + brick.width/2, startY + i * letterHeight + fontSize/2);
                    });
                } else {
                    // Draw horizontal word
                    ctx.fillText(brick.word.toUpperCase(), brick.x + brick.width/2, brick.y + brick.height/2);
                }
            }

            // Draw base with 3-layer shield and topic title
            if (!state.baseDestroyed) {
                const shieldPulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
                const shieldColors = ['#ff4444', '#ffaa00', '#00ddff'];
                
                // Draw shield layers based on health
                for (let i = 0; i < state.shieldHealth; i++) {
                    const radius = TILE * 1.8 - i * 8;
                    const alpha = shieldPulse * (0.6 - i * 0.15);
                    
                    ctx.strokeStyle = shieldColors[2 - i];
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 4 - i;
                    ctx.beginPath();
                    ctx.arc(baseX + TILE, baseY + TILE * 0.75, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                

                
                // Shield health indicator
                ctx.font = '12px Inter, sans-serif';
                ctx.fillStyle = '#00ddff';
                ctx.fillText(`SHIELD: ${state.shieldHealth}/3`, canvas.width / 2, baseY - 8);
                
                // Base - draw spinning Earth
                const centerX = baseX + TILE;
                const centerY = baseY + TILE * 0.75;
                const radius = TILE * 0.7;
                const rotation = Date.now() * 0.001; // Slow spin
                
                // Earth circle with gradient
                const earthGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
                earthGradient.addColorStop(0, '#4ade80');
                earthGradient.addColorStop(0.5, '#22c55e');
                earthGradient.addColorStop(1, '#166534');
                
                ctx.fillStyle = earthGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Ocean blue base
                const oceanGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
                oceanGradient.addColorStop(0, '#60a5fa');
                oceanGradient.addColorStop(0.5, '#3b82f6');
                oceanGradient.addColorStop(1, '#1e40af');
                
                ctx.fillStyle = oceanGradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw rotating continents (simplified)
                ctx.fillStyle = '#22c55e';
                ctx.save();
                ctx.translate(centerX, centerY);
                
                // Continent 1 - rotating blob
                const c1x = Math.cos(rotation) * radius * 0.3;
                const c1y = Math.sin(rotation * 0.5) * radius * 0.2;
                ctx.beginPath();
                ctx.ellipse(c1x, c1y - radius * 0.2, radius * 0.35, radius * 0.25, rotation * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Continent 2
                const c2x = Math.cos(rotation + Math.PI) * radius * 0.4;
                const c2y = Math.sin(rotation * 0.5 + 1) * radius * 0.15;
                ctx.beginPath();
                ctx.ellipse(c2x, c2y + radius * 0.15, radius * 0.25, radius * 0.2, -rotation * 0.2, 0, Math.PI * 2);
                ctx.fill();
                
                // Continent 3 - small island
                const c3x = Math.cos(rotation + Math.PI/2) * radius * 0.5;
                ctx.beginPath();
                ctx.arc(c3x, radius * 0.3, radius * 0.12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                
                // Atmosphere glow
                ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
                ctx.stroke();
                
                // Specular highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, radius * 0.15, -0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw tanks
            drawTank(state.player, imagesRef.current.player, state.player.dir);
            
            for (const enemy of state.enemies) {
                const enemyImages = [imagesRef.current.enemy1, imagesRef.current.enemy2, imagesRef.current.enemy3, imagesRef.current.enemy4];
                const img = enemyImages[(enemy.type - 1) % 4];
                drawTank(enemy, img, enemy.dir);
            }

            // Draw bullets
            for (const bullet of state.bullets) {
                ctx.fillStyle = bullet.friendly ? '#00ff00' : '#ff4444';
                ctx.shadowBlur = 10;
                ctx.shadowColor = bullet.friendly ? '#00ff00' : '#ff4444';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Draw particles
            for (const p of state.particles) {
                ctx.globalAlpha = p.life / p.maxLife;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Draw floating texts - Star Wars crawl style from bottom to top
            for (const ft of state.floatingTexts) {
                const travelDistance = ft.startY - ft.y;
                const maxTravel = canvas.height + 150;
                const progress = Math.min(1, Math.max(0, travelDistance / maxTravel));
                
                // Perspective scale - starts large at bottom, shrinks toward top
                const scale = Math.max(0.2, 1.2 - progress * 1.0);
                // Fade out only when near very top of screen (y < 50)
                const alpha = ft.y < 50 ? Math.max(0, ft.y / 50) : 1;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(ft.x, ft.y);
                ctx.scale(scale, scale * 0.7); // Perspective squish
                
                // Split text into word and definition
                const parts = ft.text.split(': ');
                const word = parts[0] || '';
                const def = parts[1] || '';
                
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 36px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(word, 0, 0);
                
                if (def) {
                    ctx.fillStyle = '#e2e8f0';
                    ctx.font = '20px Inter';
                    ctx.fillText(def, 0, 40);
                }
                
                if (ft.bonus > 0) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = 'bold 22px Inter';
                    ctx.fillText(`+${ft.bonus}`, 0, def ? 70 : 40);
                }
                
                ctx.restore();
            }
            ctx.globalAlpha = 1;

            // HUD
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'left';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#000';
            ctx.fillText(`SCORE: ${state.score}`, 20, 40);
            ctx.fillText(`WORDS: ${state.wordsDestroyed}/${state.totalWords}`, 20, 70);
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`LEVEL: ${level}`, 20, 100);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ef4444';
            for (let i = 0; i < state.lives; i++) {
                ctx.fillText('❤️', w - 20 - i * 40, 40);
            }
            ctx.fillStyle = '#3b82f6';
            ctx.fillText(`ENEMIES: ${state.enemiesLeft}`, w - 20, 70);
            ctx.shadowBlur = 0;
        };

        const gameLoop = () => {
            if (!gameRunning) return;

            if (state.paused) {
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 48px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width/2, canvas.height/2 - 20);
                ctx.font = '20px Inter';
                ctx.fillStyle = '#9ca3af';
                ctx.fillText('Press P to resume | ESC to exit', canvas.width/2, canvas.height/2 + 30);
                animationFrameId = requestAnimationFrame(gameLoop);
                return;
            }

            if (state.levelComplete) {
                draw();
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 56px Inter';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#10b981';
                ctx.fillText(`LEVEL ${level} COMPLETE!`, canvas.width/2, canvas.height/2 - 60);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px Inter';
                ctx.shadowBlur = 0;
                ctx.fillText(`Score: ${state.score}`, canvas.width/2, canvas.height/2 + 10);
                
                ctx.fillStyle = '#9ca3af';
                ctx.font = '20px Inter';
                ctx.fillText('Click to take the quiz!', canvas.width/2, canvas.height/2 + 80);

                if (state.score > highScore) {
                    localStorage.setItem('cosmicTankHighScore', state.score.toString());
                    setHighScore(state.score);
                }

                canvas.onclick = () => {
                    gameRunning = false;
                    generateQuiz(currentTopic);
                };
                return;
            }

            if (state.gameOver) {
                draw();
                ctx.fillStyle = 'rgba(0,0,0,0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 56px Inter';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 30;
                ctx.shadowColor = '#ef4444';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 60);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px Inter';
                ctx.shadowBlur = 0;
                ctx.fillText(`Final Score: ${state.score}`, canvas.width/2, canvas.height/2 + 10);
                ctx.fillText(`Level Reached: ${level}`, canvas.width/2, canvas.height/2 + 50);
                
                ctx.fillStyle = '#9ca3af';
                ctx.font = '20px Inter';
                ctx.fillText('Click anywhere to continue', canvas.width/2, canvas.height/2 + 120);

                if (state.score > highScore) {
                    localStorage.setItem('cosmicTankHighScore', state.score.toString());
                    setHighScore(state.score);
                }

                canvas.onclick = () => {
                    gameRunning = false;
                    setScreen('title');
                };
                return;
            }

            updatePlayer();
            updateEnemies();
            updateBullets();
            updateParticles();
            
            // Check level complete after all updates
            // All words destroyed AND all enemies killed (none left to spawn and none alive)
            const allWordsDestroyed = state.wordsDestroyed >= state.totalWords;
            const allEnemiesKilled = state.enemiesTotal <= 0 && state.enemies.length === 0;
            
            // Debug logging
            if (allWordsDestroyed || allEnemiesKilled) {
                console.log('Level check:', { 
                    wordsDestroyed: state.wordsDestroyed, 
                    totalWords: state.totalWords, 
                    enemiesTotal: state.enemiesTotal, 
                    enemiesAlive: state.enemies.length,
                    allWordsDestroyed,
                    allEnemiesKilled,
                    levelComplete: state.levelComplete
                });
            }
            
            if (!state.levelComplete && allWordsDestroyed && allEnemiesKilled) {
                console.log('LEVEL COMPLETE TRIGGERED!');
                state.levelComplete = true;
            }
            
            draw();

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            gameRunning = false;
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (isMobile) {
                canvas.removeEventListener('touchstart', handleTouchStart);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
            }
            if (autoShootInterval) clearInterval(autoShootInterval);
            cancelAnimationFrame(animationFrameId);
        };
    }, [screen, wordData, onExit, highScore, level, currentTopic]);

    const toggleFullscreen = async () => {
        try {
            if (!fullscreen) {
                await document.documentElement.requestFullscreen?.();
                setFullscreen(true);
            } else {
                if (document.fullscreenElement) await document.exitFullscreen();
                setFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    // Loading screen
    if (screen === 'loading') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#1a1a2e] z-[9999]">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2 text-white">{level > 1 ? `Preparing Level ${level}...` : 'Generating Battle Arena...'}</h2>
                    <p className="text-gray-400">AI is creating content for "{currentTopic}"</p>
                </div>
            </div>
        );
    }

    // Quiz screen
    if (screen === 'quiz' && quizQuestions.length > 0) {
        const currentQ = quizQuestions[quizIndex];
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#1a1a2e] z-[9999] p-4">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-6">
                        <img src={LOGO_URL} alt="Logo" className="w-12 h-12 mx-auto mb-2 rounded-xl" />
                        <p className="text-purple-400 font-medium">{currentTopic}</p>
                        <h2 className="text-2xl font-bold text-white">Level {level} Quiz</h2>
                        <p className="text-gray-400">Question {quizIndex + 1} of {quizQuestions.length}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-2xl p-6 mb-4">
                        <h3 className="text-xl text-white font-semibold mb-6">{currentQ.question}</h3>
                        <div className="grid gap-3">
                            {currentQ.options.map((option, i) => {
                                let btnClass = "w-full p-4 rounded-xl text-left font-medium transition-all ";
                                if (quizAnswered) {
                                    if (i === currentQ.correct) {
                                        btnClass += "bg-green-600 text-white";
                                    } else {
                                        btnClass += "bg-gray-700 text-gray-400";
                                    }
                                } else {
                                    btnClass += "bg-gray-700 hover:bg-gray-600 text-white";
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleQuizAnswer(i)}
                                        disabled={quizAnswered}
                                        className={btnClass}
                                    >
                                        <span className="inline-block w-8 h-8 rounded-full bg-gray-600 text-center leading-8 mr-3">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-gray-400">
                        <span>Score: {score}</span>
                        <span>Quiz Score: {quizScore}/{quizIndex + (quizAnswered ? 1 : 0)}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Game screen
    if (screen === 'game') {
        return (
            <div className="fixed inset-0 bg-[#1a1a2e] z-[9999]">
                <canvas ref={canvasRef} className="block w-full h-full touch-none" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button onClick={toggleFullscreen} className="bg-green-600 hover:bg-green-700" size="sm">
                        {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    <Button onClick={() => setScreen('title')} className="bg-gray-600 hover:bg-gray-700" size="sm">
                        <X className="w-4 h-4 mr-1" /> Exit
                    </Button>
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-lg text-center">
                    <img src={LOGO_URL} alt="Logo" className="w-8 h-8 mx-auto mb-1 rounded" />
                    <p className="text-white text-sm font-medium">{currentTopic}</p>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 rounded-lg text-white text-xs">
                    <p>WASD/Arrows: Move | Space: Shoot | P: Pause</p>
                </div>
            </div>
        );
    }

    // Title screen
    const filteredTopics = (topics) => {
        if (!searchQuery.trim()) return topics;
        return topics.filter(t => 
            t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-auto p-4">
            <Button onClick={onExit} variant="ghost" className="absolute top-2 right-2 text-gray-500 hover:text-red-500 hover:bg-red-50">
                <X className="w-5 h-5" />
            </Button>
            
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-4">
                    <img src={LOGO_URL} alt="Logo" className="w-14 h-14 mx-auto mb-2 rounded-xl" />
                    <h1 className="text-4xl font-black text-gray-900 mb-1">COSMIC TANK</h1>
                    <p className="text-gray-500">Destroy Word Blocks • Learn Vocabulary</p>
                    <p className="text-sm text-gray-400 mt-1">High Score: {highScore}</p>
                </div>

                <div className="bg-white rounded-xl border border-green-200 p-3 mb-4 shadow-sm">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input 
                                placeholder="Enter any topic to learn..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) handleStartGame('custom'); }}
                                className="pl-12 h-12 bg-white border-gray-200 text-gray-900 rounded-xl" 
                            />
                        </div>
                        <Button 
                            onClick={() => searchQuery.trim() && handleStartGame('custom')} 
                            disabled={!searchQuery.trim() || loading}
                            className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
                        >
                            <Play className="w-4 h-4 mr-2" /> Start Battle
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {TABS.map(tab => (
                            <Button 
                                key={tab.id} 
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                    activeTab === tab.id 
                                        ? `bg-gradient-to-r ${tab.color} text-white` 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {loadingTopics && !generatedTopics[activeTab]?.length ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-green-500" />
                            <p className="text-gray-600">Loading topics...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {filteredTopics(generatedTopics[activeTab] || []).slice(0, 9).map((topic, i) => {
                                const tabInfo = TABS.find(t => t.id === activeTab);
                                const icons = [Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp, Target];
                                const TopicIcon = icons[i % icons.length];
                                return (
                                    <button 
                                        key={topic.id || i} 
                                        onClick={() => handleStartGame(topic)} 
                                        className={`h-32 text-left py-3 px-4 rounded-xl bg-gradient-to-br ${tabInfo?.color || 'from-green-600 to-green-700'} hover:opacity-90 text-white transition-all hover:scale-[1.02] hover:shadow-lg`}
                                    >
                                        <TopicIcon className="w-5 h-5 text-white/70 mb-2" />
                                        <div className="text-sm font-bold line-clamp-2 leading-tight">{topic.label}</div>
                                        <div className="text-xs text-white/70 line-clamp-2 mt-1">{topic.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Target, title: 'Destroy Words', desc: 'Shoot word blocks to learn vocabulary', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
                        { icon: Heart, title: 'Defend Base', desc: 'Protect your base from enemy tanks', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
                        { icon: Trophy, title: 'Score Points', desc: 'Earn points for each word destroyed', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                            <div className={`w-12 h-12 ${item.bgColor} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-gray-900 font-semibold text-sm mb-1">{item.title}</h3>
                            <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}