import React, { useState, useEffect } from 'react';
import { Shield, Ticket, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'priority'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [pendingInvestors, setPendingInvestors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, priorityRes] = await Promise.all([
        api.get('/admin/tickets'),
        api.get('/admin/priority')
      ]);
      setTickets(ticketsRes.data);
      setPendingInvestors(priorityRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
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

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Shield size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
        <p className="text-gray-500">You must be logged in as an Administrator to view this console.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16 bg-gray-50">
      <div className="bg-gray-900 py-12 px-6 sm:px-5 lg:px-16 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Badge className="bg-red-500/20 text-red-400 font-bold mb-4 uppercase tracking-wider text-[10px] px-3 py-1">
              Level 5 Clearance
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Control Center</h1>
            <p className="text-gray-400 font-medium">Manage support protocols and priority investor access.</p>
          </div>
          
          <div className="flex bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'tickets' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Ticket size={16} /> Support Tickets
              <span className="ml-2 bg-gray-600 px-2 py-0.5 rounded-full text-xs">{tickets.filter(t => t.status !== 'resolved').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('priority')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'priority' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <UserCheck size={16} /> Priority Requests
              <span className="ml-2 bg-gray-600 px-2 py-0.5 rounded-full text-xs">{pendingInvestors.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 mt-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No support tickets found.</div>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket._id} className="border-gray-100 shadow-sm bg-white overflow-hidden">
                  <CardBody className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={ticket.status === 'resolved' ? 'success' : 'primary'} className="uppercase">
                          {ticket.status}
                        </Badge>
                        <span className="text-xs font-mono text-gray-400 font-bold">{ticket.ticketId}</span>
                        <span className="text-xs text-gray-400">• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.name}</h3>
                      <a href={`mailto:${ticket.email}`} className="text-sm font-medium text-primary-600 mb-4 block">
                        {ticket.email}
                      </a>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{ticket.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end min-w-[140px]">
                      {ticket.status !== 'resolved' && (
                        <Button 
                          onClick={() => resolveTicket(ticket._id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                          fullWidth
                          leftIcon={<CheckCircle2 size={18} />}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingInvestors.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">No pending priority requests.</div>
            ) : (
              pendingInvestors.map((investor) => (
                <Card key={investor._id} className="border-gray-100 shadow-sm bg-white">
                  <CardBody className="p-6 text-center">
                    <Avatar 
                      src={investor.profile?.avatarUrl} 
                      alt={investor.name} 
                      size="xl" 
                      className="mx-auto mb-4 border-4 border-gray-50"
                    />
                    <h3 className="text-lg font-bold text-gray-900">{investor.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{investor.email}</p>
                    <p className="text-xs font-semibold text-primary-600 mb-6 bg-primary-50 inline-block px-3 py-1 rounded-full text-center">
                      {investor.profile?.company || 'Independent Investor'}
                    </p>
                    
                    <Button 
                      onClick={() => approvePriority(investor._id)}
                      fullWidth
                      className="font-bold bg-primary-600 shadow-sm"
                      leftIcon={<Shield size={16} />}
                    >
                      Approve Priority
                    </Button>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
