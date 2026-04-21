import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface Plan {
 id: 'starter' | 'pro' | 'enterprise';
 name: string;
 price: string;
 description: string;
 features: string[];
 isPopular?: boolean;
}

interface PricingGridProps {
 currentPlan: string;
 onUpgrade: (planId: 'starter' | 'pro' | 'enterprise') => void;
 isLoading?: boolean;
}

export const PricingGrid: React.FC<PricingGridProps> = ({ currentPlan, onUpgrade, isLoading }) => {
 const plans: Plan[] = [
 {
 id: 'starter',
 name: 'Seed Access',
 price: '$0',
 description: 'Foundational entry for network discovery.',
 features: [
 'Standard Profile Listing',
 'Basic Connection Requests',
 '3 Messages Per Day',
 'Standard Support'
 ]
 },
 {
 id: 'pro',
 name: 'Venture Pro',
 price: '$100',
 description: 'Optimized protocol for active deal-makers.',
 features: [
 'Unlimited Messaging',
 'Priority Listing Placement',
 'Advanced Deal Analytics',
 'Verified Member Badge',
 'Direct Document Requests'
 ],
 isPopular: true
 },
 {
 id: 'enterprise',
 name: 'Custom Node',
 price: 'Custom',
 description: 'Dedicated infrastructure for venture firms.',
 features: [
 'Dedicated Account Manager',
 'White-label Pitch Decks',
 'Custom Data Integrations',
 'Unlimited Documents Storage',
 'Tier-1 Support'
 ]
 }
 ];

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {plans.map((plan) => (
 <div 
 key={plan.id}
 className={`relative p-10 rounded-[3rem] border-2 transition-all duration-500 flex flex-col ${
 plan.isPopular 
 ? 'border-primary-500 bg-gray-900 text-white shadow-sm scale-[1.05] ring-[12px] ring-primary-500/10 z-10' 
 : 'border-white dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 shadow-sm hover:border-primary-200 dark:hover:border-gray-600'
 }`}
 >
 {plan.isPopular && (
 <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary-600 to-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
 Recommended Protocol
 </div>
 )}

 <div className="mb-8">
 <h3 className={`text-2xl font-medium tracking-tight ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
 {plan.name}
 </h3>
 <p className={`text-sm font-medium mt-2 h-10 ${plan.isPopular ? 'text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
 {plan.description}
 </p>
 </div>
 
 <div className="mb-10 flex flex-col justify-end h-20">
 <div className="flex items-baseline gap-2">
 <span className={`text-2xl font-medium ${plan.isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
 {plan.price}
 </span>
 {plan.price !== 'Custom' && <span className={`font-medium text-sm ${plan.isPopular ? 'text-indigo-400' : 'text-gray-400'}`}>/ mo</span>}
 </div>
 </div>

 <Button
 fullWidth
 variant={currentPlan === plan.id ? 'outline' : (plan.isPopular ? 'primary' : 'outline')}
 disabled={currentPlan === plan.id || isLoading}
 onClick={() => onUpgrade(plan.id)}
 className={`py-5 mb-10 font-medium rounded-lg shadow-sm text-lg active:scale-95 transition-transform ${
 currentPlan === plan.id 
 ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-900/30 cursor-default opacity-100' 
 : plan.isPopular
 ? 'bg-gradient-to-r from-primary-600 to-indigo-600 border-none shadow-primary-500/40'
 : 'dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
 }`}
 >
 {currentPlan === plan.id ? (
 <span className="flex items-center justify-center gap-3">
 <CheckCircle2 size={24} strokeWidth={3} /> Active Tier
 </span>
 ) : plan.price === 'Custom' ? 'Contact Sales' : 'Commit Upgrade'}
 </Button>

 <div className={`space-y-5 pt-8 border-t ${plan.isPopular ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700/50'}`}>
 {plan.features.map((feature, i) => (
 <div key={i} className="flex items-start gap-4 group">
 <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${plan.isPopular ? 'bg-white/10' : 'bg-primary-50 dark:bg-primary-900/30'}`}>
 <Check size={18} className={plan.isPopular ? 'text-emerald-400' : 'text-primary-600 dark:text-primary-400'} strokeWidth={4} />
 </div>
 <span className={`text-sm font-medium transition-colors ${
 plan.isPopular 
 ? 'text-indigo-100 group-hover:text-white' 
 : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
 }`}>
 {feature}
 </span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 );
};
