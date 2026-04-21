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
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: {},
  totalUnreadCount: 0,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection with enhanced stability
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Prioritize polling for dev stability
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Announce online presence
      socket.emit('user-online', user.id);
      socket.emit('join-chat', user.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Meeting Notifications
    socket.on('new-meeting', (data: { title: string, senderName: string }) => {
      toast.success(`📅 New Meeting Request: "${data.title}" from ${data.senderName}`, {
        duration: 6000,
        icon: '🗓️'
      });
    });

    socket.on('meeting-updated', (data: { status: string, title: string, updatedBy: string }) => {
      const message = data.status === 'accepted' 
        ? `✅ Meeting Accepted: "${data.title}" by ${data.updatedBy}`
        : `❌ Meeting Declined: "${data.title}" by ${data.updatedBy}`;
      
      toast(message, {
        duration: 6000,
        icon: data.status === 'accepted' ? '🎉' : 'info'
      });
    });

    // Collaboration Notifications
    socket.on('new-collab', (data: { investorName: string }) => {
      toast.success(`🤝 New Collaboration Request from ${data.investorName}`, {
        duration: 6000,
        style: {
          background: '#4F46E5',
          color: '#fff',
        }
      });
    });

    socket.on('collab-updated', (data: { status: string, entrepreneurName: string }) => {
      if (data.status === 'accepted') {
        toast.success(`🚀 Collaboration accepted by ${data.entrepreneurName}!`, {
          duration: 8000,
        });
      }
    });

    // Listen for other users' status changes
    socket.on('user-status-change', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
    });

    // Listen for global messages
    socket.on('receive-message', (payload) => {
      setTotalUnreadCount(prev => prev + 1);
      
      // Toast notification if not on chat page
      if (!window.location.pathname.includes(`/chat/${payload.senderId}`)) {
        toast.success(`Message: ${payload.content.substring(0, 30)}${payload.content.length > 30 ? '...' : ''}`, {
          icon: '💬',
          duration: 4000
        });
      }
    });

    // Fetch initial unread count
    const fetchInitialUnread = async () => {
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
    fetchInitialUnread();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineUsers, totalUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
