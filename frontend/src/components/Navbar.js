import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Robot head */}
                <rect x="5" y="4" width="14" height="12" rx="6" strokeWidth="2" />
                {/* Antenna */}
                <path d="M12 2v2" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="2" r="0.5" fill="currentColor" />
                {/* Eyes */}
                <circle cx="9" cy="9" r="1.25" fill="currentColor" />
                <circle cx="15" cy="9" r="1.25" fill="currentColor" />
                {/* Happy mouth */}
                <path
                  d="M9 12.5c.8 1 1.5 1.5 3 1.5s2.2-.5 3-1.5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Neck */}
                <path d="M12 16v2" strokeWidth="2" strokeLinecap="round" />
                {/* Body */}
                <path
                  d="M8 18h8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Ears/Antenna sides */}
                <path d="M5 8l-2-2M19 8l2-2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">Customer Query Assistant</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
