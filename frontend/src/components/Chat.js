import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Chat = ({ onNewMessage, initialMessages = [], standalone = false }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (standalone) {
      const fetchMessages = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/chat', {
            headers: { 
              'Authorization': `Bearer ${user?.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }

          const data = await response.json();
          if (data.length > 0) {
            setMessages(data);
          } else {
            setMessages([{ 
              role: 'assistant', 
              content: '👋 Hi! How can I help you today?' 
            }]);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError(error.message);
          if (error.response?.status === 401) {
            navigate('/login');
          }
        }
      };

      if (user?.token) {
        fetchMessages();
      }
    }
  }, [standalone, navigate, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

      if (onNewMessage) {
        onNewMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <Navbar />
      
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg backdrop-filter border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">{getGreeting()}, {user?.name || 'Guest'}!</h2>
                <p className="text-blue-100 text-sm">How can I assist you today?</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 shadow-sm text-center text-sm animate-fade-in">
                {error}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div 
                  className={`max-w-[70%] p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <ReactMarkdown 
                    className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}
                    components={{
                      p: ({children}) => <p className="m-0 leading-relaxed">{children}</p>,
                      a: ({children, href}) => (
                        <a 
                          href={href} 
                          className={`underline ${msg.role === 'user' ? 'text-blue-100' : 'text-blue-600'} hover:opacity-80`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      code: ({children}) => (
                        <code className="bg-gray-800 text-gray-100 px-1 py-0.5 rounded text-xs">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 placeholder-gray-400"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chat;
