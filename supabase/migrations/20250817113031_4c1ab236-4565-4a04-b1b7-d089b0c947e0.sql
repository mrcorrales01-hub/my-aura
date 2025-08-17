-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general',
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  moderation_flags JSONB DEFAULT '[]'::jsonb,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  moderation_flags JSONB DEFAULT '[]'::jsonb,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community likes table
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Create community groups table
CREATE TABLE public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT NOT NULL DEFAULT 'private',
  created_by UUID NOT NULL,
  invite_code TEXT UNIQUE,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Users can view approved public posts"
ON public.community_posts
FOR SELECT
USING (
  (moderation_status = 'approved') AND 
  (group_id IS NULL OR group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users can create their own posts"
ON public.community_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for community_comments
CREATE POLICY "Users can view approved comments on visible posts"
ON public.community_comments
FOR SELECT
USING (
  (moderation_status = 'approved') AND 
  post_id IN (
    SELECT id FROM public.community_posts 
    WHERE moderation_status = 'approved' AND 
    (group_id IS NULL OR group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can create their own comments"
ON public.community_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.community_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for community_likes
CREATE POLICY "Users can view likes on visible content"
ON public.community_likes
FOR SELECT
USING (
  (post_id IN (
    SELECT id FROM public.community_posts 
    WHERE moderation_status = 'approved' AND 
    (group_id IS NULL OR group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    ))
  )) OR
  (comment_id IN (
    SELECT id FROM public.community_comments 
    WHERE moderation_status = 'approved'
  ))
);

CREATE POLICY "Users can manage their own likes"
ON public.community_likes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community_groups
CREATE POLICY "Users can view their groups"
ON public.community_groups
FOR SELECT
USING (
  created_by = auth.uid() OR 
  id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create groups"
ON public.community_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
ON public.community_groups
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
ON public.community_groups
FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group memberships"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid() OR 
  group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and group creators can manage memberships"
ON public.group_members
FOR DELETE
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT created_by FROM public.community_groups WHERE id = group_id)
);

-- Create triggers for updating counts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_comments 
    SET like_count = like_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_post_like_count
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL OR OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_comment_like_count
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW
  WHEN (NEW.comment_id IS NOT NULL OR OLD.comment_id IS NOT NULL)
  EXECUTE FUNCTION update_comment_like_count();

CREATE TRIGGER trigger_update_post_comment_count
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- Create updated_at triggers
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate random invite codes for groups
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Set default invite code for new groups
ALTER TABLE public.community_groups 
ALTER COLUMN invite_code SET DEFAULT generate_invite_code();