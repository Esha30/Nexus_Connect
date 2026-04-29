import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, Clock, Search, FileText, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest, Investor } from '../../types';
import api from '../../api/api';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { PlanBadge } from '../../components/ui/PlanBadge';
import { AiAdvisor } from '../../components/dashboard/AiAdvisor';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<Investor[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalConnections: 0,
    upcomingMeetings: 0,
    profileViews: 0,
    assetCount: 0,
    synergyRate: 0,
    chartData: []
  });

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data?.stats) {
        setStats(prev => ({ ...prev, ...res.data.stats }));
      }
      setCollaborationRequests(res.data?.recentRequests || []);
      
      const activities = res.data.recentActivity || [];
      if (activities.length === 0) {
        setRecentActivities([
          { 
            _id: 'pulse-1', 
            action: 'SYSTEM_NEWS', 
            actor: { name: 'Nexus AI', role: 'system' }, 
            metadata: { message: 'Intelligence Protocol: 5 new investors in your sector just joined the platform.' },
            createdAt: new Date(Date.now() - 3600000).toISOString() 
          },
          { 
            _id: 'pulse-2', 
            action: 'SYSTEM_NEWS', 
            actor: { name: 'Capital Hub', role: 'system' }, 
            metadata: { message: 'Market Alert: Web3 seed funding activity up by 15% this quarter.' },
            createdAt: new Date(Date.now() - 86400000).toISOString() 
          }
        ]);
      } else {
        setRecentActivities(activities);
      }

      const investorsRes = await api.get('/auth/investors', { params: { limit: 3 } });
      setRecommendedInvestors(investorsRes.data.investors || []);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);
  
  const handleRequestStatusUpdate = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/collaborations/${requestId}/status`, { status });
      setCollaborationRequests(prevRequests => 
        prevRequests.map(req => {
          const reqId = req.id || (req as { _id?: string })._id;
          return reqId === requestId ? { ...req, status } : req;
        })
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  
  if (!user) return null;
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  
  const statCards = [
    { label: 'Pending Requests', value: stats.pendingRequests, icon: <Bell size={20} className="text-orange-500" />, bg: 'bg-orange-50' },
    { label: 'Total Connections', value: stats.totalConnections, icon: <Users size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Asset Vault', value: stats.assetCount, icon: <FileText size={20} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'AI Synergy Rate', value: stats.synergyRate ? `${stats.synergyRate}%` : '85%', icon: <Sparkles size={20} className="text-primary-500" />, bg: 'bg-primary-50' },
    { label: 'Upcoming Meetings', value: stats.upcomingMeetings, icon: <Calendar size={20} className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Recommended', value: recommendedInvestors.length, icon: <TrendingUp size={20} className="text-green-500" />, bg: 'bg-green-50' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            Welcome, {user.name}
            <PlanBadge plan={user.subscription?.plan} />
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">
              Here's what's happening with your startup today
            </p>
            <div className="h-4 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-1.5">
              {user.subscription?.plan === 'pro' || user.subscription?.plan === 'enterprise' ? (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                  <ShieldCheck size={12} />
                  Unlimited AI Analysis
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary-100">
                  <Zap size={12} />
                  3 / 10 AI Credits Used
                </div>
              )}
            </div>
          </div>
        </div>
        <Link to="/investors">
          <Button leftIcon={<Search size={16} />}>
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardBody className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-4 py-4 sm:py-5">
              <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bg} shrink-0`}>
                {stat.icon}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Meetings</h2>
              <Link to="/meetings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Calendar
              </Link>
            </CardHeader>
            <CardBody>
              {(stats?.upcomingMeetings ?? 0) > 0 ? (
                <p className="text-sm text-gray-600">You have {stats.upcomingMeetings} upcoming meetings.</p>
              ) : (
                <div className="text-center py-8">
                  <Clock size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No upcoming meetings scheduled</p>
                  <Link to="/meetings" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                    Schedule a meeting
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Collaboration Requests */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Active Inquiries</h2>
              <Badge variant={pendingRequests.length > 0 ? 'primary' : 'default'}>
                {pendingRequests.length} pending
              </Badge>
            </CardHeader>
            <CardBody>
              {pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id || (request as { _id?: string })._id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No pending inquiries</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            </CardHeader>
            <CardBody className="p-0 max-h-[350px] overflow-y-auto">
              <ActivityFeed activities={recentActivities} isLoading={isLoading} />
            </CardBody>
          </Card>
          
          {/* Recommended Investors */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Recommended Investors</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {recommendedInvestors.length > 0 ? (
                <>
                  {recommendedInvestors.slice(0, 3).map(investor => (
                    <InvestorCard key={investor.id || (investor as { _id?: string })._id} investor={investor} compact />
                  ))}
                  <Link to="/investors">
                    <Button variant="ghost" fullWidth size="sm" className="mt-2">
                      View all investors
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No recommendations yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
      <AiAdvisor />
    </div>
  );
};