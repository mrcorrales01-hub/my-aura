import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  UserPlus
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: CommunityComment[];
  isAnonymous: boolean;
  tags: string[];
  groupId?: string;
  language: string;
  isLiked?: boolean;
  isModerationApproved: boolean;
}

interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  isAnonymous: boolean;
  isLiked?: boolean;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  language: string;
  moderators: string[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  isMember?: boolean;
}

const samplePosts: CommunityPost[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah M.',
    userAvatar: '/avatars/sarah.jpg',
    content: 'Just wanted to share that I completed my 30-day meditation streak today! The daily exercises in this app really helped me build this habit. Feeling grateful and more centered than ever.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 24,
    comments: [
      {
        id: '1-1',
        userId: 'user2',
        userName: 'Mike T.',
        content: 'Congratulations! That\'s amazing progress. What meditation style worked best for you?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 3,
        isAnonymous: false
      }
    ],
    isAnonymous: false,
    tags: ['meditation', 'streak', 'gratitude'],
    language: 'en',
    isLiked: false,
    isModerationApproved: true
  },
  {
    id: '2',
    userId: 'anonymous',
    userName: 'Anonymous User',
    content: 'I\'ve been struggling with anxiety lately, especially in social situations. The breathing exercises from Auri have been helping, but I still feel overwhelmed sometimes. Any tips from others who\'ve been through similar experiences?',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 18,
    comments: [
      {
        id: '2-1',
        userId: 'user3',
        userName: 'Alex R.',
        content: 'I understand completely. What helped me was practicing the 4-7-8 breathing technique before social events. Also, the progressive muscle relaxation exercises in the app are great for preparation.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likes: 7,
        isAnonymous: false
      }
    ],
    isAnonymous: true,
    tags: ['anxiety', 'social', 'breathing'],
    language: 'en',
    isLiked: true,
    isModerationApproved: true
  }
];

const sampleGroups: CommunityGroup[] = [
  {
    id: '1',
    name: 'Anxiety Support Circle',
    description: 'A safe space to share experiences and coping strategies for anxiety management',
    memberCount: 1247,
    isPrivate: false,
    language: 'en',
    moderators: ['mod1', 'mod2'],
    tags: ['anxiety', 'support', 'coping'],
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isMember: true
  },
  {
    id: '2',
    name: 'Mindful Parents',
    description: 'Parenting mindfully and teaching emotional intelligence to our children',
    memberCount: 892,
    isPrivate: true,
    language: 'en',
    moderators: ['mod3'],
    tags: ['parenting', 'mindfulness', 'children'],
    createdBy: 'user2',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    isMember: false
  }
];

