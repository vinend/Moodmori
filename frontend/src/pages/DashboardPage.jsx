import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../constants';
import { FaPlus, FaStar, FaRegStar, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaUser } from 'react-icons/fa';
import api from '../api/axiosConfig';
import ErrorBoundary from '../components/ErrorBoundary';

const DashboardPage = ({ user }) => {
  const [moods, setMoods] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [publicLogs, setPublicLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todaysMood, setTodaysMood] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch all available moods
        const moodsResponse = await api.get('/api/moods');
        setMoods(moodsResponse.data.moods);
        
        // Fetch recent mood logs
        const logsResponse = await api.get('/api/mood-logs?limit=2');
        setRecentLogs(logsResponse.data.moodLogs);
        
        // Check if there's a mood logged for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day

        const todayLog = logsResponse.data.moodLogs.find(log => {
          const logDate = new Date(log.log_date);
          logDate.setHours(0, 0, 0, 0); // Set to start of day
          return logDate.getTime() === today.getTime();
        });

        console.log('Today:', today);
        console.log('Today\'s log:', todayLog);
        console.log('All logs:', logsResponse.data.moodLogs);
        
        setTodaysMood(todayLog);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  useEffect(() => {
    const fetchPublicLogs = async () => {
      try {
        const response = await api.get('/api/mood-logs/public');
        // Server returns data.posts, not data.publicLogs
        console.log('Public logs response:', response.data.posts);
        setPublicLogs(response.data.posts);
      } catch (err) {
        console.error('Error fetching public logs:', err);
      }
    };

    fetchPublicLogs();
  }, []);
  const toggleFavorite = async (moodLogId, isFavorite) => {
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${moodLogId}`);
      } else {
        await api.post('/api/favorites', { moodLogId });
      }

      // Update the UI optimistically
      setRecentLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === moodLogId 
            ? { ...log, is_favorite: !isFavorite } 
            : log
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  // Handle liking a log
  const handleLike = async (log) => {
    try {
      // Check if the user is trying to like their own post
      if (log.user_id === user?.id) {
        console.log('You cannot like your own posts');
        alert('You cannot like your own posts');
        return;
      }
      
      // If user already liked, remove the reaction
      if (log.user_reaction === true) {
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        
        // Update UI optimistically - remove like
        updateLogReaction(log.id, null, -1, 0);
      } 
      // If user had disliked, change to like
      else if (log.user_reaction === false) {
        await api.post(`/api/mood-logs/${log.id}/like`);
        
        // Update UI optimistically - remove dislike, add like
        updateLogReaction(log.id, true, 1, -1);
      } 
      // If no reaction yet, add like
      else {
        await api.post(`/api/mood-logs/${log.id}/like`);
        
        // Update UI optimistically - add like
        updateLogReaction(log.id, true, 1, 0);
      }
    } catch (err) {
      console.error('Error handling like:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot like this post');
      }
    }
  };
  
  // Handle disliking a log
  const handleDislike = async (log) => {
    try {
      // Check if the user is trying to dislike their own post
      if (log.user_id === user?.id) {
        console.log('You cannot dislike your own posts');
        alert('You cannot dislike your own posts');
        return;
      }
      
      // If user already disliked, remove the reaction
      if (log.user_reaction === false) {
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        
        // Update UI optimistically - remove dislike
        updateLogReaction(log.id, null, 0, -1);
      } 
      // If user had liked, change to dislike
      else if (log.user_reaction === true) {
        await api.post(`/api/mood-logs/${log.id}/dislike`);
        
        // Update UI optimistically - remove like, add dislike
        updateLogReaction(log.id, false, -1, 1);
      } 
      // If no reaction yet, add dislike
      else {
        await api.post(`/api/mood-logs/${log.id}/dislike`);
        
        // Update UI optimistically - add dislike
        updateLogReaction(log.id, false, 0, 1);
      }
    } catch (err) {
      console.error('Error handling dislike:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot dislike this post');
      }
    }
  };
  
  // Update the reaction state in the UI
  const updateLogReaction = (logId, newReaction, likeChange, dislikeChange) => {
    // Update public logs
    setPublicLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === logId 
          ? { 
              ...log, 
              user_reaction: newReaction,
              like_count: parseInt(log.like_count || 0) + likeChange,
              dislike_count: parseInt(log.dislike_count || 0) + dislikeChange
            } 
          : log
      )
    );
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
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 font-mono my-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-sans">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-heading mb-3 tracking-wider">
          WELCOME, {user ? user.username.toUpperCase() : 'FRIEND'}!
        </h1>
        <p className="text-lg text-gray-600 tracking-wide">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Today's Mood Section */}
        <div className="border-2 border-black p-6 bg-white shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 hover:animate-zoom-in-stay">
          <h2 className="text-2xl font-heading mb-4 tracking-wider">TODAY'S MOOD</h2>
          
          {todaysMood ? (
            <div className="flex items-center">
              <div className={`w-16 h-16 rounded-full ${getMoodColor(todaysMood.mood_name)} mr-4 border-2 border-black`}></div>
              <div>
                <p className="text-xl font-bold tracking-wide">{todaysMood.mood_name}</p>
                <p className="text-base text-gray-600">{todaysMood.note || 'No notes'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-lg">You haven't logged your mood today</p>
              <Link 
                to="/log" 
                className="inline-flex items-center border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-200 active:animate-button-press text-lg"
              >
                <FaPlus className="mr-2" /> Log Today's Mood
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Log Section */}
        <div className="border-2 border-black p-6 bg-white shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 hover:animate-zoom-in-stay">
          <h2 className="text-2xl font-heading mb-4 tracking-wider">QUICK MOOD LOG</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {moods.slice(0, 5).map(mood => (
              <Link 
                key={mood.id}
                to={`/log?moodId=${mood.id}`}
                className={`flex flex-col items-center justify-center p-3 border-2 border-black ${getMoodColor(mood.mood_name)} hover:opacity-90 transition-opacity duration-200 active:animate-button-press`}
              >
                <p className="text-base font-bold tracking-wide">{mood.mood_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Logs Section */}
      <div className="border-2 border-black p-6 bg-white shadow-omori-default mb-8">
        <h2 className="text-2xl font-heading mb-6 tracking-wider flex items-center">
          <span className="mr-2">⬥</span> RECENT ENTRIES
        </h2>
        
        {recentLogs.length === 0 ? (
          <p className="text-center py-8 text-lg">No mood logs yet. Start by logging your mood!</p>
        ) : (
          <div className="space-y-6">
            {recentLogs.map(log => (
              <div key={log.id} className="border-2 border-black p-4 mb-4 last:mb-0 bg-white hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    {/* User profile picture */}
                    <div className="w-12 h-12 border-2 border-black rounded-full overflow-hidden mr-4 flex-shrink-0">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500 text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className={`w-6 h-6 rounded-full ${getMoodColor(log.mood_name)} mr-2 border-2 border-black`}></div>
                        <p className="text-lg font-bold tracking-wide">{log.mood_name}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(log.log_date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleFavorite(log.id, log.is_favorite)}
                    className="text-black hover:text-yellow-500 transition-colors duration-200 active:animate-button-press"
                  >
                    {log.is_favorite ? <FaStar size={24} className="text-yellow-500" /> : <FaRegStar size={24} />}
                  </button>
                </div>
                {log.note && (
                  <p className="mt-3 text-base text-gray-800 pl-14">{log.note}</p>
                )}
                
                {log.image_url && (
                  <img
                    src={log.image_url}
                    alt="Mood log photo"
                    className="mt-3 w-full max-w-sm rounded-lg border-2 border-black ml-14 shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link 
            to="/log" 
            className="inline-block border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-200 active:animate-button-press text-lg"
          >
            View All Entries
          </Link>
        </div>
      </div>

      {/* Public Logs Section */}
      <div className="border-2 border-black p-6 bg-white shadow-omori-default">
        <h2 className="text-2xl font-heading mb-6 tracking-wider flex items-center">
          <span className="mr-2">⬥</span> PUBLIC MOOD LOGS
        </h2>

        {publicLogs?.length === 0 ? (
          <p className="text-center py-8 text-lg">No public mood logs available.</p>
        ) : (
          <div className="space-y-6">
            {publicLogs?.map(log => (
              <div key={log.id} className="border-2 border-black p-4 mb-4 last:mb-0 bg-white hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {/* User profile picture */}
                    <div className="w-12 h-12 border-2 border-black rounded-full overflow-hidden mr-4 flex-shrink-0">
                      {log.profile_picture ? (
                        <img 
                          src={log.profile_picture} 
                          alt={`${log.username}'s profile`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500 text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className={`w-6 h-6 rounded-full ${getMoodColor(log.mood_name)} mr-2 border-2 border-black`}></div>
                        <p className="text-lg font-bold tracking-wide">{log.mood_name}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(log.log_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} by <span className="font-bold">{log.username}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleLike(log)} 
                      className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200 active:animate-button-press"
                      aria-label="Like"
                    >
                      {log.user_reaction === true ? 
                        <FaThumbsUp size={20} className="text-black" /> : 
                        <FaRegThumbsUp size={20} />}
                    </button>
                    <span className="text-sm font-bold min-w-[1.5rem] text-center">{log.like_count || 0}</span>
                    
                    <button 
                      onClick={() => handleDislike(log)} 
                      className="p-2 hover:bg-black hover:text-white rounded transition-colors duration-200 active:animate-button-press"
                      aria-label="Dislike"
                    >
                      {log.user_reaction === false ? 
                        <FaThumbsDown size={20} className="text-black" /> : 
                        <FaRegThumbsDown size={20} />}
                    </button>
                    <span className="text-sm font-bold min-w-[1.5rem] text-center">{log.dislike_count || 0}</span>
                  </div>
                </div>
                
                {log.note && (
                  <p className="mt-3 text-base text-gray-800 pl-14">{log.note}</p>
                )}
                {log.image_url && (
                  <img
                    src={log.image_url}
                    alt="Mood log photo"
                    className="mt-3 w-full max-w-sm rounded-lg border-2 border-black ml-14 shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPageWithBoundary = () => (
  <ErrorBoundary>
    <DashboardPage user={JSON.parse(localStorage.getItem('user'))} />
  </ErrorBoundary>
);

export default DashboardPageWithBoundary;
