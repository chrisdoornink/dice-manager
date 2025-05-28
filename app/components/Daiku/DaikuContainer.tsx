'use client';

import React, { useState } from 'react';
import SplashScreen from './index';
import MainPage from './MainPage';

const DaikuContainer: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onSplashComplete={handleSplashComplete} />}
      {!showSplash && <MainPage />}
    </>
  );
};

export default DaikuContainer;
