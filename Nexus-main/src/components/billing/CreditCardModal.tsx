import React, { useState } from 'react';
import { 
 CreditCard, 
 Building2, 
 ChevronDown, 
 Info,
 Check,
 ArrowLeft,
 Layout
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CardData {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

interface CreditCardModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: (cardData: CardData) => void;
 planName: string;
 amount: string;
 isLoading?: boolean;
}

export const CreditCardModal: React.FC<CreditCardModalProps> = ({ 
 isOpen, 
 onClose, 
 onConfirm, 
 planName, 
 amount,
 isLoading 
 }) => {
 const [email, setEmail] = useState('');
 const [cardName, setCardName] = useState('');
 const [cardNumber, setCardNumber] = useState('');
 const [expiry, setExpiry] = useState('');
 const [cvc, setCvc] = useState('');
 const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white lg:bg-gray-100/80 transition-all duration-500 overflow-y-auto">
 {/* Desktop Wrapper */}
 <div className="relative w-full h-full lg:h-auto lg:max-w-6xl lg:bg-white lg:rounded-[1.5rem] lg:shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
 
 {/* LEFT PANE: Product Summary (bg-gray-50) */}
 <div className="w-full lg:w-[42%] bg-[#f8f9fb] border-r border-gray-100 p-8 lg:p-14 flex flex-col">
 <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-12 group">
 <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
 <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center p-1">
 <Building2 size={14} className="text-gray-600" />
 </div>
 <span className="text-sm font-medium tracking-tight text-gray-700">New business sandbox</span>
 <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-medium text-gray-500 ">Sandbox</span>
 </button>

 <div className="flex-1">
 <p className="text-gray-500 font-medium mb-1 text-sm">Subscribe to {planName}</p>
 <div className="flex items-baseline gap-2 mb-4">
 <span className="text-2xl font-medium text-gray-900 tracking-tight">{amount}</span>
 <span className="text-gray-500 font-medium text-lg">per month</span>
 </div>
 
 <p className="text-gray-600 text-sm font-medium leading-relaxed mb-8">
 Advanced features for growing startups and active investors.
 </p>

 <div className="space-y-4 pt-8 border-t border-gray-200">
 {[
 'Unlimited verified networking',
 'Advanced deal-flow analytics',
 'Priority pitch visibility',
 'Direct document requesting'
 ].map((feature, i) => (
 <div key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
 <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white p-0.5">
 <Check size={12} strokeWidth={4} />
 </div>
 {feature}
 </div>
 ))}
 </div>
 </div>

 <div className="mt-20 pt-8 border-t border-gray-200 flex items-center justify-between opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
 <div className="flex items-center gap-1.5 grayscale opacity-50">
 <span className="text-xs font-medium ">Powered by</span>
 <span className="text-lg font-medium text-primary-600 italic">stripe</span>
 </div>
 <div className="flex gap-4">
 <span className="text-xs font-medium text-gray-400 ">Terms</span>
 <span className="text-xs font-medium text-gray-400 ">Privacy</span>
 </div>
 </div>
 </div>

 {/* RIGHT PANE: Payment Form */}
 <div className="w-full lg:w-[58%] bg-white p-8 lg:p-14 overflow-y-auto">
 
 {/* Pay with Link */}
 <div className="mb-10">
 <button className="w-full bg-[#00d66f] hover:bg-[#00c968] active:scale-[0.98] py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm group">
 <span className="text-white font-medium text-lg tracking-tight">Pay with</span>
 <div className="bg-white px-2 py-0.5 rounded leading-none">
 <span className="text-[#00d66f] font-medium text-lg flex items-center">
 <Layout size={18} className="mr-1 fill-[#00d66f]" /> link
 </span>
 </div>
 </button>
 <div className="relative flex items-center justify-center my-8">
 <div className="w-full h-px bg-gray-100" />
 <span className="absolute bg-white px-4 text-xs font-medium text-gray-400 ">or</span>
 </div>
 </div>

 {/* Contact & Payment Form */}
 <div className="space-y-8">
 <section>
 <h3 className="text-sm font-medium text-gray-700 mb-3">Contact information</h3>
 <div className="relative group">
 <input 
 type="email"
 placeholder="email@example.com"
 className="w-full border border-gray-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-white shadow-sm"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>
 </section>

 <section>
 <h3 className="text-sm font-medium text-gray-700 mb-3">Payment method</h3>
 <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
 {/* Tabs */}
 <div className="flex border-b border-gray-100">
 <button 
 onClick={() => setPaymentMethod('card')}
 className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-all ${paymentMethod === 'card' ? 'bg-white text-gray-900 border-b-2 border-primary-500' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
 >
 <CreditCard size={18} /> Card
 </button>
 <button 
 onClick={() => setPaymentMethod('bank')}
 className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-all ${paymentMethod === 'bank' ? 'bg-white text-gray-900 border-b-2 border-primary-500' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
 >
 <Building2 size={18} /> Bank <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded ml-1">$5 back</span>
 </button>
 </div>

 {/* Card Details (Stripe Style) */}
 <div className="p-4 space-y-4">
 <div className="relative group">
 <h4 className="text-xs font-medium text-gray-400 mb-1 px-1">Card information</h4>
 <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all bg-white">
 <div className="relative border-b border-gray-100">
 <input 
 placeholder="1234 1234 1234 1234"
 className="w-full p-3 font-mono text-sm outline-none bg-transparent"
 value={cardNumber}
 onChange={(e) => setCardNumber(e.target.value)}
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-60">
 <div className="w-8 h-5 bg-[#1a1f71] rounded flex items-center justify-center text-[6px] text-white font-medium italic">VISA</div>
 <div className="w-8 h-5 bg-[#eb001b] rounded flex items-center justify-center text-[6px] text-white font-medium italic">MC</div>
 </div>
 </div>
 <div className="flex divide-x divide-gray-100">
 <input 
 placeholder="MM / YY"
 className="w-1/2 p-3 text-sm font-medium outline-none bg-transparent"
 value={expiry}
 onChange={(e) => setExpiry(e.target.value)}
 />
 <div className="w-1/2 relative">
 <input 
 placeholder="CVC"
 className="w-full p-3 text-sm font-medium outline-none bg-transparent"
 value={cvc}
 onChange={(e) => setCvc(e.target.value)}
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 grayscale opacity-40">
 <Info size={16} />
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="group">
 <h4 className="text-xs font-medium text-gray-400 mb-1 px-1">Cardholder name</h4>
 <input 
 placeholder="Full name on card"
 className="w-full border border-gray-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-white shadow-sm"
 value={cardName}
 onChange={(e) => setCardName(e.target.value)}
 />
 </div>

 <div className="group">
 <h4 className="text-xs font-medium text-gray-400 mb-1 px-1">Country or region</h4>
 <div className="relative">
 <select className="w-full border border-gray-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none bg-white shadow-sm appearance-none">
 <option>Pakistan</option>
 <option>United States</option>
 <option>United Kingdom</option>
 <option>United Arab Emirates</option>
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="flex items-start gap-4 p-4 border border-blue-50 bg-primary-50/20 rounded-lg group/check cursor-pointer">
 <div className="w-5 h-5 border-2 border-primary-200 rounded flex items-center justify-center mt-1 bg-white group-hover/check:border-primary-500 transition-colors">
 <div className="w-2 h-2 bg-primary-500 rounded-sm opacity-0 group-hover/check:opacity-100" />
 </div>
 <div>
 <h4 className="text-xs font-medium text-gray-900 mb-1">Save my information for faster checkout</h4>
 <p className="text-xs text-gray-500 font-medium leading-relaxed">Pay securely at New business sandbox and everywhere Link is accepted.</p>
 </div>
 </section>

 <div className="pt-6">
 <Button 
 fullWidth
 variant="primary"
 size="lg"
 className="py-4 bg-[#0570de] hover:bg-[#005cb1] active:bg-[#004a8f] font-medium text-base transition-all duration-300 shadow-[0_4px_12px_rgba(5,112,222,0.3)] rounded-lg"
 onClick={() => onConfirm({ cardName, cardNumber, expiry, cvc })}
 isLoading={isLoading}
 >
 Subscribe
 </Button>
 <p className="text-center text-xs text-gray-400 mt-6 font-medium max-w-sm mx-auto">
 By subscribing, you agree to our <span className="text-primary-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and authorize recurring monthly payments.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
