import React from 'react';
import { Sparkles, Crown, Zap } from 'lucide-react';

interface PlanBadgeProps {
  plan?: string;
  className?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ plan = 'starter', className = '' }) => {
  const normalizedPlan = plan.toLowerCase();

  const config: Record<string, { label: string; icon: React.ReactNode; styles: string }> = {
    starter: {
      label: 'Free Tier',
      icon: <Zap size={10} />,
      styles: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    pro: {
      label: 'Pro',
      icon: <Sparkles size={10} />,
      styles: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    enterprise: {
      label: 'Enterprise',
      icon: <Crown size={10} />,
      styles: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
  };

  const { label, icon, styles } = config[normalizedPlan] || config.starter;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${styles} ${className}`}>
      {icon}
      {label}
    </div>
  );
};
