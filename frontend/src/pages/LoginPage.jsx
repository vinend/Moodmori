import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/login', { email, password });
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Icon components
  const EmailIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="20" height="16" rx="2" stroke="#B449E9" strokeWidth="2"/>
      <path d="M4 8L14 14L24 8" stroke="#B449E9" strokeWidth="2"/>
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="16" height="12" rx="2" fill="#B449E9" fillOpacity="0.5"/>
      <path d="M8 12V8C8 5.79086 9.79086 4 12 4H16C18.2091 4 20 5.79086 20 8V12" stroke="#B449E9" strokeWidth="2"/>
      <circle cx="14" cy="18" r="2" fill="white"/>
    </svg>
  );
  
  const CornerDecoration = ({ position }) => (
    <svg className={`w-5 h-5 absolute ${position}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19M1 1V19M1 1L19 19" stroke="black" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-stone-100 p-4">
      <div className="w-full max-w-md bg-white p-8 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Corner decorations */}
        <CornerDecoration position="left-6 top-6" />
        <CornerDecoration position="right-6 top-6 rotate-90" />
        <CornerDecoration position="left-6 bottom-6 -rotate-90" />
        <CornerDecoration position="right-6 bottom-6 rotate-180" />
        
        <h1 className="text-xl font-['Press_Start_2P'] mb-2 text-purple-500 text-center">
          START<br/>MOODMORI
        </h1>
        <p className="mb-8 text-center text-xs text-stone-500 font-['Radio_Canada']">
          Track your emotional journey in the style of OMORI
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 font-['Radio_Canada'] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada']"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <EmailIcon />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada']"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <LockIcon />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-bold text-lg text-white rounded-[20px] font-['Radio_Canada'] py-2 transition-all duration-200
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-purple-500/80 to-cyan-300/80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:from-purple-600/90 hover:to-cyan-400/90 active:shadow-none active:translate-y-1'
              }`}
          >
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-['Radio_Canada']">
          <span className="text-stone-500">Don't have an account? </span>
          <Link to="/register" className="text-purple-500 font-bold">
            REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;