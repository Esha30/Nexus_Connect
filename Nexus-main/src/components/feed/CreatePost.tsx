import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Hash, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import api from '../../api/api';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onClose: () => void;
  onSuccess: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImage(res.data.fileUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/posts', { content, image });
      toast.success('Update broadcasted to the community');
      onSuccess(res.data);
    } catch (err) {
      toast.error('Failed to publish update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiImprove = async () => {
    if (!content.trim() || isGenerating) return;
    setIsGenerating(true);
    const aiToast = toast.loading('AI is refining your update...');
    try {
      const res = await api.post('/ai/chat', { 
        message: `Rewrite this community post to be more professional, punchy, and engaging for a venture capital platform. Return ONLY the rewritten text, no conversational filler or multiple options. Original: "${content}"` 
      });
      setContent(res.data.response.replace(/^"|"$/g, ''));
      toast.success('Update optimized!', { id: aiToast });
    } catch (err) {
      toast.error('AI refinement failed', { id: aiToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.2)] scale-in overflow-hidden border border-white/50">
        <div className="px-10 py-8 border-b border-gray-100/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-2xl text-primary-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Ecosystem Update</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Share with the Nexus Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-6">
            <div className="relative group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your venture today? Share a milestone, a mandate, or a market shift..."
                className="w-full h-52 bg-gray-50/50 hover:bg-gray-50 border-none rounded-[2rem] p-6 text-base font-medium text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-primary-500/10 outline-none resize-none transition-all duration-300"
                autoFocus
              />
              <div className="absolute bottom-4 right-6 text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                {content.length} / 1000
              </div>
            </div>

            {image && (
              <div className="relative rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner group/img">
                <img 
                  src={image.startsWith('/uploads') 
                    ? (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '') + image 
                    : image} 
                  alt="Preview" 
                  className="w-full h-48 object-cover" 
                />
                <button 
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between px-2">
              <div className="flex gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all hover:scale-110 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={22} className="animate-spin" /> : <ImageIcon size={22} />}
                </button>
                <button type="button" className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all hover:scale-110">
                  <Hash size={22} />
                </button>
              </div>
              
              <button 
                type="button" 
                onClick={handleAiImprove}
                disabled={!content.trim() || isGenerating}
                className="px-5 py-2.5 bg-primary-50 text-primary-700 rounded-2xl transition-all flex items-center gap-2.5 border border-primary-100/50 hover:bg-primary-100 hover:shadow-lg hover:shadow-primary-500/10 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span className="text-[11px] font-extrabold uppercase tracking-widest">Refine with AI</span>
              </button>
            </div>
          </div>

          <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100/50 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Discard
            </button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim() || isUploading}
              className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.25rem] shadow-2xl shadow-primary-500/30 flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              <span className="text-sm font-bold">Broadcast Update</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

