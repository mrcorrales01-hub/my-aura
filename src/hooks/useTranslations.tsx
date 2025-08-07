import { useLanguage } from './useLanguage';

// Translation keys that need to be added to useLanguage
export const missingTranslations = {
  en: {
    // Hero section
    'hero.mentalHealth': 'Mental Health',
    'hero.emotionalBalance': 'Emotional Balance', 
    'hero.relationshipCoaching': 'Relationship Coaching',
    'hero.learnMore': 'Learn More',
    
    // Home page
    'home.subtitle': 'Your personal wellness companion',
    'home.getStarted': 'Get Started',
    'home.description': 'Join thousands who are transforming their mental health and relationships with personalized AI guidance.',
    
    // Features
    'features.title': 'Everything you need for',
    'features.titleHighlight': 'holistic wellness',
    'features.subtitle': 'Comprehensive tools designed to support your mental health journey',
    'features.moodTracking': 'Mood Tracking',
    'features.moodTrackingDesc': 'Track your emotional patterns and identify trends',
    'features.aiCoaching': 'AI Coaching',
    'features.aiCoachingDesc': 'Get personalized guidance from our wellness AI',
    'features.relationships': 'Relationships',
    'features.relationshipsDesc': 'Build stronger, healthier connections',
    'features.design': 'Beautiful Design',
    'features.designDesc': 'Intuitive interface that promotes calm',
    'features.multilingual': 'Global Support',
    'features.multilingualDesc': 'Available in multiple languages worldwide',
    'features.security': 'Privacy First',
    'features.securityDesc': 'Your data is secure and confidential',
    'features.learnMore': 'Learn More',
    'features.exploreAll': 'Explore All Features'
  }
};

export const useTranslations = () => {
  const { t } = useLanguage();
  
  // Enhanced translation function with fallbacks
  const translate = (key: string, params?: Record<string, string>) => {
    const translated = t(key, params);
    
    // If translation returns the key (meaning it wasn't found), try fallback
    if (translated === key && missingTranslations.en[key as keyof typeof missingTranslations.en]) {
      return missingTranslations.en[key as keyof typeof missingTranslations.en];
    }
    
    return translated;
  };
  
  return { t: translate };
};