import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Record<string, boolean>;
  totalUnreadCount: number;
  unreadNotificationsCount: number;
  refreshMessageCount: () => Promise<void>;
  refreshNotificationCount: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: {},
  totalUnreadCount: 0,
  unreadNotificationsCount: 0,
  refreshMessageCount: async () => {},
  refreshNotificationCount: async () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const fetchMessageCount = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const data = res.data;
      if (Array.isArray(data)) {
        interface Conversation { unreadCount?: number }
        const count = data.reduce((acc: number, conv: Conversation) => acc + (conv.unreadCount || 0), 0);
        setTotalUnreadCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch initial unread counts:", err);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const res = await api.get('/notifications/');
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadNotificationsCount(unread);
    } catch (err) {
      console.error('Failed to fetch unread notifications count:', err);
    }
  };

  // Listen to DOM event fired by NotificationsPage when it marks items as read or deletes them
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      fetchNotificationCount();
    };
    window.addEventListener('notifications-updated', handleNotificationsUpdated);
    return () => window.removeEventListener('notifications-updated', handleNotificationsUpdated);
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('user-online', user.id);
      socket.emit('join-chat', user.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time badge updates from socket
    socket.on('message-count-update', () => {
      fetchMessageCount();
    });

    socket.on('notification-count-update', () => {
      fetchNotificationCount();
    });

    // Listen for new notifications to increment count
    socket.on('new-notification', (data: any) => {
      setUnreadNotificationsCount(prev => prev + 1);
      
      // Keep existing toast logic for meetings/collabs
      if (data.type === 'meeting') {
        toast.success(`📅 New Meeting Request: "${data.title}" from ${data.senderName}`, {
          duration: 6000,
          icon: '🗓️'
        });
      } else if (data.type === 'collab') {
        toast.success(`🤝 New Collaboration Request from ${data.investorName}`, {
          duration: 6000,
          style: { background: '#4F46E5', color: '#fff' }
        });
      }
    });

    // Meeting Notifications (Legacy events if backend still emits them separately)
    socket.on('new-meeting', (data: { title: string, senderName: string }) => {
      fetchNotificationCount(); // Sync count
      toast.success(`📅 New Meeting Request: "${data.title}" from ${data.senderName}`, {
        duration: 6000,
        icon: '🗓️'
      });
    });

    socket.on('meeting-updated', (data: { status: string, title: string, updatedBy: string }) => {
      fetchNotificationCount(); // Sync count
      const message = data.status === 'accepted' 
        ? `✅ Meeting Accepted: "${data.title}" by ${data.updatedBy}`
        : `❌ Meeting Declined: "${data.title}" by ${data.updatedBy}`;
      
      toast(message, {
        duration: 6000,
        icon: data.status === 'accepted' ? '🎉' : 'info'
      });
    });

    socket.on('new-collab', (data: { investorName: string }) => {
      fetchNotificationCount(); // Sync count
      toast.success(`🤝 New Collaboration Request from ${data.investorName}`, {
        duration: 6000,
        style: { background: '#4F46E5', color: '#fff' }
      });
    });

    socket.on('collab-updated', (data: { status: string, entrepreneurName: string }) => {
      fetchNotificationCount(); // Sync count
      if (data.status === 'accepted') {
        toast.success(`🚀 Collaboration accepted by ${data.entrepreneurName}!`, {
          duration: 8000,
        });
      }
    });

    socket.on('user-status-change', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
    });

    socket.on('receive-message', (payload) => {
      const isInChat = window.location.pathname.includes(`/messages/${payload.senderId}`);
      if (!isInChat) {
        // User is NOT in the chat — show badge + toast
        setTotalUnreadCount(prev => prev + 1);
        toast.success(`Message: ${payload.content.substring(0, 30)}${payload.content.length > 30 ? '...' : ''}`, {
          icon: '💬',
          duration: 4000
        });
      }
      // Always re-sync notification count in case a notification was created
      fetchNotificationCount();
    });

    // Initial fetch
    fetchMessageCount();
    fetchNotificationCount();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      isConnected, 
      onlineUsers, 
      totalUnreadCount, 
      unreadNotificationsCount,
      refreshMessageCount: fetchMessageCount,
      refreshNotificationCount: fetchNotificationCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
