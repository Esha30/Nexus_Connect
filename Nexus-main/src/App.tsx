import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
import { Toaster } from 'react-hot-toast';


// Dashboard Pages
const EntrepreneurDashboard = lazy(() => import('./pages/dashboard/EntrepreneurDashboard').then(m => ({ default: m.EntrepreneurDashboard })));
const InvestorDashboard = lazy(() => import('./pages/dashboard/InvestorDashboard').then(m => ({ default: m.InvestorDashboard })));

// Profile Pages
const EntrepreneurProfile = lazy(() => import('./pages/profile/EntrepreneurProfile').then(m => ({ default: m.EntrepreneurProfile })));
const InvestorProfile = lazy(() => import('./pages/profile/InvestorProfile').then(m => ({ default: m.InvestorProfile })));

// Feature Pages
const InvestorsPage = lazy(() => import('./pages/investors/InvestorsPage').then(m => ({ default: m.InvestorsPage })));
const EntrepreneursPage = lazy(() => import('./pages/entrepreneurs/EntrepreneursPage').then(m => ({ default: m.EntrepreneursPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const HelpPage = lazy(() => import('./pages/help/HelpPage').then(m => ({ default: m.HelpPage })));
const DocumentationPage = lazy(() => import('./pages/help/DocumentationPage').then(m => ({ default: m.DocumentationPage })));
const MeetingRoomPage = lazy(() => import('./pages/meeting/MeetingRoomPage').then(m => ({ default: m.MeetingRoomPage })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ContactPage = lazy(() => import('./pages/help/ContactPage').then(m => ({ default: m.ContactPage })));
const DealsPage = lazy(() => import('./pages/deals/DealsPage').then(m => ({ default: m.DealsPage })));
const MeetingsPage = lazy(() => import('./pages/meetings/MeetingsPage').then(m => ({ default: m.MeetingsPage })));
const FeedPage = lazy(() => import('./pages/feed/FeedPage').then(m => ({ default: m.FeedPage })));

// Chat Page (Unified Messages)
const ChatPage = lazy(() => import('./pages/chat/ChatPage').then(m => ({ default: m.ChatPage })));

// Admin Page
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Billing Pages
const PricingPage = lazy(() => import('./pages/billing/PricingPage').then(m => ({ default: m.PricingPage })));
const SuccessPage = lazy(() => import('./pages/billing/SuccessPage').then(m => ({ default: m.SuccessPage })));
const CancelPage = lazy(() => import('./pages/billing/CancelPage').then(m => ({ default: m.CancelPage })));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
            <SocketProvider>
            <ErrorBoundary>
              <Toaster position="top-right" />
              <Router future={{ 
                v7_startTransition: true, 
                v7_relativeSplatPath: true,
                v7_fetcherPersist: true,
                v7_normalizeFormMethod: true,
                v7_partialHydration: true,
                v7_skipActionErrorRevalidation: true
              }}>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
                <Routes>
                  {/* Authentication Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
                    <Route path="investor" element={<InvestorDashboard />} />
                  </Route>
                  
                  {/* Profile Routes */}
                  <Route path="/profile" element={<DashboardLayout />}>
                    <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
                    <Route path="investor/:id" element={<InvestorProfile />} />
                  </Route>
                  
                  {/* Feature Routes */}
                  <Route path="/investors" element={<DashboardLayout />}>
                    <Route index element={<InvestorsPage />} />
                  </Route>
                  
                  {/* Entrepreneurs Route */}
                  <Route path="/entrepreneurs" element={<DashboardLayout />}>
                    <Route index element={<EntrepreneursPage />} />
                  </Route>
                  
                  {/* Unified Messages */}
                  <Route path="/messages" element={<DashboardLayout />}>
                    <Route index element={<ChatPage />} />
                    <Route path=":userId" element={<ChatPage />} />
                  </Route>
                  
                  {/* Other routes unchanged */}
                  <Route path="/meetings" element={<DashboardLayout />}>
                    <Route index element={<MeetingsPage />} />
                  </Route>
                  
                  <Route path="/notifications" element={<DashboardLayout />}>
                    <Route index element={<NotificationsPage />} />
                  </Route>
                  
                  <Route path="/documents" element={<DashboardLayout />}>
                    <Route index element={<DocumentsPage />} />
                  </Route>
                  
                  <Route path="/settings" element={<DashboardLayout />}>
                    <Route index element={<SettingsPage />} />
                  </Route>
                  
                  <Route path="/billing/success" element={<DashboardLayout />}>
                    <Route index element={<SuccessPage />} />
                  </Route>
    
                  <Route path="/billing/cancel" element={<DashboardLayout />}>
                    <Route index element={<CancelPage />} />
                  </Route>
                  
                  <Route path="/help" element={<DashboardLayout />}>
                    <Route index element={<HelpPage />} />
                    <Route path="docs" element={<DocumentationPage />} />
                  </Route>
    
                  <Route path="/contact" element={<DashboardLayout />}>
                    <Route index element={<ContactPage />} />
                  </Route>
                  
                  <Route path="/deals" element={<DashboardLayout />}>
                    <Route index element={<DealsPage />} />
                  </Route>
    
                  <Route path="/analytics" element={<DashboardLayout />}>
                    <Route index element={<AnalyticsPage />} />
                  </Route>

                  <Route path="/feed" element={<DashboardLayout />}>
                    <Route index element={<FeedPage />} />
                  </Route>
                  
                  <Route path="/admin" element={<DashboardLayout />}>
                    <Route index element={<AdminDashboard />} />
                  </Route>
    
                  <Route path="/pricing" element={<DashboardLayout />}>
                    <Route index element={<PricingPage />} />
                  </Route>
                  
                  {/* Chat Routes (Removed in favor of unified /messages route) */}
    
                  <Route path="/meeting/:meetingId" element={<MeetingRoomPage />} />
                  
                  {/* Redirect root to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  
                  {/* Catch all other routes and redirect to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
                </Suspense>
              </Router>
            </ErrorBoundary>
          </SocketProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;