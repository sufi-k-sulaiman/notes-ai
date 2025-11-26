import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, Loader2, Zap, Book, Layers, Play, Pause, Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_DECKS = {
  trending: [],
  education: [
    { id: 'math', label: 'Mathematics', topic: 'Mathematics concepts and terminology' },
    { id: 'science', label: 'Science', topic: 'Scientific concepts and research terms' },
    { id: 'history', label: 'History', topic: 'Historical events and terminology' },
    { id: 'literature', label: 'Literature', topic: 'Literary terms and concepts' },
    { id: 'geography', label: 'Geography', topic: 'Geographical terms and concepts' },
  ],
  planet: [
    { id: 'climate', label: 'Climate Change', topic: 'Climate change and global warming terms' },
    { id: 'co2', label: 'CO2 & Emissions', topic: 'Carbon emissions and greenhouse gases' },
    { id: 'water', label: 'Water Issues', topic: 'Water pollution, conservation, and management' },
    { id: 'air', label: 'Air Quality', topic: 'Air pollution and atmospheric science' },
    { id: 'biodiversity', label: 'Biodiversity', topic: 'Species conservation and ecosystems' },
  ],
  enhance: [
    { id: 'critical', label: 'Critical Thinking', topic: 'Critical thinking and logic concepts' },
    { id: 'philosophy', label: 'Philosophy', topic: 'Philosophical concepts and terminology' },
    { id: 'psychology', label: 'Psychology', topic: 'Psychology and human behavior terms' },
    { id: 'tech', label: 'Technology', topic: 'Technology and innovation terminology' },
    { id: 'ai', label: 'Artificial Intelligence', topic: 'AI and machine learning concepts' },
  ]
};

