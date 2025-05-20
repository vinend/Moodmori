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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans">
      <div className="w-full max-w-md bg-white border-2 border-black p-6 sm:p-8 shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 ease-out hover:animate-zoom-in-stay">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-heading mb-6 text-black text-center tracking-wider">MOODMORI</h1>
          <p className="mb-8 text-center text-base sm:text-lg text-gray-600">Track your emotional journey in the style of OMORI.</p>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm sm:text-base mb-1 text-black" htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                className="border-2 border-black w-full p-2.5 sm:p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black" htmlFor="password">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                className="border-2 border-black w-full p-2.5 sm:p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-black hover:bg-gray-200 active:animate-button-press disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm sm:text-base">
            <p className="text-gray-600">Don't have an account?</p>
            <Link to="/register" className="text-blue-600 hover:text-blue-800 underline">
              REGISTER
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
