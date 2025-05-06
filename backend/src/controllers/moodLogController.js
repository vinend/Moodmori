const moodLogRepository = require('../repositories/moodLogRepository');
const moodRepository = require('../repositories/moodRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * MoodLog controller for handling mood logging operations
 */
class MoodLogController {
  /**
   * Create a new mood log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createMoodLog(req, res) {
    try {
      const userId = req.user.id;
      const { moodId, note, logDate, isPublic, location } = req.body;

      // Validate required fields
      if (!moodId) {
        return responseFormatter.error(res, 'Mood ID is required', 400);
      }

      // Verify mood exists
      const mood = await moodRepository.getMoodById(moodId);
      if (!mood) {
        return responseFormatter.error(res, 'Invalid mood selected', 400);
      }

      // Create mood log
      const newMoodLog = await moodLogRepository.createMoodLog(
        userId,
        moodId,
        note || null,
        logDate || null,
        isPublic || false,
        location || null
      );

      // Get the mood name to include in the response
      const createdMoodLog = await moodLogRepository.getMoodLogById(newMoodLog.id);

      responseFormatter.success(res, {
        message: 'Mood logged successfully',
        moodLog: createdMoodLog
      });
    } catch (error) {
      console.error('Error in createMoodLog:', error);
      responseFormatter.error(res, 'Failed to log mood', 500);
    }
  }

  /**
   * Get a specific mood log by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMoodLogById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const moodLog = await moodLogRepository.getMoodLogById(id);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }

      // Only allow users to see their own mood logs
      if (moodLog.user_id !== userId) {
        return responseFormatter.error(res, 'Unauthorized', 403);
      }
      
      responseFormatter.success(res, { moodLog });
    } catch (error) {
      console.error('Error in getMoodLogById:', error);
      responseFormatter.error(res, 'Failed to get mood log', 500);
    }
  }

  /**
   * Get all mood logs for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserMoodLogs(req, res) {
    try {
      const userId = req.user.id;
      
      // Parse query parameters for filtering and pagination
      const {
        limit = 50,
        offset = 0,
        sortBy = 'log_date',
        sortOrder = 'DESC',
        startDate,
        endDate,
        moodId
      } = req.query;

      // Get mood logs
      const moodLogs = await moodLogRepository.getMoodLogsByUserId(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        sortOrder,
        startDate: startDate || null,
        endDate: endDate || null,
        moodId: moodId ? parseInt(moodId) : null
      });
      
      responseFormatter.success(res, { moodLogs });
    } catch (error) {
      console.error('Error in getUserMoodLogs:', error);
      responseFormatter.error(res, 'Failed to get mood logs', 500);
    }
  }

  /**
   * Update a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateMoodLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { moodId, note, location, isPublic } = req.body;

      // Check if at least one field is provided
      if (!moodId && note === undefined && location === undefined && isPublic === undefined) {
        return responseFormatter.error(res, 'No fields to update', 400);
      }

      // Verify mood exists if moodId is provided
      if (moodId) {
        const mood = await moodRepository.getMoodById(moodId);
        if (!mood) {
          return responseFormatter.error(res, 'Invalid mood selected', 400);
        }
      }

      // Update mood log
      const updatedMoodLog = await moodLogRepository.updateMoodLog(id, userId, {
        mood_id: moodId,
        note,
        location,
        is_public: isPublic
      });

      if (!updatedMoodLog) {
        return responseFormatter.error(res, 'Mood log not found or unauthorized', 404);
      }

      // Get the full updated mood log with mood name
      const moodLog = await moodLogRepository.getMoodLogById(id);

      responseFormatter.success(res, {
        message: 'Mood log updated successfully',
        moodLog
      });
    } catch (error) {
      console.error('Error in updateMoodLog:', error);
      responseFormatter.error(res, 'Failed to update mood log', 500);
    }
  }

  /**
   * Delete a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteMoodLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await moodLogRepository.deleteMoodLog(id, userId);
      
      if (!deleted) {
        return responseFormatter.error(res, 'Mood log not found or unauthorized', 404);
      }
      
      responseFormatter.success(res, { 
        message: 'Mood log deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteMoodLog:', error);
      responseFormatter.error(res, 'Failed to delete mood log', 500);
    }
  }

  /**
   * Get mood statistics for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMoodStats(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      const stats = await moodLogRepository.getMoodStats(
        userId,
        startDate || null,
        endDate || null
      );
      
      responseFormatter.success(res, { stats });
    } catch (error) {
      console.error('Error in getMoodStats:', error);
      responseFormatter.error(res, 'Failed to get mood statistics', 500);
    }
  }

  /**
   * Get mood logs that are shared as posts (publicly viewable)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPublicMoodLogs(req, res) {
    try {
      const userId = req.user.id;
      
      // Parse query parameters for filtering and pagination
      const {
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        userId: filterUserId
      } = req.query;

      // Get public mood logs
      const posts = await moodLogRepository.getPublicMoodLogs({
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        sortOrder,
        currentUserId: userId,
        filterUserId: filterUserId ? parseInt(filterUserId) : null
      });
      
      responseFormatter.success(res, { posts });
    } catch (error) {
      console.error('Error in getPublicMoodLogs:', error);
      responseFormatter.error(res, 'Failed to get public mood logs', 500);
    }
  }

  /**
   * Update a mood log's visibility (public/private)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateMoodLogVisibility(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { isPublic } = req.body;
      
      if (isPublic === undefined) {
        return responseFormatter.error(res, 'Visibility status is required', 400);
      }
      
      const updatedMoodLog = await moodLogRepository.updateMoodLogVisibility(id, userId, isPublic);
      
      if (!updatedMoodLog) {
        return responseFormatter.error(res, 'Mood log not found or unauthorized', 404);
      }
      
      responseFormatter.success(res, {
        message: `Mood log is now ${isPublic ? 'public' : 'private'}`,
        moodLog: updatedMoodLog
      });
    } catch (error) {
      console.error('Error in updateMoodLogVisibility:', error);
      responseFormatter.error(res, 'Failed to update mood log visibility', 500);
    }
  }
  
  /**
   * Add a like to a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async likeMoodLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Ensure the mood log exists and is public
      const moodLog = await moodLogRepository.getMoodLogForReaction(id);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }
      
      if (!moodLog.is_public) {
        return responseFormatter.error(res, 'Cannot like a private mood log', 403);
      }
      
      // Can't like your own mood log
      if (moodLog.user_id === userId) {
        return responseFormatter.error(res, 'Cannot like your own mood log', 400);
      }
      
      const result = await moodLogRepository.addReaction(id, userId, true);
      
      responseFormatter.success(res, {
        message: 'Mood log liked successfully',
        liked: result
      });
    } catch (error) {
      console.error('Error in likeMoodLog:', error);
      responseFormatter.error(res, 'Failed to like mood log', 500);
    }
  }
  
  /**
   * Add a dislike to a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async dislikeMoodLog(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Ensure the mood log exists and is public
      const moodLog = await moodLogRepository.getMoodLogForReaction(id);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }
      
      if (!moodLog.is_public) {
        return responseFormatter.error(res, 'Cannot dislike a private mood log', 403);
      }
      
      // Can't dislike your own mood log
      if (moodLog.user_id === userId) {
        return responseFormatter.error(res, 'Cannot dislike your own mood log', 400);
      }
      
      const result = await moodLogRepository.addReaction(id, userId, false);
      
      responseFormatter.success(res, {
        message: 'Mood log disliked successfully',
        disliked: result
      });
    } catch (error) {
      console.error('Error in dislikeMoodLog:', error);
      responseFormatter.error(res, 'Failed to dislike mood log', 500);
    }
  }
  
  /**
   * Remove a reaction from a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeReaction(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const removed = await moodLogRepository.removeReaction(id, userId);
      
      if (!removed) {
        return responseFormatter.error(res, 'No reaction found to remove', 404);
      }
      
      responseFormatter.success(res, {
        message: 'Reaction removed successfully'
      });
    } catch (error) {
      console.error('Error in removeReaction:', error);
      responseFormatter.error(res, 'Failed to remove reaction', 500);
    }
  }
  
  /**
   * Get public mood log by ID (for viewing a single post)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPublicMoodLogById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const post = await moodLogRepository.getPublicMoodLogById(id, userId);
      
      if (!post) {
        return responseFormatter.error(res, 'Post not found or not accessible', 404);
      }
      
      responseFormatter.success(res, { post });
    } catch (error) {
      console.error('Error in getPublicMoodLogById:', error);
      responseFormatter.error(res, 'Failed to get post', 500);
    }
  }
}

module.exports = new MoodLogController();