'use client';
import React, { useState, useEffect } from 'react';
import { Play, Volume2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import { miscApi } from '../services/api';

const LiveSection = () => {
  const [chatCharacter, setChatCharacter] = useState(null);
  const [liveChars, setLiveChars] = useState([]);

  useEffect(() => { miscApi.live().then(setLiveChars).catch(() => {}); }, []);

  return (
    <section className="py-12 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Jump into LIVE ACTION</h2>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-bold">FREE</span>
            </div>
            <p className="text-white/60 text-sm">Live streaming with your AI companions • Photo & Video requests • Voice calls</p>
          </div>
          <a href="/live" className="text-pink-400 hover:text-pink-300 text-sm font-medium">View all →</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {liveChars.slice(0, 6).map((char) => (
            <div key={char.id} className="group cursor-pointer" onClick={() => setChatCharacter(char)}>
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-white/5">
                <img src={char.image} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs">{char.viewers}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-pink-500/90 flex items-center justify-center shadow-lg shadow-pink-500/50">
                    {char.live_type === 'play' ? <Play className="w-7 h-7 text-white ml-1" /> : <Volume2 className="w-7 h-7 text-white" />}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-medium text-sm">{char.name}</h3>
                  <p className="text-white/60 text-xs">{char.age} years</p>
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg text-pink-400 text-sm font-medium hover:from-pink-500/30 hover:to-purple-500/30 transition-all">
                Start Live
              </button>
            </div>
          ))}
        </div>
      </div>

      <ChatInterface isOpen={!!chatCharacter} onClose={() => setChatCharacter(null)} character={chatCharacter} />
    </section>
  );
};

export default LiveSection;
