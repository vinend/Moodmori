const express = require('express');
const commentController = require('../controllers/commentController');
const authenticate = require('../utils/authMiddleware');

const router = express.Router();

/**
 * Comment routes for managing comments on mood logs
 */

// Get all comments for a mood log
router.get('/mood-log/:moodLogId', authenticate, commentController.getComments);

// Add a comment to a mood log
router.post('/mood-log/:moodLogId', authenticate, commentController.addComment);

// Delete a comment
router.delete('/:commentId', authenticate, commentController.deleteComment);

module.exports = router;