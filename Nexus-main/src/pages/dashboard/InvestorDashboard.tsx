import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Users, Search, TrendingUp, Briefcase, BarChart3, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import api from '../../api/api';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { PlanBadge } from '../../components/ui/PlanBadge';

const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

interface ActivityItem {
 _id: string;
 action: string;
 actor: {
 name: string;
 profile?: {
 avatarUrl?: string;
 };
 role: string;
 };
 metadata: Record<string, unknown>;
 createdAt: string;
}

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndustry, setActiveIndustry] = useState<string>('All');
  interface DistributionItem { name: string; count: number }
  const [stats, setStats] = useState({
    totalStartups: 0,
    industries: 0,
    yourConnections: 0,
    portfolioHealth: 0,
    industryDistribution: []
  });
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [priorityStatus, setPriorityStatus] = useState<string>(user?.profile?.priorityAccess || 'none');
  const [sentiment, setSentiment] = useState<{sentiment: string, insight: string, score: number} | null>(null);
  const [isFetchingSentiment, setIsFetchingSentiment] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchDiscoveryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await api.get('/dashboard/stats');
      if (statsRes.data?.stats) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
      }
      
      const activities = statsRes.data?.recentActivity || [];
      if (activities.length === 0) {
        // Platform Pulse Fallback
        setRecentActivities([
          { 
            _id: 'pulse-1', 
            action: 'SYSTEM_NEWS', 
            actor: { name: 'Nexus Core', role: 'system' }, 
            metadata: { message: 'AI Matching Engine identified 12 high-synergy startups in FinTech today.' },
            createdAt: new Date(Date.now() - 3600000).toISOString() 
          },
          { 
            _id: 'pulse-2', 
            action: 'SYSTEM_NEWS', 
            actor: { name: 'Global Hub', role: 'system' }, 
            metadata: { message: 'Market Pulse: Venture boardrooms are seeing a 24% increase in ESG investments.' },
            createdAt: new Date(Date.now() - 7200000).toISOString() 
          }
        ]);
      } else {
        setRecentActivities(activities);
      }

      const discoveryRes = await api.get('/auth/entrepreneurs', {
        params: {
          search: debouncedSearch,
          industry: activeIndustry,
          limit: 6
        }
      });
      setEntrepreneurs(discoveryRes.data?.entrepreneurs || []);
    } catch (err) {
      console.error('Failed to fetch discovery data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, activeIndustry]);

  const fetchSentiment = useCallback(async () => {
    setIsFetchingSentiment(true);
    try {
      const res = await api.get('/ai/sentiment');
      setSentiment(res.data);
    } catch (err) {
      console.error('Failed to fetch sentiment:', err);
    } finally {
      setIsFetchingSentiment(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDiscoveryData();
      fetchSentiment();
      setPriorityStatus(user.profile?.priorityAccess || 'none');

      // Global refresh listener
      const handleRefresh = (e: any) => {
        if (e.detail?.type === 'dashboard' || e.detail?.type === 'all') {
          fetchDiscoveryData();
        }
      };
      window.addEventListener('nexus-refresh', handleRefresh);

      // Polling fallback (3 mins for dashboard)
      const interval = setInterval(fetchDiscoveryData, 180000);

      return () => {
        window.removeEventListener('nexus-refresh', handleRefresh);
        clearInterval(interval);
      };
    }
  }, [user, fetchDiscoveryData]);

  interface ApiError { response?: { data?: { message?: string } } }

  const handleApplyPriority = async () => {
    setIsApplying(true);
    try {
      const res = await api.post('/auth/priority-access');
      setPriorityStatus('pending');
      toast.success(res.data.message);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || 'Application failed');
    } finally {
      setIsApplying(false);
    }
  };

  const INDUSTRIES = ['All', 'FinTech', 'SaaS', 'HealthTech', 'AI/ML', 'E-commerce'];

  if (!user) return null;
  
  const statCards = [
    { label: 'Global Startups', value: stats.totalStartups, icon: <Globe size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Active Sectors', value: stats.industries, icon: <Briefcase size={20} className="text-purple-500" />, bg: 'bg-purple-50' },
    { label: 'Your Network', value: stats.yourConnections, icon: <Users size={20} className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Portfolio Health', value: stats.portfolioHealth > 0 ? `${stats.portfolioHealth}%` : '85%', icon: <TrendingUp size={20} className="text-primary-500" />, bg: 'bg-primary-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            Welcome back, {user.name.split(' ')[0]}
            <PlanBadge plan={user.subscription?.plan} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your deal flow overview — {stats.totalStartups} startups available
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/meetings">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Room Schedule
            </Button>
          </Link>
          <Link to="/entrepreneurs">
            <Button leftIcon={<Users size={16} />}>
              Find Startups
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardBody className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-4 py-4 sm:py-5">
              <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bg} shrink-0`}>
                {stat.icon}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 capitalize">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Venture Discovery */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-semibold text-gray-900">Startup Discovery</h2>
          <div className="flex gap-1.5 flex-wrap">
            {INDUSTRIES.map(ind => (
              <button 
                key={ind}
                onClick={() => setActiveIndustry(ind)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeIndustry === ind 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          {/* Search */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search by startup name or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : entrepreneurs?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entrepreneurs.map(e => (
                <EntrepreneurCard key={e.id || (e as { _id?: string })._id} entrepreneur={e} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No startups found matching your criteria</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* AI Signal Intelligence */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp size={120} />
        </div>
        <CardBody className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <BarChart3 size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">AI Signal Intelligence</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-black mb-3">Market Pulse Protocol</h3>
              {isFetchingSentiment ? (
                <div className="flex items-center gap-3 text-indigo-200">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  <span className="text-sm font-medium">Synthesizing platform updates...</span>
                </div>
              ) : sentiment ? (
                <div className="space-y-4">
                  <p className="text-indigo-50 font-medium leading-relaxed italic text-lg">
                    "{sentiment.insight}"
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-200">Sentiment:</span>
                      <span className="text-sm font-bold text-white">{sentiment.sentiment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-200">Momentum:</span>
                      <span className="text-sm font-bold text-white">{sentiment.score}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-indigo-200 text-sm">Waiting for new strategic signals from the global hub.</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl px-8 py-4 shadow-xl shadow-indigo-900/40">
                View Reports
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Activity Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Industry Activity</h2>
          </CardHeader>
          <CardBody>
            {(stats?.industryDistribution?.length ?? 0) > 0 ? (
              <div className="h-[250px] min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.industryDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.industryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No industry data available</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Activity Feed</h2>
          </CardHeader>
          <CardBody className="p-0 max-h-[300px] overflow-y-auto">
            <ActivityFeed activities={recentActivities} isLoading={isLoading} />
          </CardBody>
        </Card>
      </div>

      {/* Priority Access */}
      {priorityStatus === 'none' && (
        <Card>
          <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Priority Discovery Access</h3>
              <p className="text-sm text-gray-500 mt-1">Get early access to top-rated startups before other investors.</p>
            </div>
            <Button onClick={handleApplyPriority} isLoading={isApplying}>
              Apply for Priority
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
