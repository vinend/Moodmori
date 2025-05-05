import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaStar, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b-2 border-black px-4 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-3 sm:mb-0">
          <h1 className="font-mono font-bold text-xl uppercase tracking-wider text-black">MOOD MORI</h1>
          <p className="text-xs font-mono text-gray-600">{user?.username || 'Unknown User'}</p>
        </div>
        
        <div className="flex items-center space-x-4 font-mono">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'}`
            }
          >
            <FaHome className="mr-1" /> Home
          </NavLink>
          
          <NavLink 
            to="/log" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'}`
            }
          >
            <FaBook className="mr-1" /> Log
          </NavLink>
          
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'}`
            }
          >
            <FaStar className="mr-1" /> Favorites
          </NavLink>
          
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'}`
            }
          >
            <FaChartBar className="mr-1" /> Stats
          </NavLink>
          
          <button 
            onClick={onLogout}
            className="flex items-center px-3 py-1 text-gray-700 hover:text-black hover:border-2 hover:border-gray-400"
          >
            <FaSignOutAlt className="mr-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;