export default function WordShooter({ onExit }) {
  const [screen, setScreen] = useState('title');
  const [wordData, setWordData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `List 6 trending educational topics people should learn about right now. Include tech, science, culture, and current events. Return as JSON array with format: [{"id": "topic-id", "label": "Topic Name", "topic": "description"}]`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              topics: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, topic: { type: "string" } } } }
            }
          }
        });
        setTrendingTopics(result?.topics || []);
      } catch (error) {
        console.error('Failed to load trending:', error);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const generateWordData = async (topic) => {
    setLoading(true);
    setScreen('loading');
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a learning dataset for: "${topic}". Return 30 primary concepts/terms with their related terms and definitions. Format as JSON: { "words": [{ "primary": "term", "frequency": 50-100, "related": ["term1", "term2"], "definition": "short definition" }] }`,
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
      alert('Failed to generate word data. Please try again.');
      setScreen('title');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = (deck) => {
    if (deck === 'custom') {
      if (!searchQuery.trim()) return;
      generateWordData(searchQuery);
    } else {
      generateWordData(deck.topic);
    }
  };

  const filteredDecks = (decks) => {
    if (!searchQuery.trim()) return decks;
    return decks.filter(d => d.label.toLowerCase().includes(searchQuery.toLowerCase()) || d.topic.toLowerCase().includes(searchQuery.toLowerCase()));
  };

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
      factTimer: 0, currentFact: null
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
      state.bullets.push({ x: state.playerX, y: state.playerY - 40, speed: 15, width: 4, height: 25, color: '#3b82f6' });
      for(let i=0; i<5; i++) {
        state.particles.push({ x: state.playerX, y: state.playerY - 40, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1, life: 20, maxLife: 20, size: 3, color: '#60a5fa' });
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
      const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
      state.asteroids.push({
        id: Math.random(), x: Math.random() * (canvas.width - 200) + 100, y: -100,
        vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 1, rotation: 0, rotSpeed: 0,
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
        state.floatingTexts.push({ x: asteroid.x, y: asteroid.y, vy: -2, text: definition.toUpperCase(), life: 120, maxLife: 120, color: '#22c55e', bonus: baseBonus, size: 22, isKnowledge: false });
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
      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(-25, 20);
      ctx.lineTo(0, 10);
      ctx.lineTo(25, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(0, -5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
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
      ctx.fillStyle = '#0a0a0a';
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
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
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
          ctx.strokeStyle = `rgba(245, 158, 11, ${sw.life / sw.maxLife * 0.8})`; ctx.lineWidth = Math.max(1, 8 - i * 2);
          ctx.shadowBlur = 30; ctx.shadowColor = '#f59e0b'; ctx.stroke();
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
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 24px Inter'; ctx.fillText(`💣 x${state.bombs}`, w - 30, 90);
      ctx.shadowBlur = 0;
      
      ctx.restore();
      
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 60px Inter'; ctx.textAlign = 'center'; ctx.shadowBlur = 30; ctx.shadowColor = '#ef4444';
        ctx.fillText('MISSION COMPLETE', w/2, h/2 - 80);
        ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 36px Inter'; ctx.shadowColor = '#3b82f6';
        ctx.fillText(`Final Score: ${state.score}`, w/2, h/2);
        ctx.fillText(`Words Mastered: ${state.wordsCompleted}/${state.totalWords}`, w/2, h/2 + 50);
        ctx.fillText(`Max Combo: x${state.maxCombo}`, w/2, h/2 + 100);
        ctx.fillStyle = '#9ca3af'; ctx.font = '24px Inter'; ctx.shadowBlur = 0;
        ctx.fillText('Press ESC to return', w/2, h/2 + 180);
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
      <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
        <div className="text-center">
          <Loader2 className="w-20 h-20 animate-spin mx-auto mb-6 text-blue-500" />
          <h2 className="text-3xl font-bold mb-2 text-white">Generating Word Cloud...</h2>
          <p className="text-lg text-gray-400">AI is creating your learning dataset</p>
        </div>
      </div>
    );
  }

  if (screen === 'game') {
    return (
      <div className="fixed inset-0 bg-black z-[9999]">
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div className="absolute top-5 right-5 flex gap-2">
          <Button onClick={toggleFullscreen} className="bg-blue-600 hover:bg-blue-700" size="sm">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button onClick={onExit} className="bg-purple-600 hover:bg-purple-700" size="sm">
            <X className="w-4 h-4 mr-1" /> Exit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#090b16] z-[9999] overflow-auto p-8">
      <Button onClick={onExit} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700">
        <X className="w-4 h-4 mr-2" /> Close
      </Button>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-5xl font-black text-white mb-4" style={{ textShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>WORD SHOOTER</h1>
          <p className="text-xl text-gray-400">Gamified Vocabulary Learning</p>
        </div>

        <Card className="p-6 mb-8 bg-[#18181b] border-blue-500 border-2">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input placeholder="Search decks or enter custom topic..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && searchQuery.trim()) handleStartGame('custom'); }}
                className="pl-12 h-14 text-lg bg-black border-gray-700 text-white" />
            </div>
            <Button onClick={() => searchQuery.trim() && handleStartGame('custom')} disabled={!searchQuery.trim() || loading}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600">
              <Play className="w-5 h-5 mr-2" /> Start Game
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-8 bg-[#18181b] border-gray-700">
          <div className="flex gap-2 mb-6 flex-wrap">
            {['trending', 'education', 'planet', 'enhance'].map(tab => (
              <Button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 ${activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'} text-white`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {activeTab === 'trending' && (loadingTrending ? (
              <div className="col-span-3 text-center py-12"><Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" /><p className="text-gray-500">Loading trending topics...</p></div>
            ) : filteredDecks(trendingTopics).map(deck => (
              <Button key={deck.id} onClick={() => handleStartGame(deck)} className="h-24 text-left justify-start p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <div><div className="text-xl mb-1">{deck.label}</div><div className="text-xs opacity-80">{deck.topic?.slice(0, 40)}...</div></div>
              </Button>
            )))}
            { activeTab !== 'trending' && filteredDecks(PRESET_DECKS[activeTab] || []).map(deck => (
                <Button key={deck.id} onClick={() => handleStartGame(deck)} className={`h-24 text-left justify-start p-6 text-white bg-gradient-to-r ${activeTab === 'education' ? 'from-blue-500 to-blue-600' : activeTab === 'planet' ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600'}`}>
                    <div><div className="text-xl mb-1">{deck.label}</div><div className="text-xs opacity-80">{deck.topic?.slice(0, 40)}...</div></div>
                </Button>
            )))}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {[{ icon: Layers, title: '3-Stage Chains', desc: 'Shoot word → related terms spawn → collect definition', color: 'from-blue-500 to-blue-600' },
            { icon: Zap, title: 'Combo System', desc: 'Chain reactions multiply your score exponentially', color: 'from-purple-500 to-purple-600' },
            { icon: Book, title: 'Learn & Master', desc: 'Every explosion teaches you something new', color: 'from-green-500 to-green-600' }
          ].map((item, i) => (
            <Card key={i} className="p-6 text-center bg-[#18181b] border-gray-700">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${item.color}`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </Card>
          )) }
        </div>
      </div>
    </div>
  );
}