import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { 
  MessageCircle,
  Heart,
  Share2,
  Flag,
  Users,
  Plus,
  Search,
  Filter,
  Shield,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  Clock,
  UserPlus,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

export const Community: React.FC = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { language } = useGlobalLanguage();
  const { toast } = useToast();
  
  const {
    posts,
    groups,
    loading,
    selectedGroupId,
    setSelectedGroupId,
    createPost,
    createComment,
    toggleLike,
    createGroup,
    joinGroup,
    fetchComments,
  } = useCommunity();
  
  const [newPost, setNewPost] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  
  // Group creation form
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'private'
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && post.moderation_status === 'approved';
  });

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    const displayName = isAnonymous ? undefined : user.email?.split('@')[0] || 'User';
    
    await createPost(
      newPost.trim(),
      'general',
      isAnonymous,
      displayName,
      selectedGroupId || undefined
    );
    
    setNewPost('');
    setNewPostTags('');
    setIsAnonymous(false);
  };

  const handleLikePost = async (postId: string) => {
    await toggleLike(postId, 'post');
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim() || !user) return;

    const displayName = user.email?.split('@')[0] || 'User';
    await createComment(postId, commentText.trim(), false, displayName);
    
    setNewComment(prev => ({ ...prev, [postId]: '' }));
    
    // Refresh comments for this post
    loadComments(postId);
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) return;
    
    const success = await createGroup(groupForm.name, groupForm.description, groupForm.type);
    if (success) {
      setShowCreateGroup(false);
      setGroupForm({ name: '', description: '', type: 'private' });
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return;
    
    const success = await joinGroup(inviteCode);
    if (success) {
      setShowJoinGroup(false);
      setInviteCode('');
    }
  };

  const loadComments = async (postId: string) => {
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    const comments = await fetchComments(postId);
    setPostComments(prev => ({ ...prev, [postId]: comments }));
    setCommentLoading(prev => ({ ...prev, [postId]: false }));
  };

  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!postComments[postId]) {
        loadComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('justNow') || 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const PostSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }: { type: 'posts' | 'groups' }) => (
    <Card className="text-center p-12">
      <div className="flex flex-col items-center gap-4">
        {type === 'posts' ? (
          <>
            <MessageCircle className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something with the community!</p>
          </>
        ) : (
          <>
            <Users className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No groups found</h3>
            <p className="text-muted-foreground">Create a group or join one with an invite code.</p>
          </>
        )}
      </div>
    </Card>
  );

  const renderPost = (post: any) => {
    const isExpanded = expandedPosts.has(post.id);
    const comments = postComments[post.id] || [];
    const isCommentLoading = commentLoading[post.id];

    return (
      <Card key={post.id} className="mb-4 hover:shadow-md transition-shadow">
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
                  onClick={() => handleLikePost(post.id)}
                  className={`${post.user_liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`} />
                  {post.like_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePostExpansion(post.id.toString())}
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
                <div className="space-y-3 mb-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {comments.map((comment: any) => (
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
                        <p className="text-sm">{comment.content}</p>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(comment.id, 'comment')}
                          className="text-xs mt-2 -ml-2"
                        >
                          <Heart className={`w-3 h-3 mr-1 ${comment.user_liked ? 'fill-current text-red-500' : ''}`} />
                          {comment.like_count || 0}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">No comments yet. Be the first to comment!</p>
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

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="text-center p-12">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Sign in to access Community</h3>
          <p className="text-muted-foreground">Join our safe, supportive community to connect with others on similar journeys.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('community') || 'Community'}</h1>
          <p className="text-muted-foreground">
            {t('connectWithOthersOnSimilarJourneys') || 'Connect with others on similar journeys'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {t('safeSpace') || 'Safe Space'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {t('multilingual') || 'Multilingual'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">{t('communityFeed') || 'Feed'}</TabsTrigger>
          <TabsTrigger value="groups">{t('groups') || 'Groups'}</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('shareYourThoughts') || 'Share your thoughts'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={t('whatOnYourMind') || 'What\'s on your mind?'}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-24 resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      {t('postAnonymously') || 'Post anonymously'}
                    </Label>
                  </div>
                  
                  <Select value={selectedGroupId || 'all'} onValueChange={(value) => setSelectedGroupId(value === 'all' ? null : value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('publicFeed') || 'Public Feed'}</SelectItem>
                      {groups.filter(g => g.is_member).map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('post') || 'Post'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCommunity') || 'Search community...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map(renderPost)
            ) : (
              <EmptyState type="posts" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('communityGroups') || 'Community Groups'}</h2>
            <div className="flex gap-2">
              <Dialog open={showJoinGroup} onOpenChange={setShowJoinGroup}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('joinGroup') || 'Join Group'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('joinGroup') || 'Join Group'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inviteCode">{t('inviteCode') || 'Invite Code'}</Label>
                      <Input
                        id="inviteCode"
                        placeholder="Enter invite code..."
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleJoinGroup} disabled={!inviteCode.trim()}>
                      {t('joinGroup') || 'Join Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createGroup') || 'Create Group'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('createGroup') || 'Create Group'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="groupName">{t('groupName') || 'Group Name'}</Label>
                      <Input
                        id="groupName"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupDescription">{t('description') || 'Description'}</Label>
                      <Textarea
                        id="groupDescription"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>{t('groupType') || 'Group Type'}</Label>
                      <Select value={groupForm.type} onValueChange={(value) => setGroupForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">{t('private') || 'Private'}</SelectItem>
                          <SelectItem value="public">{t('public') || 'Public'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateGroup} disabled={!groupForm.name.trim()}>
                      {t('createGroup') || 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : groups.length > 0 ? (
              groups.map(group => (
                <Card key={group.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{group.name}</h3>
                          {group.group_type === 'private' ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Globe className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{group.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.member_count || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(group.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {group.is_member ? (
                          <Badge variant="secondary">Member</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInviteCode(group.invite_code);
                              setShowJoinGroup(true);
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState type="groups" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};