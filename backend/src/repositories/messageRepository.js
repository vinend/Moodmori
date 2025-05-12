const db = require('../database/connection');

/**
 * Repository for handling direct message operations in the database
 */
class MessageRepository {
  /**
   * Create a new direct message
   * @param {number} senderId - ID of the message sender
   * @param {number} recipientId - ID of the message recipient
   * @param {string} content - Message content
   * @param {string} imageUrl - URL of the image (optional)
   * @param {string} messageType - Type of the message (e.g., 'text', 'image')
   * @returns {Object} Created message
   */
  async createMessage(senderId, recipientId, content, imageUrl = null, messageType = 'text') {
    try {
      // Set a default placeholder for content if it's null and the message type is 'image'
      const messageContent = content || (messageType === 'image' ? 'Sent an image' : '');

      const result = await db.query(
        `INSERT INTO direct_messages (sender_id, recipient_id, content, image_url, message_type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, sender_id, recipient_id, content, image_url, message_type, created_at, is_read`,
        [senderId, recipientId, messageContent, imageUrl, messageType]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in createMessage:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   * @param {number} userId - ID of the user
   * @returns {Array} List of conversations with latest message and user info
   */
  async getUserConversations(userId) {
    try {
      // This query gets the most recent message from each conversation
      // along with the other user's information
      const result = await db.query(
        `WITH latest_messages AS (
           SELECT DISTINCT ON (
             CASE 
               WHEN sender_id = $1 THEN recipient_id 
               ELSE sender_id 
             END
           ) 
             CASE 
               WHEN sender_id = $1 THEN recipient_id 
               ELSE sender_id 
             END AS other_user_id,
             id,
             sender_id,
             recipient_id,
             content,
             created_at,
             is_read
           FROM direct_messages
           WHERE sender_id = $1 OR recipient_id = $1
           ORDER BY 
             other_user_id, 
             created_at DESC
         )
         SELECT 
           lm.*,
           u.username,
           u.profile_picture
         FROM latest_messages lm
         JOIN users u ON u.id = lm.other_user_id
         ORDER BY lm.created_at DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw error;
    }
  }
  /**
   * Get messages between two users
   * @param {number} userId1 - ID of the first user
   * @param {number} userId2 - ID of the second user
   * @param {Object} options - Pagination options
   * @param {number} options.after - Fetch only messages after this ID
   * @returns {Array} List of messages
   */
  async getConversationMessages(userId1, userId2, options = { limit: 50, offset: 0, after: null }) {
    try {
      let query, params;
        // If we're fetching only new messages after a specific ID
      if (options.after) {
        query = `
          SELECT DISTINCT ON (id) dm.*
          FROM direct_messages dm
          WHERE 
            ((sender_id = $1 AND recipient_id = $2) OR
            (sender_id = $2 AND recipient_id = $1))
            AND id > $3
          ORDER BY id, created_at ASC`;
        params = [userId1, userId2, options.after];
      } else {
        // Standard pagination query
        query = `
          SELECT dm.*
          FROM direct_messages dm
          WHERE 
            (sender_id = $1 AND recipient_id = $2) OR
            (sender_id = $2 AND recipient_id = $1)
          ORDER BY created_at DESC
          LIMIT $3 OFFSET $4`;
        params = [userId1, userId2, options.limit, options.offset];
      }
      
      const result = await db.query(query, params);
      
      // Mark unread messages as read if recipient is the current user
      await db.query(
        `UPDATE direct_messages
         SET is_read = true
         WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
        [userId1, userId2]
      );
      
      return result.rows.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error in getConversationMessages:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   * @param {number} messageId - ID of the message
   * @param {number} userId - ID of the recipient user
   * @returns {boolean} True if message was marked as read, false otherwise
   */  async markMessageAsRead(messageId, userId) {
    try {
      const result = await db.query(
        `UPDATE direct_messages
         SET is_read = true
         WHERE id = $1 AND recipient_id = $2 AND is_read = false
         RETURNING id`,
        [messageId, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error in markMessageAsRead:', error);
      throw error;
    }
  }
  /**
   * Get all read messages from a list of message IDs
   * @param {Array} messageIds - Array of message IDs to check
   * @returns {Array} List of read messages
   */
  async getReadMessages(messageIds) {
    try {
      const result = await db.query(
        `SELECT id
         FROM direct_messages
         WHERE id = ANY($1) AND is_read = true`,
        [messageIds]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getReadMessages:', error);
      throw error;
    }
  }
  
  /**
   * Mark all unread messages from a specific sender to a recipient as read
   * @param {number} recipientId - ID of the recipient user
   * @param {number} senderId - ID of the sender user
   * @returns {Array} List of message IDs that were marked as read
   */
  async markAllMessagesAsRead(recipientId, senderId) {
    try {
      const result = await db.query(
        `UPDATE direct_messages
         SET is_read = true
         WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false
         RETURNING id`,
        [recipientId, senderId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in markAllMessagesAsRead:', error);
      throw error;
    }
  }
}

module.exports = new MessageRepository();