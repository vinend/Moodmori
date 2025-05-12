import React, { useState, useEffect, useRef } from 'react';
import { FaChevronRight, FaUser, FaComment, FaSearch, FaPlus, FaTimes, FaUsers, FaImage, FaMapMarkerAlt, FaPaperclip } from 'react-icons/fa';
import api from '../api/axiosConfig';

const ChatPanel = ({ isOpen, onClose, user }) => {  
  // States for panel management
  const [activeChat, setActiveChat] = useState(() => {
    // Try to recover activeChat from localStorage when component mounts
    const savedChat = localStorage.getItem('activeChat');
    const savedIsGroup = localStorage.getItem('isGroupChat');
    if (savedChat) {
      return parseInt(savedChat, 10);
    }
    return null;
  });
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastMessageId, setLastMessageId] = useState(null);
  const pollingInterval = useRef(null);
  const [isGroup, setIsGroup] = useState(() => {
    // Try to recover isGroup from localStorage when component mounts
    return localStorage.getItem('isGroupChat') === 'true';
  });
  
  // Media attachment states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const fileInputRef = useRef(null);
  // Group chat states
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupProfilePicture, setGroupProfilePicture] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupProfilePicture, setEditGroupProfilePicture] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  // States for conversations list
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState('');
  // States for user search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
    // Fetch conversations when panel opens
  useEffect(() => {    
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);
  
  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      if (isGroup) {
        fetchGroupMessages(activeChat);
      } else {
        fetchMessages(activeChat);
      }
      
      // Start polling for new messages
      startMessagePolling(activeChat);
    } else {
      setMessages([]);
      setChatUser(null);
      stopMessagePolling();
    }
    
    // Cleanup on unmount
    return () => {      stopMessagePolling();
    };
  }, [activeChat, isGroup]);

  // Persist activeChat state to localStorage
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('activeChat', activeChat);
      localStorage.setItem('isGroupChat', isGroup);
    } else {
      localStorage.removeItem('activeChat');
      localStorage.removeItem('isGroupChat');
    }
  }, [activeChat, isGroup]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Start real-time message polling
  const startMessagePolling = (chatId) => {
    // Clear any existing interval
    stopMessagePolling();
    
    // Check for messages immediately on start
    checkForNewMessages(chatId);
    
    // Set up new polling interval - check every 1 second for more responsive real-time updates
    // This ensures the read receipt checkmarks appear almost instantly
    pollingInterval.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkForNewMessages(chatId);
      }
    }, 1000);
  };
  
  // Stop polling
  const stopMessagePolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };
  
  // Check for new messages and updated read statuses in real-time
  const checkForNewMessages = async (chatId) => {
    try {
      // Check for new messages
      let newMessagesUrl;
      
      if (isGroup) {
        newMessagesUrl = `/api/group-chats/${chatId}/messages`;
        if (lastMessageId) {
          newMessagesUrl += `?after=${lastMessageId}`;
        }
      } else {
        newMessagesUrl = `/api/messages/${chatId}`;
        if (lastMessageId) {
          newMessagesUrl += `?after=${lastMessageId}`;
        }
      }
      
      const newMessagesResponse = await api.get(newMessagesUrl);
      
      if (newMessagesResponse.data && newMessagesResponse.data.messages && newMessagesResponse.data.messages.length > 0) {
        // Filter out any messages we already have to prevent duplication
        setMessages(prevMessages => {
          // Create a set of existing message IDs for quick lookup
          const existingIds = new Set(prevMessages.map(msg => msg.id));
            // Filter out any messages that already exist in our state
          // Also ensure messages are only for the current chat
          const uniqueNewMessages = newMessagesResponse.data.messages.filter(msg => {
            // Skip messages that already exist in our state
            if (existingIds.has(msg.id)) return false;
            
            // Skip messages that are temporary with current timestamp
            if (msg.id === 'temp-' + Date.now()) return false;
            
            // For direct messages, check that they're for this conversation
            if (!isGroup && 
                (msg.recipient_id === parseInt(chatId, 10) || msg.sender_id === parseInt(chatId, 10))) {
              return true;
            }
            
            // For group messages, check that they're for this group
            if (isGroup && msg.group_id === parseInt(chatId, 10)) {
              return true;
            }
            
            // Add extra check for location messages to ensure they belong to this chat
            if (msg.type === 'location' || msg.message_type === 'location') {
              // If there's an explicit chat_id property that doesn't match, skip it
              if (msg.chat_id && parseInt(msg.chat_id, 10) !== parseInt(chatId, 10)) {
                return false;
              }
            }
            
            return true;
          });
          
          // Only add messages that don't already exist
          if (uniqueNewMessages.length > 0) {
            return [...prevMessages, ...uniqueNewMessages];
          }
          return prevMessages;
        });
        
        // Update last message ID for next poll
        const newLastMessageId = newMessagesResponse.data.messages[newMessagesResponse.data.messages.length - 1].id;
        setLastMessageId(newLastMessageId);
      }      // Only check read statuses for direct messages, not group messages
      if (!isGroup) {
        // Always check for updated read statuses of ALL messages we sent
        // This ensures we detect when the other user opens the chat and reads messages
        const statusUpdateUrl = `/api/messages/${chatId}/read-status`;
        const sentMessageIds = messages
          .filter(msg => msg.sender_id === user?.id) // Include all messages, not just unread ones
          .map(msg => msg.id);
        
        if (sentMessageIds.length > 0) {
          const readStatusResponse = await api.post(statusUpdateUrl, { messageIds: sentMessageIds });
          
          if (readStatusResponse.data && readStatusResponse.data.readMessageIds) {
            const readMessageIds = new Set(readStatusResponse.data.readMessageIds);
            
            if (readMessageIds.size > 0) {
              // Update read status for messages that have been read
              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  readMessageIds.has(msg.id) ? { ...msg, is_read: true } : msg
                )
              );
            }
          }
        }
        
        // Also check for unread messages we received and mark them as read
        // This ensures when we receive messages and are actively in the chat, they get marked as read
        const unreadReceivedMessages = messages
          .filter(msg => !msg.is_read && msg.sender_id === parseInt(chatId))
          .map(msg => msg.id);
        
        if (unreadReceivedMessages.length > 0) {
          markMessagesAsRead(unreadReceivedMessages);
        }
      } 
      
      // For group chats, we can implement read receipts later if needed
    } catch (error) {
      console.error("Error in real-time message updates:", error);
    }
  };
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      setConversationsError('');
      
      // Fetch direct message conversations
      const dmResponse = await api.get('/api/messages/conversations');
      
      // Fetch group conversations
      const groupResponse = await api.get('/api/group-chats');
        // Combine both types of conversations
      const directConversations = dmResponse.data.conversations || [];
      const groupConversations = groupResponse.data.groups || [];
      
      // Mark group chats with is_group flag
      const formattedGroupChats = groupConversations.map(group => ({
        ...group,
        is_group: true
      }));
        // Log the group conversations for debugging
      console.log('Group conversations:', groupConversations);
      console.log('Formatted group chats:', formattedGroupChats);
      
      // Set all conversations
      setConversations([...directConversations, ...formattedGroupChats]);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversationsError('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  };
  
  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      // The backend now automatically marks all messages as read when fetching conversation
      const response = await api.get(`/api/messages/${userId}`);
      
      const messagesList = response.data.messages || [];
        // Remove any duplicate messages by ID and ensure message types are set correctly
      const uniqueMessages = [];
      const messageIds = new Set();
      
      messagesList.forEach(msg => {
        if (!messageIds.has(msg.id)) {
          messageIds.add(msg.id);
          
          // Ensure message has a type property for frontend rendering
          if (msg.message_type === 'image' && !msg.type) {
            msg.type = 'image';
          } else if (msg.message_type === 'location' && !msg.type) {
            msg.type = 'location';
          }
          
          uniqueMessages.push(msg);
        }
      });
      
      setMessages(uniqueMessages);
      setChatUser(response.data.user);
      
      // Update last message id for polling
      if (uniqueMessages.length > 0) {
        setLastMessageId(uniqueMessages[uniqueMessages.length - 1].id);
        
        // Our backend should have already marked incoming messages as read,
        // but we'll double-check here to ensure UI consistency
        const unreadMessages = uniqueMessages.filter(msg => !msg.is_read && msg.sender_id !== user?.id);
        if (unreadMessages.length > 0) {
          markMessagesAsRead(unreadMessages.map(msg => msg.id));
        }
      } else {
        setLastMessageId(null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);    }
  };
  
  // Add debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300); // Wait 300ms after typing stops
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
  
  // Use this effect to filter members based on search term
  useEffect(() => {
    if (allUsers.length > 0) {
      if (memberSearchTerm.trim() === '') {
        setFilteredMembers(allUsers);
      } else {
        const filtered = allUsers.filter(user => 
          user.username.toLowerCase().includes(memberSearchTerm.toLowerCase())
        );
        setFilteredMembers(filtered);
      }
    }
  }, [memberSearchTerm, allUsers]);
  
  // Effect to handle outside clicks to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Use this effect to control when search results are visible
  useEffect(() => {
    if (isSearchFocused && searchResults.length > 0) {
      setIsSearchOpen(true);
    } else if (!isSearchFocused) {
      // Delay closing to allow for user interaction with results
      const timer = setTimeout(() => {
        setIsSearchOpen(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSearchFocused, searchResults]);
  const searchUsers = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) return;
    
    try {
      setSearchLoading(true);
      setSearchError('');
      // Use the correct API endpoint path with the route parameter
      const response = await api.get(`/api/auth/search/${encodeURIComponent(searchTerm)}`);
      
      if (response.data && response.data.users) {
        setSearchResults(response.data.users.filter(u => u.id !== user?.id));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchError('Failed to search users');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  // Fetch all users for group creation
  const fetchAllUsers = async () => {
    try {
      setLoadingAllUsers(true);
      setError(''); // Clear any previous errors
      
      console.log('Fetching all users for group creation');
      const response = await api.get('/api/auth/users');
      
      if (response.data && response.data.users) {
        // Filter out current user from the list
        const usersList = response.data.users.filter(u => u.id !== user?.id);
        console.log(`Loaded ${usersList.length} users for selection`);
        
        // Ensure user IDs are numbers, not strings
        const processedUsers = usersList.map(u => ({
          ...u,
          id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id
        }));
        
        setAllUsers(processedUsers);
        setFilteredMembers(processedUsers);
      } else {
        console.error('Invalid response format from /api/auth/users:', response.data);
        setError('Failed to load users. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching all users:', err);
      setError('Failed to load users. Please check your connection.');
    } finally {
      setLoadingAllUsers(false);
    }
  };
  
  const handleSubmit= async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !activeChat) return;
    
    // Create a temporary message for optimistic UI update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id,
      recipient_id: isGroup ? null : activeChat,
      group_id: isGroup ? activeChat : null,
      content: message,
      created_at: new Date().toISOString(),
      is_read: false,
      isTemp: true
    };
    
    // Clear input field immediately for better UX
    const msgContent = message;
    setMessage('');
    
    // Optimistically add to message list
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    try {
      let response;
      
      if (isGroup) {
        // Send message to group chat
        response = await api.post(`/api/group-chats/${activeChat}/messages`, { content: msgContent });
      } else {
        // Send message to direct chat
        response = await api.post(`/api/messages/${activeChat}`, { content: msgContent });
      }
      
      if (response.data && response.data.message) {
        // Replace temporary message with the real one from server
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.id === tempMessage.id ? response.data.message : msg
        ));
        
        // Update last message ID for polling
        setLastMessageId(response.data.message.id);
        
        // Refresh conversations list to show latest message
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
      // Put the message back in the input
      setMessage(msgContent);
    }
  };
  const handleSelectChat = (chatId, isGroupChat = false) => {
    setActiveChat(chatId);
    setIsGroup(isGroupChat);
  };
  
  const handleSelectUser = async (userId) => {
    try {
      // First make sure we have info about this user by initializing the conversation
      const response = await api.post(`/api/messages/init/${userId}`);
      
      setActiveChat(userId);
      setIsGroup(false);
      setIsSearchOpen(false);
      
      // Fetch or create the conversation
      fetchMessages(userId);
      
      // Refresh conversation list to include this new conversation if it's new
      fetchConversations();
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  };
    // Function to toggle user selection for group chat
  const toggleUserSelection = (userId) => {
    // Always convert userId to a number to ensure consistent comparisons
    const numericUserId = parseInt(userId, 10);
    
    console.log(`Toggling selection for user ID: ${numericUserId}`);
    
    setSelectedUsers(prev => {      // Check if the ID is already selected by comparing numeric values
      const isSelected = prev.some(id => parseInt(id, 10) === numericUserId);
      if (isSelected) {
        console.log(`Removing user ${numericUserId} from selection`);
        return prev.filter(id => parseInt(id, 10) !== numericUserId);
      } else {
        console.log(`Adding user ${numericUserId} to selection`);
        return [...prev, numericUserId];
      }    });
  };
    
  // Function to create a new group chat
  const createGroupChat = async () => {
    console.log("Creating group chat with:", { 
      groupName, 
      selectedUsers,
      currentUser: user
    });
    setError(''); // Clear previous errors
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (selectedUsers.length < 2) {
      setError('At least 2 members are required');
      return;
    }
      try {      // Convert all memberIds to numbers to ensure consistent data type
      const numericMemberIds = selectedUsers.map(id => parseInt(id, 10));
      
      // Ensure current user is in the members list (backend expects this)
      const currentUserId = parseInt(user?.id, 10);
      if (!numericMemberIds.includes(currentUserId)) {      numericMemberIds.push(currentUserId);
      }
      
      // Make sure all memberIds are unique to avoid DB constraint violations
      const uniqueMemberIds = [...new Set(numericMemberIds)];      console.log('Creating group with:', { 
        name: groupName, 
        memberIds: uniqueMemberIds,
        user_id: currentUserId
      });
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', groupName);
      formData.append('description', `Group chat created by ${user?.username}`);
      
      // Add all member IDs to the form data
      uniqueMemberIds.forEach((memberId) => {
        formData.append('memberIds', memberId);
      });
      
      // Add profile picture if selected
      if (groupProfilePicture) {
        formData.append('profilePicture', groupProfilePicture);
      }
      
      const response = await api.post('/api/group-chats', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.group) {
        console.log('Group created successfully:', response.data.group);
        
        // Reset states
        setGroupName('');
        setSelectedUsers([]);
        setIsCreatingGroup(false);
        
        // Open the new group chat
        setActiveChat(response.data.group.id);
        setIsGroup(true);
        
        // Fetch group chat messages
        fetchGroupMessages(response.data.group.id);
        
        // Refresh conversation list
        fetchConversations();
      } else {
        console.error('Invalid response format:', response.data);
        setError('Unexpected response from server. Please try again.');
      }    } catch (err) {
      console.error('Error creating group chat:', err);
        // More detailed error message based on the error response
      let errorMessage = 'Failed to create group chat. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with an error status code
        console.error('Error response data:', err.response.data);
        
        // Extract specific error message from the response
        errorMessage = err.response.data?.message || errorMessage;
        
        // Add guidance based on error status
        if (err.response.status === 400) {
          errorMessage += ' Please check that all selected users exist and you have selected at least 2 valid members.';
        } else if (err.response.status === 409) {
          errorMessage += ' There was a conflict with duplicate users.';
        } else if (err.response.status === 403) {
          errorMessage += ' You don\'t have permission to perform this action.';
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        errorMessage = 'No response from server. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    }
  };
    // Function to fetch group chat messages
  const fetchGroupMessages = async (groupId) => {
    try {
      setLoading(true);
      setError('');
      
      // First, get the group details
      const groupResponse = await api.get(`/api/group-chats/${groupId}`);
      
      // Then get the messages
      const messagesResponse = await api.get(`/api/group-chats/${groupId}/messages`);
        if (messagesResponse.data && groupResponse.data) {
        // Process messages to ensure types are set correctly
        const processedMessages = (messagesResponse.data.messages || []).map(msg => {
          // Ensure message has a type property for frontend rendering
          if (msg.message_type === 'image' && !msg.type) {
            return { ...msg, type: 'image' };
          } else if (msg.message_type === 'location' && !msg.type) {
            return { ...msg, type: 'location' };
          }
          return msg;
        });
        
        setMessages(processedMessages);
        setChatUser({
          id: groupResponse.data.group.id,
          username: groupResponse.data.group.name,
          profile_picture: groupResponse.data.group.profile_picture,
          description: groupResponse.data.group.description,
          creator_id: groupResponse.data.group.creator_id,
          isGroup: true,
          members: groupResponse.data.members || []
        });
        
        // Update last message id for polling
        if (messagesResponse.data.messages && messagesResponse.data.messages.length > 0) {
          setLastMessageId(messagesResponse.data.messages[messagesResponse.data.messages.length - 1].id);
        } else {
          setLastMessageId(null);
        }
      }
    } catch (err) {
      console.error('Error fetching group messages:', err);
      setError('Failed to load group messages');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to mark messages as read
  const markMessagesAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      // For each message ID, make a request to mark it as read
      const promises = messageIds.map(messageId => 
        api.put(`/api/messages/read/${messageId}`)
      );
      
      await Promise.all(promises);
      
      // Update the messages in state to show as read
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Function to update group details
  const updateGroupDetails = async () => {
    if (!chatUser || !isGroup) return;
    
    // Validate that there's something to update
    if (!editGroupName.trim() && !editGroupProfilePicture) {
      setError('Please provide a name or profile picture to update');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
        // Create FormData for file upload
      const formData = new FormData();
      
      if (editGroupName.trim()) {
        formData.append('name', editGroupName.trim());
      }
      
      if (editGroupProfilePicture) {
        formData.append('profilePicture', editGroupProfilePicture);
      }
      
      // Make the API call to update the group
      const response = await api.put(`/api/group-chats/${chatUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.group) {
        console.log('Group updated successfully:', response.data.group);
        
        // Update the local state
        setChatUser(prevUser => ({
          ...prevUser,
          username: response.data.group.name,
          profile_picture: response.data.group.profile_picture,
          description: response.data.group.description
        }));
        
        // Reset the form and close the editing interface
        setEditGroupName('');
        setEditGroupProfilePicture('');
        setIsEditingGroup(false);
        
        // Refresh conversations list to show the updated group
        fetchConversations();
      }
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Function to handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        setError('Only image files are allowed');
        return;
      }
      
      // 5MB max size
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Hide attachment options after selection
      setShowAttachmentOptions(false);
    }
  };
  
  // Function to cancel selected image
  const cancelImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
    // Function to send location
  const handleSendLocation = async () => {
    if (!activeChat) return;
    
    try {
      setIsLoadingLocation(true);
      setLocationError('');
      
      // Get current position using Geolocation API
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 My Location: https://maps.google.com/maps?q=${latitude},${longitude}`;
          
          // Create unique timestamp to help prevent duplicate messages
          const timestamp = Date.now();
          
          // Create and send message with location link
          const tempMessage = {
            id: `temp-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
            sender_id: user?.id,
            recipient_id: isGroup ? null : activeChat,
            group_id: isGroup ? activeChat : null,
            content: locationMessage,
            created_at: new Date().toISOString(),
            is_read: false,
            isTemp: true,
            type: 'location',
            chat_id: activeChat // Explicitly tie the message to the current chat
          };
          
          // Add location message ONLY to the current conversation's messages
          setMessages(prevMessages => [...prevMessages, tempMessage]);
          
          // Send the message to the server
          let response;
          if (isGroup) {
            response = await api.post(`/api/group-chats/${activeChat}/messages`, { 
              content: locationMessage,
              type: 'location',
              timestamp: timestamp // Add timestamp to help prevent duplicate processing
            });
          } else {
            response = await api.post(`/api/messages/${activeChat}`, { 
              content: locationMessage,
              type: 'location',
              timestamp: timestamp // Add timestamp to help prevent duplicate processing
            });
          }
          
          if (response.data && response.data.message) {
            // Ensure message has chat_id property to tie it to the current chat
            const actualMessage = {
              ...response.data.message,
              chat_id: activeChat,
              type: 'location' // Ensure the type is explicitly set
            };
            
            // Replace temp message with actual message from server
            setMessages(prevMessages => prevMessages.map(msg => 
              msg.id === tempMessage.id ? actualMessage : msg
            ));
            
            // Update last message ID for polling
            setLastMessageId(actualMessage.id);
            
            // Refresh conversations list to show latest message
            fetchConversations();
          }
          
          // Hide attachment options after sending
          setShowAttachmentOptions(false);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Could not access your location. Please check your browser permissions.');
          setIsLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } catch (err) {
      console.error('Error sending location:', err);
      setLocationError('Failed to send location. Please try again.');
      setIsLoadingLocation(false);
    }
  };
  
  // Function to send image
  const handleSendImage = async () => {
    if (!selectedImage || !activeChat) return;

    try {
      setLoading(true);
      setError('');      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('chat_id', activeChat.toString());
      formData.append('timestamp', timestamp.toString());// Create unique timestamp to help prevent duplicate messages
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      
      // Create temp message for optimistic UI update
      const tempMessage = {
        id: `temp-${timestamp}-${randomStr}`,
        sender_id: user?.id,
        recipient_id: isGroup ? null : activeChat,
        group_id: isGroup ? activeChat : null,
        content: 'Sending image...',
        created_at: new Date().toISOString(),
        is_read: false,
        isTemp: true,
        type: 'image',
        image_preview: imagePreview, // Add preview for optimistic UI
        chat_id: activeChat // Explicitly tie the message to the current chat
      };

      // Add message to the UI immediately
      setMessages(prevMessages => [...prevMessages, tempMessage]);      // Send the image
      let response;
      if (isGroup) {
        console.log('Sending image to group chat:', activeChat);
        response = await api.post(`/api/group-chats/${activeChat}/messages/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Group chat image response:', response.data);
      } else {
        console.log('Sending image to direct message:', activeChat);
        response = await api.post(`/api/messages/${activeChat}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Direct message image response:', response.data);
      }if (response.data && response.data.message) {
        console.log('Image message response:', response.data.message);
        
        // Make sure we have the right type and image_url for display
        const actualMessage = {
          ...response.data.message,
          type: 'image'  // Ensure the message has the correct type for rendering
        };
        
        // Replace temp message with actual message
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.id === tempMessage.id ? actualMessage : msg
        ));

        // Update last message ID for polling
        setLastMessageId(response.data.message.id);

        // Refresh conversations list to show latest message
        fetchConversations();
      }

      // Reset image states
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error sending image:', err);
      setError('Failed to send image. Please try again.');
      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setLoading(false);
    }
  };

  // Don't return null anymore, just hide the panel when closed
  // This allows the active chat to persist

  return (
    <div className={`fixed left-0 top-[64px] bottom-0 w-64 bg-white border-r-2 border-black shadow-lg z-30 flex flex-col font-mono transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Panel Header */}
      <div className="p-3 border-b-2 border-black flex items-center justify-between bg-white sticky top-0">
        <h2 className="font-bold text-lg">MESSAGES</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded"
          aria-label="Close chat panel"
        >
          <FaTimes />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeChat ? (
          <>            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex items-center bg-white">
              <button 
                onClick={() => setActiveChat(null)}
                className="mr-2 p-1 hover:bg-gray-100 rounded"
                aria-label="Back to conversations"
              >
                <FaChevronRight className="transform rotate-180" />
              </button>
              {chatUser && (
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-8 h-8 border-2 border-black rounded-full overflow-hidden mr-2">
                      {chatUser.profile_picture ? (
                        <img
                          src={chatUser.profile_picture}
                          alt={chatUser.username || chatUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500" size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">                        <span className="font-bold truncate">{chatUser.username || chatUser.name}</span>
                        {isGroup && (
                          <>
                            <span className="ml-1 text-xs bg-gray-200 px-1 rounded">Group</span>
                            {chatUser.creator_id === parseInt(user?.id, 10) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsEditingGroup(true);
                                  setEditGroupName(chatUser.username);
                                  setEditGroupProfilePicture(chatUser.profile_picture || '');
                                }}
                                className="ml-1 text-xs bg-gray-100 hover:bg-gray-200 px-1 rounded"
                              >
                                Edit
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      {isGroup && chatUser.members && (
                        <p className="text-xs text-gray-500 truncate">
                          {chatUser.members.length} members
                        </p>
                      )}
                    </div>
                  </div>
                    {/* Group editing interface */}
                  {isGroup && isEditingGroup && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <div className="text-xs font-bold mb-1">Edit Group</div>
                      <input 
                        type="text"
                        placeholder="Group Name"
                        value={editGroupName}
                        onChange={(e) => setEditGroupName(e.target.value)}
                        className="w-full p-1 mb-1 border border-gray-300 text-xs"
                      />                      <label className="block text-xs mb-1">
                        Profile Picture
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditGroupProfilePicture(e.target.files[0])}
                          className="w-full p-1 mb-1 border border-gray-300 text-xs"
                        />
                      </label>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setIsEditingGroup(false);
                            setEditGroupName('');
                            setEditGroupProfilePicture('');
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-xs p-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateGroupDetails}
                          className="flex-1 bg-black text-white hover:bg-gray-800 text-xs p-1"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isGroup && chatUser.members && !isEditingGroup && (
                    <div className="mt-2 text-xs flex flex-wrap gap-1 max-h-10 overflow-y-auto">
                      {chatUser.members.map(member => (
                        <span key={member.id} className="bg-gray-100 px-1 py-0.5 rounded">
                          {member.username}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center">{error}</div>              ) : messages.length === 0 ? (
                <div className="flex justify-center">
                  <p className="text-sm text-gray-500">This is the beginning of your conversation</p>
                </div>
              ) : (                <>                  {messages.map(msg => (
                    <div
                      key={msg.id ? msg.id : `temp-${Date.now()}-${Math.random()}`}
                      className={`max-w-[90%] p-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-black text-white ml-auto'
                          : 'bg-gray-200'
                      }`}
                    >                      {isGroup && msg.sender_id !== user?.id && (
                        <p className="text-xs font-bold mb-1">
                          {msg.username || msg.sender_username || 'Unknown User'}
                        </p>
                      )}                      {/* Handle different message types */}
                      {(msg.type === 'image' || msg.message_type === 'image') ? (
                        // Image message
                        <div className="mb-1">                          {msg.image_url ? (
                            <>
                              <img 
                                src={msg.image_url} 
                                alt="Shared image" 
                                className="max-w-full rounded cursor-pointer"
                                onClick={() => window.open(msg.image_url, '_blank')} 
                                onLoad={() => console.log('Image loaded successfully:', msg.image_url)}
                                onError={(e) => {
                                  console.error('Error loading image:', msg.image_url);
                                  e.target.onerror = null; 
                                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                                }}
                              />
                              <p className="text-xs mt-1 opacity-75">
                                {msg.content !== 'Sent an image' ? msg.content : ''}
                              </p>
                            </>
                          ) : msg.image_preview ? (
                            <div className="relative">
                              <img 
                                src={msg.image_preview} 
                                alt="Uploading image" 
                                className="max-w-full rounded opacity-70"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm italic">Sending image...</p>
                          )}
                        </div>                        ) : (msg.type === 'location' || msg.message_type === 'location') ? (
                        // Location message
                        <div className="mb-1">
                          {msg.content.includes('maps.google.com') ? (
                            <div className="space-y-2">
                              {/* Extract coordinates from URL and display map */}
                              {(() => {
                                // Extract coordinates from the URL
                                const urlMatch = msg.content.match(/maps\?q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                                if (urlMatch && urlMatch[1] && urlMatch[2]) {
                                  const lat = urlMatch[1];
                                  const lng = urlMatch[2];
                                  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=14`;
                                  
                                  return (
                                    <>
                                      <div className="h-40 w-full overflow-hidden rounded border border-gray-300">
                                        <iframe 
                                          title="Location Map"
                                          width="100%" 
                                          height="100%" 
                                          frameBorder="0" 
                                          src={mapUrl} 
                                          allowFullScreen
                                          loading="lazy"
                                        ></iframe>
                                      </div>
                                      <a 
                                        href={`https://maps.google.com/maps?q=${lat},${lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center text-xs underline"
                                      >
                                        <FaMapMarkerAlt className="mr-1" /> Open in Google Maps
                                      </a>
                                    </>
                                  );
                                }
                                return <p className="text-sm">{msg.content}</p>;
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      ) : (
                        // Regular text message
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sending...'}
                        </span>
                        {msg.sender_id === user?.id && !isGroup && (
                          <span className="ml-1 text-xs">
                            {msg.is_read ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : null}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}            <div className="p-2 border-t border-gray-200 bg-white">
              {/* Show attachment preview if an image is selected */}
              {selectedImage && (
                <div className="mb-2 relative">
                  <img 
                    src={imagePreview} 
                    alt="Selected attachment" 
                    className="max-h-32 rounded border border-gray-300" 
                  />
                  <button
                    onClick={cancelImageSelection}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    title="Remove attachment"
                  >
                    <FaTimes size={10} />
                  </button>
                  <button
                    onClick={handleSendImage}
                    className="mt-1 bg-black text-white px-2 py-1 text-xs rounded"
                  >
                    Send Image
                  </button>
                </div>
              )}
              
              {/* Show loader when getting location */}
              {isLoadingLocation && (
                <div className="flex items-center mb-2 text-xs">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Getting your location...
                </div>
              )}
              
              {/* Show location error if any */}
              {locationError && (
                <p className="text-xs text-red-500 mb-1">{locationError}</p>
              )}
              
              {/* Regular message form */}
              <form className="flex" onSubmit={handleSubmit}>
                {/* Attachment button */}
                <div className="relative mr-2">
                  <button 
                    type="button"
                    onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                    className="h-full px-2 border-2 border-black hover:bg-black hover:text-white"
                  >
                    <FaPaperclip />
                  </button>
                  
                  {/* Attachment dropdown */}
                  {showAttachmentOptions && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white border-2 border-black shadow-md rounded">
                      <ul>
                        <li>
                          <label className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <FaImage className="mr-2" />
                            <span>Image</span>
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={handleSendLocation}
                            className="flex items-center p-2 w-full text-left hover:bg-gray-100"
                          >
                            <FaMapMarkerAlt className="mr-2" />
                            <span>Location</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <input 
                  type="text" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border-2 border-black text-sm bg-white"
                />
                <button 
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="ml-2 px-3 py-2 bg-white border-2 border-black hover:bg-black hover:text-white text-sm disabled:opacity-50"
                >
                  SEND
                </button>
              </form>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          </>
        ) : (
          <>
            {/* Conversation List Header with Search */}
            <div className="p-2 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="relative flex-1">                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search users..."
                    className="w-full p-2 pr-8 border-2 border-black text-sm bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <button
                    onClick={searchUsers}
                    disabled={searchLoading || !searchTerm.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {searchLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaSearch className="text-gray-500" />
                    )}
                  </button>
                </div>                <button
                  className="ml-2 p-2 border-2 border-black hover:bg-black hover:text-white"
                  onClick={() => {
                    setIsCreatingGroup(true);
                    fetchAllUsers();
                  }}
                >
                  <FaPlus />
                </button>
              </div>
              
              {searchError && (
                <p className="text-xs text-red-500 mt-1">{searchError}</p>
              )}

              {/* Search Results */}
              {isSearchOpen && searchResults && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-60 bg-white border-2 border-black shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map(searchUser => (
                    <div
                      key={searchUser.id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                      onClick={() => handleSelectUser(searchUser.id)}
                    >
                      <div className="w-8 h-8 border-2 border-black rounded-full overflow-hidden mr-2">
                        {searchUser.profile_picture ? (
                          <img src={searchUser.profile_picture} alt={searchUser.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUser size={12} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <span className="truncate">{searchUser.username}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {isSearchOpen && searchResults && searchResults.length === 0 && !searchLoading && searchTerm && (
                <div className="absolute z-50 mt-1 w-60 bg-white border-2 border-black shadow-lg p-4 text-center">
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              )}
            </div>            {/* Group Creation Interface */}
            {isCreatingGroup ? (
              <div className="flex-1 flex flex-col p-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Create Group</h3>
                  <button 
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setSelectedUsers([]);
                      setGroupName('');
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Group Name" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)}
                  className="p-2 mb-2 border-2 border-black"
                />                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Profile Picture (optional)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setGroupProfilePicture(e.target.files[0])}
                    className="p-2 w-full border-2 border-black"
                  />
                </div>
                
                <div className="mb-3">
                  <h4 className="font-bold mb-2">Selected Members ({selectedUsers.length})</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedUsers.length > 0 ? (
                      selectedUsers.map(userId => {
                        const user = allUsers.find(u => u.id === userId);
                        return user ? (
                          <div 
                            key={userId} 
                            className="bg-black text-white px-2 py-1 rounded-full text-xs flex items-center"
                          >
                            {user.profile_picture && (
                              <div className="w-4 h-4 rounded-full overflow-hidden mr-1 flex-shrink-0">
                                <img 
                                  src={user.profile_picture} 
                                  alt={user.username}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            )}
                            <span className="truncate max-w-[80px]">{user.username}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUserSelection(userId);
                              }}
                              className="ml-1"
                            >
                              <FaTimes size={10} />
                            </button>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-500">Select at least 2 members</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">Select Members</h4>
                    <span className="text-xs text-gray-500">{filteredMembers.length} users</span>
                  </div>
                  
                  {/* Search bar for members */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="w-full p-2 pr-8 border-2 border-black text-sm bg-white"
                    />
                    {memberSearchTerm && (
                      <button
                        onClick={() => setMemberSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <FaTimes className="text-gray-500" size={12} />
                      </button>
                    )}
                  </div>
                  
                  {loadingAllUsers ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {allUsers.length === 0 ? "No users found" : "No matching users found"}
                    </p>
                  ) : (                    <div className="space-y-2">
                      {filteredMembers.map(user => (
                        <div
                          key={user.id}                          className={`flex items-center p-2 border-2 rounded cursor-pointer ${
                            selectedUsers.some(id => parseInt(id, 10) === parseInt(user.id, 10))
                              ? 'border-black bg-gray-100' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          onClick={() => toggleUserSelection(user.id)}
                        >
                          <div className="w-8 h-8 border-2 border-black rounded-full overflow-hidden mr-2 flex-shrink-0">
                            {user.profile_picture ? (
                              <img 
                                src={user.profile_picture} 
                                alt={user.username} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <FaUser className="text-gray-500" size={12} />
                              </div>
                            )}
                          </div>
                          <span className="truncate flex-1">{user.username}</span>
                          {selectedUsers.some(id => parseInt(id, 10) === parseInt(user.id, 10)) && (
                            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center ml-2">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>                  <button
                  onClick={() => {
                    console.log("Button clicked with:", {
                      groupName,
                      groupNameEmpty: !groupName.trim(),
                      selectedUsers,
                      selectedUsersLength: selectedUsers.length,
                      isBelowMinimum: selectedUsers.length < 2,
                      currentUser: user
                    });
                    createGroupChat();
                  }}
                  className={`mt-4 p-2 ${(!groupName.trim() || selectedUsers.length < 2) ? 'bg-gray-400' : 'bg-black'} text-white w-full`}
                  disabled={!groupName.trim() || selectedUsers.length < 2}
                >
                  CREATE GROUP ({selectedUsers.length}/2 selected)
                </button>
                
                <div className="mt-2 p-2 bg-gray-100 text-xs">
                  <p className="font-bold">Debug Info:</p>
                  <p>Group Name: {groupName || 'Not set'}</p>
                  <p>Selected Users: {selectedUsers.length}</p>
                  <p>Your User ID: {user?.id}</p>
                  <p className="mt-1">Selected User IDs: {selectedUsers.join(', ')}</p>
                </div>
                
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
            ) : (
              /* Conversations List */
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : conversationsError ? (
                  <div className="p-4 text-red-600 text-sm">{conversationsError}</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <FaComment className="mx-auto mb-2 text-2xl" />
                    <p>No conversations yet</p>
                    <p className="mt-1">Search for someone to start chatting!</p>
                  </div>
                ) : (
                  <>
                    {conversations.map(conversation => (
                      <div
                        key={conversation.id || conversation.other_user_id}
                        className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectChat(
                          conversation.is_group ? conversation.id : conversation.other_user_id, 
                          conversation.is_group
                        )}
                      >
                        <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden mr-3 flex-shrink-0">
                          {conversation.profile_picture ? (
                            <img
                              src={conversation.profile_picture}
                              alt={conversation.username || conversation.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center">
                            <p className="font-bold truncate">
                              {conversation.username || conversation.name}
                            </p>
                            {conversation.is_group && (
                              <span className="ml-1 text-xs bg-gray-200 px-1 rounded">Group</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;