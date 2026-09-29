'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, mode, setMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, loginWithGoogle, loginWithDiscord } = useAuth() || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setError('');
    try {
      if (mode === 'signup') {
        await signup?.(email, password);
      } else {
        await login?.(email, password);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google sign-in is coming soon. Use email & password for now.');
  };

  const handleDiscordLogin = () => {
    setError('Discord sign-in is coming soon. Use email & password for now.');
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#1a1a2e] border-white/10 p-8 max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to VelvetAI!</h2>
            <p className="text-white/60">All features are now unlocked. Enjoy!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 p-0 max-w-4xl overflow-hidden">
        <div className="flex">
          {/* Image Side */}
          <div className="hidden md:block w-1/2 relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80"
              alt="AI Character"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a2e]/90" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-white text-xl font-bold mb-2">All Features Unlocked</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Unlimited messages</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Photo & Video generation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Voice & Video calls</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Character creation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Roleplay scenarios</li>
              </ul>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Logo */}
            <div className="mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Velvet
              </span>
              <span className="text-2xl font-bold text-white ml-1">AI</span>
              <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 rounded text-emerald-400 text-xs font-bold">FREE</span>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-6">
              {mode === 'signup' ? 'Create Free Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-pink-500/50 h-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-pink-500/50 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-white/40" />
                  ) : (
                    <Eye className="w-5 h-5 text-white/40" />
                  )}
                </button>
              </div>

              {mode === 'signup' && (
                <p className="text-white/40 text-sm">Minimum 6 characters</p>
              )}

              {mode === 'login' && (
                <button type="button" className="text-pink-400 text-sm hover:text-pink-300">
                  Forgot password?
                </button>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isLoading ? 'Please wait...' : mode === 'signup' ? 'Create Free Account' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-white/40 text-center mb-4">
                or {mode === 'signup' ? 'continue' : 'sign in'} with
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDiscordLogin}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                  </svg>
                  Discord
                </Button>
              </div>
            </div>

            {mode === 'signup' && (
              <p className="text-white/40 text-xs text-center mt-6">
                By signing up, you agree to{' '}
                <a href="/terms" className="text-pink-400 hover:text-pink-300">
                  Terms of Service
                </a>
              </p>
            )}

            <p className="text-white/60 text-center mt-6">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                {mode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            {/* Branding */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-white/30 text-xs">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
