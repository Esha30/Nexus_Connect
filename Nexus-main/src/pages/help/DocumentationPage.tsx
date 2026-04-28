import React, { useState } from 'react';
import { 
  Shield, 
  Cpu, 
  Users, 
  Handshake, 
  MessageSquare, 
  Video, 
  FileLock, 
  CreditCard, 
  Zap,
  ChevronRight,
  BookOpen,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('onboarding');

  const sections: DocSection[] = [
    {
      id: 'onboarding',
      title: 'Onboarding & Identity',
      icon: <Shield size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Your journey begins with defining your operational role. Nexus supports two primary identities: <span className="text-primary-600 font-bold">Entrepreneurs</span> and <span className="text-primary-600 font-bold">Investors</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Setting Up Your Profile</h4>
              <p className="text-sm text-gray-500 italic">Navigate to the Profile section to upload your pitch deck, team info, or investment thesis. High-quality data increases connection probability by 40%.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Identity Verification</h4>
              <p className="text-sm text-gray-500 italic">Enable 2FA in Settings for Sub-Zero security levels. This protects your venture assets from unauthorized access.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Intelligence Hub (Dashboard)',
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            The Dashboard is your strategic command center. It provides real-time telemetry on your network performance and active deals.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="mt-1 bg-primary-100 p-1.5 rounded-md h-fit"><Zap size={14} className="text-primary-600" /></div>
              <div>
                <h5 className="font-bold text-gray-900">Activity Protocol</h5>
                <p className="text-sm text-gray-500">Track every interaction, from connection requests to document views, in a unified chronological feed.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 bg-primary-100 p-1.5 rounded-md h-fit"><Info size={14} className="text-primary-600" /></div>
              <div>
                <h5 className="font-bold text-gray-900">Resource Statistics</h5>
                <p className="text-sm text-gray-500">Monitor your active collaborations and meeting velocity at a glance.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'networking',
      title: 'Operational Networking',
      icon: <Users size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Find and connect with the right partners using our Intelligence-driven directory.
          </p>
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-3">How to Connect:</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm text-blue-800 font-medium">
              <li>Navigate to <span className="underline italic">Explore Investors</span> or <span className="underline italic">Explore Entrepreneurs</span>.</li>
              <li>Filter by Industry, Investment Stage, or Funding Needed.</li>
              <li>Operationalize the "Connect" button to send a formal request.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'collaboration',
      title: 'Collaboration Logic',
      icon: <Handshake size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Collaborations are structured interests that pave the way for successful funding rounds.
          </p>
          <div className="space-y-4">
            <div className="p-5 border-l-4 border-primary-500 bg-gray-50 rounded-r-xl">
              <h4 className="font-bold text-gray-900">Requests Console</h4>
              <p className="text-sm text-gray-500 mt-1">Found in the Dashboard side panel. Accept to open high-bandwidth communication lines. Reject to keep your network focused.</p>
            </div>
            <div className="p-5 border-l-4 border-green-500 bg-gray-50 rounded-r-xl">
              <h4 className="font-bold text-gray-900">Active Deals</h4>
              <p className="text-sm text-gray-500 mt-1">Once a request is accepted, it becomes an 'Active Deal' viewable in the Decisions tab.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'messaging',
      title: 'Sub-Zero Messaging',
      icon: <MessageSquare size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Nexus uses encrypted, low-latency protocols for all communication.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><MessageSquare size={20}/></div>
              <h5 className="font-bold text-gray-900 text-sm">Rich Chat</h5>
              <p className="text-xs text-gray-500 mt-1 italic">Real-time typing indicators and read receipts.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Handshake size={20}/></div>
              <h5 className="font-bold text-gray-900 text-sm">File Share</h5>
              <p className="text-xs text-gray-500 mt-1 italic">Send assets directly within the chat interface.</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Video size={20}/></div>
              <h5 className="font-bold text-gray-900 text-sm">Direct Calls</h5>
              <p className="text-xs text-gray-500 mt-1 italic">Instant WebRTC peer-to-peer video and audio.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'documents',
      title: 'Secure Repository',
      icon: <FileLock size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Manage your startup's technical and legal assets with Sub-Zero security.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100">
              <div className="text-primary-600"><Zap size={20} /></div>
              <div>
                <h5 className="font-bold text-gray-900">Categorization Protocol</h5>
                <p className="text-sm text-gray-500">Organize assets into Pitch Decks, Financials, or Legal documents for quick discovery.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100">
              <div className="text-primary-600"><Handshake size={20} /></div>
              <div>
                <h5 className="font-bold text-gray-900">E-Signature Logic</h5>
                <p className="text-sm text-gray-500">Coordinate and execute legal agreements directly within the terminal.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl border border-gray-100">
              <div className="text-primary-600"><Shield size={20} /></div>
              <div>
                <h5 className="font-bold text-gray-900">Secure Sharing</h5>
                <p className="text-sm text-gray-500">Selectively grant view access to specific connections without ever sending a file over insecure email.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'meetings',
      title: 'Virtual Boardroom',
      icon: <Video size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Schedule and execute high-bandwidth venture meetings.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 font-medium pl-2">
            <li>Integrate with your preferred calendar.</li>
            <li>Join secure, private meeting rooms built for venture discussions.</li>
            <li>Maintain historical meeting logs for operational tracking.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'billing',
      title: 'Billing Protocol',
      icon: <CreditCard size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Manage your Nexus subscription and access higher network bandwidth.
          </p>
          <div className="p-6 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-600/20">
            <h4 className="font-bold mb-2">Plan Tiers:</h4>
            <div className="flex justify-between text-sm opacity-90 border-b border-white/20 pb-2 mb-2">
              <span>Starter</span>
              <span className="font-bold">Active</span>
            </div>
            <div className="flex justify-between text-sm opacity-90 border-b border-white/20 pb-2 mb-2">
              <span>Pro</span>
              <span className="font-bold">Unlock AI + Unlimited Connects</span>
            </div>
            <div className="flex justify-between text-sm opacity-90 pb-2">
              <span>Enterprise</span>
              <span className="font-bold">White-label Protocol</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: 'Nexus Copilot',
      icon: <Zap size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Leverage Gemini-powered Intelligence to perfect your venture pitch.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 border-dashed">
              <h5 className="font-bold text-primary-900 mb-1">Pitch Analysis</h5>
              <p className="text-xs text-primary-700 font-medium">AI reviews your document repository to spot gaps in your narrative.</p>
            </div>
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 border-dashed">
              <h5 className="font-bold text-primary-900 mb-1">Response Logic</h5>
              <p className="text-xs text-primary-700 font-medium">Generate high-conversion responses to investor inquiries.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'feed',
      title: 'Global Feed & Broadcasts',
      icon: <Users size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Stay updated with the latest ecosystem intelligence using the Global Feed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Create Broadcasts</h4>
              <p className="text-sm text-gray-500 italic">Share your startup's milestones, funding needs, or investment thesis to the entire network to attract inbound requests.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Engage & Network</h4>
              <p className="text-sm text-gray-500 italic">Like and comment on other users' broadcasts to build operational rapport before sending a formal collaboration request.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Real-time Alerts',
      icon: <Zap size={18} />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 leading-relaxed font-medium">
            Nexus uses real-time, low-latency syncing for all ecosystem alerts and notifications.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 font-medium pl-2">
            <li>Get instant alerts for incoming collaboration requests, messages, and meetings.</li>
            <li>In-app badges auto-refresh every 2 seconds to ensure no data loss during network shifts.</li>
            <li>Clicking a notification immediately routes you to the relevant operational console.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16">
      {/* Hero Header */}
      <div className="relative pt-12 pb-20 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
        <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/10 rounded-full pointer-events-none" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/10 rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold mb-6 ">
            <BookOpen size={14} /> Documentation Center
          </div>
          <h1 className="text-2xl md:text-2xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
            Nexus <span className="text-primary-600">Protocol.</span>
          </h1>
          <p className="text-lg md:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
            Technical guidance and operational intelligence for maximizing your venture scaling protocol.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 w-full pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-1">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-4 px-4 bg-gray-50 py-2 rounded-md">Topic Protocol</h3>
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 translate-x-1' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`${activeSection === section.id ? 'text-white' : 'text-gray-400'}`}>
                  {section.icon}
                </span>
                {section.title}
                {activeSection === section.id && <ChevronRight size={14} className="ml-auto animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Card className="border-gray-100 shadow-2xl bg-white rounded-2xl overflow-hidden min-h-[500px]">
              <CardHeader className="bg-gray-50/30 border-b border-gray-50 px-8 py-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 rounded-2xl text-primary-600 shadow-sm">
                    {sections.find(s => s.id === activeSection)?.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="p-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {sections.find(s => s.id === activeSection)?.content}
                </div>
              </CardBody>
            </Card>

            <div className="mt-8 flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="text-sm font-medium text-gray-500">
                Still need operational assistance?
              </div>
              <Button 
                variant="outline" 
                className="bg-white rounded-xl shadow-sm border-gray-200"
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support Hub
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
