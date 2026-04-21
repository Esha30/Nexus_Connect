import React, { useState, useEffect, useMemo } from 'react';
import { Search, Rocket, Briefcase, Filter } from 'lucide-react';
import api from '../../api/api';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { Entrepreneur } from '../../types';

export const EntrepreneursPage: React.FC = () => {
 const [searchQuery, setSearchQuery] = useState('');
 const [activeCategory, setActiveCategory] = useState<string>('All');
 const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchEntrepreneurs = async () => {
 try {
 setIsLoading(true);
 const res = await api.get('/auth/entrepreneurs');
 // Mock injecting a few dummy profiles if the DB is empty or very sparse to ensure visual demonstration looks good.
 setEntrepreneurs(res.data.entrepreneurs || []);
 } catch (error) {
 console.error('Failed to fetch entrepreneurs:', error);
 } finally {
 setIsLoading(false);
 }
 };
 fetchEntrepreneurs();
 }, []);
 
 const allIndustries = useMemo(() => Array.from(new Set(entrepreneurs.map(e => e.profile?.industry || e.industry || 'Other'))).filter(Boolean), [entrepreneurs]);
 const displayCategories = ['All', ...allIndustries.slice(0, 5)];

 const filteredEntrepreneurs = useMemo(() => {
 return entrepreneurs.filter(entrepreneur => {
 const startupName = (entrepreneur.profile?.startupName || entrepreneur.startupName || '').toLowerCase();
 const industry = (entrepreneur.profile?.industry || entrepreneur.industry || '').toLowerCase();
 const pitchSummary = (entrepreneur.profile?.pitchSummary || entrepreneur.pitchSummary || '').toLowerCase();
 const name = (entrepreneur.name || '').toLowerCase();
 const query = searchQuery.toLowerCase();

 const matchesSearch = !query || name.includes(query) || startupName.includes(query) || industry.includes(query) || pitchSummary.includes(query);
 const matchesIndustry = activeCategory === 'All' || industry === activeCategory.toLowerCase();
 
 return matchesSearch && matchesIndustry;
 });
 }, [entrepreneurs, searchQuery, activeCategory]);
 
 return (
 <div className="min-h-screen bg-gray-50 pb-20">
 
 {/* Hero Header Selection */}
 <div className="relative pt-10 pb-20 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -left-20 w-72 h-72 bg-secondary-400/20 rounded-full pointer-events-none" />
 
 <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium mb-6 ">
 <Rocket size={14} /> Startup Discovery
 </div>
 <h1 className="text-2xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
 Invest in the <span className="text-primary-600">Future.</span>
 </h1>
 <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
 Discover and connect with high-growth startups and visionary founders ready to disrupt industries.
 </p>
 </div>
 
 <div className="w-full md:w-[400px]">
 <div className="relative bg-white p-2 rounded-lg shadow-sm border border-gray-100">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search size={20} className="text-gray-400" />
 </div>
 <input
 type="text"
 placeholder="Search by startup, industry, or need..."
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
 
 {/* Dynamic Category Pills */}
 <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-6">
 {displayCategories.map(cat => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm ${
 activeCategory === cat 
 ? 'bg-primary-600 text-white shadow-sm' 
 : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Results Info */}
 <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
 <h2 className="text-2xl font-medium text-gray-900 tracking-tight">
 Featured Startups
 </h2>
 <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg ">
 {filteredEntrepreneurs.length} Matches Found
 </span>
 </div>

 {/* Grid Layout */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {isLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-[320px]"></div>
 ))
 ) : filteredEntrepreneurs.length === 0 ? (
 <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
 <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
 <Briefcase size={40} className="text-gray-400" />
 </div>
 <h3 className="text-2xl font-medium text-gray-900 mb-2">No startups found</h3>
 <p className="text-gray-500 max-w-md mx-auto">We couldn't find any startups matching your current filters. Try expanding your search horizons.</p>
 </div>
 ) : (
 filteredEntrepreneurs.map((entrepreneur) => (
 <EntrepreneurCard
 key={entrepreneur._id || entrepreneur.id}
 entrepreneur={entrepreneur}
 />
 ))
 )}
 </div>
 </div>
 </div>
 );
};