import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, MapPin, TrendingUp, DollarSign, Award, Sparkles, Brain } from 'lucide-react';
import { Investor } from '../../types';
import { Avatar } from '../ui/Avatar';
import { AiMatchAnalysis } from '../ai/AiMatchAnalysis';

interface InvestorCardProps {
 investor: Investor;
 showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
 investor,
 showActions = true
}) => {
 const navigate = useNavigate();
 const [showAnalysis, setShowAnalysis] = React.useState(false);

 const handleViewProfile = () => {
 navigate(`/profile/investor/${investor.id || investor._id}`);
 };

 const handleOpenAnalysis = (e: React.MouseEvent) => {
   e.stopPropagation();
   setShowAnalysis(true);
 };
 
 const handleMessageClick = (e: React.MouseEvent) => {
 e.stopPropagation();
 navigate(`/messages/${investor.id || investor._id}`);
 };

 const name = investor.name || 'Anonymous Investor';
 const company = investor.profile?.company || 'Private Investor';
 const bio = investor.profile?.bio || investor.bio || 'Experienced investor looking for disruptive startups and visionary founders to support.';
 const location = investor.profile?.location || investor.location || 'Global';
 const interests = investor.profile?.investmentInterests || investor.investmentInterests || ['Technology', 'Fintech'];
 const stages = investor.profile?.investmentStage || investor.investmentStage || ['Seed', 'Series A'];
 const range = `${investor.profile?.minimumInvestment || '$50K'} - ${investor.profile?.maximumInvestment || '$500K+'}`;

 return (
 <div 
 className="group relative bg-white border border-gray-100 rounded-lg p-8 shadow-sm hover:shadow-sm hover:shadow-blue-600/5 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden cursor-pointer"
 onClick={handleViewProfile}
 style={{ isolation: 'isolate' }}
 >
 {/* Decorative gradient orb */}
 <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-600/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

 {/* Header section */}
 <div className="flex items-start justify-between mb-8">
 <div className="flex items-center gap-5">
 <div className="relative">
 <Avatar
 src={investor.profile?.avatarUrl || investor.avatarUrl}
 alt={name}
 size="xl"
 className=" shadow-sm z-10"
 status={investor.profile?.isOnline || investor.isOnline ? 'online' : 'offline'}
 />
 </div>
 <div>
 <h3 className="text-2xl font-medium text-gray-900 tracking-tight leading-none truncate max-w-[180px]">{name}</h3>
 <p className="text-xs font-medium text-primary-600 flex items-center gap-1.5 mt-2 ">
 <Award size={12} className="shrink-0" /> {company}
 </p>
 </div>
 </div>
 <div className="bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100 ">
 <MapPin size={12} className="text-gray-400" />
 <span className="text-xs font-medium text-gray-500 leading-none">{location}</span>
 </div>
 </div>

 {/* Bio section */}
 <div className="mb-8 min-h-[60px]">
 <p className="text-sm font-medium leading-relaxed text-gray-500 line-clamp-3">
 "{bio}"
 </p>
 </div>

 {/* Tags section */}
 <div className="flex flex-wrap gap-2.5 mb-8">
 {interests.slice(0, 3).map((interest, idx) => (
 <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-900 text-xs font-medium rounded-lg border border-gray-100 group-hover:bg-primary-50 group-hover:border-primary-100 group-hover:text-primary-600 transition-all">
 {interest}
 </span>
 ))}
 {interests.length > 3 && (
 <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg border border-gray-100">
 +{interests.length - 3} Protocols
 </span>
 )}
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 gap-4 mb-8">
 <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100/50 group-hover:bg-white group-hover:border-blue-50 transition-all flex flex-col justify-between h-24">
 <p className="text-xs font-medium text-gray-400 mb-1">Cheque Velocity</p>
 <div className="flex items-center gap-2 text-gray-900">
 <DollarSign size={14} className="text-primary-600" />
 <p className="text-sm font-medium tracking-tight">{range}</p>
 </div>
 </div>
 <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100/50 group-hover:bg-white group-hover:border-blue-50 transition-all flex flex-col justify-between h-24">
 <p className="text-xs font-medium text-gray-400 mb-1">Maturity Focus</p>
 <div className="flex items-center gap-2 text-gray-900">
 <TrendingUp size={14} className="text-indigo-600" />
 <p className="text-sm font-medium tracking-tight truncate">{stages[0]}</p>
 </div>
 </div>
 </div>

  {/* AI Analysis Overlay */}
  {showAnalysis && (
    <div className="absolute inset-0 z-50 p-2 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <AiMatchAnalysis 
        targetUserId={investor.id || investor._id} 
        targetName={name} 
        onClose={() => setShowAnalysis(false)} 
      />
    </div>
  )}

 {/* Actions */}
 {showActions && (
 <div className="flex items-center gap-3 pt-2">
 <button 
 onClick={handleMessageClick}
 className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-400 hover:text-primary-600 rounded-lg transition-all duration-300 border border-gray-100 shadow-sm"
 title="Secure Channel"
 >
 <MessageCircle size={20} />
 </button>
 <button 
    onClick={handleOpenAnalysis}
    className="w-12 h-12 flex items-center justify-center bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-all duration-300 border border-primary-100 shadow-sm"
    title="AI Pulse Analysis"
  >
    <Brain size={20} />
  </button>
 <button 
 onClick={handleViewProfile}
 className="flex-1 h-12 flex items-center justify-center bg-gray-900 border border-slate-900 text-white font-medium text-xs rounded-lg hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 shadow-sm shadow-slate-900/10 group-hover:shadow-blue-600/20"
 >
 Initialize <Sparkles size={14} className="ml-2 group-hover:animate-pulse" />
 </button>
 </div>
 )}
 </div>
 );
};