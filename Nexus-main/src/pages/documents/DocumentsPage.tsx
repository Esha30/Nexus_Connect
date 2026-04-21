import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import { FileText, Download, Trash2, Loader, Eye, Upload, Share2, Shield, Info, ChevronDown, CheckCircle2, X } from 'lucide-react';
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
 const fileInputRef = useRef<HTMLInputElement>(null);

 // Modal states
 const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
 const [isSignModalOpen, setIsSignModalOpen] = useState(false);
 const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
 const [isGuideOpen, setIsGuideOpen] = useState(true);
 const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'encrypted'>('all');
 const [uploadCategory, setUploadCategory] = useState<'pitch_deck' | 'financials' | 'legal' | 'identity' | 'other'>('other');

 const filteredDocuments = useMemo(() => {
   switch (activeFilter) {
      case 'recent': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return documents.filter(doc => new Date(doc.createdAt) >= sevenDaysAgo);
      }
      case 'encrypted':
        return documents.filter(doc => doc.isEncrypted);
     default:
       return documents;
   }
 }, [documents, activeFilter]);

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
 <div className="relative pt-12 pb-24 px-6 sm:px-5 lg:px-16 overflow-hidden bg-white border-b border-gray-100/50">
 <div className="absolute -top-40 -left-60 w-96 h-96 bg-blue-400/20 rounded-full pointer-events-none" />
 <div className="absolute top-20 -right-20 w-72 h-72 bg-slate-400/20 rounded-full pointer-events-none" />
  <div className="max-w-7xl mx-auto relative z-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold mb-6 ">
          <FileText size={14} /> Repository Terminal
        </div>
        <h1 className="text-lg md:text-xl font-medium text-gray-900 tracking-tight leading-tight mb-4">
          Venture Asset <span className="text-primary-600">terminal.</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
          Securely manage, categorize, and authorize access to your startup's critical venture assets and legal protocols.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative group">
          <select 
            className="appearance-none bg-white border border-gray-100 rounded-lg py-2.5 pl-4 pr-10 text-sm font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-primary-500/20 outline-none w-full sm:w-44 cursor-pointer transition-all"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as any)}
          >
            <option value="pitch_deck">Pitch Deck</option>
            <option value="financials">Financials</option>
            <option value="legal">Legal</option>
            <option value="identity">Identity</option>
            <option value="other">Other Asset</option>
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
          className="rounded-lg py-2.5 px-6 font-bold text-sm shadow-xl shadow-primary-600/10 bg-primary-600 active:scale-95 transition-all w-full sm:w-auto"
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
      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-8 relative">
        <button onClick={() => setIsGuideOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"><X size={18}/></button>
        <div className="flex items-center gap-3 mb-6">
          <Info size={20} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Command Protocol: Documentation Center</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
              <Shield size={16} className="text-primary-600" /> Secure Storage
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic">Assets are encrypted upon upload and stored behind multi-layer security protocols. Choose a category to optimize search intelligence.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
              <Share2 size={16} className="text-primary-600" /> Selective Sharing
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic">Grant 'View Access' to specific connections. Shared assets appear automatically in the recipient's terminal without insecure redirects.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
              <CheckCircle2 size={16} className="text-primary-600" /> E-Signature
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium italic">Authorize legal agreements directly in the browser. Signed documents generate a permanent operational record.</p>
          </div>
        </div>
      </div>
    </div>
    
    {!isGuideOpen && (
      <button onClick={() => setIsGuideOpen(true)} className="mt-4 text-xs font-bold text-primary-600 hover:underline flex items-center gap-2">
        <Info size={14}/> Show Command Protocol Guide
      </button>
    )}
  </div>
 </div>

 <div className="max-w-7xl mx-auto px-6 sm:px-5 lg:px-16 w-full pb-20">
 
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
 {/* Storage info */}
 <Card className="lg:col-span-1 border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
 <h2 className="text-sm font-medium text-gray-900">Memory protocol</h2>
 </CardHeader>
 <CardBody className="space-y-4 p-6">
 <div className="space-y-3">
 <div className="flex justify-between text-xs font-semibold">
 <span className="text-gray-400">Utilized assets</span>
 <span className="text-gray-900">1.2 GB</span>
 </div>
 <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
 <div className="h-2 bg-primary-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: '15%' }}></div>
 </div>
 <div className="flex justify-between text-xs font-semibold">
 <span className="text-gray-400">Bandwidth reserved</span>
 <span className="text-gray-900">18.8 GB</span>
 </div>
 </div>
 
 <div className="pt-6 border-t border-gray-100">
 <h3 className="text-xs font-semibold text-gray-400 mb-4">Quick navigation</h3>
 <div className="space-y-2">
 <button 
  onClick={() => setActiveFilter('all')}
  className={`w-full text-left px-5 py-3.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-3 group ${activeFilter === 'all' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`}
 >
 <div className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${activeFilter === 'all' ? 'bg-primary-600' : 'bg-slate-300'}`} />
 All assets
 </button>
 <button 
  onClick={() => setActiveFilter('recent')}
  className={`w-full text-left px-5 py-3.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-3 group ${activeFilter === 'recent' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`}
 >
 <div className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${activeFilter === 'recent' ? 'bg-primary-600' : 'bg-slate-300'}`} />
 Recent assets
 </button>
 <button 
  onClick={() => setActiveFilter('encrypted')}
  className={`w-full text-left px-5 py-3.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-3 group ${activeFilter === 'encrypted' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`}
 >
 <div className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${activeFilter === 'encrypted' ? 'bg-primary-600' : 'bg-slate-300'}`} />
 Encrypted assets
 </button>
 </div>
 </div>
 </CardBody>
 </Card>
 
 {/* Document list */}
 <div className="lg:col-span-3">
 <Card className="border-gray-100 shadow-sm bg-white rounded-lg overflow-hidden">
 <CardHeader className="flex justify-between items-center border-b border-gray-100 px-4 py-5 bg-gray-50/30">
 <h2 className="text-sm font-medium text-gray-900 capitalize">{activeFilter === 'all' ? 'Active' : activeFilter} ledger</h2>
 <Badge variant="secondary" className="bg-primary-50 text-primary-600 border-none font-semibold text-xs px-3 py-1.5 shadow-sm">
 {filteredDocuments.length} Items indexed
 </Badge>
 </CardHeader>
 <CardBody className="p-0">
 {isLoading ? (
 <div className="flex justify-center p-20"><Loader className="animate-spin text-primary-600" /></div>
 ) : documents.length === 0 ? (
 <div className="text-center p-20 text-gray-400">
 <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-100">
 <FileText className="text-gray-200" size={40} />
 </div>
 <p className="font-semibold text-sm text-gray-400">No assets detected in terminal.</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-100">
 {filteredDocuments.map(doc => (
 <div
 key={doc._id}
 className="flex items-center p-6 hover:bg-gray-50/80 transition-all duration-300 group cursor-default"
 >
 <div className="p-4 bg-primary-50 rounded-lg mr-5 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all text-primary-600">
 <FileText size={20} />
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <h3 className="text-base font-medium text-gray-900 truncate tracking-tight">
 {doc.title}
 </h3>
 </div>
 
 <div className="flex items-center gap-4 mt-1.5">
 <span className="text-xs font-semibold text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
 {(doc.fileType || '').split('/')[1] || 'FILE'}
 </span>
 <span className="text-xs font-semibold text-gray-400">
 {new Date(doc.updatedAt).toLocaleDateString()}
 </span>
  <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'} size="sm" className="capitalize font-bold text-[10px] px-2 py-0.5">
    {doc.status.replace('_', ' ')}
  </Badge>
  {doc.category && (
    <Badge variant="outline" size="sm" className="capitalize font-bold text-[10px] px-2 py-0.5 border-gray-200 text-gray-500 flex items-center gap-1 bg-white">
      {getCategoryIcon(doc.category)}
      {doc.category.replace('_', ' ')}
    </Badge>
  )}
  {doc.sharedWith?.length > 0 && (
    <Badge variant="accent" size="sm" className="capitalize font-bold text-[10px] px-2 py-0.5 flex items-center gap-1">
      <Share2 size={10} /> Shared with {doc.sharedWith.length}
    </Badge>
  )}
 </div>
 </div>
 
  <div className="flex items-center gap-2 ml-4 shrink-0">
  <Button
  variant="ghost"
  size="sm"
  className="w-10 h-10 p-0 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all font-bold"
  title="Preview Terminal" aria-label="Preview document"
  onClick={() => handlePreview(doc)}
  >
  <Eye size={18} />
  </Button>

  <Button
    variant="ghost"
    size="sm"
    className="w-10 h-10 p-0 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all font-bold"
    title="Authorize Access" aria-label="Share document with connections"
    onClick={() => handleShare(doc)}
  >
    <Share2 size={18} />
  </Button>

  {doc.status !== 'signed' && (
  <Button
  variant="ghost"
  size="sm"
  className="w-10 h-10 p-0 rounded-lg text-primary-600 hover:bg-primary-50 transition-all font-bold"
  title="E-Sign" aria-label="Electronically sign document"
  onClick={() => handleSign(doc)}
  >
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  </Button>
  )}
  
  <Button
  variant="ghost"
  size="sm"
  className="w-10 h-10 p-0 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all font-bold"
  title="Download Local" aria-label="Download document"
  onClick={() => window.open(getAbsoluteUrl(doc.filePath), '_blank')}
  >
  <Download size={18} />
  </Button>
  
  <Button
  variant="ghost"
  size="sm"
  className="w-10 h-10 p-0 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-all font-bold"
  title="Purge" aria-label="Delete document"
  onClick={() => handleDeleteDocument(doc._id)}
  >
  <Trash2 size={18} />
  </Button>
  </div>
 </div>
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