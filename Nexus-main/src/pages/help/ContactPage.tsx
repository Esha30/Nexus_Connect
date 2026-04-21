import React, { useState } from 'react';
import { Mail, Phone, Check, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api/api';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return toast.error('Please enter a message');

    setIsSubmitting(true);
    try {
      const res = await api.post('/support', { 
        name: formData.name,
        email: formData.email,
        message: formData.message 
      });
      
      setTicketId(res.data.ticketId);
      setIsSubmitted(true);
      toast.success('Official inquiry registered', { icon: '🤝' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Transmission failed. Contact system unreachable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20 pt-6">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} /> Transmission Protocol
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Contact <span className="text-primary-600">Operations.</span></h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Submit a formal ticket to our engineering and investment support teams. 
          Average resolution time: <span className="text-gray-900 font-bold">2.4 hours</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Sidebar */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm bg-gray-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-2xl -mr-16 -mt-16" />
            <CardBody className="p-8 relative z-10">
              <h3 className="font-bold text-lg mb-6">Nexus HQ</h3>
              <div className="space-y-6">
                <a href="mailto:nexus@support.com" className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover/item:border-primary-500 transition-colors">
                    <Mail size={18} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Email Protocol</p>
                    <p className="text-sm font-medium">nexus@support.com</p>
                  </div>
                </a>
                <a href="tel:+1800NEXUSHQ" className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover/item:border-primary-500 transition-colors">
                    <Phone size={18} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Direct Line</p>
                    <p className="text-sm font-medium">+1 (800) NEXUS-HQ</p>
                  </div>
                </a>
              </div>

              <div className="mt-12 pt-12 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <AlertCircle size={14} />
                  <span>Encrypted Channel Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500 font-medium italic">
                  All transmissions are recorded in our distributed support ledger for priority verification and compliance auditing.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2">
          <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardBody className="p-10 lg:p-12">
              {isSubmitted ? (
                <div className="text-center py-10 animate-fade-in flex flex-col items-center">
                  <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Transmission Successful</h3>
                  <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed italic">
                    "Your request has been registered in the Nexus central ledger. Our engineers will respond shortly."
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-10 w-full max-w-xs shadow-sm">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 text-center">Ticket Reference</p>
                    <p className="text-lg font-mono font-bold text-primary-600 text-center">{ticketId || 'ST-SYNCING'}</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary-600 font-bold hover:bg-primary-50"
                  >
                    Submit New Transmission
                  </Button>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Full Name</span>}
                      placeholder="Identified Identity"
                      className="rounded-xl border-gray-100 bg-gray-50/50 py-3 text-sm font-semibold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    
                    <Input
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Email Address</span>}
                      type="email"
                      placeholder="nexus@protocol.io"
                      className="rounded-xl border-gray-100 bg-gray-50/50 py-3 text-sm font-semibold"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                      Transmission Detail
                    </label>
                    <textarea
                      className="w-full rounded-xl border-gray-100 bg-gray-50/50 shadow-sm focus:border-primary-600 focus:ring-4 focus:ring-primary-600/5 transition-all font-semibold py-4 px-4 h-48 text-sm placeholder:italic"
                      placeholder="Describe your operational requirements or technical inquiries..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="rounded-xl font-bold bg-primary-600 shadow-lg shadow-primary-600/30 px-8 py-4 w-full md:w-auto"
                      rightIcon={<Send size={18} />}
                      isLoading={isSubmitting}
                    >
                      Process Transmission
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
