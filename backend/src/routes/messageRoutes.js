const express = require('express');
const messageController = require('../controllers/messageController');
const authenticate = require('../utils/authMiddleware');

const router = express.Router();

/**
 * Direct Message routes
 */

// Get user details for a specific user

// Get conversations for current user
router.get('/conversations', authenticate, messageController.getConversations);

// Get messages in a conversation
router.get('/:userId', authenticate, messageController.getConversation);

// Initialize a conversation with user
router.post('/init/:userId', authenticate, messageController.initConversation);

// Send a direct message
router.post('/:userId', authenticate, messageController.sendMessage);

// Mark message as read
router.put('/read/:messageId', authenticate, messageController.markAsRead);

// Check read status for multiple messages
router.post('/:userId/read-status', authenticate, messageController.checkReadStatus);

module.exports = router;