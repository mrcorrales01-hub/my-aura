import React, { useState, useEffect } from 'react';
import { CommunityComment, useCommunity } from '@/hooks/useCommunity';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Heart, User, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface CommentSectionProps {
  postId: string;
  onComment: (postId: string) => Promise<CommunityComment[]>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onComment }) => {
  const { user } = useAuth();
  const { createComment, toggleLike } = useCommunity();
  
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await onComment(postId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, commentText.trim(), isAnonymous, displayName.trim() || undefined);
      setCommentText('');
      setDisplayName('');
      setShowCommentForm(false);
      // Refresh comments after a delay to allow moderation
      setTimeout(loadComments, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    await toggleLike(commentId, 'comment');
    loadComments(); // Refresh to update like counts
  };

  if (loading) {
    return (
      <div className="border-t pt-4">
        <div className="animate-pulse space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4 space-y-4">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const displayName = comment.is_anonymous 
              ? (comment.display_name || 'Anonymous') 
              : 'Community Member';

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{displayName}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center gap-1 text-xs h-6 px-2 hover:text-red-500 ${
                      comment.user_liked ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                  >
                    <Heart 
                      className={`h-3 w-3 ${comment.user_liked ? 'fill-current' : ''}`}
                    />
                    <span>{comment.like_count}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showCommentForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCommentForm(true)}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Add a supportive comment
        </Button>
      ) : (
        <form onSubmit={handleSubmitComment} className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <Textarea
            placeholder="Share your support, advice, or encouragement..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            className="resize-none bg-background"
            required
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="comment-anonymous" className="text-sm">
                  Comment anonymously
                </Label>
              </div>
              <Switch
                id="comment-anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            {isAnonymous && (
              <div>
                <Input
                  placeholder="Display name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-background"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCommentForm(false);
                setCommentText('');
                setDisplayName('');
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              size="sm"
              disabled={!commentText.trim() || isSubmitting}
              className="flex items-center gap-2"
            >
              <Send className="h-3 w-3" />
              {isSubmitting ? 'Sending...' : 'Comment'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};