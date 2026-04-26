import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import { 
  FileText, Download, Trash2, Loader, Eye, Upload, Share2, 
  Shield, Info, ChevronDown, CheckCircle2, X, Search, 
  Clock, Zap, Lock, Filter, ArrowRight, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { SignatureModal } from '../../components/documents/SignatureModal';
import { PDFViewerModal } from '../../components/documents/PDFViewerModal';
import { ShareDocumentModal } from '../../components/documents/ShareDocumentModal';

interface DocumentType {
  _id: string;
  name: string;
  fileName: string;
  filePath: string;
  title: string;
  fileType: string;
  status: string;
  category: string;
  sharedWith: string[];
  isEncrypted: boolean;
  aiAnalysis?: {
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    scores: {
      market: number;
      product: number;
      team: number;
      overall: number;
    };
    summary: string;
    analyzedAt: string;
  };
  updatedAt: string;
  createdAt: string;
  uploader: {
    _id: string;
    name: string;
    email: string;
    profile?: { avatarUrl?: string };
  };
}

export const DocumentsPage: React.FC = () => {
 const [documents, setDocuments] = useState<DocumentType[]>([]);
 const [isUploading, setIsUploading] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const fileInputRef = useRef<HTMLInputElement>(null);

 // Modal states
 const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
 const [isSignModalOpen, setIsSignModalOpen] = useState(false);
 const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
 const [isGuideOpen, setIsGuideOpen] = useState(false);
 const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'encrypted'>('all');
 const [uploadCategory, setUploadCategory] = useState<'pitch_deck' | 'financials' | 'legal' | 'identity' | 'other'>('other');
 const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
 const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

 const filteredDocuments = useMemo(() => {
   let docs = [...documents];
   
   if (searchQuery) {
     docs = docs.filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   switch (activeFilter) {
      case 'recent': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return docs.filter(doc => new Date(doc.createdAt) >= sevenDaysAgo);
      }
      case 'encrypted':
        return docs.filter(doc => doc.isEncrypted);
     default:
       return docs;
   }
 }, [documents, activeFilter, searchQuery]);

 const recentSharing = useMemo(() => {
   return documents
    .filter(doc => doc.sharedWith?.length > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
 }, [documents]);

 useEffect(() => {
  fetchDocuments();
 }, []);

 const fetchDocuments = async () => {
  try {
  const res = await api.get('/documents');
  setDocuments(res.data);
  } catch (error) {
  console.error('Failed to fetch documents:', error);
  } finally {
  setIsLoading(false);
  }
 };

 const [searchParams, setSearchParams] = useSearchParams();
 useEffect(() => {
    const downloadId = searchParams.get('download');
    if (!downloadId || isLoading || documents.length === 0) return;
    const doc = documents.find((d) => d._id === downloadId);
    if (doc) {
      const backendHost = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
      const anchor = document.createElement('a');
      anchor.href = `${backendHost}${doc.filePath}`;
      anchor.download = doc.fileName || doc.title || `document`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      toast.success(`"${doc.title}" is now downloading.`, { duration: 4000 });
      setSearchParams({}, { replace: true });
    }
 }, [documents, isLoading, searchParams, setSearchParams]);

 const handleUploadClick = () => {
  fileInputRef.current?.click();
 };

 interface ApiError { response?: { data?: { message?: string } } }

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', file.name);
  formData.append('category', uploadCategory);

  setIsUploading(true);
  try {
  await api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
  });
  toast.success('Document uploaded successfully');
  fetchDocuments();
  } catch (err) {
  const error = err as ApiError;
  toast.error(error.response?.data?.message || 'Failed to upload document');
  } finally {
  setIsUploading(false);
  if (fileInputRef.current) fileInputRef.current.value = '';
  }
 };

 const handlePreview = (doc: DocumentType) => {
  setSelectedDoc(doc);
  setIsPreviewModalOpen(true);
 };

 const handleSign = (doc: DocumentType) => {
  setSelectedDoc(doc);
  setIsSignModalOpen(true);
 };

 const handleSaveSignature = async (signatureData: string) => {
  if (!selectedDoc) return;

  try {
  await api.put(`/documents/${selectedDoc._id}`, { eSignatureUrl: signatureData });
  toast.success('Document signed successfully');
  setIsSignModalOpen(false);
  fetchDocuments();
  } catch {
  toast.error('Error signing document');
  }
 };

 const getAbsoluteUrl = (filePath: string) => {
  const backendHost = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  return `${backendHost}${filePath}`;
 };

  const handleShare = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (userIds: string[]) => {
    if (!selectedDoc) return;
    try {
      await api.post(`/documents/${selectedDoc._id}/share`, { userIds });
      toast.success('Access permissions updated');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to update permissions');
      throw err;
    }
  };

  const handleAnalyze = async (docId: string) => {
    setIsAnalyzing(docId);
    try {
      const res = await api.post(`/documents/${docId}/analyze`);
      toast.success('AI Analysis Complete!');
      fetchDocuments();
      setShowAnalysis(docId);
    } catch (err) {
      toast.error('AI Analysis failed. Ensure the document contains readable text.');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pitch_deck': return <Zap size={16} className="text-yellow-500" />;
      case 'financials': return <CreditCardIcon size={16} className="text-green-500" />;
      case 'legal': return <Shield size={16} className="text-blue-500" />;
      case 'identity': return <CheckCircle2 size={16} className="text-primary-500" />;
      default: return <FileText size={16} className="text-gray-400" />;
    }
  };

  const CreditCardIcon = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  );

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
  setDocuments(prev => prev.filter(d => d._id !== docId));
  toast.success('Document deleted successfully');
  } catch {
  toast.error('Failed to delete document');
  }
  }}>Confirm Delete</button>
  </div>
  </div>
  ), { duration: Infinity, style: { minWidth: '300px' } });
 };

 return (
  <div className="space-y-10 animate-fade-in -mt-6 -mx-6 sm:-mx-10 lg:-mx-16">
  {/* Hero Header */}
  <div className="relative pt-16 pb-28 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
  <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/10 rounded-full pointer-events-none blur-3xl" />
  <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/10 rounded-full pointer-events-none blur-3xl" />
   <div className="max-w-7xl mx-auto relative z-10">
     <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
       <div>
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-100">
           <Lock size={12} /> Encrypted Repository Terminal
         </div>
         <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
           Venture Asset <span className="text-primary-600">terminal.</span>
         </h1>
         <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
           Securely manage, categorize, and authorize access to your startup's critical venture assets and legal protocols with bank-grade encryption.
         </p>
       </div>

       <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
         <div className="relative group">
           <select 
             className="appearance-none bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-xs font-black text-gray-700 shadow-sm focus:ring-4 focus:ring-primary-500/10 outline-none w-full sm:w-48 cursor-pointer transition-all hover:border-primary-300"
             value={uploadCategory}
             onChange={(e) => setUploadCategory(e.target.value as any)}
           >
             <option value="pitch_deck">PITCH DECK</option>
             <option value="financials">FINANCIALS</option>
             <option value="legal">LEGAL PROTOCOLS</option>
             <option value="identity">IDENTITY SYNC</option>
             <option value="other">OTHER ASSET</option>
           </select>
           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
         </div>

         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           onChange={handleFileChange}
           accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
         />
         <Button 
           className="rounded-xl py-3 px-8 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-600/20 bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all w-full sm:w-auto"
           leftIcon={isUploading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />} 
           onClick={handleUploadClick}
           disabled={isUploading}
         >
           {isUploading ? 'Encrypting...' : 'Upload Asset'}
         </Button>
       </div>
     </div>

     {/* Integrated Documentation Overlay */}
     <div className={`mt-10 overflow-hidden transition-all duration-500 ${isGuideOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
       <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-10 relative">
         <button onClick={() => setIsGuideOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-all"><X size={20}/></button>
         <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-primary-600 rounded-lg text-white shadow-lg shadow-primary-600/20"><Info size={20} /></div>
           <h3 className="font-black text-gray-900 uppercase tracking-tight">Command Protocol: Documentation Center</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black text-gray-900 border-b border-gray-200 pb-3 mb-4 uppercase tracking-widest">
               <Shield size={16} className="text-primary-600" /> Secure Storage
             </div>
             <p className="text-sm text-gray-500 leading-relaxed font-medium italic">Assets are encrypted upon upload and stored behind multi-layer security protocols. Choose a category to optimize search intelligence.</p>
           </div>
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black text-gray-900 border-b border-gray-200 pb-3 mb-4 uppercase tracking-widest">
               <Share2 size={16} className="text-primary-600" /> Selective Sharing
             </div>
             <p className="text-sm text-gray-500 leading-relaxed font-medium italic">Grant 'View Access' to specific connections. Shared assets appear automatically in the recipient's terminal without insecure redirects.</p>
           </div>
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black text-gray-900 border-b border-gray-200 pb-3 mb-4 uppercase tracking-widest">
               <CheckCircle2 size={16} className="text-primary-600" /> E-Signature
             </div>
             <p className="text-sm text-gray-500 leading-relaxed font-medium italic">Authorize legal agreements directly in the browser. Signed documents generate a permanent operational record.</p>
           </div>
         </div>
       </div>
     </div>
     
     {!isGuideOpen && (
       <button onClick={() => setIsGuideOpen(true)} className="mt-6 text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full border border-primary-100 transition-all hover:scale-105">
         <Info size={14}/> Show Command Protocol Guide
       </button>
     )}
   </div>
  </div>

  <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 w-full pb-20">
  
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
  {/* Sidebar */}
  <div className="lg:col-span-1 space-y-8">
    <Card className="border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Memory Protocol</h2>
      </CardHeader>
      <CardBody className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-gray-400">Utilized Assets</span>
            <span className="text-gray-900">1.2 GB</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
            <div className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: '15%' }}></div>
          </div>
          <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-tighter italic">85% Capacity Remaining</p>
        </div>
        
        <div className="pt-8 border-t border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Command Center</h3>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'All Assets', icon: <FileText size={16}/> },
              { id: 'recent', label: 'Recent Protocol', icon: <Clock size={16}/> },
              { id: 'encrypted', label: 'Secured Nodes', icon: <Lock size={16}/> },
            ].map(filter => (
              <button 
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-between group ${activeFilter === filter.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-primary-600'}`}
              >
                <div className="flex items-center gap-3">
                  {filter.icon}
                  {filter.label}
                </div>
                <ArrowRight size={14} className={`transition-transform duration-300 ${activeFilter === filter.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>

    {/* Recent Sharing activity */}
    {recentSharing.length > 0 && (
      <Card className="border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-5">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Access Signals</h2>
        </CardHeader>
        <CardBody className="p-6 space-y-5">
          {recentSharing.map(doc => (
            <div key={doc._id} className="flex items-center gap-3 group cursor-pointer" onClick={() => handlePreview(doc)}>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all"><Share2 size={14}/></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{doc.title}</p>
                <p className="text-[10px] text-gray-400 font-medium">Shared with {doc.sharedWith.length} nodes</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    )}
  </div>
  
  {/* Document List */}
  <div className="lg:col-span-3 space-y-6">
    {/* Search and Sort */}
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search encrypted terminal ledger..." 
          className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent focus:border-primary-300 focus:bg-white rounded-xl text-sm font-medium transition-all outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="rounded-xl border border-gray-100 text-gray-500 hover:text-primary-600">
          <Filter size={16} className="mr-2" /> Sort protocol
        </Button>
      </div>
    </div>

    <Card className="border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
      <CardHeader className="flex justify-between items-center border-b border-gray-100 px-8 py-6 bg-gray-50/20">
        <h2 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">{activeFilter === 'all' ? 'Primary' : activeFilter} Asset Ledger</h2>
        <Badge className="bg-primary-600 text-white border-none font-black text-[10px] px-3 py-1.5 shadow-lg shadow-primary-600/20 uppercase tracking-widest">
          {filteredDocuments.length} Items Indexed
        </Badge>
      </CardHeader>
      <CardBody className="p-0">
      {isLoading ? (
      <div className="flex flex-col items-center justify-center p-32 gap-4">
        <Loader className="animate-spin text-primary-600" size={32} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scanning Storage Nodes...</p>
      </div>
      ) : filteredDocuments.length === 0 ? (
      <div className="text-center p-32 text-gray-400">
        <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 group relative">
          <div className="absolute inset-0 bg-primary-600/5 rounded-3xl animate-pulse" />
          <FileText className="text-gray-200 relative z-10" size={48} />
        </div>
        <h3 className="font-black text-gray-900 uppercase mb-2 tracking-tight">Terminal Empty</h3>
        <p className="font-medium text-sm text-gray-400 max-w-xs mx-auto">No encrypted assets detected in this protocol cluster. Upload your first asset to begin.</p>
      </div>
      ) : (
      <div className="divide-y divide-gray-100">
      {filteredDocuments.map(doc => (
      <React.Fragment key={doc._id}>
      <div
      className="flex items-center p-8 hover:bg-gray-50/50 transition-all duration-500 group cursor-default"
      >
      <div className="p-5 bg-gray-50 rounded-2xl mr-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 text-gray-400 border border-gray-100 shadow-sm">
      <FileText size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-black text-gray-900 truncate tracking-tight group-hover:text-primary-600 transition-colors">
      {doc.title}
      </h3>
      </div>
      
      <div className="flex items-center gap-4">
      <span className="text-[10px] font-black text-gray-500 px-3 py-1 bg-gray-100 rounded-lg uppercase tracking-widest border border-gray-200">
      {(doc.fileType || '').split('/')[1] || 'FILE'}
      </span>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        <Clock size={12}/> {new Date(doc.updatedAt).toLocaleDateString()}
      </span>
      <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'} size="sm" className="capitalize font-black text-[9px] px-3 py-1 border-none shadow-sm tracking-widest">
        {doc.status.replace('_', ' ')}
      </Badge>
      {doc.category && (
        <Badge variant="outline" size="sm" className="capitalize font-black text-[9px] px-3 py-1 border-gray-200 text-gray-500 flex items-center gap-1.5 bg-white tracking-widest">
          {getCategoryIcon(doc.category)}
          {doc.category.replace('_', ' ')}
        </Badge>
      )}
      </div>
      </div>
      
       <div className="flex items-center gap-3 ml-6 shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
       <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 rounded-2xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all font-bold border border-transparent hover:border-primary-100"
        title="Preview Terminal" aria-label="Preview document"
        onClick={() => handlePreview(doc)}
       >
        <Eye size={20} />
       </Button>

       <Button
          variant="ghost"
          size="sm"
          className="w-12 h-12 p-0 rounded-2xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold border border-transparent hover:border-emerald-100"
          title="Authorize Access" aria-label="Share document with connections"
          onClick={() => handleShare(doc)}
       >
          <Share2 size={20} />
       </Button>

       {doc.status !== 'signed' && (
       <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 rounded-2xl text-primary-600 hover:bg-primary-50 transition-all font-bold border border-transparent hover:border-primary-100"
        title="E-Sign" aria-label="Electronically sign document"
        onClick={() => handleSign(doc)}
       >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
       </Button>
       )}
       
        {doc.category === 'pitch_deck' && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-12 h-12 p-0 rounded-2xl transition-all font-bold border border-transparent ${doc.aiAnalysis?.summary ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-primary-600 hover:bg-primary-50 hover:border-primary-100'}`}
              title={doc.aiAnalysis?.summary ? "View AI Analysis" : "AI Pitch Analysis"}
              onClick={() => doc.aiAnalysis?.summary ? setShowAnalysis(showAnalysis === doc._id ? null : doc._id) : handleAnalyze(doc._id)}
              isLoading={isAnalyzing === doc._id}
            >
              <Zap size={20} className={isAnalyzing === doc._id ? 'animate-pulse' : ''} />
            </Button>
            
            {doc.aiAnalysis?.summary && (
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0 rounded-2xl text-gray-400 hover:text-primary-600 transition-all font-bold border border-transparent hover:border-primary-100"
                title="Re-analyze"
                onClick={() => handleAnalyze(doc._id)}
                isLoading={isAnalyzing === doc._id}
              >
                <RefreshCw size={18} />
              </Button>
            )}
          </div>
        )}

       <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all font-bold border border-transparent hover:border-gray-200"
        title="Download Local" aria-label="Download document"
        onClick={() => window.open(getAbsoluteUrl(doc.filePath), '_blank')}
       >
        <Download size={20} />
       </Button>
       
       <Button
        variant="ghost"
        size="sm"
        className="w-12 h-12 p-0 rounded-2xl text-red-300 hover:text-red-600 hover:bg-red-50 transition-all font-bold border border-transparent hover:border-red-100"
        title="Purge" aria-label="Delete document"
        onClick={() => handleDeleteDocument(doc._id)}
       >
        <Trash2 size={20} />
       </Button>
       </div>
      </div>
      
      {/* AI Analysis Overlay */}
      {showAnalysis === doc._id && doc.aiAnalysis && (
        <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-900 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -mr-32 -mt-32" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-tight">AI Pitch Deck Analysis</h4>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Generated by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setShowAnalysis(null)} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Body: no-data fallback or analysis results */}
            {!doc.aiAnalysis?.summary
              ? (
                <div className="text-center py-20 relative z-10">
                  <p className="text-gray-400 font-medium">No analysis data found. Please trigger the analysis protocol.</p>
                  <Button
                    onClick={() => handleAnalyze(doc._id)}
                    className="mt-6 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl px-8"
                    isLoading={isAnalyzing === doc._id}
                  >
                    Start AI Protocol
                  </Button>
                </div>
              )
              : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                  {/* Left: Summary + SWOT */}
                  <div className="md:col-span-3 space-y-8">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                      <h5 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3">Executive Summary</h5>
                      <p className="text-gray-200 text-sm leading-relaxed font-medium">{doc.aiAnalysis?.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Strengths
                        </h5>
                        <ul className="space-y-2">
                          {doc.aiAnalysis?.swot?.strengths?.map((s, i) => (
                            <li key={i} className="text-xs text-gray-400 font-medium flex gap-2">
                              <span className="text-emerald-500">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Weaknesses
                        </h5>
                        <ul className="space-y-2">
                          {doc.aiAnalysis?.swot?.weaknesses?.map((w, i) => (
                            <li key={i} className="text-xs text-gray-400 font-medium flex gap-2">
                              <span className="text-red-500">•</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores */}
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 * (1 - (doc.aiAnalysis?.scores?.overall || 0) / 10)}
                            className="text-primary-500"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-white">{doc.aiAnalysis?.scores?.overall || 0}</span>
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Overall Readiness</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Market', score: doc.aiAnalysis?.scores?.market },
                        { label: 'Product', score: doc.aiAnalysis?.scores?.product },
                        { label: 'Team', score: doc.aiAnalysis?.scores?.team }
                      ].map((s, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-gray-500">{s.label}</span>
                            <span className="text-white">{s.score}/10</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(s.score || 0) * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}
      </React.Fragment>
      ))}
      </div>
      )}
      </CardBody>
    </Card>
  </div>
  </div>
  </div>

  {/* Modals */}
  {selectedDoc && (
  <>
  <PDFViewerModal 
  isOpen={isPreviewModalOpen}
  onClose={() => setIsPreviewModalOpen(false)}
  fileUrl={getAbsoluteUrl(selectedDoc.filePath)}
  title={selectedDoc.title}
  />
   <SignatureModal 
   isOpen={isSignModalOpen}
   onClose={() => setIsSignModalOpen(false)}
   onSave={handleSaveSignature}
   />
   <ShareDocumentModal 
     isOpen={isShareModalOpen}
     onClose={() => setIsShareModalOpen(false)}
     documentId={selectedDoc._id}
     initialSharedWith={selectedDoc.sharedWith || []}
     onShare={handleShareSubmit}
   />
   </>
   )}
 </div>
 );
};