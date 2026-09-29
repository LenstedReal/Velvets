'use client';
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import StoriesBar from './components/StoriesBar';
import LiveSection from './components/LiveSection';
import CharactersSection from './components/CharactersSection';
import CreateBanner from './components/CreateBanner';
import FAQSection from './components/FAQSection';
import ContentSection from './components/ContentSection';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AgeVerification from './components/AgeVerification';
import MyAISection from './components/MyAISection';
import ImageGallery from './components/ImageGallery';
import GenerateImagePage from './components/GenerateImagePage';
import RoleplayPage from './components/RoleplayPage';
import RoulettePage from './components/RoulettePage';
import CharacterListPage from './components/CharacterListPage';
import CharacterDetailPage from './components/CharacterDetailPage';
import LiveActionPage from './components/LiveActionPage';

const HomePage = () => (
  <div className="min-h-screen bg-[#0a0a0c]">
    <Header />
    <main className="pt-16 pb-20 lg:pb-0">
      <HeroCarousel />
      <StoriesBar />
      <LiveSection />
      <CharactersSection />
      <CreateBanner />
      <FAQSection />
      <ContentSection />
    </main>
    <Footer />
    <BottomNav />
  </div>
);

const MyAIPage = () => (
  <div className="min-h-screen bg-[#0a0a0c]">
    <Header />
    <main className="pt-20 pb-20 lg:pb-0">
      <MyAISection />
    </main>
    <Footer />
    <BottomNav />
  </div>
);

const GalleryPage = () => (
  <div className="min-h-screen bg-[#0a0a0c]">
    <Header />
    <main className="pt-20 pb-20 lg:pb-0">
      <ImageGallery />
    </main>
    <Footer />
    <BottomNav />
  </div>
);

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('velvetai_age_verified');
    if (verified === 'true') setIsAgeVerified(true);
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem('velvetai_age_verified', 'true');
    setIsAgeVerified(true);
  };

  if (!isAgeVerified) return <AgeVerification onVerified={handleAgeVerified} />;

  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/girls" element={<CharacterListPage gender="female" style="realistic" />} />
            <Route path="/anime" element={<CharacterListPage style="anime" />} />
            <Route path="/guys" element={<CharacterListPage gender="male" />} />
            <Route path="/my-ai" element={<MyAIPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/generate" element={<GenerateImagePage />} />
            <Route path="/generate-image" element={<GenerateImagePage />} />
            <Route path="/roleplay" element={<RoleplayPage />} />
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="/live-action" element={<LiveActionPage />} />
            <Route path="/character/:id" element={<CharacterDetailPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
