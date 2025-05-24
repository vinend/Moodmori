import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const RegisterPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      // Registration was successful, now log the user in with the data from register response
      // This assumes the register endpoint returns user data similar to login
      onLogin(response.data.user); 
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  // Icon components from fe-aliya
  const UserIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 14C17.3137 14 20 11.3137 20 8C20 4.68629 17.3137 2 14 2C10.6863 2 8 4.68629 8 8C8 11.3137 10.6863 14 14 14Z" fill="#B449E9" fillOpacity="0.5"/>
      <path d="M22 24C22 19.5817 18.4183 16 14 16C9.58172 16 6 19.5817 6 24" stroke="#B449E9" strokeWidth="2"/>
    </svg>
  );

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

  const ConfirmLockIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="16" height="12" rx="2" fill="#66D9E8" fillOpacity="0.5"/> {/* Different color for confirm */}
      <path d="M8 12V8C8 5.79086 9.79086 4 12 4H16C18.2091 4 20 5.79086 20 8V12" stroke="#66D9E8" strokeWidth="2"/>
      <circle cx="14" cy="18" r="2" fill="white"/>
    </svg>
  );
  
  const CornerDecoration = ({ position }) => (
    <svg className={`w-5 h-5 absolute ${position}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19M1 1V19M1 1L19 19" stroke="black" strokeWidth="2"/>
    </svg>
  );

  return (
    // Base structure and background from fe-aliya
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-stone-100 p-4">
      {/* Form container styling from fe-aliya, with entry animation from master */}
      <div className="w-full max-w-md bg-white p-8 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
        {/* Corner decorations from fe-aliya */}
        <CornerDecoration position="left-6 top-6" />
        <CornerDecoration position="right-6 top-6 rotate-90" />
        <CornerDecoration position="left-6 bottom-6 -rotate-90" />
        <CornerDecoration position="right-6 bottom-6 rotate-180" />
        
        {/* Title and subtitle from fe-aliya */}
        <h1 className="text-xl font-['Press_Start_2P'] mb-2 text-purple-500 text-center">JOIN MOODMORI</h1>
        <p className="mb-8 text-center text-xs text-stone-500 font-['Radio_Canada']">
          Create an account to start your emotional journey!
        </p>

        {/* Error message styling: fe-aliya font, master border strength */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 font-['Radio_Canada'] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username input from fe-aliya */}
          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada'] focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <UserIcon />
              </div>
            </div>
          </div>

          {/* Email input from fe-aliya */}
          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada'] focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <EmailIcon />
              </div>
            </div>
          </div>

          {/* Password input from fe-aliya */}
          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada'] focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
            </div>
          </div>

          {/* Confirm Password input from fe-aliya */}
          <div className="mb-6">
            <label className="block text-xs mb-1 text-black font-['Radio_Canada']" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type="password"
                className="border border-black w-full p-2 h-11 pl-12 bg-white text-black font-['Radio_Canada'] focus:outline-none focus:ring-2 focus:ring-purple-500" // Themed focus
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ConfirmLockIcon />
              </div>
            </div>
          </div>

          {/* Submit button from fe-aliya */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-bold text-lg text-white rounded-[20px] font-['Radio_Canada'] py-2 transition-all duration-200
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-purple-500/80 to-cyan-300/80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:from-purple-600/90 hover:to-cyan-400/90 active:shadow-none active:translate-y-1'
              }`}
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>

        {/* Link to login page from fe-aliya */}
        <div className="mt-6 text-center text-xs font-['Radio_Canada']">
          <span className="text-stone-500">Already have an account? </span>
          <Link to="/" className="text-purple-500 font-bold hover:underline">
            LOG IN
          </Link>
        </div>
      </div>
      {/* Add master's fade-in animation style if not globally defined */}
      <style jsx global>{` 
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;