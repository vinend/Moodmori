import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

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
        
        const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
        
        const statsResponse = await api.get(
          `/api/mood-logs/stats${formattedStartDate ? `?startDate=${formattedStartDate}` : ''}`
        );
        
        setStats(statsResponse.data.stats);
        
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
  
  const calculatePercentages = () => {
    const total = stats.reduce((sum, item) => sum + parseInt(item.count), 0);
    return stats.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0
    }));
  };
  
  const generateCalendarData = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    const lastDayOfCalendar = new Date(lastDayOfMonth);
    const remainingDays = 6 - lastDayOfCalendar.getDay();
    lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + remainingDays);
    
    const calendar = [];
    const currentDate = new Date(firstDayOfCalendar);
    
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

  const generateChartData = () => {
    const moodPercentages = calculatePercentages();
    
    return {
      labels: moodPercentages.map(mood => mood.mood_name),
      datasets: [
        {
          data: moodPercentages.map(mood => mood.count),
          backgroundColor: moodPercentages.map(mood => getMoodColor(mood.mood_name)),
          borderColor: 'black',
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'VT323',
            size: 14
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
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
            <div className="h-[300px]">
              <Doughnut data={generateChartData()} options={chartOptions} />
            </div>
          )}
        </div>
        
        {/* Mood Calendar */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-6">MOOD CALENDAR</h2>
          
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold text-sm py-2">
                {day}
              </div>
            ))}
            
            {calendarData.map((day, index) => (
              <div 
                key={index}
                className={`
                  aspect-square border p-1 flex flex-col
                  ${day.isToday ? 'border-2 border-black' : 'border-gray-200'}
                  ${day.isCurrentMonth ? '' : 'text-gray-400'}
                `}
              >
                <div className="text-xs mb-1">{day.date.getDate()}</div>
                
                <div className="flex flex-wrap gap-1 justify-center">
                  {day.logs.map((log, logIndex) => (
                    <div
                      key={logIndex}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getMoodColor(log.mood_name) }}
                      title={`${log.mood_name} - ${new Date(log.log_date).toLocaleTimeString()}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mood Timeline */}
        <div className="border-2 border-black p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">MOOD FREQUENCY</h2>
          
          {moodLogs.length === 0 ? (
            <p className="text-center py-6">No mood data available for this timeframe.</p>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border-2 border-black p-4 text-center">
                  <p className="text-sm mb-2">Total Entries</p>
                  <p className="text-2xl font-bold">{moodLogs.length}</p>
                </div>
                <div className="border-2 border-black p-4 text-center">
                  <p className="text-sm mb-2">Most Common</p>
                  <p className="text-2xl font-bold">{stats.length > 0 ? stats[0].mood_name : 'None'}</p>
                </div>
                <div className="border-2 border-black p-4 text-center">
                  <p className="text-sm mb-2">Average Per Week</p>
                  <p className="text-2xl font-bold">
                    {timeframe === 'week' 
                      ? moodLogs.length 
                      : Math.round((moodLogs.length / 
                          (timeframe === 'month' ? 4 : 
                           timeframe === 'year' ? 52 : 
                           Math.ceil(moodLogs.length / 7))) * 10) / 10}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
