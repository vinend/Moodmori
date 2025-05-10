import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaStar, FaChartBar, FaSignOutAlt, FaCog, FaUser, FaBars } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b-2 border-black px-4 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="w-full sm:w-auto flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center">
            {/* Profile Picture */}
            <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden mr-3 flex-shrink-0">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-500" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="font-mono font-bold text-xl uppercase tracking-wider text-black">MOOD MORI</h1>
              <p className="text-xs font-mono text-gray-600">{user?.username || 'Unknown User'}</p>
            </div>
          </div>
          
          {/* Mobile Menu Button - Only visible on small screens */}
          <button 
            className="sm:hidden border border-black rounded p-2 hover:bg-gray-100"
            onClick={toggleMenu}
          >
            <FaBars className="text-lg" />
          </button>
        </div>
        
        {/* Navigation Links - Show/hide based on screen size and menu state */}
        <div 
          className={`${
            (isMenuOpen || windowWidth >= 640) ? 'flex' : 'hidden'
          } flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 font-mono w-full sm:w-auto`}
        >
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'} w-full sm:w-auto`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <FaHome className="mr-1" /> Home
          </NavLink>
          
          <NavLink 
            to="/log" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'} w-full sm:w-auto`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <FaBook className="mr-1" /> Log
          </NavLink>
          
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'} w-full sm:w-auto`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <FaStar className="mr-1" /> Favorites
          </NavLink>
          
          <NavLink 
            to="/stats" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'} w-full sm:w-auto`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <FaChartBar className="mr-1" /> Stats
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center px-3 py-1 text-black ${isActive ? 'border-2 border-black' : 'hover:border-2 hover:border-gray-400'} w-full sm:w-auto`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            <FaCog className="mr-1" /> Settings
          </NavLink>
          
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              onLogout();
            }}
            className="flex items-center px-3 py-1 text-gray-700 hover:text-black hover:border-2 hover:border-gray-400 w-full sm:w-auto"
          >
            <FaSignOutAlt className="mr-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;