import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MoodTracker from "@/components/MoodTracker";
import Onboarding from "@/components/Onboarding";
import Auri from "@/components/Auri";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [auriMessage, setAuriMessage] = useState<string | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Redirect new users to global welcome if they haven't seen it
  useEffect(() => {
    if (!user && !localStorage.getItem('aura-global-welcome-seen')) {
      navigate('/global-welcome');
    } else if (!user && currentLanguage === 'en' && !localStorage.getItem('aura-language-selected')) {
      navigate('/welcome');
    }
  }, [user, currentLanguage, navigate]);

  useEffect(() => {
    if (user && !authLoading) {
      checkOnboardingStatus();
    } else if (!authLoading) {
      setCheckingOnboarding(false);
    }
  }, [user, authLoading]);

  // SEO for homepage
  useEffect(() => {
    document.title = 'Aura Wellness — Mental Health & Relationship Coaching';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Personalized mental wellness, mood tracking, AI coaching, and therapy tools to help you feel better every day.');
  }, []);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding:', error);
      }

      if (!data || !data.onboarding_completed) {
        setShowOnboarding(true);
      } else {
        // Show welcome back message from Auri
        setAuriMessage("Welcome back! I'm here to support your wellness journey today. How are you feeling?");
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setAuriMessage("Welcome to Aura! I'm Auri, your personal wellness companion. Let's start your journey together!");
  };

  if (authLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-wellness-glow">
          <div className="text-2xl text-wellness-primary">Loading...</div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <MoodTracker />
      <Features />
      {auriMessage && (
        <Auri 
          message={auriMessage}
          context="welcome"
          onDismiss={() => setAuriMessage(null)}
          showSettings={true}
        />
      )}
    </div>
  );
};

export default Index;
