import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink, MapPin, Target, Users, Sparkles, Flame, Brain } from 'lucide-react';
import { AiMatchAnalysis } from '../ai/AiMatchAnalysis';
import { Entrepreneur } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface EntrepreneurCardProps {
 entrepreneur: Entrepreneur;
 showActions?: boolean;
}

export const EntrepreneurCard: React.FC<EntrepreneurCardProps> = ({
 entrepreneur,
 showActions = true
}) => {
 const navigate = useNavigate();
 const { user } = useAuth();
 
 const handleViewProfile = () => {
 navigate(`/profile/entrepreneur/${entrepreneur.id || entrepreneur._id}`);
 };
 
 const handleMessage = (e: React.MouseEvent) => {
 e.stopPropagation();
 navigate(`/messages/${entrepreneur.id || entrepreneur._id}`);
 };

 const [aiPitch, setAiPitch] = useState<string | null>(null);
 const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

 const handleGeneratePitch = async (e: React.MouseEvent) => {
   e.stopPropagation();
   const id = entrepreneur.id || entrepreneur._id;
   if (!id || isGeneratingPitch) return;
   
   setIsGeneratingPitch(true);
   toast.loading('Synthesizing founder profile...', { id: 'ai-pitch' });
   try {
     const res = await api.post('/ai/pitch', { targetUserId: id });
     setAiPitch(res.data.pitch);
     toast.success('AI Pitch generated', { id: 'ai-pitch' });
   } catch (err: any) {
     if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
       toast.error('Free trial limit reached. Upgrade to Premium for infinite AI summaries.', { id: 'ai-pitch', duration: 5000 });
     } else {
       toast.error('AI synthesis failed', { id: 'ai-pitch' });
     }
   } finally {
     setIsGeneratingPitch(false);
   }
 };

 const [endorsementCount, setEndorsementCount] = useState(entrepreneur.profile?.endorsementCount || 0);
 const [isEndorsed, setIsEndorsed] = useState(user ? entrepreneur.profile?.endorsements?.includes(user?.id) || false : false);
 const [isEndorsing, setIsEndorsing] = useState(false);

 const handleEndorse = async (e: React.MouseEvent) => {
   e.stopPropagation();
   if (!user || isEndorsing) return;

   setIsEndorsing(true);
   try {
     const res = await api.post('/auth/endorse', { targetUserId: entrepreneur.id || entrepreneur._id });
     setIsEndorsed(res.data.endorsed);
     setEndorsementCount(res.data.endorsementCount);
     toast.success(res.data.endorsed ? 'Startup Endorsed! 🔥' : 'Endorsement removed');
   } catch (err: any) {
     toast.error(err.response?.data?.message || 'Failed to endorse startup');
   } finally {
     setIsEndorsing(false);
   }
 };

 const [showAnalysis, setShowAnalysis] = useState(false);

 const handleOpenAnalysis = (e: React.MouseEvent) => {
   e.stopPropagation();
   setShowAnalysis(true);
 };

 const startupName = entrepreneur.profile?.startupName || entrepreneur.startupName || 'Unnamed Venture';
 const industry = entrepreneur.profile?.industry || entrepreneur.industry || 'Technology';
 const pitch = entrepreneur.profile?.pitchSummary || entrepreneur.pitchSummary || 'Exploring innovative solutions in our ecosystem to drive growth and efficiency.';
 const location = entrepreneur.profile?.location || entrepreneur.location || 'Remote';
 
 return (
 <div 
 className="group relative bg-white/60 border border-white/40 rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(37,99,235,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
 onClick={handleViewProfile}
 style={{ isolation: 'isolate' }}
 >
 
 {/* Header section */}
 <div className="flex items-start justify-between mb-5">
 <div className="flex items-center gap-4">
 <div className="relative">
 <Avatar
 src={entrepreneur.profile?.avatarUrl || entrepreneur.avatarUrl}
 alt={entrepreneur.name}
 size="xl"
 className=" shadow-sm z-10"
 status={entrepreneur.profile?.isOnline || entrepreneur.isOnline ? 'online' : 'offline'}
 />
 </div>
 <div>
 <h3 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 line-clamp-1">{startupName}</h3>
 <p className="text-sm font-semibold text-primary-600 flex items-center gap-1 mt-0.5">
 <Sparkles size={14} /> {industry}
 </p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-2">
   <div className="bg-gray-100/80 px-3 py-1.5 rounded-full flex items-center gap-1.5 ">
   <MapPin size={12} className="text-gray-500" />
   <span className="text-xs font-semibold text-gray-700">{location}</span>
   </div>
   <button 
     onClick={handleGeneratePitch} 
     disabled={isGeneratingPitch || !!aiPitch}
     className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full transition-all border ${
       aiPitch 
         ? 'bg-purple-100 text-purple-700 border-purple-200'
         : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50 hover:scale-105 shadow-sm'
     }`}
   >
     {aiPitch ? <Sparkles size={12} className="text-purple-500" /> : <Sparkles size={12} />}
     {isGeneratingPitch ? 'Synthesizing...' : aiPitch ? 'AI Optimized' : 'AI Summary'}
   </button>
 </div>
 </div>

 {/* Pitch Summary */}
 <div className="mb-6 h-[72px] relative overflow-hidden group/pitch flex flex-col justify-center">
   <p className={`text-[15px] leading-relaxed line-clamp-3 font-medium transition-all ${
     aiPitch ? 'text-gray-900 italic tracking-tight' : 'text-gray-600'
   }`}>"{aiPitch || pitch}"</p>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100/80">
 <div className="flex gap-3 items-center">
 <div className="bg-white p-2 rounded-lg shadow-sm text-secondary-500"><Target size={16} /></div>
 <div>
 <p className="text-xs font-semibold text-gray-400">Funding Goal</p>
 <p className="text-sm font-medium text-gray-900">{entrepreneur.profile?.fundingNeeded || entrepreneur.fundingNeeded || 'Undisclosed'}</p>
 </div>
 </div>
 <div className="flex gap-3 items-center">
 <div className="bg-white p-2 rounded-lg shadow-sm text-accent-500"><Users size={16} /></div>
 <div>
 <p className="text-xs font-semibold text-gray-400">Team Size</p>
 <p className="text-sm font-medium text-gray-900">{entrepreneur.profile?.teamSize || entrepreneur.teamSize || '1-10'} Members</p>
 </div>
 </div>
 </div>

  {/* AI Analysis Overlay */}
  {showAnalysis && (
    <div className="absolute inset-0 z-50 p-2 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <AiMatchAnalysis 
        targetUserId={entrepreneur.id || entrepreneur._id} 
        targetName={startupName} 
        onClose={() => setShowAnalysis(false)} 
      />
    </div>
  )}

 {/* Actions */}
 {showActions && (
 <div className="flex justify-between items-center pt-2 gap-3">
 <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
 <Avatar size="xs" src={entrepreneur.avatarUrl} alt="" className="opacity-50" />
 <span>Led by {entrepreneur.name.split(' ')[0]}</span>
 </div>
 <div className="flex gap-2">
 {user && user.role === 'investor' && (
   <button 
     onClick={handleEndorse}
     disabled={isEndorsing}
     className={`h-10 flex items-center justify-center gap-1.5 px-3 rounded-full transition-all duration-300 font-bold text-xs ${
       isEndorsed 
         ? 'bg-orange-100 text-orange-600 border border-orange-200' 
         : 'bg-white border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200'
     }`}
   >
     <Flame size={16} className={isEndorsed ? 'fill-orange-500' : ''} />
     <span>{endorsementCount > 0 ? endorsementCount : 'Endorse'}</span>
   </button>
 )}
 <button 
 onClick={handleMessage}
 className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 "
 >
 <MessageCircle size={18} />
 </button>
 <button 
    onClick={handleOpenAnalysis}
    className="w-10 h-10 flex items-center justify-center bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-full transition-all duration-300 border border-primary-100 shadow-sm"
    title="AI Pulse Analysis"
  >
    <Brain size={18} />
  </button>
 <button 
 onClick={handleViewProfile}
 className="px-5 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-sm"
 >
 View Deck <ExternalLink size={16} className="ml-2 opacity-80" />
 </button>
 </div>
 </div>
 )}
 </div>
 );
};