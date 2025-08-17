-- Add new tables for advanced features

-- Wearable data table
CREATE TABLE public.wearable_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL, -- 'apple_watch', 'fitbit', 'oura', etc.
    data_type TEXT NOT NULL, -- 'heart_rate', 'sleep', 'steps', 'stress', etc.
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL, -- 'bpm', 'hours', 'steps', 'score', etc.
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voice/Face analysis data (with consent)
CREATE TABLE public.biometric_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL, -- 'voice', 'face', 'combined'
    stress_indicators JSONB DEFAULT '{}',
    emotion_data JSONB DEFAULT '{}',
    confidence_score NUMERIC DEFAULT 0,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mental health timeline data
CREATE TABLE public.mental_health_timeline (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timeline_date DATE NOT NULL,
    overall_score NUMERIC NOT NULL, -- 1-10 mental health score
    mood_average NUMERIC,
    sleep_quality NUMERIC,
    stress_level NUMERIC,
    activity_level NUMERIC,
    ai_insights JSONB DEFAULT '{}',
    wearable_contributions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crisis alerts and early warnings
CREATE TABLE public.early_warning_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'depression_risk', 'burnout_risk', 'crisis_risk'
    severity_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    contributing_factors JSONB NOT NULL DEFAULT '[]',
    ai_reasoning TEXT,
    confidence_score NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    recommended_actions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Family supporter insights
CREATE TABLE public.family_supporter_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    family_account_id UUID NOT NULL REFERENCES public.family_accounts(id) ON DELETE CASCADE,
    supported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'mood_trend', 'stress_alert', 'improvement_tip'
    content TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'acted_upon'
    priority_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warning_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_supporter_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own wearable data" 
ON public.wearable_data FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own biometric analysis" 
ON public.biometric_analysis FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own timeline" 
ON public.mental_health_timeline FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alerts" 
ON public.early_warning_alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Family members can view supporter insights" 
ON public.family_supporter_insights FOR SELECT USING (
    auth.uid() = supporter_user_id OR 
    auth.uid() = supported_user_id OR
    family_account_id IN (
        SELECT family_account_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Family supporters can create insights" 
ON public.family_supporter_insights FOR INSERT WITH CHECK (
    auth.uid() = supporter_user_id OR
    family_account_id IN (
        SELECT family_account_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- Create indexes for performance
CREATE INDEX idx_wearable_data_user_date ON public.wearable_data(user_id, recorded_at DESC);
CREATE INDEX idx_timeline_user_date ON public.mental_health_timeline(user_id, timeline_date DESC);
CREATE INDEX idx_alerts_user_status ON public.early_warning_alerts(user_id, status, created_at DESC);
CREATE INDEX idx_biometric_user_type ON public.biometric_analysis(user_id, analysis_type, created_at DESC);

-- Create triggers for timeline updates
CREATE OR REPLACE FUNCTION public.update_timeline_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timeline_updated_at
    BEFORE UPDATE ON public.mental_health_timeline
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timeline_score();

CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON public.early_warning_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();