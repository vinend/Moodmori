const { query } = require('../database/connection');

/**
 * MoodLog repository for database operations related to users' mood logs
 */
class MoodLogRepository {  /**
   * Create a new mood log entry
   * @param {number} userId - User ID
   * @param {number} moodId - Mood ID
   * @param {string|null} note - Optional note about the mood
   * @param {Date|null} logDate - Date of the mood log (defaults to current date)
   * @param {boolean} isPublic - Whether this mood log is publicly visible
   * @param {string|null} location - Optional location data
   * @param {string|null} imageUrl - Optional URL to the image
   * @returns {Promise<Object>} - Created mood log object
   */
  async createMoodLog(userId, moodId, note = null, logDate = null, isPublic = false, location = null, imageUrl = null) {
    const result = await query(
      `INSERT INTO mood_logs (user_id, mood_id, note, log_date, is_public, location, image_url) 
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7) 
       RETURNING id, user_id, mood_id, note, log_date, is_public, location, image_url`,
      [userId, moodId, note, logDate, isPublic, location, imageUrl]
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
          COALESCE(
            (SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = true), 
            0
          ) AS like_count,
          COALESCE(
            (SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = false), 
            0
          ) AS dislike_count
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
          COALESCE(
            (SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = true), 
            0
          ) AS like_count,
          COALESCE(
            (SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = false), 
            0
          ) AS dislike_count
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
   * @param {Object} data - Data to update (moodId, note, etc.)
   * @returns {Promise<Object|null>} - Updated mood log object or null if not found
   */  async updateMoodLog(id, userId, data) {
    const allowedFields = ['mood_id', 'note', 'is_public', 'location', 'image_url'];
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
       RETURNING id, user_id, mood_id, note, log_date, is_public, location, image_url`,
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

  /**
   * Update a mood log's visibility (public/private)
   * @param {number} id - Mood log ID
   * @param {number} userId - User ID (for validation)
   * @param {boolean} isPublic - Whether the mood log should be public
   * @returns {Promise<Object|null>} - Updated mood log object or null if not found
   */
  async updateMoodLogVisibility(id, userId, isPublic) {
    const result = await query(
      `UPDATE mood_logs 
       SET is_public = $3
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, mood_id, note, log_date, is_public, location`,
      [id, userId, isPublic]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get public mood logs (posts) with filters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of public mood logs
   */
  async getPublicMoodLogs(options = {}) {
    const { 
      limit = 20, 
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      currentUserId = null,
      filterUserId = null
    } = options;
    
    let params = [limit, offset];
    let paramCounter = 3;
    
    let whereClause = 'WHERE ml.is_public = true';
    
    if (filterUserId) {
      whereClause += ` AND ml.user_id = $${paramCounter++}`;
      params.push(filterUserId);
    }
    
    const validSortColumns = ['created_at', 'log_date'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sanitizedSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';
    
    // Optional user reaction info
    let userReactionJoin = '';
    if (currentUserId) {
      userReactionJoin = `
        LEFT JOIN (
          SELECT mood_log_id, is_like
          FROM mood_reactions 
          WHERE user_id = $${paramCounter++}
        ) ur ON ur.mood_log_id = ml.id
      `;
      params.push(currentUserId);
    }
    
    const result = await query(
      `SELECT 
         ml.*,
         m.mood_name,
         u.username,
         u.profile_picture,
         ${currentUserId ? 'ur.is_like AS user_reaction,' : ''}
         COALESCE((SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = true), 0) AS like_count,
         COALESCE((SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = false), 0) AS dislike_count,
         COALESCE((SELECT COUNT(*) FROM mood_comments mc WHERE mc.mood_log_id = ml.id), 0) AS comment_count
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.id
       JOIN users u ON ml.user_id = u.id
       ${userReactionJoin}
       ${whereClause}
       ORDER BY ml.${sanitizedSortBy} ${sanitizedSortOrder}
       LIMIT $1 OFFSET $2`,
      params
    );
    
    return result.rows;
  }

  /**
   * Get a public mood log by ID
   * @param {number} id - Mood log ID
   * @param {number} currentUserId - Current user ID (for reaction info)
   * @returns {Promise<Object|null>} - Public mood log or null if not found/not public
   */
  async getPublicMoodLogById(id, currentUserId = null) {
    let params = [id];
    let paramCounter = 2;
    
    // Optional user reaction join
    let userReactionJoin = '';
    if (currentUserId) {
      userReactionJoin = `
        LEFT JOIN (
          SELECT mood_log_id, is_like
          FROM mood_reactions 
          WHERE user_id = $${paramCounter++}
        ) ur ON ur.mood_log_id = ml.id
      `;
      params.push(currentUserId);
    }
    
    const result = await query(
      `SELECT 
         ml.*,
         m.mood_name,
         u.username,
         u.profile_picture,
         ${currentUserId ? 'ur.is_like AS user_reaction,' : ''}
         COALESCE((SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = true), 0) AS like_count,
         COALESCE((SELECT COUNT(*) FROM mood_reactions mr WHERE mr.mood_log_id = ml.id AND mr.is_like = false), 0) AS dislike_count
       FROM mood_logs ml
       JOIN moods m ON ml.mood_id = m.id
       JOIN users u ON ml.user_id = u.id
       ${userReactionJoin}
       WHERE ml.id = $1 AND ml.is_public = true`,
      params
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get a mood log for reaction purposes (minimal validation info)
   * @param {number} id - Mood log ID
   * @returns {Promise<Object|null>} - Basic mood log info or null if not found
   */
  async getMoodLogForReaction(id) {
    const result = await query(
      `SELECT id, user_id, is_public
       FROM mood_logs
       WHERE id = $1`,
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Add a like or dislike to a mood log
   * @param {number} moodLogId - Mood log ID
   * @param {number} userId - User ID
   * @param {boolean} isLike - True for like, false for dislike
   * @returns {Promise<boolean>} - True if added, false if already exists
   */
  async addReaction(moodLogId, userId, isLike) {
    try {
      // If a reaction already exists, update it
      const checkResult = await query(
        `SELECT id, is_like FROM mood_reactions 
         WHERE mood_log_id = $1 AND user_id = $2`,
        [moodLogId, userId]
      );
      
      if (checkResult.rows.length > 0) {
        // If same reaction type, do nothing
        if (checkResult.rows[0].is_like === isLike) {
          return false;
        }
        
        // Update existing reaction
        await query(
          `UPDATE mood_reactions
           SET is_like = $3
           WHERE mood_log_id = $1 AND user_id = $2`,
          [moodLogId, userId, isLike]
        );
        
        return true;
      }
      
      // Create new reaction
      await query(
        `INSERT INTO mood_reactions (mood_log_id, user_id, is_like)
         VALUES ($1, $2, $3)`,
        [moodLogId, userId, isLike]
      );
      
      return true;
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw error;
    }
  }

  /**
   * Remove a reaction from a mood log
   * @param {number} moodLogId - Mood log ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - True if removed, false if not found
   */
  async removeReaction(moodLogId, userId) {
    const result = await query(
      `DELETE FROM mood_reactions
       WHERE mood_log_id = $1 AND user_id = $2`,
      [moodLogId, userId]
    );
    
    return result.rowCount > 0;
  }
}

module.exports = new MoodLogRepository();
