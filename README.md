# VelvetAI — Next.js + FastAPI (Vercel)
- Frontend: Next.js 15 (app/ + src/). Tüm mevcut sayfa/bileşenler korundu; react-router, `app/[[...slug]]` altında istemci tarafında çalışır.
- Backend: FastAPI (`backend/`, giriş `api/index.py`), bağımlılıklar kök `requirements.txt` (edge-tts dahil). Testler: `requirements-dev.txt`.
- Lokal: `pip install -r requirements.txt && uvicorn server:app --app-dir backend --port 8000` + `npm i && npm run dev`.
- Vercel: Next.js otomatik algılanır. Ortam değişkenleri: DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY, CORS_ORIGINS (+ Discord anahtarları). `NEXT_PUBLIC_BACKEND_URL` boş bırakılır (aynı origin).
- CRA/craco/ajv bağımlılıkları kaldırıldığı için önceki `ajv/dist/compile/codegen` build hatası artık geçerli değil.
