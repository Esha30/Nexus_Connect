import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, UserCircle, Briefcase, Calendar, BarChart3, Edit3, Save, X, Plus, Trash2, Sparkles, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Investor } from '../../types';
import api from '../../api/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../components/ui/Input';

const investorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  profile: z.object({
    bio: z.string().min(10, 'Investment thesis is too short'),
    location: z.string().min(2, 'Location is required'),
    company: z.string().optional(),
    investmentInterests: z.array(z.string()).optional(),
    investmentStage: z.array(z.string()).optional(),
    minimumInvestment: z.string().optional(),
    maximumInvestment: z.string().optional(),
  })
});

type InvestorFormValues = z.infer<typeof investorSchema>;

export const InvestorProfile: React.FC = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { user: currentUser, updateProfile } = useAuth();
 const [investor, setInvestor] = React.useState<Investor | null>(null);
 const [isLoading, setIsLoading] = React.useState(true);
 const [isEditing, setIsEditing] = React.useState(false);
 const [synergyData, setSynergyData] = React.useState<{score: number, verdict: string, strengths: string[], risks: string[]} | null>(null);
 const [isAnalyzingSynergy, setIsAnalyzingSynergy] = React.useState(false);

 const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<InvestorFormValues>({
  resolver: zodResolver(investorSchema)
 });

 const interests = watch('profile.investmentInterests') || [];
 const stages = watch('profile.investmentStage') || [];

 React.useEffect(() => {
  const fetchInvestor = async () => {
  if (!id) return;
  try {
  const res = await api.get(`/auth/profile/${id}`);
  const data = { ...res.data, id: res.data._id };
  setInvestor(data);

  // Populate form if it's the current user
  if (currentUser?.id === id || currentUser?.id === data._id) {
  reset({
  name: data.name,
  profile: {
  bio: data.profile?.bio || '',
  location: data.profile?.location || '',
  company: data.profile?.company || '',
  investmentInterests: data.profile?.investmentInterests || [],
  investmentStage: data.profile?.investmentStage || [],
  minimumInvestment: data.profile?.minimumInvestment || '',
  maximumInvestment: data.profile?.maximumInvestment || '',
  }
  });
  }
  } catch (err) {
  console.error('Failed to fetch investor profile:', err);
  toast.error('Profile not found');
  navigate('/investors');
  } finally {
  setIsLoading(false);
  }
  };
  fetchInvestor();
 }, [id, navigate, currentUser, reset]);

 const onUpdateProfile = async (data: InvestorFormValues) => {
  try {
  if (!id) return;
  await updateProfile?.(id, data);
  setInvestor(prev => prev ? { ...prev, ...data } : null);
  setIsEditing(false);
  toast.success('Investor profile updated!');
  } catch (err) {
  console.error('Failed to update profile:', err);
  toast.error('Failed to update profile');
  }
 };

  const handleAddInterest = async () => {
    const { value: interest } = await Swal.fire({
      title: 'Enter investment interest',
      input: 'text',
      inputPlaceholder: 'e.g., Fintech, AI, HealthTech',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#1e293b'
    });
    if (interest) {
      setValue('profile.investmentInterests', [...interests, interest]);
    }
  };

 const handleRemoveInterest = (idx: number) => {
  setValue('profile.investmentInterests', interests.filter((_, i) => i !== idx));
 };

  const handleAddStage = async () => {
    const { value: stage } = await Swal.fire({
      title: 'Enter investment stage',
      input: 'text',
      inputPlaceholder: 'e.g., Seed, Series A',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#1e293b'
    });
    if (stage) {
      setValue('profile.investmentStage', [...stages, stage]);
    }
  };

 const handleRemoveStage = (idx: number) => {
  setValue('profile.investmentStage', stages.filter((_, i) => i !== idx));
 };

 const handleAnalyzeSynergy = async () => {
    if (!id) return;
    setIsAnalyzingSynergy(true);
    toast.loading('Engaging Synergy Matrix Engine...', { id: 'synergy' });
    try {
      const res = await api.post('/ai/synergy', { targetUserId: id });
      setSynergyData(res.data);
      toast.success('Synergy Profile Synced', { id: 'synergy' });
    } catch (err: any) {
      if (err.response?.data?.error === 'AI_LIMIT_REACHED') {
        toast.error('Free trial limit reached. Upgrade for infinite AI analysis.', { id: 'synergy', duration: 5000 });
      } else {
        toast.error('Synergy calculation failed', { id: 'synergy' });
      }
    } finally {
      setIsAnalyzingSynergy(false);
    }
  };
 
 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
 </div>
 );
 }
 
 if (!investor || investor.role !== 'investor') {
 return (
 <div className="text-center py-12">
 <h2 className="text-2xl font-medium text-gray-900">Investor not found</h2>
 <p className="text-gray-600 mt-2">The investor profile you're looking for doesn't exist or has been removed.</p>
 <Link to="/dashboard/entrepreneur">
 <Button variant="outline" className="mt-4">Back to Dashboard</Button>
 </Link>
 </div>
 );
 }
 
 const isCurrentUser = currentUser?.id === investor.id;
 
 return (
 <div className="space-y-10 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16">
  {/* Hero Header */}
  <div className="relative pt-12 pb-24 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
    <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/20 rounded-full pointer-events-none" />
    <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/20 rounded-full pointer-events-none" />
    
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 md:gap-10">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <Avatar
            src={investor.avatarUrl}
            alt={investor.name}
            size="xl"
            status={investor.profile?.isOnline || investor.isOnline ? 'online' : 'offline'}
            className="shadow-sm ring-4 ring-white"
          />
          
          <div className="mt-6 md:mt-0 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider mb-4">
              <UserCircle size={14} /> Capital Allocator
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
              {investor.name}
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
              Senior Investor • <span className="text-gray-900 font-bold ml-1.5">{investor.profile?.totalInvestments || investor.totalInvestments || 0} Portfolios Managed</span>
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-6">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-none font-bold text-[10px] px-3 py-1.5 uppercase tracking-wider">
                <MapPin size={12} className="mr-1" />
                {investor.profile?.location || investor.location || 'Global'}
              </Badge>
              {(investor.profile?.investmentStage || investor.investmentStage || []).map((stage, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-50 text-primary-600 border-none font-bold text-[10px] px-3 py-1.5 uppercase tracking-wider">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center lg:justify-end w-full lg:w-auto">
          {!isCurrentUser && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 w-full">
              <Link to={`/messages/${investor.id || (investor as any)._id}`} className="w-full sm:w-auto">
                <Button
                  className="w-full rounded-lg font-semibold bg-primary-600 py-2.5 px-5 shadow-sm"
                  leftIcon={<MessageCircle size={18} />}
                >
                  Message
                </Button>
              </Link>
              <Link to={`/meetings?recipientId=${investor.id || (investor as any)._id}&name=${encodeURIComponent(investor.name)}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full rounded-lg font-semibold border-gray-200 py-2.5 px-6"
                  leftIcon={<Calendar size={18} />}
                >
                  Schedule
                </Button>
              </Link>
              {!isEditing && (
                 <Button
                   variant="outline"
                   className="col-span-2 sm:col-auto w-full sm:w-auto rounded-lg font-semibold border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100 py-2.5 px-5 shadow-sm overflow-hidden relative group"
                   onClick={handleAnalyzeSynergy}
                   isLoading={isAnalyzingSynergy}
                   leftIcon={<Sparkles size={18} />}
                 >
                   Analyze Synergy
                 </Button>
               )}
            </div>
          )}
          
          {isCurrentUser && (
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <Button
                variant={isEditing ? 'outline' : 'primary'}
                className="flex-1 sm:flex-none rounded-lg font-semibold py-2.5 px-5"
                leftIcon={isEditing ? <X size={18} /> : <Edit3 size={18} />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              
              {isEditing && (
                <Button
                  className="flex-1 sm:flex-none rounded-lg font-semibold bg-primary-600 py-2.5 px-5 shadow-sm"
                  leftIcon={<Save size={18} />}
                  onClick={handleSubmit(onUpdateProfile)}
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 w-full pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Main content - left side */}
      <div className="lg:col-span-2 space-y-10">
        {/* AI Synergy Result */}
        {synergyData && (
          <Card className="border-primary-100 shadow-xl shadow-primary-500/5 bg-gradient-to-br from-white to-primary-50/30 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
            <CardHeader className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-yellow-300" />
                <h2 className="text-lg font-bold tracking-tight">Nexus AI Synergy Matrix</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                Match Score: {synergyData.score}%
              </div>
            </CardHeader>
            <CardBody className="p-8">
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

        {/* About */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-5">
            <h2 className="text-sm font-medium text-gray-900">Investment Thesis</h2>
          </CardHeader>
          <CardBody className="p-8">
            {isEditing ? (
              <div className="space-y-6">
                <Input 
                  label={<span className="text-xs font-semibold text-gray-400 mb-1.5 block">Full Identity</span>}
                  {...register('name')} 
                  error={errors.name?.message}
                  className="rounded-lg"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Investment Thesis</label>
                  <textarea 
                    {...register('profile.bio')}
                    className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-600 focus:ring-blue-600 focus:ring-opacity-20 transition-all font-medium py-4 px-4 h-40"
                  />
                  {errors.profile?.bio && <p className="text-xs text-red-500 font-medium mt-1">{errors.profile.bio.message}</p>}
                </div>
                <Input 
                  label={<span className="text-xs font-semibold text-gray-400 mb-1.5 block">Location</span>}
                  {...register('profile.location')} 
                  error={errors.profile?.location?.message}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed font-medium text-lg">
                {investor.profile?.bio || investor.bio || 'Detailed thesis synchronization pending.'}
              </p>
            )}
          </CardBody>
        </Card>
        
        {/* Investment Interests */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-4 py-5">
            <h2 className="text-sm font-medium text-gray-900">Venture Architecture Interests</h2>
          </CardHeader>
          <CardBody className="p-8">
            <div className="space-y-10">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold text-gray-400">Strategic industries</h3>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={handleAddInterest} className="text-primary-600 hover:bg-primary-50 p-1 h-auto">
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {(isEditing ? interests : (investor.profile?.investmentInterests || investor.investmentInterests || [])).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-900 border-none font-semibold text-xs px-4 py-2 group/badge flex items-center gap-2">
                      {interest}
                      {isEditing && <Trash2 size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => handleRemoveInterest(index)} />}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold text-gray-400">Maturity protocols</h3>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={handleAddStage} className="text-primary-600 hover:bg-primary-50 p-1 h-auto">
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {(isEditing ? stages : (investor.profile?.investmentStage || investor.investmentStage || [])).map((stage, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary-50 text-primary-600 border-none font-semibold text-xs px-4 py-2 group/badge flex items-center gap-2">
                      {stage}
                      {isEditing && <Trash2 size={12} className="text-red-400 hover:text-red-600 cursor-pointer" onClick={() => handleRemoveStage(index)} />}
                    </Badge>
                  ))}
                </div>
              </div>
            
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 mb-6">Investment guardrails</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Expert founding core team",
                    "Proven market scalability",
                    "High unit economics efficiency",
                    "Technological moat or IP"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-primary-600 shadow-sm shadow-blue-600/50" />
                      <span className="text-sm font-semibold text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Portfolio Companies */}
        <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
          <CardHeader className="flex justify-between items-center bg-gray-50/50 border-b border-gray-100 px-4 py-5">
            <h2 className="text-sm font-medium text-gray-900">Protocol Portfolios</h2>
            <Badge variant="secondary" className="bg-slate-200 text-gray-600 border-none font-semibold text-xs px-3 py-1">
              {(investor.profile?.portfolioCompanies || investor.portfolioCompanies || []).length} Ventures
            </Badge>
          </CardHeader>
          <CardBody className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(investor.profile?.portfolioCompanies || investor.portfolioCompanies || []).map((company, index) => (
                <div key={index} className="flex items-center p-5 bg-white border border-gray-100 rounded-lg group hover:border-primary-200 hover:shadow-sm transition-all">
                  <div className="p-3 bg-primary-50 rounded-lg mr-5 group-hover:bg-primary-600 group-hover:text-white transition-all text-primary-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900 tracking-tight">{company}</h3>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">Active asset</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Sidebar - right side */}
      <div className="space-y-10">
        {/* Investment Details */}
        <Card className="bg-gray-900 text-white shadow-sm rounded-lg overflow-hidden border-none relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <CardHeader className="border-b border-gray-700 py-2.5 px-4 relative z-10">
            <h2 className="text-sm font-medium text-primary-400 flex items-center">
              <BarChart3 className="mr-2" size={16} />
              Allocation Protocol
            </h2>
          </CardHeader>
          <CardBody className="space-y-10 p-8 relative z-10">
            {isEditing ? (
              <div className="space-y-6 text-gray-900">
                <Input label={<span className="text-xs font-semibold text-gray-400">Firm / Entity</span>} {...register('profile.company')} className="bg-white/10 text-white placeholder-white/30 border-gray-600 focus:border-blue-400" />
                <Input label={<span className="text-xs font-semibold text-gray-400">Minimum Cheque</span>} {...register('profile.minimumInvestment')} className="bg-white/10 text-white placeholder-white/30 border-gray-600 focus:border-blue-400" />
                <Input label={<span className="text-xs font-semibold text-gray-400">Maximum Cheque</span>} {...register('profile.maximumInvestment')} className="bg-white/10 text-white placeholder-white/30 border-gray-600 focus:border-blue-400" />
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-gray-400">Cheque velocity</span>
                <p className="text-2xl font-medium text-white mt-2 tracking-tight">
                  {investor.profile?.minimumInvestment || investor.minimumInvestment || '$0'} - {investor.profile?.maximumInvestment || investor.maximumInvestment || 'TBD'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 ">
                <span className="text-xs font-semibold text-gray-400">Active AUM</span>
                <p className="text-sm font-medium text-white mt-1">{(investor.profile?.portfolioCompanies || investor.portfolioCompanies || []).length} Portfolios</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 ">
                <span className="text-xs font-semibold text-gray-400">Exits</span>
                <p className="text-sm font-medium text-primary-400 mt-1">4.2x ROI</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-700">
              <h3 className="text-xs font-medium text-gray-500 mb-6">Vertical Concentration</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold ">
                    <span>SaaS & Infrastructure</span>
                    <span className="text-primary-400">75%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold ">
                    <span>Fintech Protocols</span>
                    <span className="text-indigo-400">60%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { label: 'Exits protocol', value: '4 Assets', color: 'emerald' },
            { label: 'Avg ROI delta', value: '3.2x Scaled', color: 'blue' },
            { label: 'Active pipeline', value: '12 Ventures', color: 'slate' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-sm transition-all">
              <p className="text-xs font-semibold text-gray-400">{stat.label}</p>
              <h3 className="text-xl font-medium text-gray-900 mt-2">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
 </div>
 );
};