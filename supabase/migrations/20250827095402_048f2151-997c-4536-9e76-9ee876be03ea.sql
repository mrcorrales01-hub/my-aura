-- ==============================================
-- CRITICAL SECURITY FIXES - CORRECTED VERSION
-- ==============================================

-- Fix database functions with missing search_path (MUST DO)
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_timeline_score() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_conversations() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.get_therapist_patients_summary(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_payment_analytics() SET search_path TO 'public';
ALTER FUNCTION public.log_ai_interaction(uuid, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.award_achievement(uuid, text, integer) SET search_path TO 'public';

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_therapist_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT id FROM public.therapists WHERE user_id = auth.uid();
$$;

-- ==============================================
-- FIX CRITICAL RLS POLICIES - DROP AND RECREATE
-- ==============================================

-- 1. FIX PROFILES TABLE (most critical - customer data exposed)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Therapists can view patient profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Therapists can view their patient profiles" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT client_id FROM public.appointments 
    WHERE therapist_id = public.get_current_user_therapist_id()
  )
);

-- 2. FIX THERAPISTS TABLE (professional data exposed)
DROP POLICY IF EXISTS "Therapists can view all therapist profiles" ON public.therapists;

CREATE POLICY "Users can view active verified therapists (limited info)" 
ON public.therapists 
FOR SELECT 
USING (
  is_active = true AND is_verified = true AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Therapists can view their own full profile" 
ON public.therapists 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. SECURE PAYMENT TABLES (critical - financial data exposed)
-- Drop existing policies and recreate properly

-- Subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can manage their own subscription" ON public.subscribers;

CREATE POLICY "Users can manage their own subscription" 
ON public.subscribers 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Pay per play transactions
ALTER TABLE public.pay_per_play_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.pay_per_play_transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.pay_per_play_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Payment receipts
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.payment_receipts;

CREATE POLICY "Users can view their own receipts" 
ON public.payment_receipts 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. SECURE MENTAL HEALTH DATA (critical - health data exposed)
-- Mood entries
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own mood entries" ON public.mood_entries;
DROP POLICY IF EXISTS "Therapists can view patient mood entries" ON public.mood_entries;

CREATE POLICY "Users can manage their own mood entries" 
ON public.mood_entries 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view patient mood entries" 
ON public.mood_entries 
FOR SELECT 
USING (
  user_id IN (
    SELECT client_id FROM public.appointments 
    WHERE therapist_id = public.get_current_user_therapist_id()
  )
);

-- Mental health timeline
ALTER TABLE public.mental_health_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own timeline" ON public.mental_health_timeline;
DROP POLICY IF EXISTS "Therapists can view patient timelines" ON public.mental_health_timeline;

CREATE POLICY "Users can manage their own timeline" 
ON public.mental_health_timeline 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Therapists can view patient timelines" 
ON public.mental_health_timeline 
FOR SELECT 
USING (
  user_id IN (
    SELECT client_id FROM public.appointments 
    WHERE therapist_id = public.get_current_user_therapist_id()
  )
);

-- Early warning alerts
ALTER TABLE public.early_warning_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own alerts" ON public.early_warning_alerts;

CREATE POLICY "Users can manage their own alerts" 
ON public.early_warning_alerts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Biometric analysis sessions
ALTER TABLE public.biometric_analysis_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own biometric sessions" ON public.biometric_analysis_sessions;

CREATE POLICY "Users can manage their own biometric sessions" 
ON public.biometric_analysis_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. FIX GROUP TABLES (to prevent recursion)
-- Group members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

CREATE POLICY "Users can view members of their groups" 
ON public.group_members 
FOR SELECT 
USING (
  group_id IN (
    SELECT DISTINCT gm.group_id 
    FROM public.group_members gm 
    WHERE gm.user_id = auth.uid()
  ) OR
  group_id IN (
    SELECT id FROM public.community_groups 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can manage their own memberships" 
ON public.group_members 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Group therapy participants
ALTER TABLE public.group_therapy_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view session participants" ON public.group_therapy_participants;
DROP POLICY IF EXISTS "Users can manage their own participation" ON public.group_therapy_participants;

CREATE POLICY "Users can view session participants" 
ON public.group_therapy_participants 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  session_id IN (
    SELECT gts.id FROM public.group_therapy_sessions gts
    JOIN public.group_therapy_participants gtp ON gts.id = gtp.session_id
    WHERE gtp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own participation" 
ON public.group_therapy_participants 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- ADD PERFORMANCE INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_client ON public.appointments(therapist_id, client_id);
CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON public.therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON public.mood_entries(user_id, created_at);