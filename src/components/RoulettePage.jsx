'use client';
import React, { useState } from 'react';
import { Dice5, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { miscApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import ChatInterface from './ChatInterface';

const RoulettePage = () => {
  const { user } = useAuth() || {};
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatCharacter, setChatCharacter] = useState(null);
  const [error, setError] = useState(null);

  const spin = async () => {
    if (!user) { setError('Sign in to spin the roulette'); return; }
    setError(null); setLoading(true);
    try {
      const c = await miscApi.roulette();
      setCurrent(c);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Spin failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      <main className="pt-20 pb-20 lg:pb-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-3">
            <Sparkles className="w-4 h-4" /> 100% FREE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Velvet{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Roulette</span>
          </h1>
          <p className="text-white/60 mb-8">Get matched with a random AI companion. Who will you meet today?</p>

          {!current && !loading && (
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center mb-6">
              <Dice5 className="w-24 h-24 text-white/20 mb-4" />
              <p className="text-white/40">Spin to discover</p>
            </div>
          )}

          {loading && (
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
              <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />
            </div>
          )}

          {current && !loading && (
            <div className="max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/20 mb-6 bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0c] border border-pink-500/30">
              <div className="relative aspect-[3/4]">
                <img src={current.image} alt={current.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <h3 className="text-2xl font-bold text-white">{current.name}, {current.age}</h3>
                  <p className="text-pink-300 text-sm">{current.relationship}</p>
                </div>
              </div>
              <div className="p-5 text-left">
                <p className="text-white/70 text-sm mb-4">{current.description}</p>
                <button onClick={() => setChatCharacter(current)} data-testid="roulette-chat-btn"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-medium flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Chat with {current.name}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

          <button onClick={spin} disabled={loading} data-testid="roulette-spin-btn"
            className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto">
            <Dice5 className="w-6 h-6" /> {current ? 'Spin Again' : 'Spin'}
          </button>

          <p className="text-white/30 text-sm mt-8">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
        </div>
      </main>

      <ChatInterface isOpen={!!chatCharacter} onClose={() => setChatCharacter(null)} character={chatCharacter} />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default RoulettePage;
