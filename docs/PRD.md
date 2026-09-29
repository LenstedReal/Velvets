# VelvetAI — PRD (Updated June 2026)

## Status
- ✅ Backend production-ready (FastAPI + **PostgreSQL** + OpenRouter + Pollinations + Edge-TTS)
- ✅ **DATABASE MIGRATED: MongoDB → PostgreSQL (June 2026)** — custom JSONB adapter at backend/pg_database.py mimics Motor API; 38/38 backend regression tests passed (iteration_2.json). Postgres runs under supervisor as `postgresql`. Reason: user refused MongoDB Atlas; Neon Postgres is free & built into Vercel dashboard (Storage → Create Database).
- ✅ Frontend with 11 routes, real backend wiring
- ✅ Guest auth (auto device-based) — no login required
- ✅ Discord OAuth login WORKING (tested June 2026; earlier 405 was a wrong-method curl test, not a real bug)
- ✅ 31 characters with candy.ai-style curated images
- ✅ Real LLM chat (sao10k/l3.1-euryale-70b uncensored), multi-bubble, read receipts, timestamps
- ✅ FREE image gen (Pollinations.ai, no key) + FREE TTS (Edge-TTS, no key)
- ✅ Live Action page with XP/Levels
- ✅ Hardcoded FRONTEND URL moved to FRONTEND_URL env var (Vercel-safe)
- ✅ ALL Emergent remnants REMOVED (June 2026): emergent-main.js, debug-monitor.js, emergent-badge, PostHog analytics, unused testIds folder — grep verified zero matches
- ✅ Branding preserved (LenstedReal + contact@velvetai.com + © 2027 + Visa/Mastercard)

## Tech Stack
React 19 + Tailwind + shadcn/ui + framer-motion + axios | FastAPI + Motor + httpx + bcrypt + JWT + sse-starlette | OpenRouter (LLM) + Pollinations.ai (images, free) + Edge-TTS (voice, free) + Discord OAuth

## External Service Status
- OpenRouter (LLM): ✅ Active (user key in backend/.env)
- Pollinations.ai (image gen): ✅ Free, no key, tested working
- Edge-TTS (voice): ✅ Free, no key, tested working
- Discord OAuth: ✅ Client ID 1493592728850792468 + Secret in backend/.env; redirect URI must be added in Discord Dev Portal per deployment domain

## Env Vars (needed for Vercel deploy)
Backend: **DATABASE_URL** (Neon Postgres from Vercel Storage tab), CORS_ORIGINS, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_HOURS, OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL, APP_NAME, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, FRONTEND_URL
Frontend: REACT_APP_BACKEND_URL
Note: MONGO_URL/DB_NAME remain in preview .env but are UNUSED (kept per platform rules).

## Files Map
Backend: server.py, models.py, auth_utils.py, llm_service.py, image_service.py, voice_service.py, seed_data.py, image_overrides.py
Frontend: App.js, context/AuthContext.jsx (auto-guest + discord_token URL handling), services/api.js, components — HeroCarousel, StoriesBar, LiveSection, CharactersSection, CharacterProfile, CharacterDetailPage, CharacterCreator, ChatInterface, MyAISection, ImageGallery, GenerateImagePage, RoleplayPage, RoulettePage, LiveActionPage, AuthModal

## Backlog
- P1: Vercel deployment (user has env var list; MongoDB Atlas needed; Discord redirect URI update needed)
- P2: Proactive messaging ("I miss you" after 24h inactivity)
- P2: User Profile / Settings page completion
- P3: Live audio call (WebRTC), Candy Shorts feed, PWA push, i18n
- Future (VPS only, NOT Vercel-compatible): Groq LLM, ChromaDB RAG memory, Redis sessions, Celery queue — user proposed this architecture; agreed to defer since Vercel serverless can't run persistent processes

## Preserved Branding (NEVER change)
- "Made with ❤️ by LenstedReal"
- contact@velvetai.com (Footer + FAQ)
- © 2027 VelvetAI by LenstedReal
- Visa + Mastercard sponsor logos
- "100% FREE" badges
- No Emergent references/watermarks
