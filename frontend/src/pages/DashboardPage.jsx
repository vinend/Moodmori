import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../constants';
import { FaPlus, FaStar, FaRegStar, FaChevronDown, FaChevronUp, FaCloud, FaCloudRain } from 'react-icons/fa';
import api from '../api/axiosConfig';

const DashboardPage = ({ user }) => {
  const [moods, setMoods] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todaysMood, setTodaysMood] = useState(null);
  const [showQuickMoods, setShowQuickMoods] = useState(false);
  const [showRecentEntries, setShowRecentEntries] = useState(true);
  const [showSparks, setShowSparks] = useState(false);
  const [skyState, setSkyState] = useState('clear');

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
        
        // Set a random sky state
        const states = ['clear', 'cloudy', 'rainy'];
        setSkyState(states[Math.floor(Math.random() * states.length)]);
        
        // Show initial spark animation after loading
        setTimeout(() => {
          setShowSparks(true);
          setTimeout(() => setShowSparks(false), 1500);
        }, 500);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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

  const getMoodColor = (moodName) => {
    // Updated color palette inspired by Omori's aesthetic
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
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <div className="text-xl animate-pulse">☁️</div>
          </div>
        </div>
        <p className="font-mono font-bold">Loading your space...</p>
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
    <div className="container mx-auto px-3 sm:px-4 py-4 font-mono bg-white max-w-screen-xl">
      {/* Welcome Header with Sky State */}
      <div className="mb-6 md:mb-8 px-4 py-4 md:py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">WELCOME, {user?.username?.toUpperCase()}</h1>
        <p className="text-sm text-gray-600">Today is {new Date().toLocaleDateString()}</p>
        
        {/* Sky state visualization */}
        <div className="mt-4 h-16 w-full rounded-md border-2 border-black overflow-hidden relative bg-gradient-to-b from-blue-300 to-blue-100">
          {skyState === 'clear' && (
            <>
              <div className="absolute left-4 top-4 w-10 h-10 rounded-full bg-yellow-300 border-2 border-yellow-400 animate-pulse-slow"></div>
              <div className="absolute left-1/4 top-3 w-12 h-6 bg-white rounded-full opacity-70"></div>
              <div className="absolute left-2/3 top-6 w-14 h-5 bg-white rounded-full opacity-60"></div>
            </>
          )}
          
          {skyState === 'cloudy' && (
            <>
              <div className="absolute left-4 top-1 w-8 h-8 text-white opacity-80">
                <FaCloud className="w-full h-full animate-bob" />
              </div>
              <div className="absolute left-1/4 top-5 w-10 h-10 text-white opacity-90">
                <FaCloud className="w-full h-full animate-bob-delayed" />
              </div>
              <div className="absolute left-2/3 top-2 w-8 h-8 text-white opacity-80">
                <FaCloud className="w-full h-full animate-bob" />
              </div>
            </>
          )}
          
          {skyState === 'rainy' && (
            <>
              <div className="absolute left-0 top-0 w-full h-full bg-blue-400 opacity-30"></div>
              <div className="absolute left-1/4 top-1 w-10 h-10 text-gray-600">
                <FaCloudRain className="w-full h-full" />
              </div>
              <div className="absolute left-2/3 top-2 w-8 h-8 text-gray-600">
                <FaCloudRain className="w-full h-full" />
              </div>
              <div className="absolute inset-0">
                <div className="animate-rain">|</div>
                <div className="animate-rain" style={{left: '20%', animationDelay: '0.2s'}}>|</div>
                <div className="animate-rain" style={{left: '40%', animationDelay: '0.5s'}}>|</div>
                <div className="animate-rain" style={{left: '60%', animationDelay: '0.3s'}}>|</div>
                <div className="animate-rain" style={{left: '80%', animationDelay: '0.7s'}}>|</div>
                <div className="animate-rain" style={{left: '90%', animationDelay: '0.1s'}}>|</div>
              </div>
            </>
          )}
        </div>
        
        {/* Animated sparkles when page loads */}
        {showSparks && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 animate-ping opacity-70">✨</div>
            <div className="absolute top-1/2 left-3/4 animate-ping opacity-70 delay-100">✨</div>
            <div className="absolute top-3/4 left-1/2 animate-ping opacity-70 delay-300">✨</div>
          </div>
        )}
        
        {/* Decorative flower element */}
        <div className="absolute top-2 right-2 text-xs border border-black rounded-full w-6 h-6 flex items-center justify-center animate-bounce-slow">
          ✿
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Today's Mood Section */}
        <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] relative group">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center">
            <span className="mr-2">TODAY'S MOOD</span>
            <div className="w-3 h-3 bg-black rounded-full animate-pulse-slow"></div>
          </h2>
          
          {/* Sketch-like decoration */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full"></div>
          </div>
          
          {todaysMood ? (
            <div className="flex items-center animate-fade-in">
              <div className={`w-12 h-12 rounded-full ${getMoodColor(todaysMood.mood_name)} border-2 border-black mr-4 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <span className="text-xl">{getMoodEmoji(todaysMood.mood_name)}</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold">{todaysMood.mood_name}</p>
                <p className="text-sm text-gray-600 break-words">{todaysMood.note || 'No notes'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in-up">
              <p className="mb-6">You haven't logged your mood today</p>
              <Link 
                to="/log" 
                className="inline-flex items-center border-2 border-black px-6 py-3 bg-yellow-300 hover:bg-yellow-400 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all relative overflow-hidden group"
              >
                <FaPlus className="mr-2 group-hover:animate-spin-slow" /> Log Today's Mood
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Log Section with toggle for mobile */}
        <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] relative">
          <button 
            className="flex justify-between items-center w-full text-xl font-bold mb-4 border-b-2 border-black pb-2 md:cursor-text"
            onClick={() => setShowQuickMoods(!showQuickMoods)}
          >
            <span className="flex items-center">
              <span className="mr-2">QUICK MOOD LOG</span>
              <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
            </span>
            <span className="md:hidden">
              {showQuickMoods ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          
          {/* Decorative element */}
          <div className="absolute top-3 right-3 opacity-20 text-2xl select-none">
            ⚬
          </div>
          
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${showQuickMoods ? 'block' : 'hidden md:grid'}`}>
            {moods.slice(0, 5).map((mood, index) => (
              <Link 
                key={mood.id}
                to={`/log?moodId=${mood.id}`}
                className={`flex flex-col items-center justify-center p-3 border-2 border-black ${getMoodColor(mood.mood_name)} hover:opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all animate-fade-in relative`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-sm font-bold text-center">{mood.mood_name}</p>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black bg-white opacity-50"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Logs Section with toggle for mobile */}
      <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] relative">
        <button 
          className="flex justify-between items-center w-full text-xl font-bold mb-4 border-b-2 border-black pb-2 md:cursor-text"
          onClick={() => setShowRecentEntries(!showRecentEntries)}
        >
          <span className="flex items-center">
            <span className="mr-2">RECENT ENTRIES</span>
            <span className="text-xs border border-black px-1 animate-pulse-slow">NEW</span>
          </span>
          <span className="md:hidden">
            {showRecentEntries ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>
        
        <div className={showRecentEntries ? 'block' : 'hidden md:block'}>
          {recentLogs.length === 0 ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="mb-4 inline-block p-6 bg-gray-100 rounded-full">
                <span className="text-4xl opacity-50">📝</span>
              </div>
              <p>No mood logs yet. Start by logging your mood!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="border-b border-black pb-4 last:border-b-0 hover:bg-gray-50 p-2 transition-colors animate-fade-in-right" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center flex-1 mr-2">
                      <div className={`w-10 h-10 min-w-[2.5rem] rounded-full ${getMoodColor(log.mood_name)} border-2 border-black mr-3 flex items-center justify-center shadow-md hover:scale-110 transition-transform`}>
                        <span>{getMoodEmoji(log.mood_name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{log.mood_name}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(log.log_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleFavorite(log.id, log.is_favorite)}
                      className="text-black hover:text-yellow-500 flex-shrink-0 group transition-transform hover:scale-110"
                    >
                      {log.is_favorite ? 
                        <FaStar size={20} className="text-yellow-500 animate-pulse-slow" /> : 
                        <FaRegStar size={20} className="group-hover:animate-spin-slow" />
                      }
                    </button>
                  </div>
                  
                  {log.note && (
                    <div className="mt-2 text-sm text-gray-800 pl-4 md:pl-12 bg-gray-50 p-2 border-l-2 border-gray-300 break-words hover:border-l-4 transition-all">
                      <p>{log.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Link 
              to="/log" 
              className="inline-block border-2 border-black px-5 py-2 bg-gray-200 hover:bg-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all relative group"
            >
              <span>View All Entries</span>
              <span className="absolute -bottom-1 -right-1 text-xl opacity-0 group-hover:opacity-30 transition-opacity">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Custom animations CSS */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-right {
          from { 
            opacity: 0;
            transform: translateX(-10px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        
        @keyframes bob-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes rain {
          from { 
            transform: translateY(-10px);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          to { 
            transform: translateY(16px);
            opacity: 0;
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out forwards;
        }
        
        .animate-bob {
          animation: bob 3s infinite ease-in-out;
        }
        
        .animate-bob-delayed {
          animation: bob-delayed 3.5s infinite ease-in-out;
          animation-delay: 0.5s;
        }
        
        .animate-rain {
          position: absolute;
          animation: rain 1.5s infinite linear;
          color: #6b7280;
          opacity: 0.7;
          font-size: 12px;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;