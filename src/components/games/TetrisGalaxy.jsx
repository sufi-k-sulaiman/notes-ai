import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Play, X, Loader2, Search, Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp, Target,
    Maximize2, Minimize2
} from 'lucide-react';
import { LOGO_URL } from '@/components/NavigationConfig';

const TABS = [
    { id: 'trending', label: 'Trending', color: 'from-violet-500 to-purple-600' },
    { id: 'ocean', label: 'Ocean Life', color: 'from-indigo-500 to-blue-600' },
    { id: 'science', label: 'Science', color: 'from-purple-500 to-pink-600' },
    { id: 'technology', label: 'Technology', color: 'from-blue-500 to-indigo-600' },
    { id: 'language', label: 'Language', color: 'from-fuchsia-500 to-purple-600' },
    { id: 'history', label: 'History', color: 'from-amber-500 to-orange-600' },
];

const BOARD_WIDTH = 20; // 2x wider
const BOARD_HEIGHT = 20;

// Galaxy-themed vibrant colors matching app purple theme
const PIECES = [
    { shape: [[1,1,1,1]], color: '#8b5cf6', glow: '#a78bfa', name: 'I' },
    { shape: [[1,1],[1,1]], color: '#f59e0b', glow: '#fbbf24', name: 'O' },
    { shape: [[0,1,0],[1,1,1]], color: '#ec4899', glow: '#f472b6', name: 'T' },
    { shape: [[0,1,1],[1,1,0]], color: '#10b981', glow: '#34d399', name: 'S' },
    { shape: [[1,1,0],[0,1,1]], color: '#ef4444', glow: '#f87171', name: 'Z' },
    { shape: [[1,0,0],[1,1,1]], color: '#6366f1', glow: '#818cf8', name: 'J' },
    { shape: [[0,0,1],[1,1,1]], color: '#06b6d4', glow: '#22d3ee', name: 'L' }
];

