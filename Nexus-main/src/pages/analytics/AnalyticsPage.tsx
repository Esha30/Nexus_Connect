import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Eye, Users, TrendingUp, Presentation, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#4F46E5', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
      } catch (err) {
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen pb-20 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16 bg-gray-50">
      {/* Hero Header */}
      <div className="relative pt-12 pb-24 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
        <div className="absolute -top-40 -left-60 w-96 h-96 bg-primary-400/20 rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium mb-6">
            <Activity size={14} /> Telemetry & Data
          </div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
            Operations <span className="text-primary-600">Analytics.</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
            Real-time insights and growth metrics for your platform activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 -mt-8 relative z-20 space-y-6">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm border border-gray-100 bg-white hover:shadow-md transition">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Connections</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalConnections || stats.yourConnections || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm border border-gray-100 bg-white hover:shadow-md transition">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upcoming Meetings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcomingMeetings || 0}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Presentation size={20} /></div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm border border-gray-100 bg-white hover:shadow-md transition">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile Views</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.profileViews || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Eye size={20} /></div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm border border-gray-100 bg-white hover:shadow-md transition">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Velocity Score</p>
                  <p className="text-3xl font-bold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500">A+</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={20} /></div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Chart 1: Activity over time */}
          <Card className="shadow-sm border border-gray-100 h-96 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6">
              <h3 className="text-sm font-semibold text-gray-900">7-Day Engagement Trend</h3>
            </CardHeader>
            <CardBody className="p-6 h-[calc(100%-60px)]">
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium italic text-sm">
                  Insufficient timeline data currently available.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Chart 2: Industries (for investors) or generic breakdown */}
          <Card className="shadow-sm border border-gray-100 h-96 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-6">
              <h3 className="text-sm font-semibold text-gray-900">
                {user?.role === 'investor' ? 'Industry Distribution' : 'Action Distribution'}
              </h3>
            </CardHeader>
            <CardBody className="p-6 h-[calc(100%-60px)]">
              {stats.industryDistribution && stats.industryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.industryDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.industryDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                   <Briefcase size={32} className="mb-2 text-gray-300" />
                   <p className="font-medium italic text-sm">No distribution sector data to display.</p>
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
};
