import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import { FaCamera } from 'react-icons/fa';

const SettingsPage = ({ user, onProfileUpdate }) => {
  // Profile update states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      if (user.profilePicture) {
        setPreviewUrl(user.profilePicture);
      }
    }
  }, [user]);

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileLoading(true);

    try {
      // Use FormData to handle file uploads
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.put('/api/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfileMessage('Profile updated successfully');
      
      // Update user information throughout the app using the onProfileUpdate prop
      if (response.data && response.data.user) {
        onProfileUpdate(response.data.user);
      } else if (response.data) {
        // If no user object is returned but the request was successful, 
        // create an update object with the form values
        onProfileUpdate({
          username,
          email,
          // Only include profilePicture if a new one was uploaded and preview is available
          ...(previewUrl && profilePicture ? { profilePicture: previewUrl } : {})
        });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put('/api/auth/password', {
        currentPassword,
        newPassword,
      });

      setPasswordMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 font-mono">
      <h1 className="text-2xl font-bold mb-6">SETTINGS</h1>

      {/* Profile Settings Section */}
      <div className="border-2 border-black p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">PROFILE INFORMATION</h2>

        {profileMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 text-sm">
            {profileMessage}
          </div>
        )}

        {profileError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 text-sm">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileUpdate}>
          {/* Profile Picture Section */}
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-sm font-bold mb-3" htmlFor="profile-picture">
              PROFILE PICTURE
            </label>
            
            <div 
              className="w-24 h-24 border-2 border-black rounded-full overflow-hidden mb-2 cursor-pointer relative"
              onClick={triggerFileInput}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">?</span>
                </div>
              )}
              
              <div className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full">
                <FaCamera size={12} />
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
            
            <span className="text-xs text-gray-500">
              Click to change (Max 2MB)
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="username">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              className="border-2 border-black w-full p-2 bg-white text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="email">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              className="border-2 border-black w-full p-2 bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full bg-white border-2 border-black py-2 px-4 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            {profileLoading ? 'UPDATING...' : 'UPDATE PROFILE'}
          </button>
        </form>
      </div>

      {/* Password Update Section - remains unchanged */}
      <div className="border-2 border-black p-6">
        <h2 className="text-xl font-bold mb-4">CHANGE PASSWORD</h2>

        {passwordMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 text-sm">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 text-sm">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="current-password">
              CURRENT PASSWORD
            </label>
            <input
              id="current-password"
              type="password"
              className="border-2 border-black w-full p-2 bg-white text-black"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="new-password">
              NEW PASSWORD
            </label>
            <input
              id="new-password"
              type="password"
              className="border-2 border-black w-full p-2 bg-white text-black"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="confirm-password">
              CONFIRM NEW PASSWORD
            </label>
            <input
              id="confirm-password"
              type="password"
              className="border-2 border-black w-full p-2 bg-white text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="w-full bg-white border-2 border-black py-2 px-4 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            {passwordLoading ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;