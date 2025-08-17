-- Enable therapists to access their patients' data through appointments
-- Create RLS policies for therapist access to patient data

-- Allow therapists to view conversations of their patients
CREATE POLICY "Therapists can view patient conversations" 
ON public.conversations 
FOR SELECT 
USING (
  user_id IN (
    SELECT client_id 
    FROM appointments 
    WHERE therapist_id IN (
      SELECT id 
      FROM therapists 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allow therapists to view mood entries of their patients  
CREATE POLICY "Therapists can view patient mood entries"
ON public.mood_entries
FOR SELECT  
USING (
  user_id IN (
    SELECT client_id 
    FROM appointments 
    WHERE therapist_id IN (
      SELECT id 
      FROM therapists 
      WHERE user_id = auth.uid()
    )
  )
);

-- Allow therapists to view profiles of their patients
CREATE POLICY "Therapists can view patient profiles"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT client_id 
    FROM appointments 
    WHERE therapist_id IN (
      SELECT id 
      FROM therapists 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create function to get therapist's patients summary
CREATE OR REPLACE FUNCTION public.get_therapist_patients_summary(therapist_user_id uuid)
RETURNS TABLE (
  patient_id uuid,
  patient_name text,
  appointment_count bigint,
  last_session timestamp with time zone,
  avg_mood numeric,
  total_conversations bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id as patient_id,
    p.full_name as patient_name,
    COUNT(DISTINCT a.id) as appointment_count,
    MAX(a.scheduled_at) as last_session,
    COALESCE(AVG(me.mood_value), 0) as avg_mood,
    COUNT(DISTINCT c.id) as total_conversations
  FROM profiles p
  LEFT JOIN appointments a ON p.id = a.client_id
  LEFT JOIN therapists t ON a.therapist_id = t.id
  LEFT JOIN mood_entries me ON p.id = me.user_id AND me.created_at >= NOW() - INTERVAL '30 days'
  LEFT JOIN conversations c ON p.id = c.user_id AND c.created_at >= NOW() - INTERVAL '30 days'
  WHERE t.user_id = therapist_user_id
  GROUP BY p.id, p.full_name
  ORDER BY last_session DESC NULLS LAST;
$$;