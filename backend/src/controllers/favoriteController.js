const favoriteRepository = require('../repositories/favoriteRepository');
const moodLogRepository = require('../repositories/moodLogRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * Favorite controller for handling favorite mood logs operations
 */
class FavoriteController {
  /**
   * Add a mood log to favorites
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { moodLogId } = req.body;

      // Validate required fields
      if (!moodLogId) {
        return responseFormatter.error(res, 'Mood log ID is required', 400);
      }

      // Check if mood log exists and belongs to the user
      const moodLog = await moodLogRepository.getMoodLogById(moodLogId);
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }

      if (moodLog.user_id !== userId) {
        return responseFormatter.error(res, 'Unauthorized', 403);
      }

      // Add to favorites
      await favoriteRepository.addFavorite(userId, moodLogId);
      
      responseFormatter.success(res, {
        message: 'Mood log added to favorites'
      });
    } catch (error) {
      console.error('Error in addFavorite:', error);
      responseFormatter.error(res, 'Failed to add to favorites', 500);
    }
  }

  /**
   * Remove a mood log from favorites
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { moodLogId } = req.params;

      // Remove from favorites
      const removed = await favoriteRepository.removeFavorite(userId, moodLogId);
      
      if (!removed) {
        return responseFormatter.error(res, 'Mood log not in favorites', 404);
      }
      
      responseFormatter.success(res, {
        message: 'Mood log removed from favorites'
      });
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      responseFormatter.error(res, 'Failed to remove from favorites', 500);
    }
  }

  /**
   * Get all favorited mood logs for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFavorites(req, res) {
    try {
      const userId = req.user.id;
      
      const favorites = await favoriteRepository.getFavorites(userId);
      
      responseFormatter.success(res, { favorites });
    } catch (error) {
      console.error('Error in getFavorites:', error);
      responseFormatter.error(res, 'Failed to get favorites', 500);
    }
  }

  /**
   * Check if a mood log is in favorites
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { moodLogId } = req.params;

      const isFavorite = await favoriteRepository.isFavorite(userId, moodLogId);
      
      responseFormatter.success(res, { isFavorite });
    } catch (error) {
      console.error('Error in checkFavorite:', error);
      responseFormatter.error(res, 'Failed to check favorite status', 500);
    }
  }
}

module.exports = new FavoriteController();