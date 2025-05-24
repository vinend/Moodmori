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
import { Doughnut } from 'react-chartjs-2';
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
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // fe-aliya's UI state
  const [showSparks, setShowSparks] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setPageLoaded(false); // Reset pageLoaded on new fetch
      try {
        let startDate = null;
        const now = new Date();

        if (timeframe === "week") {
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
        } else if (timeframe === "month") {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (timeframe === "year") {
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const formattedStartDate = startDate
          ? startDate.toISOString().split('T')[0]
          : null;

        const statsResponse = await api.get(
          `/api/mood-logs/stats${formattedStartDate ? `?startDate=${formattedStartDate}` : ""}`
        );
        setStats(statsResponse.data.stats);

        const logsResponse = await api.get(
          `/api/mood-logs${formattedStartDate ? `?startDate=${formattedStartDate}` : ""}`
        );
        setMoodLogs(logsResponse.data.moodLogs);

        // fe-aliya's page load animations
        setTimeout(() => {
          setPageLoaded(true); // Set pageLoaded after data is fetched
          setTimeout(() => {
            setShowSparks(true);
            setTimeout(() => setShowSparks(false), 1500);
          }, 300); // Sparks after page content starts animating in
        }, 50); // Short delay to allow loading state to clear

      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
        // setPageLoaded(true); // Moved pageLoaded set into try block success or after a small delay
      }
    };

    fetchStats();
  }, [timeframe]);

  const getMoodColor = (moodName) => { // Using master's version with comments
    const moodColors = {
      'HAPPY': '#FFE156',     // yellow
      'SAD': '#5690FF',       // blue
      'ANGRY': '#FF5656',     // red
      'AFRAID': '#BF7DFF',    // purple
      'NEUTRAL': '#E5E5E5',   // gray
      'MANIC': '#FFCF56',     // bright yellow
      'DEPRESSED': '#5670FF', // deep blue
      'FURIOUS': '#FF3A3A',   // bright red
      'TERRIFIED': '#A346FF', // deep purple
      'CALM': '#7DFFBF',      // mint green
    };
    return moodColors[moodName] || "#E5E5E5";
  };

  const getMoodEmoji = (moodName) => { // from fe-aliya
    const moodEmojis = {
      'HAPPY': '😊', 'SAD': '😢', 'ANGRY': '😠', 'AFRAID': '😨', 'NEUTRAL': '😐',
      'MANIC': '😆', 'DEPRESSED': '😔', 'FURIOUS': '😡', 'TERRIFIED': '😱', 'CALM': '😌',
    };
    return moodEmojis[moodName] || '😐';
  };
  
  // calculatePercentages not directly used by Doughnut chart, but kept if needed elsewhere
  const calculatePercentages = () => {
    const total = stats.reduce((sum, item) => sum + parseInt(item.count), 0);
    return stats.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((parseInt(item.count) / total) * 100) : 0,
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
    let currentDate = new Date(firstDayOfCalendar);
    while (currentDate <= lastDayOfCalendar) {
      const dateString = currentDate.toISOString().split("T")[0];
      const dayLogs = moodLogs.filter(
        (log) => new Date(log.log_date).toISOString().split("T")[0] === dateString
      );
      calendar.push({
        date: new Date(currentDate),
        logs: dayLogs,
        isCurrentMonth: currentDate.getMonth() === today.getMonth(),
        isToday: dateString === new Date().toISOString().split("T")[0],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return calendar;
  };

  const generateChartData = () => ({ // For Doughnut chart
    labels: stats.map(mood => mood.mood_name),
    datasets: [{
      data: stats.map(mood => parseInt(mood.count)),
      backgroundColor: stats.map(mood => getMoodColor(mood.mood_name)),
      borderColor: 'black',
      borderWidth: 2,
    }],
  });

  const chartOptions = { // For Doughnut chart
    plugins: {
      legend: { position: 'right', labels: { font: { family: 'monospace', size: 12 } } }, // Using monospace for consistency
    },
    responsive: true, maintainAspectRatio: false,
  };

  if (loading && !pageLoaded) { // fe-aliya's styled loading state
    return (
      <div className="flex flex-col items-center justify-center h-screen py-16 bg-white"> {/* Full screen height */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="text-2xl animate-pulse">📊</div>
          </div>
        </div>
        <p className="font-mono text-lg font-bold mb-2 text-black">CALCULATING STATS</p>
        <p className="font-mono text-sm text-gray-600 mb-6">please wait...</p>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black animate-progress-bar"></div>
        </div>
      </div>
    );
  }

  const calendarData = generateCalendarData();
  const dominantMood = stats.length > 0 ? stats.reduce((prev, current) =>
    parseInt(prev.count) > parseInt(current.count) ? prev : current, stats[0]) : null;
  // const moodPercentages = calculatePercentages(); // Only if fe-aliya's progress bars were used

  return (
    <div className="container mx-auto p-4 font-mono bg-white">
      {/* Header from fe-aliya */}
      <div className={`mb-8 px-6 py-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-500 rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-3xl font-bold mb-2 flex items-center text-black">
          <span className="mr-2">MOOD STATISTICS</span>
          <span className="animate-pulse">📊</span>
        </h1>
        <p className="text-sm text-gray-600">Track your emotional journey over time</p>
        {showSparks && (
          <div className="absolute inset-0 pointer-events-none">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute animate-ping opacity-70 text-yellow-400" style={{ top: `${Math.random()*80+10}%`, left: `${Math.random()*80+10}%`, animationDelay: `${Math.random()*1}s`, fontSize: `${Math.random()*0.5+0.75}rem`}}>✨</div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md">
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Timeframe selector - fe-aliya's styling */}
      <div className="mb-8">
        <div className="flex border-2 border-black inline-flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden">
          {['week', 'month', 'year', 'all'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 transition-all duration-200 text-sm sm:text-base ${timeframe === tf ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Dominant Mood Display from fe-aliya */}
      {dominantMood && (
        <div className={`mb-8 border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: pageLoaded ? '0.1s' : '0s' }}>
          <h2 className="text-xl font-bold mb-4 text-black">DOMINANT MOOD</h2>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-black flex items-center justify-center" style={{ backgroundColor: getMoodColor(dominantMood.mood_name) }}>
                <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
                  {getMoodEmoji(dominantMood.mood_name)}
                </span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center text-xs sm:text-sm font-bold animate-pulse">#1</div>
            </div>
            <div className="ml-4 sm:ml-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 text-black">{dominantMood.mood_name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Your most frequent mood this {timeframe === 'all' ? 'overall' : timeframe}
              </p>
              <div className="flex items-center">
                <span className="font-bold text-base sm:text-lg mr-2 text-black">{dominantMood.count}</span>
                <span className="text-xs sm:text-sm text-gray-600">times recorded</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Distribution - Doughnut chart from master, in fe-aliya's card */}
        <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: pageLoaded ? '0.2s' : '0s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center text-black">
            <span className="mr-2">MOOD DISTRIBUTION</span>
            <span className="text-sm animate-wiggle">📈</span>
          </h2>
          {stats.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
              <div className="text-4xl mb-4">👻</div>
              <p className="font-bold text-black">No mood data for this timeframe.</p>
              <p className="text-sm text-gray-500 mt-2">Try selecting another period.</p>
            </div>
          ) : (
            <div className="h-[250px] sm:h-[300px]">
              <Doughnut data={generateChartData()} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Mood Calendar - fe-aliya's card, master's multi-dot display logic */}
        <div className={`border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: pageLoaded ? '0.3s' : '0s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center text-black">
            <span className="mr-2">MOOD CALENDAR</span>
            <span className="text-sm animate-wiggle">📅</span>
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-bold text-xs sm:text-sm py-1 text-black">{day}</div>
            ))}
            {calendarData.map((day, index) => (
              <div key={index}
                className={`aspect-square border flex flex-col items-center justify-center p-0.5 sm:p-1 transition-all duration-150 rounded-sm
                  ${day.isToday ? 'border-2 border-black bg-yellow-100' : day.isCurrentMonth ? 'border-gray-300 hover:bg-gray-50' : 'border-gray-200 bg-gray-50'}
                  ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: `${0.3 + (index * 0.005)}s` }} // Faster stagger for calendar days
                title={day.logs.length > 0 ? day.logs.map(l => l.mood_name).join(', ') : ''}
              >
                <div className={`text-[0.6rem] sm:text-xs ${day.isToday ? 'font-bold text-black' : day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>{day.date.getDate()}</div>
                <div className="flex flex-wrap gap-0.5 justify-center items-center mt-0.5">
                  {day.logs.slice(0, 4).map((log, logIndex) => ( // Max 4 dots for small cells
                    <div key={logIndex} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-black/50"
                         style={{ backgroundColor: getMoodColor(log.mood_name) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Frequency - Using master's 3-box layout within fe-aliya's card, full width */}
      <div className={`mt-8 border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] rounded-md lg:col-span-2 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: pageLoaded ? '0.4s' : '0s' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center text-black">
          <span className="mr-2">MOOD FREQUENCY</span>
          <span className="text-sm animate-wiggle">📝</span>
        </h2>
        {moodLogs.length === 0 ? (
           <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
             <div className="text-4xl mb-4">🔍</div>
             <p className="font-bold text-black">No mood data available for this timeframe.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "TOTAL ENTRIES", value: moodLogs.length, icon: "📚" },
              { title: "MOST COMMON", value: stats.length > 0 ? stats.sort((a,b) => parseInt(b.count) - parseInt(a.count))[0].mood_name : 'N/A', icon: "🏆" },
              { title: "AVERAGE PER WEEK", value: timeframe === 'week' ? moodLogs.length : Math.round((moodLogs.length / (timeframe === 'month' ? 4 : timeframe === 'year' ? 52 : (moodLogs.length > 0 ? Math.max(1, Math.ceil((new Date(moodLogs[0].log_date) - new Date(moodLogs[moodLogs.length - 1].log_date)) / (1000 * 60 * 60 * 24 * 7))) : 1))) * 10) / 10 || 0, icon: "📊" }
            ].map((item, index) => (
              <div key={item.title} className={`p-4 border-2 border-black bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] rounded-md transition-all duration-300 transform ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${0.4 + (index * 0.1)}s` }}>
                <div className="flex items-center text-xs sm:text-sm text-gray-700 mb-1">
                  <span className="mr-1">{item.icon}</span>{item.title}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-black">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSX styles from fe-aliya */}
      <style jsx>{`
        @keyframes progress-bar { 0% { width: 0%; } 100% { width: 100%; } }
        @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(7deg); } 75% { transform: rotate(-7deg); } } /* Adjusted wiggle */
        /* Ensure ping for sparkles is defined if not globally available */
        @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0;}}
        .animate-progress-bar { animation: progress-bar 1.5s ease-in-out forwards; }
        .animate-wiggle { animation: wiggle 0.8s ease-in-out infinite; }
        .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default StatsPage;