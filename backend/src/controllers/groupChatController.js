const groupChatRepository = require('../repositories/groupChatRepository');
const userRepository = require('../repositories/userRepository');
const responseFormatter = require('../utils/responseFormatter');

/**
 * Group Chat controller for handling group chat operations
 */
class GroupChatController {
  /**
   * Create a new group chat
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */  async createGroup(req, res) {
    try {
      const creatorId = req.user.id;
      const { name, description, memberIds = [] } = req.body;
      
      console.log('Group creation request:', {
        creatorId,
        name,
        description,
        memberIds,
        reqBody: req.body
      });
      
      // Validate required fields
      if (!name) {
        return responseFormatter.error(res, 'Group name is required', 400);
      }
        // Ensure all memberIds are numbers
      const numericMemberIds = memberIds.map(id => 
        typeof id === 'string' ? parseInt(id, 10) : id
      );
      
      // Ensure creator is included in the members list
      if (!numericMemberIds.includes(creatorId)) {
        numericMemberIds.push(creatorId);
      }
      
      // Make sure all memberIds are unique to avoid DB constraint violations
      const uniqueMemberIds = [...new Set(numericMemberIds)].filter(id => !isNaN(id));
      
      console.log('Processed memberIds:', uniqueMemberIds);        // Create the group
      const group = await groupChatRepository.createGroup(
        name,
        creatorId,
        description || null,
        uniqueMemberIds
      );
      
      responseFormatter.success(res, {
        message: 'Group created successfully',
        group
      });    } catch (error) {
      console.error('Error in createGroup:', error);
      
      // Provide a more specific error message if possible
      let errorMessage = 'Failed to create group';
      let statusCode = 500;
      
      if (error.message === 'Failed to add any members to the group') {
        errorMessage = 'Could not add members to the group. Please verify all user IDs are valid.';
        statusCode = 400;
      } else if (error.code === '23505') { // PostgreSQL unique constraint violation
        errorMessage = 'A duplicate record was detected. Please try again with unique members.';
        statusCode = 409;
      } else if (error.code === '23503') { // PostgreSQL foreign key violation
        errorMessage = 'One or more references are invalid. Please check user IDs.';
        statusCode = 400;
      }
      
      responseFormatter.error(res, errorMessage, statusCode);
    }
  }

