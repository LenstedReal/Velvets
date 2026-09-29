'use client';
import React, { useState } from 'react';
import { Home, User, Image, MessageCircle, PlusCircle, Grid, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import CharacterCreator from './CharacterCreator';

const BottomNav = () => {
  const { user } = useAuth() || {};
  const [authOpen, setAuthOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', href: '/', active: window.location.pathname === '/' },
    { icon: Sparkles, label: 'Live', href: '/live-action', active: window.location.pathname === '/live-action', isHot: true },
    { icon: PlusCircle, label: 'Create', action: () => setCreatorOpen(true), isCreate: true },
    { icon: Image, label: 'Gallery', href: '/gallery', active: window.location.pathname === '/gallery' },
    { icon: user ? MessageCircle : User, label: user ? 'My AI' : 'Login', 
      href: user ? '/my-ai' : undefined, 
      action: user ? undefined : () => setAuthOpen(true),
      active: window.location.pathname === '/my-ai' 
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0c]/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            item.isCreate ? (
              <button key={item.label} onClick={item.action}
                className="flex flex-col items-center justify-center -mt-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </button>
            ) : item.action ? (
              <button key={item.label} onClick={item.action}
                className={`flex flex-col items-center gap-0.5 p-2 ${item.active ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ) : (
              <a key={item.label} href={item.href}
                className={`relative flex flex-col items-center gap-0.5 p-2 ${item.active ? 'text-pink-400' : 'text-white/50 hover:text-white'}`}>
                {item.isHot && <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </a>
            )
          ))}
        </div>
      </nav>
      
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} mode="signup" setMode={() => {}} />
      <CharacterCreator isOpen={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </>
  );
};

export default BottomNav;
