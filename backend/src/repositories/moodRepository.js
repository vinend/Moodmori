const { query } = require('../database/connection');

/**
 * Mood repository for database operations related to moods
 */
class MoodRepository {
  /**
   * Get all available moods
   * @returns {Promise<Array>} - List of mood objects
   */
  async getAllMoods() {
    const result = await query('SELECT * FROM moods ORDER BY id');
    return result.rows;
  }

  /**
   * Get a mood by ID
   * @param {number} id - Mood ID
   * @returns {Promise<Object|null>} - Mood object or null if not found
   */
  async getMoodById(id) {
    const result = await query('SELECT * FROM moods WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create initial mood categories if they don't exist
   * @returns {Promise<void>}
   */
  async initializeMoods() {
    // OMORI-themed mood categories
    const defaultMoods = [
      'HAPPY', 'SAD', 'ANGRY', 'AFRAID', 'NEUTRAL',
      'MANIC', 'DEPRESSED', 'FURIOUS', 'TERRIFIED', 'CALM'
    ];
    
    // Check if moods table is empty
    const existingMoods = await query('SELECT COUNT(*) FROM moods');
    
    if (parseInt(existingMoods.rows[0].count) === 0) {
      // Insert default moods if table is empty
      for (const mood of defaultMoods) {
        await query('INSERT INTO moods (mood_name) VALUES ($1) ON CONFLICT (mood_name) DO NOTHING', [mood]);
      }
      console.log('Default moods initialized');
    }
  }
}

module.exports = new MoodRepository();