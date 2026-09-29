'use client';
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import CharactersSection from './CharactersSection';

const CharacterListPage = ({ gender, style }) => (
  <div className="min-h-screen bg-[#0a0a0c]">
    <Header />
    <main className="pt-20 pb-20 lg:pb-12">
      <CharactersSection filterGender={gender} filterStyle={style} />
    </main>
    <Footer />
    <BottomNav />
  </div>
);

export default CharacterListPage;
