const express = require('express');
const commentController = require('../controllers/commentController');
const authenticate = require('../utils/authMiddleware');
const { imageUploader } = require('../utils/cloudinaryUploader'); // Import imageUploader

const router = express.Router();

/**
 * Comment routes for managing comments on mood logs
 */

// Get all comments for a mood log
router.get('/mood-log/:moodLogId', authenticate, commentController.getComments);

const multer = require('multer'); // Import multer to check for MulterError
const responseFormatter = require('../utils/responseFormatter'); // For consistent error responses

// Add a comment to a mood log
// Added imageUploader.single('image') to handle file upload
router.post('/mood-log/:moodLogId', authenticate, imageUploader.single('image'), (err, req, res, next) => {
  // Middleware to catch multer-specific errors
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === 'LIMIT_FILE_SIZE') {
      return responseFormatter.error(res, 'Image file is too large. Maximum size is 5MB.', 400);
    }
    return responseFormatter.error(res, `Image upload error: ${err.message}`, 400);
  } else if (err) {
    // An unknown error occurred when uploading (e.g. from fileFilter).
    // Treat as a client error (Bad Request).
    return responseFormatter.error(res, `Image upload failed: ${err.message}`, 400);
  }
  // Everything went fine with multer, proceed to the controller
  next();
}, commentController.addComment);

// Delete a comment
router.delete('/:commentId', authenticate, commentController.deleteComment);

module.exports = router;
