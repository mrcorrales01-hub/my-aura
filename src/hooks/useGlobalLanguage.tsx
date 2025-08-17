import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  currency: string;
  emergencyNumber: string;
  timezone: string;
}

interface GlobalLanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  rtl: boolean;
  currency: string;
  emergencyNumber: string;
  timezone: string;
  availableLanguages: Language[];
}

const globalLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false, currency: 'USD', emergencyNumber: '911', timezone: 'America/New_York' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Madrid' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Paris' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Berlin' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Rome' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Lisbon' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Amsterdam' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false, currency: 'SEK', emergencyNumber: '112', timezone: 'Europe/Stockholm' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false, currency: 'NOK', emergencyNumber: '112', timezone: 'Europe/Oslo' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false, currency: 'DKK', emergencyNumber: '112', timezone: 'Europe/Copenhagen' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Helsinki' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false, currency: 'PLN', emergencyNumber: '112', timezone: 'Europe/Warsaw' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false, currency: 'RUB', emergencyNumber: '112', timezone: 'Europe/Moscow' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false, currency: 'JPY', emergencyNumber: '110', timezone: 'Asia/Tokyo' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false, currency: 'KRW', emergencyNumber: '112', timezone: 'Asia/Seoul' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false, currency: 'CNY', emergencyNumber: '120', timezone: 'Asia/Shanghai' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, currency: 'SAR', emergencyNumber: '999', timezone: 'Asia/Riyadh' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false, currency: 'INR', emergencyNumber: '112', timezone: 'Asia/Kolkata' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false, currency: 'BDT', emergencyNumber: '999', timezone: 'Asia/Dhaka' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false, currency: 'TRY', emergencyNumber: '112', timezone: 'Europe/Istanbul' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false, currency: 'IDR', emergencyNumber: '112', timezone: 'Asia/Jakarta' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false, currency: 'THB', emergencyNumber: '191', timezone: 'Asia/Bangkok' }
];

const GlobalLanguageContext = createContext<GlobalLanguageContextType | undefined>(undefined);

export const useGlobalLanguage = () => {
  const context = useContext(GlobalLanguageContext);
  if (!context) {
    throw new Error('useGlobalLanguage must be used within a GlobalLanguageProvider');
  }
  return context;
};

