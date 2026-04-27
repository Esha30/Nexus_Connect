import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, MessageCircle, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const BottomNavbar: React.FC = () => {
  const { user } = useAuth();
  const { totalUnreadCount, unreadNotificationsCount } = useSocket();

  if (!user) return null;

  const dashboardRoute = user.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor';
  const profileRoute = `/profile/${user.role}/${user.id}`;

  const navItems = [
    { to: dashboardRoute, icon: <Home size={22} />, label: 'Home' },
    { to: '/feed', icon: <LayoutGrid size={22} />, label: 'Feed' },
    { 
      to: '/messages', 
      icon: (
        <div className="relative">
          <MessageCircle size={22} />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </div>
      ), 
      label: 'Chat' 
    },
    { 
      to: '/notifications', 
      icon: (
        <div className="relative">
          <Bell size={22} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </div>
      ), 
      label: 'Alerts' 
    },
    { to: profileRoute, icon: <User size={22} />, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <div className="relative">
              {item.icon}
            </div>
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
