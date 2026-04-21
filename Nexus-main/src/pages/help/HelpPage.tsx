import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Book, MessageCircle, Phone, Mail, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const faqs = [
 {
 question: 'How do I connect with investors?',
 answer: 'You can browse our investor directory and send connection requests. Once an investor accepts, you can start messaging them directly through our platform.'
 },
 {
 question: 'What should I include in my startup profile?',
 answer: 'Your startup profile should include a compelling pitch, funding needs, team information, market opportunity, and any traction or metrics that demonstrate your progress.'
 },
 {
 question: 'How do I share documents securely?',
 answer: 'You can upload documents to your secure document vault and selectively share them with connected investors. All documents are encrypted and access-controlled.'
 },
 {
 question: 'What are collaboration requests?',
 answer: 'Collaboration requests are formal expressions of interest from investors. They indicate that an investor wants to learn more about your startup and potentially discuss investment opportunities.'
 }
];

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openTerminal = () => {
    window.dispatchEvent(new CustomEvent('open-support'));
    toast.success('Nexus Support Terminal active', { icon: '🚀' });
  };

  return (
 <div className="space-y-10 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16">
 {/* Hero Header */}
 <div className="relative pt-12 pb-24 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
 <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/20 rounded-full pointer-events-none" />
 
 <div className="max-w-7xl mx-auto relative z-10">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-medium mb-6 ">
 <MessageCircle size={14} /> Support Center
 </div>
 <h1 className="text-2xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
 Help & <span className="text-primary-600">Guidance.</span>
 </h1>
 <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
 Find technical protocols, operational answers, or connect with our support engineers for real-time assistance.
 </p>
 
 {/* Search */}
 <div className="max-w-xl mt-10">
 <Input
 placeholder="Search protocol intelligence (FAQs)..."
 startAdornment={<Search size={22} className="text-gray-400" />}
 fullWidth
 className="bg-white/80 border-gray-200 rounded-lg py-2.5 px-6 shadow-sm shadow-blue-600/5 focus:ring-blue-600/20"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 w-full pb-20 space-y-10">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {/* Quick links */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-sm transition-all group">
 <CardBody className="text-center p-10">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-lg mb-6 group-hover:scale-110 transition-transform ">
 <Book size={28} className="text-primary-600" />
 </div>
 <h2 className="text-lg font-medium text-gray-900 tracking-tight">Documentation</h2>
 <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
 Browse our detailed technical documentation and startup guides.
 </p>
 <Link to="/help/docs">
 <Button
 variant="outline"
 className="mt-6 rounded-lg font-medium border-gray-200 text-xs "
 rightIcon={<ExternalLink size={14} />}
 >
 View Protocol
 </Button>
 </Link>
 </CardBody>
 </Card>
 
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-sm transition-all group">
 <CardBody className="text-center p-10">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-lg mb-6 group-hover:scale-110 transition-transform ">
 <MessageCircle size={28} className="text-primary-600" />
 </div>
 <h2 className="text-lg font-medium text-gray-900 tracking-tight">Live Support</h2>
 <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
 Chat with our engineering support team in real-time.
 </p>
 <Button 
  className="mt-6 rounded-lg font-medium bg-primary-600 shadow-sm text-xs py-3"
  onClick={openTerminal}
 >
 Start Terminal
 </Button>
 </CardBody>
 </Card>
 
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-sm transition-all group">
 <CardBody className="text-center p-10">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-lg mb-6 group-hover:scale-110 transition-transform ">
 <Phone size={28} className="text-primary-600" />
 </div>
 <h2 className="text-lg font-medium text-gray-900 tracking-tight">Contact Us</h2>
 <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed">
 Reach out via encrypted email or direct line.
 </p>
 <Link to="/contact">
    <Button
      variant="outline"
      className="mt-6 rounded-lg font-medium border-gray-200 text-xs "
      leftIcon={<Mail size={14} />}
    >
      Get in Touch
    </Button>
  </Link>
 </CardBody>
 </Card>
 </div>
 
 {/* FAQs */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-5">
 <h2 className="text-sm font-medium text-gray-900 ">Protocol Intelligence (FAQ)</h2>
 </CardHeader>
 <CardBody className="p-8">
 <div className="space-y-8">
 {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
 <div key={index} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0 group">
 <h3 className="text-lg font-medium text-gray-900 mb-3 tracking-tight group-hover:text-primary-600 transition-colors">
 {faq.question}
 </h3>
 <p className="text-base font-medium text-gray-500 leading-relaxed max-w-4xl italic">
 {faq.answer}
 </p>
 </div>
 )) : (
   <div className="text-center py-10">
     <p className="text-gray-500 italic">No protocols found matching your search query.</p>
   </div>
 )}
 </div>
 </CardBody>
 </Card>
 
  <div className="bg-primary-50 p-10 rounded-2xl border border-primary-100 flex flex-col md:flex-row items-center justify-between gap-8">
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-gray-900">Need specific operational support?</h2>
      <p className="text-gray-600 font-medium">Our help desk engineers are available for direct technical assistance.</p>
    </div>
    <Link to="/contact">
      <Button className="rounded-xl px-8 py-4 shadow-lg shadow-primary-600/20 font-bold">
        Go to Contact Center
      </Button>
    </Link>
  </div>
 </div>
 </div>
 );
}