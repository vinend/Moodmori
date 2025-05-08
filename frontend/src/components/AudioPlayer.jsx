import React, { useState, useEffect, forwardRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaStepForward, FaStepBackward, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const AudioPlayer = forwardRef(({ src, songName, onPrevious, onNext, onEnded }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Extract filename from path if songName is not provided
  const displayName = songName || (src ? src.split('/').pop().replace(/\.[^/.]+$/, '') : "OMORI OST");
  
  useEffect(() => {
    // Initialize audio
    if (ref && ref.current) {
      ref.current.volume = volume;
      
      const updateTime = () => setCurrentTime(ref.current.currentTime);
      const updateDuration = () => setDuration(ref.current.duration);
      
      ref.current.addEventListener('timeupdate', updateTime);
      ref.current.addEventListener('loadedmetadata', updateDuration);
      ref.current.addEventListener('ended', onEnded);
      
      return () => {
        // Check if ref still exists when unmounting
        if (ref && ref.current) {
          ref.current.removeEventListener('timeupdate', updateTime);
          ref.current.removeEventListener('loadedmetadata', updateDuration);
          ref.current.removeEventListener('ended', onEnded);
        }
      };
    }
  }, [onEnded, ref, volume]);
  
  useEffect(() => {
    // Update audio when src changes
    if (ref && ref.current) {
      setCurrentTime(0);
      // Always try to play when source changes
      ref.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Couldn't play audio:", err);
          setIsPlaying(false);
        });
    }
  }, [src, ref]);
  
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

  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    if (ref && ref.current) {
      ref.current.currentTime = newTime;
    }
  };

  const handlePrevious = () => {
    // Remember current playing state but don't pause
    const wasPlaying = isPlaying;
    
    if (onPrevious) {
      onPrevious();
    }
  };

  const handleNext = () => {
    // Remember current playing state but don't pause
    const wasPlaying = isPlaying;
    
    if (onNext) {
      onNext();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-white border-2 border-black rounded shadow-md flex flex-col ${isCollapsed ? 'w-16 p-2' : 'w-80 p-3'} transition-all duration-300`}>
      <audio ref={ref} src={src} onEnded={onEnded} />
      
      {/* Header section with collapse button and song title */}
      <div className="relative flex items-center mb-3">
        {/* Collapse toggle button - moved to the left side for better access */}
        <button 
          onClick={toggleCollapse}
          className="text-black hover:text-gray-700 focus:outline-none mr-2 z-10"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>

        {/* Song name display with marquee effect - only show when expanded */}
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden h-6">
            <div className={`whitespace-nowrap text-sm font-medium ${displayName.length > 20 ? 'animate-marquee' : 'text-center'}`}>
              {displayName}
            </div>
          </div>
        )}
      </div>
      
      {/* Expanded view content */}
      {!isCollapsed && (
        <>
          {/* Progress bar */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8 text-left">{formatTime(duration)}</span>
          </div>
          
          {/* Controls - increased spacing and padding for better touch targets */}
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={handlePrevious}
              className="text-black hover:text-gray-700 focus:outline-none p-2"
              aria-label="Previous"
            >
              <FaStepBackward size={18} />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="text-black hover:text-gray-700 focus:outline-none p-2"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} />}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-black hover:text-gray-700 focus:outline-none p-2"
              aria-label="Next"
            >
              <FaStepForward size={18} />
            </button>
            
            <button 
              onClick={toggleMute}
              className="text-black hover:text-gray-700 focus:outline-none p-2"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
            </button>
          </div>
        </>
      )}
      
      {/* Collapsed view - only show play/pause button */}
      {isCollapsed && (
        <div className="flex justify-center">
          <button 
            onClick={togglePlayPause}
            className="text-black hover:text-gray-700 focus:outline-none p-1"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} />}
          </button>
        </div>
      )}
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;