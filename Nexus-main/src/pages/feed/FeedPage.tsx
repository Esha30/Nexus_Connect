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
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      setPosts(prev => {
        // Prevent duplicate posts if the sender also receives the broadcast
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="text-primary-600" size={24} />
            Global Feed
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time milestones, mandates, and strategic intelligence from the Nexus community.
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus size={18} />}
        >
          Broadcast Update
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filters & Meta (1/4) */}
        <div className="lg:col-span-1 space-y-6 sticky top-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={16} className="text-primary-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Signal Filters</h3>
            </div>
            
            <div className="space-y-2">
              {['All Signal', 'Milestones', 'Strategic Mandates', 'Venture News', 'Market Analysis'].map((filter) => (
                <button 
                  key={filter} 
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    filter === 'All Signal' 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
            <Sparkles size={24} className="mb-4 opacity-80" />
            <h3 className="text-base font-bold mb-2 leading-tight">AI Synergy Feed</h3>
            <p className="text-xs text-primary-100 font-medium leading-relaxed mb-4">
              Our neural engine is analyzing the feed to find partners that align with your current roadmap.
            </p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column: Feed List (3/4) */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Synchronizing Pulse...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
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


