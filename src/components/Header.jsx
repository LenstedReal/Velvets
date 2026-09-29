'use client';
import React, { useState } from 'react';
import { Menu, X, Sparkles, User, Image, MessageCircle, LogOut, Settings } from 'lucide-react';
import { navLinks } from '../data/mockData';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import CharacterCreator from './CharacterCreator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [creatorOpen, setCreatorOpen] = useState(false);
  const { user, logout } = useAuth() || {};

  const handleLogout = () => {
    logout?.();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>

            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Velvet</span>
              <span className="text-2xl font-bold text-white">AI</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-xs font-bold ml-2">100% FREE</span>
            </a>

            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-white/70 hover:text-white transition-colors font-medium text-sm">{link.name}</a>
              ))}
              <a href="/live-action" className="text-pink-400 hover:text-pink-300 transition-colors font-medium flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" /> Live Action
              </a>
              <a href="/roleplay" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Roleplay</a>
              <a href="/roulette" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Roulette</a>
              <a href="/generate" className="text-white/70 hover:text-white transition-colors font-medium flex items-center gap-1.5 text-sm">
                <Image className="w-4 h-4" /> Generate
              </a>
              <button onClick={() => setCreatorOpen(true)} className="text-pink-400 hover:text-pink-300 transition-colors font-medium flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4" /> Create AI
              </button>
              <a href="/gallery" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Gallery</a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" />
                      <span className="hidden sm:block text-white text-sm font-medium">{user.name}</span>
                      <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 rounded-full text-purple-300 text-xs">
                        Lv.{user.level}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#1a1a2e] border-white/10">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-sm">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${(user.xp % 1000) / 10}%` }} />
                        </div>
                        <span className="text-white/50 text-xs">{user.xp} XP</span>
                      </div>
                    </div>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer" asChild>
                      <a href="/my-ai"><MessageCircle className="w-4 h-4 mr-2" /> My AI Characters</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer" asChild>
                      <a href="/gallery"><Image className="w-4 h-4 mr-2" /> Gallery</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 text-sm"
                    onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>
                    Login
                  </Button>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 px-4 py-2 rounded-full font-medium text-sm"
                    onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}>
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0c] border-t border-white/5">
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg">{link.name}</a>
              ))}
              <button onClick={() => { setCreatorOpen(true); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-pink-400 hover:bg-white/5 rounded-lg">
                <Sparkles className="w-4 h-4 inline mr-2" /> Create AI
              </button>
              <a href="/gallery" className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                <Image className="w-4 h-4 inline mr-2" /> Gallery
              </a>
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} setMode={setAuthMode} />
      <CharacterCreator isOpen={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </>
  );
};

export default Header;
