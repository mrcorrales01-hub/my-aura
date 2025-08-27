-- ==============================================
-- CRITICAL SECURITY FIXES - PHASE 1
-- ==============================================

-- Fix database functions with missing search_path
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
-- SECURE PAYMENT AND SUBSCRIPTION DATA
-- ==============================================

-- Secure subscribers table (Critical: Payment Data Exposure)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscribers' AND policyname = 'Users can manage their own subscription'
  ) THEN
    ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their own subscription" 
    ON public.subscribers 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Secure pay_per_play_transactions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pay_per_play_transactions' AND policyname = 'Users can view their own transactions'
  ) THEN
    ALTER TABLE public.pay_per_play_transactions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own transactions" 
    ON public.pay_per_play_transactions 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Secure payment_receipts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payment_receipts' AND policyname = 'Users can view their own receipts'
  ) THEN
    ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own receipts" 
    ON public.payment_receipts 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================
-- SECURE THERAPIST DATA
-- ==============================================

-- Fix therapists table policies
DROP POLICY IF EXISTS "Therapists can view all therapist profiles" ON public.therapists;

-- Create restricted therapist viewing policy
CREATE POLICY "Users can view active verified therapists (basic info only)" 
ON public.therapists 
FOR SELECT 
USING (
  is_active = true AND 
  is_verified = true AND 
  auth.role() = 'authenticated'
);

-- Allow therapists to see their own full profile
CREATE POLICY "Therapists can view their own full profile" 
ON public.therapists 
FOR SELECT 
USING (auth.uid() = user_id);

-- ==============================================  
-- SECURE MENTAL HEALTH DATA
-- ==============================================

-- Secure mental_health_timeline table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mental_health_timeline' AND policyname = 'Users can manage their own timeline'
  ) THEN
    ALTER TABLE public.mental_health_timeline ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their own timeline" 
    ON public.mental_health_timeline 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Secure early_warning_alerts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'early_warning_alerts' AND policyname = 'Users can manage their own alerts'
  ) THEN
    ALTER TABLE public.early_warning_alerts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their own alerts" 
    ON public.early_warning_alerts 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Secure biometric_analysis_sessions table  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'biometric_analysis_sessions' AND policyname = 'Users can manage their own biometric sessions'
  ) THEN
    ALTER TABLE public.biometric_analysis_sessions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their own biometric sessions" 
    ON public.biometric_analysis_sessions 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ==============================================
-- CREATE PERFORMANCE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_appointments_therapist_client ON public.appointments(therapist_id, client_id);
CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON public.therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_mental_health_timeline_user ON public.mental_health_timeline(user_id);

-- ==============================================
-- ADD DOCUMENTATION
-- ==============================================

COMMENT ON POLICY "Users can view active verified therapists (basic info only)" ON public.therapists IS 
'Allow authenticated users to see basic therapist info for booking. Sensitive data like license numbers should be filtered in application layer.';

COMMENT ON FUNCTION public.get_current_user_therapist_id() IS 
'Security definer function to prevent RLS recursion when checking therapist permissions.';