
import React, { useState, useRef } from 'react';
import { CommunityPost, CommunityReply, UserProfile } from '../types';
import { Heart, MessageCircle, MapPin, Plus, User, Send, ArrowUpDown, Image as ImageIcon, X, ChevronDown, Smile } from 'lucide-react';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    author: 'Sarah Jenkins',
    location: 'Kyoto, Japan',
    content: 'Just discovered the most peaceful tea house near the Philosopher\'s Path. The owner is so sweet and they have a women-only seating area upstairs! 🍵 #SoloTravel',
    likes: 124,
    isLiked: false,
    category: 'Hidden Gem',
    timestamp: '2h ago',
    imageUrl: 'https://images.unsplash.com/photo-1545960594-874ca72768f5?auto=format&fit=crop&q=80&w=800',
    replies: [
      {
        id: 'r1',
        author: 'Jessica M.',
        content: 'Oh! I think I know this place. Is it the one with the blue awning?',
        timestamp: '1h ago'
      },
      {
        id: 'r2',
        author: 'Sarah Jenkins',
        content: 'Yes, exactly! Highly recommend the matcha.',
        timestamp: '45m ago'
      }
    ]
  },
  {
    id: '2',
    author: 'Elena Rodriguez',
    location: 'Barcelona, Spain',
    content: 'Tip for night walks: Stick to the main avenues in Eixample. Avoid the narrow alleys in Gothic Quarter after 10PM if you are alone. Stay safe ladies! ✨',
    likes: 89,
    isLiked: true,
    category: 'Safety',
    timestamp: '5h ago',
    replies: []
  },
  {
    id: '3',
    author: 'Amara O.',
    location: 'Cape Town, SA',
    content: 'The waterfront area is super lively and secure. Found a group of other solo female travelers at the food market. Connection made! 👯‍♀️',
    likes: 256,
    isLiked: false,
    category: 'Experience',
    timestamp: '1d ago',
    replies: []
  }
];

