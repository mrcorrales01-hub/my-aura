import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateContent, sanitizeInput, logSecurityEvent, checkRateLimit } from '@/utils/security';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  is_anonymous: boolean;
  display_name: string | null;
  moderation_status: string;
  like_count: number;
  comment_count: number;
  group_id: string | null;
  created_at: string;
  updated_at: string;
  user_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  display_name: string | null;
  moderation_status: string;
  like_count: number;
  created_at: string;
  user_liked?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  group_type: string;
  created_by: string;
  invite_code: string;
  max_members: number;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export const useCommunity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch posts with user likes
  const fetchPosts = async (groupId: string | null = null) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          community_likes!inner(user_id)
        `)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (groupId) {
        query = query.eq('group_id', groupId);
      } else {
        query = query.is('group_id', null);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Process posts to include user like status
      const postsWithLikes = data?.map(post => ({
        ...post,
        user_liked: post.community_likes?.some((like: any) => like.user_id === user.id) || false
      })) || [];

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's groups
  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select(`
          *,
          group_members!inner(user_id)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const groupsWithStatus = data?.map(group => ({
        ...group,
        is_member: group.group_members?.some((member: any) => member.user_id === user.id) || false,
        member_count: group.group_members?.length || 0
      })) || [];

      setGroups(groupsWithStatus);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Create a new post
  const createPost = async (content: string, postType: string = 'general', isAnonymous: boolean = true, displayName?: string, groupId?: string) => {
    if (!user) return null;
    
    // Rate limiting check
    if (!checkRateLimit('create_post', 3, 300000)) { // 3 posts per 5 minutes
      toast({
        title: "Rate Limited",
        description: "Please wait before creating another post",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      // Enhanced content validation before submission
      const validation = await validateContent(content, 'post');
      
      if (!validation.isValid) {
        toast({
          title: "Content Validation Failed",
          description: validation.issues.join(', '),
          variant: "destructive"
        });
        return null;
      }

      if (validation.crisisDetected) {
        toast({
          title: "Crisis Support Available",
          description: "We noticed you might be going through a difficult time. Please consider reaching out to our crisis support resources.",
          variant: "destructive"
        });
        // Still allow post but with enhanced monitoring
      }

      const sanitizedContent = sanitizeInput(content);

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: sanitizedContent,
          post_type: postType,
          is_anonymous: isAnonymous,
          display_name: displayName,
          group_id: groupId || null,
          moderation_status: validation.requiresReview ? 'pending' : 'approved'
        })
        .select()
        .single();

      if (error) throw error;

      // Enhanced content moderation
      const { data: moderationResult } = await supabase.rpc('enhanced_content_moderation', {
        content_text: sanitizedContent,
        content_type: 'post'
      });

      // Log post creation with security metadata
      await logSecurityEvent('community_post_created', 'low', {
        post_id: data.id,
        content_length: content.length,
        is_anonymous: isAnonymous,
        group_id: groupId,
        moderation_risk_score: (moderationResult as any)?.risk_score || 0,
        crisis_detected: validation.crisisDetected,
        requires_review: validation.requiresReview
      }, (moderationResult as any)?.risk_score || 20);

      const message = validation.requiresReview 
        ? "Your post is being reviewed and will appear shortly."
        : "Post created successfully";
      
      toast({
        title: validation.requiresReview ? "Post submitted" : "Success",
        description: message,
      });

      // Refresh posts
      if (!validation.requiresReview) {
        await fetchPosts(selectedGroupId);
      } else {
        setTimeout(() => fetchPosts(selectedGroupId), 2000);
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      
      await logSecurityEvent('community_post_creation_failed', 'medium', {
        error: error.message,
        content_length: content.length
      }, 60);
      
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    }
  };

  // Create a comment
  const createComment = async (postId: string, content: string, isAnonymous: boolean = true, displayName?: string) => {
    if (!user) return null;
    
    // Rate limiting check
    if (!checkRateLimit('create_comment', 5, 60000)) { // 5 comments per minute
      toast({
        title: "Rate Limited",
        description: "Please wait before creating another comment",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      // Enhanced content validation
      const validation = await validateContent(content, 'comment');
      
      if (!validation.isValid) {
        toast({
          title: "Content Validation Failed",
          description: validation.issues.join(', '),
          variant: "destructive"
        });
        return null;
      }

      if (validation.crisisDetected) {
        toast({
          title: "Crisis Support Available",
          description: "We noticed you might be going through a difficult time. Please consider reaching out to our crisis support resources.",
          variant: "destructive"
        });
      }

      const sanitizedContent = sanitizeInput(content);

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: sanitizedContent,
          is_anonymous: isAnonymous,
          display_name: displayName,
          moderation_status: validation.requiresReview ? 'pending' : 'approved'
        })
        .select()
        .single();

      if (error) throw error;

      // Log comment creation
      await logSecurityEvent('community_comment_created', 'low', {
        comment_id: data.id,
        post_id: postId,
        content_length: content.length,
        crisis_detected: validation.crisisDetected
      }, validation.riskScore);

      const message = validation.requiresReview 
        ? "Your comment is being reviewed and will appear shortly."
        : "Comment created successfully";

      toast({
        title: validation.requiresReview ? "Comment submitted" : "Success",
        description: message,
      });

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      
      await logSecurityEvent('community_comment_creation_failed', 'medium', {
        error: error.message,
        post_id: postId
      }, 60);
      
      toast({
        title: "Error",
        description: "Failed to create comment",
        variant: "destructive",
      });
      return null;
    }
  };

  // Toggle like on post or comment
  const toggleLike = async (itemId: string, itemType: 'post' | 'comment') => {
    if (!user) return;
    
    // Rate limiting for likes
    if (!checkRateLimit('toggle_like', 10, 60000)) { // 10 likes per minute
      toast({
        title: "Rate Limited",
        description: "Please wait before liking more content",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const column = itemType === 'post' ? 'post_id' : 'comment_id';
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq(column, itemId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);
          
        await logSecurityEvent('content_unliked', 'low', {
          item_id: itemId,
          item_type: itemType
        }, 10);
      } else {
        // Like
        await supabase
          .from('community_likes')
          .insert({
            user_id: user.id,
            [column]: itemId
          });
          
        await logSecurityEvent('content_liked', 'low', {
          item_id: itemId,
          item_type: itemType
        }, 10);
      }

      // Refresh posts to update counts
      fetchPosts(selectedGroupId);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  // Create a group
  const createGroup = async (name: string, description: string, groupType: string = 'private') => {
    if (!user) return null;
    
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('community_groups')
        .insert({
          name,
          description,
          group_type: groupType,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Group created",
        description: `${name} has been created successfully.`,
      });

      fetchGroups();
      return groupData;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
      return null;
    }
  };

  // Join group by invite code
  const joinGroup = async (inviteCode: string) => {
    if (!user) return false;
    
    try {
      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('community_groups')
        .select('id, name, max_members')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (groupError) throw new Error('Invalid invite code');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: `You're already a member of ${group.name}.`,
        });
        return false;
      }

      // Check member count
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      if (count && count >= group.max_members) {
        throw new Error('Group is at maximum capacity');
      }

      // Join group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id
        });

      if (joinError) throw joinError;

      toast({
        title: "Joined group",
        description: `Welcome to ${group.name}!`,
      });

      fetchGroups();
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join group",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          community_likes!inner(user_id)
        `)
        .eq('post_id', postId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(comment => ({
        ...comment,
        user_liked: comment.community_likes?.some((like: any) => like.user_id === user.id) || false
      })) || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts(selectedGroupId);
      fetchGroups();
    }
  }, [user, selectedGroupId]);

  return {
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
    refreshPosts: () => fetchPosts(selectedGroupId),
  };
};