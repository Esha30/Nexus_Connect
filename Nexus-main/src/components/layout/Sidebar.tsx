import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from '../../context/LanguageContext';
import { PlanBadge } from '../ui/PlanBadge';
import { 
  Home, Building2, CircleDollarSign, Users, MessageCircle, 
  Bell, FileText, Settings, HelpCircle, Calendar, ChevronRight, Mail as MailIcon 
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center group py-2 px-3 rounded-md text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-primary-50 text-primary-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`
      }
    >
      <div className="flex items-center flex-1">
        <span className="mr-3 flex-shrink-0">{icon}</span>
        <span>{text}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { totalUnreadCount } = useSocket();
  const { t } = useTranslation();
  
  if (!user) return null;
  
  const entrepreneurItems = [
    { to: '/dashboard/entrepreneur', icon: <Home size={18} />, text: t('nav.dashboard') },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={18} />, text: t('sidebar.my_startup') },
    { to: '/investors', icon: <CircleDollarSign size={18} />, text: t('sidebar.find_investors') },
    { to: '/messages', icon: <MessageCircle size={18} />, text: t('nav.messages') },
    { to: '/meetings', icon: <Calendar size={18} />, text: t('sidebar.meetings') },
    { to: '/notifications', icon: <Bell size={18} />, text: t('nav.notifications') },
    { to: '/documents', icon: <FileText size={18} />, text: t('sidebar.documents') },
  ];
  
  const investorItems = [
    { to: '/dashboard/investor', icon: <Home size={18} />, text: t('nav.dashboard') },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={18} />, text: t('sidebar.my_portfolio') },
    { to: '/entrepreneurs', icon: <Users size={18} />, text: t('sidebar.find_startups') },
    { to: '/messages', icon: <MessageCircle size={18} />, text: t('nav.messages') },
    { to: '/meetings', icon: <Calendar size={18} />, text: t('sidebar.meetings') },
    { to: '/notifications', icon: <Bell size={18} />, text: t('nav.notifications') },
    { to: '/deals', icon: <FileText size={18} />, text: t('sidebar.deals') },
    { to: '/documents', icon: <FileText size={18} />, text: t('sidebar.documents') },
  ];
  
  const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
  const commonItems = [
    { to: '/settings', icon: <Settings size={18} />, text: t('sidebar.settings') },
    { to: '/help', icon: <HelpCircle size={18} />, text: t('sidebar.help') },
    { to: '/contact', icon: <MailIcon size={18} />, text: t('sidebar.contact') },
  ];
  
  return (
    <div className="w-56 bg-white border-r border-gray-200 h-full hidden md:block flex-shrink-0">
      <div className="h-full flex flex-col">
        <div className="flex-1 py-4 overflow-y-auto hide-scrollbar">
          <div className="px-6 mb-6">
            <PlanBadge plan={user.subscription?.plan} className="scale-110" />
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-2 px-0.5">
              Current Access
            </p>
          </div>
          <div className="px-3 space-y-0.5">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                text={item.text}
                badge={item.text === t('nav.messages') ? totalUnreadCount : undefined}
              />
            ))}
          </div>
          
          <div className="mt-6 px-3">
            <p className="px-3 text-xs font-medium text-gray-400 mb-2">
              {t('sidebar.settings')}
            </p>
            <div className="space-y-0.5">
              {commonItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  text={item.text}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700">{t('sidebar.assistance')}</p>
            <p className="font-medium">{t('sidebar.support')}</p>
            <a href="mailto:nexus@support.com" className="text-primary-600 hover:underline mt-1 block">
              nexus@support.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};