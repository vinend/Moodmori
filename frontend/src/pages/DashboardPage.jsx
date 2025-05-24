import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// API_URL is not used in the provided snippets, but often is in constants. Assuming it's not needed for this merge.
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
        const moodsResponse = await api.get('/api/moods');
        setMoods(moodsResponse.data.moods);

        const logsResponse = await api.get('/api/mood-logs?limit=5'); // Fetch a few for recent
        setRecentLogs(logsResponse.data.moodLogs);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLog = logsResponse.data.moodLogs.find(log => {
          const logDate = new Date(log.log_date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });
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
        // From main-alvin: Slice to show only top 3 public logs
        const allPublicLogs = response.data.posts || [];
        // console.log('Public logs response:', allPublicLogs); // Optional: for debugging
        // Assuming logs are sorted newest first by the backend. If not, sorting would be needed here.
        setPublicLogs(allPublicLogs.slice(0, 3));
      } catch (err) {
        console.error('Error fetching public logs:', err);
        // Optionally set an error state for public logs if needed
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
      setRecentLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === moodLogId
            ? { ...log, is_favorite: !isFavorite }
            : log
        )
      );
      setPublicLogs(prevLogs =>
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

  const updateLogReaction = (logId, newReaction, likeChange, dislikeChange) => {
    setPublicLogs(prevLogs =>
      prevLogs.map(log =>
        log.id === logId
          ? {
              ...log,
              user_reaction: newReaction,
              like_count: parseInt(log.like_count || 0) + likeChange,
              dislike_count: parseInt(log.dislike_count || 0) + dislikeChange,
            }
          : log
      )
    );
  };
  
  const handleLike = async (log) => {
    if (log.user_id === user?.id) {
      alert('You cannot like your own posts');
      return;
    }
    try {
      if (log.user_reaction === true) { 
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        updateLogReaction(log.id, null, -1, 0);
      } else { 
        await api.post(`/api/mood-logs/${log.id}/like`);
        const dislikeChange = log.user_reaction === false ? -1 : 0; 
        updateLogReaction(log.id, true, 1, dislikeChange);
      }
    } catch (err) {
      console.error('Error handling like:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot process like action.');
      }
    }
  };

  const handleDislike = async (log) => {
    if (log.user_id === user?.id) {
      alert('You cannot dislike your own posts');
      return;
    }
    try {
      if (log.user_reaction === false) { 
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        updateLogReaction(log.id, null, 0, -1);
      } else { 
        await api.post(`/api/mood-logs/${log.id}/dislike`);
        const likeChange = log.user_reaction === true ? -1 : 0; 
        updateLogReaction(log.id, false, likeChange, 1);
      }
    } catch (err) {
      console.error('Error handling dislike:', err);
       if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot process dislike action.');
      }
    }
  };

  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': 'bg-yellow-300', 'SAD': 'bg-blue-300', 'ANGRY': 'bg-red-500',
      'AFRAID': 'bg-purple-300', 'NEUTRAL': 'bg-gray-300', 'MANIC': 'bg-yellow-500',
      'DEPRESSED': 'bg-blue-500', 'FURIOUS': 'bg-red-700', 'TERRIFIED': 'bg-purple-500',
      'CALM': 'bg-green-300',
    };
    return moodColors[moodName] || 'bg-gray-300';
  };

  useEffect(() => {
    document.body.classList.add('bg-gradient-to-br', 'from-[#F7AEF8]', 'via-[#9A93EE]', 'to-[#72DDF7]');
    return () => {
      document.body.classList.remove('bg-gradient-to-br', 'from-[#F7AEF8]', 'via-[#9A93EE]', 'to-[#72DDF7]');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#B449E9] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-[#B33BEB]">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center h-screen">
        <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 font-mono my-4 rounded-md shadow-lg max-w-md text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 underline text-red-700 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-sans">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-heading mb-3 tracking-wider text-black">
          WELCOME, {user ? user.username.toUpperCase() : 'FRIEND'}!
        </h1>
        <p className="text-lg text-gray-700 tracking-wide">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border-2 border-black p-6 bg-white shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 hover:animate-zoom-in-stay rounded-lg">
          <h2 className="text-2xl font-heading mb-4 tracking-wider text-black">TODAY'S MOOD</h2>
          {todaysMood ? (
            <div className="flex items-center">
              <div className={`w-16 h-16 rounded-full ${getMoodColor(todaysMood.mood_name)} mr-4 border-2 border-black`}></div>
              <div>
                <p className="text-xl font-bold tracking-wide text-black">{todaysMood.mood_name}</p>
                <p className="text-base text-gray-600">{todaysMood.note || 'No notes'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-lg text-gray-700">You haven't logged your mood today</p>
              <Link
                to="/log"
                className="inline-flex items-center border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-200 active:animate-button-press text-lg rounded-md"
              >
                <FaPlus className="mr-2" /> Log Today's Mood
              </Link>
            </div>
          )}
        </div>

        <div className="border-2 border-black p-6 bg-white shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 hover:animate-zoom-in-stay rounded-lg">
          <h2 className="text-2xl font-heading mb-4 tracking-wider text-black">QUICK MOOD LOG</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {moods.slice(0, 5).map(mood => (
              <Link
                key={mood.id}
                to={`/log?moodId=${mood.id}`}
                className={`flex flex-col items-center justify-center p-3 border-2 border-black ${getMoodColor(mood.mood_name)} hover:opacity-90 transition-opacity duration-200 active:animate-button-press rounded-md`}
              >
                <p className="text-base font-bold tracking-wide text-black text-center">{mood.mood_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-2 border-black p-6 bg-white shadow-omori-default mb-8 rounded-lg">
        <h2 className="text-2xl font-heading mb-6 tracking-wider flex items-center text-black">
          <span className="mr-2 text-black">⬥</span> RECENT ENTRIES
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-center py-8 text-lg text-gray-700">No mood logs yet. Start by logging your mood!</p>
        ) : (
          <div className="space-y-6">
            {recentLogs.map(log => (
              <div key={log.id} className="border-2 border-gray-200 p-4 bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    {/* User profile picture - smaller on mobile (from main-alvin) */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500 text-base sm:text-xl" /> {/* Responsive icon size */}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className={`w-6 h-6 rounded-full ${getMoodColor(log.mood_name)} mr-2 border-2 border-black`}></div>
                        <p className="text-lg font-bold tracking-wide text-black">{log.mood_name}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(log.log_date).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(log.id, log.is_favorite)}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 active:animate-button-press p-1"
                  >
                    {log.is_favorite ? <FaStar size={24} className="text-yellow-500" /> : <FaRegStar size={24} />}
                  </button>
                </div>
                {log.note && <p className="mt-3 text-base text-gray-800 pl-12 sm:pl-16">{log.note}</p>} 
                {log.image_url && (
                  // Image styling from main-alvin (centered, responsive max-width)
                  <img
                    src={log.image_url}
                    alt="Mood log"
                    className="mt-3 mx-auto w-full max-w-[200px] sm:max-w-xs rounded-lg border-2 border-black shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/all-logs" 
            className="inline-block border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-colors duration-200 active:animate-button-press text-lg rounded-md"
          >
            View All Entries
          </Link>
        </div>
      </div>

      <div className="border-2 border-black p-6 bg-white shadow-omori-default rounded-lg">
        <h2 className="text-2xl font-heading mb-6 tracking-wider flex items-center text-black">
          <span className="mr-2 text-black">⬥</span> PUBLIC MOOD LOGS
        </h2>
        {publicLogs?.length === 0 ? (
          <p className="text-center py-8 text-lg text-gray-700">No public mood logs available.</p>
        ) : (
          <div className="space-y-6">
            {publicLogs?.map(log => (
              // Public log item styling adjustments from main-alvin
              <div key={log.id} className="border-2 border-black p-4 bg-white hover:bg-gray-50 transition-colors duration-200 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-start"> {/* main-alvin: responsive flex direction */}
                  <div className="flex items-start flex-1 mb-3 sm:mb-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black rounded-full overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                      {log.profile_picture ? (
                        <img src={log.profile_picture} alt={`${log.username}'s profile`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500 text-base sm:text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getMoodColor(log.mood_name)} mr-2 border-2 border-black`}></div>
                        <p className="text-md sm:text-lg font-bold tracking-wide text-black">{log.mood_name}</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {new Date(log.log_date).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })} by <span className="font-semibold">{log.username}</span>
                      </p>
                    </div>
                  </div>
                  {/* Like/Dislike buttons - main-alvin's responsive structure, master's active icon colors */}
                  <div className="flex items-center justify-start sm:justify-end space-x-2 sm:space-x-1 w-full sm:w-auto">
                     <div className="flex items-center">
                        <button
                          onClick={() => handleLike(log)}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors duration-200 active:animate-button-press"
                          aria-label="Like"
                        >
                          {log.user_reaction === true ?
                            <FaThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> : // Active color from master
                            <FaRegThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-blue-500" />}
                        </button>
                        <span className="text-xs sm:text-sm font-bold min-w-[1.25rem] text-center text-gray-700">{log.like_count || 0}</span>
                     </div>
                     <div className="flex items-center">
                        <button
                          onClick={() => handleDislike(log)}
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors duration-200 active:animate-button-press"
                          aria-label="Dislike"
                        >
                          {log.user_reaction === false ?
                            <FaThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> : // Active color from master
                            <FaRegThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-red-500" />}
                        </button>
                        <span className="text-xs sm:text-sm font-bold min-w-[1.25rem] text-center text-gray-700">{log.dislike_count || 0}</span>
                     </div>
                  </div>
                </div>
                {log.note && <p className="mt-3 text-sm sm:text-base text-gray-800 sm:pl-16">{log.note}</p>}
                {log.image_url && (
                  <img
                    src={log.image_url}
                    alt="Mood log"
                    className="mt-3 mx-auto w-full max-w-[200px] sm:max-w-xs rounded-lg border-2 border-black shadow-md"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden">
        {/* Color palette reference */}
      </div>
    </div>
  );
};

const DashboardPageWithBoundary = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    if (!initialUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else {
        setUser(initialUser);
    }
  }, [initialUser]);

  return (
    <ErrorBoundary>
      <DashboardPage user={user} />
    </ErrorBoundary>
  );
};

export default DashboardPageWithBoundary;