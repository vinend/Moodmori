import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('LOADING');
  const [dots, setDots] = useState('');

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

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#1E1E1E] z-50">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-mono tracking-widest text-white">
          {loadingText}{dots}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;