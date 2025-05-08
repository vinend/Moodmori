import React, { useState, useEffect, forwardRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const AudioPlayer = forwardRef(({ src, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  
  useEffect(() => {
    // Initialize audio
    if (ref && ref.current) {
      ref.current.volume = volume;
      
      // Auto-play is often blocked by browsers, so we don't auto-start
      ref.current.addEventListener('ended', onEnded);
      
      return () => {
        // Check if ref still exists when unmounting
        if (ref && ref.current) {
          ref.current.removeEventListener('ended', onEnded);
        }
      };
    }
  }, [onEnded, ref, volume]);
  
  useEffect(() => {
    // Update audio when src changes
    if (ref && ref.current && isPlaying) {
      ref.current.play().catch(err => console.error("Couldn't play audio:", err));
    }
  }, [src, isPlaying, ref]);
  
  const togglePlayPause = () => {
    if (ref && ref.current) {
      if (isPlaying) {
        ref.current.pause();
      } else {
        ref.current.play().catch(err => console.error("Couldn't play audio:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (ref && ref.current) {
      ref.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-black p-2 rounded shadow-md flex items-center space-x-2">
      <audio ref={ref} src={src} onEnded={onEnded} />
      
      <button 
        onClick={togglePlayPause}
        className="text-black hover:text-gray-700 focus:outline-none"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
      </button>
      
      <button 
        onClick={toggleMute}
        className="text-black hover:text-gray-700 focus:outline-none"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </button>
      
      <span className="text-xs font-mono">OMORI OST</span>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;