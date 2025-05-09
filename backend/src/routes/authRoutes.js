const express = require('express');
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');
const authenticate = require('../utils/authMiddleware');
const { imageUploader } = require('../utils/cloudinaryUploader');

const router = express.Router();

/**
 * Auth routes for user registration and authentication
 */

// Register a new user
router.post('/register', userController.register);

// User login
router.post('/login', userController.login);

// User logout
router.post('/logout', userController.logout);

// Get current user profile (protected route)
router.get('/profile', authenticate, userController.getProfile);

// Update user profile (protected route) - with profile picture upload support
router.put('/profile', authenticate, imageUploader.single('profilePicture'), userController.updateProfile);

// Update user password (protected route)
router.put('/password', authenticate, userController.updatePassword);

// Search for users (protected route)
router.get('/search/:query', authenticate, messageController.searchUsers);

module.exports = router;