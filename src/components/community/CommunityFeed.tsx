import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Flag, 
  Send,
  Loader2 
} from 'lucide-react';
import { CommunityPost, CommunityComment } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

interface CommunityFeedProps {
  posts: CommunityPost[];
  loading: boolean;
  onLikePost: (postId: string) => Promise<void>;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onToggleLike: (itemId: string, itemType: 'post' | 'comment') => Promise<void>;
  fetchComments: (postId: string) => Promise<CommunityComment[]>;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  loading,
  onLikePost,
  onAddComment,
  onToggleLike,
  fetchComments
}) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<Record<string, CommunityComment[]>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('justNow') || 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const loadComments = async (postId: string) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const comments = await fetchComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const togglePostExpansion = async (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!postComments[postId]) {
        await loadComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const handleLike = async (itemId: string, itemType: 'post' | 'comment') => {
    setLikeLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      await onToggleLike(itemId, itemType);
      // If it's a comment like, refresh comments
      if (itemType === 'comment') {
        const postId = Object.keys(postComments).find(pid => 
          postComments[pid].some(c => c.id === itemId)
        );
        if (postId) await loadComments(postId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content || !user) return;

    try {
      await onAddComment(postId, content);
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      // Refresh comments
      await loadComments(postId);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const PostCard: React.FC<{ post: CommunityPost }> = ({ post }) => {
    const isExpanded = expandedPosts.has(post.id);
    const comments = postComments[post.id] || [];
    const isCommentLoading = commentLoading[post.id];
    const isPostLikeLoading = likeLoading[post.id];

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {post.is_anonymous ? '?' : (post.display_name?.charAt(0) || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {post.is_anonymous ? (t('anonymousUser') || 'Anonymous') : post.display_name || 'User'}
                </span>
                {post.is_anonymous && (
                  <Badge variant="secondary" className="text-xs">
                    {t('anonymous') || 'Anonymous'}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
              
              <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id, 'post')}
                  disabled={isPostLikeLoading}
                  className={`${post.user_liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
                >
                  {isPostLikeLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                  )}
                  {post.like_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePostExpansion(post.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comment_count || 0}
                </Button>
                
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Share2 className="w-4 h-4 mr-1" />
                  {t('share') || 'Share'}
                </Button>
                
                <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          {isExpanded && (
            <div className="mt-6">
              <Separator className="mb-4" />
              
              {/* Comments List */}
              {isCommentLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {comment.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.display_name || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{comment.content}</p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(comment.id, 'comment')}
                          disabled={likeLoading[comment.id]}
                          className="text-xs -ml-2"
                        >
                          {likeLoading[comment.id] ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Heart className={`w-3 h-3 mr-1 ${comment.user_liked ? 'fill-current text-red-500' : ''}`} />
                          )}
                          {comment.like_count || 0}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
              
              {/* Add Comment */}
              {user && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder={t('writeAComment') || 'Write a comment...'}
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleAddComment(post.id)} 
                      size="sm"
                      disabled={!newComment[post.id]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="flex gap-4 mt-4">
                    <div className="h-8 bg-muted rounded w-16" />
                    <div className="h-8 bg-muted rounded w-16" />
                    <div className="h-8 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center p-12">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          Be the first to share something with the community!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};