// Nexus Chat System - Production Ready
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video as VideoIcon, Info, Smile, Mic, MicOff, VideoOff, MessageCircle, Paperclip, X, ChevronLeft, MoreVertical, Trash2, Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/api';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, ChatConversation, User } from '../../types';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { EmptyState } from '../../components/ui/EmptyState';


// Connect to the base URL without /api
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');

const STUN_SERVERS: RTCConfiguration = {
 iceServers: [
 { urls: 'stun:stun.l.google.com:19302' },
 ]
};

interface SignalingPayload {
  target: string;
  caller: string;
  signal: RTCSessionDescriptionInit;
  callType?: 'video' | 'audio';
}

interface IcePayload {
  target: string;
  candidate: RTCIceCandidateInit;
  senderId: string;
}

export const ChatPage: React.FC = () => {
 const { userId } = useParams<{ userId: string }>();
 const { user: currentUser } = useAuth();
 const [messages, setMessages] = useState<Message[]>([]);
 const [newMessage, setNewMessage] = useState('');
 const [conversations, setConversations] = useState<ChatConversation[]>([]);
 // All Refs
 const messagesEndRef = useRef<null | HTMLDivElement>(null);
 const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const socketRef = useRef<Socket | null>(null);
 const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
 const localStreamRef = useRef<MediaStream | null>(null);
 const localVideoRef = useRef<HTMLVideoElement | null>(null);
 const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
 const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
 
 // WebRTC & Chat States
 const [activeCallType, setActiveCallType] = useState<'video' | 'audio' | null>(null);
 const [isReceivingCall, setIsReceivingCall] = useState(false);
 const [callerSignal, setCallerSignal] = useState<SignalingPayload | null>(null);
 const [isMuted, setIsMuted] = useState(false);
 const [isVideoOff, setIsVideoOff] = useState(false);
 const [isTyping, setIsTyping] = useState(false);
 const [partnerTyping, setPartnerTyping] = useState(false);
 const [chatPartner, setChatPartner] = useState<User | null>(null);
 const [showChatOptions, setShowChatOptions] = useState(false);
 const [isClearModalOpen, setIsClearModalOpen] = useState(false);
 const [chatToClear, setChatToClear] = useState<string | null>(null);
 const [isDrafting, setIsDrafting] = useState(false);
 const [showProfileInfo, setShowProfileInfo] = useState(false);
 
 // WhatsApp Features State
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 // Edit & Reply State
 const [editingMessage, setEditingMessage] = useState<Message | null>(null);
 const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

 const getRoomId = useCallback(() => {
 if (!currentUser || !userId) return '';
 return [currentUser.id, userId].sort().join('-');
 }, [currentUser, userId]);

 const fetchConversations = useCallback(async () => {
 try {
 const res = await api.get(`/messages/conversations`);
 setConversations(res.data);
 } catch (err) {
 console.error("Error fetching conversations:", err);
 }
 }, []);

 const fetchMessages = useCallback(async () => {
 // Guard: only fetch if userId is a valid non-empty string
 if (!userId || userId === 'undefined') return;
 try {
 const res = await api.get(`/messages/${userId}`);
 setMessages(res.data);
 } catch (err) {
 console.error("Error fetching messages:", err);
 }
 // NOTE: chatPartner is intentionally excluded from deps to prevent infinite re-fetch
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [userId]);

 useEffect(() => {
 if (currentUser) {
 fetchConversations();
 }
 }, [currentUser, fetchConversations]);

 // Fetch messages AND chat partner when userId changes
 useEffect(() => {
 if (!currentUser || !userId || userId === 'undefined') return;
 fetchMessages();
  // Notify sender that we've read these messages now that history is loaded
  socketRef.current?.emit('read-receipt', {
    senderId: userId,
    readerId: currentUser?.id
  });
 // Load chat partner info from conversations or via API
 const loadChatPartner = async () => {
 const conv = conversations.find(c => c.partner?.id === userId);
 if (conv?.partner) {
 setChatPartner(conv.partner as User);
 } else {
 try {
 const userRes = await api.get(`/auth/profile/${userId}`);
 const data = userRes.data;
 setChatPartner({ ...data, id: data._id, isOnline: data.profile?.isOnline || false });
 } catch (_) { /* ignore */ }
 }
 };
 loadChatPartner();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [currentUser, userId]);
  
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages]);

 useEffect(() => {
 if (!currentUser || !userId) return;

  // Connect Socket.IO
  socketRef.current = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000,
  });
  const roomId = getRoomId();

 socketRef.current.emit('join-room', roomId, currentUser.id);
 socketRef.current.emit('join-chat', currentUser.id);

 // Messaging Events
   socketRef.current.on('receive-message', (payload: Message) => {
  if (payload.senderId === userId) {
    setMessages(prev => [...prev, payload]);
    // Mark as read live and notify sender
    api.get(`/messages/${userId}`).catch(console.error);
    socketRef.current?.emit('read-receipt', {
      senderId: userId,
      readerId: currentUser?.id
    });
  }
  fetchConversations();
  });

  socketRef.current.on('messages-read', ({ readerId }: { readerId: string }) => {
    if (readerId === userId) {
      setMessages(prev => prev.map(m => 
        m.senderId === currentUser?.id ? { ...m, isRead: true } : m
      ));
    }
  });

 socketRef.current.on('messages-read', ({ readerId }: { readerId: string }) => {
 if (readerId === userId) {
 setMessages(prev => prev.map(m => 
   m.senderId === currentUser.id ? { ...m, isRead: true } : m
 ));
 }
 });

 socketRef.current.on('typing', (senderId: string) => {
 if (senderId === userId) setPartnerTyping(true);
 });

 socketRef.current.on('stop-typing', (senderId: string) => {
 if (senderId === userId) setPartnerTyping(false);
 });

 socketRef.current.on('user-status-change', ({ userId: statusUserId, isOnline }: { userId: string, isOnline: boolean }) => {
 if (statusUserId === userId && chatPartner) {
 setChatPartner({ ...chatPartner, isOnline });
 }
 });

 // WebRTC Signaling Events
 socketRef.current.on('call-made', (data: SignalingPayload) => {
 console.log("Call received from:", data.caller);
 setCallerSignal(data);
 setIsReceivingCall(true);
 setActiveCallType(data.callType || 'video');
 });

 socketRef.current.on('call-answered', async (data: SignalingPayload) => {
 console.log("Incoming answer signal");
 if (peerConnectionRef.current) {
 await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
 // Flush ICE queue now that remote description is set
 iceCandidateQueueRef.current.forEach(candidate => {
  peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("ICE err", e));
 });
 iceCandidateQueueRef.current = [];
 }
 });

 socketRef.current.on('ice-candidate', (data: IcePayload) => {
 if (peerConnectionRef.current) {
  if (peerConnectionRef.current.remoteDescription) {
  peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(e => console.error("ICE error", e));
  } else {
  iceCandidateQueueRef.current.push(data.candidate);
  }
 }
 });

 socketRef.current.on('call-ended', () => {
 toast.error("Call ended by partner");
 // Local function call (need to handle carefully if defined below)
 window.dispatchEvent(new CustomEvent('internal-end-call'));
 });

 return () => {
 if (socketRef.current) {
 socketRef.current.disconnect();
 socketRef.current = null;
 }
 };
 }, [currentUser, userId, getRoomId, chatPartner, fetchConversations]);

 // --- WebRTC Logic ---

 const endCall = useCallback((emit: boolean = true) => {
  if (emit && socketRef.current && userId) {
  socketRef.current.emit('end-call', { target: userId });
  }
  
  // Close PC
  if (peerConnectionRef.current) {
  peerConnectionRef.current.close();
  peerConnectionRef.current = null;
  }
 
  // Stop tracks
  if (localStreamRef.current) {
  localStreamRef.current.getTracks().forEach(track => track.stop());
  localStreamRef.current = null;
  }
 
  setActiveCallType(null);
  setIsReceivingCall(false);
  setCallerSignal(null);
  }, [userId]);

  useEffect(() => {
    const handleEnd = () => endCall(false);
    window.addEventListener('internal-end-call', handleEnd);
    return () => window.removeEventListener('internal-end-call', handleEnd);
  }, [endCall]);

 const initLocalStream = async (type: 'video' | 'audio') => {
 try {
 const stream = await navigator.mediaDevices.getUserMedia({
 video: type === 'video',
 audio: true
 });
 localStreamRef.current = stream;
 if (localVideoRef.current) localVideoRef.current.srcObject = stream;
 return stream;
 } catch (err: any) {
 console.warn(`Media error for ${type}:`, err);
 
 // Automatic Fallback: If video fails (hardware lock), automatically try a pure voice call.
 if (type === 'video') {
 toast.error("Camera blocked or in use. Falling back to voice call.");
 setIsVideoOff(true);
 try {
  const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
  localStreamRef.current = fallbackStream;
  if (localVideoRef.current) localVideoRef.current.srcObject = fallbackStream;
  return fallbackStream;
 } catch (fallbackErr) {
  console.error("Audio fallback failed:", fallbackErr);
  toast.error("Microphone access also failed. Cannot start call.");
  return null;
 }
 }

 toast.error("Could not access microphone.");
 return null;
 }
 };

 const createPeer = (targetUserId: string, stream: MediaStream) => {
 const pc = new RTCPeerConnection(STUN_SERVERS);
 peerConnectionRef.current = pc;

 stream.getTracks().forEach(track => pc.addTrack(track, stream));

 pc.onicecandidate = (event) => {
 if (event.candidate) {
 socketRef.current?.emit('ice-candidate', {
 target: targetUserId,
 candidate: event.candidate,
 senderId: currentUser?.id
 });
 }
 };

 pc.ontrack = (event) => {
 if (remoteVideoRef.current) {
 remoteVideoRef.current.srcObject = event.streams[0];
 }
 };

 pc.onnegotiationneeded = async () => {
 try {
 const offer = await pc.createOffer();
 await pc.setLocalDescription(offer);
 socketRef.current?.emit('make-call', {
 target: targetUserId,
 caller: currentUser?.id,
 signal: offer,
 callType: activeCallType
 });
 } catch (err) {
 console.error("Negotiation error:", err);
 }
 };

 return pc;
 };

 const startCall = async (type: 'video' | 'audio') => {
 if (!userId) return;
 setActiveCallType(type);
 const stream = await initLocalStream(type);
 if (stream) {
 createPeer(userId, stream);
 }
 };

 const answerCall = async () => {
 if (!callerSignal) return;
 
 let stream = localStreamRef.current;
 if (!stream) {
 stream = await initLocalStream(callerSignal.callType || 'video');
 if (!stream) {
  toast.error("Could not access camera/microphone to answer call.", { id: 'cam-err' });
  endCall(true); // Tell partner we dropped the call due to hardware block
  return;
 }
 }
  
 setIsReceivingCall(false);
 const pc = new RTCPeerConnection(STUN_SERVERS);
 peerConnectionRef.current = pc;

 stream.getTracks().forEach(track => pc.addTrack(track, stream));

 pc.onicecandidate = (event) => {
 if (event.candidate) {
 socketRef.current?.emit('ice-candidate', {
 target: callerSignal!.caller,
 candidate: event.candidate,
 senderId: currentUser?.id
 });
 }
 };

 pc.ontrack = (event) => {
 if (remoteVideoRef.current) {
 remoteVideoRef.current.srcObject = event.streams[0];
 }
 };

 await pc.setRemoteDescription(new RTCSessionDescription(callerSignal!.signal));
 
 // Flush any early ICE candidates received while we were doing this
 iceCandidateQueueRef.current.forEach(candidate => {
  pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("ICE error", e));
 });
 iceCandidateQueueRef.current = [];
 
 const answer = await pc.createAnswer();
 await pc.setLocalDescription(answer);

 socketRef.current?.emit('answer-call', {
 target: callerSignal!.caller,
 signal: answer
 });
 };

 // --- Messaging Actions ---

 const handleMute = () => {
 if (localStreamRef.current) {
 const audioTrack = localStreamRef.current.getAudioTracks()[0];
 if (audioTrack) {
 audioTrack.enabled = !audioTrack.enabled;
 setIsMuted(!audioTrack.enabled);
 }
 }
 };

 const toggleVideo = () => {
 if (localStreamRef.current) {
 const videoTrack = localStreamRef.current.getVideoTracks()[0];
 if (videoTrack) {
 videoTrack.enabled = !videoTrack.enabled;
 setIsVideoOff(!videoTrack.enabled);
 }
 }
 };
  
 const handleTyping = () => {
 if (!socketRef.current || !userId || !currentUser) return;
  
 if (!isTyping) {
 setIsTyping(true);
 socketRef.current.emit('typing', { senderId: currentUser.id, receiverId: userId });
 }

 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  
 typingTimeoutRef.current = setTimeout(() => {
 setIsTyping(false);
 socketRef.current?.emit('stop-typing', { senderId: currentUser.id, receiverId: userId });
 }, 3000);
 };

  const handleAiDraft = async () => {
    if (!userId || isDrafting) return;
    
    setIsDrafting(true);
    const draftToast = toast.loading('AI is drafting a response...');
    
    try {
      // Get last 10 messages for context
      const contextMessages = messages.slice(-10);
      
      const res = await api.post('/ai/draft', {
        history: contextMessages,
        partnerName: chatPartner?.name,
        partnerRole: chatPartner?.role
      });
      
      if (res.data.draft) {
        setNewMessage(res.data.draft);
        toast.success('Response drafted!', { id: draftToast });
      } else {
        toast.error('Could not generate draft', { id: draftToast });
      }
    } catch (err: any) {
      console.error('AI Draft Error:', err);
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('AI limit reached for your plan', { id: draftToast });
      } else {
        toast.error('Failed to generate AI draft', { id: draftToast });
      }
    } finally {
      setIsDrafting(false);
    }
  };

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newMessage.trim() || !currentUser || !userId || userId === 'undefined') return;
  
 const content = newMessage.trim();
 setNewMessage('');
  
 // Stop typing indicator immediately
 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
 setIsTyping(false);
 socketRef.current?.emit('stop-typing', { senderId: currentUser.id, receiverId: userId });

 try {
 if (editingMessage) {
 // Handle Edit logic
 const res = await api.put(`/messages/${editingMessage.id}`, { content });
 const updatedMsg: Message = res.data;
  
 setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
 setEditingMessage(null);
  
 socketRef.current?.emit('edit-message', {
 receiverId: userId,
 message: updatedMsg
 });
 } else {
 // Handle Send logic (with possible reply)
 interface MessagePayload {
   receiverId: string;
   content: string;
   replyTo?: string;
   fileUrl?: string;
   fileName?: string;
   fileType?: string;
 }

  const payload: MessagePayload = {
   receiverId: userId,
   content
  };
  
  if (replyingToMessage) {
    payload.replyTo = replyingToMessage.id || (replyingToMessage as any)._id;
  }
  
  if (attachment) {
 payload.fileUrl = attachment.url;
 payload.fileName = attachment.name;
 payload.fileType = attachment.type;
 }
  
 const res = await api.post(`/messages`, payload);

 const message: Message = res.data;
  
 // Clear locally
 setMessages(prev => [...prev, message]);
 setAttachment(null);
 setShowEmojiPicker(false);
 setReplyingToMessage(null);

 // Emit via socket
 socketRef.current?.emit('send-message', {
 ...message,
 receiverId: userId
 });
 }

 // Refresh sidebar
 fetchConversations();
 } catch (err) {
 console.error('Error handling message:', err);
 toast.error(editingMessage ? 'Failed to edit message' : 'Failed to send message');
 }
 };

 const handleEditInit = (msg: Message) => {
 setEditingMessage(msg);
 setNewMessage(msg.content);
 setReplyingToMessage(null);
 };

 const handleDeleteMessage = async (msgId: string) => {
 if (!userId) return;
 try {
 await api.delete(`/messages/${msgId}`);
 setMessages(prev => prev.filter(m => m.id !== msgId));
 socketRef.current?.emit('delete-message', {
 receiverId: userId,
 messageId: msgId
 });
 // Refresh sidebar
 fetchConversations();
 } catch (err) {
 console.error('Error deleting message:', err);
 toast.error('Failed to delete message');
 }
 };

 const handleClearChatPrompt = (targetId?: string) => {
 const idToClear = targetId || userId;
 if (!idToClear || !conversations.length) return;
 setChatToClear(idToClear);
 setIsClearModalOpen(true);
 };

 const handleClearChatConfirm = async () => {
 if (!chatToClear) return;
 try {
 await api.delete(`/messages/clear/${chatToClear}`);
 
 // If wiping the currently active chat, clear messages array
 if (chatToClear === userId) {
   setMessages([]);
   setShowChatOptions(false);
 }
 
 fetchConversations();
 setIsClearModalOpen(false);
 setChatToClear(null);
 toast.success('Conversation wiped clean');
 } catch (err) {
 console.error('Error clearing chat:', err);
 toast.error('Failed to clear chat');
 }
 };

  const handleToggleMute = async () => {
    if (!userId) return;
    try {
      await api.put(`/messages/mute/${userId}`);
      toast.success('Mute settings updated');
      fetchConversations();
    } catch (err) {
      toast.error('Failed to update mute settings');
    }
    setShowChatOptions(false);
  };

  const handleToggleArchive = async () => {
    if (!userId) return;
    try {
      await api.put(`/messages/archive/${userId}`);
      toast.success('Archive settings updated');
      fetchConversations();
    } catch (err) {
      toast.error('Failed to update archive settings');
    }
    setShowChatOptions(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
 setNewMessage(prev => prev + emojiData.emoji);
 };

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsUploading(true);
 const formData = new FormData();
 formData.append('file', file);

 try {
 const res = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
  
 setAttachment({
 url: res.data.fileUrl,
 name: file.name,
 type: file.type
 });
 toast.success('File uploaded and ready to send');
 } catch (err) {
 console.error('Upload error:', err);
 toast.error('Failed to upload file');
 } finally {
 setIsUploading(false);
 }
 };

 return (
 <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] bg-gray-50 flex overflow-hidden">
 {/* Sidebar */}
 <div className={`${userId ? 'hidden md:flex' : 'flex w-full'} md:flex-shrink-0`}>
 <div className="flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-100">
 <div className="h-16 px-4 flex items-center border-b border-gray-200 bg-[#F0F2F5] shrink-0">
 <Avatar src={currentUser?.profile?.avatarUrl} alt="Me" size="sm" className="mr-3" />
 <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
 </div>
 <ChatUserList
 conversations={conversations}
 onClearChat={async (id) => handleClearChatPrompt(id)}
 />
 </div>
 </div>

 {/* Main Chat Area */}
 <div className={`flex-1 flex-col min-w-0 bg-white ${userId ? 'flex' : 'hidden md:flex'}`}>
 {userId ? (
 <>
 {/* Chat Header */}
 <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-[#F0F2F5] shrink-0 z-10">
 <div className="flex items-center gap-4">
 <button className="md:hidden p-2 text-gray-400 hover:text-gray-600" onClick={() => (window.location.href = '/messages')}>
 <ChevronLeft size={24} />
 </button>
 <div className="relative">
 <Avatar src={chatPartner?.profile?.avatarUrl} alt={chatPartner?.name || ''} size="md" />
 {chatPartner?.isOnline && (
 <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
 )}
 </div>
 <div>
 <h3 className="text-base font-bold text-gray-900">{chatPartner?.name || 'Loading...'}</h3>
 <p className="text-xs font-medium text-gray-400">{chatPartner?.isOnline ? 'Online Now' : 'Last seen recently'}</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button onClick={() => startCall('audio')} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition duration-200">
 <Phone size={20} />
 </button>
 <button onClick={() => startCall('video')} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition duration-200">
 <VideoIcon size={20} />
 </button>
 <button 
   onClick={() => setShowProfileInfo(!showProfileInfo)} 
   className={`p-2.5 rounded-xl transition duration-200 ${showProfileInfo ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
   title="Partner Information"
 >
   <Info size={20} />
 </button>
 <div className="relative">
   <button onClick={() => setShowChatOptions(!showChatOptions)} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition duration-200">
     <MoreVertical size={20} />
   </button>
   {showChatOptions && (
      <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
        <button onClick={handleToggleMute} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
          Mute Sender
        </button>
        <button onClick={handleToggleArchive} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors border-b border-gray-50">
          Archive Chat
        </button>
        <button onClick={() => { setShowChatOptions(false); handleClearChatPrompt(); }} className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center transition-colors">
          <Trash2 size={16} className="mr-3" /> Delete Chat
        </button>
      </div>
   )}
 </div>
 </div>
 </div>

 {/* Messages Container */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
 {messages.map((msg) => (
 <ChatMessage 
 key={msg.id} 
 message={msg} 
 isCurrentUser={msg.senderId === currentUser?.id}
  sender={
    msg.senderId === currentUser?.id
      ? { name: currentUser?.name || 'You', avatarUrl: currentUser?.profile?.avatarUrl }
      : { name: chatPartner?.name || 'Partner', avatarUrl: chatPartner?.profile?.avatarUrl, isOnline: chatPartner?.isOnline ?? false }
  }
  partnerName={chatPartner?.name}
  onEdit={() => handleEditInit(msg)}
 onDelete={() => handleDeleteMessage(msg.id)}
 onReply={() => setReplyingToMessage(msg)}
 />
 ))}
 <div ref={messagesEndRef} />
 </div>

 {/* Call Overlays */}
 {activeCallType && (
 <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
 <div className="relative w-full max-w-4xl h-full max-h-[600px] bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-700">
 {/* Remote Video */}
 <video
 ref={remoteVideoRef}
 autoPlay
 playsInline
 className="w-full h-full object-cover"
 />
 
 {/* Local Preview */}
 <div className="absolute top-8 right-8 w-40 h-56 bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-xl">
 <video
 ref={localVideoRef}
 autoPlay
 muted
 playsInline
 className="w-full h-full object-cover mirror"
 />
 {isVideoOff && (
 <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
 <Avatar src={currentUser?.profile?.avatarUrl} alt={currentUser?.name || ''} size="lg" />
 </div>
 )}
 </div>

 {/* Call Info */}
 <div className="absolute top-12 left-12 flex items-center gap-4 bg-black/30 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
 <Avatar src={chatPartner?.profile?.avatarUrl} alt={chatPartner?.name || ''} size="md" />
 <div>
 <h4 className="font-bold text-white">{chatPartner?.name}</h4>
 <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">Encrypted Connection</p>
 </div>
 </div>

 {/* Controls */}
 <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 bg-gray-900/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-3xl ring-1 ring-white/5">
 <button onClick={handleMute} className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
 {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
 </button>
 <button onClick={toggleVideo} className={`p-4 rounded-2xl transition-all duration-300 ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
 {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
 </button>
 <button onClick={() => endCall(true)} className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-500/30 transition-all active:scale-95">
 <Phone size={24} />
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Receiving Call Modal */}
 {isReceivingCall && (
 <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
 <div className="bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8 border border-white/5 shadow-3xl animate-in zoom-in-95 duration-300">
 <div className="relative">
 <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
 <Avatar src={chatPartner?.profile?.avatarUrl} alt={chatPartner?.name || ''} size="2xl" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-white mb-2">{chatPartner?.name}</h3>
 <p className="text-gray-400 flex items-center justify-center gap-2">
 {activeCallType === 'video' ? <VideoIcon size={16} /> : <Phone size={16} />} 
 Incoming {activeCallType} call...
 </p>
 </div>
 <div className="flex gap-4 w-full">
 <button onClick={() => endCall(true)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl font-bold transition">Decline</button>
 <button onClick={answerCall} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition active:scale-95">Accept</button>
 </div>
 </div>
 </div>
 )}

      {/* Input Area */}
      <div className="px-4 py-3 bg-[#F0F2F5] flex flex-col shrink-0">
        {replyingToMessage && (
        <div className="mb-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between border-l-4 border-primary-500 animate-in slide-in-from-bottom-2 duration-200">
        <div className="text-xs">
        <p className="font-bold text-primary-600">Replying to {replyingToMessage.senderId === currentUser?.id ? 'Yourself' : chatPartner?.name}</p>
        <p className="text-gray-500 truncate">{replyingToMessage.content}</p>
        </div>
        <button onClick={() => setReplyingToMessage(null)} className="p-1 text-gray-400 hover:text-gray-600">
        <X size={16} />
        </button>
        </div>
        )}
         
        {attachment && (
        <div className="mb-3 p-3 bg-primary-50 rounded-xl flex items-center justify-between border border-primary-100 animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-3">
        <Paperclip size={16} className="text-primary-600" />
        <div className="text-xs">
        <p className="font-bold text-gray-900 truncate">{attachment.name}</p>
        <p className="text-primary-600 font-medium">Ready to send</p>
        </div>
        </div>
        <button onClick={() => setAttachment(null)} className="p-1 text-gray-400 hover:text-gray-600">
        <X size={16} />
        </button>
        </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4 w-full">
          <div className="relative flex items-center">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-500 hover:text-gray-700 transition">
              <Smile size={24} />
            </button>
            {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-50 shadow-2xl border-none rounded-2xl overflow-hidden">
            <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-700 transition">
              <Paperclip size={24} />
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

          <button 
            type="button" 
            onClick={handleAiDraft} 
            disabled={isDrafting || !userId}
            className={`p-2 transition-all duration-300 ${isDrafting ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`}
            title="AI Assist"
          >
            {isDrafting ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            placeholder={editingMessage ? "Edit message..." : "Type a message"}
            className="flex-1 bg-white border border-gray-200 py-2.5 px-4 rounded-xl text-[15px] text-gray-900 placeholder-gray-500 focus:ring-1 focus:ring-primary-500 outline-none shadow-sm"
          />

          <button type="submit" className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-sm active:scale-95 transition-all flex items-center justify-center h-10 w-10 ml-1" disabled={isUploading || (!newMessage.trim() && !attachment)}>
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
 </>
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600/10" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-8 text-center">
        <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-primary-600/10 flex items-center justify-center mb-8 border border-gray-100 animate-bounce-subtle">
          <MessageCircle size={48} className="text-primary-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Nexus Web</h2>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
          Select a partner from the sidebar to start a secure, encrypted end-to-end conversation with potential investors or founders.
        </p>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 rounded-full border border-gray-200/50">
          <Sparkles size={14} className="text-primary-600" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">End-to-End Encrypted Channel</span>
        </div>

        <button 
          onClick={() => navigate(currentUser?.role === 'investor' ? '/entrepreneurs' : '/investors')}
          className="mt-10 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
        >
          Start New Connection
        </button>
      </div>
      
      <div className="absolute bottom-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
        <div className="w-8 h-[1px] bg-gray-200" />
        Secure Protocol v2.4
        <div className="w-8 h-[1px] bg-gray-200" />
      </div>
    </div>
  )}
 </div>
 
 {/* Custom Confirm Modal for Clearing Chat */}
 {isClearModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl scale-in">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
        <Trash2 size={28} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Conversation?</h3>
        <p className="text-sm font-medium text-gray-500">Are you sure you want to completely clear this conversation? This will permanently delete all messages for both you and your partner.</p>
      </div>
      <div className="flex gap-3 w-full pt-2">
        <button onClick={() => { setIsClearModalOpen(false); setChatToClear(null); }} className="flex-1 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
        <button onClick={handleClearChatConfirm} className="flex-1 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-colors">Delete All</button>
      </div>
    </div>
  </div>
 )}
 
    {/* Partner Info Sidebar */}
    {showProfileInfo && chatPartner && (
      <div className="hidden lg:flex w-80 border-l border-gray-100 bg-white flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0">
          <h3 className="font-bold text-gray-900">Partner Intelligence</h3>
          <button onClick={() => setShowProfileInfo(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <Avatar src={chatPartner.profile?.avatarUrl} alt={chatPartner.name} size="2xl" />
              {chatPartner.isOnline && (
                <span className="absolute bottom-2 right-2 block h-4 w-4 rounded-full bg-green-500 ring-4 ring-white" />
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{chatPartner.name}</h4>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{chatPartner.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary-100 text-primary-600 rounded-lg">
                  <Sparkles size={14} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Strategic Pitch</p>
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {chatPartner.profile?.pitchSummary || 'No strategic pitch summary provided yet.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Industry focus</p>
                <p className="text-sm font-semibold text-gray-900">{chatPartner.profile?.industry || 'Unspecified'}</p>
              </div>
              
              {chatPartner.role === 'entrepreneur' && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Funding Goal</p>
                  <p className="text-sm font-semibold text-emerald-600">{chatPartner.profile?.fundingNeeded || 'TBD'}</p>
                </div>
              )}
              
              {chatPartner.role === 'investor' && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Investment Interests</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {chatPartner.profile?.investmentInterests?.map((interest: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{interest}</span>
                    )) || <span className="text-sm font-semibold text-gray-900">General</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
          <button 
            onClick={() => window.location.href = `/${chatPartner.role === 'investor' ? 'investors' : 'entrepreneurs'}`}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-sm"
          >
            View Full Profile Protocol
          </button>
        </div>
      </div>
    )}
    </div>
  );
};