import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatConversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Trash2, VolumeX, Archive, MessageCircle, MoreVertical, CheckSquare, ChevronLeft } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface ChatUserListProps {
  conversations: ChatConversation[];
  activePartner?: any;
  onClearChat?: (partnerId: string) => Promise<void>;
  onMarkAllRead?: (partnerId: string) => Promise<void>;
  onMuteChat?: (partnerId: string) => Promise<void>;
  onArchiveChat?: (partnerId: string) => Promise<void>;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ 
  conversations, 
  activePartner, 
  onClearChat,
  onMarkAllRead,
  onMuteChat,
  onArchiveChat
}) => {
 const navigate = useNavigate();
 const { userId: activeUserId } = useParams<{ userId: string }>();
 const { user: currentUser } = useAuth();
 
 const [openMenuId, setOpenMenuId] = useState<string | null>(null);
 const [showArchived, setShowArchived] = useState(false);
 const menuRef = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
       setOpenMenuId(null);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 if (!currentUser) return null;
 
 const handleSelectUser = (userId: string) => {
 navigate(`/messages/${userId}`);
 };

  const displayConversations = [...conversations];
  if (activePartner && !displayConversations.some(c => (c.partner?.id || (c.partner as any)?._id) === (activePartner.id || activePartner._id))) {
    displayConversations.unshift({
      id: 'new-' + (activePartner.id || activePartner._id),
      partner: activePartner,
      lastMessage: null,
      unreadCount: 0,
      isMuted: false,
      isArchived: false,
      updatedAt: new Date().toISOString()
    } as any);
  }

  const archivedConversations = displayConversations.filter(c => c.isArchived);
  const unarchivedConversations = displayConversations.filter(c => !c.isArchived);

  const activeConversations = showArchived ? archivedConversations : unarchivedConversations;

  return (
  <div className="bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 overflow-y-auto relative flex-1 h-full min-h-0">
  <div className="pt-2 pb-48">
  
  {/* Archived Folder Header */}
  {showArchived && (
    <div 
      className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 border-b border-gray-100 mb-2 transition-colors"
      onClick={() => setShowArchived(false)}
    >
      <ChevronLeft className="text-gray-500 mr-2" size={20} />
      <span className="text-sm font-bold text-gray-900">Archived Chats</span>
    </div>
  )}

  {!showArchived && archivedConversations.length > 0 && (
    <div 
      className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 border-b border-gray-100 mb-2 transition-colors"
      onClick={() => setShowArchived(true)}
    >
      <Archive className="text-gray-400 mr-3" size={18} />
      <span className="text-sm font-medium text-gray-700">Archived</span>
      <div className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
        {archivedConversations.length}
      </div>
    </div>
  )}

  {activeConversations.length > 0 ? (
  activeConversations.map(conversation => {
 const otherUser = conversation.partner;
 if (!otherUser) return null;
 
 const lastMessage = conversation.lastMessage;
 const otherUserId = otherUser.id || (otherUser as any)._id;
 const isActive = activeUserId === otherUserId;
 const isMenuOpen = openMenuId === otherUserId;
 
 return (
 <div
 key={conversation.id}
 className={`px-4 flex cursor-pointer transition-colors duration-200 group/listitem relative ${
 isActive || isMenuOpen
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
 
 <div className="flex-1 min-w-0 py-3 border-b border-gray-100 pr-4">
 <div className="flex justify-between items-baseline">
 <div className="flex items-center gap-1.5 truncate pr-2">
   <h3 className={`text-sm font-medium truncate ${conversation.isMuted ? 'text-gray-500' : 'text-gray-900'}`}>
   {otherUser.name}
   </h3>
   {conversation.isMuted && <VolumeX size={12} className="text-gray-400 shrink-0" title="Muted" />}
   {conversation.isArchived && <Archive size={12} className="text-gray-400 shrink-0" title="Archived" />}
 </div>
 
 {lastMessage && (
 <span className={`text-[10px] ${conversation.unreadCount && conversation.unreadCount > 0 ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
 {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 )}
 </div>
 
 <div className="flex justify-between items-center mt-1">
 {lastMessage && (
 <p className={`text-xs truncate pr-4 ${conversation.unreadCount && conversation.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
 {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
 {lastMessage.content}
 </p>
 )}
 
 {conversation.unreadCount && conversation.unreadCount > 0 ? (
 <Badge variant="primary" size="sm" rounded>{conversation.unreadCount}</Badge>
 ) : null}
 </div>
 </div>

 {/* Hover Actions / Menu Button */}
 <div className={`absolute right-2 top-4 bottom-4 flex items-center justify-center bg-gradient-to-l from-[#F0F2F5] via-[#F0F2F5] to-transparent pl-4 ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover/listitem:opacity-100'} transition-opacity`}>
   <button 
     onClick={(e) => { 
       e.stopPropagation(); 
       setOpenMenuId(isMenuOpen ? null : otherUserId);
     }} 
     className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-white transition-colors shadow-sm bg-white/50"
   >
     <MoreVertical size={16} />
   </button>
 </div>

 {/* Dropdown Menu */}
 {isMenuOpen && (
   <div 
     ref={menuRef}
     className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
     onClick={(e) => e.stopPropagation()}
   >
     {onMarkAllRead && (
       <button 
         onClick={() => { onMarkAllRead(otherUserId); setOpenMenuId(null); }}
         className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
       >
         <CheckSquare size={15} className="text-gray-400" />
         Mark All Read
       </button>
     )}
     {onMuteChat && (
       <button 
         onClick={() => { onMuteChat(otherUserId); setOpenMenuId(null); }}
         className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
       >
         <VolumeX size={15} className="text-gray-400" />
         {conversation.isMuted ? 'Unmute Chat' : 'Mute Chat'}
       </button>
     )}
     {onArchiveChat && (
       <button 
         onClick={() => { 
           onArchiveChat(otherUserId); 
           setOpenMenuId(null);
           if (showArchived && archivedConversations.length === 1) {
             setShowArchived(false); // Go back if we unarchived the last one
           }
         }}
         className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
       >
         <Archive size={15} className="text-gray-400" />
         {conversation.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
       </button>
     )}
     {onClearChat && (
       <button 
         onClick={() => { onClearChat(otherUserId); setOpenMenuId(null); }}
         className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 mt-1"
       >
         <Trash2 size={15} className="text-red-400" />
         Delete Chat
       </button>
     )}
   </div>
 )}
 </div>
 );
 })
  ) : (
    <div className="px-6 py-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {showArchived ? <Archive size={24} className="text-gray-300" /> : <MessageCircle size={24} className="text-gray-300" />}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{showArchived ? 'No archived chats' : 'No chats yet'}</p>
      {!showArchived && (
        <>
          <p className="text-xs text-gray-500 mb-6 px-4">Start connecting with founders and investors to see your messages here.</p>
          <button 
            onClick={() => {
              const role = currentUser?.role?.toLowerCase();
              navigate(role === 'investor' ? '/entrepreneurs' : '/investors');
            }}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors"
          >
            Discover Partners
          </button>
        </>
      )}
    </div>
  )}
 </div>
 </div>
 );
};