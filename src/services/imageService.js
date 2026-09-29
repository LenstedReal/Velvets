'use client';
/**
 * Image / Video service — calls real backend (Fal.ai under the hood).
 * Falls back gracefully if backend image gen is unavailable (e.g. quota).
 */
import { imgApi } from './api';

export const generateImage = async ({ characterId, prompt = '', style = 'realistic', nsfw = true } = {}) => {
  try {
    const res = await imgApi.generate({
      character_id: characterId || null,
      prompt,
      style,
      nsfw,
    });
    return {
      url: res.url,
      timestamp: new Date().toISOString(),
      id: res.media_id || 'img_' + Date.now(),
    };
  } catch (e) {
    const detail = e?.response?.data?.detail || e?.message || 'Image generation unavailable';
    throw new Error(detail);
  }
};

export const generateImageInChat = async ({ characterId, prompt = '', nsfw = true }) => {
  const res = await imgApi.inChat({ character_id: characterId, prompt, nsfw });
  return res;
};

// Video generation is not yet wired — kept as stub for UI
export const generateVideo = async () => {
  throw new Error('Video generation will be enabled soon');
};

export const imageService = {
  generateImage,
  generateImageInChat,
  generateVideo,
};

export default imageService;
