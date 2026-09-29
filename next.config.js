/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV === 'development';
module.exports = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // /api -> FastAPI. Lokal: uvicorn (8000). Vercel: api/index.py. beforeFiles: SPA catch-all'dan önce çalışır.
  async rewrites() {
    return { beforeFiles: [{ source: '/api/:path*', destination: dev ? 'http://127.0.0.1:8000/api/:path*' : '/api/index' }] };
  },
};