interface CommunityFeedProps {
  user: UserProfile | null;
  onAuthRequired: () => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ user, onAuthRequired }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostLocation, setNewPostLocation] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityPost['category']>('Experience');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replySorts, setReplySorts] = useState<Record<string, 'oldest' | 'newest'>>({});

  // Reply Drafts State (keyed by postId)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyImages, setReplyImages] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, onSelect: (img: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenPostModal = () => {
      if (!user) {
          onAuthRequired();
          return;
      }
      setIsPosting(true);
      setNewPostLocation('Current Location');
  };

  const handlePost = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!newPostContent.trim() && !newPostImage) return;
    
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: user.name,
      location: newPostLocation || 'Unknown Location',
      content: newPostContent,
      likes: 0,
      isLiked: false,
      category: newPostCategory,
      timestamp: 'Just now',
      imageUrl: newPostImage || undefined,
      replies: []
    };

    setPosts([post, ...posts]);
    // Reset state
    setNewPostContent('');
    setNewPostImage(null);
    setNewPostLocation('');
    setNewPostCategory('Experience');
    setShowLocationInput(false);
    setIsPosting(false);
    setSortBy('newest');
  };

  const toggleReplies = (postId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }
    
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleReplySort = (postId: string) => {
    setReplySorts(prev => ({
      ...prev,
      [postId]: prev[postId] === 'newest' ? 'oldest' : 'newest'
    }));
  };

  const toggleLike = (postId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const isLiked = !!post.isLiked;
        return {
          ...post,
          isLiked: !isLiked,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const updateReplyDraft = (postId: string, content: string) => {
    setReplyDrafts(prev => ({ ...prev, [postId]: content }));
  };

  const updateReplyImage = (postId: string, image: string | null) => {
    if (image === null) {
      const newImages = { ...replyImages };
      delete newImages[postId];
      setReplyImages(newImages);
    } else {
      setReplyImages(prev => ({ ...prev, [postId]: image }));
    }
  };

  const submitReply = (postId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }
    const content = replyDrafts[postId] || '';
    const image = replyImages[postId];

    if (!content.trim() && !image) return;

    const newReply: CommunityReply = {
      id: Date.now().toString(),
      author: user.name,
      content: content,
      timestamp: 'Just now',
      imageUrl: image
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...(post.replies || []), newReply]
        };
      }
      return post;
    }));

    // Clear drafts
    updateReplyDraft(postId, '');
    updateReplyImage(postId, null);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return 0;
  });

  return (
    <div className="max-w-3xl mx-auto p-6 pb-24 relative animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">SheRoam Community</h2>
          <p className="text-gray-500">Share your stories and help others travel safer.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-rose-200 transition">
             <ArrowUpDown className="w-4 h-4 text-gray-500" />
             <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="bg-transparent text-sm text-gray-700 font-medium focus:outline-none cursor-pointer pr-2"
                aria-label="Sort posts"
             >
                <option value="newest">Newest First</option>
                <option value="popular">Most Liked</option>
             </select>
          </div>
        </div>
      </div>

      {/* Engaging Post Trigger */}
      {!isPosting && (
        <div 
            onClick={handleOpenPostModal}
            className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-center cursor-pointer hover:shadow-md transition duration-300 group"
        >
            {user?.avatar ? (
                <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100" alt={user.name} />
            ) : (
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                    <User className="w-6 h-6" />
                </div>
            )}
            <div className="flex-1 bg-gray-50 rounded-full h-12 flex items-center px-6 text-gray-500 group-hover:bg-gray-100 transition text-base">
                Share your travel story...
            </div>
             <div className="hidden sm:flex items-center gap-2 text-gray-400 pr-2">
                <div className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition"><ImageIcon className="w-5 h-5" /></div>
                <div className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition"><MapPin className="w-5 h-5" /></div>
            </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isPosting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 text-center flex-1 ml-8">Create Post</h3>
                      <button onClick={() => setIsPosting(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-4">
                           {user?.avatar ? (
                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="User" />
                            ) : (
                                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{user?.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="relative">
                                        <select 
                                            value={newPostCategory}
                                            onChange={(e) => setNewPostCategory(e.target.value as any)}
                                            className="text-xs font-bold bg-rose-50 text-rose-700 rounded-lg pl-2 pr-6 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-200"
                                        >
                                            <option value="Experience">Experience</option>
                                            <option value="Safety">Safety Alert</option>
                                            <option value="Hidden Gem">Hidden Gem</option>
                                            <option value="Food">Food & Drink</option>
                                        </select>
                                        <ChevronDown className="absolute right-1.5 top-1 w-3 h-3 text-rose-500 pointer-events-none" />
                                    </div>
                                    <span className="text-xs text-gray-300">|</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        Public
                                    </div>
                                </div>
                            </div>
                      </div>

                      {/* Text Area */}
                      <textarea
                        className="w-full text-lg placeholder-gray-400 border-none outline-none resize-none mb-4 min-h-[120px]"
                        placeholder="What's on your mind? Share a tip, question, or story..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        autoFocus
                      />

                      {/* Image Preview */}
                      {newPostImage && (
                        <div className="relative mb-4 rounded-2xl overflow-hidden border border-gray-100 group">
                            <img src={newPostImage} className="w-full h-auto max-h-64 object-cover" alt="Preview" />
                            <button 
                                onClick={() => setNewPostImage(null)}
                                className="absolute top-2 right-2 bg-gray-900/80 text-white p-1.5 rounded-full hover:bg-gray-900 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                      )}
                      
                      {/* Location Input */}
                      {(showLocationInput || newPostLocation) && (
                          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-2 rounded-xl mb-4 animate-fade-in border border-rose-100">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <input 
                                type="text"
                                placeholder="Where are you?"
                                value={newPostLocation}
                                onChange={(e) => setNewPostLocation(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder-rose-300 text-rose-700"
                              />
                              <button 
                                onClick={() => { setNewPostLocation(''); setShowLocationInput(false); }} 
                                className="text-rose-400 hover:text-rose-700 p-1 hover:bg-rose-100 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                          </div>
                      )}

                      {/* Add to Post Actions */}
                      <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm mt-2">
                          <span className="text-sm font-bold text-gray-500 pl-2">Add to your post</span>
                          <div className="flex items-center gap-1">
                               <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={(e) => handleImageSelect(e, setNewPostImage)}
                               />
                               <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition tooltip-trigger"
                                title="Photo"
                               >
                                   <ImageIcon className="w-5 h-5" />
                               </button>
                               <button 
                                onClick={() => setShowLocationInput(true)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition"
                                title="Check in"
                               >
                                   <MapPin className="w-5 h-5" />
                               </button>
                          </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                      <button 
                        onClick={handlePost}
                        disabled={!newPostContent.trim() && !newPostImage}
                        className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-rose-200"
                      >
                          Post
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const isExpanded = expandedPosts.has(post.id);
          const draftContent = replyDrafts[post.id] || '';
          const draftImage = replyImages[post.id];
          
          // Reply Sorting Logic
          const replySortOrder = replySorts[post.id] || 'oldest';
          const replies = post.replies || [];
          const displayedReplies = replySortOrder === 'newest' ? [...replies].reverse() : replies;
          
          return (
            <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-rose-100 transition duration-200">
              {/* Post Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-200 to-teal-200 rounded-full flex items-center justify-center text-gray-700 overflow-hidden">
                     <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{post.author}</h4>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <MapPin className="w-3 h-3" />
                      {post.location} • {post.timestamp}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${post.category === 'Safety' ? 'bg-red-50 text-red-600' : 
                    post.category === 'Hidden Gem' ? 'bg-purple-50 text-purple-600' : 
                    'bg-teal-50 text-teal-600'}`}>
                  {post.category}
                </span>
              </div>
              
              {/* Post Content */}
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                {post.content}
              </p>
              
              {post.imageUrl && (
                <div className="mb-4">
                  <img src={post.imageUrl} alt="Post attachment" className="rounded-xl w-full max-h-96 object-cover border border-gray-100" />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 text-gray-400 border-b border-gray-50 pb-4">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 transition group ${post.isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                >
                  <Heart className={`w-5 h-5 transition-transform duration-300 ${post.isLiked ? 'fill-rose-500 scale-110' : 'group-hover:fill-rose-500 group-active:scale-95'}`} />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button 
                  onClick={() => toggleReplies(post.id)}
                  className={`flex items-center gap-2 transition ${isExpanded ? 'text-rose-500' : 'hover:text-rose-500'}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {post.replies && post.replies.length > 0 ? `${post.replies.length} Replies` : 'Reply'}
                  </span>
                </button>
              </div>

              {/* Animated Replies Section */}
              <div 
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-4 space-y-4">
                    {/* Replies Sort Toggle */}
                    {replies.length > 1 && (
                      <div className="flex justify-end px-2">
                        <button
                          onClick={() => toggleReplySort(post.id)}
                          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-rose-600 transition"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          {replySortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                      </div>
                    )}

                    {displayedReplies.map((reply) => (
                      <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-gray-100 animate-fade-in">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {reply.author.charAt(0)}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-gray-900">{reply.author}</span>
                            <span className="text-xs text-gray-400">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                          {reply.imageUrl && (
                            <div className="mt-2">
                              <img src={reply.imageUrl} alt="Reply attachment" className="rounded-lg max-h-48 object-cover border border-gray-200" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Reply Input */}
                    <div className="pl-4 border-l-2 border-transparent">
                      {draftImage && (
                         <div className="relative mb-2 inline-block">
                           <img src={draftImage} alt="Reply preview" className="h-20 w-auto rounded-lg object-cover border border-gray-200" />
                            <button 
                              onClick={() => updateReplyImage(post.id, null)}
                              className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-sm hover:bg-gray-700 transition"
                            >
                              <X className="w-2 h-2" />
                            </button>
                         </div>
                      )}
                      <div className="relative">
                        <textarea
                            className="w-full p-3 pr-24 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none text-sm shadow-sm resize-none"
                            rows={2}
                            placeholder="Write a supportive reply..."
                            value={draftContent}
                            onChange={(e) => updateReplyDraft(post.id, e.target.value)}
                        />
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          <input 
                            type="file" 
                            id={`file-${post.id}`} 
                            accept="image/*" 
                            hidden 
                            onChange={(e) => handleImageSelect(e, (img) => updateReplyImage(post.id, img))}
                          />
                          <label 
                            htmlFor={`file-${post.id}`}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Attach image"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </label>
                          <button 
                            onClick={() => submitReply(post.id)}
                            disabled={!draftContent.trim() && !draftImage}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleOpenPostModal}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 bg-rose-600 text-white p-4 rounded-full shadow-2xl hover:bg-rose-700 hover:scale-110 transition-all duration-300 z-50 group shadow-rose-200/50"
        aria-label="Create new post"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default CommunityFeed;
