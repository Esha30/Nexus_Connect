import React, { useState, useEffect } from 'react';
import { 
  Shield, Ticket, UserCheck, CheckCircle2, Users, LayoutGrid, 
  BarChart3, Trash2, Mail, ExternalLink, AlertCircle, TrendingUp,
  Briefcase, Activity, Clock, Search
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

import { UserDetailsModal } from '../../components/admin/UserDetailsModal';

type AdminTab = 'overview' | 'users' | 'posts' | 'support' | 'priority';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [pendingInvestors, setPendingInvestors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, postsRes, ticketsRes, priorityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
        api.get('/admin/tickets'),
        api.get('/admin/priority')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setTickets(ticketsRes.data);
      setPendingInvestors(priorityRes.data);
    } catch (err) {
      toast.error('System failure: Could not retrieve secure data');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('PERMANENT DELETION: Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User protocol terminated');
    } catch (err) {
      toast.error('Termination failed');
    }
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('Confirm moderation: Remove this content?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Broadcast removed');
    } catch (err) {
      toast.error('Moderation failed');
    }
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
                { id: 'priority', icon: <UserCheck size={18} />, label: 'Priority' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                    activeTab === tab.id 
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Users', value: stats?.users.total, icon: <Users />, color: 'blue' },
                    { label: 'Startups', value: stats?.users.entrepreneurs, icon: <Briefcase />, color: 'emerald' },
                    { label: 'Investors', value: stats?.users.investors, icon: <TrendingUp />, color: 'purple' },
                    { label: 'Active Content', value: stats?.content.posts, icon: <Activity />, color: 'orange' }
                  ].map((stat, i) => (
                    <Card key={i} className="bg-[#161B2C] border-white/5 hover:border-white/10 transition-all group overflow-hidden">
                      <CardBody className="p-6 relative">
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 text-${stat.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity transform rotate-12`}>
                          {React.cloneElement(stat.icon as React.ReactElement, { size: 96 })}
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{stat.label}</p>
                        <div className="flex items-end gap-3">
                          <h3 className="text-4xl font-black text-white leading-none">{stat.value}</h3>
                          <span className="text-emerald-400 text-xs font-bold mb-1">+12%</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* System Activity Teaser */}
                  <Card className="lg:col-span-2 bg-[#161B2C] border-white/5 p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Clock size={20} className="text-primary-500" /> System Velocity
                    </h3>
                    <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
                      <p className="text-gray-500 text-sm font-medium">Activity graph visualization engine loading...</p>
                    </div>
                  </Card>

                  {/* Quick Moderation Queue */}
                  <Card className="bg-[#161B2C] border-white/5 p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <AlertCircle size={20} className="text-orange-500" /> Critical Queue
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-bold">Support Tickets</p>
                          <p className="text-xs text-gray-500">{stats?.support.pendingTickets} pending response</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setActiveTab('support')} className="text-primary-400 hover:text-primary-300">View</Button>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-bold">Priority Access</p>
                          <p className="text-xs text-gray-500">{pendingInvestors.length} investors waiting</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setActiveTab('priority')} className="text-primary-400 hover:text-primary-300">View</Button>
                      </div>
                    </div>
                  </Card>
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
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                  {u.subscription?.plan || 'Free'} Plan
                                </p>
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
    </div>
  );
};
