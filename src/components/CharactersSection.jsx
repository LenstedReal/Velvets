'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Image as ImageIcon, Video, Phone, Trophy, Star } from 'lucide-react';
import CharacterProfile from './CharacterProfile';
import ChatInterface from './ChatInterface';
import { charApi } from '../services/api';

const CharactersSection = ({ filterGender, filterStyle }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [chatCharacter, setChatCharacter] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filterGender) params.gender = filterGender;
    if (filterStyle) params.style = filterStyle;
    charApi.list(params).then((data) => {
      setCharacters(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterGender, filterStyle]);

  const handleChat = (character) => {
    setSelectedCharacter(null);
    setChatCharacter(character);
  };

  const filteredCharacters = filter === 'all'
    ? characters
    : filter === 'online'
    ? characters.filter(c => c.status === 'online')
    : filter === 'new'
    ? characters.filter(c => c.is_new)
    : filter === 'anime'
    ? characters.filter(c => c.style === 'anime')
    : characters;

  return (
    <section className="py-16 bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">VelvetAI Characters</h2>
            <p className="text-white/60 max-w-2xl">
              Choose from our collection of AI companions. Each one is unique, responsive, and ready to connect.
              <span className="text-pink-400 font-medium"> All features FREE — no limits!</span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap" data-testid="character-filters">
            {[
              { id: 'all', label: 'All' },
              { id: 'online', label: 'Online', dot: 'bg-green-500' },
              { id: 'new', label: 'New', dot: 'bg-yellow-500' },
              { id: 'anime', label: 'Anime', dot: 'bg-purple-500' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} data-testid={`filter-${f.id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  filter === f.id
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                }`}>
                {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot}`} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredCharacters.map((character) => (
            <div key={character.id} className="group cursor-pointer" data-testid={`character-card-${character.id}`}
              onClick={() => setSelectedCharacter(character)}>
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0c] border border-white/5 hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1">
                <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    {character.is_new && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-xs font-bold flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3" /> NEW
                      </span>
                    )}
                    {character.level >= 7 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-xs font-bold flex items-center gap-1 w-fit">
                        <Star className="w-3 h-3" /> TOP
                      </span>
                    )}
                  </div>
                  {character.has_live && character.status === 'online' && (
                    <span className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                </div>

                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={character.image} alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
                    <button className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-medium flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform shadow-lg">
                      <MessageCircle className="w-4 h-4" /> Chat Now
                    </button>
                    <div className="flex gap-2">
                      <span className="p-2 bg-white/10 rounded-full backdrop-blur-sm"><ImageIcon className="w-4 h-4 text-white" /></span>
                      <span className="p-2 bg-white/10 rounded-full backdrop-blur-sm"><Video className="w-4 h-4 text-white" /></span>
                      <span className="p-2 bg-white/10 rounded-full backdrop-blur-sm"><Phone className="w-4 h-4 text-white" /></span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-white font-semibold truncate">{character.name}</h3>
                    <span className="text-white/50 text-sm flex-shrink-0">{character.age}</span>
                    <span className={`w-2 h-2 rounded-full ml-auto ${character.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${((character.xp || 0) % 1000) / 10}%` }} />
                    </div>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Lv.{character.level || 1}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm line-clamp-2 leading-relaxed mb-2">{character.description}</p>
                  {character.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {character.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-pink-500/20 rounded text-pink-300 text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> {character.photo_count || 0}
                    </span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Video className="w-3 h-3" /> {character.video_count || 0}
                    </span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {character.message_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <CharacterProfile isOpen={!!selectedCharacter} onClose={() => setSelectedCharacter(null)} character={selectedCharacter} onChat={handleChat} />
      <ChatInterface isOpen={!!chatCharacter} onClose={() => setChatCharacter(null)} character={chatCharacter} />
    </section>
  );
};

export default CharactersSection;