  /**
   * Get all groups that the user is a member of
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserGroups(req, res) {
    try {
      const userId = req.user.id;
      
      const groups = await groupChatRepository.getGroupsByUserId(userId);
      
      responseFormatter.success(res, { groups });
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      responseFormatter.error(res, 'Failed to retrieve groups', 500);
    }
  }

  /**
   * Get details of a specific group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGroupDetails(req, res) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      
      // Check if the user is a member of the group
      const isMember = await groupChatRepository.isGroupMember(groupId, userId);
      if (!isMember) {
        return responseFormatter.error(res, 'You are not a member of this group', 403);
      }
      
      // Get group details
      const group = await groupChatRepository.getGroupById(groupId);
      if (!group) {
        return responseFormatter.error(res, 'Group not found', 404);
      }
      
      // Get group members
      const members = await groupChatRepository.getGroupMembers(groupId);
      
      responseFormatter.success(res, {
        group,
        members
      });
    } catch (error) {
      console.error('Error in getGroupDetails:', error);
      responseFormatter.error(res, 'Failed to retrieve group details', 500);
    }
  }

  /**
   * Update a group's details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateGroup(req, res) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { name, description } = req.body;
      
      // Validate if there's anything to update
      if (!name && description === undefined) {
        return responseFormatter.error(res, 'No fields to update', 400);
      }
      
      // Check if the user is the creator of the group
      const group = await groupChatRepository.getGroupById(groupId);
      if (!group) {
        return responseFormatter.error(res, 'Group not found', 404);
      }
      
      if (group.creator_id !== userId) {
        return responseFormatter.error(res, 'Only the group creator can update the group', 403);
      }
      
      // Update the group
      const updatedGroup = await groupChatRepository.updateGroup(groupId, {
        name,
        description
      });
      
      responseFormatter.success(res, {
        message: 'Group updated successfully',
        group: updatedGroup
      });
    } catch (error) {
      console.error('Error in updateGroup:', error);
      responseFormatter.error(res, 'Failed to update group', 500);
    }
  }

  /**
   * Delete a group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteGroup(req, res) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      
      // Check if the user is the creator of the group
      const group = await groupChatRepository.getGroupById(groupId);
      if (!group) {
        return responseFormatter.error(res, 'Group not found', 404);
      }
      
      if (group.creator_id !== userId) {
        return responseFormatter.error(res, 'Only the group creator can delete the group', 403);
      }
      
      // Delete the group
      await groupChatRepository.deleteGroup(groupId);
      
      responseFormatter.success(res, {
        message: 'Group deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteGroup:', error);
      responseFormatter.error(res, 'Failed to delete group', 500);
    }
  }

  /**
   * Add a member to a group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addMember(req, res) {
    try {
      const currentUserId = req.user.id;
      const { groupId } = req.params;
      const { userId } = req.body;
      
      // Validate required fields
      if (!userId) {
        return responseFormatter.error(res, 'User ID is required', 400);
      }
      
      // Check if the current user is a member of the group
      const isCurrentUserMember = await groupChatRepository.isGroupMember(groupId, currentUserId);
      if (!isCurrentUserMember) {
        return responseFormatter.error(res, 'You are not a member of this group', 403);
      }
      
      // Check if the user to be added exists
      const user = await userRepository.findById(userId);
      if (!user) {
        return responseFormatter.error(res, 'User not found', 404);
      }
      
      // Check if the user is already a member
      const isAlreadyMember = await groupChatRepository.isGroupMember(groupId, userId);
      if (isAlreadyMember) {
        return responseFormatter.error(res, 'User is already a member of this group', 409);
      }
      
      // Add the user to the group
      await groupChatRepository.addMember(groupId, userId);
      
      responseFormatter.success(res, {
        message: 'User added to group successfully'
      });
    } catch (error) {
      console.error('Error in addMember:', error);
      responseFormatter.error(res, 'Failed to add user to group', 500);
    }
  }

  /**
   * Remove a member from a group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async removeMember(req, res) {
    try {
      const currentUserId = req.user.id;
      const { groupId, userId } = req.params;
      
      // Get group info
      const group = await groupChatRepository.getGroupById(groupId);
      if (!group) {
        return responseFormatter.error(res, 'Group not found', 404);
      }
      
      // Check if the current user is the creator or the user is removing themselves
      const isCreator = group.creator_id === currentUserId;
      const isSelfRemoval = parseInt(userId) === currentUserId;
      
      if (!isCreator && !isSelfRemoval) {
        return responseFormatter.error(res, 'Only the group creator can remove other members', 403);
      }
      
      // Cannot remove the creator unless they're removing themselves
      if (parseInt(userId) === group.creator_id && !isSelfRemoval) {
        return responseFormatter.error(res, 'Cannot remove the group creator', 403);
      }
      
      // Remove the member
      await groupChatRepository.removeMember(groupId, userId);
      
      responseFormatter.success(res, {
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Error in removeMember:', error);
      responseFormatter.error(res, 'Failed to remove member from group', 500);
    }
  }

  /**
   * Send a message to a group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendGroupMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { groupId } = req.params;
      const { content } = req.body;
      
      // Validate required fields
      if (!content) {
        return responseFormatter.error(res, 'Message content is required', 400);
      }
      
      // Check if the user is a member of the group
      const isMember = await groupChatRepository.isGroupMember(groupId, senderId);
      if (!isMember) {
        return responseFormatter.error(res, 'You are not a member of this group', 403);
      }
        // Send the message
      const messageData = await groupChatRepository.createGroupMessage(groupId, senderId, content);
      
      responseFormatter.success(res, {
        message: messageData
      });
    } catch (error) {
      console.error('Error in sendGroupMessage:', error);
      responseFormatter.error(res, 'Failed to send message', 500);
    }
  }

  /**
   * Get messages from a group
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGroupMessages(req, res) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Check if the user is a member of the group
      const isMember = await groupChatRepository.isGroupMember(groupId, userId);
      if (!isMember) {
        return responseFormatter.error(res, 'You are not a member of this group', 403);
      }
      
      // Get messages
      const messages = await groupChatRepository.getGroupMessages(
        groupId,
        {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );
      
      responseFormatter.success(res, { messages });
    } catch (error) {
      console.error('Error in getGroupMessages:', error);
      responseFormatter.error(res, 'Failed to retrieve messages', 500);
    }
  }
}

module.exports = new GroupChatController();