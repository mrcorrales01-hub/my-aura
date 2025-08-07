-- Phase 3: Backend & Security Fixes (Idempotent, final)

-- Performance indexes (safe)
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_scheduled ON appointments(therapist_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_client_scheduled ON appointments(client_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Triggers for updated_at (safe creation)
DO $$ BEGIN
  CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Audit logs (table + RLS)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit_logs (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Only admins can view audit logs'
  ) THEN
    EXECUTE 'CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (false)';
  END IF;
END $$;

-- Storage buckets (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('therapy-files', 'therapy-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Profile images are publicly viewable'
  ) THEN
    EXECUTE 'CREATE POLICY "Profile images are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = ''profile-images'')';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own profile image'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their own profile image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''profile-images'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own profile image'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own profile image" ON storage.objects FOR UPDATE USING (bucket_id = ''profile-images'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can view their therapy files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their therapy files" ON storage.objects FOR SELECT USING (bucket_id = ''therapy-files'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their therapy files'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can upload their therapy files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''therapy-files'' AND auth.uid()::text = (storage.foldername(name))[1])';
  END IF;
END $$;