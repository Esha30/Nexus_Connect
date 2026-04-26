import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatConversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Trash2, VolumeX, Archive, MessageCircle, Loader2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface ChatUserListProps {
 conversations: ChatConversation[];
 onClearChat?: (partnerId: string) => Promise<void>;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations, onClearChat }) => {
 const navigate = useNavigate();
 const { userId: activeUserId } = useParams<{ userId: string }>();
 const { user: currentUser } = useAuth();
 
 if (!currentUser) return null;
 
 const handleSelectUser = (userId: string) => {
 navigate(`/messages/${userId}`);
 };

 return (
 <div className="bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 overflow-y-auto">
 <div className="py-2">
 {conversations.length > 0 ? (
 conversations.map(conversation => {
 const otherUser = conversation.partner;
 if (!otherUser) return null;
 
 const lastMessage = conversation.lastMessage;
 const otherUserId = otherUser.id || (otherUser as any)._id;
 const isActive = activeUserId === otherUserId;
 
 return (
 <div
 key={conversation.id}
 className={`px-4 flex cursor-pointer transition-colors duration-200 group/listitem ${
 isActive
 ? 'bg-[#F0F2F5]'
 : 'hover:bg-[#F5F6F6]'
 }`}
 onClick={() => handleSelectUser(otherUserId)}
 >
 <Avatar
 src={otherUser.avatarUrl}
 alt={otherUser.name}
 size="md"
 status={otherUser.isOnline ? 'online' : 'offline'}
 className="mr-3 mt-3 flex-shrink-0"
 />
 
 <div className="flex-1 min-w-0 py-3 border-b border-gray-100">
 <div className="flex justify-between items-baseline">
 <div className="flex items-center gap-1.5 truncate">
   <h3 className={`text-sm font-medium truncate ${conversation.isMuted ? 'text-gray-500' : 'text-gray-900'}`}>
   {otherUser.name}
   </h3>
   {conversation.isMuted && <VolumeX size={12} className="text-gray-400" title="Muted" />}
   {conversation.isArchived && <Archive size={12} className="text-gray-400" title="Archived" />}
 </div>
 
 {lastMessage && (
 <span className="text-xs text-gray-500">
 {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 )}
 </div>
 
 <div className="flex justify-between items-center mt-1 group-hover/listitem:hidden">
 {lastMessage && (
 <p className="text-xs text-gray-600 truncate">
 {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
 {lastMessage.content}
 </p>
 )}
 
 {conversation.unreadCount && conversation.unreadCount > 0 ? (
 <Badge variant="primary" size="sm" rounded>{conversation.unreadCount} New</Badge>
 ) : null}
 </div>

 {/* Hover Actions */}
 {onClearChat && (
   <div className="hidden group-hover/listitem:flex justify-end items-center mt-1">
     <button 
       onClick={(e) => { e.stopPropagation(); onClearChat(otherUserId); }} 
       className="p-1 rounded-md text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
       title="Clear Chat"
     >
       <Trash2 size={14} />
     </button>
   </div>
 )}
 </div>
 </div>
 );
 })
  ) : (
    <div className="px-6 py-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageCircle size={24} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No chats yet</p>
      <p className="text-xs text-gray-500 mb-6 px-4">Start connecting with founders and investors to see your messages here.</p>
      <button 
        onClick={() => navigate('/feed')}
        className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors"
      >
        Discover Partners
      </button>
    </div>
  )}
 </div>
 </div>
 );
};