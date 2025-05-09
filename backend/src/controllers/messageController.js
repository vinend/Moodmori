const messageRepository = require('../repositories/messageRepository');
const userRepository = require('../repositories/userRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * Message controller for handling direct messaging operations
 */
class MessageController {
  /**
   * Get all conversations for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      
      const conversations = await messageRepository.getUserConversations(userId);
      
      responseFormatter.success(res, { conversations });
    } catch (error) {
      console.error('Error in getConversations:', error);
      responseFormatter.error(res, 'Failed to retrieve conversations', 500);
    }
  }

  /**
   * Get messages in a conversation with a specific user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */  async getConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId } = req.params;
      const { limit = 50, offset = 0, after } = req.query;
      
      // Validate that the other user exists
      const otherUser = await userRepository.findById(userId);
      if (!otherUser) {
        return responseFormatter.error(res, 'User not found', 404);
      }
      
      const options = { 
        limit: parseInt(limit), 
        offset: parseInt(offset)
      };
      
      // If "after" parameter is provided, we'll fetch only messages after a certain ID
      if (after) {
        options.after = parseInt(after);
      }
      
      const messages = await messageRepository.getConversationMessages(
        currentUserId, 
        parseInt(userId),
        options
      );
        responseFormatter.success(res, { 
        messages,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          profile_picture: otherUser.profile_picture
        }
      });
    } catch (error) {
      console.error('Error in getConversation:', error);
      responseFormatter.error(res, 'Failed to retrieve messages', 500);
    }
  }
  /**
   * Send a direct message to another user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const recipientId = req.params.userId; // Get recipient from URL parameter
      const { content } = req.body;
      
      // Validate required fields
      if (!recipientId || !content) {
        return responseFormatter.error(res, 'Recipient ID and message content are required', 400);
      }
      
      // Validate recipient exists
      const recipient = await userRepository.findById(recipientId);
      if (!recipient) {
        return responseFormatter.error(res, 'Recipient not found', 404);
      }
      
      // Cannot send message to self
      if (parseInt(recipientId) === senderId) {
        return responseFormatter.error(res, 'Cannot send message to yourself', 400);
      }
        const messageData = await messageRepository.createMessage(senderId, parseInt(recipientId), content);
        responseFormatter.success(res, {
        status: 'Message sent successfully',
        message: messageData
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      responseFormatter.error(res, 'Failed to send message', 500);
    }
  }

  /**
   * Mark a message as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      
      const updated = await messageRepository.markMessageAsRead(parseInt(messageId), userId);
      
      if (!updated) {
        return responseFormatter.error(res, 'Message not found or you are not the recipient', 404);
      }
      
      responseFormatter.success(res, {
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error('Error in markAsRead:', error);
      responseFormatter.error(res, 'Failed to mark message as read', 500);
    }
  }

  async findByUsername(req, res) {
    try {
      const { username } = req.params;

      // Validate required fields
      if (!username) {
        return responseFormatter.error(res, 'Username is required', 400);
      }

      // Find user by username
      const user = await userRepository.findByUsername(username);
      if (!user) {
        return responseFormatter.error(res, 'User not found', 404);
      }

      responseFormatter.success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profilePicture: user.profile_picture
        }
      });
    } catch (error) {
      console.error('Error in findByUsername:', error);
      responseFormatter.error(res, 'Failed to find user by username', 500);
    }
  }

  /**
   * Search users by username
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchUsers(req, res) {
    try {
      const { query } = req.params;
      
      if (!query || query.trim().length < 2) {
        return responseFormatter.error(res, 'Search query must be at least 2 characters', 400);
      }
      
      const users = await userRepository.searchUsers(query);
      
      // Filter out sensitive information
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture
      }));
      
      responseFormatter.success(res, { users: safeUsers });
    } catch (error) {
      console.error('Error in searchUsers:', error);
      responseFormatter.error(res, 'Failed to search users', 500);
    }
  }

  /**
   * Initialize a conversation with another user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId } = req.params;
      
      // Check if the user exists
      const otherUser = await userRepository.findById(parseInt(userId));
      if (!otherUser) {
        return responseFormatter.error(res, 'User not found', 404);
      }
      
      // Can't start a conversation with yourself
      if (parseInt(userId) === currentUserId) {
        return responseFormatter.error(res, 'Cannot start a conversation with yourself', 400);
      }
      
      responseFormatter.success(res, {
        message: 'Conversation initialized',
        user: {
          id: otherUser.id,
          username: otherUser.username,
          profile_picture: otherUser.profile_picture
        }
      });
    } catch (error) {
      console.error('Error in initConversation:', error);
      responseFormatter.error(res, 'Failed to initialize conversation', 500);
    }
  }
}

module.exports = new MessageController();