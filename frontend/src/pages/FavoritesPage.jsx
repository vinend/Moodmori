import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaHeart } from 'react-icons/fa'; // Combined imports
import api from '../api/axiosConfig';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null); // For exit animation
  const [showSparks, setShowSparks] = useState(false); // For initial page load animation

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/favorites");
        setFavorites(response.data.favorites);

        // Show initial spark animation after loading (from fe-aliya)
        setTimeout(() => {
          setShowSparks(true);
          setTimeout(() => setShowSparks(false), 1500); // Duration of sparks
        }, 500); // Delay before sparks appear

      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (moodLogId) => {
    setRemovingId(moodLogId); // Trigger exit animation (fe-aliya's approach)

    setTimeout(async () => { // Delay to allow animation to play
      try {
        await api.delete(`/api/favorites/${moodLogId}`);
        setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== moodLogId));
        // setRemovingId(null); // Reset after actual removal if needed, though component unmounts
      } catch (err) {
        console.error('Error removing favorite:', err);
        setError('Failed to remove from favorites');
        setRemovingId(null); // Reset on error so item doesn't stay invisible
      }
    }, 300); // Animation duration
  };

  // Using fe-aliya's getMoodColor which includes borders
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

  // Using fe-aliya's getMoodEmoji
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
    // fe-aliya's styled loading state
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white py-12"> {/* Full screen height */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <FaStar className="absolute top-3 left-3 text-yellow-400 animate-pulse" size={24} />
        </div>
        <p className="font-mono font-bold">Loading favorite memories...</p>
      </div>
    );
  }

  return (
    // fe-aliya's page structure and styling
    <div className="container mx-auto px-3 sm:px-4 py-4 font-mono bg-white max-w-screen-xl">
      <div className="mb-6 md:mb-8 px-4 py-4 md:py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 flex items-center text-black">
          <span className="mr-2">FAVORITE MEMORIES</span>
          <FaStar className="text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-sm text-gray-600">Your collection of special moments</p>

        {/* Animated sparkles from fe-aliya */}
        {showSparks && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-ping opacity-70 text-yellow-400"
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        animationDelay: `${Math.random() * 1}s`,
                        fontSize: `${Math.random() * 0.5 + 0.75}rem` // Randomize sparkle size a bit
                    }}
                >✨</div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 border-2 border-red-500 bg-red-100 text-red-700 font-mono my-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {favorites.length === 0 && !loading ? ( // Ensure not to show if still loading
        // fe-aliya's styled empty state
        <div className="text-center border-2 border-black p-10 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-md">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center">
              <FaStar size={32} className="text-gray-400 animate-pulse" />
            </div>
          </div>
          <p className="mb-4 font-bold text-lg text-black">You don't have any favorites yet.</p>
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
          {favorites.map((favorite, index) => (
            <div
              key={favorite.id}
              // Card styling and animation from fe-aliya
              className={`border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-md ${
                removingId === favorite.id ? 'animate-scale-out-center opacity-0' : 'animate-scale-in-center'
              }`}
              style={{
                animationDuration: removingId === favorite.id ? '0.3s' : '0.5s',
                // Staggered entrance animation from fe-aliya
                animationDelay: removingId !== favorite.id ? `${index * 0.07}s` : '0s'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {/* Mood display with emoji from fe-aliya */}
                  <div
                    className={`w-12 h-12 rounded-full ${getMoodColor(favorite.mood_name)} border-2 border-black mr-4 flex items-center justify-center relative shadow-md transition-transform hover:scale-110`}
                  >
                    <span className="text-xl">{getMoodEmoji(favorite.mood_name)}</span>
                    <FaStar size={12} className="absolute -top-1 -right-1 text-yellow-400 " /> {/* Adjusted star position */}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-black">{favorite.mood_name}</p>
                    <p className="text-xs text-gray-700"> {/* Slightly darker gray for date */}
                      {new Date(favorite.log_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Remove button from fe-aliya with shake animation */}
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="text-gray-500 hover:text-red-600 p-2 transition-colors duration-200 hover:scale-110 group rounded-full"
                  aria-label="Remove from favorites"
                >
                  <FaTrash size={18} className="group-hover:animate-shake" />
                </button>
              </div>

              {/* Note display with animation from fe-aliya */}
              {favorite.note && (
                <div className="mt-4 bg-gray-50 p-3 border-l-2 border-black rounded-r-md animate-fade-in-right" style={{ animationDelay: `${index * 0.07 + 0.2}s` }}>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{favorite.note}</p>
                </div>
              )}

              {/* Image display from master, integrated into fe-aliya's card */}
              {favorite.image_url && (
                <div className="mt-4 pl-16"> {/* Aligned with mood name/date */}
                  <img
                    src={favorite.image_url}
                    alt="Mood log" // Corrected alt text
                    className="w-full max-w-xs rounded-md border-2 border-gray-300 shadow-md"
                  />
                </div>
              )}
              
              {/* "Favorite memory" text from fe-aliya */}
              <div className="mt-3 pl-16 text-xs text-gray-500 flex items-center">
                <span className="text-yellow-400 mr-1">★</span> Favorite memory
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JSX styles for animations from fe-aliya */}
      <style jsx>{`
        @keyframes scale-in-center {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-out-center {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes fade-in-right {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(7deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-7deg); }
        }
        /* Ensure ping for sparkles is defined if not globally available */
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-scale-in-center { animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        .animate-scale-out-center { animation: scale-out-center 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both; }
        .animate-fade-in-right { animation: fade-in-right 0.4s ease-out both; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default FavoritesPage;