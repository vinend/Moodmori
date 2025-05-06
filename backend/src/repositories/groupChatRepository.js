const db = require('../database/connection');

/**
 * Repository for handling group chat operations in the database
 */
class GroupChatRepository {
  /**
   * Create a new group chat
   * @param {string} name - Name of the group
   * @param {number} creatorId - ID of the group creator
   * @param {string|null} description - Description of the group
   * @param {Array} memberIds - Array of user IDs to add as members
   * @returns {Object} The created group
   */
  async createGroup(name, creatorId, description, memberIds) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create the group
      const groupResult = await client.query(
        `INSERT INTO group_chats (name, creator_id, description, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, name, creator_id, description, created_at`,
        [name, creatorId, description]
      );
      
      const group = groupResult.rows[0];
      
      // Add members to the group
      for (const memberId of memberIds) {
        await client.query(
          `INSERT INTO group_members (group_id, user_id, joined_at)
           VALUES ($1, $2, NOW())`,
          [group.id, memberId]
        );
      }
      
      await client.query('COMMIT');
      
      return group;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createGroup:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all groups that a user is a member of
   * @param {number} userId - ID of the user
   * @returns {Array} List of groups
   */
  async getGroupsByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT 
           gc.*,
           (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = gc.id) as member_count
         FROM group_chats gc
         JOIN group_members gm ON gc.id = gm.group_id
         WHERE gm.user_id = $1
         ORDER BY gc.created_at DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getGroupsByUserId:', error);
      throw error;
    }
  }

  /**
   * Get a group by ID
   * @param {number} groupId - ID of the group
   * @returns {Object|null} The group or null if not found
   */
  async getGroupById(groupId) {
    try {
      const result = await db.query(
        `SELECT 
           gc.*,
           (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = gc.id) as member_count
         FROM group_chats gc
         WHERE gc.id = $1`,
        [groupId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in getGroupById:', error);
      throw error;
    }
  }

  /**
   * Check if a user is a member of a group
   * @param {number} groupId - ID of the group
   * @param {number} userId - ID of the user
   * @returns {boolean} True if the user is a member, false otherwise
   */
  async isGroupMember(groupId, userId) {
    try {
      const result = await db.query(
        `SELECT 1 
         FROM group_members 
         WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error in isGroupMember:', error);
      throw error;
    }
  }

  /**
   * Get all members of a group
   * @param {number} groupId - ID of the group
   * @returns {Array} List of members with user info
   */
  async getGroupMembers(groupId) {
    try {
      const result = await db.query(
        `SELECT 
           u.id, 
           u.username, 
           u.profile_picture,
           gm.joined_at,
           CASE WHEN gc.creator_id = u.id THEN true ELSE false END as is_creator
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         JOIN group_chats gc ON gm.group_id = gc.id
         WHERE gm.group_id = $1
         ORDER BY is_creator DESC, gm.joined_at ASC`,
        [groupId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      throw error;
    }
  }

  /**
   * Update a group's details
   * @param {number} groupId - ID of the group
   * @param {Object} data - Group data to update
   * @returns {Object} The updated group
   */
  async updateGroup(groupId, data) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (data.name !== undefined) {
        fields.push(`name = $${paramCount}`);
        values.push(data.name);
        paramCount++;
      }
      
      if (data.description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(data.description);
        paramCount++;
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(groupId);
      
      const result = await db.query(
        `UPDATE group_chats
         SET ${fields.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, name, creator_id, description, created_at`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateGroup:', error);
      throw error;
    }
  }

  /**
   * Delete a group
   * @param {number} groupId - ID of the group to delete
   * @returns {boolean} True if successful
   */
  async deleteGroup(groupId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Delete all messages in the group
      await client.query(
        'DELETE FROM group_messages WHERE group_id = $1',
        [groupId]
      );
      
      // Delete all members from the group
      await client.query(
        'DELETE FROM group_members WHERE group_id = $1',
        [groupId]
      );
      
      // Delete the group itself
      await client.query(
        'DELETE FROM group_chats WHERE id = $1',
        [groupId]
      );
      
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in deleteGroup:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add a member to a group
   * @param {number} groupId - ID of the group
   * @param {number} userId - ID of the user to add
   * @returns {boolean} True if successful
   */
  async addMember(groupId, userId) {
    try {
      await db.query(
        `INSERT INTO group_members (group_id, user_id, joined_at)
         VALUES ($1, $2, NOW())`,
        [groupId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error in addMember:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a group
   * @param {number} groupId - ID of the group
   * @param {number} userId - ID of the user to remove
   * @returns {boolean} True if successful
   */
  async removeMember(groupId, userId) {
    try {
      await db.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error in removeMember:', error);
      throw error;
    }
  }

  /**
   * Create a new message in a group
   * @param {number} groupId - ID of the group
   * @param {number} senderId - ID of the message sender
   * @param {string} content - Message content
   * @returns {Object} The created message
   */
  async createGroupMessage(groupId, senderId, content) {
    try {
      const result = await db.query(
        `INSERT INTO group_messages (group_id, sender_id, content, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, group_id, sender_id, content, created_at`,
        [groupId, senderId, content]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in createGroupMessage:', error);
      throw error;
    }
  }

  /**
   * Get messages from a group
   * @param {number} groupId - ID of the group
   * @param {Object} options - Pagination options
   * @returns {Array} List of messages with sender info
   */
  async getGroupMessages(groupId, options = { limit: 50, offset: 0 }) {
    try {
      const result = await db.query(
        `SELECT 
           gm.*,
           u.username,
           u.profile_picture
         FROM group_messages gm
         JOIN users u ON gm.sender_id = u.id
         WHERE gm.group_id = $1
         ORDER BY gm.created_at DESC
         LIMIT $2 OFFSET $3`,
        [groupId, options.limit, options.offset]
      );
      
      return result.rows.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error in getGroupMessages:', error);
      throw error;
    }
  }
}

module.exports = new GroupChatRepository();