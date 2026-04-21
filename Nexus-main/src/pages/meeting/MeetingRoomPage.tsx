import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, PhoneOff, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/ui/Badge';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { Meeting } from '../../types';

export const MeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [meetingInfo, setMeetingInfo] = useState<Meeting | null>(null);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingId) return;
      try {
        const res = await api.get('/meetings');
        const meeting = res.data.find((m: Meeting) => m.roomID === meetingId);
        if (meeting) setMeetingInfo(meeting);
        else toast.error("Meeting details not found");
      } catch (err) {
        console.error("Fetch meeting error:", err);
      }
    };
    
    fetchMeetingDetails();
  }, [meetingId]);

  const handleEndCall = () => {
    navigate('/meetings');
  };

  const currentUserName = user?.profile?.startupName || user?.profile?.company || user?.name || 'Guest';

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="h-16 px-6 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Video size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">{meetingInfo?.title || t('meetings.room.live')}</h1>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('meetings.room.recording')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-gray-400 border-gray-700 bg-gray-800/10 backdrop-blur-sm shadow-sm">
            Encrypted End-to-End
          </Badge>
        </div>
      </div>

      {/* Main Video Area - Powered by Jitsi */}
      <div className="flex-1 relative bg-black flex overflow-hidden">
        {meetingId ? (
          <iframe 
            src={`https://meet.jit.si/nexus-${meetingId}#config.prejoinPageEnabled=false&userInfo.displayName="${currentUserName}"`}
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Nexus Secure Meeting Room"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            Initializing secure room protocols...
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-gray-900 flex justify-between items-center px-12 z-20">
        <div className="flex items-center gap-6">
           {/* Left Controls Space */}
        </div>

        <div className="flex items-center gap-4 bg-gray-800/50 p-2 rounded-2xl backdrop-blur-md ring-1 ring-white/5 shadow-2xl">
          <button 
            onClick={handleEndCall}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold tracking-tight transition-all active:scale-95 shadow-xl shadow-red-500/20 flex items-center gap-3"
          >
            <PhoneOff size={20} />
            {t('meetings.room.end') || 'Leave Meeting'}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-3 bg-gray-800 group-hover:bg-gray-700 rounded-xl transition text-gray-400 group-hover:text-white">
              <Settings size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">{t('meetings.room.setup')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer border border-green-500/20 bg-green-500/5 rounded-xl p-2 px-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-500">
              <Shield size={16} />
              <span className="text-xs font-bold uppercase tracking-tighter">Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
