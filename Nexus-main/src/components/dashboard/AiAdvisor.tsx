import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, BrainCircuit, Zap, Target, TrendingUp } from 'lucide-react';

const INSIGHTS = [
  { 
    title: 'FinTech Momentum', 
    desc: 'B2B payment gateways are seeing a 14% increase in institutional interest this week.', 
    icon: <TrendingUp className="text-emerald-500" size={18} />,
    type: 'market'
  },
  { 
    title: 'Strategic Alignment', 
    desc: 'Founders with previous exits are 3x more likely to secure follow-on funding in SaaS.', 
    icon: <Target className="text-blue-500" size={18} />,
    type: 'strategy'
  },
  { 
    title: 'Efficiency Note', 
    desc: 'Post-revenue startups are currently optimizing burn rates by 20% using AI-first internal tooling.', 
    icon: <Zap className="text-amber-500" size={18} />,
    type: 'operational'
  }
];

export const AiAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextInsight = () => {
    setCurrentIdx((prev) => (prev + 1) % INSIGHTS.length);
  };

  const insight = INSIGHTS[currentIdx];

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {isOpen ? (
        <div className="w-80 bg-gray-900 rounded-[2rem] p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
                <BrainCircuit size={18} />
              </div>
              <div>
                <h4 className="text-white text-xs font-black uppercase tracking-tight">Nexus AI Advisor</h4>
                <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Neural Logic v2.5</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              {insight.icon}
              <h5 className="text-xs font-black text-white uppercase tracking-wider">{insight.title}</h5>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              "{insight.desc}"
            </p>
          </div>

          <button 
            onClick={nextInsight}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2 group relative z-10"
          >
            Cycle Next Insight <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full shadow-2xl shadow-primary-600/40 hover:bg-primary-700 transition-all hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-20" />
          <Sparkles className="relative z-10" size={28} />
          
          {/* Tooltip */}
          <div className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-white/10 pointer-events-none translate-x-4 group-hover:translate-x-0">
            AI Advisory Active
          </div>
        </button>
      )}
    </div>
  );
};
