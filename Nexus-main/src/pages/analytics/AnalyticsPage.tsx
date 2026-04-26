import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  Activity, Eye, Users, TrendingUp, Presentation, 
  Zap, Brain, Target, ShieldCheck, Globe
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const PIE_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const synergyDistribution = [
    { name: 'High Synergy', value: 45 },
    { name: 'Moderate', value: 30 },
    { name: 'Low', value: 15 },
    { name: 'Emerging', value: 10 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
      } catch {
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synthesizing Telemetry...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen pb-20 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16 bg-gray-50/50">
      {/* Hero Header */}
      <div className="relative pt-16 pb-28 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
        <div className="absolute -top-40 -left-60 w-96 h-96 bg-primary-400/10 rounded-full pointer-events-none blur-3xl" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-purple-400/10 rounded-full pointer-events-none blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-100">
            <Activity size={12} /> Quantum Telemetry Engine
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Intelligence.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
            Real-time high-fidelity insights and growth protocols for your venture activity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 -mt-12 relative z-20 space-y-8">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Connections', value: stats.totalConnections || stats.yourConnections || 0, icon: <Users size={20} />, color: 'blue', trend: '+14%' },
            { label: 'Upcoming Meetings', value: stats.upcomingMeetings || 0, icon: <Presentation size={20} />, color: 'emerald', trend: '+2' },
            { label: 'Profile Visibility', value: stats.profileViews || 0, icon: <Eye size={20} />, color: 'purple', trend: '+28%' },
            { label: 'Synergy Velocity', value: 'A+', icon: <TrendingUp size={20} />, color: 'orange', trend: 'OPTIMAL' },
          ].map((kpi, i) => (
            <Card key={i} className="shadow-sm border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl`}>{kpi.icon}</div>
                  <Badge className="bg-emerald-50 text-emerald-600 text-[10px] font-bold border-none">{kpi.trend}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900">{kpi.value}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart 1: Activity over time */}
          <Card className="lg:col-span-2 shadow-sm border border-gray-100 overflow-hidden bg-white rounded-2xl">
            <CardHeader className="bg-gray-50/30 border-b border-gray-100 py-5 px-8 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Activity size={16} className="text-primary-600" /> 7-Day Engagement Matrix
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Sync</span>
              </div>
            </CardHeader>
            <CardBody className="p-8 h-[350px]">
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                      itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium italic text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  Insufficient timeline data currently available.
                </div>
              )}
            </CardBody>
          </Card>

          {/* Chart 2: Synergy Distribution */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden bg-white rounded-2xl">
            <CardHeader className="bg-gray-50/30 border-b border-gray-100 py-5 px-8">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Brain size={16} className="text-purple-600" /> Synergy Pulse
              </h3>
            </CardHeader>
            <CardBody className="p-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={synergyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {synergyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

        </div>

        {/* Predictive Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-2xl h-full">
              <CardBody className="p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400 border border-primary-500/30">
                      <Zap size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">Predictive Alpha</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 leading-tight">Growth Projection Protocol</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Based on current engagement velocity, your ecosystem synergy is projected to increase by <span className="text-emerald-400 font-bold">24%</span> over the next protocol cycle.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Investor Sentiment', value: 88 },
                      { label: 'Network Stability', value: 94 },
                      { label: 'Capital Velocity', value: 72 },
                    ].map((m, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span>{m.label}</span>
                          <span>{m.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="mt-10 bg-white text-gray-900 hover:bg-gray-100 font-black rounded-xl py-4 shadow-xl shadow-black/20" fullWidth>
                  Execute Scale Protocol
                </Button>
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-100 shadow-sm hover:border-primary-200 transition-all">
              <CardBody className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Target size={24}/></div>
                  <h4 className="font-black text-gray-900 uppercase tracking-tight">Active Verticals</h4>
                </div>
                <div className="space-y-6">
                  {stats.industryDistribution && stats.industryDistribution.length > 0 ? (
                    stats.industryDistribution.slice(0, 4).map((ind: { name: string, count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                          <span className="text-sm font-bold text-gray-700">{ind.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-400">{ind.count} Assets</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-50 italic text-sm">Waiting for sector distribution data...</div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white border-gray-100 shadow-sm hover:border-purple-200 transition-all">
              <CardBody className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><ShieldCheck size={24}/></div>
                  <h4 className="font-black text-gray-900 uppercase tracking-tight">Trust Protocol</h4>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'KYC Compliance', status: 'Verified', color: 'emerald' },
                    { label: 'Asset Encryption', status: 'Active', color: 'blue' },
                    { label: 'Smart Contract', status: 'Deployed', color: 'purple' },
                    { label: 'Identity Sync', status: 'Syncing', color: 'orange' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">{p.label}</span>
                      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase text-${p.color}-600 bg-${p.color}-50 px-2 py-0.5 rounded-full border border-${p.color}-100`}>
                        {p.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Global Hub Map Section */}
        <Card className="bg-white border-gray-100 shadow-sm overflow-hidden rounded-3xl">
          <CardBody className="p-0 flex flex-col md:flex-row h-80">
            <div className="p-10 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-primary-600 mb-4 font-black uppercase tracking-widest text-xs">
                <Globe size={16} /> Global Connectivity
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Expanding Network.</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Your venture ecosystem is reaching nodes across <span className="text-gray-900 font-bold">12 geographic hubs</span>. International synergy is at an all-time high.
              </p>
              <div className="mt-8 flex gap-6">
                <div>
                  <p className="text-2xl font-black text-gray-900">14</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Hubs</p>
                </div>
                <div className="w-[1px] bg-gray-100" />
                <div>
                  <p className="text-2xl font-black text-gray-900">42%</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intl. Flow</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-gray-50 flex items-center justify-center border-l border-gray-100 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-purple-600/5 group-hover:opacity-0 transition-opacity" />
              <div className="relative text-center">
                <Globe size={120} className="text-gray-200 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-600 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
