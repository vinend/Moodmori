import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MoodLogPage from './pages/MoodLogPage';
import FavoritesPage from './pages/FavoritesPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/Settings';
import NotFoundPage from './pages/NotFoundPage';
import PublicMoodLogFeedPage from './pages/PublicMoodLogFeedPage';
import ConsultantPage from './pages/ConsultantPage'; // Added ConsultantPage

// Components
import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import LoadingScreen from './components/LoadingScreen';
import ChatPanel from './components/ChatPanel';

// API
import api from './api/axiosConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const audioRef = useRef(null);

  // Music tracks from assets
  const musicTracks = [
    '/src/assets/music/166. You Must Carry On..mp3',
    '/src/assets/music/88. Lost Library.mp3',
    '/src/assets/music/12. Trees....mp3',
    '/src/assets/music/163. Crossroads.mp3',
    '/src/assets/music/112. H20 -HCL.mp3',
  ];

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/api/auth/profile');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // If there's a response but no user data
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Explicitly set authentication state to false on error
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Display loading screen for at least 1 second for immersion
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Update user information after profile update
  const handleProfileUpdate = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  // Toggle chat panel
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const handleChatClose = () => setIsChatOpen(false);

  // Handle end of song and play next track
  const handleSongEnd = () => {
    setCurrentTrack((prevTrack) => (prevTrack + 1) % musicTracks.length);
  };

  // Handle previous track button
  const handlePreviousTrack = () => {
    setCurrentTrack((prevTrack) => (prevTrack - 1 + musicTracks.length) % musicTracks.length);
  };

  // Handle next track button
  const handleNextTrack = () => {
    setCurrentTrack((prevTrack) => (prevTrack + 1) % musicTracks.length);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen w-full bg-white font-mono relative">
        <AudioPlayer 
          src={musicTracks[currentTrack]} 
          onEnded={handleSongEnd}
          onPrevious={handlePreviousTrack}
          onNext={handleNextTrack}
          songName={musicTracks[currentTrack].split('/').pop().replace(/\.[^/.]+$/, '')}
          ref={audioRef}
        />

        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} onChatToggle={toggleChat} isChatOpen={isChatOpen} />}

        <div className="flex flex-1 relative">
          <main className={`w-full transition-all duration-300 ${isChatOpen ? 'pl-64' : ''}`}>
            <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <Routes>
                <Route 
                  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} 
                />
                <Route 
                  path="/register" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={isAuthenticated ? <DashboardPage user={user} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/log" 
                  element={isAuthenticated ? <MoodLogPage user={user} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/favorites" 
                  element={isAuthenticated ? <FavoritesPage user={user} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/stats" 
                  element={isAuthenticated ? <StatsPage user={user} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/settings" 
                  element={isAuthenticated ? <SettingsPage user={user} onProfileUpdate={handleProfileUpdate} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/public-feed" 
                  element={isAuthenticated ? <PublicMoodLogFeedPage user={user} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/consultant" 
                  element={isAuthenticated ? <ConsultantPage user={user} /> : <Navigate to="/" />} 
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>

          {isAuthenticated && (
            <ChatPanel 
              isOpen={isChatOpen} 
              onClose={toggleChat} 
              user={user}
            />
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
