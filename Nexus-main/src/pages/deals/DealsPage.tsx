import React, { useState, useEffect, useMemo } from 'react';
import { Search, DollarSign, TrendingUp, Users, Plus, X, PieChart, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { Deal, User } from '../../types';
import api from '../../api/api';
import toast from 'react-hot-toast';


const STATUSES = ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'] as const;
type DealStatus = typeof STATUSES[number];

export const DealsPage: React.FC = () => {
 const { user } = useAuth();
 const [deals, setDeals] = useState<Deal[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [activeStatus, setActiveStatus] = useState<string>('All');
 const [isLoading, setIsLoading] = useState(true);
  
 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
  
 // Form State
 const [startupId, setStartupId] = useState('');
 const [amount, setAmount] = useState('');
 const [equity, setEquity] = useState('');
 const [status, setStatus] = useState<DealStatus>('Due Diligence');
 const [stage, setStage] = useState('Seed');
 const [potentialStartups, setPotentialStartups] = useState<User[]>([]);

 useEffect(() => {
 fetchDeals();
 if (user?.role === 'investor') {
 api.get('/auth/entrepreneurs').then(res => setPotentialStartups(res.data.entrepreneurs)).catch(console.error);
 }
 }, [user]);

 const fetchDeals = async () => {
 setIsLoading(true);
 try {
 const res = await api.get('/deals');
 setDeals(res.data);
 } catch (err) {
 toast.error('Failed to load deals');
 } finally {
 setIsLoading(false);
 }
 };

 interface ApiError { response?: { data?: { message?: string } } }

 const handleCreateDeal = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!startupId || !amount || !equity) return toast.error('Please fill all fields');
  
 setIsSubmitting(true);
 try {
 const res = await api.post('/deals', {
 startupId,
 amount: parseFloat(amount),
 equity: parseFloat(equity),
 status,
 stage
 });
 setDeals(prev => [...prev, res.data]);
 toast.success('Deal logged successfully');
 setIsModalOpen(false);
 setStartupId('');
 setAmount('');
 setEquity('');
 fetchDeals();
 } catch (err) {
 const error = err as ApiError;
 toast.error(error.response?.data?.message || 'Failed to create deal');
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleUpdateStatus = async (id: string, newStatus: string) => {
 try {
 await api.put(`/deals/${id}`, { status: newStatus });
 setDeals(prev => prev.map(d => d._id === id ? { ...d, status: newStatus as DealStatus } : d));
 toast.success('Status updated');
 } catch (err) {
 toast.error('Failed to update status');
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Due Diligence': return 'primary';
 case 'Term Sheet': return 'secondary';
 case 'Negotiation': return 'accent';
 case 'Closed': return 'success';
 case 'Passed': return 'error';
 default: return 'gray';
 }
 };

 const filteredDeals = useMemo(() => {
 return deals.filter(deal => {
 const startupName = (deal.startup?.name || '').toLowerCase();
 const industry = (deal.startup?.profile?.industry || '').toLowerCase();
 const query = searchQuery.toLowerCase();
  
 const matchesSearch = !query || startupName.includes(query) || industry.includes(query);
 const matchesStatus = activeStatus === 'All' || deal.status === activeStatus;
  
 return matchesSearch && matchesStatus;
 });
 }, [deals, searchQuery, activeStatus]);

 const totalInvestment = useMemo(() => deals.filter(d => d.status === 'Closed').reduce((acc, d) => acc + d.amount, 0), [deals]);
 const activeDealsCount = useMemo(() => deals.filter(d => !['Closed', 'Passed'].includes(d.status)).length, [deals]);
 const displayStatuses = ['All', ...STATUSES];

 return (
 <div className="min-h-screen bg-gray-50 pb-20">
 
 {/* Hero Header */}
 <div className="relative pt-10 pb-20 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white">
 <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/20 rounded-full pointer-events-none" />
 
 <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium mb-6 ">
 <PieChart size={14} /> Investment Tracker
 </div>
 <h1 className="text-2xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
 Your Deal <span className="text-primary-600">Pipeline.</span>
 </h1>
 <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
 Manage investments, track due diligence, and monitor your portfolio's growth in one place.
 </p>
 </div>
 
 <div className="w-full md:w-[450px] space-y-4">
 {user?.role === 'investor' && (
 <Button 
 onClick={() => setIsModalOpen(true)} 
 leftIcon={<Plus size={18} />}
 fullWidth
 className="bg-primary-600 hover:bg-blue-700 shadow-sm py-4 text-lg font-medium rounded-lg"
 >
 Log New Deal
 </Button>
 )}
 <div className="relative bg-white p-2 rounded-lg shadow-sm border border-gray-100">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search size={20} className="text-gray-400" />
 </div>
 <input
 type="text"
 placeholder="Search deals by startup or industry..."
 className="block w-full pl-12 pr-4 py-3 bg-transparent border-0 text-gray-900 font-medium placeholder:text-gray-400 focus:ring-0 sm:text-sm"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 -mt-8 relative z-20">
 
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
 <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-primary-50 rounded-lg text-primary-600 ">
 <DollarSign size={24} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-400 mb-1">Closed Investment</p>
 <p className="text-2xl font-medium text-gray-900">${(totalInvestment / 1000000).toFixed(1)}M</p>
 </div>
 </div>
 <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-primary-50 rounded-lg text-primary-600 ">
 <TrendingUp size={24} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-400 mb-1">Active Deals</p>
 <p className="text-2xl font-medium text-gray-900">{activeDealsCount}</p>
 </div>
 </div>
 <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-primary-50 rounded-lg text-primary-600 ">
 <Users size={24} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-400 mb-1">Total Connections</p>
 <p className="text-2xl font-medium text-gray-900">{deals.length}</p>
 </div>
 </div>
 </div>

 {/* Status Pills */}
 <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-8">
 {displayStatuses.map(status => (
 <button
 key={status}
 onClick={() => setActiveStatus(status)}
 className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm ${
 activeStatus === status 
 ? 'bg-gray-900 text-white shadow-sm' 
 : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
 }`}
 >
 {status}
 </button>
 ))}
 </div>

 {/* Deals Table/List */}
 <Card className="bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
 <CardBody className="p-0">
 {isLoading ? (
 <div className="p-20 text-center animate-pulse text-gray-400 font-medium">Refreshing pipeline assets...</div>
 ) : filteredDeals.length === 0 ? (
 <div className="p-20 text-center flex flex-col items-center">
 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
 <Briefcase size={32} />
 </div>
 <h3 className="text-2xl font-medium text-gray-900 mb-2">Portfolio is Empty</h3>
 <p className="text-gray-500 max-w-sm">You don't have any deals matching this filter in your current pipeline.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[800px]">
 <thead>
 <tr className="bg-gray-50/50 border-b border-gray-100">
 <th className="px-4 py-5 text-left text-xs font-medium text-gray-400 ">Startup</th>
 <th className="px-4 py-5 text-left text-xs font-medium text-gray-400 ">Target Amount</th>
 <th className="px-4 py-5 text-left text-xs font-medium text-gray-400 ">Equity</th>
 <th className="px-4 py-5 text-left text-xs font-medium text-gray-400 ">Pipe Stage</th>
 <th className="px-4 py-5 text-left text-xs font-medium text-gray-400 ">Funding Stage</th>
 <th className="px-4 py-5 text-right text-xs font-medium text-gray-400 ">Manage</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filteredDeals.map(deal => (
 <tr key={deal._id} className="hover:bg-primary-50 transition-colors group">
 <td className="px-4 py-2.5">
 <div className="flex items-center gap-4">
 <div className="relative group-hover:scale-110 transition-transform duration-300">
 <Avatar
 src={deal.startup?.profile?.avatarUrl}
 alt={deal.startup?.name}
 size="md"
 className=" shadow-sm"
 />
 </div>
 <div>
 <div className="text-base font-medium text-gray-900 leading-tight">{deal.startup?.name}</div>
 <div className="text-xs font-medium text-primary-500 tracking-tight">{deal.startup?.profile?.industry || 'Uncategorized'}</div>
 </div>
 </div>
 </td>
 <td className="px-4 py-2.5">
 <div className="text-base font-medium text-gray-900">${deal.amount.toLocaleString()}</div>
 </td>
 <td className="px-4 py-2.5">
 <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100/80 text-gray-700 text-sm font-medium">
 {deal.equity}%
 </div>
 </td>
 <td className="px-4 py-2.5">
 <Badge variant={getStatusColor(deal.status)} className="px-3 py-1 text-xs font-medium uppercase">{deal.status}</Badge>
 </td>
 <td className="px-4 py-2.5">
 <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{deal.stage}</div>
 </td>
 <td className="px-4 py-2.5 text-right">
 {user?.role === 'investor' && (
 <select 
 className="text-xs font-medium text-gray-600 bg-white border-gray-200 rounded-lg py-2 px-4 shadow-sm focus:ring-primary-500 focus:border-primary-500 cursor-pointer appearance-none text-center"
 value={deal.status}
 onChange={(e) => handleUpdateStatus(deal._id, e.target.value)}
 >
 {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardBody>
 </Card>
 </div>

 {/* Modern Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 animate-fade-in">
 <Card className="w-full max-w-md shadow-sm border-none rounded-[2rem] overflow-hidden">
 <div className="h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
 <CardHeader className="flex justify-between items-center px-4 pt-8 pb-4">
 <div>
 <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Log New Deal</h2>
 <p className="text-sm text-gray-500 font-medium">Add a startup to your investment pipeline.</p>
 </div>
 <button className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition" onClick={() => setIsModalOpen(false)}>
 <X size={24} />
 </button>
 </CardHeader>
 <CardBody className="px-4 pb-8 pt-4">
 <form onSubmit={handleCreateDeal} className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-gray-400 ml-1">Target Startup</label>
 <select
 value={startupId}
 onChange={e => setStartupId(e.target.value)}
 required
 className="w-full rounded-lg border-gray-100 bg-gray-50/50 py-4 px-5 font-semibold text-gray-900 focus:ring-primary-500 focus:border-primary-500 shadow-sm outline-none appearance-none"
 >
 <option value="" disabled>Select a startup to log deal...</option>
 {potentialStartups.map(s => (
 <option key={s._id || s.id} value={s._id || s.id}>{s.profile?.startupName || s.name}</option>
 ))}
 </select>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <Input 
 type="number" 
 label="Amount ($)" 
 value={amount} 
 onChange={e => setAmount(e.target.value)} 
 required 
 className="rounded-lg border-gray-100 bg-gray-50/50 py-4 font-semibold"
 />
 <Input 
 type="number" 
 label="Equity %" 
 value={equity} 
 onChange={e => setEquity(e.target.value)} 
 required 
 className="rounded-lg border-gray-100 bg-gray-50/50 py-4 font-semibold"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-gray-400 ml-1">Pipe Status</label>
 <select className="w-full rounded-lg border-gray-100 bg-gray-50/50 py-4 px-4 font-semibold text-gray-900 focus:ring-primary-500 focus:border-primary-500 appearance-none shadow-sm" value={status} onChange={(e) => setStatus(e.target.value as DealStatus)}>
 {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <Input 
 label="Funding Stage" 
 value={stage} 
 onChange={e => setStage(e.target.value)} 
 placeholder="e.g. Seed"
 className="rounded-lg border-gray-100 bg-gray-50/50 py-4 font-semibold"
 />
 </div>
 </div>
 <div className="flex flex-col gap-3 pt-4">
 <Button 
 type="submit" 
 disabled={isSubmitting}
 className="py-4 text-lg font-medium rounded-lg shadow-sm shadow-primary-600/20"
 >
 {isSubmitting ? 'Processing...' : 'Confirm Pipeline Entry'}
 </Button>
 <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400 font-medium hover:bg-gray-50">
 Cancel Operation
 </Button>
 </div>
 </form>
 </CardBody>
 </Card>
 </div>
 )}
 </div>
 );
};