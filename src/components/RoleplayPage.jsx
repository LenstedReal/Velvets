'use client';
import React, { useState, useEffect } from 'react';
import { miscApi } from '../services/api';
import { charApi } from '../services/api';
import { Heart, Briefcase, Sun, Cloud, Home, Dumbbell, Book, Music, Bed, Phone, Building, ChefHat, Sparkles } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import ChatInterface from './ChatInterface';

const ICONS = { Heart, Briefcase, Sun, Cloud, Home, Dumbbell, Book, Music, Bed, Phone, Building, ChefHat };

const RoleplayPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [picked, setPicked] = useState(null); // {scenario, character}
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [pendingScenario, setPendingScenario] = useState(null);

  useEffect(() => {
    miscApi.scenarios().then(setScenarios).catch(() => {});
    charApi.list({ owner: 'official' }).then(setCharacters).catch(() => {});
  }, []);

  const startScenario = (scenario, character) => {
    // Save the scenario opening to localStorage so ChatInterface can prefill
    setPicked({ scenario, character });
    setShowCharSelect(false);
  };

  const categories = [...new Set(scenarios.map(s => s.category))];

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      <main className="pt-20 pb-20 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-3">
              <Sparkles className="w-4 h-4" /> 100% FREE
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Roleplay{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scenarios
              </span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">Choose a scenario, pick your companion, and dive into an immersive story.</p>
          </div>

          {categories.map(cat => (
            <div key={cat} className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scenarios.filter(s => s.category === cat).map(s => {
                  const Icon = ICONS[s.icon] || Heart;
                  return (
                    <div key={s.id}
                      onClick={() => { setPendingScenario(s); setShowCharSelect(true); }}
                      className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0c] border border-white/10 hover:border-pink-500/50 transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-pink-500/40 group-hover:to-purple-500/40 transition-all">
                        <Icon className="w-6 h-6 text-pink-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                      <p className="text-white/50 text-sm">{s.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Character selection modal */}
      {showCharSelect && pendingScenario && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCharSelect(false)}>
          <div className="bg-[#0a0a0c] rounded-2xl border border-white/10 max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-1">{pendingScenario.title}</h3>
            <p className="text-white/60 mb-6">Choose your companion for this scenario</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {characters.slice(0, 16).map(c => (
                <button key={c.id} onClick={() => startScenario(pendingScenario, c)}
                  className="group text-left rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 transition-all">
                  <div className="relative aspect-[3/4]">
                    <img src={c.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2">
                    <p className="text-white font-medium text-sm truncate">{c.name}</p>
                    <p className="text-white/40 text-xs">{c.age}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {picked && (
        <ChatInterface
          isOpen={!!picked}
          onClose={() => setPicked(null)}
          character={{ ...picked.character, __scenario: picked.scenario }}
        />
      )}

      <Footer />
      <BottomNav />
    </div>
  );
};

export default RoleplayPage;
