import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig'; // Your pre-configured axios instance
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const ConsultantPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initial welcome message from the consultant
    setMessages([
      {
        role: 'assistant',
        content: "Welcome. I'm here to listen. How are you feeling today?",
      },
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newUserMessage = { role: 'user', content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    // Prepare history for the API call (last N messages, for example)
    // Groq API expects history in {role: 'user'/'assistant', content: '...'} format
    const historyForAPI = messages.slice(-10); // Send last 10 messages as history

    try {
      const response = await api.post('/api/consultant/chat', {
        message: newUserMessage.content,
        history: historyForAPI,
      });

      if (response.data && response.data.success && response.data.payload.reply) {
        const assistantResponse = { role: 'assistant', content: response.data.payload.reply };
        setMessages((prevMessages) => [...prevMessages, assistantResponse]);
      } else {
        setError(response.data.message || 'Failed to get a response from the consultant.');
        setMessages((prevMessages) => [...prevMessages, {role: 'assistant', content: "I'm having a little trouble connecting right now. Please try again in a moment."}]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, {role: 'assistant', content: "It seems there was an issue reaching me. Let's try that again later."}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-black flex flex-col items-center p-4 pt-20 sm:pt-24 min-h-screen"> {/* Applied bg-white, text-black, and min-h-screen */}
      <div className="w-full max-w-3xl flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden bg-white border-2 border-black shadow-omori-default rounded-none"> {/* Replaced omori-card */}
        <header className="bg-white p-4 border-b-2 border-black"> {/* Replaced var() */}
          <h1 className="text-2xl text-black text-center font-heading uppercase">Mental Health Consultant</h1> {/* Replaced var(), added font-heading */}
          <p className="text-sm text-black text-center">An Omori Themed Listener</p> {/* Replaced var() */}
        </header>

        <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-white"> {/* Replaced var() */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 shadow-omori-default rounded-none ${
                  msg.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border-2 border-black' // Added border for assistant messages
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-center py-2">
              <FaSpinner className="animate-spin text-black text-2xl" /> {/* Changed color to black */}
            </div>
          )}
           {error && (
            <div className="flex justify-center py-2">
              <p className="text-red-600 text-sm">{error}</p> {/* Changed color to Tailwind red */}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="bg-white p-3 sm:p-4 border-t-2 border-black flex items-center"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here... how are you feeling?"
            className="flex-grow p-3 placeholder-gray-400 bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 disabled:opacity-50 bg-white text-black border-2 border-black shadow-omori-default hover:bg-black hover:text-white rounded-none active:translate-x-px active:translate-y-px active:shadow-none ml-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin text-xl" />
            ) : (
              <FaPaperPlane className="text-xl" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsultantPage;
