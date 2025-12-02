import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Play, X, Loader2, Search, Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp, Target,
    Maximize2, Minimize2, RotateCcw
} from 'lucide-react';
import { LOGO_URL } from '@/components/NavigationConfig';

const TABS = [
    { id: 'trending', label: 'Trending', color: 'from-purple-600 to-purple-700' },
    { id: 'education', label: 'Education', color: 'from-blue-600 to-blue-700' },
    { id: 'science', label: 'Science', color: 'from-green-600 to-green-700' },
    { id: 'technology', label: 'Technology', color: 'from-cyan-600 to-cyan-700' },
    { id: 'language', label: 'Language', color: 'from-orange-600 to-orange-700' },
    { id: 'history', label: 'History', color: 'from-amber-600 to-amber-700' },
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 28;

const PIECES = [
    { shape: [[1,1,1,1]], color: '#00f0f0', name: 'I' },
    { shape: [[1,1],[1,1]], color: '#f0f000', name: 'O' },
    { shape: [[0,1,0],[1,1,1]], color: '#a000f0', name: 'T' },
    { shape: [[0,1,1],[1,1,0]], color: '#00f000', name: 'S' },
    { shape: [[1,1,0],[0,1,1]], color: '#f00000', name: 'Z' },
    { shape: [[1,0,0],[1,1,1]], color: '#0000f0', name: 'J' },
    { shape: [[0,0,1],[1,1,1]], color: '#f0a000', name: 'L' }
];

export default function TetrisGalaxy({ onExit }) {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const keysRef = useRef({});
    
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
    const [clearedWords, setClearedWords] = useState([]);
    const [showDefinition, setShowDefinition] = useState(null);

    // Load topics for tab
    useEffect(() => {
        loadTabTopics('trending');
    }, []);

    const loadTabTopics = async (tabId) => {
        if (generatedTopics[tabId]?.length) return;
        setLoadingTopics(true);
        try {
            const prompts = {
                trending: 'Generate 9 trending vocabulary topics. Include technology, current events, pop culture.',
                education: 'Generate 9 educational vocabulary topics across math, literature, grammar.',
                science: 'Generate 9 science vocabulary topics including biology, chemistry, physics.',
                technology: 'Generate 9 technology vocabulary topics including programming, AI, hardware.',
                language: 'Generate 9 language learning vocabulary topics including SAT words, idioms, foreign phrases.',
                history: 'Generate 9 history vocabulary topics including ancient civilizations, world wars, famous figures.'
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
                prompt: `Generate vocabulary data for: "${topic}". Return 30 terms with short definitions (max 8 words each). Format: { "words": [{ "word": "term", "definition": "short definition" }] }`,
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
            setClearedWords([]);
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

        // Set canvas size
        const gameWidth = BOARD_WIDTH * CELL_SIZE;
        const gameHeight = BOARD_HEIGHT * CELL_SIZE;
        const sidebarWidth = 200;
        canvas.width = gameWidth + sidebarWidth + 40;
        canvas.height = gameHeight + 60;

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

        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const getNextPiece = () => {
            if (bag.length === 0) {
                bag = shuffle([...PIECES]);
            }
            const piece = bag.pop();
            const word = wordData[wordIndex % wordData.length];
            wordIndex++;
            return {
                shape: piece.shape.map(row => [...row]),
                color: piece.color,
                name: piece.name,
                word: word.word,
                definition: word.definition,
                x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
                y: 0
            };
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
            for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                if (board[y].every(cell => cell !== null)) {
                    // Collect words from cleared line
                    const lineWords = board[y].filter(cell => cell).map(cell => ({
                        word: cell.word,
                        definition: cell.definition
                    }));
                    // Remove duplicates
                    const uniqueWords = lineWords.filter((w, i, arr) => 
                        arr.findIndex(x => x.word === w.word) === i
                    );
                    definitionQueue.push(...uniqueWords);
                    
                    board.splice(y, 1);
                    board.unshift(Array(BOARD_WIDTH).fill(null));
                    linesCleared++;
                    y++;
                }
            }

            if (linesCleared > 0) {
                const points = [0, 100, 300, 500, 800];
                gameScore += points[linesCleared] * gameLevel;
                gameLines += linesCleared;
                gameLevel = Math.floor(gameLines / 10) + 1;
                dropInterval = Math.max(100, 1000 - (gameLevel - 1) * 80);
                setScore(gameScore);
                setLines(gameLines);
                setLevel(gameLevel);
            }
        };

        const createPiece = () => {
            if (!nextPiece) {
                nextPiece = getNextPiece();
            }
            currentPiece = nextPiece;
            currentPiece.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentPiece.y = 0;
            nextPiece = getNextPiece();

            if (collision(currentPiece)) {
                gameOver = true;
            }
        };

        const lock = () => {
            merge();
            clearLines();
            createPiece();
        };

        const drop = () => {
            if (!collision(currentPiece, 0, 1)) {
                currentPiece.y++;
            } else {
                lock();
            }
            dropCounter = 0;
        };

        const hardDrop = () => {
            while (!collision(currentPiece, 0, 1)) {
                currentPiece.y++;
                gameScore += 2;
            }
            setScore(gameScore);
            lock();
        };

        const move = (dir) => {
            if (!collision(currentPiece, dir, 0)) {
                currentPiece.x += dir;
            }
        };

        const rotate = () => {
            const original = currentPiece.shape.map(row => [...row]);
            currentPiece.shape = original[0].map((_, i) => 
                original.map(row => row[i]).reverse()
            );

            const kicks = [0, -1, 1, -2, 2];
            for (const offset of kicks) {
                if (!collision(currentPiece, offset, 0)) {
                    currentPiece.x += offset;
                    return;
                }
            }
            currentPiece.shape = original;
        };

        // Input handling
        const handleKeyDown = (e) => {
            keysRef.current[e.key] = true;
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

        const handleKeyUp = (e) => {
            keysRef.current[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Touch controls
        let touchStartX = null;
        let touchStartY = null;
        
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        };

        const handleTouchEnd = (e) => {
            if (!touchStartX || gameOver || paused) return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) move(1);
                else if (deltaX < -30) move(-1);
            } else {
                if (deltaY > 30) hardDrop();
                else if (deltaY < -30) rotate();
            }
            touchStartX = null;
        };

        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchend', handleTouchEnd);

        // Initialize
        createPiece();

        // Draw function
        const draw = () => {
            const offsetX = 20;
            const offsetY = 50;

            // Background
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            for (let i = 0; i < 50; i++) {
                ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
                ctx.beginPath();
                ctx.arc(
                    (i * 37) % canvas.width,
                    (i * 23) % canvas.height,
                    Math.random() * 1.5,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            // Board background
            ctx.fillStyle = '#111';
            ctx.fillRect(offsetX, offsetY, gameWidth, gameHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(offsetX, offsetY, gameWidth, gameHeight);

            // Draw grid
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            for (let x = 0; x <= BOARD_WIDTH; x++) {
                ctx.beginPath();
                ctx.moveTo(offsetX + x * CELL_SIZE, offsetY);
                ctx.lineTo(offsetX + x * CELL_SIZE, offsetY + gameHeight);
                ctx.stroke();
            }
            for (let y = 0; y <= BOARD_HEIGHT; y++) {
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY + y * CELL_SIZE);
                ctx.lineTo(offsetX + gameWidth, offsetY + y * CELL_SIZE);
                ctx.stroke();
            }

            // Draw board
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    if (board[y][x]) {
                        const cell = board[y][x];
                        ctx.fillStyle = cell.color;
                        ctx.fillRect(
                            offsetX + x * CELL_SIZE + 1,
                            offsetY + y * CELL_SIZE + 1,
                            CELL_SIZE - 2,
                            CELL_SIZE - 2
                        );
                        // Word label
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 8px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(
                            cell.word.substring(0, 4),
                            offsetX + x * CELL_SIZE + CELL_SIZE / 2,
                            offsetY + y * CELL_SIZE + CELL_SIZE / 2 + 3
                        );
                    }
                }
            }

            // Draw current piece
            if (currentPiece && !gameOver) {
                currentPiece.shape.forEach((row, dy) => {
                    row.forEach((value, dx) => {
                        if (value) {
                            const x = currentPiece.x + dx;
                            const y = currentPiece.y + dy;
                            if (y >= 0) {
                                ctx.fillStyle = currentPiece.color;
                                ctx.fillRect(
                                    offsetX + x * CELL_SIZE + 1,
                                    offsetY + y * CELL_SIZE + 1,
                                    CELL_SIZE - 2,
                                    CELL_SIZE - 2
                                );
                                // Word on piece
                                ctx.fillStyle = '#fff';
                                ctx.font = 'bold 8px Arial';
                                ctx.textAlign = 'center';
                                ctx.fillText(
                                    currentPiece.word.substring(0, 4),
                                    offsetX + x * CELL_SIZE + CELL_SIZE / 2,
                                    offsetY + y * CELL_SIZE + CELL_SIZE / 2 + 3
                                );
                            }
                        }
                    });
                });
            }

            // Sidebar
            const sideX = offsetX + gameWidth + 20;

            // Title
            ctx.fillStyle = '#0ff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('TETRIS GALAXY', offsetX, 35);

            // Topic
            ctx.fillStyle = '#888';
            ctx.font = '12px Arial';
            ctx.fillText(currentTopic || '', sideX, 30);

            // Next piece
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('NEXT', sideX, 60);

            if (nextPiece) {
                const previewX = sideX;
                const previewY = 70;
                ctx.fillStyle = '#222';
                ctx.fillRect(previewX, previewY, 100, 60);
                
                nextPiece.shape.forEach((row, dy) => {
                    row.forEach((value, dx) => {
                        if (value) {
                            ctx.fillStyle = nextPiece.color;
                            ctx.fillRect(
                                previewX + 10 + dx * 20,
                                previewY + 10 + dy * 20,
                                18, 18
                            );
                        }
                    });
                });
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.fillText(nextPiece.word, previewX + 5, previewY + 55);
            }

            // Stats
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('SCORE', sideX, 160);
            ctx.fillStyle = '#0ff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(gameScore.toString(), sideX, 185);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('LINES', sideX, 220);
            ctx.fillStyle = '#0f0';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(gameLines.toString(), sideX, 245);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('LEVEL', sideX, 280);
            ctx.fillStyle = '#f0f';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(gameLevel.toString(), sideX, 305);

            // Definition display
            if (currentDefinition) {
                ctx.fillStyle = 'rgba(0,0,0,0.9)';
                ctx.fillRect(sideX - 10, 330, 180, 80);
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(sideX - 10, 330, 180, 80);

                ctx.fillStyle = '#0ff';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(currentDefinition.word, sideX, 355);

                ctx.fillStyle = '#fff';
                ctx.font = '11px Arial';
                const words = currentDefinition.definition.split(' ');
                let line = '';
                let lineY = 375;
                words.forEach(word => {
                    if ((line + word).length > 22) {
                        ctx.fillText(line, sideX, lineY);
                        line = word + ' ';
                        lineY += 14;
                    } else {
                        line += word + ' ';
                    }
                });
                ctx.fillText(line, sideX, lineY);
            }

            // Controls hint
            ctx.fillStyle = '#555';
            ctx.font = '10px Arial';
            ctx.fillText('← → Move | ↑ Rotate', sideX, 440);
            ctx.fillText('↓ Drop | Space Hard Drop', sideX, 455);
            ctx.fillText('P Pause | ESC Exit', sideX, 470);

            // Paused overlay
            if (paused && !gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0ff';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                ctx.font = '16px Arial';
                ctx.fillStyle = '#888';
                ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
            }

            // Game over overlay
            if (gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.9)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#f00';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText(`Score: ${gameScore}`, canvas.width / 2, canvas.height / 2 + 10);
                ctx.fillText(`Lines: ${gameLines}`, canvas.width / 2, canvas.height / 2 + 40);
                ctx.fillStyle = '#888';
                ctx.font = '14px Arial';
                ctx.fillText('Click to return to menu', canvas.width / 2, canvas.height / 2 + 80);
            }
        };

        // Game loop
        const update = (time = 0) => {
            if (!gameRunning) return;

            const deltaTime = time - lastTime;
            lastTime = time;

            // Update definition display
            if (definitionQueue.length > 0 && !currentDefinition) {
                currentDefinition = definitionQueue.shift();
                definitionTimer = 3000;
                setShowDefinition(currentDefinition);
                setClearedWords(prev => [...prev, currentDefinition]);
            }
            if (currentDefinition) {
                definitionTimer -= deltaTime;
                if (definitionTimer <= 0) {
                    currentDefinition = null;
                    setShowDefinition(null);
                }
            }

            if (!paused && !gameOver) {
                dropCounter += deltaTime;
                if (dropCounter > dropInterval) {
                    drop();
                }
            }

            draw();
            animationFrameId = requestAnimationFrame(update);
        };

        // Click handler for game over
        const handleClick = () => {
            if (gameOver) {
                gameRunning = false;
                setScreen('title');
            }
        };
        canvas.addEventListener('click', handleClick);

        update();

        return () => {
            gameRunning = false;
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
            canvas.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, [screen, wordData, onExit, currentTopic]);

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
            <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a1a] z-[9999]">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-cyan-500" />
                    <h2 className="text-2xl font-bold mb-2 text-white">Generating Vocabulary...</h2>
                    <p className="text-gray-400">Creating word blocks for "{currentTopic}"</p>
                </div>
            </div>
        );
    }

    // Game screen
    if (screen === 'game') {
        return (
            <div className="fixed inset-0 bg-[#0a0a1a] z-[9999] flex items-center justify-center">
                <canvas ref={canvasRef} className="block touch-none" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button onClick={toggleFullscreen} className="bg-cyan-600 hover:bg-cyan-700" size="sm">
                        {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    <Button onClick={() => setScreen('title')} className="bg-gray-600 hover:bg-gray-700" size="sm">
                        <X className="w-4 h-4 mr-1" /> Exit
                    </Button>
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
                    <h1 className="text-4xl font-black text-gray-900 mb-1">TETRIS GALAXY</h1>
                    <p className="text-gray-500">Stack Words • Learn Vocabulary</p>
                </div>

                <div className="bg-white rounded-xl border border-cyan-200 p-3 mb-4 shadow-sm">
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
                            className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl"
                        >
                            <Play className="w-4 h-4 mr-2" /> Start Game
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
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-cyan-500" />
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
                                        className={`h-32 text-left py-3 px-4 rounded-xl bg-gradient-to-br ${tabInfo?.color || 'from-cyan-600 to-cyan-700'} hover:opacity-90 text-white transition-all hover:scale-[1.02] hover:shadow-lg`}
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
                        { icon: Target, title: 'Word Blocks', desc: 'Each block has a vocabulary word', bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' },
                        { icon: Brain, title: 'Learn Definitions', desc: 'See meanings when lines clear', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
                        { icon: TrendingUp, title: 'Level Up', desc: 'Speed increases as you progress', bgColor: 'bg-green-100', iconColor: 'text-green-600' }
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