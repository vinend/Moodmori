import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const StatsPage = () => {
  const [stats, setStats] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSparks, setShowSparks] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Calculate start date based on selected timeframe
        let startDate = null;
        const now = new Date();
        
        if (timeframe === 'week') {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeframe === 'month') {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeframe === 'year') {
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        // Format start date for API
        const formattedStartDate = startDate ? 
          startDate.toISOString().split('T')[0] : null;
          
        // Fetch mood stats
        const statsResponse = await api.get(
          `/api/mood-logs/stats${formattedStartDate ? `?startDate=${formattedStartDate}` : ''}`
        );
        
        setStats(statsResponse.data.stats);
        
        // Fetch mood logs for the same timeframe
        const logsResponse = await api.get(
          `/api/mood-logs${formattedStartDate ? `?startDate=${formattedStartDate}` : ''}`
        );
        
        setMoodLogs(logsResponse.data.moodLogs);

        // Show initial spark animation after loading
        setTimeout(() => {
          setShowSparks(true);
          setTimeout(() => setShowSparks(false), 1500);
        }, 300);
        
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
        setPageLoaded(true);
      }
    };
    
    fetchStats();
  }, [timeframe]);
  
  // Get appropriate color for mood
  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': '#FFE156',
      'SAD': '#5690FF',
      'ANGRY': '#FF5656',
      'AFRAID': '#BF7DFF',
      'NEUTRAL': '#E5E5E5',
      'MANIC': '#FFCF56',
      'DEPRESSED': '#5670FF',
      'FURIOUS': '#FF3A3A',
      'TERRIFIED': '#A346FF',
      'CALM': '#7DFFBF',
    };
    
    return moodColors[moodName] || '#E5E5E5';
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
  
  // Calculate percentages for mood distribution
  const calculatePercentages = () => {
    const total = stats.reduce((sum, item) => sum + parseInt(item.count), 0);
    return stats.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0
    }));
  };
  
  // Generate monthly calendar data
  const generateCalendarData = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Determine the first day to display (might be from previous month)
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    // Determine the last day to display (might be from next month)
    const lastDayOfCalendar = new Date(lastDayOfMonth);
    const remainingDays = 6 - lastDayOfCalendar.getDay();
    lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + remainingDays);
    
    const calendar = [];
    const currentDate = new Date(firstDayOfCalendar);
    
    // Generate all days for the calendar
    while (currentDate <= lastDayOfCalendar) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayLogs = moodLogs.filter(log => 
        new Date(log.log_date).toISOString().split('T')[0] === dateString
      );
      
      calendar.push({
        date: new Date(currentDate),
        logs: dayLogs,
        isCurrentMonth: currentDate.getMonth() === today.getMonth(),
        isToday: dateString === new Date().toISOString().split('T')[0]
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 bg-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-2xl animate-pulse">📊</div>
          </div>
        </div>
        <p className="font-mono text-lg font-bold mb-2">CALCULATING STATS</p>
        <p className="font-mono text-sm text-gray-600 mb-6">please wait...</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black animate-progress-bar"></div>
        </div>
      </div>
    );
  }

  const moodPercentages = calculatePercentages();
  const calendarData = generateCalendarData();
  const dominantMood = stats.length > 0 ? stats.reduce((prev, current) => 
    parseInt(prev.count) > parseInt(current.count) ? prev : current) : null;

  return (
    <div className="container mx-auto p-4 font-mono bg-white">
      <div className={`mb-8 px-6 py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <span className="mr-2">MOOD STATISTICS</span>
          <span className="animate-pulse">📊</span>
        </h1>
        <p className="text-sm text-gray-600">Track your emotional journey over time</p>
        
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
      
      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}
      
      {/* Timeframe selector */}
      <div className="mb-8">
        <div className="flex border-2 border-black inline-flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button 
            onClick={() => setTimeframe('week')} 
            className={`px-4 py-2 transition-all duration-200 ${timeframe === 'week' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            WEEK
          </button>
          <button 
            onClick={() => setTimeframe('month')} 
            className={`px-4 py-2 transition-all duration-200 ${timeframe === 'month' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            MONTH
          </button>
          <button 
            onClick={() => setTimeframe('year')} 
            className={`px-4 py-2 transition-all duration-200 ${timeframe === 'year' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            YEAR
          </button>
          <button 
            onClick={() => setTimeframe('all')} 
            className={`px-4 py-2 transition-all duration-200 ${timeframe === 'all' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            ALL TIME
          </button>
        </div>
      </div>
      
      {/* Dominant Mood Display - New Section */}
      {dominantMood && (
        <div className={`mb-8 border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-4">DOMINANT MOOD</h2>
          
          <div className="flex items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center" 
                style={{ backgroundColor: getMoodColor(dominantMood.mood_name) }}>
                <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
                  {getMoodEmoji(dominantMood.mood_name)}
                </span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center text-sm font-bold animate-pulse">
                #1
              </div>
            </div>
            
            <div className="ml-6">
              <h3 className="text-2xl font-bold mb-1">{dominantMood.mood_name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your most frequent mood this {timeframe === 'week' ? 'week' : 
                                             timeframe === 'month' ? 'month' : 
                                             timeframe === 'year' ? 'year' : 'overall'}
              </p>
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{dominantMood.count}</span>
                <span className="text-sm text-gray-600">times recorded</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Distribution */}
        <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">MOOD DISTRIBUTION</span>
            <span className="text-sm animate-wiggle">📈</span>
          </h2>
          
          {moodPercentages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
              <div className="text-4xl mb-4">👻</div>
              <p className="font-bold">No mood data available for this timeframe.</p>
              <p className="text-sm text-gray-500 mt-2">Try selecting a different time period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {moodPercentages.map((mood, index) => (
                <div key={mood.mood_id} className={`mb-4 transition-all duration-300 transform ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} 
                  style={{ transitionDelay: `${0.1 + (index * 0.1)}s` }}>
                  <div className="flex justify-between mb-1">
                    <div className="font-bold flex items-center">
                      <span className="mr-2">{mood.mood_name}</span>
                      <span>{getMoodEmoji(mood.mood_name)}</span>
                    </div>
                    <span>{mood.percentage}% ({mood.count})</span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 border border-black overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${pageLoaded ? mood.percentage : 0}%`, 
                        backgroundColor: getMoodColor(mood.mood_name)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Mood Calendar */}
        <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">MOOD CALENDAR</span>
            <span className="text-sm animate-wiggle">📅</span>
          </h2>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div key={day} className="text-center font-bold text-sm py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarData.map((day, index) => {
              const mainMood = day.logs.length > 0 ? day.logs[0] : null;
              
              return (
                <div 
                  key={index}
                  className={`
                    aspect-square border-2 flex flex-col items-center justify-center transition-all duration-300
                    ${day.isToday ? 'border-2 border-black bg-yellow-50' : day.isCurrentMonth ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}
                    ${day.isCurrentMonth ? 'text-black' : 'text-gray-400'}
                    ${mainMood ? 'hover:scale-110 cursor-pointer' : 'hover:bg-gray-50'}
                    ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                  `}
                  style={{ transitionDelay: `${0.3 + (index * 0.01)}s` }}
                  title={mainMood ? `${mainMood.mood_name}${mainMood.note ? ': ' + mainMood.note : ''}` : ''}
                >
                  <div className={`text-xs ${day.isToday ? 'font-bold' : ''}`}>{day.date.getDate()}</div>
                  
                  {mainMood && (
                    <div 
                      className="w-6 h-6 rounded-full mt-1 flex items-center justify-center border border-black" 
                      style={{ backgroundColor: getMoodColor(mainMood.mood_name) }}
                    >
                      <span className="text-xs">{getMoodEmoji(mainMood.mood_name)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mood Frequency */}
        <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">MOOD FREQUENCY</span>
            <span className="text-sm animate-wiggle">📝</span>
          </h2>
          
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 mb-4 transition-all duration-500" 
            style={{ transform: pageLoaded ? 'translateX(0)' : 'translateX(-20px)', opacity: pageLoaded ? 1 : 0 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm">TOTAL ENTRIES:</span>
              <span className="font-bold text-lg">{moodLogs.length}</span>
            </div>
            
            <div className="w-full bg-gray-200 h-2 relative mb-4">
              <div className="absolute top-0 left-0 h-full bg-black transition-all duration-1000 ease-out"
                style={{ width: pageLoaded ? '100%' : '0%' }}></div>
            </div>
            
            {moodLogs.length > 0 && (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const height = Math.max(4, Math.min(40, Math.floor(Math.random() * 40)));
                  return (
                    <div key={i} className="flex flex-col items-center justify-end">
                      <div 
                        className="w-4 bg-black transition-all duration-1000 ease-out" 
                        style={{ 
                          height: pageLoaded ? `${height}px` : '0px',
                          transitionDelay: `${0.5 + (i * 0.1)}s`
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {moodLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="font-bold">No mood data available for this timeframe.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center mb-3 transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '0.5s' }}>
                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center mr-3">
                  <span>🏆</span>
                </div>
                <div>
                  <p className="font-bold">Most common mood:
                    <span className="ml-2">
                      {stats.length > 0 ? stats[0].mood_name : 'None'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center mb-3 transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '0.6s' }}>
                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center mr-3">
                  <span>📊</span>
                </div>
                <div>
                  <p className="font-bold">Average entries per week:
                    <span className="ml-2">
                      {timeframe === 'week' 
                        ? moodLogs.length 
                        : Math.round((moodLogs.length / 
                            (timeframe === 'month' ? 4 : 
                             timeframe === 'year' ? 52 : 
                             Math.ceil(moodLogs.length / 7))) * 10) / 10}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: '0.7s' }}>
                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center mr-3">
                  <span>📆</span>
                </div>
                <div>
                  <p className="font-bold">Last recorded:
                    <span className="ml-2">
                      {moodLogs.length > 0 
                        ? new Date(moodLogs[0].log_date).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
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
        
        .animate-progress-bar {
          animation: progress-bar 2s linear infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StatsPage;