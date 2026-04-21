import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Sparkles, Minus, Maximize2 } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings. I am the Nexus Protocol Assistant. How can I facilitate your venture experience today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle outside click or specific events to open
  useEffect(() => {
    const handleOpenSupport = () => setIsOpen(true);
    window.addEventListener('open-support', handleOpenSupport);
    return () => window.removeEventListener('open-support', handleOpenSupport);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await api.post('/support/chat', { message: userMessage });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.response, 
        timestamp: new Date() 
      }]);
    } catch (err) {
      toast.error('Terminal connection unstable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 flex items-center justify-center hover:scale-110 transition-all z-50 group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Live Support Terminal
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50 transition-all ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="bg-gray-900 p-4 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center text-primary-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Nexus Assistant</h3>
            <p className="text-[10px] text-gray-400 font-medium">Protocol Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-gray-400 hover:text-white transition">
            {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm font-medium ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none shadow-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-2 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:border-primary-600/30 focus-within:ring-4 focus-within:ring-primary-600/5 transition-all">
              <input
                type="text"
                placeholder="Inquire about Nexus protocols..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
