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
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="black" strokeWidth="2"/>
      <path d="M20 21C20 17.6863 16.4183 15 12 15C7.58172 15 4 17.6863 4 21" stroke="black" strokeWidth="2"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="black" strokeWidth="2"/>
      <path d="M3 7L12 13L21 7" stroke="black" strokeWidth="2"/>
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="black" strokeWidth="2"/>
      <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="black" strokeWidth="2"/>
    </svg>
  );

  const ConfirmLockIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="black" strokeWidth="2"/>
      <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="black" strokeWidth="2"/>
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
        
        <h1 className="text-4xl font-heading mb-4 text-black text-center uppercase">REGISTER</h1>
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
                className="w-full p-2 h-11 pl-10 font-mono"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CHOOSE A USERNAME"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                className="w-full p-2 h-11 pl-10 font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                className="w-full p-2 h-11 pl-10 font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CREATE A PASSWORD"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                className="w-full p-2 h-11 pl-10 font-mono"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="CONFIRM YOUR PASSWORD"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ConfirmLockIcon />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 font-mono font-bold text-lg rounded-none border-2 border-black py-2 transition-all duration-200 uppercase
              ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed shadow-none'
                : 'bg-black text-white hover:bg-white hover:text-black active:translate-x-px active:translate-y-px shadow-omori-default active:shadow-none'
              }`}
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-mono">
          <span className="text-neutral-700">Already have an account? </span>
          <Link to="/" className="text-black font-bold hover:underline uppercase">
            LOG IN
          </Link>
        </div>
      </div>
      {/* Removed <style jsx global> as animations should be in global CSS if needed widely */}
    </div>
  );
};

export default RegisterPage;
