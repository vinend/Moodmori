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
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black z-50"> {/* Changed bg to black */}
      {/* OMORI Eye */}
      <div className="mb-8 relative">
        {/* Outer eye shape */}
        <div className="w-24 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center overflow-hidden"> {/* Changed bg to black, border to white */}
          {/* Pupil */}
          <div className="w-8 h-8 bg-white rounded-full relative"> {/* Changed bg to white */}
            {/* Pupil highlight */}
            <div className="w-4 h-4 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div> {/* Changed bg to black */}
          </div>
        </div>
      </div>
      
      {/* White hand cursor (OMORI style) */}
      <div className="relative mb-8 h-10 w-10"> {/* Added fixed height/width to parent for stability */}
        {showWhiteHand ? (
          <div className="w-10 h-10 relative">
            <div className="absolute bg-white w-3 h-8"></div> {/* Changed to white */}
            <div className="absolute left-3 bg-white w-2 h-6"></div> {/* Changed to white */}
            <div className="absolute left-5 bg-white w-2 h-7"></div> {/* Changed to white */}
            <div className="absolute left-7 bg-white w-2 h-5"></div> {/* Changed to white */}
          </div>
        ) : (
          <div className="w-10 h-10"></div> /* Placeholder for consistent spacing */
        )}
      </div>
      
      {/* Loading text */}
      <div className="text-2xl font-mono tracking-widest text-white"> {/* Changed text to white, removed undefined 'pixelated' class */}
        {loadingText}{dots}
      </div>
      
      {/* OMORI style white line */}
      <div className="mt-8 w-40 h-1 bg-white"></div> {/* Changed to white */}
    </div>
  );
};

export default LoadingScreen;
