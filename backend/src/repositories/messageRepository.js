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
   * @returns {Object} Created message
   */
  async createMessage(senderId, recipientId, content) {
    try {
      const result = await db.query(
        `INSERT INTO direct_messages (sender_id, recipient_id, content, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, sender_id, recipient_id, content, created_at, is_read`,
        [senderId, recipientId, content]
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
   * @returns {Array} List of messages
   */
  async getConversationMessages(userId1, userId2, options = { limit: 50, offset: 0 }) {
    try {
      const result = await db.query(
        `SELECT 
           dm.*
         FROM direct_messages dm
         WHERE 
           (sender_id = $1 AND recipient_id = $2) OR
           (sender_id = $2 AND recipient_id = $1)
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4`,
        [userId1, userId2, options.limit, options.offset]
      );
      
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
}

module.exports = new MessageRepository();