import React, { useState, useEffect, useRef } from 'react';
import { FaChevronRight, FaUser, FaComment, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import api from '../api/axiosConfig';

const ChatPanel = ({ isOpen, onClose, user }) => {
  // States for panel management
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastMessageId, setLastMessageId] = useState(null);
  const pollingInterval = useRef(null);

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
      fetchMessages(activeChat);
      
      // Start polling for new messages
      startMessagePolling(activeChat);
    } else {
      setMessages([]);
      setChatUser(null);
      stopMessagePolling();
    }
    
    // Cleanup on unmount
    return () => {
      stopMessagePolling();
    };
  }, [activeChat]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
    // Start real-time message polling
  const startMessagePolling = (userId) => {
    // Clear any existing interval
    stopMessagePolling();
    
    // Check for messages immediately on start
    checkForNewMessages(userId);
    
    // Set up new polling interval - check every 2 seconds for faster real-time updates
    pollingInterval.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkForNewMessages(userId);
      }
    }, 2000);
  };
  
  // Stop polling
  const stopMessagePolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };
    // Check for new messages since last check
  const checkForNewMessages = async (userId) => {
    try {
      let url = `/api/messages/${userId}`;
      if (lastMessageId) {
        url += `?after=${lastMessageId}`;
      }
      
      const response = await api.get(url);
      
      if (response.data && response.data.messages && response.data.messages.length > 0) {
        // Filter out any messages we already have to prevent duplication
        setMessages(prevMessages => {
          // Create a set of existing message IDs for quick lookup
          const existingIds = new Set(prevMessages.map(msg => msg.id));
          
          // Filter out any messages that already exist in our state
          const uniqueNewMessages = response.data.messages.filter(
            msg => !existingIds.has(msg.id) && msg.id !== 'temp-' + Date.now()
          );
          
          // Only add messages that don't already exist
          if (uniqueNewMessages.length > 0) {
            return [...prevMessages, ...uniqueNewMessages];
          }
          return prevMessages;
        });
        
        // Update last message ID for next poll
        const newLastMessageId = response.data.messages[response.data.messages.length - 1].id;
        setLastMessageId(newLastMessageId);
        
        // If this is a new message from the other user, mark it as read
        const newMessages = response.data.messages.filter(msg => !msg.is_read && msg.sender_id !== user?.id);
        if (newMessages.length > 0) {
          markMessagesAsRead(newMessages.map(msg => msg.id));
        }
      }
    } catch (error) {
      console.error("Error polling for new messages:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      setConversationsError('');
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversationsError('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  };  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/messages/${userId}`);
      
      const messagesList = response.data.messages || [];
      
      // Remove any duplicate messages by ID
      const uniqueMessages = [];
      const messageIds = new Set();
      
      messagesList.forEach(msg => {
        if (!messageIds.has(msg.id)) {
          messageIds.add(msg.id);
          uniqueMessages.push(msg);
        }
      });
      
      setMessages(uniqueMessages);
      setChatUser(response.data.user);
      
      // Update last message id for polling
      if (uniqueMessages.length > 0) {
        setLastMessageId(uniqueMessages[uniqueMessages.length - 1].id);
        
        // Mark messages as read
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
      setLoading(false);
    }
  };// Add debounced search effect
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
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !activeChat) return;
    
    // Create a temporary message for optimistic UI update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id,
      recipient_id: activeChat,
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
      const response = await api.post(`/api/messages/${activeChat}`, { content: msgContent });
      
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

  const handleSelectChat = (userId) => {
    setActiveChat(userId);
  };
  const handleSelectUser = async (userId) => {
    try {
      // First make sure we have info about this user by initializing the conversation
      const response = await api.post(`/api/messages/init/${userId}`);
      
      setActiveChat(userId);
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

  // Return if panel is closed
  if (!isOpen) return null;

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
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-200 flex items-center bg-white">
              <button 
                onClick={() => setActiveChat(null)}
                className="mr-2 p-1 hover:bg-gray-100 rounded"
                aria-label="Back to conversations"
              >
                <FaChevronRight className="transform rotate-180" />
              </button>
              {chatUser && (
                <>
                  <div className="w-8 h-8 border-2 border-black rounded-full overflow-hidden mr-2">
                    {chatUser.profile_picture ? (
                      <img
                        src={chatUser.profile_picture}
                        alt={chatUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="text-gray-500" size={12} />
                      </div>
                    )}
                  </div>
                  <span className="font-bold truncate">{chatUser.username}</span>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center">{error}</div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center">
                  <p className="text-sm text-gray-500">This is the beginning of your conversation</p>
                </div>
              ) : (
                <>                  {messages.map(msg => (
                    <div
                      key={msg.id || `temp-${Date.now()}-${Math.random()}`}
                      className={`max-w-[90%] p-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-black text-white ml-auto'
                          : 'bg-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sending...'}
                        </span>
                        {msg.sender_id === user?.id && (
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

            {/* Message Input */}
            <div className="p-2 border-t border-gray-200 bg-white">
              <form className="flex" onSubmit={handleSubmit}>
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
                </div>
                <button
                  className="ml-2 p-2 border-2 border-black hover:bg-black hover:text-white"
                  onClick={searchUsers}
                  disabled={searchLoading || !searchTerm.trim()}
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
            </div>

            {/* Conversations List */}
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
                      key={conversation.other_user_id}
                      className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectChat(conversation.other_user_id)}
                    >
                      <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden mr-3 flex-shrink-0">
                        {conversation.profile_picture ? (
                          <img
                            src={conversation.profile_picture}
                            alt={conversation.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate">{conversation.username}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;