// Comprehensive translations for My Aura platform
const globalTranslations: Record<string, Record<string, string>> = {
  en: {
    // Navigation & General
    'nav.home': 'Home',
    'nav.chat': 'AI Coach',
    'nav.plan': 'My Plan',
    'nav.mood': 'Mood Tracker',
    'nav.quests': 'Daily Quests',
    'nav.roleplay': 'Practice',
    'nav.crisis': 'Crisis Support',
    'nav.community': 'Community',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Authentication
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone',
    'auth.welcome': 'Welcome to My Aura',
    'auth.welcomeBack': 'Welcome back!',
    'auth.createAccount': 'Create Account',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.or': 'Or continue with',
    'auth.terms': 'By continuing, you agree to our Terms of Service and Privacy Policy',
    
    // Home & Dashboard
    'home.welcome': 'Welcome back!',
    'home.subtitle': 'How can I support you today?',
    'home.moodCheck': 'Quick Mood Check',
    'home.chatAuri': 'Chat with Auri',
    'home.aiCoach': 'Your AI wellness coach is here 24/7',
    'home.moodTracker': 'Track your emotional patterns',
    'home.dailyQuests': 'Complete wellness micro-tasks',
    'home.myPlan': 'Goals, habits & life balance',
    'home.getStarted': 'Get Started',
    'home.startConversation': 'Start Conversation',
    'home.crisisSupport': 'Need immediate support?',
    'home.crisisDesc': 'Crisis resources and human support available 24/7',
    'home.getHelp': 'Get Help Now',
    
    // Mood Tracker
    'mood.title': 'Mood Tracker',
    'mood.howFeeling': 'How are you feeling right now?',
    'mood.intensity': 'Intensity Level',
    'mood.notes': 'Notes (optional)',
    'mood.notesPlaceholder': 'What\'s influencing how you feel today? Any specific triggers or positive moments?',
    'mood.logMood': 'Log My Mood',
    'mood.biometrics': 'Today\'s Biometrics',
    'mood.heartRate': 'Heart Rate',
    'mood.sleep': 'Sleep',
    'mood.stress': 'Stress',
    'mood.energy': 'Energy',
    'mood.recentEntries': 'Recent Mood Entries',
    
    // Moods
    'mood.happy': 'Happy',
    'mood.calm': 'Calm',
    'mood.anxious': 'Anxious',
    'mood.sad': 'Sad',
    'mood.stressed': 'Stressed',
    'mood.tired': 'Tired',
    'mood.angry': 'Angry',
    'mood.confused': 'Confused',
    
    // Daily Quests
    'quests.title': 'Daily Micro-Quests',
    'quests.pointsToday': 'Points Today',
    'quests.streak': 'Day Streak',
    'quests.level': 'Level',
    'quests.completed': 'Completed',
    'quests.complete': 'Complete',
    'quests.achievements': 'Achievements',
    'quests.progress': 'Progress',
    
    // My Plan
    'plan.title': 'My Wellness Plan',
    'plan.subtitle': 'Personalized goals, habits, and life balance tracking',
    'plan.overallWellness': 'Overall Wellness',
    'plan.goals': 'Goals',
    'plan.habits': 'Habits',
    'plan.lifeBalance': 'Life Balance',
    'plan.mentalHealth': 'Mental Health Goals',
    'plan.addGoal': 'Add Goal',
    'plan.addHabit': 'Add Habit',
    'plan.streak': 'day streak',
    'plan.insights': 'Insights & Recommendations',
    
    // Crisis Support
    'crisis.title': 'Crisis Support',
    'crisis.subtitle': 'Select the level of support you need right now',
    'crisis.green': 'Talk Casually',
    'crisis.greenDesc': 'I need someone to talk to about daily stress, work, or life challenges',
    'crisis.yellow': 'Professional Support',
    'crisis.yellowDesc': 'I\'m struggling with anxiety, depression, or need professional guidance',
    'crisis.red': 'Emergency Help',
    'crisis.redDesc': 'I\'m having thoughts of self-harm or suicide, or I\'m in immediate danger',
    'crisis.immediate': 'Need Help Right Now?',
    'crisis.immediateDesc': 'If you\'re in immediate danger or having thoughts of self-harm',
    'crisis.call911': 'Call 911 (Emergency)',
    'crisis.call988': 'Call 988 (Crisis Line)',
    'crisis.support247': '24/7 Support Available',
    'crisis.supportDesc': 'Professional counselors ready to help anytime',
    'crisis.startChat': 'Start Crisis Chat',
    'crisis.videoSupport': 'Video Support',
    'crisis.international': 'International Crisis Support',
    'crisis.notAlone': 'Remember: You Are Not Alone',
    
    // Roleplay
    'roleplay.title': 'Roleplay Simulator',
    'roleplay.subtitle': 'Practice real-life situations in a safe environment',
    'roleplay.difficulty.beginner': 'Beginner',
    'roleplay.difficulty.intermediate': 'Intermediate',
    'roleplay.difficulty.advanced': 'Advanced',
    'roleplay.endSession': 'End Session',
    'roleplay.sessionComplete': 'Session Complete!',
    'roleplay.newSession': 'Start New Session',
    'roleplay.tips': 'Tips for',
    
    // AI Chat
    'chat.title': 'Auri - Your AI Wellness Coach',
    'chat.subtitle': 'Here to listen and support you',
    'chat.thinking': 'Auri is thinking...',
    'chat.placeholder': 'Share what\'s on your mind... Auri is here to listen',
    'chat.disclaimer': 'Auri provides supportive guidance but is not a substitute for professional therapy.',
    
    // Subscription & Pricing
    'pricing.free': 'Free',
    'pricing.premium': 'Premium',
    'pricing.monthly': 'Monthly',
    'pricing.yearly': 'Yearly',
    'pricing.subscribe': 'Subscribe',
    'pricing.currentPlan': 'Current Plan',
    'pricing.upgrade': 'Upgrade',
    'pricing.manage': 'Manage Subscription',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.continue': 'Continue',
    'common.finish': 'Finish',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info'
  },
  
  es: {
    // Navigation & General
    'nav.home': 'Inicio',
    'nav.chat': 'Coach IA',
    'nav.plan': 'Mi Plan',
    'nav.mood': 'Estado de Ánimo',
    'nav.quests': 'Misiones Diarias',
    'nav.roleplay': 'Práctica',
    'nav.crisis': 'Apoyo de Crisis',
    'nav.community': 'Comunidad',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    
    // Authentication
    'auth.signin': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.signout': 'Cerrar Sesión',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.fullName': 'Nombre Completo',
    'auth.phone': 'Teléfono',
    'auth.welcome': 'Bienvenido a My Aura',
    'auth.welcomeBack': '¡Bienvenido de vuelta!',
    'auth.createAccount': 'Crear Cuenta',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.or': 'O continúa con',
    'auth.terms': 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad',
    
    // Home & Dashboard
    'home.welcome': '¡Bienvenido de vuelta!',
    'home.subtitle': '¿Cómo puedo apoyarte hoy?',
    'home.moodCheck': 'Chequeo Rápido de Ánimo',
    'home.chatAuri': 'Habla con Auri',
    'home.aiCoach': 'Tu coach de bienestar IA está aquí 24/7',
    'home.moodTracker': 'Rastrea tus patrones emocionales',
    'home.dailyQuests': 'Completa micro-tareas de bienestar',
    'home.myPlan': 'Objetivos, hábitos y equilibrio de vida',
    'home.getStarted': 'Comenzar',
    'home.startConversation': 'Iniciar Conversación',
    'home.crisisSupport': '¿Necesitas apoyo inmediato?',
    'home.crisisDesc': 'Recursos de crisis y apoyo humano disponibles 24/7',
    'home.getHelp': 'Obtener Ayuda Ahora',
    
    // Mood Tracker
    'mood.title': 'Rastreador de Estado de Ánimo',
    'mood.howFeeling': '¿Cómo te sientes ahora mismo?',
    'mood.intensity': 'Nivel de Intensidad',
    'mood.notes': 'Notas (opcional)',
    'mood.notesPlaceholder': '¿Qué está influyendo en cómo te sientes hoy? ¿Algún desencadenante específico o momentos positivos?',
    'mood.logMood': 'Registrar Mi Estado de Ánimo',
    'mood.biometrics': 'Biometría de Hoy',
    'mood.heartRate': 'Ritmo Cardíaco',
    'mood.sleep': 'Sueño',
    'mood.stress': 'Estrés',
    'mood.energy': 'Energía',
    'mood.recentEntries': 'Entradas Recientes de Estado de Ánimo',
    
    // Moods
    'mood.happy': 'Feliz',
    'mood.calm': 'Tranquilo',
    'mood.anxious': 'Ansioso',
    'mood.sad': 'Triste',
    'mood.stressed': 'Estresado',
    'mood.tired': 'Cansado',
    'mood.angry': 'Enojado',
    'mood.confused': 'Confundido',
    
    // Crisis Support
    'crisis.title': 'Apoyo de Crisis',
    'crisis.subtitle': 'Selecciona el nivel de apoyo que necesitas ahora mismo',
    'crisis.green': 'Hablar Casualmente',
    'crisis.greenDesc': 'Necesito hablar con alguien sobre estrés diario, trabajo o desafíos de la vida',
    'crisis.yellow': 'Apoyo Profesional',
    'crisis.yellowDesc': 'Estoy luchando con ansiedad, depresión, o necesito orientación profesional',
    'crisis.red': 'Ayuda de Emergencia',
    'crisis.redDesc': 'Tengo pensamientos de autolesión o suicidio, o estoy en peligro inmediato',
    'crisis.notAlone': 'Recuerda: No Estás Solo',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.continue': 'Continuar',
    'common.finish': 'Finalizar',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información'
  },
  
  fr: {
    // Navigation & General  
    'nav.home': 'Accueil',
    'nav.chat': 'Coach IA',
    'nav.plan': 'Mon Plan',
    'nav.mood': 'Humeur',
    'nav.quests': 'Quêtes Quotidiennes',
    'nav.roleplay': 'Pratique',
    'nav.crisis': 'Soutien de Crise',
    'nav.community': 'Communauté',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    
    // Authentication
    'auth.signin': 'Se Connecter',
    'auth.signup': 'S\'inscrire',
    'auth.signout': 'Se Déconnecter',
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.fullName': 'Nom Complet',
    'auth.phone': 'Téléphone',
    'auth.welcome': 'Bienvenue sur My Aura',
    'auth.welcomeBack': 'Bon retour !',
    'auth.createAccount': 'Créer un Compte',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.or': 'Ou continuer avec',
    'auth.terms': 'En continuant, vous acceptez nos Conditions d\'Utilisation et Politique de Confidentialité',
    
    // Home & Dashboard
    'home.welcome': 'Bon retour !',
    'home.subtitle': 'Comment puis-je vous soutenir aujourd\'hui ?',
    'home.moodCheck': 'Vérification Rapide de l\'Humeur',
    'home.chatAuri': 'Parler avec Auri',
    'home.aiCoach': 'Votre coach de bien-être IA est là 24h/24 et 7j/7',
    'home.moodTracker': 'Suivez vos schémas émotionnels',
    'home.dailyQuests': 'Complétez des micro-tâches de bien-être',
    'home.myPlan': 'Objectifs, habitudes et équilibre de vie',
    'home.getStarted': 'Commencer',
    'home.startConversation': 'Démarrer la Conversation',
    'home.crisisSupport': 'Besoin d\'un soutien immédiat ?',
    'home.crisisDesc': 'Ressources de crise et soutien humain disponibles 24h/24 et 7j/7',
    'home.getHelp': 'Obtenir de l\'Aide Maintenant',
    
    // Crisis Support
    'crisis.title': 'Soutien de Crise',
    'crisis.subtitle': 'Sélectionnez le niveau de soutien dont vous avez besoin maintenant',
    'crisis.green': 'Parler Décontracté',
    'crisis.greenDesc': 'J\'ai besoin de parler à quelqu\'un du stress quotidien, du travail ou des défis de la vie',
    'crisis.yellow': 'Soutien Professionnel',
    'crisis.yellowDesc': 'Je lutte contre l\'anxiété, la dépression, ou j\'ai besoin de conseils professionnels',
    'crisis.red': 'Aide d\'Urgence',
    'crisis.redDesc': 'J\'ai des pensées d\'auto-mutilation ou de suicide, ou je suis en danger immédiat',
    'crisis.notAlone': 'Rappelez-vous : Vous N\'êtes Pas Seul',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.continue': 'Continuer',
    'common.finish': 'Terminer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Info'
  }
  
  // Add more languages as needed...
};

