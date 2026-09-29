'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Play, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import ChatInterface from './ChatInterface';
import { charApi } from '../services/api';

const HeroCarousel = () => {
  const [characters, setCharacters] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chatCharacter, setChatCharacter] = useState(null);

  useEffect(() => {
    charApi.list({ owner: 'official' }).then((data) => {
      setCharacters(data.slice(0, 6));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (characters.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % characters.length), 5000);
    return () => clearInterval(timer);
  }, [characters.length]);

  const nextSlide = () => characters.length && setCurrentSlide(prev => (prev + 1) % characters.length);
  const prevSlide = () => characters.length && setCurrentSlide(prev => (prev - 1 + characters.length) % characters.length);
  const handleStartChat = () => characters[currentSlide] && setChatCharacter(characters[currentSlide]);

  if (characters.length === 0) {
    return <section className="bg-gradient-to-b from-[#0a0a0c] to-[#0f0f14] h-[500px]" />;
  }

  const cur = characters[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0c] to-[#0f0f14]">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-pink-400 text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">100% FREE</span>
              <span className="text-white/50">• All Premium Features Included</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Your Perfect{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI Companion</span>
            </h1>
            <p className="text-white/60 text-lg mb-6 max-w-lg mx-auto lg:mx-0">
              Create your dream companion or connect with realistic AI characters. Chat, generate images & videos, voice calls — everything FREE!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8">
              <Button onClick={handleStartChat} data-testid="hero-start-chat" className="w-full sm:w-auto px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40 hover:scale-105">
                <MessageCircle className="w-5 h-5 mr-2" /> Start Chatting Free
              </Button>
              <a href="/generate" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10">
                  <ImageIcon className="w-5 h-5 mr-2" /> Generate Image
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-white/40 text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /><span>50K+ Users</span></div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-400" /><span>No Limits</span></div>
              <div className="flex items-center gap-2"><Play className="w-4 h-4 text-purple-400" /><span>Voice Calls</span></div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[3/4] max-w-md mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/20">
                <img src={cur.image} alt={cur.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-2xl font-bold mb-1">{cur.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-white/70 text-sm">Online now</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {cur.has_live && (
                    <span className="px-3 py-1 bg-red-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">FREE</span>
                </div>
              </div>
              <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {characters.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-6 bg-pink-500' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />

      <ChatInterface isOpen={!!chatCharacter} onClose={() => setChatCharacter(null)} character={chatCharacter} />
    </section>
  );
};

export default HeroCarousel;
