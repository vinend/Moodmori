const express = require('express');
const moodLogController = require('../controllers/moodLogController');
const authenticate = require('../utils/authMiddleware');
const { imageUploader } = require('../utils/cloudinaryUploader');

const router = express.Router();

/**
 * MoodLog routes for managing mood journal entries
 */

// Get all mood logs for the current user
router.get('/', authenticate, moodLogController.getUserMoodLogs);

// Get mood statistics for the current user
router.get('/stats', authenticate, moodLogController.getMoodStats);

// Get all public mood logs (social feed)
router.get('/public', authenticate, moodLogController.getPublicMoodLogs);

// Get a specific public mood log (post)
router.get('/public/:id', authenticate, moodLogController.getPublicMoodLogById);

// Create a new mood log with optional image upload
router.post('/', authenticate, imageUploader.single('image'), moodLogController.createMoodLog);

// Get a specific mood log by ID
router.get('/:id', authenticate, moodLogController.getMoodLogById);

// Update a mood log with optional image upload
router.put('/:id', authenticate, imageUploader.single('image'), moodLogController.updateMoodLog);

// Update a mood log's visibility (public/private)
router.put('/:id/visibility', authenticate, moodLogController.updateMoodLogVisibility);

// Delete a mood log
router.delete('/:id', authenticate, moodLogController.deleteMoodLog);

// Like a mood log
router.post('/:id/like', authenticate, moodLogController.likeMoodLog);

// Dislike a mood log
router.post('/:id/dislike', authenticate, moodLogController.dislikeMoodLog);

// Remove reaction from a mood log
router.delete('/:id/reaction', authenticate, moodLogController.removeReaction);

module.exports = router;