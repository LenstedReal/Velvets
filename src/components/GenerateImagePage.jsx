'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Download, Heart, AlertCircle, Wand2 } from 'lucide-react';
import { generateImage } from '../services/imageService';
import { charApi, mediaApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

const GenerateImagePage = () => {
  const { user, addXP } = useAuth() || {};
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [nsfw, setNsfw] = useState(true);
  const [generated, setGenerated] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    charApi.list({ owner: 'official' }).then(setCharacters).catch(() => {});
    if (user) mediaApi.list('photo').then((m) => setGenerated(m.slice(0, 30))).catch(() => {});
  }, [user]);

  const handleGenerate = async () => {
    if (!user) { setError('Please sign in to generate images'); return; }
    setError(null); setIsGenerating(true);
    try {
      const result = await generateImage({
        characterId: selectedChar?.id || null,
        prompt: prompt.trim(),
        style,
        nsfw,
      });
      setGenerated(prev => [{ id: result.id, url: result.url, created_at: result.timestamp, favorite: false }, ...prev]);
      addXP?.(25);
    } catch (e) {
      setError(e.message || 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const promptSuggestions = [
    'in a red silk dress at a candlelit dinner',
    'taking a mirror selfie in the morning',
    'beach photoshoot at sunset',
    'cozy at home in an oversized sweater',
    'glamorous evening gown',
    'workout outfit at the gym',
  ];

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
              AI Image{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">Create stunning photos of your AI companions. Choose a character, describe the scene, and watch the magic happen.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Wand2 className="w-4 h-4 text-pink-400" /> Companion</h3>
                <select value={selectedChar?.id || ''} onChange={(e) => setSelectedChar(characters.find(c => c.id === e.target.value) || null)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-pink-500/50 outline-none">
                  <option value="">No specific character</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name} ({c.age}, {c.ethnicity})</option>)}
                </select>
                {selectedChar && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={selectedChar.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="text-white font-medium">{selectedChar.name}</p>
                      <p className="text-white/50 text-xs line-clamp-2">{selectedChar.description}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Prompt</h3>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scene, outfit, mood..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500/50 outline-none resize-none" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {promptSuggestions.map(s => (
                    <button key={s} onClick={() => setPrompt(s)}
                      className="text-xs px-2.5 py-1 bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-full text-white/70 hover:text-pink-300 transition-all">
                      {s.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-3">Style</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['realistic', 'anime'].map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${style === s ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                      {s === 'realistic' ? 'Realistic' : 'Anime'}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} className="accent-pink-500 w-4 h-4" />
                  <span className="text-white/70 text-sm">Allow NSFW content</span>
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <span>{error}</span>
                </div>
              )}

              <button onClick={handleGenerate} disabled={isGenerating} data-testid="generate-btn"
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 disabled:opacity-50 flex items-center justify-center gap-2">
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Image</>}
              </button>
            </div>

            {/* Output */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold mb-3">Your Creations</h3>
              {generated.length === 0 && !isGenerating ? (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.02]">
                  <ImageIcon className="w-16 h-16 text-white/20 mb-3" />
                  <p className="text-white/40">Your generated images will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {isGenerating && (
                    <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                    </div>
                  )}
                  {generated.map((img) => (
                    <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-white/5">
                      <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                        <a href={img.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20">
                          <Download className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default GenerateImagePage;
