import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('LOADING');
  const [dots, setDots] = useState('');
  const [showWhiteHand, setShowWhiteHand] = useState(true);

  // Handle dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return '';
        }
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Handle hand blinking animation
  useEffect(() => {
    const handInterval = setInterval(() => {
      setShowWhiteHand(prev => !prev);
    }, 800);

    return () => clearInterval(handInterval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-white z-50">
      {/* OMORI Eye */}
      <div className="mb-8 relative">
        <div className="w-24 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-8 h-8 bg-black rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
      
      {/* White hand cursor (OMORI style) */}
      <div className="relative mb-8">
        {showWhiteHand ? (
          <div className="w-10 h-10 relative">
            <div className="absolute bg-black w-3 h-8"></div> {/* Ganti putih jadi hitam */}
            <div className="absolute left-3 bg-black w-2 h-6"></div> {/* Ganti putih jadi hitam */}
            <div className="absolute left-5 bg-black w-2 h-7"></div> {/* Ganti putih jadi hitam */}
            <div className="absolute left-7 bg-black w-2 h-5"></div> {/* Ganti putih jadi hitam */}
          </div>
        ) : (
          <div className="w-10 h-10"></div>
        )}
      </div>
      
      {/* Loading text */}
      <div className="text-2xl font-mono tracking-widest text-black pixelated">
        {loadingText}{dots}
      </div>
      
      {/* OMORI style black line */}
      <div className="mt-8 w-40 h-1 bg-black"></div> {/* Ganti putih jadi hitam */}
    </div>
  );
};

export default LoadingScreen;
