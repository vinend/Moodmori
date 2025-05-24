import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaStar, FaRegStar, FaEdit, FaTrash, FaChevronDown, FaChevronUp,
  FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown // Icons from master
} from 'react-icons/fa';
import api from '../api/axiosConfig';

const MoodLogPage = () => {
  const [searchParams] = useSearchParams();
  const urlMoodId = searchParams.get("moodId");

  const [moods, setMoods] = useState([]);
  const [selectedMoodId, setSelectedMoodId] = useState(urlMoodId || "");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingLogId, setEditingLogId] = useState(null);
  const [editNote, setEditNote] = useState('');
  // fe-aliya's UI state
  const [showMoodHistory, setShowMoodHistory] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMoodAnimation, setSelectedMoodAnimation] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const moodsResponse = await api.get("/api/moods");
        setMoods(moodsResponse.data.moods);
        const logsResponse = await api.get("/api/mood-logs?limit=50"); // Consider pagination for many logs
        setMoodLogs(logsResponse.data.moodLogs);

        // fe-aliya's page load animations
        setTimeout(() => {
          setPageLoaded(true);
          setTimeout(() => {
            setShowSparks(true);
            setTimeout(() => setShowSparks(false), 1500);
          }, 300);
        }, 300);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMoodId) {
      setError("Please select a mood");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("moodId", selectedMoodId);
      formData.append("note", note.trim() || "");
      formData.append("isPublic", isPublic);
      if (selectedPhoto) {
        formData.append("image", selectedPhoto);
      }
      const response = await api.post("/api/mood-logs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMoodLogs(prevLogs => [response.data.moodLog, ...prevLogs]);
      // fe-aliya's success message and form reset
      setSuccessMessage('Mood logged successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedMoodId(urlMoodId && moods.find(m => m.id.toString() === urlMoodId) ? urlMoodId : ""); // Keep pre-selected if from URL
      setNote('');
      setIsPublic(false);
      setSelectedPhoto(null);
      if (document.getElementById('photo')) document.getElementById('photo').value = ''; // Clear file input
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async (moodLogId, isFavorite) => {
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${moodLogId}`);
      } else {
        await api.post("/api/favorites", { moodLogId });
      }
      setMoodLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === moodLogId ? { ...log, is_favorite: !isFavorite } : log
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to update favorite status");
    }
  };

  // Like/Dislike handlers from master
   const updateLogReaction = (logId, newReaction, likeChange, dislikeChange) => {
    setMoodLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === logId && log.is_public // Apply only to public logs
          ? {
              ...log,
              user_reaction: newReaction,
              like_count: (parseInt(log.like_count) || 0) + likeChange, // Ensure counts are numbers
              dislike_count: (parseInt(log.dislike_count) || 0) + dislikeChange,
            }
          : log
      )
    );
  };

  const handleLike = async (log) => {
    // Assuming user cannot like/dislike their own logs from this page,
    // or backend handles this. If client-side check needed:
    // if (log.user_id === currentUser?.id) { alert("Cannot react to your own log."); return; }
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
      console.error("Error handling like:", err);
      // setError("Failed to process like.");
    }
  };

  const handleDislike = async (log) => {
    // if (log.user_id === currentUser?.id) { alert("Cannot react to your own log."); return; }
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
      console.error("Error handling dislike:", err);
      // setError("Failed to process dislike.");
    }
  };


  const deleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this mood log?")) return;
    try {
      // fe-aliya's animation handling
      setMoodLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === logId ? { ...log, isDeleting: true } : log
        )
      );
      setTimeout(async () => {
        await api.delete(`/api/mood-logs/${logId}`);
        setMoodLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      }, 500); // Match animation duration
    } catch (err) {
      console.error("Error deleting log:", err);
      setError(err.response?.data?.message || "Failed to delete mood log");
      setMoodLogs(prevLogs => prevLogs.map(log => log.id === logId ? { ...log, isDeleting: false } : log)); // Reset on error
    }
  };

  const startEditing = (log) => {
    setEditingLogId(log.id);
    setEditNote(log.note || "");
    setSelectedMoodId(log.mood_id.toString()); // Ensure mood_id from log is used
  };

  const cancelEditing = () => {
    setEditingLogId(null);
    setEditNote("");
    setSelectedMoodId(urlMoodId || ""); // Reset to URL mood or empty
  };

  const saveEdit = async () => {
    if (!selectedMoodId) { // Ensure a mood is selected for edit
        setError("Please select a mood for the entry being edited.");
        return;
    }
    try {
      const response = await api.put(`/api/mood-logs/${editingLogId}`, {
        moodId: selectedMoodId,
        note: editNote.trim() || null,
        // isPublic status usually not editable this way, or needs separate control
      });
      // fe-aliya's animation and success message handling
      setMoodLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === editingLogId
            ? { ...response.data.moodLog, isUpdating: true }
            : log
        )
      );
      setTimeout(() => {
        setMoodLogs(prevLogs =>
          prevLogs.map(log =>
            log.id === editingLogId ? { ...log, isUpdating: false } : log
          )
        );
      }, 1000);
      setSuccessMessage('Mood updated successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
      cancelEditing();
    } catch (err) {
      console.error("Error updating log:", err);
      setError(err.response?.data?.message || "Failed to update mood log");
    }
  };

  const getMoodColor = (moodName) => { // fe-aliya's version with borders
    const moodColors = {
      'HAPPY': 'bg-yellow-300 border-yellow-500', 'SAD': 'bg-blue-300 border-blue-500',
      'ANGRY': 'bg-red-400 border-red-600', 'AFRAID': 'bg-purple-300 border-purple-500',
      'NEUTRAL': 'bg-gray-300 border-gray-500', 'MANIC': 'bg-yellow-400 border-yellow-600',
      'DEPRESSED': 'bg-blue-400 border-blue-600', 'FURIOUS': 'bg-red-600 border-red-800',
      'TERRIFIED': 'bg-purple-400 border-purple-600', 'CALM': 'bg-green-300 border-green-500',
    };
    return moodColors[moodName] || 'bg-gray-300 border-gray-500';
  };

  const getMoodEmoji = (moodName) => { // from fe-aliya
    const moodEmojis = {
      'HAPPY': '😊', 'SAD': '😢', 'ANGRY': '😠', 'AFRAID': '😨', 'NEUTRAL': '😐',
      'MANIC': '😆', 'DEPRESSED': '😔', 'FURIOUS': '😡', 'TERRIFIED': '😱', 'CALM': '😌',
    };
    return moodEmojis[moodName] || '😐';
  };

  const handleMoodSelect = (moodId) => { // from fe-aliya for animation
    setSelectedMoodId(moodId.toString());
    setSelectedMoodAnimation(true);
    setTimeout(() => setSelectedMoodAnimation(false), 600);
  };

  if (loading && !pageLoaded) { // Show detailed loading only on initial load
    // fe-aliya's detailed loading screen
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-2xl animate-pulse">📓</div>
          </div>
        </div>
        <p className="font-mono text-lg font-bold mb-2 text-black">LOADING MOOD JOURNAL</p>
        <p className="font-mono text-sm text-gray-600 mb-6">preparing your emotional canvas...</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black animate-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    // fe-aliya's main structure and styling
    <div className="container mx-auto px-3 sm:px-4 py-4 font-mono bg-white max-w-screen-xl">
      {/* Header from fe-aliya */}
      <div className={`mb-6 md:mb-8 px-4 py-4 md:py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-500 rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-black">MOOD JOURNAL</h1>
        <p className="text-sm text-gray-600">Log and track your moods</p>
        {showSparks && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute animate-ping opacity-70 text-yellow-400" style={{ top: `${Math.random()*80+10}%`, left: `${Math.random()*80+10}%`, animationDelay: `${Math.random()*1}s`, fontSize: `${Math.random()*0.5+0.75}rem`}}>✨</div>
            ))}
          </div>
        )}
      </div>

      {/* Success message display from fe-aliya */}
      {successMessage && (
        <div className="fixed top-6 right-6 p-4 bg-green-100 border-2 border-green-500 text-green-700 font-mono shadow-lg z-50 animate-slide-in-right rounded-md">
          <p className="flex items-center">{successMessage}</p>
        </div>
      )}

      {/* Log New Mood Form - fe-aliya's styling */}
      <div className={`border-2 border-black p-6 mb-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '0.1s' }}>
        <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center text-black">
          <span className="mr-2">LOG YOUR MOOD</span>
          <span className="text-sm animate-bounce">📝</span>
        </h2>
        {error && !submitting && ( // Show form error only when not submitting
          <div className="p-3 border-2 border-red-500 bg-red-100 text-red-600 font-mono my-4 animate-shake text-sm rounded-md">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-black" htmlFor="mood">HOW ARE YOU FEELING?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {moods.map((mood, index) => (
                <button
                  key={mood.id} type="button" onClick={() => handleMoodSelect(mood.id)}
                  className={`p-3 border-2 text-black ${getMoodColor(mood.mood_name)} hover:opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all rounded-md ${
                    selectedMoodId === mood.id.toString() ? 'ring-2 ring-offset-1 ring-black scale-105' : ''
                  } ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${0.1 + (index * 0.05)}s`, animation: selectedMoodId === mood.id.toString() && selectedMoodAnimation ? 'pulse 0.6s ease-in-out' : 'none' }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg mb-1">{getMoodEmoji(mood.mood_name)}</span>
                    <p className="text-sm font-bold text-center">{mood.mood_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-black" htmlFor="note">NOTES (OPTIONAL)</label>
            <textarea id="note"
              className="border-2 border-black w-full p-3 h-28 bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none rounded-md"
              value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write your thoughts here..."
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-black" htmlFor="photo">PHOTO (OPTIONAL)</label>
            <input type="file" id="photo" accept="image/*" onChange={handlePhotoChange}
              className="w-full border-2 border-black p-2 text-sm text-black file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 rounded-md"
            />
          </div>
          <div className="mb-6 flex items-center"> {/* Increased mb */}
            <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="isPublic" className="text-sm font-bold text-black cursor-pointer">MAKE THIS LOG PUBLIC</label>
          </div>
          <div className="flex justify-center">
            <button type="submit" disabled={submitting || !selectedMoodId}
              className="inline-flex items-center justify-center border-2 border-black px-8 py-3 bg-yellow-300 hover:bg-yellow-400 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden group rounded-md"
            >
              <span className="relative z-10">{submitting ? 'SAVING...' : 'LOG MOOD'}</span>
              <span className="absolute inset-0 h-full w-0 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span> {/* Hover fill effect */}
            </button>
          </div>
        </form>
      </div>

      {/* Mood History - fe-aliya's collapsible and styled section */}
      <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '0.2s' }}>
        <button
          className="flex justify-between items-center w-full text-xl font-bold mb-4 border-b-2 border-black pb-2 text-black transition-opacity hover:opacity-80"
          onClick={() => setShowMoodHistory(!showMoodHistory)} aria-expanded={showMoodHistory}
        >
          <span className="flex items-center">
            <span className="mr-2">YOUR MOOD HISTORY</span>
            <span className="text-sm animate-wiggle">📊</span>
          </span>
          <span className="transition-transform duration-300" style={{ transform: showMoodHistory ? 'rotate(0deg)' : 'rotate(-90deg)' }}> {/* Chevron changes on mobile click for collapse */}
            <FaChevronDown />
          </span>
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showMoodHistory ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}> {/* Increased max-h for more items */}
          {moodLogs.length === 0 && !loading ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded animate-fade-in">
              <div className="text-4xl mb-4">👻</div>
              <p className="font-bold text-black">No mood logs yet. Start by logging your mood above!</p>
              <p className="text-sm text-gray-500 mt-2">Your emotional journey begins with a single log.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodLogs.map((log, index) => (
                <div key={log.id}
                  className={`border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 rounded-md ${
                    log.isDeleting ? 'opacity-0 transform translate-x-full' :
                    log.isUpdating ? 'border-green-500 bg-green-50 animate-pulse-border' : ''
                  } ${pageLoaded && !log.isDeleting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: pageLoaded && !log.isDeleting ? `${0.2 + (index * 0.05)}s` : '0s' }}
                >
                  {editingLogId === log.id ? (
                    <div className="animate-fade-in">
                      <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-black">MOOD</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {moods.map(mood => (
                            <button key={mood.id} type="button" onClick={() => setSelectedMoodId(mood.id.toString())}
                              className={`p-3 border-2 text-black ${getMoodColor(mood.mood_name)} hover:opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all rounded-md ${selectedMoodId === mood.id.toString() ? 'ring-2 ring-offset-1 ring-black scale-105' : ''}`}>
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-lg mb-1">{getMoodEmoji(mood.mood_name)}</span>
                                <p className="text-sm font-bold text-center">{mood.mood_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-bold mb-2 text-black">NOTE</label>
                        <textarea className="border-2 border-black w-full p-3 h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none rounded-md"
                          value={editNote} onChange={(e) => setEditNote(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button onClick={cancelEditing} className="border-2 border-black px-4 py-2 bg-gray-200 text-black hover:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all rounded-md">Cancel</button>
                        <button onClick={saveEdit} className="border-2 border-black px-4 py-2 bg-green-400 text-black hover:bg-green-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all relative overflow-hidden group rounded-md">
                          <span className="relative z-10">Save Changes</span>
                          <span className="absolute inset-0 h-full w-0 bg-green-300 transition-all duration-300 group-hover:w-full"></span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center flex-1 mr-2">
                          <div className={`w-10 h-10 min-w-[2.5rem] rounded-full ${getMoodColor(log.mood_name)} border-2 border-black mr-3 flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                            <span className="text-lg">{getMoodEmoji(log.mood_name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-black">{log.mood_name}</p>
                            <p className="text-xs text-gray-600">{new Date(log.log_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                           <button onClick={() => toggleFavorite(log.id, log.is_favorite)} className="text-gray-500 hover:text-yellow-500 p-1 transition-transform duration-200 hover:scale-125 rounded-full" aria-label={log.is_favorite ? "Remove from favorites" : "Add to favorites"}>
                            {log.is_favorite ? <FaStar size={18} className="text-yellow-400" /> : <FaRegStar size={18} />}
                          </button>
                          <button onClick={() => startEditing(log)} className="text-gray-500 hover:text-blue-600 p-1 transition-transform duration-200 hover:scale-125 rounded-full" aria-label="Edit log">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => deleteLog(log.id)} className="text-gray-500 hover:text-red-600 p-1 transition-transform duration-200 hover:scale-125 rounded-full" aria-label="Delete log">
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </div>
                      {log.note && <p className="mt-3 text-sm text-gray-800 pl-12 bg-gray-50 p-2 border-l-2 border-gray-200 rounded-r-md break-words whitespace-pre-wrap">{log.note}</p>}
                      {log.image_url && <img src={log.image_url} alt="Mood log" className="mt-3 w-full max-w-[200px] rounded-md ml-12 border-2 border-gray-200 shadow-sm"/>}
                      {/* Conditional Like/Dislike UI for public logs */}
                      {log.is_public && (
                        <div className="mt-3 flex items-center pl-12 pt-2 border-t border-gray-200 space-x-3">
                          <div className="flex items-center">
                             <button onClick={() => handleLike(log)} className="p-1 text-gray-400 hover:text-blue-500 rounded-full transition-colors" aria-label="Like">
                                {log.user_reaction === true ? <FaThumbsUp size={16} className="text-blue-500" /> : <FaRegThumbsUp size={16} />}
                             </button>
                             <span className="text-xs ml-1 text-gray-600">{log.like_count || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <button onClick={() => handleDislike(log)} className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors" aria-label="Dislike">
                                {log.user_reaction === false ? <FaThumbsDown size={16} className="text-red-500" /> : <FaRegThumbsDown size={16} />}
                            </button>
                            <span className="text-xs ml-1 text-gray-600">{log.dislike_count || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JSX styles from fe-aliya */}
      <style jsx>{`
        @keyframes progress-bar { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.07); } 100% { transform: scale(1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        @keyframes slide-in-right { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes pulse-border { 0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); } 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }
        /* Ensure ping for sparkles is defined if not globally available */
        @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0;}}
        .animate-progress-bar { animation: progress-bar 1.5s ease-in-out forwards; } /* forwards to stay at 100% */
        .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-slide-in-right { animation: slide-in-right 0.5s forwards; }
        .animate-fade-in { animation: fade-in 0.5s forwards; }
        .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-border { animation: pulse-border 1s infinite; }
      `}</style>
    </div>
  );
};

export default MoodLogPage;