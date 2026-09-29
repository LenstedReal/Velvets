'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, Trophy, Play, Loader2, Repeat, X, ChevronLeft, Volume2, VolumeX, Heart } from 'lucide-react';
import { charApi, performLiveAction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

const LIVE_ACTIONS = [
  { id: 'bird-watching', label: 'Do some bird watching', level: 1, prompt: 'looking through binoculars at birds, sunny day, lakeside, casual top' },
  { id: 'flower-hair', label: 'Put a flower in your hair', level: 1, prompt: 'putting a beautiful flower in her hair, soft sunset light, dreamy' },
  { id: 'blow-kiss', label: 'Blow me a kiss', level: 2, prompt: 'blowing a kiss to the camera, playful flirty smile, soft lighting' },
  { id: 'selfie', label: 'Take a selfie', level: 2, prompt: 'taking a cute mirror selfie, playful pose, bedroom setting' },
  { id: 'wink', label: 'Wink at me', level: 3, prompt: 'winking playfully at the camera, close-up shot, sultry smile' },
  { id: 'pose', label: 'Strike a pose', level: 4, prompt: 'striking a model pose, glamour shot, professional lighting' },
  { id: 'dance', label: 'Dance for me', level: 5, prompt: 'dancing sensually, dynamic motion blur, club lighting' },
  { id: 'lingerie', label: 'Show your lingerie', level: 5, prompt: 'showing off elegant lingerie, intimate boudoir setting, alluring pose' },
  { id: 'bath', label: 'Take a bath', level: 6, prompt: 'relaxing in a bubble bath, candles, intimate, glowing skin' },
  { id: 'shower', label: 'Hop in the shower', level: 6, prompt: 'in the shower, water droplets, steamy, glistening skin' },
];

const ROLEPLAY_CHOICES = [
  { id: 'go-with-her', label: 'Go with her', icon: '💜', followup: 'I follow her without hesitation, curious about what she has planned for me.' },
  { id: 'challenge-her', label: 'Challenge her', icon: '⚡', followup: '*smirks and crosses my arms* Make me. What if I don\'t want to?' },
  { id: 'tease-her', label: 'Tease her back', icon: '😏', followup: '*leans in close and whispers* Oh really? You think you can handle me?' },
  { id: 'kiss-her', label: 'Kiss her', icon: '💋', followup: '*pulls her close and kisses her deeply, ignoring everything else*' },
];

const LiveActionPage = () => {
  const { user } = useAuth() || {};
  const userLevel = user?.level || 1;
  const userXP = user?.xp || 0;
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reaction, setReaction] = useState('');
  const [loopOn, setLoopOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    charApi.list({ owner: 'official' }).then((d) => {
      setCharacters(d.filter(c => c.gender === 'female'));
      if (d[0]) setSelected(d.find(c => c.gender === 'female') || d[0]);
    });
  }, []);

  useEffect(() => {
    if (!loopOn || !currentAction || !selected) return;
    const t = setTimeout(() => runAction(currentAction), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopOn, currentImage]);

  const runAction = async (action) => {
    if (!selected) return;
    if (action.level > userLevel) {
      setError(`Level ${action.level} required (you are Lv.${userLevel})`);
      return;
    }
    setLoading(true); setError(null); setCurrentAction(action);
    try {
      const res = await performLiveAction(action.prompt, selected.id);
      setCurrentImage(res.image_url);
      setReaction(res.reaction || '');
    } catch (e) {
      setError(e.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice) => {
    // Roleplay choices funnel into chat — for now just store as last reaction
    setReaction(choice.followup);
  };

  const xpToNext = (userLevel) * 1000;
  const xpProgress = ((userXP % 1000) / 10);

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      <Header />
      <main className="pt-20 pb-20 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Live Action <span className="text-xs px-2 py-1 bg-purple-500/30 rounded-full text-purple-300 align-middle">Beta v2</span></h1>
              <p className="text-white/50 text-sm">Interactive scenes — 100% FREE, no Premium needed</p>
            </div>
          </div>

          {/* Character picker */}
          <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {characters.slice(0, 16).map(c => (
              <button key={c.id} onClick={() => { setSelected(c); setCurrentImage(c.image); setCurrentAction(null); }}
                className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selected?.id === c.id ? 'border-pink-500 scale-105' : 'border-transparent hover:border-white/20'}`}>
                <img src={c.image} alt={c.name} className="w-20 h-20 object-cover" />
                <p className="text-white text-xs py-1 text-center bg-black/60 truncate w-20">{c.name}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Scene preview */}
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0c] border border-white/10">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-12 h-12 text-pink-400 animate-spin" />
                    <p className="text-white/60 text-sm">{selected?.name} is preparing...</p>
                  </div>
                ) : currentImage ? (
                  <img src={currentImage} alt="" className="w-full h-full object-cover" />
                ) : selected ? (
                  <img src={selected.image} alt="" className="w-full h-full object-cover opacity-90" />
                ) : null}

                {/* Top-right controls */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => setMuted(!muted)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80">
                    {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>
                  <button onClick={() => setLoopOn(!loopOn)} className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center ${loopOn ? 'bg-pink-500' : 'bg-black/60 hover:bg-black/80'}`}>
                    <Repeat className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Roleplay choice overlay */}
                {currentAction && !loading && (
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <p className="text-white text-center font-semibold drop-shadow-lg">What do you want to do?</p>
                    {ROLEPLAY_CHOICES.slice(0, 2).map(c => (
                      <button key={c.id} onClick={() => handleChoice(c)}
                        className="w-full py-3 bg-black/60 backdrop-blur-md border border-purple-500/40 hover:border-purple-500 hover:bg-purple-500/20 rounded-full text-white text-sm transition-all">
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {selected && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <img src={selected.image} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-white text-sm font-medium">{selected.name}</span>
                  </div>
                )}
              </div>

              {reaction && (
                <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <p className="text-white/80 text-sm italic">{reaction.slice(0, 280)}</p>
                </div>
              )}
            </div>

            {/* Actions list */}
            <div className="lg:col-span-2 space-y-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Level {userLevel}</span>
                  <span className="text-white/50 text-sm">{userXP} / {xpToNext} XP</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {LIVE_ACTIONS.map(action => {
                const locked = action.level > userLevel;
                return (
                  <button key={action.id} onClick={() => !locked && runAction(action)} disabled={locked || loading}
                    data-testid={`live-action-${action.id}`}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      locked
                        ? 'bg-white/5 border-white/5 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5'
                    }`}>
                    <span className={`font-medium ${locked ? 'text-white/30' : 'text-white'}`}>{action.label}</span>
                    {locked ? (
                      <span className="flex items-center gap-1.5 text-purple-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">Level {action.level}</span>
                      </span>
                    ) : (
                      <Play className="w-5 h-5 text-pink-400 fill-pink-400" />
                    )}
                  </button>
                );
              })}

              <div className="text-center pt-2">
                <span className="text-emerald-400 text-xs flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> ALL ACTIONS FREE — NO PREMIUM
                </span>
              </div>
            </div>
          </div>

          <p className="text-white/30 text-xs text-center mt-12">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default LiveActionPage;
