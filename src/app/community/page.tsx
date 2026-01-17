"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/sections/navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, 
  Heart, 
  Send, 
  Plus, 
  Search, 
  Filter,
  Clock,
  IndianRupee,
  Calendar,
  AlertCircle,
  X,
  User,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Megaphone,
  ShoppingBag,
  ChevronDown,
  Loader2
} from 'lucide-react';

type PostType = 'discussion' | 'rent_request' | 'announcement';
type TabType = 'feed' | 'chat';

interface Post {
  id: string;
  user_id: string;
  type: PostType;
  title: string;
  content: string;
  category?: string;
  budget_min?: number;
  budget_max?: number;
  needed_from?: string;
  needed_until?: string;
  is_urgent?: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: { full_name: string; college: string; trust_level: string };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string };
}

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: { full_name: string; trust_level: string };
}

const postTypeConfig = {
  discussion: { icon: MessageSquare, label: 'Discussion', color: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  rent_request: { icon: ShoppingBag, label: 'Looking For', color: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  announcement: { icon: Megaphone, label: 'Announcement', color: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
};

export default function CommunityPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [filterType, setFilterType] = useState<PostType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [newPost, setNewPost] = useState({
    type: 'discussion' as PostType,
    title: '',
    content: '',
    category: '',
    budget_min: '',
    budget_max: '',
    needed_from: '',
    needed_until: '',
    is_urgent: false
  });

  useEffect(() => {
    fetchPosts();
    fetchChatMessages();

    const chatChannel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
        const { data } = await supabase
          .from('chat_messages')
          .select('*, profiles(full_name, trust_level)')
          .eq('id', payload.new.id)
          .single();
        if (data) setChatMessages(prev => [...prev, data]);
      })
      .subscribe();

    const postsChannel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(postsChannel);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_posts')
      .select('*, profiles(full_name, college, trust_level)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const fetchChatMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(full_name, trust_level)')
      .order('created_at', { ascending: true })
      .limit(100);
    setChatMessages(data || []);
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    const postData: any = {
      user_id: user.uid,
      type: newPost.type,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category || null,
      is_urgent: newPost.is_urgent
    };

    if (newPost.type === 'rent_request') {
      postData.budget_min = newPost.budget_min ? parseFloat(newPost.budget_min) : null;
      postData.budget_max = newPost.budget_max ? parseFloat(newPost.budget_max) : null;
      postData.needed_from = newPost.needed_from || null;
      postData.needed_until = newPost.needed_until || null;
    }

    await supabase.from('community_posts').insert(postData);
    setNewPost({ type: 'discussion', title: '', content: '', category: '', budget_min: '', budget_max: '', needed_from: '', needed_until: '', is_urgent: false });
    setShowCreateModal(false);
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.uid)
      .single();

    if (existingLike) {
      await supabase.from('post_likes').delete().eq('id', existingLike.id);
      await supabase.from('community_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.uid });
      await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
    }
    fetchPosts();
  };

  const handleAddComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;

    await supabase.from('post_comments').insert({
      post_id: selectedPost.id,
      user_id: user.uid,
      content: newComment
    });
    await supabase.from('community_posts').update({ comments_count: selectedPost.comments_count + 1 }).eq('id', selectedPost.id);
    
    setNewComment('');
    fetchComments(selectedPost.id);
    fetchPosts();
  };

  const handleSendChatMessage = async () => {
    if (!user || !newChatMessage.trim()) return;

    await supabase.from('chat_messages').insert({
      user_id: user.uid,
      message: newChatMessage
    });
    setNewChatMessage('');
  };

  const openPostDetails = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  const filteredPosts = posts.filter(post => {
    const matchesType = filterType === 'all' || post.type === filterType;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTrustBadgeColor = (level?: string) => {
    switch (level) {
      case 'gold': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      default: return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <Navbar />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-bold">Community Hub</h1>
          </div>
          <p className="text-white/50">Connect, share, and find what you need from fellow students</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'}`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Feed
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'}`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Live Chat
                </button>
              </div>
              
              {activeTab === 'feed' && user && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </motion.button>
              )}
            </div>

            {activeTab === 'feed' && (
              <>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-400/30"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="h-10 px-4 pr-10 rounded-xl bg-white/5 border border-white/10 text-sm appearance-none focus:outline-none focus:border-amber-400/30 cursor-pointer"
                    >
                      <option value="all">All Posts</option>
                      <option value="discussion">Discussions</option>
                      <option value="rent_request">Rent Requests</option>
                      <option value="announcement">Announcements</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {filteredPosts.map((post, index) => {
                        const config = postTypeConfig[post.type];
                        const TypeIcon = config.icon;
                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => openPostDetails(post)}
                            className={`p-5 rounded-2xl bg-white/5 border ${post.is_urgent ? 'border-red-500/50' : 'border-white/10'} hover:bg-white/[0.08] transition-all cursor-pointer group`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                <TypeIcon className={`w-5 h-5 ${config.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${config.bg} ${config.text} border ${config.border}`}>
                                    {config.label}
                                  </span>
                                  {post.is_urgent && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Urgent
                                    </span>
                                  )}
                                  <span className="text-white/30 text-xs ml-auto">{formatTime(post.created_at)}</span>
                                </div>
                                
                                <h3 className="font-semibold text-lg mb-1 group-hover:text-amber-400 transition-colors">{post.title}</h3>
                                <p className="text-white/50 text-sm line-clamp-2 mb-3">{post.content}</p>
                                
                                {post.type === 'rent_request' && (post.budget_min || post.budget_max) && (
                                  <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                                    {(post.budget_min || post.budget_max) && (
                                      <span className="flex items-center gap-1">
                                        <IndianRupee className="w-3 h-3" />
                                        {post.budget_min && post.budget_max 
                                          ? `₹${post.budget_min} - ₹${post.budget_max}`
                                          : post.budget_min 
                                            ? `From ₹${post.budget_min}`
                                            : `Up to ₹${post.budget_max}`
                                        }
                                      </span>
                                    )}
                                    {post.needed_from && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.needed_from).toLocaleDateString()}
                                        {post.needed_until && ` - ${new Date(post.needed_until).toLocaleDateString()}`}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-[10px]">
                                      {post.profiles?.full_name?.charAt(0) || '?'}
                                    </div>
                                    <span className="text-white/60">{post.profiles?.full_name || 'Anonymous'}</span>
                                    {post.profiles?.trust_level && (
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${getTrustBadgeColor(post.profiles.trust_level)}`}>
                                        {post.profiles.trust_level}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-white/40 text-sm">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleLikePost(post.id); }}
                                      className="flex items-center gap-1 hover:text-red-400 transition-colors"
                                    >
                                      <Heart className="w-4 h-4" />
                                      {post.likes_count}
                                    </button>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="w-4 h-4" />
                                      {post.comments_count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {filteredPosts.length === 0 && (
                      <div className="text-center py-20 text-white/40">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No posts found. Be the first to share something!</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-300px)] flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, index) => {
                    const isOwnMessage = msg.user_id === user?.uid;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : ''}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-white/60">{msg.profiles?.full_name || 'Anonymous'}</span>
                              {msg.profiles?.trust_level && (
                                <span className={`px-1 py-0.5 rounded text-[8px] uppercase ${getTrustBadgeColor(msg.profiles.trust_level)}`}>
                                  {msg.profiles.trust_level}
                                </span>
                              )}
                            </div>
                          )}
                          <div className={`px-4 py-2 rounded-2xl text-sm ${isOwnMessage 
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-br-md' 
                            : 'bg-white/10 text-white rounded-bl-md'
                          }`}>
                            {msg.message}
                          </div>
                          <span className={`text-[10px] text-white/30 mt-1 block ${isOwnMessage ? 'text-right' : ''}`}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                
                {user ? (
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendChatMessage}
                        className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-black"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-white/10 text-center">
                    <a href="/login" className="text-amber-400 hover:underline text-sm">Login to join the conversation</a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:w-80 space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Posts</span>
                  <span className="font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Rent Requests</span>
                  <span className="font-medium text-amber-400">{posts.filter(p => p.type === 'rent_request').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Active Discussions</span>
                  <span className="font-medium text-blue-400">{posts.filter(p => p.type === 'discussion').length}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h3 className="font-semibold mb-2">Need Something?</h3>
              <p className="text-sm text-white/50 mb-4">Post a rent request and let the community help you find what you need.</p>
              {user ? (
                <button 
                  onClick={() => { setNewPost(prev => ({ ...prev, type: 'rent_request' })); setShowCreateModal(true); }}
                  className="w-full py-2 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Post a Request
                </button>
              ) : (
                <a href="/login" className="block w-full py-2 rounded-xl bg-amber-500 text-black font-bold text-sm text-center hover:bg-amber-400 transition-colors">
                  Login to Post
                </a>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/40" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => openPostDetails(post)}
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg ${postTypeConfig[post.type].bg} flex items-center justify-center shrink-0`}>
                      {React.createElement(postTypeConfig[post.type].icon, { className: `w-4 h-4 ${postTypeConfig[post.type].text}` })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-white/40">{formatTime(post.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Create Post</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Post Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(postTypeConfig) as PostType[]).map(type => {
                      const config = postTypeConfig[type];
                      const TypeIcon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setNewPost(prev => ({ ...prev, type }))}
                          className={`p-3 rounded-xl border transition-all ${newPost.type === type 
                            ? `${config.bg} ${config.border}` 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <TypeIcon className={`w-5 h-5 mx-auto mb-1 ${newPost.type === type ? config.text : 'text-white/40'}`} />
                          <span className={`text-xs ${newPost.type === type ? config.text : 'text-white/60'}`}>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={newPost.type === 'rent_request' ? "What are you looking for?" : "Give your post a title"}
                    className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Description</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share more details..."
                    rows={4}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-amber-400/30 resize-none"
                  />
                </div>

                {newPost.type === 'rent_request' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/70">Min Budget (₹)</label>
                        <input
                          type="number"
                          value={newPost.budget_min}
                          onChange={(e) => setNewPost(prev => ({ ...prev, budget_min: e.target.value }))}
                          placeholder="0"
                          className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/70">Max Budget (₹)</label>
                        <input
                          type="number"
                          value={newPost.budget_max}
                          onChange={(e) => setNewPost(prev => ({ ...prev, budget_max: e.target.value }))}
                          placeholder="1000"
                          className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/70">Needed From</label>
                        <input
                          type="date"
                          value={newPost.needed_from}
                          onChange={(e) => setNewPost(prev => ({ ...prev, needed_from: e.target.value }))}
                          className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-white/70">Needed Until</label>
                        <input
                          type="date"
                          value={newPost.needed_until}
                          onChange={(e) => setNewPost(prev => ({ ...prev, needed_until: e.target.value }))}
                          className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                        />
                      </div>
                    </div>
                  </>
                )}

                <label className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPost.is_urgent}
                    onChange={(e) => setNewPost(prev => ({ ...prev, is_urgent: e.target.checked }))}
                    className="w-4 h-4 rounded accent-red-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">Mark as Urgent</span>
                    <p className="text-xs text-white/40">This will highlight your post</p>
                  </div>
                </label>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  Publish Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${postTypeConfig[selectedPost.type].bg} flex items-center justify-center`}>
                      {React.createElement(postTypeConfig[selectedPost.type].icon, { className: `w-5 h-5 ${postTypeConfig[selectedPost.type].text}` })}
                    </div>
                    <div>
                      <span className={`text-xs font-bold uppercase ${postTypeConfig[selectedPost.type].text}`}>
                        {postTypeConfig[selectedPost.type].label}
                      </span>
                      {selectedPost.is_urgent && (
                        <span className="ml-2 text-xs font-bold text-red-400">URGENT</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold mb-3">{selectedPost.title}</h2>
                <p className="text-white/60 whitespace-pre-wrap">{selectedPost.content}</p>

                {selectedPost.type === 'rent_request' && (selectedPost.budget_min || selectedPost.budget_max || selectedPost.needed_from) && (
                  <div className="flex flex-wrap gap-4 mt-4 p-4 rounded-xl bg-white/5">
                    {(selectedPost.budget_min || selectedPost.budget_max) && (
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-amber-400" />
                        <span className="text-white/70">Budget:</span>
                        <span className="font-medium">
                          {selectedPost.budget_min && selectedPost.budget_max 
                            ? `₹${selectedPost.budget_min} - ₹${selectedPost.budget_max}`
                            : selectedPost.budget_min 
                              ? `From ₹${selectedPost.budget_min}`
                              : `Up to ₹${selectedPost.budget_max}`
                          }
                        </span>
                      </div>
                    )}
                    {selectedPost.needed_from && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-white/70">Duration:</span>
                        <span className="font-medium">
                          {new Date(selectedPost.needed_from).toLocaleDateString()}
                          {selectedPost.needed_until && ` - ${new Date(selectedPost.needed_until).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                      {selectedPost.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedPost.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-white/40">{formatTime(selectedPost.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLikePost(selectedPost.id)}
                      className="flex items-center gap-1 text-white/60 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{selectedPost.likes_count}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comments ({comments.length})
                </h3>
                {comments.length === 0 ? (
                  <p className="text-center text-white/40 py-8">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                        {comment.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.profiles?.full_name || 'Anonymous'}</span>
                          <span className="text-xs text-white/40">{formatTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-white/70">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm focus:outline-none focus:border-amber-400/30"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 h-11 rounded-xl bg-amber-500 text-black font-bold text-sm disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-white/10 text-center">
                  <a href="/login" className="text-amber-400 hover:underline text-sm">Login to comment</a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
