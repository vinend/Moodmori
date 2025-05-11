const { query } = require('../database/connection');

/**
 * Favorites repository for database operations related to user's favorite mood logs
 */
class FavoriteRepository {
  /**
   * Add a mood log to user's favorites
   * @param {number} userId - User ID
   * @param {number} moodLogId - Mood log ID
   * @returns {Promise<boolean>} - True if successfully added
   */
  async addFavorite(userId, moodLogId) {
    try {
      const result = await query(
        'INSERT INTO favorites (user_id, mood_log_id) VALUES ($1, $2) RETURNING id',
        [userId, moodLogId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      // Unique constraint violation means it's already a favorite
      if (error.code === '23505') {
        return true;
      }
      throw error;
    }
  }
  
  /**
   * Remove a mood log from user's favorites
   * @param {number} userId - User ID
   * @param {number} moodLogId - Mood log ID
   * @returns {Promise<boolean>} - True if successfully removed
   */
  async removeFavorite(userId, moodLogId) {
    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND mood_log_id = $2',
      [userId, moodLogId]
    );
    
    return result.rowCount > 0;
  }
  
  /**
   * Check if a mood log is in user's favorites
   * @param {number} userId - User ID
   * @param {number} moodLogId - Mood log ID
   * @returns {Promise<boolean>} - True if it's a favorite
   */
  async isFavorite(userId, moodLogId) {
    const result = await query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND mood_log_id = $2',
      [userId, moodLogId]
    );
    
    return result.rows.length > 0;
  }
  
  /**
   * Get all favorite mood logs for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - List of favorite mood log objects
   */
  async getFavorites(userId) {
    const result = await query(
      `SELECT ml.*, m.mood_name, TRUE AS is_favorite
       FROM favorites f
       JOIN mood_logs ml ON f.mood_log_id = ml.id
       JOIN moods m ON ml.mood_id = m.id
       WHERE f.user_id = $1
       ORDER BY ml.log_date DESC`,
      [userId]
    );
    
    return result.rows;
  }
}

module.exports = new FavoriteRepository();