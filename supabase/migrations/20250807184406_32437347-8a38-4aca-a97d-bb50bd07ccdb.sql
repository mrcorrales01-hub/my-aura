-- Create therapists table for licensed mental health professionals
CREATE TABLE public.therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{"en"}',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  hourly_rate DECIMAL(10,2) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  years_experience INTEGER DEFAULT 0,
  education TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table for booking therapy sessions
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users NOT NULL,
  therapist_id UUID REFERENCES public.therapists NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_type TEXT DEFAULT 'video' CHECK (session_type IN ('video', 'audio', 'chat')),
  session_url TEXT,
  session_notes TEXT,
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  therapist_notes TEXT,
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapist reviews table
CREATE TABLE public.therapist_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users NOT NULL,
  therapist_id UUID REFERENCES public.therapists NOT NULL,
  appointment_id UUID REFERENCES public.appointments NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_reviews ENABLE ROW LEVEL SECURITY;

-- Therapist policies
CREATE POLICY "Therapists can view all therapist profiles" 
ON public.therapists 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Therapists can update their own profile" 
ON public.therapists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Therapists can insert their own profile" 
ON public.therapists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Appointment policies
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM public.therapists WHERE id = therapist_id));

CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM public.therapists WHERE id = therapist_id));

-- Review policies
CREATE POLICY "Users can view relevant reviews" 
ON public.therapist_reviews 
FOR SELECT 
USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM public.therapists WHERE id = therapist_id) OR
  is_anonymous = false
);

CREATE POLICY "Users can create their own reviews" 
ON public.therapist_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_therapists_updated_at
BEFORE UPDATE ON public.therapists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_therapists_specializations ON public.therapists USING GIN(specializations);
CREATE INDEX idx_therapists_languages ON public.therapists USING GIN(languages);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_therapist_id ON public.appointments(therapist_id);