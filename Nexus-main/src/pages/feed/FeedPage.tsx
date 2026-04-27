import React, { useState, useEffect } from 'react';
import { Share2, Sparkles, Filter, Plus, LayoutGrid } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { PostCard } from '../../components/feed/PostCard';
import { CreatePost } from '../../components/feed/CreatePost';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostsBuffer, setNewPostsBuffer] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Signal');

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to load community feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-post', (newPost: any) => {
      setNewPostsBuffer(prev => {
        // We only check against the buffer here; the merge function will handle the rest
        if (prev.some(p => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
      toast.success('New update from the community!', { icon: '🚀' });
    });

    return () => {
      socket.off('new-post');
    };
  }, [socket]);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
  };

  const handleApplyNewPosts = () => {
    setPosts(prev => {
      const filteredNew = newPostsBuffer.filter(nb => !prev.some(p => p._id === nb._id));
      return [...filteredNew, ...prev];
    });
    setNewPostsBuffer([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredPosts = activeFilter === 'All Signal' 
    ? posts 
    : posts.filter(p => {
        const type = p.type || 'News'; // Default to News if no type
        if (activeFilter === 'Milestones') return type === 'milestone';
        if (activeFilter === 'Mandates') return type === 'mandate';
        if (activeFilter === 'Analysis') return type === 'analysis';
        if (activeFilter === 'News') return type === 'news' || type === 'News';
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="text-primary-600" size={24} />
            Global Feed
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Real-time milestones and strategic intelligence.
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus size={18} />}
          fullWidth={window.innerWidth < 640}
        >
          Broadcast Update
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filters & Meta (1/4) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4 lg:mb-6">
              <Filter size={16} className="text-primary-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Signal Filters</h3>
            </div>
            
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 hide-scrollbar scroll-smooth">
              {['All Signal', 'Milestones', 'Mandates', 'News', 'Analysis'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap lg:w-full text-left px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                    activeFilter === filter 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
            <Sparkles size={24} className="mb-4 opacity-80" />
            <h3 className="text-base font-bold mb-2 leading-tight">AI Synergy Feed</h3>
            <p className="text-xs text-primary-100 font-medium leading-relaxed mb-4">
              Our neural engine is analyzing partners that align with your roadmap.
            </p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column: Feed List (3/4) */}
        <div className="lg:col-span-3 relative">
          {newPostsBuffer.length > 0 && (
            <div className="sticky top-24 z-30 flex justify-center mb-6 animate-in slide-in-from-top-4 duration-300">
              <button 
                onClick={handleApplyNewPosts}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-full shadow-xl shadow-primary-500/30 flex items-center gap-2 text-xs font-bold hover:bg-primary-700 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                {newPostsBuffer.length} New Update{newPostsBuffer.length > 1 ? 's' : ''} Available
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Pulse...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                <Share2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Silent Channels</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                Be the first to spark a conversation. Share a milestone or a strategic mandate.
              </p>
              <Button 
                variant="outline"
                className="mt-6"
                onClick={() => setShowCreateModal(true)}
              >
                Start the Protocol
              </Button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePost 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handlePostCreated} 
        />
      )}
    </div>
  );
};


