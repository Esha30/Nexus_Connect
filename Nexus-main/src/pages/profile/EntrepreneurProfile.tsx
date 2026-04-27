import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, Rocket, Target, TrendingUp, 
  MapPin, Globe, Award, Sparkles, CheckCircle2, AlertCircle, 
  MessageCircle, Calendar, Plus, Trash2, Edit3, X, Save, FileText, Send, Eye
} from 'lucide-react';
// Import verification comment: Send and Eye icons are definitely included below.

import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import api from '../../api/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { 
 Radar, 
 RadarChart, 
 PolarGrid, 
 PolarAngleAxis, 
 PolarRadiusAxis, 
 ResponsiveContainer 
 } from 'recharts';

const startupSchema = z.object({
 name: z.string().min(2, 'Name is required'),
 profile: z.object({
 startupName: z.string().min(2, 'Startup name is required'),
 industry: z.string().min(2, 'Industry is required'),
 location: z.string().min(2, 'Location is required'),
 foundedYear: z.number().min(1900).max(new Date().getFullYear()),
 teamSize: z.number().min(1),
 bio: z.string().min(10, 'Bio is too short'),
 pitchSummary: z.string().min(20, 'Pitch is too short'),
 problemStatement: z.string().optional(),
 solution: z.string().optional(),
 marketOpportunity: z.string().optional(),
 competitiveAdvantage: z.string().optional(),
 fundingNeeded: z.string().optional(),
 valuation: z.string().optional(),
 })
});

type StartupFormValues = z.infer<typeof startupSchema>;

