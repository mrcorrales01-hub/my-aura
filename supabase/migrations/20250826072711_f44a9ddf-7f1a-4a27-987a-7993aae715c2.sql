-- Ensure group_members table exists with proper structure
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members
FOR SELECT USING (
  group_id IN (
    SELECT id FROM public.community_groups 
    WHERE created_by = auth.uid() OR id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave groups" ON public.group_members
FOR DELETE USING (auth.uid() = user_id);

-- Update community_posts RLS policies to allow group access
DROP POLICY IF EXISTS "Users can view approved posts on visible posts" ON public.community_posts;
CREATE POLICY "Users can view approved posts" ON public.community_posts
FOR SELECT USING (
  moderation_status = 'approved' AND (
    group_id IS NULL OR 
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_moderation ON public.community_posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_comment_id ON public.community_likes(comment_id);