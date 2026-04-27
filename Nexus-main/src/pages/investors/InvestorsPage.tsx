import React, { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase, Filter, DollarSign } from 'lucide-react';
import api from '../../api/api';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { Investor } from '../../types';

export const InvestorsPage: React.FC = () => {
 const [searchQuery, setSearchQuery] = useState('');
 const [activeStage, setActiveStage] = useState<string>('All');
 const [investors, setInvestors] = useState<Investor[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchInvestors = async () => {
 try {
 setIsLoading(true);
 const res = await api.get('/auth/investors');
 setInvestors(res.data.investors || []);
 } catch (error) {
 console.error('Failed to fetch investors:', error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchInvestors();
 }, []);
 
 const allStages = useMemo(() => {
 const stages = new Set<string>();
 investors.forEach(inv => {
 const stageList = inv.profile?.investmentStage || inv.investmentStage || [];
 if (Array.isArray(stageList)) {
 stageList.forEach(s => stages.add(s));
 }
 });
 return Array.from(stages).filter(Boolean);
 }, [investors]);

 const displayStages = ['All', ...allStages.slice(0, 5)];

 const filteredInvestors = useMemo(() => {
 return investors.filter(investor => {
 const name = (investor.name || '').toLowerCase();
 const company = (investor.profile?.company || '').toLowerCase();
 const bio = (investor.profile?.bio || investor.bio || '').toLowerCase();
 const query = searchQuery.toLowerCase();
 const stages = investor.profile?.investmentStage || investor.investmentStage || [];

 const matchesSearch = !query || 
 name.includes(query) || 
 company.includes(query) || 
 bio.includes(query) ||
 (investor.profile?.investmentInterests || []).some(i => i.toLowerCase().includes(query));
 
 const matchesStage = activeStage === 'All' || stages.includes(activeStage);
 
 return matchesSearch && matchesStage;
 });
 }, [investors, searchQuery, activeStage]);
 
 return (
 <div className="min-h-screen bg-gray-50 pb-20">
 
 {/* Hero Header Selection */}
 <div className="relative pt-10 pb-20 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white">
 <div className="absolute -top-40 -left-40 w-96 h-96 bg-secondary-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -right-20 w-72 h-72 bg-accent-400/20 rounded-full pointer-events-none" />
 
 <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium mb-6 ">
 <DollarSign size={14} /> Capital Network
 </div>
 <h1 className="text-2xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
 Find the Right <span className="text-primary-600">Backing.</span>
 </h1>
 <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
 Connect with top-tier angel investors and VCs who share your vision and understand your industry.
 </p>
 </div>
 
 <div className="w-full md:w-[400px]">
 <div className="relative bg-white p-2 rounded-lg shadow-sm border border-gray-100">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search size={20} className="text-gray-400" />
 </div>
 <input
 type="text"
 placeholder="Search by name, firm, or interest..."
 className="block w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-900 font-medium placeholder:text-gray-400 focus:ring-0 sm:text-sm"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 <button className="absolute inset-y-2 right-2 bg-gray-900 text-white px-4 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors">
 <Filter size={16} />
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 -mt-8 relative z-20">
 
 {/* Dynamic Stage Pills */}
 <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-6">
 {displayStages.map(stage => (
 <button
 key={stage}
 onClick={() => setActiveStage(stage)}
 className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm ${
 activeStage === stage 
 ? 'bg-primary-600 text-white shadow-sm' 
 : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
 }`}
 >
 {stage}
 </button>
 ))}
 </div>

 {/* Results Info */}
 <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
 <h2 className="text-2xl font-medium text-gray-900 tracking-tight">
 Active Investors
 </h2>
 <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg ">
 {filteredInvestors.length} Results
 </span>
 </div>

 {/* Grid Layout */}
 <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8">
 {isLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-[360px]"></div>
 ))
 ) : filteredInvestors.length === 0 ? (
 <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
 <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
 <Briefcase size={40} className="text-gray-400" />
 </div>
 <h3 className="text-2xl font-medium text-gray-900 mb-2">No investors found</h3>
 <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search or filters to find more investment partners.</p>
 </div>
 ) : (
 filteredInvestors.map((investor) => (
 <InvestorCard
 key={investor._id || investor.id}
 investor={investor}
 />
 ))
 )}
 </div>
 </div>
 </div>
 );
};