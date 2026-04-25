import React, { useState, useEffect } from 'react';
import { X, Mail, Building2, Calendar, Shield, Trash2, LayoutGrid, Briefcase, FileText, Activity } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import api from '../../api/api';

interface UserDetailsModalProps {
  userId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, onClose, onDelete }) => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setUserData(res.data);
    } catch (err) {
      console.error('Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;
  if (!userData) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#161B2C] w-full max-w-4xl rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] scale-in overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-500/10 rounded-xl text-primary-500">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Deep Intelligence Report</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Subject UID: {userData._id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Profile info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="text-center">
                <Avatar src={userData.profile?.avatarUrl} alt={userData.name} size="2xl" className="mx-auto mb-6 border-4 border-white/5 p-1 ring-4 ring-primary-500/10" />
                <h4 className="text-2xl font-black text-white mb-1">{userData.name}</h4>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className={`${userData.role === 'investor' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'} uppercase text-[10px] font-black px-3`}>
                    {userData.role}
                  </Badge>
                  {userData.profile?.isVerified && <Badge className="bg-blue-500/10 text-blue-400 uppercase text-[10px] font-black px-3">Verified</Badge>}
                </div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed px-4">{userData.profile?.bio || 'No bio provided.'}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail size={16} className="text-primary-500" />
                  <span className="text-sm font-bold">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Building2 size={16} className="text-primary-500" />
                  <span className="text-sm font-bold">{userData.profile?.company || 'Nexus Platform'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar size={16} className="text-primary-500" />
                  <span className="text-sm font-bold">Joined {new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                fullWidth 
                className="mt-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black py-4 rounded-2xl transition-all"
                onClick={() => {
                  onDelete(userData._id);
                  onClose();
                }}
                leftIcon={<Trash2 size={18} />}
              >
                Terminate Account
              </Button>
            </div>

            {/* Right Col: Activity & Data */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} className="text-primary-500" /> Ecosystem footprint
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <LayoutGrid size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Broadcasts</span>
                    </div>
                    <p className="text-3xl font-black text-white">{userData.postCount ?? 0}</p>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deals</span>
                    </div>
                    <p className="text-3xl font-black text-white">0</p>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={16} className="text-purple-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Documents</span>
                    </div>
                    <p className="text-3xl font-black text-white">0</p>
                  </div>
                  <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={16} className="text-blue-500" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Level</span>
                    </div>
                    <p className="text-xl font-black text-white uppercase tracking-tighter">{userData.role}</p>
                  </div>
                </div>
              </section>

              <section>
                <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Subscription Status</h5>
                <div className="p-8 bg-gradient-to-r from-primary-600/20 to-primary-600/5 rounded-3xl border border-primary-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h6 className="text-2xl font-black text-white leading-none mb-2">{userData.subscription?.plan || 'Standard'} Access</h6>
                      <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">Protocol Version 2.0</p>
                    </div>
                    <Badge className="bg-primary-500 text-white font-black px-4 py-2">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 w-[65%]" />
                    </div>
                    <span className="text-xs font-bold text-gray-400">Next cycle: 28 Days</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
