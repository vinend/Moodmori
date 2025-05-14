import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import api from '../api/axiosConfig';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/favorites');
        setFavorites(response.data.favorites);
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
    try {
      await api.delete(`/api/favorites/${moodLogId}`);
      
      // Remove from state immediately (optimistic UI update)
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== moodLogId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove from favorites');
    }
  };

  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': 'bg-yellow-300',
      'SAD': 'bg-blue-300',
      'ANGRY': 'bg-red-500',
      'AFRAID': 'bg-purple-300',
      'NEUTRAL': 'bg-gray-300',
      'MANIC': 'bg-yellow-500',
      'DEPRESSED': 'bg-blue-500',
      'FURIOUS': 'bg-red-700',
      'TERRIFIED': 'bg-purple-500',
      'CALM': 'bg-green-300',
    };
    
    return moodColors[moodName] || 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-mono">
      <h1 className="text-2xl font-bold mb-6">FAVORITE MEMORIES</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}
      
      {favorites.length === 0 ? (
        <div className="text-center border-2 border-black p-10">
          <p className="mb-4">You don't have any favorites yet.</p>
          <p className="text-sm text-gray-600">
            Mark mood logs as favorites to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map(favorite => (
            <div 
              key={favorite.id} 
              className="border-2 border-black p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full ${getMoodColor(favorite.mood_name)} mr-4 flex items-center justify-center`}
                  >
                    <FaStar size={16} className="text-white" />
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
                  className="text-gray-700 hover:text-red-500"
                  aria-label="Remove from favorites"
                >
                  <FaTrash size={16} />
                </button>
              </div>
                {favorite.note && (
                <div className="mt-4 bg-gray-50 p-3 border-l-2 border-black">
                  <p className="text-sm text-gray-800">{favorite.note}</p>
                </div>
              )}
              
              {favorite.image_url && (
                <div className="mt-4">
                  <img
                    src={favorite.image_url}
                    alt="Mood log photo"
                    className="w-full max-w-xs rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;