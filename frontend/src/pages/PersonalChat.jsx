import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatSidebar from '../components/chatSideBar';
import api from '../api/axiosConfig';
import { FaUser } from 'react-icons/fa';

const PersonalChat = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatUser, setChatUser] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Fetch chat messages when userId changes
  useEffect(() => {
    if (userId) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/messages/${userId}`);
          setMessages(response.data.messages || []);
          setChatUser(response.data.user);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !userId) return;
    
    try {
      // Show optimistic UI update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message,
        sender_id: null, // Will be filled by our check below
        recipient_id: parseInt(userId),
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setMessage('');
      
      // Send to server
      const response = await api.post(`/api/messages/${userId}`, { content: message });
      
      // Replace temp message with actual message from server
      if (response.data && response.data.message) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? response.data.message : msg
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-64px)] font-mono">
      <ChatSidebar />
      
      {userId ? (
        <div className="flex-1 flex flex-col h-full border-2 border-l-0 border-black">
          {/* Conversation header */}
          <div className="p-4 border-b-2 border-black flex items-center">
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
                <h2 className="text-xl font-bold">{chatUser.username || 'CHAT'}</h2>
              </>
            )}
            {!chatUser && <h2 className="text-xl font-bold">CHAT</h2>}
          </div>
          
          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
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
              <div className="space-y-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_id === parseInt(userId)
                        ? 'bg-gray-200 mr-auto' // they sent it
                        : 'bg-black text-white ml-auto' // you sent it
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs block mt-1 opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="p-4 border-t-2 border-black">
            <form className="flex" onSubmit={handleSubmit}>
              <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border-2 border-black"
              />
              <button 
                type="submit"
                disabled={!message.trim()}
                className={`ml-2 px-4 py-2 ${!message.trim() ? 'bg-gray-200' : 'bg-white hover:bg-black hover:text-white'} border-2 border-black transition-colors`}
              >
                SEND
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-l-0 border-black">
          <div className="text-center">
            <p className="text-xl">Select a conversation</p>
            <p className="text-sm text-gray-500 mt-2">Or start a new one</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalChat;