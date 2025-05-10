import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../constants";
import { FaPlus, FaStar, FaRegStar } from "react-icons/fa";
import api from "../api/axiosConfig";

const DashboardPage = ({ user }) => {
  const [moods, setMoods] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todaysMood, setTodaysMood] = useState(null);
  const [socialFeed, setSocialFeed] = useState([]);

  useEffect(() => {
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Ambil mood yang tersedia
      const moodsResponse = await api.get("/api/moods");
      setMoods(moodsResponse.data.moods);

      // Ambil mood log terbaru
      const logsResponse = await api.get("/api/mood-logs?limit=5");
      setRecentLogs(logsResponse.data.moodLogs);

      // Cek jika ada mood log untuk hari ini
      const today = new Date().toISOString().split("T")[0];
      const todayLog = logsResponse.data.moodLogs.find(
        (log) => new Date(log.log_date).toISOString().split("T")[0] === today
      );

      setTodaysMood(todayLog);

      // Ambil mood logs yang bersifat publik
      const socialResponse = await api.get("/api/mood-logs/public");
      setSocialFeed(socialResponse.data.moodLogs);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again later.");
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
        await api.post("/api/favorites", { moodLogId });
      }

      // Update the UI optimistically
      setRecentLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === moodLogId ? { ...log, is_favorite: !isFavorite } : log
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const getMoodColor = (moodName) => {
    const moodColors = {
      HAPPY: "bg-yellow-300",
      SAD: "bg-blue-300",
      ANGRY: "bg-red-500",
      AFRAID: "bg-purple-300",
      NEUTRAL: "bg-gray-300",
      MANIC: "bg-yellow-500",
      DEPRESSED: "bg-blue-500",
      FURIOUS: "bg-red-700",
      TERRIFIED: "bg-purple-500",
      CALM: "bg-green-300",
    };

    return moodColors[moodName] || "bg-gray-300";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono">Loading dashboard...</p>
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
    <div className="container mx-auto p-4 font-mono">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          WELCOME, {user?.username?.toUpperCase()}
        </h1>
        <p className="text-sm text-gray-600">
          Today is {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Today's Mood Section */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-4">TODAY'S MOOD</h2>

          {todaysMood ? (
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full ${getMoodColor(
                  todaysMood.mood_name
                )} mr-4`}
              ></div>
              <div>
                <p className="text-lg font-bold">{todaysMood.mood_name}</p>
                <p className="text-sm text-gray-600">
                  {todaysMood.note || "No notes"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">You haven't logged your mood today</p>
              <Link
                to="/log"
                className="inline-flex items-center border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                <FaPlus className="mr-2" /> Log Today's Mood
              </Link>
            </div>
          )}
        </div>

        {/* Quick Log Section */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xl font-bold mb-4">QUICK MOOD LOG</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moods.slice(0, 5).map((mood) => (
              <Link
                key={mood.id}
                to={`/log?moodId=${mood.id}`}
                className={`flex flex-col items-center justify-center p-2 border-2 border-black ${getMoodColor(
                  mood.mood_name
                )} hover:opacity-80`}
              >
                <p className="text-sm font-bold">{mood.mood_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs Section */}
      <div className="border-2 border-black p-6">
        <h2 className="text-xl font-bold mb-4">RECENT ENTRIES</h2>

        {recentLogs.length === 0 ? (
          <p className="text-center py-6">
            No mood logs yet. Start by logging your mood!
          </p>
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${getMoodColor(
                        log.mood_name
                      )} mr-4`}
                    ></div>
                    <div>
                      <p className="font-bold">{log.mood_name}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(log.log_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(log.id, log.is_favorite)}
                    className="text-black hover:text-yellow-500"
                  >
                    {log.is_favorite ? (
                      <FaStar size={20} className="text-yellow-500" />
                    ) : (
                      <FaRegStar size={20} />
                    )}
                  </button>
                </div>

                {log.note && (
                  <p className="mt-2 text-sm text-gray-800 pl-12">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/log"
            className="inline-block border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          >
            View All Entries
          </Link>
        </div>
      </div>
      {/* Social Feed Section */}
      <div className="border-2 border-black p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">SOCIAL FEED</h2>

        {socialFeed.length === 0 ? (
          <p className="text-center py-6">
            No public mood logs from others yet.
          </p>
        ) : (
          <div className="space-y-4">
            {socialFeed.map((log) => (
              <div
                key={log.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${getMoodColor(
                        log.mood_name
                      )} mr-4`}
                    ></div>
                    <div>
                      <p className="font-bold">{log.mood_name}</p>
                      <p className="text-xs text-gray-600">
                        by{" "}
                        {log.username === user.username ? "You" : log.username}{" "}
                        on {new Date(log.log_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {log.note && (
                  <p className="mt-2 text-sm text-gray-800 pl-12">{log.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
