import React, { useState } from 'react';
import { Heart, MessageSquare, Share, Trash2, Sparkles, MoreVertical, CircleDollarSign, ChevronRight, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import toast from 'react-hot-toast';

import { SynergyModal } from './SynergyModal';

interface PostCardProps {
  post: any;
  onUpdate: () => void;
  onRetrySynergy?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showSynergy, setShowSynergy] = useState(false);
  const [synergyData, setSynergyData] = useState<any>(null);
  const [isLoadingSynergy, setIsLoadingSynergy] = useState(false);

  const isLiked = post.likes.includes(user?.id);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.put(`/posts/${post._id}/like`);
      onUpdate();
    } catch (err) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Update removed');
      onUpdate();
    } catch (err) {
      toast.error('Failed to remove update');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setCommentText('');
      onUpdate();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleViewConnection = async () => {
    setShowSynergy(true);
    if (synergyData && !isLoadingSynergy) return;

    setIsLoadingSynergy(true);
    try {
      const res = await api.post('/ai/synergy', { targetUserId: post.author?._id });
      setSynergyData(res.data);
    } catch (err) {
      console.error('Synergy Error:', err);
      setSynergyData(null);
      toast.error('Nexus Intelligence is busy. Please try again.');
    } finally {
      setIsLoadingSynergy(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Nexus Update from ${post.author?.name}`,
      text: post.content,
      url: `${window.location.origin}/feed` // In a real app, this would be a link to the specific post
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      } catch (err) {
        toast.error('Failed to share');
      }
    }
  };

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden group">
      <div className="p-8">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar src={post.author?.profile?.avatarUrl} alt={post.author?.name || 'User'} size="lg" className="ring-2 ring-primary-500/20 ring-offset-2" />
              {post.author?.profile?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-base font-bold text-gray-900 leading-none">{post.author?.name}</h4>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {post.author?.role === 'entrepreneur' ? <Sparkles size={10} /> : <CircleDollarSign size={10} />}
                  {post.author?.role}
                </div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {formatDistanceToNow(new Date(post.createdAt))} ago • Community Pulse
              </p>
            </div>
          </div>
          
          {user?.id === post.author?._id && (
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-xl transition-all"
              >
                <MoreVertical size={20} />
              </button>
              {showOptions && (
                <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-30 animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50/50 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} /> Delete Broadcast
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="space-y-6">
          <p className="text-[15px] text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.image && (
            <div className="rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-inner">
              <img 
                src={post.image.startsWith('/uploads') 
                  ? (import.meta.env.VITE_API_URL || 'https://nexus-backend-iini.onrender.com/api').replace('/api', '') + post.image 
                  : post.image} 
                alt="Post Attachment" 
                className="w-full h-auto object-cover max-h-[400px]" 
              />
            </div>
          )}

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-50/50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-50 transition-colors cursor-pointer border border-transparent hover:border-primary-100">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="mt-8 pt-6 border-t border-gray-100/50 flex items-center gap-8">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2.5 text-xs font-extrabold transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'animate-heart-pop' : ''} />
            <span className="tabular-nums">{post.likes?.length || 0}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2.5 text-xs font-extrabold transition-all hover:scale-110 active:scale-95 ${showComments ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}
          >
            <MessageSquare size={22} />
            <span className="tabular-nums">{post.comments?.length || 0}</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2.5 text-xs font-extrabold text-gray-400 hover:text-primary-600 transition-all hover:scale-110 active:scale-95 ml-auto"
          >
            <Share size={22} />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleCommentSubmit} className="flex gap-4">
              <Avatar src={user?.profile?.avatarUrl} alt={user?.name || 'User'} size="sm" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add to the conversation..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim() || isCommenting}
                  className="absolute right-2 top-1.5 p-1 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {post.comments?.map((comment: any, i: number) => (
                <div key={i} className="flex gap-3 group/comment">
                  <Avatar src={comment.user?.profile?.avatarUrl} alt={comment.user?.name || 'User'} size="sm" />
                  <div className="flex-1 bg-gray-50/50 rounded-2xl p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{comment.user?.name}</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{comment.text}</p>
                  </div>
                </div>
              ))}
              {(!post.comments || post.comments.length === 0) && (
                <p className="text-center text-xs font-bold text-gray-400 py-4 uppercase tracking-widest">No signals yet</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Synergy Snippet */}
      <div className="px-8 py-4 bg-primary-50/30 border-t border-primary-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-primary-100/50 rounded-lg text-primary-600">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-primary-800 uppercase tracking-widest">AI Synergy Insight</p>
            <p className="text-[9px] font-bold text-primary-600/70 uppercase">Strategic Alignment: High</p>
          </div>
        </div>
        <button 
          onClick={handleViewConnection}
          className="text-[10px] font-extrabold text-primary-600 hover:underline flex items-center gap-1 group"
        >
          View Connection <ChevronRight size={10} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {showSynergy && (
        <SynergyModal 
          onClose={() => setShowSynergy(false)} 
          data={synergyData} 
          isLoading={isLoadingSynergy} 
          onRetry={handleViewConnection}
        />
      )}
    </div>
  );
};

