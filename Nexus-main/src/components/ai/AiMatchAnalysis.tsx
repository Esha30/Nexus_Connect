import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Brain, Target, Zap, X } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface SynergyData {
  score: number;
  verdict: string;
  strengths: string[];
  risks: string[];
}

interface AiMatchAnalysisProps {
  targetUserId: string;
  targetName: string;
  onClose: () => void;
}

export const AiMatchAnalysis: React.FC<AiMatchAnalysisProps> = ({ 
  targetUserId, 
  targetName,
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SynergyData | null>(null);

  const performAnalysis = async () => {
    setLoading(true);
    toast.loading(`Synthesizing synergy data for ${targetName}...`, { id: 'ai-analysis' });
    try {
      const res = await api.post('/ai/synergy', { targetUserId });
      setData(res.data);
      toast.success('Synergy Matrix Decoded', { id: 'ai-analysis' });
    } catch (err: any) {
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('Free intelligence meta-limit reached. Upgrade to Pro.', { id: 'ai-analysis' });
      } else {
        toast.error('Synthesis protocol failed.', { id: 'ai-analysis' });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    performAnalysis();
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4 min-h-[300px] flex flex-col justify-center items-center bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="relative">
          <Brain size={48} className="text-primary-500 animate-pulse" />
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full scale-150 animate-ping" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Nexus AI Analysis</h3>
          <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Scanning Market Alignment...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="bg-gray-900 p-6 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-600/20 rounded-lg border border-primary-500/30">
            <Sparkles size={18} className="text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Intelligence Report</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Synergy Pulse: {targetName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - data.score / 100)}
                className="text-primary-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{data.score}%</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-400">Match</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed italic text-gray-300">
              "{data.verdict}"
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-gray-50/50">
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Zap size={12} className="text-primary-500" /> Strategic Strengths
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.strengths.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-bold border border-green-100 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> {s}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Target size={12} className="text-orange-500" /> Risk Vectors
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.risks.map((r, i) => (
              <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[11px] font-bold border border-orange-100 flex items-center gap-1.5">
                <AlertTriangle size={12} /> {r}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2">
           <Button 
            onClick={onClose} 
            className="w-full bg-gray-900 border-none text-[11px] font-bold tracking-widest uppercase py-3 rounded-xl shadow-lg"
          >
            Acknowledge Intelligence
          </Button>
        </div>
      </div>
    </div>
  );
};