export const Community: React.FC = () => {
  const { t } = useTranslations();
  const { user } = useAuth();
  const { language } = useGlobalLanguage();
  
  const [posts, setPosts] = useState<CommunityPost[]>(samplePosts);
  const [groups, setGroups] = useState<CommunityGroup[]>(sampleGroups);
  const [newPost, setNewPost] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup = selectedGroup === 'all' || post.groupId === selectedGroup;
    const matchesLanguage = post.language === language;
    
    return matchesSearch && matchesGroup && matchesLanguage && post.isModerationApproved;
  });

  const handleCreatePost = () => {
    if (!newPost.trim() || !user) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      userId: isAnonymous ? 'anonymous' : user.id,
      userName: isAnonymous ? 'Anonymous User' : user.email?.split('@')[0] || 'User',
      userAvatar: isAnonymous ? undefined : user.user_metadata?.avatar_url,
      content: newPost.trim(),
      timestamp: new Date(),
      likes: 0,
      comments: [],
      isAnonymous,
      tags: newPostTags.split(',').map(tag => tag.trim()).filter(Boolean),
      language: language,
      isLiked: false,
      isModerationApproved: true // In real app, would be pending moderation
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setNewPostTags('');
    setIsAnonymous(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleAddComment = (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim() || !user) return;

    const comment: CommunityComment = {
      id: `${postId}-${Date.now()}`,
      userId: user.id,
      userName: user.email?.split('@')[0] || 'User',
      userAvatar: user.user_metadata?.avatar_url,
      content: commentText.trim(),
      timestamp: new Date(),
      likes: 0,
      isAnonymous: false,
      isLiked: false
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));

    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            memberCount: group.isMember ? group.memberCount - 1 : group.memberCount + 1,
            isMember: !group.isMember 
          }
        : group
    ));
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours.toString() });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('daysAgo', { days: diffInDays.toString() });
  };

  const renderPost = (post: CommunityPost) => (
    <Card key={post.id} className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.userAvatar} />
            <AvatarFallback>
              {post.isAnonymous ? '?' : post.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">
                {post.isAnonymous ? t('anonymousUser') : post.userName}
              </span>
              {post.isAnonymous && (
                <Badge variant="secondary" className="text-xs">
                  {t('anonymous')}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatTimeAgo(post.timestamp)}
              </span>
            </div>
            <p className="text-sm mb-3">{post.content}</p>
            
            {post.tags.length > 0 && (
              <div className="flex gap-1 mb-3">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikePost(post.id)}
                className={`text-xs ${post.isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <MessageCircle className="w-4 h-4 mr-1" />
                {post.comments.length}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Share2 className="w-4 h-4 mr-1" />
                {t('share')}
              </Button>
              <Button variant="ghost" size="sm" className="text-xs ml-auto">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="ml-13 space-y-3 mb-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>
                    {comment.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                  <p className="text-sm">{comment.content}</p>
                  <Button variant="ghost" size="sm" className="text-xs mt-1 -ml-2">
                    <Heart className="w-3 h-3 mr-1" />
                    {comment.likes}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Comment */}
        {user && (
          <div className="ml-13 flex gap-2">
            <Input
              placeholder={t('writeAComment')}
              value={newComment[post.id] || ''}
              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
              className="flex-1"
            />
            <Button onClick={() => handleAddComment(post.id)} size="sm">
              {t('post')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('community')}</h1>
          <p className="text-muted-foreground">{t('connectWithOthersOnSimilarJourneys')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {t('safeSpace')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {t('multilingual')}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">{t('communityFeed')}</TabsTrigger>
          <TabsTrigger value="groups">{t('groups')}</TabsTrigger>
          <TabsTrigger value="moderation">{t('guidelines')}</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('shareYourThoughts')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t('whatOnYourMind')}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-24"
                />
                <Input
                  placeholder={t('addTags')}
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      {t('postAnonymously')}
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="text-sm border border-input rounded px-2 py-1"
                    >
                      <option value="all">{t('publicFeed')}</option>
                      {groups.filter(g => g.isMember).map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('post')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <div className="flex gap-4">
            <Input
              placeholder={t('searchCommunity')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {t('filter')}
            </Button>
          </div>

          {/* Posts Feed */}
          <ScrollArea className="h-[600px]">
            {filteredPosts.map(renderPost)}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('communityGroups')}</h2>
            <Button onClick={() => setShowCreateGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('createGroup')}
            </Button>
          </div>

          <div className="grid gap-4">
            {groups.map(group => (
              <Card key={group.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        {group.isPrivate ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{group.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.memberCount.toLocaleString()} {t('members')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(group.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {group.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinGroup(group.id)}
                      variant={group.isMember ? "outline" : "default"}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {group.isMember ? t('leave') : t('join')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                {t('communityGuidelines')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">{t('beKindAndRespectful')}</h4>
                    <p className="text-sm text-muted-foreground">{t('treatOthersWithKindness')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">{t('shareResponsibly')}</h4>
                    <p className="text-sm text-muted-foreground">{t('sharePersonalExperiences')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">{t('noMedicalAdvice')}</h4>
                    <p className="text-sm text-muted-foreground">{t('dontProvideMedicalAdvice')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">{t('respectPrivacy')}</h4>
                    <p className="text-sm text-muted-foreground">{t('respectAnonymityChoices')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{t('reportingContent')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('reportInappropriateContent')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};