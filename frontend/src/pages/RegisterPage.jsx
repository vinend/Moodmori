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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 bg-omori-doodle-background"> {/* Added bg-omori-doodle-background */}
      <div className="w-full max-w-md bg-white p-8 relative border-2 border-black rounded-none shadow-omori-default auth-container">
        <div className="omori-silhouette omori-silhouette-left"></div>
        <div className="omori-silhouette omori-silhouette-right"></div>
        <CornerDecoration position="left-6 top-6" />
        <CornerDecoration position="right-6 top-6 rotate-90" />
        <CornerDecoration position="left-6 bottom-6 -rotate-90" />
        <CornerDecoration position="right-6 bottom-6 rotate-180" />
        
        <h1 className="text-2xl font-heading mb-2 text-purple-500 text-center uppercase">JOIN MOODMORI</h1>
        <p className="mb-8 text-center text-sm text-neutral-700 font-mono">
          Create an account to start your emotional journey!
        </p>

        {error && (
          <div className="bg-white border-2 border-black text-red-600 p-3 rounded-none shadow-omori-default mb-4 font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-mono uppercase" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                className="w-full p-2 h-11 pl-12 font-mono" // Inherits global styles
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CHOOSE A USERNAME"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <UserIcon />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-mono uppercase" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full p-2 h-11 pl-12 font-mono" // Inherits global styles
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <EmailIcon />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs mb-1 text-black font-mono uppercase" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full p-2 h-11 pl-12 font-mono" // Inherits global styles
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CREATE A PASSWORD"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <LockIcon />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs mb-1 text-black font-mono uppercase" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type="password"
                className="w-full p-2 h-11 pl-12 font-mono" // Inherits global styles
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRM YOUR PASSWORD"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ConfirmLockIcon />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-mono font-bold text-lg text-white rounded-none border-2 border-black shadow-omori-default py-2 transition-all duration-200 uppercase
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500/90 to-cyan-400/90 hover:from-purple-600 hover:to-cyan-500 active:translate-x-px active:translate-y-px active:shadow-none'
              }`}
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-mono">
          <span className="text-neutral-700">Already have an account? </span>
          <Link to="/" className="text-purple-500 font-bold hover:underline uppercase">
            LOG IN
          </Link>
        </div>
      </div>
      {/* Removed <style jsx global> as animations should be in global CSS if needed widely */}
    </div>
  );
};

export default RegisterPage;
