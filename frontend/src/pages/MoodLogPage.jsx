import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';
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
      
      // Add new log to state and reset form
      setMoodLogs(prevLogs => [response.data.moodLog, ...prevLogs]);
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
      
      // Remove log from state
      setMoodLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
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
      
      // Update log in state
      setMoodLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === editingLogId 
            ? response.data.moodLog
            : log
        )
      );
      
      // Reset edit state
      cancelEditing();
    } catch (err) {
      console.error('Error updating log:', err);
      setError(err.response?.data?.message || 'Failed to update mood log');
    }
  };

  // Get appropriate color for mood
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
        <p className="font-mono">Loading mood logs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-mono">
      <h1 className="text-2xl font-bold mb-6">MOOD JOURNAL</h1>

      {/* Log New Mood Form */}
      <div className="border-2 border-black p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">LOG YOUR MOOD</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="mood">
              HOW ARE YOU FEELING?
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {moods.map(mood => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMoodId(mood.id.toString())}
                  className={`p-2 border-2 ${
                    selectedMoodId === mood.id.toString() 
                      ? 'border-black' 
                      : 'border-gray-300'
                  } ${getMoodColor(mood.mood_name)}`}
                >
                  {mood.mood_name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="note">
              NOTES (OPTIONAL)
            </label>
            <textarea
              id="note"
              className="border-2 border-black w-full p-2 h-24 bg-white text-black"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts here..."
            ></textarea>
          </div>
          
          <button
            type="submit"
            disabled={submitting || !selectedMoodId}
            className="w-full bg-white border-2 border-black py-2 px-4 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            {submitting ? 'SAVING...' : 'LOG MOOD'}
          </button>
        </form>
      </div>

      {/* Mood History */}
      <div className="border-2 border-black p-6">
        <h2 className="text-xl font-bold mb-4">YOUR MOOD HISTORY</h2>
        
        {moodLogs.length === 0 ? (
          <p className="text-center py-6">No mood logs yet. Start by logging your mood above!</p>
        ) : (
          <div className="space-y-4">
            {moodLogs.map(log => (
              <div key={log.id} className="border-2 border-gray-200 p-4">
                {editingLogId === log.id ? (
                  /* Edit Mode */
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2">
                        MOOD
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {moods.map(mood => (
                          <button
                            key={mood.id}
                            type="button"
                            onClick={() => setSelectedMoodId(mood.id.toString())}
                            className={`p-2 border-2 ${
                              selectedMoodId === mood.id.toString() 
                                ? 'border-black' 
                                : 'border-gray-300'
                            } ${getMoodColor(mood.mood_name)}`}
                          >
                            {mood.mood_name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2">
                        NOTE
                      </label>
                      <textarea
                        className="border-2 border-black w-full p-2 h-24"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEditing}
                        className="border-2 border-gray-400 px-4 py-1 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="border-2 border-black px-4 py-1 hover:bg-black hover:text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${getMoodColor(log.mood_name)} mr-4`}></div>
                        <div>
                          <p className="font-bold">{log.mood_name}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(log.log_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => toggleFavorite(log.id, log.is_favorite)}
                          className="text-black hover:text-yellow-500"
                          aria-label={log.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          {log.is_favorite ? 
                            <FaStar size={18} className="text-yellow-500" /> : 
                            <FaRegStar size={18} />
                          }
                        </button>
                        
                        <button 
                          onClick={() => startEditing(log)}
                          className="text-black hover:text-blue-500"
                          aria-label="Edit log"
                        >
                          <FaEdit size={18} />
                        </button>
                        
                        <button 
                          onClick={() => deleteLog(log.id)}
                          className="text-black hover:text-red-500"
                          aria-label="Delete log"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {log.note && (
                      <p className="mt-2 text-sm text-gray-800 pl-12">{log.note}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodLogPage;