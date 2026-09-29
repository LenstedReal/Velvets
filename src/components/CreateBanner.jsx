'use client';
import React, { useState } from 'react';
import { Sparkles, Image, Video, MessageCircle, Phone, Heart, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import CharacterCreator from './CharacterCreator';

const CreateBanner = () => {
  const [creatorOpen, setCreatorOpen] = useState(false);

  return (
    <section className="py-16 bg-[#0a0a0c] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="bg-gradient-to-r from-[#1a1a2e]/80 to-[#0f0f14]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">100% FREE</span>
                <span className="text-white/50">• No Limits</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Create Your Perfect{' '}
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  AI Companion
                </span>
              </h2>
              
              <p className="text-white/60 mb-6 leading-relaxed">
                Design your dream companion from scratch. Choose appearance, personality, 
                voice, and backstory. She'll remember everything about your conversations.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Image className="w-4 h-4 text-pink-400" /> Photo Generation
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Video className="w-4 h-4 text-purple-400" /> Video Creation
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Phone className="w-4 h-4 text-green-400" /> Voice Calls
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MessageCircle className="w-4 h-4 text-blue-400" /> Unlimited Chat
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Heart className="w-4 h-4 text-red-400" /> Roleplay Scenarios
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Wand2 className="w-4 h-4 text-yellow-400" /> Full Customization
                </div>
              </div>
              
              <Button onClick={() => setCreatorOpen(true)}
                className="px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all">
                <Sparkles className="w-5 h-5 mr-2" /> Create Your AI - FREE
              </Button>
            </div>
            
            {/* Preview cards */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute top-0 left-0 w-40 h-52 rounded-xl overflow-hidden shadow-2xl shadow-pink-500/20 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-8 left-32 w-40 h-52 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-10">
                  <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-16 left-64 w-40 h-52 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=400&fit=crop" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white/30 text-xs text-center mt-8">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
        </div>
      </div>
      
      <CharacterCreator isOpen={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </section>
  );
};

export default CreateBanner;
