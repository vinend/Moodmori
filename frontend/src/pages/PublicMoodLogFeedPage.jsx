import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Keep Link if you plan to link to user profiles or full posts

const PublicMoodLogFeedPage = ({ user }) => { // Add user prop
  const [publicLogs, setPublicLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    return moodColors[moodName.toUpperCase()] || 'bg-gray-300';
  };

  useEffect(() => {
    const fetchPublicMoodLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/mood-logs/public');
        setPublicLogs(response.data.posts || []); // Changed to response.data.posts
      } catch (err) {
        console.error('Error fetching public mood logs:', err);
        setError('Failed to load public mood logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicMoodLogs();
  }, []);

  const handleLike = async (log) => {
    if (!user) {
      alert('Please log in to react to posts.');
      return;
    }
    if (log.user_id === user?.id) {
      alert('You cannot like your own posts');
      return;
    }
    try {
      if (log.user_reaction === true) {
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        updateLogReaction(log.id, null, -1, 0);
      } else if (log.user_reaction === false) {
        await api.post(`/api/mood-logs/${log.id}/like`);
        updateLogReaction(log.id, true, 1, -1);
      } else {
        await api.post(`/api/mood-logs/${log.id}/like`);
        updateLogReaction(log.id, true, 1, 0);
      }
    } catch (err) {
      console.error('Error handling like:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot like this post');
      }
    }
  };

  const handleDislike = async (log) => {
    if (!user) {
      alert('Please log in to react to posts.');
      return;
    }
    if (log.user_id === user?.id) {
      alert('You cannot dislike your own posts');
      return;
    }
    try {
      if (log.user_reaction === false) {
        await api.delete(`/api/mood-logs/${log.id}/reaction`);
        updateLogReaction(log.id, null, 0, -1);
      } else if (log.user_reaction === true) {
        await api.post(`/api/mood-logs/${log.id}/dislike`);
        updateLogReaction(log.id, false, -1, 1);
      } else {
        await api.post(`/api/mood-logs/${log.id}/dislike`);
        updateLogReaction(log.id, false, 0, 1);
      }
    } catch (err) {
      console.error('Error handling dislike:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message || 'Cannot dislike this post');
      }
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
              dislike_count: parseInt(log.dislike_count || 0) + dislikeChange
            }
          : log
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white font-mono">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white font-mono">
        <p className="text-red-600 text-lg p-4 border-2 border-red-500 bg-red-50">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <h1 className="text-3xl sm:text-4xl font-heading text-center mb-8 tracking-wider text-black">
        PUBLIC FEED
      </h1>
      <div className="max-w-2xl mx-auto space-y-8">
        {publicLogs.length === 0 ? (
          <p className="text-center text-gray-600 text-lg py-10">No public mood logs available yet.</p>
        ) : (
          publicLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-none shadow-omori-default border-2 border-black p-5 sm:p-6">
              <div className="flex items-start mb-4">
                {log.profile_picture ? ( // Assuming 'profile_picture' comes from the backend for public logs
                  <img
                    src={log.profile_picture}
                    alt={log.username}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-black mr-3 sm:mr-4"
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mr-3 sm:mr-4 border-2 border-black rounded-full p-1" />
                )}
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                     <div className={`w-5 h-5 rounded-full ${getMoodColor(log.mood_name)} mr-2 border border-black`}></div>
                    <p className="font-bold text-black text-base sm:text-lg tracking-wide">{log.username || 'Anonymous'}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(log.log_date || log.created_at).toLocaleString('en-US', { // Use log_date or created_at
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                  </p>
                </div>
              </div>
              {log.note && <p className="text-gray-800 mb-4 text-base leading-relaxed">{log.note}</p>}
              {log.image_url && (
                <div className="mb-4">
                  <img
                    src={log.image_url}
                    alt="Mood log"
                    className="w-full h-auto rounded-none object-cover max-h-[400px] border-2 border-black"
                  />
                </div>
              )}
              <div className="flex items-center justify-start space-x-4 pt-3 border-t-2 border-black mt-4">
                <div className="flex items-center">
                  <button
                    onClick={() => handleLike(log)}
                    className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 active:animate-button-press"
                    aria-label="Like"
                  >
                    {log.user_reaction === true ?
                      <FaThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-black" /> :
                      <FaRegThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-black" />}
                  </button>
                  <span className="text-xs sm:text-sm font-bold min-w-[1.25rem] sm:min-w-[1.5rem] text-center text-gray-700">{log.like_count || 0}</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleDislike(log)}
                    className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 active:animate-button-press"
                    aria-label="Dislike"
                  >
                    {log.user_reaction === false ?
                      <FaThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-black" /> :
                      <FaRegThumbsDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-black" />}
                  </button>
                  <span className="text-xs sm:text-sm font-bold min-w-[1.25rem] sm:min-w-[1.5rem] text-center text-gray-700">{log.dislike_count || 0}</span>
                </div>
                {/* Add Comment and Share buttons if needed later */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicMoodLogFeedPage;
