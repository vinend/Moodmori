import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../constants';
import { FaPlus, FaStar, FaRegStar, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';
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
        const logsResponse = await api.get('/api/mood-logs?limit=5');
        setRecentLogs(logsResponse.data.moodLogs);
        
        // Check if there's a mood logged for today
        const today = new Date().toISOString().split('T')[0];
        const todayLog = logsResponse.data.moodLogs.find(log => 
          new Date(log.log_date).toISOString().split('T')[0] === today
        );
        
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
              like_count: log.like_count + likeChange,
              dislike_count: log.dislike_count + dislikeChange
            } 
          : log
      )
    );
  };

  // Keep original mood colors but use new colors for UI elements
  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': 'bg-yellow-300', // Original yellow
      'SAD': 'bg-blue-300', // Original blue
      'ANGRY': 'bg-red-500', // Original red
      'AFRAID': 'bg-purple-300', // Original purple
      'NEUTRAL': 'bg-gray-300', // Original gray
      'MANIC': 'bg-yellow-500', // Original deeper yellow
      'DEPRESSED': 'bg-blue-500', // Original deeper blue
      'FURIOUS': 'bg-red-700', // Original deeper red
      'TERRIFIED': 'bg-purple-500', // Original deeper purple
      'CALM': 'bg-green-300', // Original green
    };
    
    return moodColors[moodName] || 'bg-gray-300'; // Default to gray
  };

  // Add the gradient background class to body with more curvature
  useEffect(() => {
    document.body.classList.add('bg-gradient-to-br', 'from-[#F7AEF8]', 'via-[#9A93EE]', 'to-[#72DDF7]');
    
    return () => {
      document.body.classList.remove('bg-gradient-to-br', 'from-[#F7AEF8]', 'via-[#9A93EE]', 'to-[#72DDF7]');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#B449E9] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-[#B33BEB]">Loading dashboard...</p>
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
    <div className="container mx-auto p-4 font-mono">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-black">WELCOME, {user?.username?.toUpperCase()}</h1>
        <p className="text-sm text-black text-opacity-90">Today is {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Today's Mood Section */}
        <div className="border-2 border-[#B33BEB] p-6 rounded-2xl bg-gradient-to-br from-[#F7AEF8] via-[#9A93EE] to-[#72DDF7] bg-opacity-90 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-black">TODAY'S MOOD</h2>
          
          {todaysMood ? (
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full ${getMoodColor(todaysMood.mood_name)} mr-4`}></div>
              <div>
                <p className="text-lg font-bold text-[#B33BEB]">{todaysMood.mood_name}</p>
                <p className="text-sm text-[#9A93EE]">{todaysMood.note || 'No notes'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-white">You haven't logged your mood today</p>
              <Link 
                to="/log" 
                className="inline-flex items-center border-2 border-white px-4 py-2 rounded-md text-white hover:bg-white hover:text-[#B33BEB] transition-colors"
              >
                <FaPlus className="mr-2" /> Log Today's Mood
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Log Section */}
        <div className="border-2 border-[#8D91FD] p-6 rounded-2xl bg-gradient-to-br from-[#F7AEF8] via-[#9A93EE] to-[#72DDF7] bg-opacity-90 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-black">QUICK MOOD LOG</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moods.slice(0, 5).map(mood => (
              <Link 
                key={mood.id}
                to={`/log?moodId=${mood.id}`}
                className={`flex flex-col items-center justify-center p-2 border-2 border-white ${getMoodColor(mood.mood_name)} hover:opacity-80 rounded-md transition-all`}
              >
                <p className="text-sm font-bold text-black">{mood.mood_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Logs Section */}
      <div className="border-2 border-[#8093F1] p-6 rounded-2xl bg-gradient-to-br from-[#F7AEF8] via-[#9A93EE] to-[#72DDF7] bg-opacity-90 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-black">RECENT ENTRIES</h2>
        
        {recentLogs.length === 0 ? (
          <p className="text-center py-6 text-[#9A93EE]">No mood logs yet. Start by logging your mood!</p>
        ) : (
          <div className="space-y-4">
            {recentLogs.map(log => (
              <div key={log.id} className="border-b border-white border-opacity-50 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${getMoodColor(log.mood_name)} mr-4`}></div>
                    <div>
                      <p className="font-bold text-white">{log.mood_name}</p>
                      <p className="text-xs text-white text-opacity-90">
                        {new Date(log.log_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleFavorite(log.id, log.is_favorite)}
                    className="text-black hover:text-yellow-300 transition-colors"
                  >
                    {log.is_favorite ? <FaStar size={20} className="text-yellow-300" /> : <FaRegStar size={20} />}
                  </button>
                </div>
                {log.note && (
                  <p className="mt-2 text-sm text-black text-opacity-90 pl-12">{log.note}</p>
                )}
                
                {log.image_url && (
                  <img
                    src={log.image_url}
                    alt="Mood log photo"
                    className="mt-2 w-full max-w-xs rounded-md ml-12 border-2 border-white shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link 
            to="/log" 
            className="inline-block border-2 border-white px-4 py-2 rounded-md text-white hover:bg-white hover:text-[#8093F1] transition-colors"
          >
            View All Entries
          </Link>
        </div>
      </div>

      {/* Public Logs Section */}
      <div className="border-2 border-[#72DDF7] p-6 rounded-2xl bg-gradient-to-br from-[#F7AEF8] via-[#9A93EE] to-[#72DDF7] bg-opacity-90 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">PUBLIC MOOD LOGS</h2>

        {publicLogs?.length === 0 ? (
          <p className="text-center py-6 text-[#9A93EE]">No public mood logs available.</p>
        ) : (
          <div className="space-y-4">
            {publicLogs?.map(log => (
              <div key={log.id} className="border-b border-white border-opacity-50 pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${getMoodColor(log.mood_name)} mr-4`}></div>
                    <div>
                      <p className="font-bold text-white">{log.mood_name}</p>
                      <p className="text-xs text-white text-opacity-90">
                        {new Date(log.log_date).toLocaleDateString()} by {log.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleLike(log)} 
                        className="mr-1 focus:outline-none"
                      >
                        {log.user_reaction === true ? 
                          <FaThumbsUp className="text-blue-300" /> : 
                          <FaRegThumbsUp className="text-black" />}
                      </button>
                      <span className="text-xs mr-3 text-white">{log.like_count || 0}</span>
                      
                      <button 
                        onClick={() => handleDislike(log)} 
                        className="mr-1 focus:outline-none"
                      >
                        {log.user_reaction === false ? 
                          <FaThumbsDown className="text-red-500" /> : 
                          <FaRegThumbsDown className="text-black" />}
                      </button>
                      <span className="text-xs text-white">{log.dislike_count || 0}</span>
                    </div>
                  </div>
                </div>
                
                {log.note && (
                  <p className="mt-2 text-sm text-black text-opacity-90 pl-12">{log.note}</p>
                )}
                {log.image_url && (
                  <img
                    src={log.image_url}
                    alt="Mood log photo"
                    className="mt-2 w-full max-w-xs rounded-md ml-12 border-2 border-[#D67CF1]"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Color palette reference (hidden) */}
      <div className="hidden">
        {/* 
          Color palette from the image:
          #F7AEF8 - Light Pink
          #E79FF5 - Pink
          #D67CF1 - Bright Purple
          #B449E9 - Medium Purple
          #B33BEB - Darker Purple
          #9A93EE - Blue-Purple
          #8D91FD - Light Blue
          #8093F1 - Medium Blue
          #72DDF7 - Turquoise
          #F4F4ED - Off-White
        */}
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