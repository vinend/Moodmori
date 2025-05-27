import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBook, FaStar, FaChartBar, FaSignOutAlt, FaCog, FaUser, FaComment, FaBars, FaTimes, FaUsers, FaBrain } from 'react-icons/fa'; // Added FaBrain

const Navbar = ({ user, onLogout, onChatToggle, isChatOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Styling for NavLinks from master, promoting consistency
  const navLinkClasses = ({ isActive }) =>
    `flex items-center justify-center sm:justify-start w-full sm:w-auto px-3 py-1 sm:px-3 sm:py-2 text-lg tracking-wide text-black transition-colors duration-150 active:animate-button-press ${
      isActive
        ? 'bg-black text-white' // Active link style
        : 'hover:bg-black hover:text-white' // Hover style for inactive links
    }`;
  
  const iconSize = "text-lg"; // Consistent icon sizing from master

  return (
    <nav className="relative font-sans bg-white border-b-2 border-black px-4 py-3"> {/* Base styles from master */}
      <div className="flex items-center justify-between">
        {/* Left Section: Profile Pic, Title, Username, Chat Toggle - Structure from master */}
        <div className="flex items-center">
          {/* Profile Picture */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black rounded-none overflow-hidden mr-3 flex-shrink-0 shadow-omori-default">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              // Placeholder icon
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <FaUser className="text-2xl text-gray-400" />
              </div>
            )}
          </div>
          {/* Title and Username */}
          <div className="mr-4">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl uppercase tracking-wider text-black">MOOD MORI</h1>
            <p className="text-sm text-neutral-700">{user?.username || 'Unknown User'}</p>
          </div>
          {/* Chat Toggle Button */}
          <button
            onClick={onChatToggle}
            className={`p-2 border-2 border-black rounded-none transition-colors duration-150 ${
              isChatOpen 
              ? 'bg-black text-white shadow-none translate-x-px translate-y-px' 
              : 'bg-white text-black hover:bg-black hover:text-white shadow-omori-default'
            }`}
            title="Toggle Messages"
            aria-label="Toggle Messages"
          >
            <FaComment className="text-xl" />
          </button>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-black focus:outline-none rounded-none border-2 border-black shadow-omori-default active:translate-x-px active:translate-y-px active:shadow-none"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Navigation Links (Desktop and Mobile Menu) */}
        <div
          id="mobile-menu"
          className={`
            absolute sm:static top-full left-0 right-0 bg-white sm:bg-transparent shadow-lg sm:shadow-none
            ${isMobileMenuOpen ? 'flex flex-col py-2 border-l-2 border-r-2 border-b-2 border-black' : 'hidden'} 
            sm:flex sm:flex-row sm:items-center sm:space-x-3 sm:border-none sm:py-0 z-30
          `}
        >
          <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaHome className={`${iconSize} mr-2`} /> Home
          </NavLink>
          <NavLink to="/log" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaBook className={`${iconSize} mr-2`} /> Log
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaStar className={`${iconSize} mr-2`} /> Favorites
          </NavLink>
          <NavLink to="/stats" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaChartBar className={`${iconSize} mr-2`} /> Stats
          </NavLink>
          <NavLink to="/public-feed" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaUsers className={`${iconSize} mr-2`} /> Feed
          </NavLink>
          <NavLink to="/consultant" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaBrain className={`${iconSize} mr-2`} /> Consultant
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${navLinkClasses({ isActive })} rounded-none ${isActive ? 'shadow-none translate-x-px translate-y-px' : 'shadow-omori-default'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <FaCog className={`${iconSize} mr-2`} /> Settings
          </NavLink>
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className={`${navLinkClasses({isActive: false})} w-full sm:w-auto rounded-none shadow-omori-default`}
            aria-label="Logout"
          >
            <FaSignOutAlt className={`${iconSize} mr-2`} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
