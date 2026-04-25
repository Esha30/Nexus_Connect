import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bell, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from '../../context/LanguageContext';
import { Avatar } from '../ui/Avatar';
import { PlanBadge } from '../ui/PlanBadge';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Notification } from '../../types';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadNotificationsCount: unreadNotifications } = useSocket();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const dashboardRoute = user?.role === 'entrepreneur' 
    ? '/dashboard/entrepreneur' 
    : '/dashboard/investor';
  
  const profileRoute = user 
    ? `/profile/${user.role}/${user.id}` 
    : '/login';
  
  const desktopNavLinks = [
    { icon: <span className="mr-1.5">🏠</span>, text: t('nav.dashboard'), path: dashboardRoute },
    { icon: <MessageCircle size={16} className="mr-1.5" />, text: t('nav.messages'), path: user ? '/messages' : '/login' },
    {
      icon: (
        <span className="relative mr-1.5">
          <Bell size={16} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </span>
      ),
      text: t('nav.notifications'),
      path: user ? '/notifications' : '/login',
    },
    { icon: <User size={16} className="mr-1.5" />, text: t('nav.profile'), path: profileRoute },
  ];

  const getMobileNavLinks = () => {
    if (!user) return [];
    if (user.role === 'entrepreneur') {
      return [
        { text: t('nav.dashboard'), path: '/dashboard/entrepreneur' },
        { text: t('sidebar.my_startup'), path: '/profile/entrepreneur/' + user.id },
        { text: t('sidebar.find_investors'), path: '/investors' },
        { text: t('nav.messages'), path: '/messages' },
        { text: t('sidebar.meetings'), path: '/meetings' },
        { text: t('nav.notifications'), path: '/notifications' },
        { text: t('sidebar.documents'), path: '/documents' },
      ];
    }
    return [
      { text: t('nav.dashboard'), path: '/dashboard/investor' },
      { text: t('sidebar.my_portfolio'), path: '/profile/investor/' + user.id },
      { text: t('sidebar.find_startups'), path: '/entrepreneurs' },
      { text: t('nav.messages'), path: '/messages' },
      { text: t('sidebar.meetings'), path: '/meetings' },
      { text: t('nav.notifications'), path: '/notifications' },
      { text: t('sidebar.deals'), path: '/deals' },
    ];
  };

  const mobileNavLinks = getMobileNavLinks();
  
  return (
    <nav className="glass-surface sticky top-0 z-50 transition-all duration-500">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <img src="/logo.png" alt="Nexus Logo" className="h-full object-contain scale-125" />
              </div>
            </Link>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {user ? (
              <>
                {desktopNavLinks.map((link, index) => {
                  const isActive = window.location.pathname.startsWith(link.path.split('/').slice(0, 3).join('/'));
                  return (
                    <Link
                      key={index}
                      to={link.path}
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'text-primary-900 bg-primary-100/50 shadow-inner' 
                          : 'text-primary-500 hover:text-primary-900 hover:bg-white/50'
                      }`}
                    >
                      {link.icon}
                      {link.text}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LogOut size={16} className="mr-1.5" />
                  {t('common.logout')}
                </button>
                
                <div className="h-6 w-px bg-gray-200 mx-2" />
                
                <Link to={profileRoute} className="flex items-center space-x-3 pl-2 group">
                  <div className="ring-2 ring-primary-100 ring-offset-2 rounded-full group-hover:ring-primary-300 transition-all">
                    <Avatar
                      src={user.avatarUrl || user.profile?.avatarUrl}
                      alt={user.name}
                      size="sm"
                    />
                  </div>
                   <div className="flex flex-col items-start leading-none gap-1">
                    <span className="text-sm font-bold text-primary-900">{user.name}</span>
                    <PlanBadge plan={user.subscription?.plan} />
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors">
                  {t('common.signup')}
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-3 mb-2">
                  <Avatar src={user.avatarUrl || user.profile?.avatarUrl} alt={user.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      <PlanBadge plan={user.subscription?.plan} />
                    </div>
                  </div>
                </div>
                
                {mobileNavLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.text}
                  </Link>
                ))}
                
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={16} className="mr-1.5" />
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3 py-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
                  {t('common.login')}
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center text-sm font-medium text-white bg-primary-600 rounded-lg py-2 hover:bg-primary-700">
                  {t('common.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};