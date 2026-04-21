import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { ChatConversation } from '../../types';
import { MessageCircle, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';



export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

 const [isLoading, setIsLoading] = useState(true);
 
 useEffect(() => {
 const fetchConversations = async () => {
 if (!user) return;
 try {
 const res = await api.get('/messages/conversations');
 setConversations(res.data);
 } catch (err) {
 console.error('Failed to fetch conversations:', err);
 } finally {
 setIsLoading(false);
 }
 };
 fetchConversations();
 }, [user]);

 if (!user) return null;
 
 return (
 <div className="min-h-screen bg-transparent pb-10 flex flex-col">
 
 {/* Hero Header */}
 <div className="relative pt-6 pb-12 overflow-hidden">
 <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary-500/10 rounded-full -z-10 pointer-events-none" />
 
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 px-2">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-blue-700 text-xs font-medium mb-4 ">
 <MessageCircle size={12} /> Secure Messenger
 </div>
 <h1 className="text-xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight">
 Your <span className="text-primary-600">Sync Box.</span>
 </h1>
 <p className="text-lg text-gray-500 font-medium mt-2 leading-relaxed max-w-2xl">
 End-to-end encrypted discussions for your strategic venture partnerships.
 </p>
 </div>
 
 <div className="hidden md:flex items-center gap-3 bg-white/60 px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
 <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
 <span className="text-xs font-medium text-gray-400 ">Gateway Active</span>
 </div>
 </div>
 </div>

 <div className="flex-1 -mt-4 relative z-10">
 <div className="h-[calc(100vh-22rem)] bg-white/80 -xl rounded-lg shadow-[0_20px_50px_rgb(0,0,0,0.06)] border border-white/40 overflow-hidden animate-fade-in flex flex-col">
 {isLoading ? (
 <div className="flex-1 flex flex-col items-center justify-center gap-4">
 <div className="w-10 h-10 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
 <p className="text-xs font-medium text-gray-400 ">Opening Secure Channels...</p>
 </div>
 ) : conversations.length > 0 ? (
 <ChatUserList conversations={conversations} />
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
 <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 text-gray-300 border border-gray-100">
 <MessageCircle size={40} />
 </div>
 <h2 className="text-lg font-medium text-gray-900 tracking-tight">Speak your Vision</h2>
 <p className="text-gray-500 max-w-sm mt-3 font-medium leading-relaxed">
 Connect with partners through the marketplace to begin your first secure conversation protocol.
 </p>
 <div className="mt-8 flex gap-3">
 <button 
   onClick={() => {
     toast.success("AI Drafting Active! Select a discovery partner to start an assisted pitch.");
     const path = user?.role === 'entrepreneur' ? '/investors' : '/entrepreneurs';
     window.location.href = path;
   }}
   className="px-5 py-2.5 bg-white hover:bg-gray-50 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-2 border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
 >
   <Sparkles size={14} className="text-primary-600" /> AI Assisted Drafting
 </button>
 <Link 
   to={user?.role === 'entrepreneur' ? '/investors' : '/entrepreneurs'}
   className="px-5 py-2.5 bg-primary-50 hover:bg-primary-100 rounded-lg text-xs font-medium text-primary-700 cursor-pointer flex items-center gap-2 border border-primary-100 transition-colors"
 >
   <Search size={14} className="text-primary-600" /> Global Discovery
 </Link>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};