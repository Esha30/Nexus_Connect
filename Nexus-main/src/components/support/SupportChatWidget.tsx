import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import api from '../../api/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your AI Support Agent for Nexus. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/support/chat', { message: userMessage.text });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.response || 'I am sorry, but I received an empty response.',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Support Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 z-50 flex items-center justify-center border-2 border-white dark:border-gray-800"
        aria-label="Toggle Support Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">Nexus Support</h3>
                <p className="text-primary-100 text-xs">AI Assistant directly powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-100 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`flex-shrink-0 mt-auto mb-1 ${msg.sender === 'user' ? 'ml-2' : 'mr-2'}`}>
                    {msg.sender === 'user' ? (
                      <div className="bg-gray-200 dark:bg-gray-700 p-1.5 rounded-full">
                        <User size={14} className="text-gray-600 dark:text-gray-300" />
                      </div>
                    ) : (
                      <div className="bg-primary-100 dark:bg-primary-900/40 p-1.5 rounded-full border border-primary-200 dark:border-primary-800">
                        <Bot size={14} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-primary-200' : 'text-gray-400 dark:text-gray-500'}`}>
                       {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row max-w-[85%]">
                  <div className="flex-shrink-0 mt-auto mb-1 mr-2">
                    <div className="bg-primary-100 dark:bg-primary-900/40 p-1.5 rounded-full border border-primary-200 dark:border-primary-800">
                      <Bot size={14} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none flex space-x-1 shadow-sm items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={handleSend} className="flex relative items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 py-3 px-4 pr-12 bg-gray-100 dark:bg-gray-900 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 rounded-full text-sm transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full disabled:opacity-50 transition-colors"
                aria-label="Send Message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
