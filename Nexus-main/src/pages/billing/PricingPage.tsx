import React, { useState } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckStar, Shield, Zap } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    setIsProcessing(planName);
    try {
      const res = await api.post('/stripe/create-checkout-session', { plan: planName });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error('Failed to initialize checkout session. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16 bg-gray-50">
      {/* Hero */}
      <div className="relative pt-12 pb-24 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <Badge className="mb-6 bg-primary-50 text-primary-600 font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-2">
            <Zap size={14} /> Global Expansion Protocol
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Scale your <span className="text-primary-600">Venture Connectivity.</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            Unlock premium investor networking, priority access, and enhanced deal-flow analytics.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 sm:px-5 lg:px-16 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pro Plan */}
          <Card className="border-gray-100 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-all relative">
            <CardBody className="p-10 flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nexus Pro</h2>
                <p className="text-gray-500 mt-2 font-medium">Standard access for active venture founders.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$100</span>
                  <span className="text-gray-500 font-medium">/month</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {['Direct investor messaging', 'Up to 5 collaborative deal rooms', 'Standard analytics dashboard', 'Regular matchmaking visibility'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span className="text-gray-600 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleSubscribe('pro')} 
                isLoading={isProcessing === 'pro'}
                disabled={isProcessing !== null}
                className="w-full rounded-xl py-4 font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20"
              >
                Upgrade to Pro
              </Button>
            </CardBody>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-primary-200 shadow-xl shadow-primary-600/10 bg-white rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-400 to-indigo-500" />
            <div className="absolute top-6 right-6">
              <span className="bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Recommended</span>
            </div>
            
            <CardBody className="p-10 flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Shield size={24} className="text-primary-600" /> 
                  Nexus Enterprise
                </h2>
                <p className="text-gray-500 mt-2 font-medium">Full systematic access for power firms.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$500</span>
                  <span className="text-gray-500 font-medium">/month</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {['Unlimited investor messaging', 'Unlimited active deal rooms', 'Advanced predictive analytics', 'Priority matchmaking status', 'Dedicated relationship manager', 'SLA guaranteed support'].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span className="text-gray-600 font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleSubscribe('enterprise')} 
                isLoading={isProcessing === 'enterprise'}
                disabled={isProcessing !== null}
                className="w-full rounded-xl py-4 font-bold outline-none"
              >
                Access Enterprise Protocol
              </Button>
            </CardBody>
          </Card>

        </div>

        <div className="mt-16 text-center">
          <p className="text-sm font-medium text-gray-400">All pricing is subject to local regulatory taxes. Encrypted via Stripe.</p>
        </div>
      </div>
    </div>
  );
};

// Simple Badge component specifically for this file to avoid extra dependencies
const Badge = ({ children, className }: { children: React.ReactNode, className: string }) => (
  <span className={className}>{children}</span>
);
