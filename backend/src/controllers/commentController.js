const commentRepository = require('../repositories/commentRepository');
const moodLogRepository = require('../repositories/moodLogRepository');
const responseFormatter = require('../utils/responseFormatter');
const { query } = require('../database/connection'); // Import query for transaction

/**
 * Comment controller for handling mood log comment operations
 */
class CommentController {
  /**
   * Add a new comment to a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addComment(req, res) {
    try {
      const userId = req.user.id;
      const { moodLogId } = req.params;
      const { content } = req.body;

      // Validate required fields
      if (!content || !content.trim()) {
        return responseFormatter.error(res, 'Comment content is required', 400);
      }

      // Check if mood log exists and is public (or belongs to user)
      const moodLog = await moodLogRepository.getMoodLogById(moodLogId);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }

      // Only allow comments on public mood logs or user's own logs
      if (!moodLog.is_public && moodLog.user_id !== userId) {
        return responseFormatter.error(res, 'Cannot comment on private mood logs', 403);
      }

      // Add the comment
      const comment = await commentRepository.addComment(moodLogId, userId, content);

      // Get the full comment with user info
      const comments = await commentRepository.getCommentsByMoodLogId(moodLogId);
      const newComment = comments.find(c => c.id === comment.id);

      responseFormatter.success(res, {
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      responseFormatter.error(res, 'Failed to add comment', 500);
    }
  }

  /**
   * Get all comments for a mood log
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getComments(req, res) {
    try {
      const userId = req.user.id;
      const { moodLogId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      // Check if mood log exists and is public (or belongs to user)
      const moodLog = await moodLogRepository.getMoodLogById(moodLogId);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Mood log not found', 404);
      }

      // Only allow viewing comments on public mood logs or user's own logs
      if (!moodLog.is_public && moodLog.user_id !== userId) {
        return responseFormatter.error(res, 'Cannot view comments on private mood logs', 403);
      }

      const comments = await commentRepository.getCommentsByMoodLogId(
        moodLogId, 
        { limit: parseInt(limit), offset: parseInt(offset) }
      );
      
      responseFormatter.success(res, { comments });
    } catch (error) {
      console.error('Error in getComments:', error);
      responseFormatter.error(res, 'Failed to get comments', 500);
    }
  }

  /**
   * Delete a comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteComment(req, res) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;

      // Check if comment exists
      const comment = await commentRepository.getCommentById(commentId);
      
      if (!comment) {
        return responseFormatter.error(res, 'Comment not found', 404);
      }

      // Check if mood log exists
      const moodLog = await moodLogRepository.getMoodLogById(comment.mood_log_id);
      
      if (!moodLog) {
        return responseFormatter.error(res, 'Associated mood log not found', 404);
      }

      // Only allow comment deletion by comment author or mood log owner
      if (comment.user_id !== userId && moodLog.user_id !== userId) {
        return responseFormatter.error(res, 'Not authorized to delete this comment', 403);
      }

      await commentRepository.deleteComment(commentId);

      responseFormatter.success(res, {
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteComment:', error);
      responseFormatter.error(res, 'Failed to delete comment', 500);
    }
  }
}

module.exports = new CommentController();
