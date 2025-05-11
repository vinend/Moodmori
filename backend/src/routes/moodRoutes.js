const express = require('express');
const moodController = require('../controllers/moodController');
const authenticate = require('../utils/authMiddleware');

const router = express.Router();

/**
 * Mood routes for accessing mood categories
 */

// Get all available moods
router.get('/', authenticate, moodController.getAllMoods);

// Get a specific mood by ID
router.get('/:id', authenticate, moodController.getMoodById);

module.exports = router;