import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const StatsPage = () => {
  const [stats, setStats] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [timeframe]);
  
  // Get appropriate color for mood
  const getMoodColor = (moodName) => {
    const moodColors = {
      'HAPPY': '#FFE156', // yellow
      'SAD': '#5690FF', // blue
      'ANGRY': '#FF5656', // red
      'AFRAID': '#BF7DFF', // purple
      'NEUTRAL': '#E5E5E5', // gray
      'MANIC': '#FFCF56', // bright yellow
      'DEPRESSED': '#5670FF', // deep blue
      'FURIOUS': '#FF3A3A', // bright red
      'TERRIFIED': '#A346FF', // deep purple
      'CALM': '#7DFFBF', // mint green
    };
    
    return moodColors[moodName] || '#E5E5E5';
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
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono">Computing statistics...</p>
      </div>
    );
  }

  const moodPercentages = calculatePercentages();
  const calendarData = generateCalendarData();

  return (
    <div className="container mx-auto p-4 font-mono">
      <h1 className="text-2xl font-bold mb-6">MOOD STATISTICS</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}
      
      {/* Timeframe selector */}
      <div className="mb-8">
        <div className="flex border-2 border-black inline-flex">
          <button 
            onClick={() => setTimeframe('week')} 
            className={`px-4 py-2 ${timeframe === 'week' ? 'bg-black text-white' : 'bg-white'}`}
          >
            WEEK
          </button>
          <button 
            onClick={() => setTimeframe('month')} 
            className={`px-4 py-2 ${timeframe === 'month' ? 'bg-black text-white' : 'bg-white'}`}
          >
            MONTH
          </button>
          <button 
            onClick={() => setTimeframe('year')} 
            className={`px-4 py-2 ${timeframe === 'year' ? 'bg-black text-white' : 'bg-white'}`}
          >
            YEAR
          </button>
          <button 
            onClick={() => setTimeframe('all')} 
            className={`px-4 py-2 ${timeframe === 'all' ? 'bg-black text-white' : 'bg-white'}`}
          >
            ALL TIME
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Distribution */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6">MOOD DISTRIBUTION</h2>
          
          {moodPercentages.length === 0 ? (
            <p className="text-center py-6">No mood data available for this timeframe.</p>
          ) : (
            <div className="space-y-4">
              {moodPercentages.map(mood => (
                <div key={mood.mood_id} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">{mood.mood_name}</span>
                    <span>{mood.percentage}% ({mood.count})</span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 border border-black">
                    <div 
                      className="h-full" 
                      style={{ 
                        width: `${mood.percentage}%`, 
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
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6">MOOD CALENDAR</h2>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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
                    aspect-square border flex flex-col items-center justify-center
                    ${day.isToday ? 'border-2 border-black' : 'border-gray-200'}
                    ${day.isCurrentMonth ? '' : 'text-gray-400'}
                  `}
                >
                  <div className="text-xs">{day.date.getDate()}</div>
                  
                  {mainMood && (
                    <div 
                      className="w-4 h-4 rounded-full mt-1" 
                      style={{ backgroundColor: getMoodColor(mainMood.mood_name) }}
                      title={mainMood.mood_name}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mood Frequency */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6">MOOD FREQUENCY</h2>
          
          <p className="mb-4">Total entries: {moodLogs.length}</p>
          
          {moodLogs.length === 0 ? (
            <p className="text-center py-6">No mood data available for this timeframe.</p>
          ) : (
            <div>
              <p className="mb-2">Most common mood: 
                <span className="font-bold ml-2">
                  {stats.length > 0 ? stats[0].mood_name : 'None'}
                </span>
              </p>
              <p className="mb-2">Average entries per week:
                <span className="font-bold ml-2">
                  {timeframe === 'week' 
                    ? moodLogs.length 
                    : Math.round((moodLogs.length / 
                        (timeframe === 'month' ? 4 : 
                         timeframe === 'year' ? 52 : 
                         Math.ceil(moodLogs.length / 7))) * 10) / 10}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;