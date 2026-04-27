import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { Calendar as CalendarIcon, Clock, Users, Plus, X, LayoutGrid, List, Video } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../api/api';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Meeting } from '../../types';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Form State
  const [title, setTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potentialPartners, setPotentialPartners] = useState<{ id: string, name: string, avatarUrl?: string }[]>([]);
  
  const location = useLocation();
  const { socket } = useSocket();

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data);
    } catch (err) {
      console.error('Fetch meetings error:', err);
      toast.error('Could not load meetings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPotentialPartners = useCallback(async () => {
    try {
      const res = await api.get('/auth/investors');
      const mapped = res.data.investors.map((i: any) => ({
        id: i._id,
        name: i.name,
        avatarUrl: i.profile?.avatarUrl
      }));
      setPotentialPartners(mapped);
    } catch (err) {
      console.error('Fetch partners error:', err);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
    const params = new URLSearchParams(location.search);
    const pid = params.get('recipientId');
    const pname = params.get('name');
    if (pid) {
      setSelectedParticipants([pid]);
      if (pname) setTitle(`Session with ${pname}`);
      setIsModalOpen(true);
    }

    fetchPotentialPartners();

    // Socket updates for live status changes
    if (socket) {
      socket.on('meeting-updated', fetchMeetings);
      return () => {
        socket.off('meeting-updated', fetchMeetings);
      };
    }
  }, [location, socket, fetchMeetings, fetchPotentialPartners]);

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParticipants.length === 0) return toast.error('Select at least one participant');
    
    setIsSubmitting(true);
    try {
      await api.post('/meetings', {
        title,
        participants: selectedParticipants,
        startTime,
        endTime
      });
      toast.success('Meeting scheduled successfully');
      setIsModalOpen(false);
      fetchMeetings();
      // Reset form
      setTitle('');
      setSelectedParticipants([]);
      setStartTime('');
      setEndTime('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string, errors?: { msg: string }[] } } };
      console.error('Schedule error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to schedule meeting';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (meetingId: string, status: string) => {
    try {
      await api.put(`/meetings/${meetingId}/status`, { status });
      toast.success(`Meeting ${status}`);
      fetchMeetings();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update meeting status');
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const events = useMemo(() => {
    return meetings.map(m => ({
      id: m._id,
      title: m.title,
      start: new Date(m.startTime),
      end: new Date(m.endTime),
      status: m.status,
      roomID: m.roomID
    }));
  }, [meetings]);

  interface CalendarEvent { status: string }
  const eventStyleGetter = (event: object) => {
    const e = event as CalendarEvent;
    const status = e.status;
    let backgroundColor = '#3b82f6';
    if (status === 'accepted') backgroundColor = '#10b981';
    if (status === 'rejected') backgroundColor = '#ef4444';
    if (status === 'pending') backgroundColor = '#f59e0b';

    return {
      style: {
        backgroundColor,
        borderRadius: '12px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        fontWeight: '700',
        padding: '2px 8px'
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero Header */}
      <div className="relative pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-16 overflow-hidden bg-white">
        <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/20 rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 sm:gap-10">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider mb-6">
              <CalendarIcon size={14} /> {t('meetings.hero.badge')}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
              {t('meetings.hero.title')} <span className="text-primary-600">{t('meetings.hero.sync')}</span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-500 font-medium leading-relaxed">
              {t('meetings.hero.subtitle')}
            </p>
          </div>
          
          <div className="w-full lg:w-[450px] flex flex-col gap-3">
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />} fullWidth className="bg-primary-600 hover:bg-blue-700 shadow-sm py-3.5 text-base font-bold rounded-xl">
              {t('meetings.schedule')}
            </Button>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button onClick={() => setViewMode('calendar')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${viewMode === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid size={16} /> {t('meetings.calendar')}
              </button>
              <button onClick={() => setViewMode('list')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-wider ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <List size={16} /> {t('meetings.timeline')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 -mt-8 relative z-20">
        <Card className="bg-white border border-gray-100 shadow-sm rounded-[2rem] overflow-hidden">
          <CardBody className="p-0">
            {isLoading ? (
              <div className="p-20 sm:p-40 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-secondary-100 border-t-secondary-600 rounded-full animate-spin"></div>
              </div>
            ) : viewMode === 'calendar' ? (
              <div className="h-[450px] sm:h-[750px] p-4 sm:p-8 bg-white overflow-hidden">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', fontFamily: 'inherit' }}
                  eventPropGetter={eventStyleGetter}
                  defaultView={Views.MONTH}
                  views={['month', 'week', 'day', 'agenda']}
                  onSelectEvent={(e) => toast(`"${e.title}"`, { icon: '📅', duration: 2000 })}
                />
              </div>
            ) : meetings.length === 0 ? (
              <div className="p-20 sm:p-40 text-center flex flex-col items-center">
                <Clock size={48} className="text-gray-300 mb-6" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('meetings.empty.title')}</h3>
                <p className="text-gray-500">{t('meetings.empty.subtitle')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {meetings.map((m: Meeting) => {
                  const isHost = m.host?._id === user?.id;
                  const statusColor = m.status === 'accepted' ? 'success' : m.status === 'rejected' ? 'error' : 'warning';
                  
                  return (
                    <div key={m._id} className="group relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 hover:bg-gray-50 transition-all gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex -space-x-3 overflow-hidden">
                          {[m.host, ...m.participants].slice(0, 4).map((member, i) => (
                            <div key={i} className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center font-bold text-gray-400 border border-gray-200">
                              {member?.profile?.avatarUrl ? <img src={member.profile.avatarUrl} alt="" className="rounded-full h-full w-full object-cover" /> : member?.name?.charAt(0)}
                            </div>
                          ))}
                          {m.participants.length > 3 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 ring-2 ring-white text-xs font-medium text-gray-500 border border-gray-200">
                              +{m.participants.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium text-gray-900 tracking-tight leading-tight mb-1">{m.title}</h3>
                          <div className="flex flex-wrap items-center gap-4">
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <Users size={16} className="text-primary-500" /> {m.participants.length + 1} {t('meetings.list.attendees')}
                            </p>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <Clock size={16} className="text-primary-500" /> {new Date(m.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {t('meetings.list.at')} {new Date(m.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3">
                        <Badge variant={statusColor} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full">{m.status}</Badge>
                        {m.status === 'pending' && !isHost && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateStatus(m._id, 'accepted')} className="bg-success-600 text-white rounded-lg text-[10px] font-bold">{t('meetings.list.accept')}</Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(m._id, 'rejected')} className="text-red-500 border-red-500 text-[10px] font-bold">{t('meetings.list.decline')}</Button>
                          </div>
                        )}
                        {m.status === 'accepted' && (
                          <Button 
                            onClick={() => navigate(`/meeting/${m.roomID}`)}
                            className="bg-primary-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 px-4 py-2"
                          >
                            <Video size={14} /> {t('meetings.list.join')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border-none scale-in">
            <div className="h-2 bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500" />
            <CardHeader className="flex justify-between items-center px-8 pt-10 pb-4">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">{t('meetings.modal.title')}</h2>
                <p className="text-sm text-gray-500 font-medium">{t('meetings.modal.subtitle')}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </CardHeader>
            <CardBody className="px-8 pb-10 pt-4">
              <form onSubmit={handleScheduleMeeting} className="space-y-6">
                <Input label={t('meetings.modal.form.title')} value={title} onChange={e => setTitle(e.target.value)} required placeholder={t('meetings.modal.form.titlePlaceholder')} className="rounded-lg py-4" />
                
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 ml-1">{t('meetings.modal.form.participants')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                    {potentialPartners.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => toggleParticipant(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedParticipants.includes(p.id) ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                          {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="rounded-full" /> : p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input type="datetime-local" label={t('meetings.modal.form.startTime')} value={startTime} onChange={e => setStartTime(e.target.value)} required className="rounded-lg" />
                  <Input type="datetime-local" label={t('meetings.modal.form.endTime')} value={endTime} onChange={e => setEndTime(e.target.value)} required className="rounded-lg" />
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="py-4 text-xl font-medium rounded-lg bg-secondary-600 hover:bg-secondary-700">
                    {isSubmitting ? t('meetings.modal.form.submitting') : t('meetings.modal.form.submit')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};
