const userRepository = require('../repositories/userRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * User controller for handling user-related operations
 */
class UserController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return responseFormatter.error(res, 'Username, email, and password are required', 400);
      }

      // Check if user already exists
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        return responseFormatter.error(res, 'Email already in use', 409);
      }

      const existingUserByUsername = await userRepository.findByUsername(username);
      if (existingUserByUsername) {
        return responseFormatter.error(res, 'Username already in use', 409);
      }

      // Create user
      const newUser = await userRepository.createUser(username, email, password);

      // Log in the user automatically after registration
      req.session.userId = newUser.id;
      req.session.username = newUser.username;
      req.session.email = newUser.email;

      responseFormatter.success(res, {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('Error in register:', error);
      responseFormatter.error(res, 'Failed to register user', 500);
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return responseFormatter.error(res, 'Email and password are required', 400);
      }

      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return responseFormatter.error(res, 'Invalid credentials', 401);
      }

      // Verify password
      const isPasswordValid = await userRepository.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return responseFormatter.error(res, 'Invalid credentials', 401);
      }

      // Store user info in session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.email = user.email;

      responseFormatter.success(res, {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      responseFormatter.error(res, 'Failed to login', 500);
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return responseFormatter.error(res, 'Failed to logout', 500);
        }
        
        res.clearCookie('connect.sid');
        return responseFormatter.success(res, { 
          message: 'Logout successful' 
        });
      });
    } else {
      return responseFormatter.success(res, { 
        message: 'Already logged out' 
      });
    }
  }

  /**
   * Get current user's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.session.userId;
      
      const user = await userRepository.findById(userId);
      if (!user) {
        return responseFormatter.error(res, 'User not found', 404);
      }

      responseFormatter.success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profilePicture: user.profile_picture
        }
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      responseFormatter.error(res, 'Failed to get user profile', 500);
    }
  }

  /**
   * Update user's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.session.userId;
      const { username, email } = req.body;
      let profilePictureUrl = null;

      // Check if a file was uploaded
      if (req.file && req.file.path) {
        profilePictureUrl = req.file.path;
      }

      // Validate if there's anything to update
      if (!username && !email && !profilePictureUrl) {
        return responseFormatter.error(res, 'No fields to update', 400);
      }

      // Check username uniqueness if provided
      if (username) {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return responseFormatter.error(res, 'Username already in use', 409);
        }
      }

      // Check email uniqueness if provided
      if (email) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return responseFormatter.error(res, 'Email already in use', 409);
        }
      }

      // Create update data object
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (profilePictureUrl) updateData.profile_picture = profilePictureUrl;

      // Update user
      const updatedUser = await userRepository.updateUser(userId, updateData);

      // Update session with new user info if needed
      if (username) req.session.username = username;
      if (email) req.session.email = email;

      responseFormatter.success(res, {
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      responseFormatter.error(res, 'Failed to update profile', 500);
    }
  }

  /**
   * Update user's password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updatePassword(req, res) {
    try {
      const userId = req.session.userId;
      const { currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return responseFormatter.error(res, 'Current password and new password are required', 400);
      }

      // Get user with password_hash
      const user = await userRepository.findById(userId);
      if (!user) {
        return responseFormatter.error(res, 'User not found', 404);
      }
      
      // Verify current password
      const isPasswordValid = await userRepository.verifyPassword(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return responseFormatter.error(res, 'Current password is incorrect', 401);
      }

      // Update password
      await userRepository.updatePassword(userId, newPassword);

      responseFormatter.success(res, {
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error in updatePassword:', error);
      responseFormatter.error(res, 'Failed to update password', 500);
    }
  }
}

module.exports = new UserController();