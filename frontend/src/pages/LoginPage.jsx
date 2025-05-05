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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[8px_8px_0_rgba(0,0,0)]">
        <h1 className="text-3xl font-mono font-bold mb-6 text-black text-center">MOOD MORI</h1>
        <p className="mb-8 text-center font-mono text-sm text-gray-700">Track your emotional journey in the style of OMORI</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-mono text-sm mb-2 text-black" htmlFor="email">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              className="border-2 border-black font-mono w-full p-2 bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-mono text-sm mb-2 text-black" htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              className="border-2 border-black font-mono w-full p-2 bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white border-2 border-black font-mono py-2 px-4 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>

        <div className="mt-6 text-center font-mono text-sm">
          <p className="text-gray-700">Don't have an account?</p>
          <Link to="/register" className="text-black underline">
            REGISTER
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;