const { query } = require('../database/connection');

/**
 * Comment repository for database operations related to mood log comments
 */
class CommentRepository {
  /**
   * Add a comment to a mood log
   * @param {number} moodLogId - Mood log ID
   * @param {number} userId - User ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Created comment
   */
  async addComment(moodLogId, userId, content) {
    try {
      const result = await query(
        `INSERT INTO mood_comments (mood_log_id, user_id, content, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, mood_log_id, user_id, content, created_at`,
        [moodLogId, userId, content]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  }

  /**
   * Get all comments for a mood log
   * @param {number} moodLogId - Mood log ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} List of comments with user info
   */
  async getCommentsByMoodLogId(moodLogId, options = { limit: 50, offset: 0 }) {
    try {
      const result = await query(
        `SELECT 
           c.*,
           u.username,
           u.profile_picture
         FROM mood_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.mood_log_id = $1
         ORDER BY c.created_at ASC
         LIMIT $2 OFFSET $3`,
        [moodLogId, options.limit, options.offset]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getCommentsByMoodLogId:', error);
      throw error;
    }
  }

  /**
   * Get comment by ID
   * @param {number} commentId - ID of the comment
   * @returns {Promise<Object|null>} Comment or null if not found
   */
  async getCommentById(commentId) {
    try {
      const result = await query(
        `SELECT * 
         FROM mood_comments
         WHERE id = $1`,
        [commentId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error in getCommentById:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   * @param {number} commentId - ID of the comment
   * @returns {Promise<boolean>} True if successfully deleted
   */
  async deleteComment(commentId) {
    try {
      const result = await query(
        'DELETE FROM mood_comments WHERE id = $1',
        [commentId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  /**
   * Count comments for a mood log
   * @param {number} moodLogId - ID of the mood log
   * @returns {Promise<number>} Comment count
   */
  async getCommentCount(moodLogId) {
    try {
      const result = await query(
        'SELECT COUNT(*) as count FROM mood_comments WHERE mood_log_id = $1',
        [moodLogId]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error in getCommentCount:', error);
      throw error;
    }
  }
}

module.exports = new CommentRepository();