'use client';
import React from 'react';
import { Sparkles, Heart, Image, Video, MessageCircle, Phone } from 'lucide-react';

const AgeVerification = ({ onVerified }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#050507] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative bg-[#0a0a0c]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-md w-full text-center shadow-2xl">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Velvet
          </span>
          <span className="text-4xl font-bold text-white ml-1">AI</span>
        </div>
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-pink-400 mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold">100% FREE</span>
          <span className="text-white/50 text-sm">• All Features Unlocked</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          Age Verification Required
        </h2>
        <p className="text-white/60 mb-6">
          This website contains age-restricted content. You must be 18 years or older to enter.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-white/5 rounded-xl">
            <MessageCircle className="w-5 h-5 text-pink-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">Unlimited Chat</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <Image className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">Photo Gen</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <Video className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-white/60 text-xs">Video Gen</p>
          </div>
        </div>
        
        <button
          onClick={onVerified}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 mb-3"
        >
          I am 18 or older - Enter
        </button>
        
        <a href="https://google.com" className="block py-3 text-white/40 hover:text-white/60 transition-colors text-sm">
          I am under 18 - Leave
        </a>
        
        <p className="text-white/30 text-xs mt-6">
          By entering, you agree to our <a href="/terms" className="text-pink-400 hover:text-pink-300">Terms</a> and <a href="/privacy" className="text-pink-400 hover:text-pink-300">Privacy Policy</a>
        </p>
        
        <p className="text-white/20 text-xs mt-4 flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-400" fill="currentColor" /> by <span className="text-pink-400">LenstedReal</span>
        </p>
      </div>
    </div>
  );
};

export default AgeVerification;
