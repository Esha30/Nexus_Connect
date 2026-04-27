import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Minimize2, Maximize2, PanelRight, GripVertical } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface CopilotWidgetProps {
  isDocked?: boolean;
  onDockToggle?: () => void;
}

export const CopilotWidget: React.FC<CopilotWidgetProps> = ({ isDocked = false, onDockToggle }) => {
  const { isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Nexus AI initialized. How can I assist your operational strategy today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number, isMoved: boolean } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDocked) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      isMoved: false
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragRef.current.isMoved = true;
      }
      
      setPosition({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleFabClick = (e: React.MouseEvent) => {
    if (dragRef.current?.isMoved) {
      e.preventDefault();
      return;
    }
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userQuery = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setIsTyping(true);

    try {
      // Format history natively as Gemini expects { role: 'user'|'model', parts: [{ text: '...' }] }
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const res = await api.post('/ai/chat', { 
        message: userQuery,
        history 
      });

      setMessages(prev => [...prev, { role: 'model', text: res.data.response }]);
    } catch (err: any) {
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('Free AI Limit Reached. Please upgrade to Pro.');
        setMessages(prev => [...prev, { role: 'model', text: 'You have exhausted your complimentary Starter tier usage. To continue utilizing the intelligence matrix, please upgrade to a Premium protocol in your Billing settings.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: '[System Error] Unable to reach Nexus intelligence.' }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && !isDocked && (
        <button
          onMouseDown={handleMouseDown}
          onClick={handleFabClick}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className={`fixed top-20 left-4 md:top-auto md:bottom-6 md:right-6 p-4 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 z-50 group flex items-center justify-center animate-fade-in ${
            isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-all'
          }`}
        >
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
          <Sparkles size={24} className="relative z-10 text-primary-400 group-hover:text-primary-300" />
        </button>
      )}

      {/* Chat Window */}
      {(isOpen || isDocked) && (
        <div 
          style={!isDocked ? { transform: `translate(${position.x}px, ${position.y}px)` } : {}}
          className={`${isDocked ? 'relative h-full w-full rounded-none border-none shadow-none' : 'fixed left-4 md:left-auto md:right-6 top-20 md:top-auto md:bottom-6 shadow-2xl rounded-2xl border border-gray-100'} z-50 flex flex-col transition-all duration-300 transform origin-top-left md:origin-bottom-right overflow-hidden bg-white ${
            isDocked ? '' : isExpanded ? 'w-[450px] h-[600px] sm:w-[500px] sm:h-[700px]' : 'w-[350px] h-[500px]'
          } ${isDragging ? 'transition-none scale-[1.02] z-[60] cursor-grabbing select-none' : ''}`}
        >
          {/* Header */}
          <div 
            onMouseDown={handleMouseDown}
            className={`bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shrink-0 ${!isDocked ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div className="flex items-center gap-3">
              {!isDocked && <GripVertical size={16} className="text-gray-500 mr-1" />}
              <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
                <Sparkles size={16} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">Nexus Copilot</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-1 ${isConnected ? 'text-green-400' : 'text-amber-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {isConnected ? 'System Ready' : 'Connecting...'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onDockToggle && (
                <button 
                  onClick={onDockToggle}
                  title={isDocked ? "Undock" : "Dock to Side"}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                >
                  <PanelRight size={16} />
                </button>
              )}
              {!isDocked && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              )}
              {!isDocked && (
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 hide-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                placeholder="Ask intelligence matrix..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!query.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 p-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
