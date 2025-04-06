import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import ParticlesBackground from './common/ParticlesBackground';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login response:', res.data);

      await login({
        id: res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        token: res.data.token
      });

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-900 to-blue-700 px-4 flex flex-col items-center justify-center">
      <ParticlesBackground />
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8 drop-shadow-lg z-10">
        AI-Powered Customer Query Assistant
      </h1>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-600 rounded-full text-white">
              <FaUser size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <FaUser />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-blue-600 text-white rounded-lg transition-colors duration-300 shadow-lg ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 transition-colors block w-full"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-gray-600 hover:text-gray-800 transition-colors block w-full"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
