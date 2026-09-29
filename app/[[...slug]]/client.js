'use client';
// Mevcut react-router tabanlı uygulama, Next.js içinde yalnızca tarayıcıda çalışır (SPA modu).
import dynamic from 'next/dynamic';
const App = dynamic(() => import('@/App'), { ssr: false });
export default function ClientApp() { return <App />; }
