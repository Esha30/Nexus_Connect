import React, { useState, useEffect } from 'react';
import {
  Shield, Ticket, UserCheck, CheckCircle2, Users, LayoutGrid,
  BarChart3, Trash2, Mail, ExternalLink, AlertCircle, TrendingUp,
  Briefcase, Activity, Clock, Search, Settings, History, Ban,
  ToggleLeft, Save, Globe, Cpu, Database
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

import { UserDetailsModal } from '../../components/admin/UserDetailsModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

type AdminTab = 'overview' | 'users' | 'posts' | 'support' | 'priority' | 'reports' | 'settings' | 'logs';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [pendingInvestors, setPendingInvestors] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, postsRes, ticketsRes, priorityRes, settingsRes, logsRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
        api.get('/admin/tickets'),
        api.get('/admin/priority'),
        api.get('/admin/settings'),
        api.get('/admin/logs'),
        api.get('/admin/reports')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setTickets(ticketsRes.data);
      setPendingInvestors(priorityRes.data);
      setSystemSettings(settingsRes.data);
      setAuditLogs(logsRes.data);
      setReports(reportsRes.data);
    } catch (err) {
      toast.error('System failure: Could not retrieve secure data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (id: string, updates: any) => {
    try {
      const res = await api.put(`/admin/users/${id}/status`, updates);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...res.data } : u));
      toast.success('User protocol updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const saveSettings = async (newSettings: any) => {
    setIsSaving(true);
    try {
      const res = await api.put('/admin/settings', newSettings);
      setSystemSettings(res.data);
      toast.success('System parameters reconfigured');
    } catch (err) {
      toast.error('Configuration failed');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete User Node',
      message: 'PERMANENT DELETION: This action will purge the user and all associated data. Are you sure you want to terminate this entity?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${id}`);
          setUsers(prev => prev.filter(u => u._id !== id));
          toast.success('User protocol terminated');
        } catch (err) {
          toast.error('Termination failed');
        }
      }
    });
  };

  const deletePost = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Remove Content',
      message: 'Are you sure you want to remove this broadcast? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/posts/${id}`);
          setPosts(prev => prev.filter(p => p._id !== id));
          toast.success('Broadcast removed');
        } catch (err) {
          toast.error('Moderation failed');
        }
      }
    });
  };

  const resolveTicket = async (id: string) => {
    try {
      await api.put(`/admin/tickets/${id}`);
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status: 'resolved' } : t));
      toast.success('Ticket marked as resolved');
    } catch (err) {
      toast.error('Failed to resolve ticket');
    }
  };

  const deleteReport = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Resolve Report',
      message: 'Mark this report as resolved? This will remove it from the active report stream.',
      variant: 'primary',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/reports/${id}`);
          setReports(prev => prev.filter(r => r._id !== id));
          toast.success('Report resolved');
        } catch (err) {
          toast.error('Failed to resolve report');
        }
      }
    });
  };

  const approvePriority = async (id: string) => {
    try {
      await api.put(`/admin/priority/${id}`);
      setPendingInvestors(prev => prev.filter(u => u._id !== id));
      toast.success('Investor priority access approved');
    } catch (err) {
      toast.error('Failed to approve investor');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Shield size={64} className="text-red-600 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-gray-900 mb-2">ACCESS DENIED</h2>
        <p className="text-gray-500 font-medium">Administrator level clearance required to access the core console.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 -mt-6 -mx-6 sm:-mx-10 lg:-mx-16 bg-[#0B0F1A]">
      {/* Header Area */}
      <div className="bg-gradient-to-b from-[#161B2C] to-[#0B0F1A] pt-16 pb-20 px-6 sm:px-10 lg:px-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                  <Shield size={20} />
                </div>
                <Badge className="bg-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 border border-red-500/30">
                  Superuser Status
                </Badge>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Omnipotent Console</h1>
              <p className="text-gray-400 font-medium text-lg">System-wide governance and ecosystem intelligence.</p>
            </div>

            <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
              {[
                { id: 'overview', icon: <BarChart3 size={18} />, label: 'Overview' },
                { id: 'users', icon: <Users size={18} />, label: 'Users' },
                { id: 'posts', icon: <LayoutGrid size={18} />, label: 'Broadcasts' },
                { id: 'support', icon: <Ticket size={18} />, label: 'Support' },
                { id: 'priority', icon: <UserCheck size={18} />, label: 'Priority' },
                { id: 'reports', icon: <AlertCircle size={18} />, label: 'Reports' },
                { id: 'settings', icon: <Settings size={18} />, label: 'System' },
                { id: 'logs', icon: <History size={18} />, label: 'Audit' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 -mt-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 border-4 border-white/5 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Synchronizing Core Data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* System Pulse Indicator */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">System Pulse</span>
                    <span className="text-xs font-bold text-emerald-400">NOMINAL • 0.42ms Latency</span>
                  </div>
                  <div className="ml-auto flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Throughput</p>
                      <p className="text-xs font-bold text-white">8.4 GB/s</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Uptime</p>
                      <p className="text-xs font-bold text-white">99.99%</p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Entities', subLabel: 'Total Users', value: stats?.users.total, icon: <Users />, color: 'blue' },
                    { label: 'Startup Nodes', subLabel: 'Entrepreneurs', value: stats?.users.entrepreneurs, icon: <Briefcase />, color: 'emerald' },
                    { label: 'Capital Nodes', subLabel: 'Investors', value: stats?.users.investors, icon: <TrendingUp />, color: 'purple' },
                    { label: 'Broadcast Volume', subLabel: 'Total Posts', value: stats?.content.posts, icon: <Activity />, color: 'orange' }
                  ].map((stat, i) => (
                    <Card key={i} className="bg-[#161B2C] border-white/5 hover:border-white/10 transition-all group overflow-hidden shadow-2xl">
                      <CardBody className="p-6 relative">
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 text-${stat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity transform rotate-12`}>
                          {React.cloneElement(stat.icon as React.ReactElement, { size: 96 })}
                        </div>
                        <div className="mb-4">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter -mt-0.5">{stat.subLabel}</p>
                        </div>
                        <div className="flex items-end gap-3">
                          <h3 className="text-4xl font-black text-white leading-none">{stat.value}</h3>
                          <span className="text-emerald-400 text-xs font-bold mb-1">+12%</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* System Activity Chart */}
                  <Card className="lg:col-span-2 bg-[#161B2C] border-white/5 p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 leading-none">
                          <TrendingUp size={20} className="text-primary-500" /> Velocity Matrix
                        </h3>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 ml-7">System Growth Protocol</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-primary-500/10 text-primary-400 border-primary-500/20">7D</Badge>
                        <Badge className="bg-white/5 text-gray-500 border-white/10">30D</Badge>
                      </div>
                    </div>
                    <div className="h-[300px] min-h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.analytics}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                          <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Recent Signals Sidebar */}
                  <div className="space-y-6">
                    <Card className="bg-[#161B2C] border-white/5 p-8 shadow-2xl">
                      <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 leading-none">
                          <Activity size={18} className="text-primary-500" /> Recent Signals
                        </h3>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 ml-6">Live Activity Stream</span>
                      </div>
                      <div className="space-y-5">
                        {users.slice(0, 4).map((u, i) => (
                          <div key={i} className="flex items-center gap-3 group">
                            <Avatar src={u.profile?.avatarUrl} size="sm" className="ring-2 ring-white/5 group-hover:ring-primary-500/50 transition-all" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{u.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black">New {u.role} joined</p>
                            </div>
                            <span className="ml-auto text-[9px] font-bold text-gray-600">NOW</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" fullWidth className="mt-8 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white" onClick={() => setActiveTab('users')}>
                        View All Entities
                      </Button>
                    </Card>

                    <Card className="bg-primary-600 border-none p-8 shadow-2xl shadow-primary-600/20">
                      <h3 className="text-lg font-black text-white mb-2 leading-tight">Quantum Shield Active</h3>
                      <p className="text-primary-100 text-xs font-medium leading-relaxed mb-6">All system nodes are currently protected by multi-layer encryption protocols.</p>
                      <div className="flex items-center gap-2 text-white/80">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol 100%</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#161B2C] p-6 rounded-3xl border border-white/5">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Badge className="bg-primary-500/10 text-primary-400 py-2 px-4 border border-primary-500/20">{filteredUsers.length} Users Listed</Badge>
                  </div>
                </div>

                <Card className="bg-[#161B2C] border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Details</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role & Status</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Joined</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <Avatar src={u.profile?.avatarUrl} alt={u.name} size="md" />
                                <div>
                                  <p className="text-white font-bold">{u.name}</p>
                                  <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${u.role === 'investor' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} uppercase text-[9px] px-2`}>
                                    {u.role}
                                  </Badge>
                                  {u.profile?.isVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                    {u.subscription?.plan || 'Free'} Plan
                                  </p>
                                  {u.status === 'suspended' && (
                                    <Badge className="bg-red-500/20 text-red-500 border-red-500/20 uppercase text-[8px] px-1.5">Suspended</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-gray-400 font-medium">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-primary-400 hover:text-primary-300 p-2"
                                  onClick={() => {
                                    setSelectedUserId(u._id);
                                    setShowUserModal(true);
                                  }}
                                >
                                  <ExternalLink size={18} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`${u.status === 'suspended' ? 'text-emerald-400' : 'text-orange-400'} p-2`}
                                  onClick={() => updateUserStatus(u._id, { status: u.status === 'suspended' ? 'active' : 'suspended' })}
                                >
                                  {u.status === 'suspended' ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                                  onClick={() => deleteUser(u._id)}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.length === 0 ? (
                    <div className="col-span-full text-center py-32 text-gray-500 font-bold uppercase tracking-widest">Ecosystem broadcast feed empty</div>
                  ) : (
                    posts.map((post) => (
                      <Card key={post._id} className="bg-[#161B2C] border-white/5 p-6 hover:border-white/10 transition-all flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={post.author?.profile?.avatarUrl} alt={post.author?.name} size="sm" />
                            <div>
                              <p className="text-xs font-bold text-white leading-none">{post.author?.name}</p>
                              <p className="text-[9px] text-gray-500 uppercase font-black mt-0.5">{post.author?.role}</p>
                            </div>
                          </div>
                          <button onClick={() => deletePost(post._id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                              <TrendingUp size={12} className="text-emerald-500" /> {post.likes?.length || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                              <Mail size={12} /> {post.comments?.length || 0}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tickets.length === 0 ? (
                  <div className="text-center py-32 text-gray-500 font-bold uppercase tracking-widest">All protocols nominal. No open tickets.</div>
                ) : (
                  tickets.map((ticket) => (
                    <Card key={ticket._id} className="bg-[#161B2C] border-white/5 p-8 overflow-hidden group relative">
                      <div className={`absolute top-0 right-0 w-2 h-full ${ticket.status === 'resolved' ? 'bg-emerald-500' : 'bg-primary-500'}`} />
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <Badge className={`${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'} uppercase text-[10px] px-3 py-1 font-black`}>
                              {ticket.status}
                            </Badge>
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest font-mono">{ticket.ticketId}</span>
                            <span className="text-xs text-gray-500 font-bold">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{ticket.name}</h3>
                          <a href={`mailto:${ticket.email}`} className="text-sm font-bold text-primary-400 hover:underline mb-6 block w-fit">
                            {ticket.email}
                          </a>
                          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
                            <p className="text-gray-300 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{ticket.message}</p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-end min-w-[200px]">
                          {ticket.status !== 'resolved' && (
                            <Button
                              onClick={() => resolveTicket(ticket._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                              fullWidth
                              leftIcon={<CheckCircle2 size={20} />}
                            >
                              Resolve Issue
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {reports.length === 0 ? (
                  <div className="text-center py-32 text-gray-500 font-bold uppercase tracking-widest">No active user reports detected.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report) => (
                      <Card key={report._id} className="bg-[#161B2C] border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" />

                        <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertCircle size={20} />
                              </div>
                              <div>
                                <h3 className="text-white font-bold uppercase tracking-tight">Safety Report</h3>
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">ID: {report._id.slice(-8)}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:text-white"
                              onClick={() => deleteReport(report._id)}
                            >
                              <CheckCircle2 size={18} />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Reporter</p>
                              <div className="flex items-center gap-2">
                                <Avatar src={report.reporterId?.profile?.avatarUrl} size="xs" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{report.reporterId?.name}</p>
                                  <p className="text-[8px] text-gray-600 font-black uppercase">{report.reporterId?.role}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Reported Entity</p>
                              <div className="flex items-center gap-2">
                                <Avatar src={report.reportedId?.profile?.avatarUrl} size="xs" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{report.reportedId?.name}</p>
                                  <p className="text-[8px] text-gray-600 font-black uppercase">{report.reportedId?.role}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Allegation / Reason</p>
                            <p className="text-sm text-gray-300 font-medium leading-relaxed italic">"{report.reason}"</p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-bold text-gray-600">
                              FILED: {new Date(report.createdAt).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase"
                                onClick={() => updateUserStatus(report.reportedId?._id, { status: 'suspended' })}
                              >
                                Suspend Entity
                              </Button>
                              <Button
                                size="sm"
                                className="bg-primary-600 text-[10px] font-black uppercase"
                                onClick={() => {
                                  setSelectedUserId(report.reportedId?._id);
                                  setShowUserModal(true);
                                }}
                              >
                                Inspect Node
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'priority' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {pendingInvestors.length === 0 ? (
                  <div className="col-span-full text-center py-32 text-gray-500 font-bold uppercase tracking-widest">No pending priority investor requests.</div>
                ) : (
                  pendingInvestors.map((investor) => (
                    <Card key={investor._id} className="bg-[#161B2C] border-white/5 p-8 text-center border-t-4 border-t-primary-500">
                      <Avatar
                        src={investor.profile?.avatarUrl}
                        alt={investor.name}
                        size="xl"
                        className="mx-auto mb-6 border-4 border-white/5 p-1 ring-2 ring-primary-500/20"
                      />
                      <h3 className="text-xl font-bold text-white mb-1">{investor.name}</h3>
                      <p className="text-sm text-gray-500 font-medium mb-4">{investor.email}</p>
                      <div className="px-4 py-2 bg-white/5 rounded-xl inline-block mb-8">
                        <p className="text-xs font-black text-primary-400 uppercase tracking-widest">
                          {investor.profile?.company || 'Independent Investor'}
                        </p>
                      </div>

                      <Button
                        onClick={() => approvePriority(investor._id)}
                        fullWidth
                        className="font-black bg-primary-600 hover:bg-primary-700 py-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        leftIcon={<Shield size={18} />}
                      >
                        Grant Priority
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-[#161B2C] border-white/5 p-6 text-center">
                    <Globe size={32} className="mx-auto mb-4 text-primary-500" />
                    <p className="text-xs font-black text-gray-500 uppercase mb-1">Global Status</p>
                    <p className="text-xl font-bold text-white">{systemSettings?.maintenanceMode ? 'Offline' : 'Online'}</p>
                  </Card>
                  <Card className="bg-[#161B2C] border-white/5 p-6 text-center">
                    <Cpu size={32} className="mx-auto mb-4 text-emerald-500" />
                    <p className="text-xs font-black text-gray-500 uppercase mb-1">System Load</p>
                    <p className="text-xl font-bold text-white">0.42 ms</p>
                  </Card>
                  <Card className="bg-[#161B2C] border-white/5 p-6 text-center">
                    <Database size={32} className="mx-auto mb-4 text-purple-500" />
                    <p className="text-xs font-black text-gray-500 uppercase mb-1">DB Integrity</p>
                    <p className="text-xl font-bold text-white">100% Secure</p>
                  </Card>
                </div>

                <Card className="bg-[#161B2C] border-white/5 overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-white">Core Configuration</h3>
                      <p className="text-sm text-gray-500">Adjust high-level system parameters and feature availability.</p>
                    </div>
                    <Button
                      onClick={() => saveSettings(systemSettings)}
                      isLoading={isSaving}
                      leftIcon={<Save size={18} />}
                      className="bg-primary-600 hover:bg-primary-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                      Sync Parameters
                    </Button>
                  </div>
                  <div className="p-8 space-y-10">
                    <section className="space-y-6">
                      <h4 className="text-xs font-black text-primary-400 uppercase tracking-widest flex items-center gap-2">
                        <ToggleLeft size={14} /> Power Management
                      </h4>
                      <div className="space-y-4">
                        {[
                          { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Disables platform access for all non-admin users.', danger: true },
                          { key: 'allowNewRegistrations', label: 'Allow Registrations', desc: 'Control the influx of new entities into the ecosystem.' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                            <div>
                              <p className="text-white font-bold">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => setSystemSettings((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`w-14 h-8 rounded-full transition-all relative ${systemSettings?.[item.key] ? (item.danger ? 'bg-red-600' : 'bg-primary-600') : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${systemSettings?.[item.key] ? 'left-7' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Feature Toggles
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: 'aiMatching', label: 'AI Matchmaking' },
                          { key: 'messaging', label: 'Quantum Messaging' },
                          { key: 'deals', label: 'Smart Deals' }
                        ].map((feature) => (
                          <div key={feature.key} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                            <span className="text-gray-300 font-medium">{feature.label}</span>
                            <button
                              onClick={() => setSystemSettings((prev: any) => ({
                                ...prev,
                                featureToggles: { ...prev.featureToggles, [feature.key]: !prev.featureToggles[feature.key] }
                              }))}
                              className={`w-10 h-5 rounded-full transition-all relative ${systemSettings?.featureToggles?.[feature.key] ? 'bg-emerald-600' : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${systemSettings?.featureToggles?.[feature.key] ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-[#0D1117] border-white/10 overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center backdrop-blur-md">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 leading-none">
                        <Cpu size={20} className="text-emerald-500 animate-pulse" /> Immutable Audit Trail
                      </h3>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 ml-7">Permanent Activity Log</span>
                    </div>
                    <div className="flex gap-4">
                      <Badge className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border-emerald-500/20 uppercase tracking-widest px-3">
                        Integrity: 100%
                      </Badge>
                      <Badge className="bg-white/5 text-gray-500 font-mono text-[10px] border-white/10 uppercase tracking-widest px-3">
                        Retention: 90 Days
                      </Badge>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/40">
                          <th className="px-8 py-4 text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Admin Node</th>
                          <th className="px-8 py-4 text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Protocol Action</th>
                          <th className="px-8 py-4 text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Object</th>
                          <th className="px-8 py-4 text-[10px] font-black text-emerald-500/50 uppercase tracking-widest text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-black">
                                  {log.admin?.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white leading-none">{log.admin?.name}</p>
                                  <p className="text-[10px] text-gray-600">ID: {log.admin?._id?.slice(-6)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-xs text-emerald-400 font-bold tracking-tight">{log.action}</p>
                              {log.details && (
                                <p className="text-[9px] text-gray-500 mt-1 truncate max-w-xs">{log.details}</p>
                              )}
                            </td>
                            <td className="px-8 py-5">
                              <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase px-2 py-0.5 border-emerald-500/20">
                                {log.targetType}
                              </Badge>
                            </td>
                            <td className="px-8 py-5 text-right text-[10px] text-gray-500">
                              [{new Date(log.createdAt).toLocaleTimeString()}]
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">End of Secure Stream</p>
                  </div>
                </Card>
              </div>
            )}

          </>
        )}
      </div>

      {showUserModal && selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setShowUserModal(false)}
          onDelete={deleteUser}
        />
      )}

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        variant={confirmConfig.variant as any}
      />
    </div>
  );
};
