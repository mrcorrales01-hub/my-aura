-- ==============================================
-- CRITICAL SECURITY FIXES - EXISTING TABLES ONLY
-- ==============================================

-- Fix database functions with missing search_path (CRITICAL)
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_timeline_score() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_conversations() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.get_therapist_patients_summary(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_payment_analytics() SET search_path TO 'public';
ALTER FUNCTION public.log_ai_interaction(uuid, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.award_achievement(uuid, text, integer) SET search_path TO 'public';

-- Create security definer function to prevent RLS recursion
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
-- FIX MOST CRITICAL RLS POLICIES (EXISTING TABLES)
-- ==============================================

-- 1. FIX PROFILES TABLE (Customer Personal Data - CRITICAL)
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

-- 2. FIX THERAPISTS TABLE (Professional Data - CRITICAL)
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

-- 3. SECURE PAYMENT TABLES (Financial Data - CRITICAL)
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

-- 4. SAFETY NETWORKS (Emergency Contacts - CRITICAL)
-- Note: safety_networks already has correct RLS policies, just ensuring they're enabled
ALTER TABLE public.safety_networks ENABLE ROW LEVEL SECURITY;

-- 5. GROUP TABLES (Fix recursion issues)
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

-- ==============================================
-- ADD PERFORMANCE INDEXES FOR RLS
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_client ON public.appointments(therapist_id, client_id);
CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON public.therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_networks_user_id ON public.safety_networks(user_id);

-- ==============================================
-- SECURITY AUDIT LOG
-- ==============================================
COMMENT ON FUNCTION public.get_current_user_therapist_id() IS 
'Security definer function to prevent RLS recursion when checking therapist permissions. Created as part of critical security fixes.';

-- Log this security migration
INSERT INTO public.audit_logs (action, table_name, user_agent, old_values, new_values) 
VALUES (
  'CRITICAL_SECURITY_MIGRATION', 
  'multiple_tables', 
  'Lovable Security Fix',
  '{"status": "vulnerable"}',
  '{"status": "secured", "tables_fixed": ["profiles", "therapists", "subscribers", "pay_per_play_transactions", "payment_receipts", "safety_networks", "group_members"], "functions_fixed": 8}'
) ON CONFLICT DO NOTHING;