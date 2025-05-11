const moodRepository = require('../repositories/moodRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * Mood controller for handling mood-related operations
 */
class MoodController {
  /**
   * Get all available mood categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllMoods(req, res) {
    try {
      const moods = await moodRepository.getAllMoods();
      responseFormatter.success(res, { moods });
    } catch (error) {
      console.error('Error in getAllMoods:', error);
      responseFormatter.error(res, 'Failed to get moods', 500);
    }
  }

  /**
   * Initialize default OMORI-themed moods if they don't exist
   * This should be called when the application starts
   */
  async initializeMoods() {
    try {
      await moodRepository.initializeMoods();
      console.log('Default moods initialized or already exist');
    } catch (error) {
      console.error('Failed to initialize default moods:', error);
    }
  }

  /**
   * Get a specific mood by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMoodById(req, res) {
    try {
      const { id } = req.params;
      
      const mood = await moodRepository.getMoodById(id);
      
      if (!mood) {
        return responseFormatter.error(res, 'Mood not found', 404);
      }
      
      responseFormatter.success(res, { mood });
    } catch (error) {
      console.error('Error in getMoodById:', error);
      responseFormatter.error(res, 'Failed to get mood', 500);
    }
  }
}

module.exports = new MoodController();