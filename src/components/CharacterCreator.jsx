'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, Wand2, Sparkles, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CharacterCreator = ({ isOpen, onClose, onCreated }) => {
  const { addCharacter, user } = useAuth() || {};
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState({
    style: 'realistic', gender: 'female', ethnicity: '', age: 25,
    hair_color: '', hair_style: '', eye_color: '', body_type: '',
    personality: [], voice_style: '', name: '', relationship: '', backstory: '',
  });

  const reset = () => {
    setStep(1); setError(null); setIsCreating(false);
    setCharacter({
      style: 'realistic', gender: 'female', ethnicity: '', age: 25,
      hair_color: '', hair_style: '', eye_color: '', body_type: '',
      personality: [], voice_style: '', name: '', relationship: '', backstory: '',
    });
  };

  useEffect(() => { if (!isOpen) reset(); }, [isOpen]);

  const options = {
    style: [
      { id: 'realistic', label: 'Realistic', desc: 'Photorealistic appearance' },
      { id: 'anime', label: 'Anime', desc: 'Japanese anime style' },
    ],
    gender: [
      { id: 'female', label: 'Female' },
      { id: 'male', label: 'Male' },
    ],
    ethnicity: ['Caucasian', 'Asian', 'Latina', 'African', 'Arab', 'Indian', 'Mixed'],
    hair_color: ['Blonde', 'Brunette', 'Black', 'Red', 'Pink', 'Blue', 'White', 'Purple'],
    hair_style: ['Long Straight', 'Long Wavy', 'Short', 'Curly', 'Ponytail', 'Bangs', 'Pixie', 'Braids'],
    eye_color: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet'],
    body_type: ['Slim', 'Athletic', 'Curvy', 'Petite', 'Thick', 'BBW', 'Muscular'],
    personality: ['Submissive', 'Dominant', 'Shy', 'Bold', 'Romantic', 'Playful', 'Jealous', 'Caring', 'Mysterious', 'Nympho', 'Innocent', 'Mature', 'Tsundere', 'Yandere'],
    voice_style: ['Soft Whisper', 'Sweet', 'Bold', 'Seductive', 'Cheerful', 'Deep', 'Breathy', 'Playful'],
    relationship: ['Girlfriend', 'Wife', 'Ex', 'Crush', 'Best Friend', 'Neighbor', 'Coworker', 'Boss', 'Teacher', 'Student', 'Stranger'],
  };

  const togglePersonality = (trait) => {
    setCharacter(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait].slice(0, 3),
    }));
  };

  const handleCreate = async () => {
    if (!user) { setError('Please sign in to create characters'); return; }
    if (!character.name) { setError('Please give your companion a name'); return; }
    setError(null); setIsCreating(true);
    try {
      const created = await addCharacter(character);
      onCreated?.(created);
      onClose();
      reset();
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Could not create character');
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return character.style && character.gender && character.ethnicity;
      case 2: return character.hair_color && character.body_type;
      case 3: return character.personality.length > 0 && character.name;
      default: return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0c] border-purple-500/20 max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10">
            <X className="w-5 h-5 text-white/60" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-3">
              <Sparkles className="w-4 h-4" /> 100% FREE
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Your AI Companion</h2>
            <p className="text-white/50">Step {step} of 3 • Design your perfect companion</p>
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-20 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {options.style.map(s => (
                    <button key={s.id} onClick={() => setCharacter({ ...character, style: s.id })}
                      data-testid={`style-${s.id}`}
                      className={`p-4 rounded-xl border text-left transition-all ${character.style === s.id ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <span className="text-white font-medium block">{s.label}</span>
                      <span className="text-white/50 text-sm">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {options.gender.map(g => (
                    <button key={g.id} onClick={() => setCharacter({ ...character, gender: g.id })}
                      className={`p-3 rounded-xl border text-white transition-all ${character.gender === g.id ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Ethnicity</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {options.ethnicity.map(e => (
                    <button key={e} onClick={() => setCharacter({ ...character, ethnicity: e })}
                      className={`p-3 rounded-xl border text-sm text-white transition-all ${character.ethnicity === e ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Age: <span className="text-pink-400">{character.age}</span></label>
                <input type="range" min="18" max="50" value={character.age}
                  onChange={(e) => setCharacter({ ...character, age: parseInt(e.target.value) })}
                  className="w-full accent-pink-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                <div className="flex justify-between text-white/40 text-xs mt-1"><span>18</span><span>50</span></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {[
                { key: 'hair_color', label: 'Hair Color', opts: options.hair_color, cols: 4 },
                { key: 'hair_style', label: 'Hair Style', opts: options.hair_style, cols: 4 },
                { key: 'eye_color', label: 'Eye Color', opts: options.eye_color, cols: 4 },
                { key: 'body_type', label: 'Body Type', opts: options.body_type, cols: 4 },
              ].map(({ key, label, opts, cols }) => (
                <div key={key}>
                  <label className="text-white/80 text-sm mb-3 block font-medium">{label}</label>
                  <div className={`grid grid-cols-${cols} gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {opts.map(o => (
                      <button key={o} onClick={() => setCharacter({ ...character, [key]: o })}
                        className={`p-2.5 rounded-xl border text-sm text-white transition-all ${character[key] === o ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Personality Traits <span className="text-white/40">(select up to 3)</span></label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {options.personality.map(p => (
                    <button key={p} onClick={() => togglePersonality(p)}
                      className={`p-2.5 rounded-xl border text-sm text-white transition-all flex items-center justify-center gap-1 ${character.personality.includes(p) ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      {character.personality.includes(p) && <Check className="w-3 h-3" />}
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Relationship Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {options.relationship.map(r => (
                    <button key={r} onClick={() => setCharacter({ ...character, relationship: r })}
                      className={`p-2.5 rounded-xl border text-sm text-white transition-all ${character.relationship === r ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Voice Style</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {options.voice_style.map(v => (
                    <button key={v} onClick={() => setCharacter({ ...character, voice_style: v })}
                      className={`p-2.5 rounded-xl border text-sm text-white transition-all ${character.voice_style === v ? 'border-pink-500 bg-pink-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Name <span className="text-pink-400">*</span></label>
                <input data-testid="creator-name-input" type="text" value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Give your companion a name..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 outline-none" />
              </div>
              <div>
                <label className="text-white/80 text-sm mb-3 block font-medium">Backstory <span className="text-white/40">(optional)</span></label>
                <textarea value={character.backstory} onChange={(e) => setCharacter({ ...character, backstory: e.target.value })}
                  placeholder="Write a backstory for your companion..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500 outline-none resize-none" />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="flex-1 py-6 bg-white/5 border-white/10 text-white hover:bg-white/10">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} data-testid="creator-next-btn"
                className="flex-1 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={!canProceed() || isCreating} data-testid="creator-create-btn"
                className="flex-1 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50">
                {isCreating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</> : <><Wand2 className="w-5 h-5 mr-2" /> Create Character</>}
              </Button>
            )}
          </div>

          <p className="text-white/30 text-xs text-center mt-4">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterCreator;
