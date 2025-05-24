import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaUserCircle, FaComment, FaPaperclip } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Keep Link if you plan to link to user profiles or full posts

const PublicMoodLogFeedPage = ({ user }) => { // Add user prop
  const [publicLogs, setPublicLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState({}); // Stores comments for each mood log
  const [newCommentText, setNewCommentText] = useState({}); // Stores new comment text for each mood log
  const [newCommentFile, setNewCommentFile] = useState({}); // Stores new comment file for each mood log
  const [showComments, setShowComments] = useState({}); // To toggle comment visibility
  const [selectedImage, setSelectedImage] = useState(null); // For image modal
  const fileInputRefs = useRef({}); // To store refs for file inputs

  // Helper function to parse comment content
  const parseCommentContent = (content) => {
    if (!content) return { text: '', imageUrl: null };
    const parts = content.split('\n[IMAGE]');
    const text = parts[0];
    const imageUrl = parts.length > 1 ? parts[1] : null;
    return { text, imageUrl };
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

  const fetchComments = async (moodLogId) => {
    try {
      const response = await api.get(`/api/comments/mood-log/${moodLogId}`);
      setComments(prevComments => ({
        ...prevComments,
        [moodLogId]: response.data.comments || []
      }));
    } catch (err) {
      console.error(`Error fetching comments for mood log ${moodLogId}:`, err);
      // Optionally set an error state for comments
    }
  };

  const handleCommentSubmit = async (moodLogId) => {
    if (!user) {
      alert('Please log in to comment on posts.');
      return;
    }
    let textContent = newCommentText[moodLogId]?.trim() || '';
    const file = newCommentFile[moodLogId];

    if (!textContent && !file) {
      alert('Comment cannot be empty and no file selected.');
      return;
    }

    let finalContent = textContent;
    // The image will be handled by the backend controller, so no separate uploadResponse here.
    // The backend will store the image and include its URL in the comment content or a separate field.

    try {
      const formData = new FormData();
      formData.append('content', finalContent);
      if (file) {
        formData.append('image', file); // 'image' should match the field name expected by multer on the backend
      }

      // Send comment data and image (if any) to the backend
      const response = await api.post(`/api/comments/mood-log/${moodLogId}`, formData, {
        headers: {
          // Content-Type will be set automatically by the browser for FormData
        },
      });
      setComments(prevComments => ({
        ...prevComments,
        [moodLogId]: [...(prevComments[moodLogId] || []), response.data.comment]
      }));
      setNewCommentText(prevText => ({ ...prevText, [moodLogId]: '' }));
      setNewCommentFile(prevFile => ({ ...prevFile, [moodLogId]: null }));
      if (fileInputRefs.current[moodLogId]) {
        fileInputRefs.current[moodLogId].value = null; // Reset file input
      }

      // Optimistically update the comment count in publicLogs
      setPublicLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === moodLogId
            ? { ...log, comment_count: (parseInt(log.comment_count || 0) + 1) }
            : log
        )
      );
    } catch (err) {
      console.error('Error submitting comment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit comment. Please try again.';
      alert(errorMessage);
    }
  };

  const toggleComments = (moodLogId) => {
    setShowComments(prev => {
      const newState = { ...prev, [moodLogId]: !prev[moodLogId] };
      if (newState[moodLogId] && !comments[moodLogId]) {
        fetchComments(moodLogId); // Fetch comments only if showing and not already fetched
      }
      return newState;
    });
  };

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
                    className="w-full h-auto rounded-none object-contain border-2 border-black cursor-pointer"
                    onClick={() => setSelectedImage(log.image_url)}
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
                <button
                  onClick={() => toggleComments(log.id)}
                  className="flex items-center p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 active:animate-button-press"
                  aria-label="Comments"
                >
                  <FaComment className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-black" />
                  <span className="text-xs sm:text-sm font-bold ml-1 text-gray-700">
                    {log.comment_count || 0} {/* Assuming comment_count comes from backend */}
                  </span>
                </button>
              </div>

              {showComments[log.id] && (
                <div className="mt-4 pt-4 border-t-2 border-black">
                  <h3 className="font-bold text-black mb-3">Comments</h3>
                  {comments[log.id] && comments[log.id].length > 0 ? (
                    <div className="space-y-3">
                      {comments[log.id].map(comment => (
                        <div key={comment.id} className="bg-gray-100 p-3 rounded-none border border-gray-300">
                          <div className="flex items-center mb-1">
                            {comment.profile_picture ? (
                              <img
                                src={comment.profile_picture}
                                alt={comment.username}
                                className="w-7 h-7 rounded-full object-cover border border-gray-400 mr-2"
                              />
                            ) : (
                              <FaUserCircle className="w-7 h-7 text-gray-500 mr-2 border border-gray-400 rounded-full p-0.5" />
                            )}
                            <p className="font-semibold text-sm text-black">{comment.username || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500 ml-2">
                              {new Date(comment.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                            </p>
                          </div>
                          {parseCommentContent(comment.content).text && (
                            <p className="text-gray-800 text-sm ml-9 mb-2">{parseCommentContent(comment.content).text}</p>
                          )}
                          {parseCommentContent(comment.content).imageUrl && (
                            <img
                              src={parseCommentContent(comment.content).imageUrl}
                              alt="Comment attachment"
                              className="ml-9 mt-1 max-w-xs max-h-48 object-contain border border-gray-300 rounded cursor-pointer"
                              onClick={() => setSelectedImage(parseCommentContent(comment.content).imageUrl)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">No comments yet. Be the first to comment!</p>
                  )}

                  <div className="mt-4">
                    <textarea
                      placeholder="Add a comment..."
                      value={newCommentText[log.id] || ''}
                      onChange={(e) => setNewCommentText(prev => ({ ...prev, [log.id]: e.target.value }))}
                      className="w-full p-2 border-2 border-black rounded-none focus:outline-none focus:border-blue-500 bg-white resize-none"
                      rows="2"
                    ></textarea>
                    <div className="flex items-center mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewCommentFile(prev => ({ ...prev, [log.id]: e.target.files[0] }))}
                        className="hidden"
                        id={`comment-file-input-${log.id}`}
                        ref={el => fileInputRefs.current[log.id] = el}
                      />
                      <label
                        htmlFor={`comment-file-input-${log.id}`}
                        className="p-2 hover:bg-gray-200 rounded-full cursor-pointer mr-2"
                        title="Attach image"
                      >
                        <FaPaperclip className="w-5 h-5 text-gray-600 hover:text-black" />
                      </label>
                      {newCommentFile[log.id] && <span className="text-sm text-gray-500 truncate max-w-[150px]">{newCommentFile[log.id].name}</span>}
                       <button
                        onClick={() => handleCommentSubmit(log.id)}
                        className="ml-auto px-4 py-2 bg-black text-white rounded-none hover:bg-gray-800 transition-colors duration-200 active:animate-button-press"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    {selectedImage && (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedImage(null)} // Close modal on overlay click
      >
        <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
          <button
            className="absolute top-2 right-2 text-white text-3xl font-bold bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
          <img
            src={selectedImage}
            alt="Zoomed mood log"
            className="max-w-full max-h-[90vh] object-contain border-2 border-white"
          />
        </div>
      </div>
    )}
  </div>
  );
};

export default PublicMoodLogFeedPage;
