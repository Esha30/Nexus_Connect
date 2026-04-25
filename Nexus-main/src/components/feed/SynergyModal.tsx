import React from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface SynergyModalProps {
  onClose: () => void;
  data: {
    score: number;
    verdict: string;
    strengths: string[];
    risks: string[];
  } | null;
  isLoading: boolean;
}

export const SynergyModal: React.FC<SynergyModalProps> = ({ onClose, data, isLoading }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md w-full max-w-2xl rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.4)] scale-in overflow-hidden border border-white/50">
        <div className="px-10 py-8 border-b border-gray-100/50 flex justify-between items-center bg-primary-600 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Synergy Intelligence</h3>
              <p className="text-xs font-bold text-primary-100 uppercase tracking-widest opacity-80">AI-Powered Strategic Alignment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-primary-600 animate-pulse" size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Analyzing Ecosystem DNA...</p>
                <p className="text-sm text-gray-500 mt-1">Cross-referencing mandates and milestones</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-10">
              {/* Score Section */}
              <div className="flex items-center gap-10">
                <div className="relative flex-shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * data.score) / 100}
                      className="text-primary-600 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{data.score}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Match</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Strategic Verdict</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800 leading-tight">
                    {data.verdict}
                  </p>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Key Strengths</span>
                  </div>
                  <ul className="space-y-3">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-gray-600">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl w-fit">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Calculated Risks</span>
                  </div>
                  <ul className="space-y-3">
                    {data.risks.map((r, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-gray-600">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center max-w-sm">
                  This analysis is generated by the Nexus Synergy Engine based on profile data and platform activity.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Failed to generate synergy report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
