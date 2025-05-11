const express = require('express');
const moodLogController = require('../controllers/moodLogController');
const authenticate = require('../utils/authMiddleware');

const router = express.Router();

/**
 * MoodLog routes for managing mood journal entries
 */

// Get all mood logs for the current user
router.get('/', authenticate, moodLogController.getUserMoodLogs);

// Get mood statistics for the current user
router.get('/stats', authenticate, moodLogController.getMoodStats);

// Create a new mood log
router.post('/', authenticate, moodLogController.createMoodLog);

// Get a specific mood log by ID
router.get('/public', moodLogController.getPublicMoodLogs);
router.get('/:id', authenticate, moodLogController.getMoodLogById);

// Update a mood log
router.put('/:id', authenticate, moodLogController.updateMoodLog);

// Delete a mood log
router.delete('/:id', authenticate, moodLogController.deleteMoodLog);


module.exports = router;