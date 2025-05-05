const { query } = require('../database/connection');

/**
 * MoodLog repository for database operations related to users' mood logs
 */
class MoodLogRepository {
  /**
   * Create a new mood log entry
   * @param {number} userId - User ID
   * @param {number} moodId - Mood ID
   * @param {string|null} note - Optional note about the mood
   * @param {Date|null} logDate - Date of the mood log (defaults to current date)
   * @returns {Promise<Object>} - Created mood log object
   */
  async createMoodLog(userId, moodId, note = null, logDate = null) {
    const result = await query(
      `INSERT INTO mood_logs (user_id, mood_id, note, log_date) 
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE)) 
       RETURNING id, user_id, mood_id, note, log_date`,
      [userId, moodId, note, logDate]
    );
    
    return result.rows[0];
  }
  
  /**
   * Get a mood log by ID
   * @param {number} id - Mood log ID
   * @returns {Promise<Object|null>} - Mood log object or null if not found
   */
  async getMoodLogById(id) {
    const result = await query(
      `SELECT ml.*, m.mood_name, 
          (SELECT COUNT(*) > 0 FROM favorites f WHERE f.mood_log_id = ml.id) AS is_favorite
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.id
       WHERE ml.id = $1`,
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  /**
   * Get all mood logs for a specific user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of mood log objects
   */
  async getMoodLogsByUserId(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0,
      sortBy = 'log_date',
      sortOrder = 'DESC',
      startDate = null,
      endDate = null,
      moodId = null
    } = options;
    
    let params = [userId, limit, offset];
    let paramCounter = 4;
    
    let whereClause = 'WHERE ml.user_id = $1';
    
    if (startDate) {
      whereClause += ` AND ml.log_date >= $${paramCounter++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ` AND ml.log_date <= $${paramCounter++}`;
      params.push(endDate);
    }
    
    if (moodId) {
      whereClause += ` AND ml.mood_id = $${paramCounter++}`;
      params.push(moodId);
    }
    
    const validSortColumns = ['log_date', 'mood_id'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'log_date';
    const sanitizedSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';
    
    const result = await query(
      `SELECT ml.*, m.mood_name, 
          (SELECT COUNT(*) > 0 FROM favorites f WHERE f.mood_log_id = ml.id AND f.user_id = $1) AS is_favorite
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.id
       ${whereClause}
       ORDER BY ml.${sanitizedSortBy} ${sanitizedSortOrder}
       LIMIT $2 OFFSET $3`,
      params
    );
    
    return result.rows;
  }
  
  /**
   * Update a mood log
   * @param {number} id - Mood log ID
   * @param {number} userId - User ID (for validation)
   * @param {Object} data - Data to update (moodId and/or note)
   * @returns {Promise<Object|null>} - Updated mood log object or null if not found
   */
  async updateMoodLog(id, userId, data) {
    const allowedFields = ['mood_id', 'note'];
    const fieldsToUpdate = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .filter(key => data[key] !== undefined);
    
    if (fieldsToUpdate.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fieldsToUpdate
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', ');
      
    const values = fieldsToUpdate.map(field => data[field]);
    
    const result = await query(
      `UPDATE mood_logs 
       SET ${setClause} 
       WHERE id = $1 AND user_id = $2 
       RETURNING id, user_id, mood_id, note, log_date`,
      [id, userId, ...values]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  /**
   * Delete a mood log
   * @param {number} id - Mood log ID
   * @param {number} userId - User ID (for validation)
   * @returns {Promise<boolean>} - True if successfully deleted
   */
  async deleteMoodLog(id, userId) {
    const result = await query(
      'DELETE FROM mood_logs WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return result.rowCount > 0;
  }
  
  /**
   * Get mood statistics for a user
   * @param {number} userId - User ID
   * @param {Date|null} startDate - Start date for statistics
   * @param {Date|null} endDate - End date for statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getMoodStats(userId, startDate = null, endDate = null) {
    let params = [userId];
    let whereClause = 'WHERE ml.user_id = $1';
    let paramCounter = 2;
    
    if (startDate) {
      whereClause += ` AND ml.log_date >= $${paramCounter++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ` AND ml.log_date <= $${paramCounter++}`;
      params.push(endDate);
    }
    
    const result = await query(
      `SELECT 
         m.id AS mood_id, 
         m.mood_name,
         COUNT(*) AS count
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.id
       ${whereClause}
       GROUP BY m.id, m.mood_name
       ORDER BY count DESC`,
      params
    );
    
    return result.rows;
  }
}

module.exports = new MoodLogRepository();