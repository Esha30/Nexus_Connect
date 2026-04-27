import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { Meeting } from '../../types';
import toast from 'react-hot-toast';
import { Video, Bell } from 'lucide-react';

export const MeetingReminder: React.FC = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const remindedMeetings = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchUpcoming = async () => {
    try {
      const res = await api.get('/meetings');
      // Only get accepted meetings in the future
      const now = new Date();
      const filtered = res.data.filter((m: Meeting) => 
        m.status === 'accepted' && new Date(m.startTime) > now
      );
      setUpcomingMeetings(filtered);
    } catch (err) {
      console.error('Reminder fetch error:', err);
    }
  };

  useEffect(() => {
    fetchUpcoming();
    const fetchInterval = setInterval(fetchUpcoming, 300000); // Fetch every 5 mins
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      upcomingMeetings.forEach(m => {
        const startTime = new Date(m.startTime);
        const diffMinutes = (startTime.getTime() - now.getTime()) / 60000;

        // Remind if starting in less than 10 minutes and not already reminded
        if (diffMinutes > 0 && diffMinutes <= 10 && !remindedMeetings.current.has(m._id)) {
          remindedMeetings.current.add(m._id);
          toast((t) => (
            <div className="flex flex-col gap-2 p-1">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Bell className="text-primary-600" size={18} />
                <span className="truncate max-w-[200px]">Upcoming: {m.title}</span>
              </div>
              <p className="text-xs text-gray-500">Starting in {Math.round(diffMinutes)} minutes</p>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate(`/meeting/${m.roomID}`);
                  }}
                  className="flex-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
                >
                  <Video size={12} /> Join Now
                </button>
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { 
            duration: 10000,
            position: 'top-center',
            style: {
              borderRadius: '16px',
              border: '1px solid #f3f4f6',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }
          });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [upcomingMeetings, navigate]);

  return null;
};
