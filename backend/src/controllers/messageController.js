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
   */
  async getConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Validate that the other user exists
      const otherUser = await userRepository.findById(userId);
      if (!otherUser) {
        return responseFormatter.error(res, 'User not found', 404);
      }
      
      const messages = await messageRepository.getConversationMessages(
        currentUserId, 
        parseInt(userId),
        { 
          limit: parseInt(limit), 
          offset: parseInt(offset) 
        }
      );
      
      responseFormatter.success(res, { 
        messages,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username
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
      const { recipientId, content } = req.body;
      
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
      
      const message = await messageRepository.createMessage(senderId, parseInt(recipientId), content);
      
      responseFormatter.success(res, {
        message: 'Message sent successfully',
        data: message
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
}

module.exports = new MessageController();