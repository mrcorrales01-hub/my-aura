-- Create doctor visit preparation tables
CREATE TABLE public.visit_preps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  concerns TEXT,
  top_questions TEXT[] DEFAULT '{}',
  sbar JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  intensity INT CHECK (intensity BETWEEN 0 AND 10),
  tags TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.visit_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.visit_preps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_actions ENABLE ROW LEVEL SECURITY;

-- Create owner-only policies
CREATE POLICY visit_preps_owner ON public.visit_preps
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY symptom_logs_owner ON public.symptom_logs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY visit_actions_owner ON public.visit_actions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());