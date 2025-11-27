import React, { useState } from 'react';
import { Gamepad2, Rocket, Target } from 'lucide-react';

import WordShooter from '../components/games/WordShooter';
import SpaceBattleGame from '../components/games/SpaceBattleGame';
import { Button } from '@/components/ui/button';

export default function Games() {
    const [activeGame, setActiveGame] = useState(null);

    if (activeGame === 'space-battle') {
        return <SpaceBattleGame onExit={() => setActiveGame(null)} />;
    }
    
    if (activeGame === 'word-shooter') {
        return <WordShooter onExit={() => setActiveGame(null)} />;
    }

    return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#0a0f1a] p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Gamepad2 className="w-10 h-10 text-cyan-400" />
                            <h1 className="text-4xl font-bold text-white">Game Arcade</h1>
                        </div>
                        <p className="text-gray-400">Learn while you play!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Space Battle Game Card */}
                      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20 text-center flex flex-col">
                          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Rocket className="w-12 h-12 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Space Battle</h2>
                          <p className="text-gray-400 mb-6 flex-grow">Destroy alien ships and test your knowledge!</p>
                          <Button onClick={() => setActiveGame('space-battle')} size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                              Play Now
                          </Button>
                      </div>

                      {/* Word Shooter Game Card */}
                      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 text-center flex flex-col">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Target className="w-12 h-12 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Word Shooter</h2>
                          <p className="text-gray-400 mb-6 flex-grow">Gamified vocabulary learning with AI-powered word sets.</p>
                          <Button onClick={() => setActiveGame('word-shooter')} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                              Play Now
                          </Button>
                      </div>
                    </div>
                </div>
            </div>
    );
}