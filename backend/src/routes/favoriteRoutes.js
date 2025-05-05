const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const authenticate = require('../utils/authMiddleware');

const router = express.Router();

/**
 * Favorite routes for managing favorited mood logs
 */

// Get all favorite mood logs for the current user
router.get('/', authenticate, favoriteController.getFavorites);

// Add a mood log to favorites
router.post('/', authenticate, favoriteController.addFavorite);

// Check if a mood log is in favorites
router.get('/:moodLogId', authenticate, favoriteController.checkFavorite);

// Remove a mood log from favorites
router.delete('/:moodLogId', authenticate, favoriteController.removeFavorite);

module.exports = router;