'use client';
/**
 * VelvetAI API client — axios instance with auth interceptor.
 */
import axios from 'axios';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('velvetai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // token expired — clear locally
      // (don't auto-redirect to preserve UX)
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (email, password, name) => api.post('/auth/register', { email, password, name }).then(r => r.data),
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  updateMe: (patch) => api.patch('/auth/me', patch).then(r => r.data),
};

// ─── Characters ────────────────────────────────────────────────────
export const charApi = {
  list: (params = {}) => api.get('/characters', { params }).then(r => r.data),
  get: (id) => api.get(`/characters/${id}`).then(r => r.data),
  create: (payload) => api.post('/characters', payload).then(r => r.data),
  remove: (id) => api.delete(`/characters/${id}`).then(r => r.data),
};

// ─── Conversations ─────────────────────────────────────────────────
export const convApi = {
  list: () => api.get('/conversations').then(r => r.data),
  create: (character_id) => api.post('/conversations', { character_id }).then(r => r.data),
  messages: (id) => api.get(`/conversations/${id}/messages`).then(r => r.data),
  remove: (id) => api.delete(`/conversations/${id}`).then(r => r.data),
};

// ─── Chat ──────────────────────────────────────────────────────────
export const chatApi = {
  send: (character_id, content, conversation_id) =>
    api.post('/chat/send', { character_id, content, conversation_id }).then(r => r.data),
};

/**
 * SSE streaming via fetch+ReadableStream (works through Cloudflare/ingress proxies
 * where EventSource is buffered or rewritten).
 * callbacks: { onMeta(meta), onDelta(text), onDone(asst), onError(e) }
 */
export const streamChat = ({ character_id, content, conversation_id, onMeta, onDelta, onMessageBubble, onDone, onError }) => {
  const token = localStorage.getItem('velvetai_token');
  if (!token) { onError?.(new Error('Not authenticated')); return () => {}; }
  const controller = new AbortController();

  (async () => {
    try {
      const resp = await fetch(`${API}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ character_id, content, conversation_id }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        onError?.(new Error(err.detail || 'Chat failed'));
        return;
      }
      const data = await resp.json();
      onMeta?.({ conversation_id: data.conversation_id, user_message: data.user_message });
      const bubbles = data.assistant_messages || (data.assistant_message ? [data.assistant_message] : []);
      // Deliver bubbles with realistic delays (candy.ai-style)
      for (let i = 0; i < bubbles.length; i++) {
        if (controller.signal.aborted) return;
        const bubble = bubbles[i];
        // Typing delay proportional to length, min 800ms, max 2500ms
        const typingDelay = Math.min(2500, Math.max(800, bubble.content.length * 25));
        await new Promise((r) => setTimeout(r, typingDelay));
        if (controller.signal.aborted) return;
        onMessageBubble?.(bubble);
      }
      onDone?.({ assistant_messages: bubbles });
    } catch (e) {
      if (e.name !== 'AbortError') onError?.(e);
    }
  })();

  return () => controller.abort();
};

// Proactive message — bot reaches out
export const proactiveCheck = async (character_id) => {
  const token = localStorage.getItem('velvetai_token');
  if (!token) return { messages: [] };
  try {
    const resp = await fetch(`${API}/chat/proactive?character_id=${character_id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!resp.ok) return { messages: [] };
    return await resp.json();
  } catch (_) {
    return { messages: [] };
  }
};

// Live action
export const performLiveAction = async (action, character_id) => {
  const token = localStorage.getItem('velvetai_token');
  const resp = await fetch(`${API}/live-action/perform?action=${encodeURIComponent(action)}&character_id=${character_id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Action failed');
  return await resp.json();
};

// ─── Images ────────────────────────────────────────────────────────
export const imgApi = {
  generate: (payload) => api.post('/images/generate', payload).then(r => r.data),
  inChat: (payload) => api.post('/images/chat', payload).then(r => r.data),
};

// ─── Voice ─────────────────────────────────────────────────────────
export const voiceApi = {
  tts: (payload) => api.post('/voice/tts', payload).then(r => r.data),
};

// ─── Media ─────────────────────────────────────────────────────────
export const mediaApi = {
  list: (type) => api.get('/media', { params: type ? { type } : {} }).then(r => r.data),
  remove: (id) => api.delete(`/media/${id}`).then(r => r.data),
  favorite: (id) => api.patch(`/media/${id}/favorite`).then(r => r.data),
};

// ─── Misc ──────────────────────────────────────────────────────────
export const miscApi = {
  scenarios: () => api.get('/scenarios').then(r => r.data),
  stories: () => api.get('/stories').then(r => r.data),
  live: () => api.get('/live').then(r => r.data),
  roulette: () => api.get('/roulette/spin').then(r => r.data),
};

export default api;
