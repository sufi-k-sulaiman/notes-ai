import React, { useState, useEffect } from 'react';
import { Gamepad2, Rocket, Target, Shield } from 'lucide-react';

import WordShooter from '@/components/games/WordShooter';
import SpaceBattleGame from '@/components/games/SpaceBattleGame';
import TankCity from '@/components/games/TankCity';
import { Button } from '@/components/ui/button';

export default function Games() {
    useEffect(() => {
        document.title = 'AI powered Gamification Games for smarter learning';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'Space battle and Word shooters makes education engaging, interactive, and boosts learning.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'Gamification, educational games');
    }, []);

    const [activeGame, setActiveGame] = useState(null);

    if (activeGame === 'space-battle') {
        return <SpaceBattleGame onExit={() => setActiveGame(null)} />;
    }
    
    if (activeGame === 'word-shooter') {
        return <WordShooter onExit={() => setActiveGame(null)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Game Arcade</h1>
                    </div>
                    <p className="text-gray-500">Gamified Learning</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Space Battle Game Card */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center flex flex-col">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Rocket className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Space Battle</h2>
                      <p className="text-gray-500 mb-6 flex-grow">Destroy alien ships and test your knowledge!</p>
                      <Button onClick={() => setActiveGame('space-battle')} size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                          Play Now
                      </Button>
                  </div>

                  {/* Word Shooter Game Card */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center flex flex-col">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Target className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Word Shooter</h2>
                      <p className="text-gray-500 mb-6 flex-grow">Gamified vocabulary learning with AI-powered word sets.</p>
                      <Button onClick={() => setActiveGame('word-shooter')} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                          Play Now
                      </Button>
                  </div>
                </div>
            </div>
        </div>
    );
}