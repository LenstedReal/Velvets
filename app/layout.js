import '@/index.css';

export const metadata = {
  title: 'VelvetAI — Your AI Companion',
  description: 'VelvetAI — Your perfect AI companion. Chat, generate images, voice calls — 100% free.',
};
export const viewport = { themeColor: '#0a0a0c', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
