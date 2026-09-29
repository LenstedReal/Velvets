'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { charApi } from '../services/api';
import { MessageCircle, Image as ImageIcon, Video, Phone, Heart, Star, Trophy, Sparkles, Camera, Mic, ChevronLeft, Loader2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import ChatInterface from './ChatInterface';

const CharacterDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    charApi.get(id).then(setCharacter).catch(() => setCharacter(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
    </div>
  );
  if (!character) return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      <div className="pt-20 text-center text-white/60">Character not found.</div>
      <Footer />
    </div>
  );

  const levelProgress = ((character.xp || 0) % 1000) / 10;

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      <main className="pt-16 pb-20 lg:pb-12">
        <div className="relative">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="relative h-[420px] md:h-[520px]">
            <img src={character.cover_image || character.image} alt={character.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
            <div className="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto px-4 flex items-end gap-5">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden border-4 border-pink-500 shadow-2xl shadow-pink-500/30 flex-shrink-0">
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{character.name}</h1>
                  <span className="text-white/70 text-xl">{character.age}</span>
                  {character.has_live && character.status === 'online' && (
                    <span className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                  {character.is_new && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-xs font-bold">NEW</span>
                  )}
                </div>
                <p className="text-pink-300 text-sm">{character.relationship}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">Level {character.level}</span></div>
              <span className="text-white/50 text-sm">{character.xp} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-white/40 text-xs mt-2">All features unlocked • No limits</p>
          </div>

          <p className="text-white/80 leading-relaxed text-lg">{character.description}</p>
          {character.backstory && <p className="text-white/60 leading-relaxed italic">"{character.backstory}"</p>}

          <div className="space-y-4">
            {character.personality?.length > 0 && (
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {character.personality.map(p => <span key={p} className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-sm">{p}</span>)}
                </div>
              </div>
            )}
            {character.interests?.length > 0 && (
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {character.interests.map(i => <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">{i}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-4 bg-white/5 rounded-xl"><MessageCircle className="w-5 h-5 text-pink-400 mx-auto mb-1" /><p className="text-white font-bold">{character.message_count || 0}</p><p className="text-white/40 text-xs">Chats</p></div>
            <div className="text-center p-4 bg-white/5 rounded-xl"><ImageIcon className="w-5 h-5 text-purple-400 mx-auto mb-1" /><p className="text-white font-bold">{character.photo_count || 0}</p><p className="text-white/40 text-xs">Photos</p></div>
            <div className="text-center p-4 bg-white/5 rounded-xl"><Video className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-white font-bold">{character.video_count || 0}</p><p className="text-white/40 text-xs">Videos</p></div>
            <div className="text-center p-4 bg-white/5 rounded-xl"><Mic className="w-5 h-5 text-green-400 mx-auto mb-1" /><p className="text-white font-bold">{character.voice_count || 0}</p><p className="text-white/40 text-xs">Voice</p></div>
          </div>

          <button onClick={() => setChatOpen(true)} data-testid="detail-chat-btn"
            className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2 text-lg">
            <MessageCircle className="w-6 h-6" /> Start Chatting — FREE
          </button>

          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-white/30 text-sm">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
          </div>
        </div>
      </main>

      <ChatInterface isOpen={chatOpen} onClose={() => setChatOpen(false)} character={character} />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default CharacterDetailPage;