export const EntrepreneurProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user: currentUser, updateProfile } = useAuth();
 const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [hasRequestedCollaboration, setHasRequestedCollaboration] = useState(false);

 // AI Synergy State
 const [synergyData, setSynergyData] = useState<{score: number, verdict: string, strengths: string[], risks: string[]} | null>(null);
 const [isAnalyzingSynergy, setIsAnalyzingSynergy] = useState(false);
 const [isGeneratingTermSheet, setIsGeneratingTermSheet] = useState(false);
 const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

 const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<StartupFormValues>({
 resolver: zodResolver(startupSchema)
 });

 interface Document {
 _id: string;
 title: string;
 filePath: string;
 createdAt: string;
 uploader: { _id: string } | string;
 }

 const [documents, setDocuments] = useState<Document[]>([]);
 const [isUploading, setIsUploading] = useState(false);

 const isInvestor = currentUser?.role === 'investor';

 useEffect(() => {
 if (entrepreneur && isInvestor && currentUser) {
 const requested = (entrepreneur.collaborationRequests || []).some((req: { investorId?: string }) => req.investorId === currentUser.id);
 setHasRequestedCollaboration(requested || false);
 }
 }, [entrepreneur, isInvestor, currentUser]);

 const fetchDocuments = useCallback(async () => {
 try {
 const res = await api.get('/documents');
 setDocuments(res.data.filter((d: { uploader?: { _id: string } | string }) => {
 const uploaderId = typeof d.uploader === 'object' ? d.uploader?._id : d.uploader;
 return uploaderId === id;
 }));
 } catch (error) {
 console.error('Failed to fetch documents:', error);
 }
 }, [id]);

 useEffect(() => {
 if (id) {
 fetchDocuments();
 }
 }, [id, fetchDocuments]);

 useEffect(() => {
 const fetchProfile = async () => {
 setIsLoading(true);
 try {
 const res = await api.get(`/auth/profile/${id}`);
 const data = { ...res.data, id: res.data._id };
 setEntrepreneur(data);
 
 if (currentUser?.id === id) {
 reset({
 name: data.name,
 profile: {
 startupName: data.profile?.startupName || '',
 industry: data.profile?.industry || '',
 location: data.profile?.location || '',
 foundedYear: data.profile?.foundedYear || 2024,
 teamSize: data.profile?.teamSize || 1,
 bio: data.profile?.bio || '',
 pitchSummary: data.profile?.pitchSummary || '',
 problemStatement: data.profile?.problemStatement || '',
 solution: data.profile?.solution || '',
 marketOpportunity: data.profile?.marketOpportunity || '',
 competitiveAdvantage: data.profile?.competitiveAdvantage || '',
 fundingNeeded: data.profile?.fundingNeeded || '',
 valuation: data.profile?.valuation || '',
 }
 });
 }
 } catch (err) {
 console.error('Failed to fetch profile:', err);
 } finally {
 setIsLoading(false);
 }
 };

 if (id) {
 fetchProfile();
 }
 }, [id, reset, currentUser]);

 if (isLoading) {
 return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
 }
 
 if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
 return (
 <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm max-w-2xl mx-auto my-12 p-12">
 <h2 className="text-lg font-medium text-gray-900 tracking-tight">Venture Not Found</h2>
 <p className="text-gray-500 font-medium mt-4 leading-relaxed italic">The requested founder identity or startup protocol has been de-indexed or moved.</p>
 <Link to="/dashboard/investor">
 <Button variant="outline" className="mt-10 rounded-lg font-medium px-4">Return to Central</Button>
 </Link>
 </div>
 );
 }
 
 const isCurrentUser = currentUser?.id === entrepreneur.id;

 const onUpdateProfile = async (data: StartupFormValues) => {
 try {
 await updateProfile?.(entrepreneur.id, data);
 setEntrepreneur(prev => prev ? { ...prev, ...data } : null);
 setIsEditing(false);
 toast.success('Startup profile updated!');
 } catch (err) {
 console.error('Failed to update profile:', err);
 toast.error('Failed to update profile');
 }
 };


 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('document', file);
 formData.append('title', file.name);

 setIsUploading(true);
 toast.loading('Uploading document...', { id: 'upload-doc' });

 try {
 await api.post('/documents', formData, {
 headers: { 
 'Content-Type': 'multipart/form-data'
 }
 });
 toast.success('Document uploaded successfully', { id: 'upload-doc' });
 fetchDocuments();
 } catch (err) {
 const error = err as { response?: { data?: { message?: string } } };
 if (error.response) {
 toast.error(error.response?.data?.message || 'Upload failed', { id: 'upload-doc' });
 } else {
 toast.error('Upload failed', { id: 'upload-doc' });
 }
 } finally {
 setIsUploading(false);
 }
 };

 const handleDeleteDocument = async (docId: string) => {
 toast((t) => (
 <div className="flex flex-col gap-3">
 <span className="font-semibold text-gray-900">Delete this document exactly?</span>
 <div className="flex justify-end gap-2 mt-2">
 <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition" onClick={() => toast.dismiss(t.id)}>Cancel</button>
 <button className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition" onClick={async () => {
 toast.dismiss(t.id);
 try {
 await api.delete(`/documents/${docId}`);
 setDocuments((prev) => prev.filter((d) => d._id !== docId));
 toast.success('Document deleted');
 } catch (err) {
 toast.error('Failed to delete document');
 }
 }}>Confirm Delete</button>
 </div>
 </div>
 ), { duration: Infinity, style: { minWidth: '300px' } });
 };

 const handleSendRequest = async () => {
 if (isInvestor && currentUser && id) {
 try {
 await api.post(`/collaborations`, {
 entrepreneurId: id,
 message: `I'm interested in learning more about ${entrepreneur.profile?.startupName || entrepreneur.startupName} and would like to explore potential investment opportunities.`
 });
 setHasRequestedCollaboration(true);
 toast.success('Collaboration request sent!');
 } catch (err) {
 console.error('Failed to send collaboration request:', err);
 toast.error('Failed to send request');
 }
 }
 };

 const handleAnalyzeSynergy = async () => {
   if (!id) return;
   setIsAnalyzingSynergy(true);
   toast.loading('Initializing Nexus Synergy Engine...', { id: 'synergy' });
   try {
     const res = await api.post('/ai/synergy', { targetUserId: id });
     setSynergyData(res.data);
     toast.success('Synergy Matrix Generated', { id: 'synergy' });
   } catch (err: any) {
     if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
       toast.error('Free trial limit reached. Upgrade to Premium for infinite AI accesses.', { id: 'synergy', duration: 5000 });
     } else {
       toast.error('Synergy calculation failed', { id: 'synergy' });
     }
   } finally {
     setIsAnalyzingSynergy(false);
   }
 };

  const handleGenerateTermSheet = async () => {
    if (!id) return;
    setIsGeneratingTermSheet(true);
    toast.loading('AI mapping standard Seed Term Sheet...', { id: 'termsheet' });
    try {
      const res = await api.post('/ai/termsheet', { targetUserId: id });
      const docId = res.data.document?._id || res.data.document?.id;
      toast.success('Term Sheet generated! Redirecting to your Documents...', { id: 'termsheet', duration: 3000 });
      fetchDocuments();
      setTimeout(() => {
        navigate(docId ? `/documents?download=${docId}` : '/documents');
      }, 1500);
    } catch (err: any) {
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('Free trial limit reached. Upgrade to Premium for continuous Deal formulations.', { id: 'termsheet', duration: 5000 });
      } else {
        toast.error('Deal generation failed', { id: 'termsheet' });
      }
    } finally {
      setIsGeneratingTermSheet(false);
    }
  };

  const handleGeneratePitch = async () => {
    if (!id) return;
    setIsGeneratingPitch(true);
    toast.loading('AI Polishing your Elevator Pitch...', { id: 'pitch' });
    try {
      const res = await api.post('/ai/pitch', { targetUserId: id });
      setValue('profile.pitchSummary', res.data.pitch);
      toast.success('AI Pitch Refined!', { id: 'pitch' });
    } catch (err: any) {
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('AI Limit Reached.', { id: 'pitch' });
      } else {
        toast.error('Pitch generation failed', { id: 'pitch' });
      }
    } finally {
      setIsGeneratingPitch(false);
    }
  };
  
  return (
 <div className="space-y-6 animate-fade-in">
 {/* Hero Header */}
 <div className="relative py-8 px-6 overflow-hidden bg-white border-b border-gray-100/50">
 <div className="max-w-7xl mx-auto relative z-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
 <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
 <Avatar
 src={entrepreneur.avatarUrl}
 alt={entrepreneur.name}
 size="xl"
 status={entrepreneur.profile?.isOnline || entrepreneur.isOnline ? 'online' : 'offline'}
 className="mx-auto sm:mx-0 shadow-sm "
 />
 
 <div className="mt-6 sm:mt-0 text-center sm:text-left">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold mb-4">
 <Building2 size={14} /> Venture Founder
 </div>
 <h1 className="text-lg md:text-xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
 {entrepreneur.name.split(' ')[0]} <span className="text-primary-600">{entrepreneur.name.split(' ').slice(1).join(' ')}.</span>
 </h1>
 <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed flex items-center justify-center sm:justify-start">
 Founder at <span className="text-gray-900 font-medium ml-1.5">{entrepreneur.profile?.startupName || entrepreneur.startupName || 'Startup N/A'}</span>
 </p>
 
 <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-6">
 <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-semibold text-xs px-3 py-1.5">
 {entrepreneur.profile?.industry || entrepreneur.industry || 'Industry N/A'}
 </Badge>
 <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-semibold text-xs px-3 py-1.5">
 <MapPin size={12} className="mr-1" />
 {entrepreneur.profile?.location || entrepreneur.location || 'Location N/A'}
 </Badge>
 </div>
 </div>
 </div>
 
 <div className="flex flex-wrap gap-4 justify-center sm:justify-end">
 {!isCurrentUser && (
 <>
 <Link to={`/messages/${entrepreneur.id || (entrepreneur as any)._id}`}>
 <Button
 variant="outline"
 className="rounded-lg font-medium border-gray-200 py-2.5 px-6"
 leftIcon={<MessageCircle size={18} />}
 >
 Message
 </Button>
 </Link>
 <Link to={`/meetings?recipientId=${entrepreneur.id || (entrepreneur as any)._id}&name=${encodeURIComponent(entrepreneur.name)}`}>
 <Button
 variant="outline"
 className="rounded-lg font-medium border-gray-200 py-2.5 px-6"
 leftIcon={<Calendar size={18} />}
 >
 Schedule
 </Button>
 </Link>
 
 {isInvestor && (
 <>
 <Button
 className="rounded-lg font-semibold bg-primary-600 py-2.5 px-4 shadow-sm"
 leftIcon={<Send size={18} />}
 disabled={hasRequestedCollaboration}
 onClick={handleSendRequest}
 >
 {hasRequestedCollaboration ? 'Request sent' : 'Collaborate'}
 </Button>
 <Button
 variant="outline"
 className="rounded-lg font-semibold border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 py-2.5 px-4 shadow-sm transition-all"
 leftIcon={<Sparkles size={18} className="text-primary-500" />}
 onClick={handleAnalyzeSynergy}
 isLoading={isAnalyzingSynergy}
 >
 Analyze Synergy
 </Button>
 <Button
 variant="outline"
 className="rounded-lg font-semibold border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 py-2.5 px-4 shadow-sm transition-all"
 leftIcon={<Sparkles size={18} className="text-purple-500" />}
 onClick={handleGenerateTermSheet}
 isLoading={isGeneratingTermSheet}
 >
 AI Deal (Term Sheet)
 </Button>
 </>
 )}
 </>
 )}
 
 {isCurrentUser && (
 <Button
 variant={isEditing ? 'outline' : 'primary'}
 className="rounded-lg font-medium py-2.5 px-5"
 leftIcon={isEditing ? <X size={18} /> : <Edit3 size={18} />}
 onClick={() => setIsEditing(!isEditing)}
 >
 {isEditing ? 'Cancel Edit' : 'Edit Terminal'}
 </Button>
 )}
 
 {isEditing && (
 <Button
 className="rounded-lg font-medium bg-primary-600 py-2.5 px-5 shadow-sm"
 leftIcon={<Save size={18} />}
 onClick={handleSubmit(onUpdateProfile)}
 isLoading={isSubmitting}
 >
 Save Sync
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 w-full pb-10">
 
  {/* Main content - left side */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 space-y-6">

  {/* AI Synergy Results */}
  {synergyData && (
    <Card className="border-primary-200 shadow-xl shadow-primary-600/5 bg-white rounded-lg overflow-hidden animate-in slide-in-from-top-4 relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400" />
      <CardHeader className="bg-primary-50/50 border-b border-primary-100 px-6 py-4 flex justify-between items-center">
        <h2 className="text-sm font-bold text-primary-900 flex items-center gap-2">
          <Sparkles size={16} className="text-primary-600" />
          Nexus AI Synergy Matrix
        </h2>
        <Badge className={`px-3 py-1 font-bold ${synergyData.score > 75 ? 'bg-green-100 text-green-700' : synergyData.score > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          Score Workspace: {synergyData.score}%
        </Badge>
      </CardHeader>
      <CardBody className="p-6">
        <p className="text-gray-900 font-medium text-lg italic tracking-tight leading-relaxed mb-6">
          "{synergyData.verdict}"
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-1"><CheckCircle2 size={14}/> Key Strengths</h4>
            <ul className="space-y-2">
              {synergyData.strengths.map((str, i) => (
                <li key={i} className="text-sm font-medium text-green-900 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span> {str}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-1"><AlertCircle size={14}/> Risk Vectors</h4>
            <ul className="space-y-2">
              {synergyData.risks.map((risk, i) => (
                <li key={i} className="text-sm font-medium text-red-900 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  )}

 {/* About Section */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-3">
 <h2 className="text-sm font-medium text-gray-900">Founder Narrative</h2>
 </CardHeader>
 <CardBody className="p-6">
 {isEditing ? (
 <div className="space-y-6">
 <Input 
 label={<span className="text-xs font-medium text-gray-400 mb-1.5 block">Full Identity</span>}
 {...register('name')} 
 error={errors.name?.message}
 className="rounded-lg"
 />
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-400 mb-1.5 block">Executive Summary</label>
 <textarea 
 {...register('profile.bio')}
 className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-600 focus:ring-blue-600 focus:ring-opacity-20 transition-all font-medium py-4 px-4 h-40"
 />
 {errors.profile?.bio && <p className="text-xs text-red-500 font-medium mt-1">{errors.profile.bio.message}</p>}
 </div>
 </div>
 ) : (
 <p className="text-gray-700 leading-relaxed font-medium text-lg">
 {entrepreneur.profile?.bio || entrepreneur.bio || "Biography details not yet synchronized."}
 </p>
 )}
 </CardBody>
 </Card>
 
 {/* Startup Overview */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-3">
 <h2 className="text-sm font-medium text-gray-900 flex items-center">
 <Building2 size={16} className="mr-2 text-primary-600" />
 Venture Architecture
 </h2>
 </CardHeader>
 <CardBody className="p-6">
 {isEditing ? (
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Input label="Startup Name" {...register('profile.startupName')} error={errors.profile?.startupName?.message} className="rounded-lg" />
 <Input label="Primary Industry" {...register('profile.industry')} error={errors.profile?.industry?.message} className="rounded-lg" />
 </div>
  <div className="relative">
    <Input 
      label={<span className="text-xs font-medium text-gray-400 mb-1.5 block">Elevator Protocol (Pitch)</span>} 
      {...register('profile.pitchSummary')} 
      error={errors.profile?.pitchSummary?.message} 
      className="rounded-lg pr-24" 
    />
    <button
      type="button"
      onClick={handleGeneratePitch}
      disabled={isGeneratingPitch}
      className="absolute right-2 top-8 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
    >
      {isGeneratingPitch ? (
        <span className="animate-spin h-3 w-3 border-2 border-primary-600 border-t-transparent rounded-full" />
      ) : (
        <Sparkles size={12} />
      )}
      AI Refine
    </button>
  </div>
 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-400 mb-1.5 block">Market Gap</label>
 <textarea {...register('profile.problemStatement')} className="w-full border-gray-200 rounded-lg shadow-sm font-medium py-3 h-24" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-400 mb-1.5 block">System Solution</label>
 <textarea {...register('profile.solution')} className="w-full border-gray-200 rounded-lg shadow-sm font-medium py-3 h-24" />
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="p-6 bg-primary-50/50 rounded-lg border border-primary-100 relative overflow-hidden group">
 <h3 className="text-xs font-semibold text-primary-600 mb-4">Executive Pitch</h3>
 <p className="text-xl font-medium text-gray-900 leading-tight tracking-tight italic">
 "{entrepreneur.profile?.pitchSummary || entrepreneur.pitchSummary || 'Awaiting pitch submission...'}"
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-4">
 <div className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
 Market Gap
 </div>
 <p className="text-gray-600 font-medium leading-relaxed">
 {entrepreneur.profile?.problemStatement || "Problem analysis protocol not yet defined for this venture."}
 </p>
 </div>
 
 <div className="space-y-4">
 <div className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
 System Solution
 </div>
 <p className="text-gray-600 font-medium leading-relaxed">
 {entrepreneur.profile?.solution || "Strategic response and technological solution pending synchronization."}
 </p>
 </div>
 </div>
 </div>
 )}
 </CardBody>
 </Card>
 
 {/* Team Section */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="flex justify-between items-center bg-gray-50/50 border-b border-gray-100 px-4 py-3">
 <h2 className="text-sm font-medium text-gray-900">Human Capital</h2>
 <Badge variant="secondary" className="bg-slate-200 text-gray-600 border-none font-semibold text-xs px-3 py-1.5">
 {entrepreneur.profile?.teamSize || entrepreneur.teamSize || '1'} Personnel
 </Badge>
 </CardHeader>
 <CardBody className="p-6">
 {isEditing ? (
 <div className="space-y-4">
 <Input label="Operational Personnel Count" type="number" {...register('profile.teamSize', { valueAsNumber: true })} error={errors.profile?.teamSize?.message} className="rounded-lg" />
 <p className="text-xs font-medium text-gray-400 italic">Multi-user team management protocols coming soon.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="flex items-center p-5 bg-gray-50/50 border border-gray-100 rounded-lg group hover:border-primary-200 transition-all shadow-sm">
 <Avatar
 src={entrepreneur.avatarUrl}
 alt={entrepreneur.name}
 size="md"
 className="mr-4 ring-offset-2 shadow-sm"
 />
 <div>
 <h3 className="text-base font-medium text-gray-900 tracking-tight">{entrepreneur.name}</h3>
 <p className="text-xs font-semibold text-primary-600 mt-0.5">Founder & CEO</p>
 </div>
 </div>
 </div>
 )}
 </CardBody>
 </Card>
 
 {/* Startup Health Radar Chart */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-3">
 <h2 className="text-sm font-medium text-gray-900 ">Operational Metrics</h2>
 </CardHeader>
 <CardBody className="p-6 flex justify-center items-center">
 <div style={{ height: 280, width: '100%', maxWidth: 400 }}>
 <ResponsiveContainer width="100%" height={280}>
 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
 { subject: 'Market', A: 85, fullMark: 150 },
 { subject: 'Product', A: 95, fullMark: 150 },
 { subject: 'Team', A: 70, fullMark: 150 },
 { subject: 'Growth', A: 60, fullMark: 150 },
 { subject: 'Tech', A: 90, fullMark: 150 },
 { subject: 'Finance', A: 40, fullMark: 150 },
 ]}>
 <PolarGrid stroke="#E2E8F0" />
 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} />
 <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
 <Radar
 name="Startup"
 dataKey="A"
 stroke="#2563EB"
 fill="#2563EB"
 fillOpacity={0.6}
 />
 </RadarChart>
 </ResponsiveContainer>
 </div>
 </CardBody>
 </Card>
 </div>
 
 {/* Sidebar - right side */}
 <div className="space-y-6">
 {/* Funding Details */}
 <Card className="bg-gray-900 text-white shadow-sm rounded-lg overflow-hidden border-none relative group">
 <CardHeader className="border-b border-gray-700 py-3 px-4 relative z-10">
 <h2 className="text-sm font-medium text-primary-400 flex items-center">
 <DollarSign className="mr-2" size={16} />
 Liquidity Protocol
 </h2>
 </CardHeader>
 <CardBody className="space-y-6 p-6 relative z-10">
 {isEditing ? (
 <div className="space-y-6 text-gray-900">
 <Input label="Capital Requirement" {...register('profile.fundingNeeded')} className="bg-white/10 text-white placeholder-white/30 border-gray-600 focus:border-blue-400" />
 <Input label="Current Valuation" {...register('profile.valuation')} className="bg-white/10 text-white placeholder-white/30 border-gray-600 focus:border-blue-400" />
 </div>
 ) : (
 <div className="space-y-6">
 <div>
 <span className="text-xs font-semibold text-gray-400">Target raise</span>
 <div className="flex items-center mt-2">
 <p className="text-lg font-medium text-white tracking-tight">{entrepreneur.profile?.fundingNeeded || entrepreneur.fundingNeeded || "TBD"}</p>
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 ">
 <span className="text-xs font-semibold text-gray-400">Valuation</span>
 <p className="text-sm font-medium text-white mt-1">{entrepreneur.profile?.valuation || "$5M - $8M"}</p>
 </div>
 <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 ">
 <span className="text-xs font-semibold text-gray-400">Venture stage</span>
 <p className="text-sm font-medium text-white mt-1">Series A</p>
 </div>
 </div>
 
 <div className="pt-8 border-t border-gray-700">
 <div className="flex justify-between items-center mb-3">
 <span className="text-xs font-medium text-gray-500 ">Syndication Status</span>
 <span className="text-xs font-medium text-primary-500">45% Synchronized</span>
 </div>
 <div className="w-full bg-white/10 rounded-full h-3 p-0.5">
 <div className="bg-gradient-to-r from-blue-600 to-indigo-400 h-2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: '45%' }}></div>
 </div>
 </div>
 </div>
 )}
 </CardBody>
 </Card>
 
 {/* Documents */}
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="flex justify-between items-center border-b border-gray-100 px-4 py-3 bg-gray-50/50">
 <h2 className="text-sm font-medium text-gray-900 ">Asset Vault</h2>
 {isCurrentUser && (
 <div className="relative">
 <input
 type="file"
 id="doc-upload"
 className="hidden"
 onChange={handleFileUpload}
 accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
 />
 <Button 
 variant="ghost" 
 size="sm" 
 className="text-primary-600 hover:bg-primary-50 hover:text-blue-700 font-medium text-xs "
 onClick={() => document.getElementById('doc-upload')?.click()}
 disabled={isUploading}
 >
 {isUploading ? 'Syncing...' : 'Upload'}
 </Button>
 </div>
 )}
 </CardHeader>
 <CardBody className="p-6">
 <div className="space-y-4">
 {documents.length > 0 ? documents.map((doc) => (
 <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100/50 hover:border-primary-200 hover:bg-white transition-all group shadow-sm">
 <div className="flex items-center min-w-0">
 <div className="p-2.5 bg-primary-50 rounded-lg mr-3 group-hover:bg-primary-600 group-hover:text-white transition-all text-primary-600 ">
 <FileText size={18} />
 </div>
 <div className="truncate">
 <p className="font-medium text-gray-900 text-sm leading-tight truncate">{doc.title}</p>
 <p className="text-xs font-medium text-gray-400 mt-0.5">{new Date(doc.createdAt).toLocaleDateString()}</p>
 </div>
 </div>
 <div className="flex gap-1 shrink-0">
 <a 
 href={`${(import.meta.env.VITE_API_URL || 'https://nexus-backend-iini.onrender.com/api').replace('/api', '')}${doc.filePath}`} 
 target="_blank" 
 rel="noopener noreferrer"
 >
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Eye size={16} /></Button>
 </a>
 {isCurrentUser && (
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
 onClick={() => handleDeleteDocument(doc._id)}
 >
 <Trash2 size={16} />
 </Button>
 )}
 </div>
 </div>
 )) : (
 <div className="text-center py-12 px-6">
 <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-100">
 <FileText className="text-gray-200" size={32} />
 </div>
 <p className="text-xs font-medium text-gray-400 ">No assets indexed.</p>
 </div>
 )}
 </div>
 
 {!isCurrentUser && isInvestor && (
 <div className="mt-8 pt-8 border-t border-gray-100">
 <p className="text-xs font-medium text-gray-400 italic leading-relaxed text-center mb-6">
 Protocol Access Required: Encrypted financials and cap tables are restricted to verified collaborators.
 </p>
 
 {!hasRequestedCollaboration ? (
 <Button
 className="w-full rounded-lg font-medium bg-gray-900 text-white py-4 shadow-sm shadow-slate-900/10 hover:bg-gray-800 transition-all text-xs "
 onClick={handleSendRequest}
 >
 Initialize Collaboration
 </Button>
 ) : (
 <Button
 className="w-full rounded-lg font-medium bg-gray-100 text-gray-400 py-4 cursor-not-allowed text-xs "
 disabled
 >
 Transmission Pending
 </Button>
 )}
 </div>
 )}
 </CardBody>
 </Card>
 </div>
 </div>
 </div>
 </div>
 );
};