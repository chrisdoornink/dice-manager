'use client';

import React, { useState, useEffect } from "react";
import { Press_Start_2P } from 'next/font/google';
import SplashScreen from './index';
import MainPage from './MainPage';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap', // Ensures text is visible while font loads
  variable: '--font-press-start-2p', // Optional: if you want to use it as a CSS variable
});

const DaikuContainer: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    // Apply the font class to a high-level container if you want it to be generally available,
    // or pass pressStart2P.className to specific components like the button.
    // For now, let's add it to the main container here to see its effect.
    // Later, we can refine this to only target the button if needed.
    <main className={`${pressStart2P.variable} ${pressStart2P.className}`}>
      <>
        {showSplash && <SplashScreen onSplashComplete={handleSplashComplete} />}
        {!showSplash && <MainPage />}
      </>
    </main>
  );
};

export default DaikuContainer;
