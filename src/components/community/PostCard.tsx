import React, { useState } from 'react';
import { CommunityPost } from '@/hooks/useCommunity';
import { CommentSection } from './CommentSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, User, Clock, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onComment: (postId: string) => Promise<any[]>;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = post.is_anonymous 
    ? (post.display_name || 'Anonymous') 
    : 'Community Member';

  const postTypeColors = {
    general: 'default',
    struggle: 'destructive',
    win: 'secondary',
    question: 'outline',
  } as const;

  const postTypeLabels = {
    general: 'General',
    struggle: 'Seeking Support',
    win: 'Celebrating',
    question: 'Question',
  };

  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">{displayName}</span>
                <Badge 
                  variant={postTypeColors[post.post_type as keyof typeof postTypeColors] || 'default'}
                  className="text-xs"
                >
                  {postTypeLabels[post.post_type as keyof typeof postTypeLabels] || post.post_type}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
              
              {user?.id === post.user_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit Post</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground">
                {displayContent}
              </p>
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0 h-auto text-primary"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={`flex items-center gap-2 hover:text-red-500 ${
                  post.user_liked ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart 
                  className={`h-4 w-4 ${post.user_liked ? 'fill-current' : ''}`}
                />
                <span>{post.like_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comment_count}</span>
              </Button>
            </div>

            {showComments && (
              <CommentSection
                postId={post.id}
                onComment={onComment}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};