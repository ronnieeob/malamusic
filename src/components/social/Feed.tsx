import React, { useState, useEffect } from 'react';
import { Post } from '../../types/social';
import { SocialService } from '../../services/api/socialService';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { useSocialActions } from '../../hooks/useSocialActions';

export function Feed() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const { posts, likePost, addComment, loading, error } = useSocialActions();
  const socialService = new SocialService();

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const handlePost = async () => {
    if (!user || !newPost.trim()) return;
    try {
      await socialService.createPost(user.id, newPost, 'general');
      setNewPost('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* Create Post */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20">
            <div className="flex items-start space-x-4">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-zinc-700 border border-red-900/20 rounded-lg p-3 min-h-[100px] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim() || loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4 mt-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20">
                <div className="flex items-start space-x-4">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{post.userName}</h3>
                      <span className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    
                    <div className="flex items-center space-x-6 mt-4">
                      <button 
                        onClick={() => likePost(post.id)}
                        className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 bg-zinc-900/50 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm">{comment.userName}</h4>
                                <span className="text-xs text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <UserSearch />
        </div>
      </div>
    </div>
  );
}