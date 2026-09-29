'use client';
import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, MessageCircle, Image as ImageIcon, Video, Phone, Heart, Trophy, Sparkles, Camera, Mic } from 'lucide-react';

const CharacterProfile = ({ isOpen, onClose, character, onChat }) => {
  if (!character) return null;
  const levelProgress = ((character.xp || 0) % 1000) / 10;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0c] border-purple-500/20 max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm">
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="relative h-80">
          <img src={character.cover_image || character.image} alt={character.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/30 to-transparent" />

          <div className="absolute top-4 left-4 flex gap-2">
            {character.is_new && (
              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> NEW
              </span>
            )}
            {character.has_live && character.status === 'online' && (
              <span className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-lg shadow-pink-500/30 flex-shrink-0">
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h2 className="text-2xl font-bold text-white">{character.name}</h2><span className="text-white/60">{character.age}</span></div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${character.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className={`text-sm ${character.status === 'online' ? 'text-green-400' : 'text-gray-400'}`}>
                    {character.status === 'online' ? 'Online now' : 'Away'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">Level {character.level}</span></div>
              <span className="text-white/50 text-sm">{character.xp} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            <p className="text-white/40 text-xs mt-2">All features unlocked • No limits</p>
          </div>

          <p className="text-white/70 leading-relaxed">{character.description}</p>

          <div className="space-y-3">
            {character.personality?.length > 0 && (
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {character.personality.map(t => <span key={t} className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-sm">{t}</span>)}
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

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-3 bg-white/5 rounded-xl"><MessageCircle className="w-5 h-5 text-pink-400 mx-auto mb-1" /><p className="text-white font-bold">{character.message_count || 0}</p><p className="text-white/40 text-xs">Chats</p></div>
            <div className="text-center p-3 bg-white/5 rounded-xl"><ImageIcon className="w-5 h-5 text-purple-400 mx-auto mb-1" /><p className="text-white font-bold">{character.photo_count || 0}</p><p className="text-white/40 text-xs">Photos</p></div>
            <div className="text-center p-3 bg-white/5 rounded-xl"><Video className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-white font-bold">{character.video_count || 0}</p><p className="text-white/40 text-xs">Videos</p></div>
            <div className="text-center p-3 bg-white/5 rounded-xl"><Mic className="w-5 h-5 text-green-400 mx-auto mb-1" /><p className="text-white font-bold">{character.voice_count || 0}</p><p className="text-white/40 text-xs">Voice</p></div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => { onClose(); onChat(character); }} data-testid="profile-chat-btn"
              className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-pink-500/25">
              <MessageCircle className="w-5 h-5 mr-2" /> Start Chatting - FREE
            </Button>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-pink-500/20 p-3"><Camera className="w-5 h-5" /></Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-purple-500/20 p-3"><Video className="w-5 h-5" /></Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-green-500/20 p-3"><Phone className="w-5 h-5" /></Button>
              <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-red-500/20 p-3"><Heart className="w-5 h-5" /></Button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-pink-400" /> Unlimited</span>
              <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-purple-400" /> Photos</span>
              <span className="flex items-center gap-1"><Video className="w-3 h-3 text-blue-400" /> Videos</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-400" /> Calls</span>
            </div>
            <p className="text-white/30 text-xs text-center mt-3">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterProfile;
