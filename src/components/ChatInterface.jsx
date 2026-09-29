'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, Send, Image as ImageIcon, Video, Mic, Phone, Heart, Camera, Play, Loader2, AlertCircle } from 'lucide-react';
import { generateImageInChat } from '../services/imageService';
import { streamChat, chatApi, convApi, voiceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatInterface = ({ isOpen, onClose, character }) => {
  const { addXP, user } = useAuth() || {};
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [generatingMedia, setGeneratingMedia] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const messagesEndRef = useRef(null);
  const closeStreamRef = useRef(null);
  const audioRef = useRef(null);

  // Load history when opened (only depends on isOpen + character.id, NOT user — to avoid aborting in-flight requests when XP updates)
  useEffect(() => {
    if (!isOpen || !character) return;
    const token = localStorage.getItem('velvetai_token');
    if (!token) { setError('Loading...'); return; }
    setError(null);
    convApi.create(character.id)
      .then(async (conv) => {
        setConversationId(conv.id);
        const msgs = await convApi.messages(conv.id);
        setMessages(msgs.map(m => ({
          id: m.id,
          type: m.role === 'user' ? 'sent' : 'received',
          text: m.content,
          media: m.media_url ? { type: m.media_type, url: m.media_url } : null,
          time: 'earlier',
        })));
      })
      .catch((e) => {
        setError(e?.response?.data?.detail || 'Could not load chat');
      });
    // Do NOT abort stream on cleanup — let it complete in background
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, character?.id]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, streamingText]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || isTyping || !character) return;
    setInputText('');
    setError(null);
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const userMsg = { id: 'tmp-' + Date.now(), type: 'sent', text, time: ts, read: false };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setStreamingText('');

    streamChat({
      character_id: character.id,
      content: text,
      conversation_id: conversationId,
      onMeta: (m) => {
        if (m.conversation_id) setConversationId(m.conversation_id);
        // mark user msg as read once bot received
        setMessages(prev => prev.map(msg => msg.id === userMsg.id ? { ...msg, read: true } : msg));
      },
      onMessageBubble: (bubble) => {
        // Add each bubble as it arrives (with built-in delay from api.js)
        const bts = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        setMessages(prev => [...prev, {
          id: bubble.id,
          type: 'received',
          text: bubble.content,
          time: bts,
        }]);
      },
      onDone: () => {
        setIsTyping(false);
        setStreamingText('');
        addXP?.(10);
      },
      onError: (e) => {
        setIsTyping(false);
        setStreamingText('');
        setError(e?.message || 'Connection lost — try again');
      },
    });
  };

  const requestPhoto = async () => {
    if (!character || generatingMedia || !user) {
      if (!user) setError('Please sign in to generate photos');
      return;
    }
    setMessages(prev => [...prev, { id: 'tmp-' + Date.now(), type: 'sent', text: 'Can you send me a photo? 📸', time: 'now' }]);
    setGeneratingMedia('photo');
    setError(null);
    try {
      const res = await generateImageInChat({ characterId: character.id, prompt: 'sexy selfie', nsfw: true });
      setMessages(prev => [...prev, {
        id: res.message.id,
        type: 'received',
        text: res.message.content,
        media: { type: 'image', url: res.url },
        time: 'now',
      }]);
      addXP?.(25);
    } catch (e) {
      setError(e.message || 'Photo unavailable right now');
    } finally {
      setGeneratingMedia(null);
    }
  };

  const requestVoice = async () => {
    if (!user) { setError('Please sign in for voice'); return; }
    const lastReceived = [...messages].reverse().find(m => m.type === 'received' && m.text);
    if (!lastReceived) { setError('Send a message first'); return; }
    setPlayingAudio(true);
    setError(null);
    try {
      const res = await voiceApi.tts({ text: lastReceived.text, character_id: character.id });
      if (res.audio_b64) {
        const audio = new Audio(`data:${res.mime};base64,${res.audio_b64}`);
        audioRef.current = audio;
        audio.onended = () => setPlayingAudio(false);
        await audio.play();
      } else {
        setPlayingAudio(false);
      }
    } catch (e) {
      setPlayingAudio(false);
      setError(e?.response?.data?.detail?.slice?.(0, 120) || 'Voice unavailable');
    }
  };

  const requestVideo = () => setError('Video generation is coming soon');
  const requestCall = () => setError('Live voice call is coming soon');
  const requestRoleplay = () => setInputText('*lean in close* Let\'s try a roleplay... ');

  if (!character) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0c] border-purple-500/20 max-w-lg h-[650px] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-[#1a1a2e] to-[#0a0a0c]">
          <div className="relative">
            <img src={character.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/50" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0a0c]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold flex items-center gap-2">{character.name}
              <span className="px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-300 text-xs">Lv.{character.level || 1}</span>
            </h3>
            <p className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button data-testid="chat-call-btn" onClick={requestCall} className="p-2 hover:bg-white/10 rounded-full"><Phone className="w-5 h-5 text-white/60 hover:text-green-400" /></button>
            <button data-testid="chat-video-btn" onClick={requestVideo} className="p-2 hover:bg-white/10 rounded-full"><Video className="w-5 h-5 text-white/60 hover:text-pink-400" /></button>
            <button data-testid="chat-close-btn" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white/60" /></button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div className={`px-4 py-2.5 rounded-2xl ${msg.type === 'sent' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-white/10'} text-white`}>
                  {msg.media?.url && (
                    <img src={msg.media.url} alt="" className="w-full rounded-lg mb-2" />
                  )}
                  <p className="whitespace-pre-wrap text-[15px] leading-snug">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 text-[10px] text-white/40 ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.time}</span>
                  {msg.type === 'sent' && (
                    msg.read
                      ? <span className="text-blue-400 text-xs leading-none">✓✓</span>
                      : <span className="text-white/40 text-xs leading-none">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {generatingMedia && (
            <div className="flex justify-start">
              <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                <span className="text-white/70 text-sm">Generating photo... (may take 20-40s)</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          <Button data-testid="quick-photo" onClick={requestPhoto} size="sm" variant="outline" disabled={isTyping || !!generatingMedia}
            className="bg-pink-500/10 border-pink-500/30 text-white text-xs hover:bg-pink-500/20 disabled:opacity-50">
            <Camera className="w-4 h-4 mr-1" /> Photo
          </Button>
          <Button data-testid="quick-video" onClick={requestVideo} size="sm" variant="outline"
            className="bg-purple-500/10 border-purple-500/30 text-white text-xs hover:bg-purple-500/20">
            <Video className="w-4 h-4 mr-1" /> Video
          </Button>
          <Button data-testid="quick-voice" onClick={requestVoice} size="sm" variant="outline" disabled={playingAudio}
            className="bg-blue-500/10 border-blue-500/30 text-white text-xs hover:bg-blue-500/20 disabled:opacity-50">
            {playingAudio ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Mic className="w-4 h-4 mr-1" />} Voice
          </Button>
          <Button data-testid="quick-roleplay" onClick={requestRoleplay} size="sm" variant="outline"
            className="bg-red-500/10 border-red-500/30 text-white text-xs hover:bg-red-500/20">
            <Heart className="w-4 h-4 mr-1" /> Roleplay
          </Button>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input data-testid="chat-input" type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={`Message ${character.name}...`}
              disabled={isTyping}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-pink-500/50 outline-none disabled:opacity-50" />
            <Button data-testid="chat-send-btn" onClick={sendMessage} disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-4">
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-white/30 text-xs text-center mt-2">Made with ❤️ by LenstedReal</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInterface;
