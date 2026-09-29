'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, MessageCircle, Image as ImageIcon, Video, Trash2, Edit, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { charApi } from '../services/api';
import ChatInterface from './ChatInterface';
import CharacterCreator from './CharacterCreator';
import CharacterProfile from './CharacterProfile';

const MyAISection = () => {
  const { user, myCharacters, removeCharacter, refreshMyCharacters } = useAuth() || {};
  const [favoritesPool, setFavoritesPool] = useState([]);
  const [chatCharacter, setChatCharacter] = useState(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    if (activeTab === 'favorites') {
      charApi.list({ owner: 'official' }).then((data) => {
        setFavoritesPool(data.filter(c => (c.level || 0) >= 5));
      }).catch(() => {});
    }
  }, [activeTab]);

  const handleChat = (character) => {
    setSelectedCharacter(null);
    setChatCharacter(character);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      await removeCharacter?.(id);
    }
  };

  const displayCharacters = activeTab === 'my' ? (myCharacters || []) : favoritesPool;

  return (
    <section className="py-8 bg-[#0a0a0c] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My AI Companions</h1>
            <p className="text-white/60">{user ? `Welcome back, ${user.name}!` : 'Sign in to manage your AI companions'}</p>
          </div>
          {user && (
            <button onClick={() => setCreatorOpen(true)} data-testid="my-ai-create-btn"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-pink-500/25">
              <Plus className="w-5 h-5" /> Create New AI
            </button>
          )}
        </div>

        {user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-white/60 text-sm">Level</span></div>
              <p className="text-3xl font-bold text-white">{user.level}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-purple-400" /><span className="text-white/60 text-sm">XP</span></div>
              <p className="text-3xl font-bold text-white">{(user.xp || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2"><MessageCircle className="w-5 h-5 text-pink-400" /><span className="text-white/60 text-sm">Messages</span></div>
              <p className="text-3xl font-bold text-white">{(user.total_messages || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-emerald-400" /><span className="text-white/60 text-sm">My AIs</span></div>
              <p className="text-3xl font-bold text-white">{myCharacters?.length || 0}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('my')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'my' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
            My Creations ({myCharacters?.length || 0})
          </button>
          <button onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'favorites' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
            Top Companions
          </button>
        </div>

        {displayCharacters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No AI Companions Yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">Create your first AI companion and start chatting!</p>
            {user && (
              <button onClick={() => setCreatorOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all shadow-lg shadow-pink-500/25">
                <Plus className="w-5 h-5 inline mr-2" /> Create Your First AI
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {displayCharacters.map((character) => (
              <div key={character.id} className="group cursor-pointer" onClick={() => setSelectedCharacter(character)}>
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0c] border border-white/5 hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1">
                  {character.is_custom && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                        <Edit className="w-3 h-3" /> Custom
                      </span>
                    </div>
                  )}
                  {character.is_custom && (
                    <button onClick={(e) => handleDelete(e, character.id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}

                  <div className="relative aspect-[3/4] overflow-hidden">
                    {character.image ? (
                      <img src={character.image} alt={character.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
                      <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-medium flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Chat Now
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-white font-semibold truncate">{character.name}</h3>
                      <span className="text-white/50 text-sm flex-shrink-0">{character.age}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${((character.xp || 0) % 1000) / 10}%` }} />
                      </div>
                      <span className="text-white/40 text-xs">Lv.{character.level || 1}</span>
                    </div>
                    {character.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {character.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-pink-500/20 rounded text-pink-300 text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                      <span className="text-white/40 text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {character.photo_count || 0}</span>
                      <span className="text-white/40 text-xs flex items-center gap-1"><Video className="w-3 h-3" /> {character.video_count || 0}</span>
                      <span className="text-white/40 text-xs flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {character.message_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-white/30 text-sm">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
        </div>
      </div>

      <CharacterCreator isOpen={creatorOpen} onClose={() => setCreatorOpen(false)} onCreated={() => refreshMyCharacters?.()} />
      <CharacterProfile isOpen={!!selectedCharacter} onClose={() => setSelectedCharacter(null)} character={selectedCharacter} onChat={handleChat} />
      <ChatInterface isOpen={!!chatCharacter} onClose={() => setChatCharacter(null)} character={chatCharacter} />
    </section>
  );
};

export default MyAISection;