export default function TetrisGalaxy({ onExit }) {
    const canvasRef = useRef(null);
    
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
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        loadTabTopics('trending');
    }, []);

    const loadTabTopics = async (tabId) => {
        if (generatedTopics[tabId]?.length) return;
        setLoadingTopics(true);
        try {
            const prompts = {
                trending: 'Generate 9 trending vocabulary topics including technology, current events, pop culture.',
                ocean: 'Generate 9 ocean and marine life vocabulary topics including sea creatures, coral reefs, oceanography.',
                science: 'Generate 9 science vocabulary topics including biology, chemistry, physics.',
                technology: 'Generate 9 technology vocabulary topics including programming, AI, hardware.',
                language: 'Generate 9 language learning vocabulary topics including SAT words, idioms.',
                history: 'Generate 9 history vocabulary topics including ancient civilizations, world events.'
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
        setCurrentTopic(topic);
        setLoading(true);
        setScreen('loading');
        try {
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate vocabulary data for: "${topic}". Return 40 terms with short definitions (max 10 words each). Format: { "words": [{ "word": "term", "definition": "short definition" }] }`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        words: { type: "array", items: { type: "object", properties: { word: { type: "string" }, definition: { type: "string" } } } }
                    }
                }
            });
            const words = result?.words || [];
            setWordData(words);
            setLevel(1);
            setLines(0);
            setScore(0);
            setScreen('game');
        } catch (error) {
            console.error('Failed to generate words:', error);
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

        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        const getCellSize = () => {
            const maxHeight = canvas.height - 120;
            const maxWidth = canvas.width * 0.7;
            return Math.floor(Math.min(maxHeight / BOARD_HEIGHT, maxWidth / BOARD_WIDTH));
        };

        // Galaxy background
        const drawGalaxyBackground = () => {
            // Deep space gradient
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#1e1b4b');
            grad.addColorStop(0.3, '#312e81');
            grad.addColorStop(0.6, '#4c1d95');
            grad.addColorStop(1, '#0f0a1f');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            const time = Date.now() * 0.001;
            for (let i = 0; i < 100; i++) {
                const x = (i * 47 + Math.sin(i) * 100) % canvas.width;
                const y = (i * 31 + Math.cos(i) * 80) % canvas.height;
                const twinkle = Math.sin(time + i) * 0.5 + 0.5;
                const size = (i % 3) + 1;
                ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.7})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Nebula clouds
            ctx.globalAlpha = 0.15;
            const nebulaGrad1 = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.3, 0, canvas.width * 0.2, canvas.height * 0.3, 200);
            nebulaGrad1.addColorStop(0, '#a855f7');
            nebulaGrad1.addColorStop(1, 'transparent');
            ctx.fillStyle = nebulaGrad1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const nebulaGrad2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.7, 0, canvas.width * 0.8, canvas.height * 0.7, 250);
            nebulaGrad2.addColorStop(0, '#6366f1');
            nebulaGrad2.addColorStop(1, 'transparent');
            ctx.fillStyle = nebulaGrad2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;

            // Shooting stars occasionally
            if (Math.sin(time * 0.5) > 0.98) {
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                const sx = Math.random() * canvas.width;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx + 100, 100);
                ctx.stroke();
            }
        };

        // Floating planets/orbs in background
        const drawPlanets = () => {
            const time = Date.now() * 0.0005;

            // Small planet 1
            const p1x = 80 + Math.sin(time) * 20;
            const p1y = 150 + Math.cos(time * 0.7) * 15;
            const p1Grad = ctx.createRadialGradient(p1x - 10, p1y - 10, 0, p1x, p1y, 35);
            p1Grad.addColorStop(0, '#a78bfa');
            p1Grad.addColorStop(1, '#6d28d9');
            ctx.fillStyle = p1Grad;
            ctx.beginPath();
            ctx.arc(p1x, p1y, 35, 0, Math.PI * 2);
            ctx.fill();

            // Small planet 2
            const p2x = canvas.width - 180 + Math.cos(time * 0.8) * 15;
            const p2y = canvas.height - 200 + Math.sin(time * 0.6) * 20;
            if (p2x < canvas.width - 200) {
                const p2Grad = ctx.createRadialGradient(p2x - 8, p2y - 8, 0, p2x, p2y, 25);
                p2Grad.addColorStop(0, '#f472b6');
                p2Grad.addColorStop(1, '#be185d');
                ctx.fillStyle = p2Grad;
                ctx.beginPath();
                ctx.arc(p2x, p2y, 25, 0, Math.PI * 2);
                ctx.fill();
            }

            // Rings around a planet
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(p1x, p1y, 50, 15, 0.3, 0, Math.PI * 2);
            ctx.stroke();
        };

        // Game state
        const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
        let bag = [];
        let currentPiece = null;
        let nextPiece = null;
        let gameScore = 0;
        let gameLines = 0;
        let gameLevel = 1;
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        let wordIndex = 0;
        let gameOver = false;
        let paused = false;
        let definitionQueue = [];
        let currentDefinition = null;
        let definitionTimer = 0;
        let lineClearMessage = null;
        let lineClearTimer = 0;

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const getNextPiece = () => {
            if (bag.length === 0) bag = shuffle([...PIECES]);
            const piece = bag.pop();
            const word = wordData[wordIndex % wordData.length];
            wordIndex++;
            return {
                shape: piece.shape.map(row => [...row]),
                color: piece.color,
                glow: piece.glow,
                name: piece.name,
                word: word.word,
                definition: word.definition,
                x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
                y: 0
            };
        };

        // Draw single block - ONE word per entire piece, not per cell
        const draw3DBlock = (x, y, size, color, glow) => {
            const padding = 2;
            const radius = size * 0.15;
            const innerX = x + padding;
            const innerY = y + padding;
            const innerSize = size - padding * 2;

            // Main block gradient
            const gradient = ctx.createLinearGradient(innerX, innerY, innerX + innerSize, innerY + innerSize);
            gradient.addColorStop(0, glow);
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, shadeColor(color, -25));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(innerX, innerY, innerSize, innerSize, radius);
            ctx.fill();

            // Texture dots
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    ctx.beginPath();
                    ctx.arc(innerX + innerSize * 0.3 + i * innerSize * 0.4, innerY + innerSize * 0.3 + j * innerSize * 0.4, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Top highlight
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.roundRect(innerX + 3, innerY + 3, innerSize - 6, innerSize * 0.25, radius * 0.5);
            ctx.fill();
        };

        // Draw word and definition next to falling piece
        const drawPieceWord = (piece, offsetX, offsetY, cellSize) => {
            if (!piece.word) return;
            
            // Calculate piece bounding box
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            piece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        minX = Math.min(minX, dx);
                        maxX = Math.max(maxX, dx);
                        minY = Math.min(minY, dy);
                        maxY = Math.max(maxY, dy);
                    }
                });
            });

            const pieceRightX = offsetX + (piece.x + maxX + 1) * cellSize;
            const pieceCenterY = offsetY + (piece.y + (minY + maxY + 1) / 2) * cellSize;

            // Position text box to the right of the piece
            const textBoxX = pieceRightX + 20;
            const textBoxWidth = 220;
            
            // Wrap definition into lines
            const wrapText = (text, maxWidth) => {
                const words = (text || '').split(' ');
                const lines = [];
                let currentLine = '';
                ctx.font = '16px Arial';
                
                for (const word of words) {
                    const testLine = currentLine ? currentLine + ' ' + word : word;
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) lines.push(currentLine);
                return lines.slice(0, 3); // Max 3 lines
            };

            const defLines = wrapText(piece.definition, textBoxWidth - 24);
            const textBoxHeight = 45 + defLines.length * 22;

            // Background matching piece color
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.beginPath();
            ctx.roundRect(textBoxX, pieceCenterY - textBoxHeight/2, textBoxWidth, textBoxHeight, 12);
            ctx.fill();
            ctx.strokeStyle = piece.color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Word - matching piece color
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = piece.glow;
            ctx.fillText(piece.word, textBoxX + 14, pieceCenterY - textBoxHeight/2 + 10);

            // Definition lines - larger
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            defLines.forEach((line, i) => {
                ctx.fillText(line, textBoxX + 14, pieceCenterY - textBoxHeight/2 + 42 + i * 22);
            });
        };

        const shadeColor = (color, percent) => {
            const num = parseInt(color.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.max(0, Math.min(255, (num >> 16) + amt));
            const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
            const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
            return `rgb(${R},${G},${B})`;
        };

        const collision = (piece, offsetX = 0, offsetY = 0) => {
            return piece.shape.some((row, dy) => {
                return row.some((value, dx) => {
                    if (!value) return false;
                    const x = piece.x + dx + offsetX;
                    const y = piece.y + dy + offsetY;
                    return x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || (y >= 0 && board[y][x]);
                });
            });
        };

        const merge = () => {
            currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const x = currentPiece.x + dx;
                        const y = currentPiece.y + dy;
                        if (y >= 0) {
                            board[y][x] = { 
                                color: currentPiece.color,
                                glow: currentPiece.glow,
                                word: currentPiece.word,
                                definition: currentPiece.definition
                            };
                        }
                    }
                });
            });
        };

        const clearLines = () => {
            let linesCleared = 0;
            let allClearedWords = [];
            
            for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                if (board[y].every(cell => cell !== null)) {
                    const lineWords = board[y].filter(cell => cell).map(cell => cell.word);
                    const uniqueWords = [...new Set(lineWords)];
                    allClearedWords.push(...uniqueWords);
                    
                    board.splice(y, 1);
                    board.unshift(Array(BOARD_WIDTH).fill(null));
                    linesCleared++;
                    y++;
                }
            }

            if (linesCleared > 0) {
                const points = [0, 100, 300, 500, 800];
                gameScore += points[Math.min(linesCleared, 4)] * gameLevel;
                gameLines += linesCleared;
                gameLevel = Math.floor(gameLines / 10) + 1;
                dropInterval = Math.max(100, 1000 - (gameLevel - 1) * 80);
                setScore(gameScore);
                setLines(gameLines);
                setLevel(gameLevel);

                // Create sentence from cleared words
                const uniqueAllWords = [...new Set(allClearedWords)];
                if (uniqueAllWords.length > 0) {
                    lineClearMessage = `Words cleared: ${uniqueAllWords.join(', ')}`;
                    lineClearTimer = 3000;
                }
            }
        };

        const createPiece = () => {
            if (!nextPiece) nextPiece = getNextPiece();
            currentPiece = nextPiece;
            currentPiece.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentPiece.y = 0;
            nextPiece = getNextPiece();
            if (collision(currentPiece)) gameOver = true;
        };

        const lock = () => { merge(); clearLines(); createPiece(); };
        const drop = () => { if (!collision(currentPiece, 0, 1)) currentPiece.y++; else lock(); dropCounter = 0; };
        const hardDrop = () => { while (!collision(currentPiece, 0, 1)) { currentPiece.y++; gameScore += 2; } setScore(gameScore); lock(); };
        const move = (dir) => { if (!collision(currentPiece, dir, 0)) currentPiece.x += dir; };
        const rotate = () => {
            const original = currentPiece.shape.map(row => [...row]);
            currentPiece.shape = original[0].map((_, i) => original.map(row => row[i]).reverse());
            const kicks = [0, -1, 1, -2, 2];
            for (const offset of kicks) { if (!collision(currentPiece, offset, 0)) { currentPiece.x += offset; return; } }
            currentPiece.shape = original;
        };

        const handleKeyDown = (e) => {
            if (gameOver) return;
            if (e.key.toLowerCase() === 'p') paused = !paused;
            if (e.key === 'Escape' && onExit) onExit();
            if (paused) return;
            switch (e.key) {
                case 'ArrowLeft': move(-1); break;
                case 'ArrowRight': move(1); break;
                case 'ArrowDown': drop(); break;
                case 'ArrowUp': rotate(); break;
                case ' ': e.preventDefault(); hardDrop(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        let touchStartX = null, touchStartY = null;
        const handleTouchStart = (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
        const handleTouchEnd = (e) => {
            if (!touchStartX || gameOver || paused) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > Math.abs(deltaY)) { if (deltaX > 30) move(1); else if (deltaX < -30) move(-1); }
            else { if (deltaY > 30) hardDrop(); else if (deltaY < -30) rotate(); }
            touchStartX = null;
        };
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);

        createPiece();

        const draw = () => {
            const CELL_SIZE = getCellSize();
            const gameWidth = BOARD_WIDTH * CELL_SIZE;
            const gameHeight = BOARD_HEIGHT * CELL_SIZE;
            const offsetX = Math.floor((canvas.width - gameWidth) / 2);
            const offsetY = Math.floor((canvas.height - gameHeight) / 2) + 30;

            drawGalaxyBackground();
            drawPlanets();

            // Game board background with galaxy theme
            ctx.fillStyle = 'rgba(30, 27, 75, 0.4)';
            ctx.beginPath();
            ctx.roundRect(offsetX - 8, offsetY - 8, gameWidth + 16, gameHeight + 16, 12);
            ctx.fill();
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw locked blocks
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    if (board[y][x]) {
                        draw3DBlock(offsetX + x * CELL_SIZE, offsetY + y * CELL_SIZE, CELL_SIZE, board[y][x].color, board[y][x].glow);
                    }
                }
            }

            // Draw current piece
            if (currentPiece && !gameOver) {
                currentPiece.shape.forEach((row, dy) => {
                    row.forEach((value, dx) => {
                        if (value && currentPiece.y + dy >= 0) {
                            draw3DBlock(offsetX + (currentPiece.x + dx) * CELL_SIZE, offsetY + (currentPiece.y + dy) * CELL_SIZE, CELL_SIZE, currentPiece.color, currentPiece.glow);
                        }
                    });
                });
                // Draw word and definition on piece
                drawPieceWord(currentPiece, offsetX, offsetY, CELL_SIZE);
            }

            // Header with logo, title and topic
            const headerY = 15;
            
            // Logo
            const logoImg = new Image();
            logoImg.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692729a5f5180fbd43f297e9/a1a505225_1cPublishing-logo.png';
            ctx.drawImage(logoImg, 20, headerY, 50, 50);

            // Title with glow
            ctx.shadowColor = '#a78bfa';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('TETRIS GALAXY', 80, headerY + 28);
            ctx.shadowBlur = 0;

            // Topic/Subject
            ctx.fillStyle = '#c4b5fd';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`Topic: ${currentTopic || ''}`, 80, headerY + 52);

            // Right side panel
            const panelX = offsetX + gameWidth + 20;
            const panelY = offsetY;
            const panelWidth = 130;

            // Panel background with galaxy theme
            const panelGrad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + 340);
            panelGrad.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
            panelGrad.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
            ctx.fillStyle = panelGrad;
            ctx.beginPath();
            ctx.roundRect(panelX - 5, panelY - 5, panelWidth + 10, 340, 15);
            ctx.fill();
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Next piece box
            ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
            ctx.beginPath();
            ctx.roundRect(panelX, panelY, panelWidth, 100, 12);
            ctx.fill();
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#a78bfa';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('NEXT', panelX + panelWidth/2, panelY + 20);

            if (nextPiece) {
                const pSize = 18;
                const px = panelX + panelWidth/2 - (nextPiece.shape[0].length * pSize) / 2;
                const py = panelY + 30;
                nextPiece.shape.forEach((row, dy) => {
                    row.forEach((value, dx) => {
                        if (value) draw3DBlock(px + dx * pSize, py + dy * pSize, pSize - 1, nextPiece.color, nextPiece.glow);
                    });
                });
                ctx.fillStyle = nextPiece.glow;
                ctx.font = 'bold 11px Arial';
                ctx.fillText(nextPiece.word, panelX + panelWidth/2, panelY + 90);
            }

            // Stats boxes below next piece
            const statsY = panelY + 110;

            // Score
            ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
            ctx.beginPath();
            ctx.roundRect(panelX, statsY, panelWidth, 55, 10);
            ctx.fill();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('SCORE', panelX + panelWidth/2, statsY + 18);
            ctx.font = 'bold 22px Arial';
            ctx.fillText(gameScore.toString(), panelX + panelWidth/2, statsY + 42);

            // Lines
            ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
            ctx.beginPath();
            ctx.roundRect(panelX, statsY + 65, panelWidth, 55, 10);
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.stroke();
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('LINES', panelX + panelWidth/2, statsY + 83);
            ctx.font = 'bold 22px Arial';
            ctx.fillText(gameLines.toString(), panelX + panelWidth/2, statsY + 107);

            // Level
            ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
            ctx.beginPath();
            ctx.roundRect(panelX, statsY + 130, panelWidth, 55, 10);
            ctx.fill();
            ctx.strokeStyle = '#f472b6';
            ctx.stroke();
            ctx.fillStyle = '#f472b6';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('LEVEL', panelX + panelWidth/2, statsY + 148);
            ctx.font = 'bold 22px Arial';
            ctx.fillText(gameLevel.toString(), panelX + panelWidth/2, statsY + 172);

            // Line clear message in center of screen
            if (lineClearMessage) {
                const msgWidth = Math.min(gameWidth * 0.9, 500);
                const msgHeight = 80;
                const msgX = canvas.width / 2 - msgWidth / 2;
                const msgY = canvas.height / 2 - msgHeight / 2;

                ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
                ctx.beginPath();
                ctx.roundRect(msgX, msgY, msgWidth, msgHeight, 16);
                ctx.fill();
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.shadowColor = '#a78bfa';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#a78bfa';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('LINE CLEARED!', canvas.width / 2, msgY + 25);
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#e9d5ff';
                ctx.font = '16px Arial';
                ctx.fillText(lineClearMessage, canvas.width / 2, msgY + 55);
            }

            // Pause/Game Over overlays
            if (paused && !gameOver) {
                ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.shadowColor = '#a78bfa';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#a78bfa';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                ctx.shadowBlur = 0;
            }
            if (gameOver) {
                ctx.fillStyle = 'rgba(30, 27, 75, 0.95)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.shadowColor = '#f472b6';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#f472b6';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = '24px Arial';
                ctx.fillText(`Score: ${gameScore}  |  Lines: ${gameLines}`, canvas.width / 2, canvas.height / 2 + 20);
                ctx.font = '16px Arial';
                ctx.fillStyle = '#c4b5fd';
                ctx.fillText('Click to return', canvas.width / 2, canvas.height / 2 + 60);
            }
        };

        const update = (time = 0) => {
            if (!gameRunning) return;
            const deltaTime = time - lastTime;
            lastTime = time;

            // Update line clear message timer
            if (lineClearMessage) {
                lineClearTimer -= deltaTime;
                if (lineClearTimer <= 0) lineClearMessage = null;
            }

            if (!paused && !gameOver) {
                dropCounter += deltaTime;
                if (dropCounter > dropInterval) drop();
            }

            draw();
            animationFrameId = requestAnimationFrame(update);
        };

        const handleClick = () => { if (gameOver) { gameRunning = false; setScreen('title'); } };
        canvas.addEventListener('click', handleClick);

        update();

        return () => {
            gameRunning = false;
            window.removeEventListener('resize', updateSize);
            window.removeEventListener('keydown', handleKeyDown);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, [screen, wordData, onExit, currentTopic]);

    const toggleFullscreen = async () => {
        try {
            if (!fullscreen) { await document.documentElement.requestFullscreen?.(); setFullscreen(true); }
            else { if (document.fullscreenElement) await document.exitFullscreen(); setFullscreen(false); }
        } catch (error) { console.error('Fullscreen error:', error); }
    };

    if (screen === 'loading') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-violet-900 via-purple-900 to-indigo-950 z-[9999]">
                <div className="text-center">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full animate-pulse"></div>
                        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-400 relative" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Launching into the Galaxy...</h2>
                    <p className="text-purple-300">Generating vocabulary for "{currentTopic}"</p>
                </div>
            </div>
        );
    }

    if (screen === 'game') {
        return (
            <div className="fixed inset-0 z-[9999]">
                <canvas ref={canvasRef} className="block w-full h-full touch-none" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button onClick={toggleFullscreen} className="bg-purple-600/80 hover:bg-purple-700 backdrop-blur border border-purple-400/30" size="sm">
                        {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    <Button onClick={() => setScreen('title')} className="bg-indigo-600/80 hover:bg-indigo-700 backdrop-blur border border-indigo-400/30" size="sm">
                        <X className="w-4 h-4 mr-1" /> Exit
                    </Button>
                </div>
            </div>
        );
    }

    const filteredTopics = (topics) => {
        if (!searchQuery.trim()) return topics;
        return topics.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-950 z-[9999] overflow-auto p-4">
            <Button onClick={onExit} variant="ghost" className="absolute top-2 right-2 text-purple-300 hover:text-white hover:bg-purple-800/50">
                <X className="w-5 h-5" />
            </Button>

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full"></div>
                        <img src={LOGO_URL} alt="Logo" className="w-16 h-16 mx-auto mb-3 rounded-xl relative" />
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">TETRIS GALAXY</h1>
                    <p className="text-purple-300">Stack Words • Learn Vocabulary • Explore the Cosmos</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-4 mb-6 shadow-2xl">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                            <Input 
                                placeholder="Enter any topic to learn..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) handleStartGame('custom'); }}
                                className="pl-12 h-12 bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300/50 rounded-xl focus:border-purple-400 focus:ring-purple-400/30" 
                            />
                        </div>
                        <Button 
                            onClick={() => searchQuery.trim() && handleStartGame('custom')} 
                            disabled={!searchQuery.trim() || loading}
                            className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25"
                        >
                            <Play className="w-4 h-4 mr-2" /> Launch
                        </Button>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-5 mb-6 shadow-xl">
                    <div className="flex flex-wrap gap-2 mb-5">
                        {TABS.map(tab => (
                            <Button 
                                key={tab.id} 
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` : 'bg-white/10 hover:bg-white/20 text-purple-200'}`}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {loadingTopics && !generatedTopics[activeTab]?.length ? (
                        <div className="text-center py-10">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-purple-400" />
                            <p className="text-purple-300">Loading topics...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {filteredTopics(generatedTopics[activeTab] || []).slice(0, 9).map((topic, i) => {
                                const tabInfo = TABS.find(t => t.id === activeTab);
                                const icons = [Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp, Target];
                                const TopicIcon = icons[i % icons.length];
                                return (
                                    <button 
                                        key={topic.id || i} 
                                        onClick={() => handleStartGame(topic)} 
                                        className={`h-32 text-left py-4 px-5 rounded-xl bg-gradient-to-br ${tabInfo?.color || 'from-purple-500 to-indigo-600'} hover:opacity-90 text-white transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-purple-500/20`}
                                    >
                                        <TopicIcon className="w-6 h-6 text-white/80 mb-2" />
                                        <div className="text-sm font-bold line-clamp-2">{topic.label}</div>
                                        <div className="text-xs text-white/70 line-clamp-1 mt-1">{topic.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Target, title: 'Word Blocks', desc: 'Each piece shows a vocabulary word', gradient: 'from-purple-500/20 to-purple-600/10', iconBg: 'bg-purple-500/30', iconColor: 'text-purple-300' },
                        { icon: Brain, title: 'Learn Definitions', desc: 'See meanings when lines clear', gradient: 'from-indigo-500/20 to-indigo-600/10', iconBg: 'bg-indigo-500/30', iconColor: 'text-indigo-300' },
                        { icon: TrendingUp, title: 'Level Up', desc: 'Speed increases as you progress', gradient: 'from-pink-500/20 to-pink-600/10', iconBg: 'bg-pink-500/30', iconColor: 'text-pink-300' }
                    ].map((item, i) => (
                        <div key={i} className={`bg-gradient-to-br ${item.gradient} backdrop-blur border border-purple-500/20 rounded-xl p-5 text-center`}>
                            <div className={`w-14 h-14 ${item.iconBg} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                                <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                            <p className="text-purple-300 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}