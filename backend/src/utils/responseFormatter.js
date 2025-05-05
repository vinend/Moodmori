/**
 * Utility to format consistent API responses
 */
class ResponseFormatter {
  /**
   * Format a successful response
   * @param {Object} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  success(res, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      ...data
    });
  }

  /**
   * Format an error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} errors - Additional error details
   */
  error(res, message = 'Internal server error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = new ResponseFormatter();