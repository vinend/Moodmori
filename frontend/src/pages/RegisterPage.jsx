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

    // Validate form inputs
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
      
      // Login was successful
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans">
      <div className="w-full max-w-md bg-white border-2 border-black p-6 sm:p-8 shadow-omori-default hover:shadow-omori-hover transition-shadow duration-300 ease-out hover:animate-zoom-in-stay">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-heading mb-6 text-black text-center tracking-wider">JOIN MOODMORI</h1>
          <p className="mb-8 text-center text-base sm:text-lg text-gray-600">Create an account to start your emotional journey.</p>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm sm:text-base mb-1 text-black" htmlFor="username">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                className="border-2 border-black w-full p-2.5 sm:p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

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

            <div>
              <label className="block text-sm sm:text-base mb-1 text-black" htmlFor="confirm-password">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirm-password"
                type="password"
                className="border-2 border-black w-full p-2.5 sm:p-3 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-black hover:bg-gray-200 active:animate-button-press disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm sm:text-base">
            <p className="text-gray-600">Already have an account?</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
              LOG IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
