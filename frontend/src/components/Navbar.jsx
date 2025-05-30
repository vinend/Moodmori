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
          {/* Profile Picture - Using master's styling (black border, gray placeholder, responsive size) */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black rounded-full overflow-hidden mr-3 flex-shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              // Placeholder icon style from master
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FaUser className="text-2xl text-gray-500" />
              </div>
            )}
          </div>
          {/* Title and Username - Using master's styling */}
          <div className="mr-4">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl uppercase tracking-wider text-black">MOOD MORI</h1>
            <p className="text-sm text-gray-600">{user?.username || 'Unknown User'}</p>
          </div>
          {/* Chat Toggle Button - Using master's styling for consistency and interactivity */}
          <button
            onClick={onChatToggle}
            className={`p-2 border-2 transition-colors duration-150 active:animate-button-press ${
              isChatOpen 
              ? 'bg-black text-white border-black' 
              : 'text-black border-transparent hover:bg-black hover:text-white hover:border-black'
            }`}
            title="Toggle Messages"
            aria-label="Toggle Messages"
          >
            <FaComment className="text-xl" /> {/* Icon size from master */}
          </button>
        </div>

        {/* Hamburger Menu Button (Mobile) - From master */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-black focus:outline-none active:animate-button-press"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Navigation Links (Desktop and Mobile Menu) - Structure and classes from master */}
        <div
          id="mobile-menu"
          className={`
            absolute sm:static top-full left-0 right-0 bg-white sm:bg-transparent shadow-lg sm:shadow-none
            ${isMobileMenuOpen ? 'flex flex-col py-2 border-l-2 border-r-2 border-b-2 border-black' : 'hidden'} 
            sm:flex sm:flex-row sm:items-center sm:space-x-3 sm:border-none sm:py-0 z-30
          `}
        >
          <NavLink to="/dashboard" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaHome className={`${iconSize} mr-2`} /> Home
          </NavLink>
          <NavLink to="/log" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaBook className={`${iconSize} mr-2`} /> Log
          </NavLink>
          <NavLink to="/favorites" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaStar className={`${iconSize} mr-2`} /> Favorites
          </NavLink>
          <NavLink to="/stats" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaChartBar className={`${iconSize} mr-2`} /> Stats
          </NavLink>
          <NavLink to="/public-feed" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaUsers className={`${iconSize} mr-2`} /> Feed
          </NavLink>
          <NavLink to="/consultant" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaBrain className={`${iconSize} mr-2`} /> Consultant
          </NavLink>
          <NavLink to="/settings" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>
            <FaCog className={`${iconSize} mr-2`} /> Settings
          </NavLink>
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            // Applying base link styles, ensuring it behaves like other nav items
            // The specific class from master was a bit complex; this simplifies while maintaining behavior.
            // For a distinct logout color (like red from fe-aliya), you could add 'text-red-500 hover:text-red-700' here
            // alongside other classes from navLinkClasses if needed, or create a separate class.
            // For now, it will match other inactive links' hover behavior.
            className={`${navLinkClasses({isActive: false})} w-full sm:w-auto`}
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