interface GlobalLanguageProviderProps {
  children: ReactNode;
}

export const GlobalLanguageProvider: React.FC<GlobalLanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Load language from localStorage or detect from browser
    const savedLanguage = localStorage.getItem('aura-language');
    if (savedLanguage && globalLanguages.find(lang => lang.code === savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      const supportedLanguage = globalLanguages.find(lang => lang.code === browserLanguage);
      if (supportedLanguage) {
        setLanguageState(browserLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('aura-language', lang);
    
    // Update document direction for RTL languages
    const selectedLanguage = globalLanguages.find(l => l.code === lang);
    if (selectedLanguage) {
      document.documentElement.dir = selectedLanguage.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const translations = globalTranslations[language] || globalTranslations.en;
    let translation = translations[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  const currentLanguage = globalLanguages.find(lang => lang.code === language) || globalLanguages[0];

  const value: GlobalLanguageContextType = {
    language,
    setLanguage,
    t,
    rtl: currentLanguage.rtl,
    currency: currentLanguage.currency,
    emergencyNumber: currentLanguage.emergencyNumber,
    timezone: currentLanguage.timezone,
    availableLanguages: globalLanguages,
  };

  return (
    <GlobalLanguageContext.Provider value={value}>
      {children}
    </GlobalLanguageContext.Provider>
  );
};