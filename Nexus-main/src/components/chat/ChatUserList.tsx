import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatConversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Trash2 } from 'lucide-react';

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
 navigate(`/chat/${userId}`);
 };

 return (
 <div className="bg-white border-r border-gray-200 w-full md:w-64 overflow-y-auto">
 <div className="py-4">
 <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">Messages</h2>
 
 <div className="space-y-1">
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
 className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 group/listitem ${
 isActive
 ? 'bg-primary-50 border-l-4 border-primary-600'
 : 'hover:bg-gray-50 border-l-4 border-transparent'
 }`}
 onClick={() => handleSelectUser(otherUserId)}
 >
 <Avatar
 src={otherUser.avatarUrl}
 alt={otherUser.name}
 size="md"
 status={otherUser.isOnline ? 'online' : 'offline'}
 className="mr-3 flex-shrink-0"
 />
 
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline">
 <h3 className="text-sm font-medium text-gray-900 truncate">
 {otherUser.name}
 </h3>
 
 {lastMessage && (
 <span className="text-xs text-gray-500">
 {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
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
 <div className="px-4 py-8 text-center">
 <p className="text-sm text-gray-500">No conversations yet</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};