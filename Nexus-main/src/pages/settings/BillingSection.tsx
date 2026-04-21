import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
 ArrowUpRight, 
 ArrowDownRight, 
 Clock, 
 CreditCard,
 Download,
 AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PricingGrid } from '../../components/billing/PricingGrid';
import { TransactionChart } from '../../components/billing/TransactionChart';
import { CreditCardModal } from '../../components/billing/CreditCardModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Transaction } from '../../types';

export const BillingSection: React.FC = () => {
 const { user, updatePartialUser } = useAuth();
 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [amount, setAmount] = useState('');
 const [description, setDescription] = useState('');
 const [isProcessing, setIsProcessing] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 
 const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise' | null>(null);
 const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

 const fetchTransactions = useCallback(async () => {
 try {
 const res = await api.get('/payments/history');
 setTransactions(res.data);
 } catch (error) {
 console.error('Transactions fetch error:', error);
 } finally {
 setIsLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchTransactions();
 }, [fetchTransactions]);

 interface ApiError { response?: { data?: { message?: string } } }

 const handleDeposit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!amount || isNaN(Number(amount))) return toast.error('Please enter a valid amount');
 
 setIsProcessing(true);
 const toastId = toast.loading('Processing deposit...');
 
 try {
 const res = await api.post('/payments', {
 amount: Number(amount),
 type: 'deposit',
 description: description || 'Account Deposit'
 });
 
 updatePartialUser({ walletBalance: res.data.newBalance });
 toast.success('Funds deposited successfully!', { id: toastId });
 setAmount('');
 setDescription('');
 fetchTransactions();
 } catch (err) {
 const error = err as ApiError;
 toast.error(error.response?.data?.message || 'Payment failed', { id: toastId });
 } finally {
 setIsProcessing(false);
 }
 };

 const confirmSubscriptionDirectly = useCallback(async (plan: 'pro' | 'enterprise') => {
 setIsProcessing(true);
 const toastId = toast.loading('Initiating checkout...');
 
 try {
 const res = await api.post('/stripe/create-checkout-session', { plan });
 if (res.data.url) {
 window.location.href = res.data.url;
 } else {
 throw new Error('No checkout URL received');
 }
 } catch (err) {
 const error = err as ApiError;
 toast.error(error.response?.data?.message || 'Checkout failed', { id: toastId });
 } finally {
 setIsProcessing(false);
 }
 }, []);

 const handleUpgrade = (planId: 'starter' | 'pro' | 'enterprise') => {
 if (planId === 'enterprise') {
 window.location.href = 'mailto:sales@nexus.com';
 return;
 }
 
 if (planId === 'pro') {
 setSelectedPlan(planId);
 confirmSubscriptionDirectly(planId);
 } else {
 setSelectedPlan(planId);
 setIsCheckoutOpen(true);
 }
 };

 const confirmSubscription = async () => {
 if (!selectedPlan) return;
 setIsProcessing(true);
 const toastId = toast.loading('Initiating checkout...');
 
 try {
 const res = await api.post('/stripe/create-checkout-session', { plan: selectedPlan });
 if (res.data.url) {
 window.location.href = res.data.url;
 } else {
 throw new Error('No checkout URL received');
 }
 } catch (err) {
 const error = err as ApiError;
 toast.error(error.response?.data?.message || 'Checkout failed', { id: toastId });
 } finally {
 setIsProcessing(false);
 }
 };

 const chartData = useMemo(() => {
 const last7 = transactions.slice(0, 10).reverse();
 return last7.map(tx => ({
 date: new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
 inflow: tx.type === 'deposit' ? tx.amount : 0,
 outflow: tx.type !== 'deposit' ? tx.amount : 0
 }));
 }, [transactions]);

 return (
 <div className="space-y-8 animate-fade-in">
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Wallet Balance Card - Premium High Contrast Style */}
 <div className="lg:col-span-1 bg-gray-900 text-white rounded-lg border-none shadow-sm overflow-hidden min-h-[250px] relative group pointer-events-auto">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full" />
 <div className="p-8 h-full flex flex-col justify-between relative z-10">
 <div>
 <div className="flex justify-between items-start mb-8">
 <div className="p-4 bg-white/10 rounded-lg border border-gray-700 shadow-sm text-primary-400">
 <CreditCard size={28} />
 </div>
 <Badge variant="success" className="bg-primary-500/20 text-primary-400 border border-blue-500/30 px-4 py-1.5 font-medium text-xs shadow-sm">
 Live Node
 </Badge>
 </div>
 <p className="text-xs font-medium text-gray-400 mb-3 ml-1">Capital Reserves</p>
 <div className="flex items-baseline gap-2">
 <span className="text-2xl font-medium text-white drop-shadow-sm">
 ${user?.walletBalance?.toLocaleString() || '0.00'}
 </span>
 <span className="text-xs text-indigo-400 font-medium uppercase">USD</span>
 </div>
 </div>
 
 <div className="mt-8 pt-8 border-t border-gray-700">
 <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-4">
 <span>Deployment Tier</span>
 <span className="text-white bg-white/10 px-3 py-1 rounded-lg border border-gray-700">
 {user?.subscription?.plan || 'Starter'}
 </span>
 </div>
 <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden ">
 <div 
 className="h-full bg-primary-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
 style={{ width: user?.subscription?.plan === 'starter' ? '33%' : user?.subscription?.plan === 'pro' ? '66%' : '100%' }} 
 />
 </div>
 </div>
 </div>
 </div>

 {/* Analytics Card - Glassy White */}
 <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-white/40 dark:border-gray-700/30 shadow-sm overflow-hidden shadow-indigo-500/5">
 <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700/50 p-8 bg-gray-50/30 dark:bg-gray-900/20">
 <div>
 <h2 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">Financial Pulse</h2>
 <p className="text-xs font-medium text-gray-500 mt-1">Real-time ledger dynamics</p>
 </div>
 <Button variant="outline" size="sm" className="bg-gray-800 dark:bg-gray-700/50 dark:text-white rounded-lg font-medium shadow-sm border-gray-700">
 <Download size={14} className="mr-2" /> Data Export
 </Button>
 </div>
 <div className="p-8">
 <TransactionChart data={chartData} />
 </div>
 </div>
 </div>

 {/* Subscription Plans - Premium Grid */}
 <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-white/40 dark:border-gray-700/30 shadow-sm overflow-hidden shadow-indigo-500/5">
 <div className="p-8 border-b border-gray-100 bg-gray-50/30">
 <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Scalability Infrastructure</h2>
 <p className="text-xs font-medium text-gray-500 mt-1">Authorized deployment levels</p>
 </div>
 <div className="p-8">
 <PricingGrid 
 currentPlan={user?.subscription?.plan || 'starter'} 
 onUpgrade={handleUpgrade}
 isLoading={isProcessing}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 
 {/* Deposit Form */}
 <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden shadow-blue-500/5">
 <div className="p-8 border-b border-gray-100 bg-gray-50/30">
 <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Inject Capital</h2>
 <p className="text-xs font-medium text-gray-500 mt-1">Synchronizing external funds</p>
 </div>
 <div className="p-8">
 <form onSubmit={handleDeposit} className="space-y-6">
 <div>
 <label className="block text-xs font-medium text-gray-400 mb-4 ml-2">
 Transaction Amount (USD)
 </label>
 <div className="relative group">
 <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none group-focus-within:text-emerald-500 transition-colors">
 <span className="text-2xl font-medium">$</span>
 </div>
 <input
 type="number"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 className="w-full pl-12 h-20 rounded-[1.5rem] border-2 border-gray-100 dark:border-gray-700 bg-gray-800 dark:bg-gray-900/50 text-gray-900 dark:text-white text-lg font-medium placeholder:text-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-all text-center"
 placeholder="0.00"
 />
 </div>
 </div>
 <Input 
 type="text" 
 label="Operation Reference" 
 value={description} 
 onChange={(e) => setDescription(e.target.value)} 
 placeholder="e.g. Strategic Reserve"
 className="dark:bg-gray-900/50 dark:border-gray-700 dark:text-white rounded-[1.25rem] font-medium py-4 "
 />
 <div className="pt-2">
 <Button 
 type="submit" 
 fullWidth 
 disabled={isProcessing}
 className="bg-primary-600 py-2.5 font-medium text-xl rounded-[1.5rem] shadow-sm shadow-blue-500/20 active:scale-95 transition-transform"
 >
 Execute Handshake
 </Button>
 </div>
 </form>
 </div>
 </div>

 {/* Transaction History - Ledger Style */}
 <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg border border-white/40 dark:border-gray-700/30 shadow-sm overflow-hidden shadow-indigo-500/5">
 <div className="flex justify-between items-center p-8 border-b border-gray-50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20">
 <div>
 <h2 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">Terminal Ledger</h2>
 <p className="text-xs font-medium text-gray-500 mt-1">Authenticated update log</p>
 </div>
 </div>
 <div className="overflow-y-auto max-h-[500px]">
 {isLoading ? (
 <div className="p-24 text-center text-sm text-gray-400 font-medium animate-pulse">Syncing...</div>
 ) : transactions.length === 0 ? (
 <div className="p-28 text-center flex flex-col items-center">
 <AlertCircle size={56} strokeWidth={1} className="text-gray-200 mb-6" />
 <p className="text-xs text-gray-400 font-medium ">No Active Records</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
 {transactions.map((tx) => (
 <div key={tx._id} className="group flex items-center justify-between p-8 hover:bg-white dark:hover:bg-gray-900/30 transition-all duration-300">
 <div className="flex items-center gap-6">
 <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 border border-transparent group-hover:border-gray-700 ${
 tx.type === 'deposit' 
 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
 : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
 }`}>
 {tx.type === 'deposit' ? <ArrowDownRight size={26} strokeWidth={3} /> : <ArrowUpRight size={26} strokeWidth={3} />}
 </div>
 <div>
 <p className="font-medium text-gray-900 dark:text-white text-lg tracking-tight">
 {tx.description}
 </p>
 <p className="text-xs text-gray-400 font-medium flex items-center gap-2 mt-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-800">
 <Clock size={11} /> TIMESTAMP: {new Date(tx.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className={`font-medium text-2xl ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
 {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
 </p>
 <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-xs font-medium border border-emerald-500/20 mt-2 inline-block">Settled</span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 <CreditCardModal 
 isOpen={isCheckoutOpen}
 onClose={() => setIsCheckoutOpen(false)}
 onConfirm={confirmSubscription}
 planName={selectedPlan || ''}
 amount={selectedPlan === 'pro' ? '$100.00/mo' : '$0'}
 isLoading={isProcessing}
 />
 </div>
 );
};
