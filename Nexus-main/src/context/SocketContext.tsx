import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/api';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://nexus-backend-iini.onrender.com';

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
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      transports: ['websocket', 'polling']
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
      
      const isMeeting = data.type === 'meeting';
      const isCollab = data.type === 'collab';

      if (isMeeting || isCollab) {
        toast((t) => (
          <div className="flex flex-col gap-2 p-1 min-w-[250px]">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              {isMeeting ? '📅' : '🤝'} 
              <span className="truncate max-w-[200px]">
                {isMeeting ? `Meeting: ${data.title}` : `Collab Request from ${data.investorName || data.senderName}`}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isMeeting ? `From ${data.senderName}` : `Wants to collaborate on your venture`}
            </p>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = isMeeting ? '/meetings' : '/notifications';
                }}
                className="flex-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                View
              </button>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ), { 
          duration: 8000,
          position: 'top-right',
          style: {
            borderRadius: '16px',
            border: '1px solid #f3f4f6',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }
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

    socket.on('refresh-data', (payload: { type: string }) => {
      window.dispatchEvent(new CustomEvent('nexus-refresh', { detail: payload }));
      if (payload.type === 'notification' || payload.type === 'all') fetchNotificationCount();
      if (payload.type === 'message' || payload.type === 'all') fetchMessageCount();
    });

    // Initial fetch
    fetchMessageCount();
    fetchNotificationCount();

    // Polling fallback for high-integrity data
    const interval = setInterval(() => {
      fetchMessageCount();
      fetchNotificationCount();
    }, 2000);

    return () => {
      clearInterval(interval);
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
