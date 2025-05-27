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
  const displayName = songName || (src ? src.split('/').pop().replace(/\.[^/.]+$/, '') : "TRACK NAME");
  
  useEffect(() => {
    // Initialize audio
    if (!ref || !ref.current) return; // Ensure ref is defined before accessing currentTime
    ref.current.volume = volume;
      
    const updateTime = () => setCurrentTime(ref.current?.currentTime || 0);
    const updateDuration = () => setDuration(ref.current?.duration || 0);
      
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
    <div className={`fixed bottom-4 right-4 z-50 bg-white border-2 border-black rounded-none shadow-omori-default flex flex-col ${isCollapsed ? 'w-16 p-2' : 'w-80 p-3'} transition-all duration-300`}>
      <audio ref={ref} src={src} onEnded={onEnded} />
      
      {/* Header section with collapse button and song title */}
      <div className="relative flex items-center mb-3">
        {/* Collapse toggle button */}
        <button 
          onClick={toggleCollapse}
          className="text-black hover:bg-gray-200 focus:outline-none mr-2 z-10 p-1"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>

        {/* Song name display - only show when expanded */}
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden h-6">
            <div className={`whitespace-nowrap text-black font-medium ${displayName.length > 20 ? 'animate-marquee' : 'text-center'} text-sm`}>
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
            <span className="text-black text-xs w-8 text-right font-bold">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1 h-2 bg-gray-300 rounded-none appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000000 ${(currentTime / (duration || 1)) * 100}%, #D1D5DB ${(currentTime / (duration || 1)) * 100}%)`, // D1D5DB is gray-300
              }}
            />
            <span className="text-black text-xs w-8 text-left font-bold">{formatTime(duration)}</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between px-1">
            <button 
              onClick={handlePrevious}
              className="text-black bg-white border-2 border-black hover:bg-black hover:text-white focus:outline-none p-2 rounded-none shadow-omori-default active:translate-y-px active:shadow-sm"
              aria-label="Previous"
            >
              <FaStepBackward size={16} />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="text-white bg-black hover:bg-gray-700 focus:outline-none p-3 rounded-none border-2 border-black shadow-omori-default active:translate-y-px active:shadow-sm"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-0.5" />} {/* Adjusted icon alignment */}
            </button>
            
            <button 
              onClick={handleNext}
              className="text-black bg-white border-2 border-black hover:bg-black hover:text-white focus:outline-none p-2 rounded-none shadow-omori-default active:translate-y-px active:shadow-sm"
              aria-label="Next"
            >
              <FaStepForward size={16} />
            </button>
            
            <button 
              onClick={toggleMute}
              className="text-black bg-white border-2 border-black hover:bg-black hover:text-white focus:outline-none p-2 rounded-none shadow-omori-default active:translate-y-px active:shadow-sm"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </button>
          </div>
        </>
      )}
      
      {/* Collapsed view - only show play/pause button */}
      {isCollapsed && (
        <div className="flex justify-center items-center h-full">
          <button 
            onClick={togglePlayPause}
            className="text-white bg-black hover:bg-gray-700 focus:outline-none p-2 rounded-none border-2 border-black shadow-omori-default active:translate-y-px active:shadow-sm"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-0.5" />}
          </button>
        </div>
      )}
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
