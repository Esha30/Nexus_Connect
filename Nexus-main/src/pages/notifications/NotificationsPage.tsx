import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, UserPlus, DollarSign, Calendar, Sparkles, CheckCircle2, Trash2, X, Settings } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Notification } from '../../types';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '../../components/ui/EmptyState';

export const NotificationsPage: React.FC = () => {
 const { user } = useAuth();
 const { socket, refreshNotificationCount } = useSocket();
 const navigate = useNavigate();
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [activeFilter, setActiveFilter] = useState<string>('All');
 const [isClearModalOpen, setIsClearModalOpen] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  if (!user) return;
  const init = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
      // Auto-mark all as read when page opens (like WhatsApp/Gmail)
      const hasUnread = res.data.some((n: Notification) => !n.isRead);
      if (hasUnread) {
        await api.put('/notifications/read-all');
        setNotifications((prev: Notification[]) => prev.map(n => ({ ...n, isRead: true })));
        // Sync the navbar badge count immediately
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        refreshNotificationCount();
      }
    } catch (_err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  init();
  }, [user]);

 // Real-time notification updates and fallback polling
 useEffect(() => {
   if (socket) {
     const handleNewNotification = (notification: Notification) => {
       setNotifications(prev => [notification, ...prev]);
     };
     socket.on('new-notification', handleNewNotification);
     return () => {
       socket.off('new-notification', handleNewNotification);
     };
   }
 }, [socket]);

 useEffect(() => {
   if (!user) return;
   const intervalId = setInterval(async () => {
     try {
       const res = await api.get('/notifications/');
       refreshNotificationCount();
       setNotifications(prev => {
         if (prev.length !== res.data.length) return res.data;
         const hasChanges = prev.some((n, i) => n._id !== res.data[i]?._id || n.isRead !== res.data[i]?.isRead);
         return hasChanges ? res.data : prev;
       });
     } catch (e) {
       /* ignore error */
     }
   }, 2000);
   return () => clearInterval(intervalId);
 }, [user]);

 const markAllAsRead = async () => {
 if (!notifications.some(n => !n.isRead)) return;
 try {
 await api.put('/notifications/read-all');
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
 window.dispatchEvent(new CustomEvent('notifications-updated'));
 toast.success('All clear!');
 } catch (_err) {
 toast.error('Operation failed');
 }
 };

 const handleNotificationClick = async (notification: Notification) => {
 try {
 await api.delete(`/notifications/${notification._id}`);
 setNotifications(prev => prev.filter(n => n._id !== notification._id));
 window.dispatchEvent(new CustomEvent('notifications-updated'));
 } catch (err) {
 console.error('Failed to delete notification:', err);
 }

 // Navigate based on type
 switch (notification.type) {
 case 'message':
 navigate(`/messages/${notification.sender._id}`);
 break;
 case 'meeting':
 navigate('/meetings');
 break;
 case 'connection':
 navigate(user?.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
 break;
 case 'investment':
 navigate('/deals');
 break;
 case 'system':
 navigate('/settings');
 break;
 default:
 // No redirection for unknown types
 break;
 }
 };

 const deleteNotification = async (e: React.MouseEvent, id: string) => {
 e.stopPropagation();
 try {
 await api.delete(`/notifications/${id}`);
 setNotifications(prev => prev.filter(n => n._id !== id));
 window.dispatchEvent(new CustomEvent('notifications-updated'));
 toast.success('Notification removed');
 } catch (_err) {
 toast.error('Failed to delete');
 }
 };

 const deleteAllNotifications = async () => {
 if (notifications.length === 0) return;
 
 try {
 await api.delete('/notifications');
 setNotifications([]);
 window.dispatchEvent(new CustomEvent('notifications-updated'));
 setIsClearModalOpen(false);
 toast.success('Inbox cleared');
 } catch (_err) {
 toast.error('Failed to clear inbox');
 }
 };

 const getNotificationIcon = (type: string) => {
 switch (type) {
 case 'message': return <MessageCircle size={16} className="text-primary-600" />;
 case 'connection': return <UserPlus size={16} className="text-secondary-600" />;
 case 'investment': return <DollarSign size={16} className="text-accent-600" />;
 case 'meeting': return <Calendar size={16} className="text-emerald-600" />;
 case 'system': return <Settings size={16} className="text-gray-600" />;
 default: return <Bell size={16} className="text-gray-600" />;
 }
 };

 const filters = ['All', 'Unread', 'Messages', 'Connections', 'Meetings'];

 const filteredNotifications = useMemo(() => {
 return notifications.filter(n => {
 if (activeFilter === 'All') return true;
 if (activeFilter === 'Unread') return !n.isRead;
 if (activeFilter === 'Messages') return n.type === 'message';
 if (activeFilter === 'Connections') return n.type === 'connection';
 if (activeFilter === 'Meetings') return n.type === 'meeting';
 return true;
 });
 }, [notifications, activeFilter]);

 return (
 <div className="min-h-screen bg-gray-50 pb-20">
 
 {/* Hero Header */}
 <div className="relative pt-10 pb-20 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white">
 <div className="absolute -top-40 -left-60 w-96 h-96 bg-primary-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full pointer-events-none" />
  <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 md:gap-10">
  <div className="max-w-2xl text-center lg:text-left">
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider mb-6 ">
  <Sparkles size={14} /> Unified Updates
  </div>
  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
  Your Network <span className="text-primary-600">Pulse.</span>
  </h1>
  <p className="text-sm sm:text-lg text-gray-500 font-medium leading-relaxed">
  Real-time alerts on connection requests, messages, and investment milestones.
  </p>
  </div>
  
  <div className="w-full lg:w-[450px] flex gap-2 sm:gap-3">
  <Button 
  onClick={markAllAsRead} 
  variant="outline"
  fullWidth
  disabled={!notifications.some(n => !n.isRead)}
  className="bg-white border-gray-200 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm hover:shadow-sm transition-all flex items-center justify-center gap-2"
  >
  <CheckCircle2 size={16} /> Mark Read
  </Button>
  <Button 
  onClick={() => setIsClearModalOpen(true)} 
  variant="outline"
  fullWidth
  disabled={notifications.length === 0}
  className="bg-white border-red-100 text-red-600 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
  >
  <Trash2 size={16} /> Clear All
  </Button>
  </div>
  </div>
 </div>

 <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
 
 {/* Filter Pills */}
 <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-8">
 {filters.map(f => (
 <button
 key={f}
 onClick={() => setActiveFilter(f)}
 className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm ${
 activeFilter === f 
 ? 'bg-primary-600 text-white shadow-sm' 
 : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
 }`}
 >
 {f}
 </button>
 ))}
 </div>

 {/* Notifications List */}
 <div className="space-y-4">
 {isLoading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="animate-pulse bg-white/60 rounded-lg h-24 border border-white/40"></div>
 ))
 ) : filteredNotifications.length === 0 ? (
 <EmptyState 
    icon={Bell}
    title="Inbox Clear"
    description={`No ${activeFilter === 'All' ? 'notifications' : activeFilter.toLowerCase()} found in your records. We'll alert you when something happens!`}
    className="py-20"
  />
 ) : (
 filteredNotifications.map(notification => (
 <div
  key={notification._id}
  onClick={() => handleNotificationClick(notification)}
  className={`group relative flex items-start p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden border ${
  !notification.isRead 
  ? 'bg-white shadow-[0_10px_30px_rgb(37,99,235,0.06)] border-blue-50 hover:bg-white' 
  : 'bg-white border-gray-100 hover:bg-gray-50 grayscale-[0.2] hover:grayscale-0'
  }`}
  >
  {!notification.isRead && (
  <div className="absolute top-0 left-0 bottom-0 w-1 sm:w-1.5 bg-primary-600 shadow-[2px_0_10px_rgb(37,99,235,0.4)]" />
  )}
  
  <div className="relative mr-3 sm:mr-5 shrink-0">
  <Avatar
  src={notification.sender?.profile?.avatarUrl || notification.sender?.avatarUrl}
  alt={notification.sender?.name || 'Partner'}
  size="md"
  className="shadow-sm group-hover:scale-105 transition-transform"
  />
  <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-700">
  {getNotificationIcon(notification.type)}
  </div>
  </div>
  
  <div className="flex-1 min-w-0">
  <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
  <div className="flex items-center gap-2">
  <span className="text-sm sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate max-w-[150px] sm:max-w-none">
  {notification.sender?.name || 'Nexus System'}
  </span>
  {!notification.isRead && (
  <span className="bg-primary-600 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">New</span>
  )}
  </div>
  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
  <span className="text-[10px] sm:text-xs font-bold text-gray-400 whitespace-nowrap uppercase tracking-wider">
  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
  </span>
  <button 
  onClick={(e) => deleteNotification(e, notification._id)}
  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all sm:opacity-0 group-hover:opacity-100"
  >
  <X size={14} />
  </button>
  </div>
  </div>
  
  <p className="text-xs sm:text-[15px] leading-relaxed text-gray-600 mt-1 font-medium group-hover:text-gray-900 transition-colors line-clamp-2 sm:line-clamp-none">
  {notification.content}
  </p>
  </div>
  </div>
 ))
 )}
 </div>
 </div>

  {/* Custom Confirm Modal */}
  {isClearModalOpen && (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
     <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl scale-in">
       <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
         <Trash2 size={28} />
       </div>
       <div>
         <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Inbox?</h3>
         <p className="text-sm font-medium text-gray-500">Are you sure you want to delete all notifications? This action cannot be undone.</p>
       </div>
       <div className="flex gap-3 w-full pt-2">
         <Button onClick={() => setIsClearModalOpen(false)} variant="outline" fullWidth className="py-3 text-sm rounded-xl">Cancel</Button>
         <Button onClick={deleteAllNotifications} fullWidth className="py-3 text-sm rounded-xl bg-red-500 hover:bg-red-600 text-white border-none">Delete All</Button>
       </div>
     </div>
   </div>
  )}

  </div>
 );
};