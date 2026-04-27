import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNavbar } from './BottomNavbar';
import { CopilotWidget } from '../ai/CopilotWidget';

export const DashboardLayout: React.FC = () => {
 const { isAuthenticated, isLoading } = useAuth();
 const location = useLocation();
 
 const isChatPage = location.pathname.startsWith('/messages');
 
 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
 </div>
 );
 }
 
 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }
 
  return (
  <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
  {/* Ethereal Gradient Overlay */}
  <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-multiply transition-opacity duration-1000">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-50 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
  </div>

  <Navbar />
  
  <div className="flex-1 flex overflow-hidden relative z-10">
  <Sidebar />
  
  <main className={`flex-1 ${isChatPage ? 'p-0 overflow-hidden' : 'overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-20 md:pb-8'} hide-scrollbar scroll-smooth`}>
  <div className={`${isChatPage ? 'max-w-none h-full' : 'max-w-7xl mx-auto'} animate-fade-in`}>
  <Outlet />
  </div>
  </main>
  </div>
  
  <BottomNavbar />
  <CopilotWidget />
  </div>
  );
};