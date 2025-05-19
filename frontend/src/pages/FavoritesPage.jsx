import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaHeart } from 'react-icons/fa';
import api from '../api/axiosConfig';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/favorites');
        setFavorites(response.data.favorites);
        
        // Show initial spark animation after loading
        setTimeout(() => {
          setShowSparks(true);
          setTimeout(() => setShowSparks(false), 1500);
        }, 500);
        
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);

  const removeFavorite = async (moodLogId) => {
    setRemovingId(moodLogId);
    
    setTimeout(async () => {
      try {
        await api.delete(`/api/favorites/${moodLogId}`);
        
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== moodLogId));
      } catch (err) {
        console.error('Error removing favorite:', err);
        setError('Failed to remove from favorites');
        setRemovingId(null);
      }
    }, 300);
  };

  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': 'bg-yellow-300 border-yellow-500',
      'SAD': 'bg-blue-300 border-blue-500',
      'ANGRY': 'bg-red-400 border-red-600',
      'AFRAID': 'bg-purple-300 border-purple-500',
      'NEUTRAL': 'bg-gray-300 border-gray-500',
      'MANIC': 'bg-yellow-400 border-yellow-600',
      'DEPRESSED': 'bg-blue-400 border-blue-600',
      'FURIOUS': 'bg-red-600 border-red-800',
      'TERRIFIED': 'bg-purple-400 border-purple-600',
      'CALM': 'bg-green-300 border-green-500',
    };
    
    return moodColors[moodName] || 'bg-gray-300 border-gray-500';
  };

  const getMoodEmoji = (moodName) => {
    const moodEmojis = {
      'HAPPY': '😊',
      'SAD': '😢',
      'ANGRY': '😠',
      'AFRAID': '😨',
      'NEUTRAL': '😐',
      'MANIC': '😆',
      'DEPRESSED': '😔',
      'FURIOUS': '😡',
      'TERRIFIED': '😱',
      'CALM': '😌',
    };
    
    return moodEmojis[moodName] || '😐';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <FaStar className="absolute top-3 left-3 text-yellow-400 animate-pulse" size={24} />
        </div>
        <p className="font-mono font-bold">Loading favorite memories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 font-mono bg-white max-w-screen-xl">
      <div className="mb-6 md:mb-8 px-4 py-4 md:py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 flex items-center">
          <span className="mr-2">FAVORITE MEMORIES</span>
          <FaStar className="text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-sm text-gray-600">Your collection of special moments</p>
        
        {/* Animated sparkles when page loads */}
        {showSparks && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 animate-ping opacity-70">✨</div>
            <div className="absolute top-1/2 left-3/4 animate-ping opacity-70 delay-100">✨</div>
            <div className="absolute top-3/4 left-1/2 animate-ping opacity-70 delay-300">✨</div>
            <div className="absolute top-1/3 left-2/3 animate-ping opacity-70 delay-500">✨</div>
            <div className="absolute top-2/3 left-1/3 animate-ping opacity-70 delay-700">✨</div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 font-mono my-4">
          <p>{error}</p>
        </div>
      )}
      
      {favorites.length === 0 ? (
        <div className="text-center border-2 border-black p-10 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
              <FaStar size={32} className="text-gray-400 animate-pulse" />
            </div>
          </div>
          <p className="mb-4 font-bold text-lg">You don't have any favorites yet.</p>
          <p className="text-sm text-gray-600">
            Mark mood logs as favorites to see them here.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="animate-bounce">
              <FaHeart size={24} className="text-red-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map(favorite => (
            <div 
              key={favorite.id} 
              className={`border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                removingId === favorite.id ? 'animate-scale-out-center opacity-0' : 'animate-scale-in-center'
              }`}
              style={{ 
                animationDuration: removingId === favorite.id ? '0.3s' : '0.5s',
                animationDelay: `${favorites.indexOf(favorite) * 0.1}s`
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div 
                    className={`w-12 h-12 rounded-full ${getMoodColor(favorite.mood_name)} border-2 border-black mr-4 flex items-center justify-center relative shadow-md transition-transform hover:scale-110`}
                  >
                    <span className="text-xl">{getMoodEmoji(favorite.mood_name)}</span>
                    <FaStar size={12} className="absolute top-0 right-0 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{favorite.mood_name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(favorite.log_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="text-black hover:text-red-500 p-2 transition-transform hover:scale-110 group"
                  aria-label="Remove from favorites"
                >
                  <FaTrash size={18} className="group-hover:animate-shake" />
                </button>
              </div>
              
              {favorite.note && (
                <div className="mt-4 bg-gray-50 p-3 border-l-2 border-black animate-fade-in-right" style={{ animationDelay: `${favorites.indexOf(favorite) * 0.1 + 0.3}s` }}>
                  <p className="text-sm text-gray-800">{favorite.note}</p>
                </div>
              )}
              
              <div className="mt-3 pl-16 text-xs text-gray-500 flex items-center">
                <span className="text-yellow-400 mr-1">★</span> Favorite memory
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        @keyframes scale-in-center {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes scale-out-center {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes fade-in-right {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .animate-scale-in-center {
          animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
        
        .animate-scale-out-center {
          animation: scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out both;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FavoritesPage;