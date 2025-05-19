import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaStar, FaChartBar, FaSignOutAlt, FaCog, FaUser, FaComment } from 'react-icons/fa';

const Navbar = ({ user, onLogout, onChatToggle, isChatOpen }) => {
  // Color scheme based on the AudioPlayer theme
  const colors = {
    primary: 'bg-purple-500',
    primaryHover: 'bg-purple-600',
    primaryText: 'text-purple-500',
    primaryTextHover: 'text-purple-700',
    accent: 'bg-black',
    accentText: 'text-white',
    inactive: 'text-stone-500',
  };

  return (
    <nav className="bg-white border-b-2 border-purple-500 px-4 py-3 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-3 sm:mb-0">
          {/* Profile Picture */}
          <div className="w-10 h-10 border-2 border-purple-500 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-md">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                <FaUser className="text-purple-500" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="font-['Press_Start_2P'] text-xl uppercase tracking-wider text-purple-500">MOOD MORI</h1>
            <p className="text-xs font-['Radio_Canada'] text-stone-500">{user?.username || 'Unknown User'}</p>
          </div>
          
          {/* Messages Icon */}
          <button 
            onClick={onChatToggle}
            className={`ml-4 p-2 rounded-full ${isChatOpen ? 'bg-purple-500' : 'bg-white border border-purple-300'}`}
            title="Toggle Messages"
          >
            <FaComment className={`text-lg ${isChatOpen ? 'text-white' : 'text-purple-500'}`} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 font-['Radio_Canada']">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500 text-white border-2 border-purple-700 shadow-md' 
                  : 'text-purple-500 hover:bg-purple-100 hover:border-2 hover:border-purple-400'
              }`
            }
          >
            <FaHome className="mr-1" /> Home
          </NavLink>
          
          <NavLink 
            to="/log" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500 text-white border-2 border-purple-700 shadow-md' 
                  : 'text-purple-500 hover:bg-purple-100 hover:border-2 hover:border-purple-400'
              }`
            }
          >
            <FaBook className="mr-1" /> Log
          </NavLink>
          
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500 text-white border-2 border-purple-700 shadow-md' 
                  : 'text-purple-500 hover:bg-purple-100 hover:border-2 hover:border-purple-400'
              }`
            }
          >
            <FaStar className="mr-1" /> Favorites
          </NavLink>
          
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500 text-white border-2 border-purple-700 shadow-md' 
                  : 'text-purple-500 hover:bg-purple-100 hover:border-2 hover:border-purple-400'
              }`
            }
          >
            <FaChartBar className="mr-1" /> Stats
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-purple-500 text-white border-2 border-purple-700 shadow-md' 
                  : 'text-purple-500 hover:bg-purple-100 hover:border-2 hover:border-purple-400'
              }`
            }
          >
            <FaCog className="mr-1" /> Settings
          </NavLink>
          
          <button 
            onClick={onLogout}
            className="flex items-center px-3 py-1 rounded-lg text-red-500 hover:bg-red-100 hover:border-2 hover:border-red-400 transition-all duration-200"
          >
            <FaSignOutAlt className="mr-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;