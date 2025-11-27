import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, Loader2, Zap, Book, Layers, Play, Search, X, Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WordShooter({ onExit }) {
  const [screen, setScreen] = useState('title');
  const [wordData, setWordData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedTopics, setGeneratedTopics] = useState({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [subLevels, setSubLevels] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const canvasRef = useRef(null);

  const TABS = [
    { id: 'trending', label: 'Trending', color: 'from-purple-600 to-purple-700' },
    { id: 'education', label: 'Education', color: 'from-blue-600 to-blue-700' },
    { id: 'planet', label: 'Planet', color: 'from-green-600 to-green-700' },
    { id: 'enhance', label: 'Enhance', color: 'from-amber-600 to-amber-700' },
    { id: 'sports', label: 'Sports', color: 'from-orange-600 to-orange-700' },
    { id: 'finance', label: 'Finance', color: 'from-emerald-600 to-emerald-700' },
    { id: 'investment', label: 'Investment', color: 'from-indigo-600 to-indigo-700' },
    { id: 'health', label: 'Health', color: 'from-rose-600 to-rose-700' },
    { id: 'wellness', label: 'Wellness', color: 'from-teal-600 to-teal-700' },
    { id: 'global', label: 'Global', color: 'from-cyan-600 to-cyan-700' },
  ];

  useEffect(() => {
    generateAllTopics();
  }, []);

  const generateAllTopics = async () => {
    setLoadingTopics(true);
    const allTopics = {};
    
    const prompts = {
      trending: 'Generate 9 trending educational topics people should learn about right now. Include technology, AI, current events, and emerging fields.',
      education: 'Generate 9 core educational topics across mathematics, science, history, literature, geography, and languages.',
      planet: 'Generate 9 environmental and planetary topics including climate change, sustainability, conservation, renewable energy, and ecosystems.',
      enhance: 'Generate 9 self-improvement and cognitive enhancement topics including critical thinking, philosophy, psychology, creativity, and productivity.',
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

  const generateSubLevels = async (topic) => {
    setLoading(true);
    setScreen('loading');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 progressive learning levels for "${topic}". Each level should build on the previous. Return as JSON: { "levels": [{ "id": 1, "name": "Level Name", "description": "What you'll learn", "difficulty": "Beginner/Intermediate/Advanced" }] }`,
        response_json_schema: {
          type: "object",
          properties: {
            levels: { type: "array", items: { type: "object", properties: { id: { type: "number" }, name: { type: "string" }, description: { type: "string" }, difficulty: { type: "string" } } } }
          }
        }
      });
      setSubLevels(result.levels || []);
      setCurrentTopic(topic);
      setScreen('levels');
    } catch (error) {
      console.error('Failed to generate levels:', error);
      setScreen('title');
    } finally {
      setLoading(false);
    }
  };

  const generateWordData = async (levelName) => {
    setLoading(true);
    setScreen('loading');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate vocabulary data for: "${currentTopic} - ${levelName}". Return 20 terms with related words and definitions. Format: { "words": [{ "primary": "term", "frequency": 50-100, "related": ["term1", "term2"], "definition": "short definition" }] }`,
        response_json_schema: {
          type: "object",
          properties: {
            words: { type: "array", items: { type: "object", properties: { primary: { type: "string" }, frequency: { type: "number" }, related: { type: "array", items: { type: "string" } }, definition: { type: "string" } } } }
          }
        }
      });
      setWordData(result.words || []);
      setScreen('game');
    } catch (error) {
      console.error('Failed to generate words:', error);
      setScreen('levels');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = (topic) => {
    if (topic === 'custom') {
      if (!searchQuery.trim()) return;
      generateSubLevels(searchQuery);
    } else {
      generateSubLevels(topic.label);
    }
  };

  const handlePlayLevel = (level) => {
    setCurrentLevel(level.id);
    generateWordData(level.name);
  };

  const handleLevelComplete = (score) => {
    setTotalScore(prev => prev + score);
    if (!completedLevels.includes(currentLevel)) {
      setCompletedLevels(prev => [...prev, currentLevel]);
    }
    setScreen('levels');
  };

  const filteredTopics = (topics) => {
    if (!searchQuery.trim()) return topics;
    return topics.filter(t => 
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Game canvas effect
  useEffect(() => {
    if (screen !== 'game' || !canvasRef.current || wordData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const state = {
      playerX: canvas.width / 2, playerY: canvas.height - 100, playerWidth: 60, playerHealth: 5,
      bullets: [], asteroids: [], particles: [], floatingTexts: [], stars: [],
      score: 0, combo: 0, maxCombo: 0, wordsCompleted: 0, totalWords: wordData.length, bombs: 3,
      paused: false, gameOver: false, shockwave: null, flash: 0, shake: 0,
      spawnTimer: 0, spawnRate: 120, wordQueue: [...wordData].sort(() => Math.random() - 0.5),
    };

    for(let i=0; i<300; i++) {
      state.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 + 0.5, speed: Math.random() * 1.5 + 0.3, opacity: Math.random() * 0.5 + 0.3 });
    }

    const keys = {};
    const handleKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') { e.preventDefault(); if (!state.paused && !state.gameOver) shootBullet(); }
      if (e.key.toLowerCase() === 'b' && !state.paused && !state.gameOver && state.bombs > 0) deployBomb();
      if (e.key.toLowerCase() === 'p' && !state.gameOver) state.paused = !state.paused;
      if (e.key === 'Escape') onExit();
    };
    const handleKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function shootBullet() {
      state.bullets.push({ x: state.playerX, y: state.playerY - 40, speed: 15, width: 4, height: 25, color: '#8b5cf6' });
      for(let i=0; i<5; i++) {
        state.particles.push({ x: state.playerX, y: state.playerY - 40, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1, life: 20, maxLife: 20, size: 3, color: '#a78bfa' });
      }
    }

    function deployBomb() {
      state.bombs--;
      state.shockwave = { x: canvas.width / 2, y: canvas.height / 2, radius: 0, maxRadius: Math.max(canvas.width, canvas.height) * 1.5, life: 80, maxLife: 80 };
      state.flash = 30;
      state.asteroids.forEach(ast => explodeAsteroid(ast, true));
      state.asteroids = [];
      state.shake = 20;
    }

    function spawnAsteroid() {
      if (state.wordQueue.length === 0) return;
      const word = state.wordQueue.shift();
      ctx.font = 'bold 16px Inter';
      const textWidth = ctx.measureText(word.primary.toUpperCase()).width + 30;
      const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4'];
      state.asteroids.push({
        id: Math.random(), x: Math.random() * (canvas.width - 200) + 100, y: -100,
        vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 1, rotation: 0,
        width: textWidth, height: 50, stage: 1, text: word.primary, wordData: word,
        color: colors[Math.floor(Math.random() * colors.length)], health: 1
      });
    }

    function explodeAsteroid(asteroid, isBomb = false) {
      const particleCount = isBomb ? 80 : 40;
      for(let i=0; i<particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = isBomb ? Math.random() * 15 + 8 : Math.random() * 10 + 5;
        state.particles.push({ x: asteroid.x, y: asteroid.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: isBomb ? 60 : 45, maxLife: isBomb ? 60 : 45, size: isBomb ? Math.random() * 6 + 3 : Math.random() * 5 + 2, color: isBomb ? ['#ef4444', '#f59e0b', '#fbbf24'][Math.floor(Math.random() * 3)] : asteroid.color });
      }
      
      if (!isBomb && asteroid.wordData?.definition) {
        const definition = asteroid.wordData.definition.split(' ').slice(0, 5).join(' ');
        const baseBonus = 100 * (state.combo + 1);
        state.floatingTexts.push({ x: asteroid.x, y: asteroid.y, vy: -2, text: definition.toUpperCase(), life: 120, maxLife: 120, color: '#22c55e', bonus: baseBonus, size: 22 });
        state.combo++;
        state.score += baseBonus;
        state.wordsCompleted++;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      } else {
        state.score += 50 * Math.max(state.combo, 1);
        if (!isBomb) state.combo = 0;
      }
    }

    function drawShip() {
      ctx.save();
      ctx.translate(state.playerX, state.playerY);
      ctx.fillStyle = '#8b5cf6';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#8b5cf6';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(-25, 20);
      ctx.lineTo(0, 10);
      ctx.lineTo(25, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(0, -5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.beginPath();
      ctx.arc(-15, 15, 5, 0, Math.PI * 2);
      ctx.arc(15, 15, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawAsteroid(ast) {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      const w = ast.width, h = ast.height, r = Math.min(15, w / 2, h / 2);
      ctx.fillStyle = ast.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = ast.color;
      ctx.beginPath();
      ctx.moveTo(-w/2 + r, -h/2);
      ctx.lineTo(w/2 - r, -h/2);
      ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
      ctx.lineTo(w/2, h/2 - r);
      ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
      ctx.lineTo(-w/2 + r, h/2);
      ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
      ctx.lineTo(-w/2, -h/2 + r);
      ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ast.text.toUpperCase(), 0, 0);
      ctx.restore();
    }

    function gameLoop() {
      if (!canvas) return;
      const w = canvas.width, h = canvas.height;
      
      let shakeX = 0, shakeY = 0;
      if (state.shake > 0) { shakeX = (Math.random() - 0.5) * state.shake; shakeY = (Math.random() - 0.5) * state.shake; state.shake--; }
      
      ctx.save();
      ctx.translate(shakeX, shakeY);
      ctx.fillStyle = '#0f0f23';
      ctx.fillRect(0, 0, w, h);
      
      if (state.flash > 0) { ctx.fillStyle = `rgba(255, 255, 255, ${state.flash / 30 * 0.6})`; ctx.fillRect(0, 0, w, h); state.flash--; }
      
      if (state.paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', w/2, h/2 - 40);
        ctx.font = '24px Inter';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Press P to resume | ESC to exit', w/2, h/2 + 20);
        ctx.restore();
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      
      state.stars.forEach(s => { s.y += s.speed; if(s.y > h) { s.y = -5; s.x = Math.random() * w; } ctx.fillStyle = `rgba(255,255,255,${s.opacity})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill(); });
      
      const moveSpeed = 8;
      if (keys.arrowleft || keys.a) state.playerX -= moveSpeed;
      if (keys.arrowright || keys.d) state.playerX += moveSpeed;
      state.playerX = Math.max(40, Math.min(w - 40, state.playerX));
      
      drawShip();
      
      state.bullets = state.bullets.filter(b => {
        b.y -= b.speed;
        const gradient = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8b5cf6';
        ctx.fillRect(b.x - b.width/2, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
        return b.y > -50;
      });
      
      state.spawnTimer++;
      if (state.spawnTimer >= state.spawnRate && state.wordQueue.length > 0) { spawnAsteroid(); state.spawnTimer = 0; }
      
      state.asteroids = state.asteroids.filter(ast => {
        ast.x += ast.vx; ast.y += ast.vy;
        drawAsteroid(ast);
        for(let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          if (b.x > ast.x - ast.width/2 && b.x < ast.x + ast.width/2 && b.y > ast.y - ast.height/2 && b.y < ast.y + ast.height/2) {
            state.bullets.splice(i, 1); explodeAsteroid(ast); return false;
          }
        }
        if (ast.y > h + 100) { state.playerHealth--; state.combo = 0; if (state.playerHealth <= 0) state.gameOver = true; return false; }
        return true;
      });
      
      state.particles = state.particles.filter(p => { p.life--; p.x += p.vx; p.y += p.vy; p.vy += 0.2; ctx.fillStyle = p.color; ctx.globalAlpha = p.life / p.maxLife; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; return p.life > 0; });
      
      state.floatingTexts = state.floatingTexts.filter(ft => {
        ft.life--; ft.y += ft.vy;
        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.min(1, ft.life / ft.maxLife);
        ctx.font = `bold ${ft.size}px Inter`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, 0, 0);
        ctx.font = 'bold 24px Inter';
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`+${ft.bonus}`, 0, ft.size + 20);
        ctx.globalAlpha = 1;
        ctx.restore();
        return ft.life > 0;
      });
      
      if (state.shockwave) {
        const sw = state.shockwave;
        sw.radius += sw.maxRadius / sw.maxLife; sw.life--;
        for(let i=0; i<3; i++) {
          ctx.beginPath(); ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - i * 50), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${sw.life / sw.maxLife * 0.8})`; ctx.lineWidth = Math.max(1, 8 - i * 2);
          ctx.shadowBlur = 30; ctx.shadowColor = '#8b5cf6'; ctx.stroke();
        }
        ctx.shadowBlur = 0;
        if (sw.life <= 0) state.shockwave = null;
      }
      
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px Inter'; ctx.textAlign = 'left'; ctx.shadowBlur = 5; ctx.shadowColor = '#000';
      ctx.fillText(`SCORE: ${state.score}`, 30, 40);
      ctx.fillText(`COMBO: x${state.combo}`, 30, 80);
      ctx.fillText(`WORDS: ${state.wordsCompleted}/${state.totalWords}`, 30, 120);
      ctx.textAlign = 'right'; ctx.fillStyle = '#ef4444'; ctx.font = '32px Inter';
      for(let i=0; i<state.playerHealth; i++) ctx.fillText('❤️', w - 30 - i * 45, 45);
      ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 24px Inter'; ctx.fillText(`💣 x${state.bombs}`, w - 30, 90);
      ctx.shadowBlur = 0;
      
      ctx.restore();
      
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 60px Inter'; ctx.textAlign = 'center'; ctx.shadowBlur = 30; ctx.shadowColor = '#8b5cf6';
        ctx.fillText('MISSION COMPLETE', w/2, h/2 - 80);
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 36px Inter'; ctx.shadowColor = '#22c55e';
        ctx.fillText(`Final Score: ${state.score}`, w/2, h/2);
        ctx.fillText(`Words Mastered: ${state.wordsCompleted}/${state.totalWords}`, w/2, h/2 + 50);
        ctx.fillText(`Max Combo: x${state.maxCombo}`, w/2, h/2 + 100);
        ctx.fillStyle = '#9ca3af'; ctx.font = '24px Inter'; ctx.shadowBlur = 0;
        ctx.fillText('Click anywhere to continue', w/2, h/2 + 180);
        
        canvas.onclick = () => handleLevelComplete(state.score);
        return;
      }
      
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [screen, wordData, onExit]);

  const toggleFullscreen = async () => {
    try {
      if (!fullscreen) { await document.documentElement.requestFullscreen?.(); setFullscreen(true); }
      else { if (document.fullscreenElement) await document.exitFullscreen(); setFullscreen(false); }
    } catch (error) { console.error('Fullscreen error:', error); }
  };

  if (screen === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f23] z-[9999]">
        <div className="text-center">
          <Loader2 className="w-20 h-20 animate-spin mx-auto mb-6 text-purple-500" />
          <h2 className="text-3xl font-bold mb-2 text-white">Generating Learning Data...</h2>
          <p className="text-lg text-gray-400">AI is creating your vocabulary mission</p>
        </div>
      </div>
    );
  }

  if (screen === 'game') {
    return (
      <div className="fixed inset-0 bg-[#0f0f23] z-[9999]">
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div className="absolute top-5 right-5 flex gap-2">
          <Button onClick={toggleFullscreen} className="bg-purple-600 hover:bg-purple-700" size="sm">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button onClick={() => setScreen('levels')} className="bg-gray-600 hover:bg-gray-700" size="sm">
            <X className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
        <div className="absolute top-5 left-5 bg-black/60 px-4 py-2 rounded-lg">
          <p className="text-white text-sm">Level {currentLevel} • {currentTopic}</p>
        </div>
      </div>
    );
  }

  if (screen === 'levels') {
    return (
      <div className="fixed inset-0 bg-[#0f0f23] z-[9999] overflow-auto p-8">
        <Button onClick={() => setScreen('title')} className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600">
          ← Back to Topics
        </Button>
        <Button onClick={onExit} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700">
          <X className="w-4 h-4 mr-2" /> Close
        </Button>
        
        <div className="max-w-4xl mx-auto pt-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2">{currentTopic}</h1>
            <p className="text-xl text-gray-400">Choose a level to play</p>
            <div className="mt-4 flex justify-center gap-6">
              <div className="bg-purple-600/20 px-4 py-2 rounded-lg">
                <span className="text-purple-400 font-bold">Total Score: {totalScore}</span>
              </div>
              <div className="bg-green-600/20 px-4 py-2 rounded-lg">
                <span className="text-green-400 font-bold">Completed: {completedLevels.length}/{subLevels.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subLevels.map((level, i) => {
              const isCompleted = completedLevels.includes(level.id);
              const isLocked = i > 0 && !completedLevels.includes(subLevels[i-1]?.id) && !isCompleted;
              const difficultyColors = {
                'Beginner': 'from-green-500 to-green-600',
                'Intermediate': 'from-yellow-500 to-orange-500',
                'Advanced': 'from-red-500 to-red-600',
              };
              
              return (
                <Card key={level.id} className={`p-6 bg-[#1a1a2e] border-2 ${isCompleted ? 'border-green-500' : isLocked ? 'border-gray-700 opacity-50' : 'border-purple-500'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${difficultyColors[level.difficulty] || 'from-gray-500 to-gray-600'} text-white`}>
                      {level.difficulty}
                    </span>
                    {isCompleted && <span className="text-green-400 text-xl">✓</span>}
                    {isLocked && <span className="text-gray-500">🔒</span>}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Level {level.id}: {level.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{level.description}</p>
                  <Button 
                    onClick={() => !isLocked && handlePlayLevel(level)} 
                    disabled={isLocked}
                    className={`w-full ${isLocked ? 'bg-gray-700' : isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}`}
                  >
                    {isLocked ? 'Locked' : isCompleted ? 'Play Again' : 'Start Level'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Title screen
  return (
    <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-auto p-8">
      <Button onClick={onExit} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700">
        <X className="w-4 h-4" />
      </Button>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">WORD SHOOTER</h1>
          <p className="text-xl text-gray-500">Gamified Vocabulary Learning</p>
        </div>

        <Card className="p-6 mb-8 bg-white border-purple-200 border-2 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="Search decks or enter custom topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) handleStartGame('custom'); }}
                className="pl-12 h-14 text-lg bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400" />
            </div>
            <Button onClick={() => searchQuery.trim() && handleStartGame('custom')} disabled={!searchQuery.trim() || loading}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <Play className="w-5 h-5 mr-2" /> Start Game
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-8 bg-white border-gray-200 shadow-sm">
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(tab => (
              <Button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color}` : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} ${activeTab === tab.id ? 'text-white' : ''}`}>
                {tab.label}
              </Button>
            ))}
          </div>

          {loadingTopics ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-gray-500">Generating topics with AI...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredTopics(generatedTopics[activeTab] || []).slice(0, 9).map((topic, i) => {
                const tabInfo = TABS.find(t => t.id === activeTab);
                const icons = [Sparkles, Globe, Cpu, Atom, Leaf, Brain, Lightbulb, TrendingUp];
                const TopicIcon = icons[i % icons.length];
                return (
                  <button key={topic.id || i} onClick={() => handleStartGame(topic)} 
                    className={`h-36 text-left p-5 rounded-2xl bg-gradient-to-br ${tabInfo?.color || 'from-purple-600 to-purple-700'} hover:opacity-90 text-white transition-all hover:scale-[1.02] hover:shadow-lg`}>
                    <TopicIcon className="w-6 h-6 text-white/70 mb-3" />
                    <div className="text-base font-bold mb-1 line-clamp-1">{topic.label}</div>
                    <div className="text-xs text-white/70 line-clamp-2">{topic.description}</div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Layers, title: '3-Stage Chains', desc: 'Shoot word → related terms spawn → collect definition', color: 'from-blue-500 to-blue-600' },
            { icon: Zap, title: 'Combo System', desc: 'Chain reactions multiply your score exponentially', color: 'from-purple-500 to-purple-600' },
            { icon: Book, title: 'Learn & Master', desc: 'Every explosion teaches you something new', color: 'from-green-500 to-green-600' }
          ].map((item, i) => (
            <Card key={i} className="p-6 text-center bg-white border-gray-200 shadow-sm">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${item.color}`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}