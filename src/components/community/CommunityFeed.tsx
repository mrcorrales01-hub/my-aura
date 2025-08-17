import React, { useState } from 'react';
import { useCommunity } from '@/hooks/useCommunity';
import { PostCard } from './PostCard';
import { CreatePostForm } from './CreatePostForm';
import { GroupSelector } from './GroupSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, MessageCircle, Heart } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const CommunityFeed: React.FC = () => {
  const {
    posts,
    groups,
    loading,
    selectedGroupId,
    setSelectedGroupId,
    createPost,
    toggleLike,
    fetchComments,
  } = useCommunity();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  const handlePostSubmit = async (content: string, postType: string, isAnonymous: boolean, displayName?: string) => {
    const success = await createPost(content, postType, isAnonymous, displayName, selectedGroupId);
    if (success) {
      setShowCreatePost(false);
    }
  };

  const currentGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Support
            </CardTitle>
            <Button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Community Feed
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                My Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <GroupSelector
                groups={groups}
                selectedGroupId={selectedGroupId}
                onGroupChange={setSelectedGroupId}
              />

              {currentGroup && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-primary">{currentGroup.name}</h3>
                  {currentGroup.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentGroup.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {currentGroup.member_count} members
                    </span>
                    <span className="capitalize">{currentGroup.group_type} group</span>
                  </div>
                </div>
              )}

              {showCreatePost && (
                <CreatePostForm
                  onSubmit={handlePostSubmit}
                  onCancel={() => setShowCreatePost(false)}
                  groupContext={currentGroup?.name}
                />
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {currentGroup ? `No posts in ${currentGroup.name} yet` : 'No community posts yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share your story, ask for support, or celebrate a win!
                  </p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    Share Your First Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => toggleLike(post.id, 'post')}
                      onComment={fetchComments}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <GroupSelector
                groups={groups}
                selectedGroupId={selectedGroupId}
                onGroupChange={setSelectedGroupId}
                showCreateGroup
              />

              <div className="grid gap-4">
                {groups.filter(g => g.is_member).map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{group.name}</h3>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {group.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.member_count} members
                            </span>
                            <span className="capitalize">{group.group_type} group</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGroupId(group.id);
                            setActiveTab('feed');
                          }}
                        >
                          View Posts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {groups.filter(g => g.is_member).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                    <p className="text-muted-foreground">
                      Join or create a group to connect with others in a more intimate setting.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};