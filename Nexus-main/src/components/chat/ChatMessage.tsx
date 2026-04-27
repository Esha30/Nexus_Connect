import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Check, CheckCheck, Ban, Download, ChevronDown, Edit2, CornerUpLeft, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://nexus-backend-iini.onrender.com';

interface ChatMessageProps {
 message: Message;
 isCurrentUser: boolean;
 sender: {
 name: string;
 avatarUrl?: string;
 isOnline?: boolean;
 } | null;
  onDelete?: (id: string, deleteType: 'me' | 'everyone') => void;
  onEdit?: (message: Message) => void;
  onReply?: (message: Message) => void;
  partnerName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, sender, partnerName, onDelete, onEdit, onReply }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  if (!sender) return null;
  
  const isImage = message.fileType?.startsWith('image/');

  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in group relative`}
      onMouseLeave={() => { setShowMenu(false); setShowDeleteOptions(false); }}
    >
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
        <div className={`relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm ${
          message.isDeleted 
          ? 'bg-gray-100 text-gray-500 italic border border-gray-200'
          : isCurrentUser
          ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-none'
          : 'bg-white text-[#111B21] rounded-tl-none'
        }`}>
          {message.isDeleted ? (
            <div className="flex items-center gap-2 text-gray-500 italic pr-6 pb-2 pt-1">
              <Ban size={14} className="opacity-60" />
              <span className="text-sm">This message was deleted</span>
            </div>
          ) : (
            <div className="flex flex-col relative pr-8">
              {message.replyTo && (
                <div className={`mb-2 p-2 rounded text-xs border-l-4 ${isCurrentUser ? 'bg-primary-700/30 border-l-white text-blue-50' : 'bg-gray-100 border-l-primary-500 text-gray-700'}`}>
                  <span className="font-bold opacity-80 block mb-1">
                    {message.replyTo.senderId === message.senderId ? sender?.name : (isCurrentUser ? (partnerName || 'Partner') : 'You')}
                  </span>
                  <span className="opacity-90 line-clamp-2">{message.replyTo.content}</span>
                </div>
              )}
              {message.fileUrl && (
                <div className="mb-2 -mx-2 -mt-1 rounded-t-xl overflow-hidden">
                  {isImage ? (
                    <a href={`${API_URL}${message.fileUrl}`} target="_blank" rel="noopener noreferrer">
                      <img src={`${API_URL}${message.fileUrl}`} alt={message.fileName} className="max-w-full max-h-60 object-contain hover:opacity-90 transition-opacity" loading="lazy" />
                    </a>
                  ) : (
                    <a href={`${API_URL}${message.fileUrl}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-3 m-2 rounded-lg ${isCurrentUser ? 'bg-blue-700/50 hover:bg-blue-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                      <div className="bg-white/20 p-2 rounded-full"><Download size={16} /></div>
                      <span className="text-sm font-medium truncate max-w-[150px]">{message.fileName}</span>
                    </a>
                  )}
                </div>
              )}
              {message.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}

              {/* Dropdown Toggle */}
              {!message.isDeleted && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
                  className={`absolute top-1 right-2 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity ${isCurrentUser ? 'hover:bg-primary-700 text-white' : 'hover:bg-gray-200 text-gray-500'}`}
                >
                  <ChevronDown size={16} />
                </button>
              )}

              {/* Context Menu Dropdown */}
              {showMenu && (
                <div className={`absolute top-8 z-50 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                  {!message.isDeleted && (
                    <button onClick={() => { onReply?.(message); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                      <CornerUpLeft size={14} className="mr-3 text-gray-400" /> Reply
                    </button>
                  )}
                  {isCurrentUser && !message.isDeleted && (
                    <button onClick={() => { onEdit?.(message); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center border-t border-gray-50 transition-colors">
                      <Edit2 size={14} className="mr-3 text-gray-400" /> Edit
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowDeleteOptions(true); setShowMenu(false); }} 
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center border-t border-gray-50 transition-colors"
                  >
                    <Trash2 size={14} className="mr-3 text-red-400" /> Delete
                  </button>
                </div>
              )}

              {/* Delete Confirmation Options Pop-up */}
              {showDeleteOptions && (
                <div className={`absolute top-8 z-[60] w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 overflow-hidden ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delete Message?</p>
                  <button 
                    onClick={() => { onDelete?.(message.id, 'me'); setShowDeleteOptions(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Delete for me
                  </button>
                  {isCurrentUser && !message.isDeleted && (
                    <button 
                      onClick={() => { onDelete?.(message.id, 'everyone'); setShowDeleteOptions(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete for everyone
                    </button>
                  )}
                  <button 
                    onClick={() => setShowDeleteOptions(false)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-400 hover:bg-gray-50 border-t border-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Time and Ticks */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${isCurrentUser && !message.isDeleted ? 'text-[#667781] text-right w-full overflow-hidden' : 'text-[#667781]'}`}>
            {message.isEdited && (
              <span className="text-[10px] tracking-wide mr-1 opacity-80">(edited)</span>
            )}
            <span className="text-[10px] font-medium tracking-wide whitespace-nowrap overflow-hidden">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
            {isCurrentUser && !message.isDeleted && (
              <span className={message.isRead ? 'text-[#53bdeb]' : 'text-[#667781]'}>
                {message.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};