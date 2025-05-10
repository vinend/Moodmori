import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../api/axiosConfig';

const MoodLogPage = () => {
  const [searchParams] = useSearchParams();
  const urlMoodId = searchParams.get('moodId');
  
  const [moods, setMoods] = useState([]);
  const [selectedMoodId, setSelectedMoodId] = useState(urlMoodId || '');
  const [note, setNote] = useState('');
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [showMoodHistory, setShowMoodHistory] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMoodAnimation, setSelectedMoodAnimation] = useState(false);

  // Fetch moods and logs on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available moods
        const moodsResponse = await api.get('/api/moods');
        setMoods(moodsResponse.data.moods);
        
        // Fetch user's mood logs
        const logsResponse = await api.get('/api/mood-logs?limit=50');
        setMoodLogs(logsResponse.data.moodLogs);

        // Show initial spark animation after loading
        setTimeout(() => {
          setPageLoaded(true);
          setTimeout(() => {
            setShowSparks(true);
            setTimeout(() => setShowSparks(false), 1500);
          }, 300);
        }, 300);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Submit a new mood log
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMoodId) {
      setError('Please select a mood');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await api.post('/api/mood-logs', {
        moodId: selectedMoodId,
        note: note.trim() || null,
      });
      
      // Add new log to state
      setMoodLogs(prevLogs => [response.data.moodLog, ...prevLogs]);
      
      // Show success message
      setSuccessMessage('Mood logged successfully! 🎉');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setSelectedMoodId('');
      setNote('');
      
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle favorite status of a log
  const toggleFavorite = async (moodLogId, isFavorite) => {
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${moodLogId}`);
      } else {
        await api.post('/api/favorites', { moodLogId });
      }

      // Update UI optimistically
      setMoodLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === moodLogId 
            ? { ...log, is_favorite: !isFavorite } 
            : log
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status');
    }
  };

  // Delete a mood log
  const deleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this mood log?')) {
      return;
    }
    
    try {
      await api.delete(`/api/mood-logs/${logId}`);
      
      // Remove log from state with animation
      setMoodLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === logId 
            ? { ...log, isDeleting: true } 
            : log
        )
      );
      
      // Actually remove after animation completes
      setTimeout(() => {
        setMoodLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      }, 500);
      
    } catch (err) {
      console.error('Error deleting log:', err);
      setError(err.response?.data?.message || 'Failed to delete mood log');
    }
  };

  // Start editing a log
  const startEditing = (log) => {
    setEditingLogId(log.id);
    setEditNote(log.note || '');
    setSelectedMoodId(log.mood_id.toString());
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingLogId(null);
    setEditNote('');
    setSelectedMoodId('');
  };

  // Save edited log
  const saveEdit = async () => {
    try {
      const response = await api.put(`/api/mood-logs/${editingLogId}`, {
        moodId: selectedMoodId,
        note: editNote.trim() || null,
      });
      
      // Update log in state with animation
      setMoodLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === editingLogId 
            ? { ...response.data.moodLog, isUpdating: true }
            : log
        )
      );
      
      // Reset animation flag after it completes
      setTimeout(() => {
        setMoodLogs(prevLogs => 
          prevLogs.map(log => 
            log.id === editingLogId 
              ? { ...log, isUpdating: false }
              : log
          )
        );
      }, 1000);
      
      // Show success message
      setSuccessMessage('Mood updated successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset edit state
      cancelEditing();
    } catch (err) {
      console.error('Error updating log:', err);
      setError(err.response?.data?.message || 'Failed to update mood log');
    }
  };

  // Get appropriate color for mood
  const getMoodColor = (moodName) => {
    // Updated color palette to match DashboardPage
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

  // Get emoji for mood
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

  const handleMoodSelect = (moodId) => {
    setSelectedMoodId(moodId.toString());
    setSelectedMoodAnimation(true);
    setTimeout(() => setSelectedMoodAnimation(false), 600);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-2xl animate-pulse">📓</div>
          </div>
        </div>
        <p className="font-mono text-lg font-bold mb-2">LOADING MOOD JOURNAL</p>
        <p className="font-mono text-sm text-gray-600 mb-6">preparing your emotional canvas...</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black animate-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 font-mono bg-white max-w-screen-xl">
      <div className={`mb-6 md:mb-8 px-4 py-4 md:py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">MOOD JOURNAL</h1>
        <p className="text-sm text-gray-600">Log and track your moods</p>
        
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

      {/* Success message */}
      {successMessage && (
        <div className="fixed top-6 right-6 p-4 bg-green-100 border-2 border-green-500 text-green-700 font-mono shadow-lg z-50 animate-slide-in-right">
          <p className="flex items-center">
            {successMessage}
          </p>
        </div>
      )}

      {/* Log New Mood Form */}
      <div className={`border-2 border-black p-6 mb-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
        style={{ transitionDelay: '0.1s' }}>
        <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center">
          <span className="mr-2">LOG YOUR MOOD</span>
          <span className="text-sm animate-bounce">📝</span>
        </h2>
        
        {error && (
          <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 font-mono my-4 animate-shake">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="mood">
              HOW ARE YOU FEELING?
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {moods.map((mood, index) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`p-3 border-2 border-black ${getMoodColor(mood.mood_name)} hover:opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
                    selectedMoodId === mood.id.toString() 
                      ? 'ring-2 ring-black scale-105' 
                      : ''
                  } ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ 
                    transitionDelay: `${0.1 + (index * 0.05)}s`,
                    animation: selectedMoodId === mood.id.toString() && selectedMoodAnimation ? 'pulse 0.6s ease-in-out' : 'none'
                  }}
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
            <label className="block text-sm font-bold mb-2" htmlFor="note">
              NOTES (OPTIONAL)
            </label>
            <textarea
              id="note"
              className="border-2 border-black w-full p-2 h-24 bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts here..."
            ></textarea>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting || !selectedMoodId}
              className="inline-flex items-center justify-center border-2 border-black px-8 py-3 bg-yellow-300 hover:bg-yellow-400 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden group"
            >
              <span className="relative z-10">
                {submitting ? 'SAVING...' : 'LOG MOOD'}
              </span>
              <span className="absolute inset-0 h-full w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </form>
      </div>

      {/* Mood History */}
      <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: '0.2s' }}>
        <button 
          className="flex justify-between items-center w-full text-xl font-bold mb-4 border-b-2 border-black pb-2 md:cursor-text transition-all duration-300"
          onClick={() => setShowMoodHistory(!showMoodHistory)}
        >
          <span className="flex items-center">
            <span className="mr-2">YOUR MOOD HISTORY</span>
            <span className="text-sm animate-wiggle">📊</span>
          </span>
          <span className="md:hidden transition-transform duration-300" style={{ transform: showMoodHistory ? 'rotate(180deg)' : 'rotate(0)' }}>
            <FaChevronDown />
          </span>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showMoodHistory ? 'max-h-full opacity-100' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}`}>
          {moodLogs.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded animate-fade-in">
              <div className="text-4xl mb-4">👻</div>
              <p className="font-bold">No mood logs yet. Start by logging your mood above!</p>
              <p className="text-sm text-gray-500 mt-2">Your emotional journey begins with a single log.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodLogs.map((log, index) => (
                <div 
                  key={log.id} 
                  className={`border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                    log.isDeleting ? 'opacity-0 transform translate-x-full' : 
                    log.isUpdating ? 'border-green-500 bg-green-50' : ''
                  } ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: pageLoaded ? `${0.2 + (index * 0.05)}s` : '0s' }}
                >
                  {editingLogId === log.id ? (
                    /* Edit Mode */
                    <div className="animate-fade-in">
                      <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">
                          MOOD
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {moods.map(mood => (
                            <button
                              key={mood.id}
                              type="button"
                              onClick={() => setSelectedMoodId(mood.id.toString())}
                              className={`p-3 border-2 border-black ${getMoodColor(mood.mood_name)} hover:opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
                                selectedMoodId === mood.id.toString() 
                                  ? 'ring-2 ring-black scale-105' 
                                  : ''
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-lg mb-1">{getMoodEmoji(mood.mood_name)}</span>
                                <p className="text-sm font-bold text-center">{mood.mood_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">
                          NOTE
                        </label>
                        <textarea
                          className="border-2 border-black w-full p-2 h-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={cancelEditing}
                          className="border-2 border-black px-4 py-2 bg-gray-200 hover:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="border-2 border-black px-4 py-2 bg-green-300 hover:bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all relative overflow-hidden group"
                        >
                          <span className="relative z-10">Save Changes</span>
                          <span className="absolute inset-0 h-full w-0 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center flex-1 mr-2">
                          <div className={`w-10 h-10 min-w-[2.5rem] rounded-full ${getMoodColor(log.mood_name)} border-2 border-black mr-3 flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                            <span className="text-lg">{getMoodEmoji(log.mood_name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">{log.mood_name}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(log.log_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleFavorite(log.id, log.is_favorite)}
                            className="text-black hover:text-yellow-500 p-1 transition-transform duration-200 hover:scale-125"
                            aria-label={log.is_favorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            {log.is_favorite ? 
                              <FaStar size={20} className="text-yellow-500" /> : 
                              <FaRegStar size={20} />
                            }
                          </button>
                          
                          <button 
                            onClick={() => startEditing(log)}
                            className="text-black hover:text-blue-500 p-1 transition-transform duration-200 hover:scale-125"
                            aria-label="Edit log"
                          >
                            <FaEdit size={20} />
                          </button>
                          
                          <button 
                            onClick={() => deleteLog(log.id)}
                            className="text-black hover:text-red-500 p-1 transition-transform duration-200 hover:scale-125"
                            aria-label="Delete log"
                          >
                            <FaTrash size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {log.note && (
                        <p className="mt-2 text-sm text-gray-800 pl-4 md:pl-12 bg-gray-50 p-2 border-l-2 border-gray-300 break-words transition-all duration-300 hover:bg-gray-100">{log.note}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-progress-bar {
          animation: progress-bar 2s linear infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s forwards;
        }
      `}</style>
    </div>
  );
};

export default MoodLogPage;