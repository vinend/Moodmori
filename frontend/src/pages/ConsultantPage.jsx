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
    <div className="white-space flex flex-col items-center p-4 pt-20 sm:pt-24"> {/* Added padding-top for navbar */}
      <div className="omori-card w-full max-w-3xl flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden">
        <header className="bg-[var(--white-space)] p-4 border-b-2 border-[var(--black-space)]">
          <h1 className="text-2xl text-[var(--black-space)] text-center">Mental Health Consultant</h1>
          <p className="text-sm text-center text-[var(--black-space)]">An Omori Themed Listener</p>
        </header>

        <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--black-space)] scrollbar-track-[var(--white-space)]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 shadow omori-card ${
                  msg.role === 'user'
                    ? 'bg-[var(--black-space)] text-[var(--white-space)]'
                    : 'bg-[var(--white-space)] text-[var(--black-space)]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-center py-2">
              <FaSpinner className="animate-spin text-[var(--highlight-color)] text-2xl" />
            </div>
          )}
           {error && (
            <div className="flex justify-center py-2">
              <p className="text-[var(--highlight-color)] text-sm">{error}</p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="bg-[var(--white-space)] p-3 sm:p-4 border-t-2 border-[var(--black-space)] flex items-center"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here... how are you feeling?"
            className="flex-grow p-3 omori-input focus:ring-0 focus:outline-none placeholder-[var(--neutral-gray)] bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="omori-btn p-3 disabled:opacity-50"
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
