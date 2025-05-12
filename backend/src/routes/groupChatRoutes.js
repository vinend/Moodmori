const express = require('express');
const groupChatController = require('../controllers/groupChatController');
const authenticate = require('../utils/authMiddleware');
const { groupImageUploader } = require('../utils/groupFileUploader');

const router = express.Router();

/**
 * Group Chat routes
 */

// Create a new group chat
router.post('/', authenticate, groupImageUploader.single('profilePicture'), groupChatController.createGroup);

// Get all groups that the user is part of
router.get('/', authenticate, groupChatController.getUserGroups);

// Get a specific group's details
router.get('/:groupId', authenticate, groupChatController.getGroupDetails);

// Update a group's details
router.put('/:groupId', authenticate, groupImageUploader.single('profilePicture'), groupChatController.updateGroup);

// Delete a group
router.delete('/:groupId', authenticate, groupChatController.deleteGroup);

// Add user to a group
router.post('/:groupId/members', authenticate, groupChatController.addMember);

// Remove user from a group
router.delete('/:groupId/members/:userId', authenticate, groupChatController.removeMember);

// Send a message to the group
router.post('/:groupId/messages', authenticate, groupChatController.sendGroupMessage);

// Get messages from a group
router.get('/:groupId/messages', authenticate, groupChatController.getGroupMessages);

module.exports = router;