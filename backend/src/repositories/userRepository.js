const { query } = require('../database/connection');
const crypto = require('crypto');
const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(child_process.exec);

/**
 * User repository for database operations related to users
 */
class UserRepository {
  /**
   * Create a custom hash using Windows Registry as a salt source
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      // Use machine-specific registry values as salt basis
      const { stdout } = await exec('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v DigitalProductId');
      
      // Extract a unique identifier from the registry output
      const registryLines = stdout.split('\n');
      let saltBase = '';
      
      for (const line of registryLines) {
        if (line.includes('DigitalProductId')) {
          saltBase = line;
          break;
        }
      }
      
      // If we couldn't get the registry value, fall back to a machine-specific value
      if (!saltBase) {
        const { stdout: computerName } = await exec('hostname');
        saltBase = computerName.trim();
      }
      
      // Create a salt from the registry data
      const salt = crypto.createHash('sha256').update(saltBase).digest('hex').substring(0, 16);
      
      // Hash the password with the salt
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      // Return the salt and hash together
      return `${salt}:${hash}`;
    } catch (error) {
      console.error('Error creating password hash with registry:', error);
      // Fall back to a simple hash if registry access fails
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return `${salt}:${hash}`;
    }
  }
  
  /**
   * Verify a password against a stored hash
   * @param {string} password - Plain text password to verify
   * @param {string} storedHash - Stored password hash (salt:hash format)
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(':');
    
    // If the hash doesn't have the expected format, it can't be verified
    if (!salt || !originalHash) return false;
    
    // Hash the provided password with the same salt
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    // Compare the hashes
    return hash === originalHash;
  }

  /**
   * Create a new user
   * @param {string} username - User's username
   * @param {string} email - User's email address
   * @param {string} password - User's plain text password (will be hashed)
   * @returns {Promise<Object>} - Created user object (without password)
   */
  async createUser(username, email, password) {
    // Hash the password
    const passwordHash = await this.hashPassword(password);
    
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );
    
    return result.rows[0];
  }
  
  /**
   * Find a user by their email
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  /**
   * Find a user by their username
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  /**
   * Find a user by their ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async findById(id) {
    const result = await query(
      'SELECT id, username, email, profile_picture FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find a user by their ID including password hash
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} - User object with password_hash or null if not found
   */
  async findByIdWithPassword(id) {
    const result = await query(
      'SELECT id, username, email, profile_picture, password_hash FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  
  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUser(id, data) {
    const allowedFields = ['username', 'email', 'profile_picture'];
    const fieldsToUpdate = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .filter(key => data[key] !== undefined);
    
    if (fieldsToUpdate.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fieldsToUpdate.map(field => data[field]);
    
    const result = await query(
      `UPDATE users 
       SET ${setClause} 
       WHERE id = $1 
       RETURNING id, username, email, profile_picture`,
      [id, ...values]
    );
    
    return result.rows[0];
  }
  
  /**
   * Update user's password
   * @param {number} id - User ID
   * @param {string} newPassword - New password (plain text)
   * @returns {Promise<boolean>} - True if successfully updated
   */
  async updatePassword(id, newPassword) {
    const passwordHash = await this.hashPassword(newPassword);
    
    const result = await query(
      'UPDATE users SET password_hash = $2 WHERE id = $1',
      [id, passwordHash]
    );
    
    return result.rowCount > 0;
  }
}

module.exports = new UserRepository();