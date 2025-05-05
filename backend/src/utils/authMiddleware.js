const responseFormatter = require('./responseFormatter');
const userRepository = require('../repositories/userRepository');

/**
 * Session-based authentication middleware
 * Checks if user is logged in via session and attaches user to request
 */
const authenticate = async (req, res, next) => {
  // Check if user is logged in (session exists)
  if (!req.session || !req.session.userId) {
    return responseFormatter.error(res, 'Please log in to access this resource', 401);
  }
  
  try {
    // Attach user to request
    req.user = { id: req.session.userId };
    
    // User is authenticated, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return responseFormatter.error(res, 'Authentication error', 500);
  }
};

module.exports = authenticate;