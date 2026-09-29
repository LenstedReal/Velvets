'use client';
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { authApi, charApi } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myCharacters, setMyCharacters] = useState([]);
  const [authError, setAuthError] = useState(null);

  // bootstrap from token (auto-create guest if none)
  useEffect(() => {
    // Check if Discord OAuth returned with token in URL
    const url = new URL(window.location.href);
    const discordToken = url.searchParams.get('discord_token');
    if (discordToken) {
      localStorage.setItem('velvetai_token', discordToken);
      // Clean URL
      url.searchParams.delete('discord_token');
      window.history.replaceState({}, '', url.pathname + url.search);
      authApi.me()
        .then((u) => { setUser(u); return refreshMyCharacters(); })
        .catch(() => createGuest())
        .finally(() => setIsLoading(false));
      return;
    }
    const discordError = url.searchParams.get('discord_error');
    if (discordError) {
      setAuthError(`Discord login failed: ${discordError}`);
      url.searchParams.delete('discord_error');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
    const token = localStorage.getItem('velvetai_token');
    if (token) {
      authApi.me()
        .then((u) => { setUser(u); return refreshMyCharacters(); })
        .catch(() => { localStorage.removeItem('velvetai_token'); createGuest(); })
        .finally(() => setIsLoading(false));
    } else {
      createGuest().finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createGuest = async () => {
    try {
      // Use a stable device_id so guests survive reloads
      let deviceId = localStorage.getItem('velvetai_device_id');
      if (!deviceId) {
        deviceId = 'g_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('velvetai_device_id', deviceId);
      }
      const guestEmail = `${deviceId}@guest.velvetai.app`;
      const guestPassword = deviceId + '_VELVET_2026';
      // Try login first, fallback to register
      try {
        const { access_token, user: u } = await authApi.login(guestEmail, guestPassword);
        localStorage.setItem('velvetai_token', access_token);
        setUser({ ...u, is_guest: true });
      } catch (_) {
        const { access_token, user: u } = await authApi.register(guestEmail, guestPassword, 'Guest');
        localStorage.setItem('velvetai_token', access_token);
        setUser({ ...u, is_guest: true });
      }
      await refreshMyCharacters();
    } catch (e) {
      // ignore — user can manually log in
    }
  };

  const refreshMyCharacters = useCallback(async () => {
    try {
      const chars = await charApi.list({ owner: 'me' });
      setMyCharacters(chars);
      return chars;
    } catch (_) { return []; }
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { access_token, user: u } = await authApi.login(email, password);
      localStorage.setItem('velvetai_token', access_token);
      setUser(u);
      await refreshMyCharacters();
      return u;
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Invalid email or password';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (email, password, name) => {
    setAuthError(null);
    try {
      const { access_token, user: u } = await authApi.register(email, password, name);
      localStorage.setItem('velvetai_token', access_token);
      setUser(u);
      await refreshMyCharacters();
      return u;
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Could not create account';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('velvetai_token');
    localStorage.removeItem('velvetai_device_id');
    setUser(null);
    setMyCharacters([]);
    createGuest();
  };

  const addXP = useCallback((amount) => {
    if (user) setUser((u) => ({ ...u, xp: (u.xp || 0) + amount }));
  }, [user]);

  const addCharacter = async (payload) => {
    const created = await charApi.create(payload);
    setMyCharacters((prev) => [created, ...prev]);
    return created;
  };

  const removeCharacter = async (id) => {
    await charApi.remove(id);
    setMyCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, authError, myCharacters,
      login, signup, logout,
      loginWithGoogle: () => { setAuthError('Google sign-in is coming soon'); throw new Error('Google sign-in coming soon'); },
      loginWithDiscord: () => {
        // Redirect to backend Discord OAuth flow
        const API = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
        window.location.href = `${API}/api/auth/discord/login`;
      },
      addXP, addCharacter, removeCharacter, refreshMyCharacters,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
