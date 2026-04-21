import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users, Shield, Loader } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import api from '../../api/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  initialSharedWith: string[];
  onShare: (userIds: string[]) => Promise<void>;
}

interface Connection {
  id: string;
  _id: string;
  name: string;
  profile?: {
    avatarUrl?: string;
    industry?: string;
  };
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  documentId, 
  initialSharedWith,
  onShare 
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSharedWith);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
      setSelectedIds(initialSharedWith);
    }
  }, [isOpen, initialSharedWith]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/collaborations');
      // Collaborations list contains { investor, entrepreneur }. 
      // We need to extract the 'partner'
      const activeConnections = res.data
        .filter((c: any) => c.status === 'accepted')
        .map((c: any) => {
          // If I am investor, partner is entrepreneur. If I am entrepreneur, partner is investor.
          // Note: The backend normalized 'investor' and 'entrepreneur' objects.
          // We'll compare IDs to see who is who.
          const currentUserId = localStorage.getItem('business_nexus_user') ? JSON.parse(localStorage.getItem('business_nexus_user')!).id : '';
          return c.investor._id === currentUserId ? c.entrepreneur : c.investor;
        });
      
      // De-duplicate if necessary
      const uniqueConnections = Array.from(new Map(activeConnections.map((item: any) => [item._id, item])).values()) as Connection[];
      setConnections(uniqueConnections);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      toast.error('Failed to load your connections');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (userId: string) => {
    setSelectedIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onShare(selectedIds);
      onClose();
    } catch (err) {
      console.error('Sharing error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredConnections = connections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md shadow-2xl bg-white rounded-2xl overflow-hidden border-none">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Share Protocol</h2>
                <p className="text-xs text-gray-400 font-medium">Manage access for connections</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </CardHeader>

        <CardBody className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search connections..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 hide-scrollbar">
            {isLoading ? (
              <div className="flex justify-center p-10"><Loader className="animate-spin text-primary-600" /></div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center p-10 text-gray-400 border-2 border-dashed border-gray-50 rounded-2xl">
                <Users className="mx-auto mb-3 opacity-20" size={40} />
                <p className="text-xs font-semibold">No active connections found</p>
              </div>
            ) : (
              filteredConnections.map(conn => (
                <div 
                  key={conn._id}
                  onClick={() => toggleSelection(conn._id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedIds.includes(conn._id) 
                      ? 'bg-primary-50 border-primary-200 shadow-sm' 
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={conn.profile?.avatarUrl} alt={conn.name} size="sm" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{conn.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{conn.profile?.industry || 'VC Partner'}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    selectedIds.includes(conn._id) 
                      ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-600/30' 
                      : 'border-2 border-gray-200 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-xl text-gray-500 font-bold" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 rounded-xl bg-primary-600 shadow-xl shadow-primary-600/20 font-bold"
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={isSaving ? <Loader className="animate-spin" size={18}/> : <Shield size={18}/>}
            >
              {isSaving ? 'Updating...' : 'Authorize Access'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
