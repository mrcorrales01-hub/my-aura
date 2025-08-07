import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Language = 'en' | 'es' | 'zh' | 'sv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  { code: 'sv' as const, name: 'Svenska', flag: '🇸🇪' }
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    'nav.mood': 'Mood Check-in',
    'nav.coach': 'AI Coach',
    'nav.roleplay': 'Roleplay',
    'nav.resources': 'Resources',
    'nav.settings': 'Settings',
    'nav.pricing': 'Pricing',
    'nav.logout': 'Logout',
    'nav.welcome': 'Welcome',
    'nav.language': 'Language',
    'nav.theme': 'Theme',
    'nav.light': 'Light',
    'nav.dark': 'Dark',
    'nav.system': 'System',
    
    // Index page
    'index.welcome': 'Welcome to your wellness journey',
    'index.subtitle': 'Your personal space for mental health and emotional well-being',
    'index.moodToday': 'How are you feeling today?',
    'index.currentMood': 'Current mood',
    'index.continueJourney': 'Continue your journey',
    'index.aiCoach': 'Talk to AI Coach',
    'index.aiCoachDesc': 'Get personalized support and guidance',
    'index.practiceRoleplay': 'Practice Conversations',
    'index.practiceRoleplayDesc': 'Improve your communication skills',
    'index.exploreResources': 'Explore Resources',
    'index.exploreResourcesDesc': 'Self-help tools and exercises',
    'index.emergencySupport': 'Emergency Support',
    'index.emergencySupportDesc': 'Crisis support and helplines',
    'index.quickStats': 'Your Progress',
    'index.totalSessions': 'Total Sessions',
    'index.weekStreak': 'Week Streak',
    'index.completedExercises': 'Completed Exercises',
    
    // Common actions
    'common.getStarted': 'Get Started',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.tryAgain': 'Try Again',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Onboarding
    'onboarding.welcome': 'Welcome to Your Wellness Journey',
    'onboarding.subtitle': 'Let\'s personalize your experience',
    'onboarding.step1Title': 'Choose Your AI Coach Tone',
    'onboarding.step1Subtitle': 'How would you like your AI coach to communicate with you?',
    'onboarding.step2Title': 'Set Your Intention',
    'onboarding.step2Subtitle': 'What brings you here today?',
    'onboarding.step3Title': 'You\'re All Set!',
    'onboarding.step3Subtitle': 'Your personalized wellness experience is ready',
    'onboarding.complete': 'Complete Setup',
    'onboarding.tones.supportive': 'Supportive',
    'onboarding.tones.supportiveDesc': 'Warm, encouraging, and empathetic',
    'onboarding.tones.direct': 'Direct',
    'onboarding.tones.directDesc': 'Clear, straightforward, and solution-focused',
    'onboarding.tones.gentle': 'Gentle',
    'onboarding.tones.gentleDesc': 'Soft, calming, and nurturing',
    'onboarding.intentions.stress': 'Manage stress and anxiety',
    'onboarding.intentions.relationships': 'Improve relationships',
    'onboarding.intentions.selfcare': 'Develop better self-care habits',
    'onboarding.intentions.communication': 'Enhance communication skills',
    'onboarding.intentions.general': 'General emotional wellness',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.aiTone': 'AI Coach Tone',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.support': 'Support',
    'settings.about': 'About',
    'settings.logout': 'Logout',
    'settings.deleteAccount': 'Delete Account',
    'settings.saveChanges': 'Save Changes',
    'settings.changesSaved': 'Changes saved successfully',
    
    // Authentication
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.createAccount': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signUpWithGoogle': 'Sign up with Google',
    'auth.passwordRequirements': 'Password must be at least 8 characters',
    'auth.passwordsDoNotMatch': 'Passwords do not match',
    'auth.invalidEmail': 'Please enter a valid email address',
    'auth.signInSuccess': 'Signed in successfully',
    'auth.signUpSuccess': 'Account created successfully',
    'auth.signOutSuccess': 'Signed out successfully',
    'auth.resetEmailSent': 'Password reset email sent',
    
    // Mood tracking
    'mood.title': 'How are you feeling?',
    'mood.subtitle': 'Take a moment to check in with yourself',
    'mood.great': 'Great',
    'mood.greatDesc': 'Feeling wonderful and energetic!',
    'mood.good': 'Good',
    'mood.goodDesc': 'Generally positive and content',
    'mood.okay': 'Okay',
    'mood.okayDesc': 'Neutral, neither good nor bad',
    'mood.low': 'Low',
    'mood.lowDesc': 'A bit down, but that\'s okay',
    'mood.difficult': 'Difficult',
    'mood.difficultDesc': 'A challenging day, need extra care',
    'mood.supportMessage': 'We\'re here for you',
    'mood.saveMood': 'Save my feeling',
    'mood.viewHistory': 'View my history',
    'mood.dailyTip': 'Daily check-ins help you understand your emotional patterns better',
    'mood.alreadyRecorded': 'You\'ve already recorded your mood today!',
    
    // Coach page
    'coach.title': 'Your Personal',
    'coach.aiCoach': 'AI Coach',
    'coach.subtitle': 'Get personalized guidance and support for your emotional and relationship health',
    'coach.chatTitle': 'Chat with Aura',
    'coach.chatDescription': 'Your compassionate AI wellness companion',
    'coach.placeholder': 'Share what\'s on your mind...',
    'coach.welcomeMessage': 'Hi! I\'m here to support you. What would you like to talk about today?',
    'coach.specializations': 'Specializations',
    'coach.emotional': 'Emotional Health',
    'coach.emotionalDesc': 'Manage stress, anxiety, and emotions',
    'coach.relationships': 'Relationships',
    'coach.relationshipsDesc': 'Improve communication and intimacy',
    'coach.communication': 'Communication',
    'coach.communicationDesc': 'Learn to express your needs clearly',
    'coach.mindfulness': 'Mindfulness',
    'coach.mindfulnessDesc': 'Develop awareness and presence',
    
    // Resources
    'resources.title': 'Self-Help Resources',
    'resources.subtitle': 'Practical tools and exercises for your wellbeing',
    'resources.search': 'Search by topic, technique or feelings...',
    'resources.all': 'All',
    'resources.backToResources': '← Back to resources',
    'resources.content': 'Content',
    'resources.markComplete': 'Mark as complete',
    'resources.saveForLater': 'Save for later',
    'resources.readMore': 'Read more →',
    'resources.noResourcesFound': 'No resources found',
    'resources.noResourcesDesc': 'Try searching for other terms or select a different category.',
    'resources.anxiety': 'Anxiety',
    'resources.selfesteem': 'Self-esteem',
    'resources.communication': 'Communication',
    'resources.trust': 'Trust',
    'resources.conflict': 'Conflicts',
    'resources.practicalExercise': 'Practical exercise',
    
    // Resource content
    'resources.breathing.title': 'Breathing Technique for Anxiety',
    'resources.breathing.desc': 'Learn 4-7-8 breathing that calms the nervous system in just 2 minutes',
    'resources.breathing.content': 'Deep breathing exercise that helps calm anxiety. Breathe in for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3-4 times for immediate relief.',
    'resources.boundaries.title': 'Setting Boundaries Without Guilt',
    'resources.boundaries.desc': 'Practical phrases for saying no in a friendly but firm way',
    'resources.boundaries.content': 'Learning to set boundaries is crucial for healthy relationships. Start with simple phrases like "I need to think about it" or "That doesn\'t work for me right now". Remember, saying no to one thing means saying yes to something else.',
    'resources.gratitude.title': 'Self-esteem Exercise: Gratitude Journal',
    'resources.gratitude.desc': 'A simple daily exercise to build your self-esteem step by step',
    'resources.gratitude.content': 'Write down three things you\'re grateful for each day. This helps shift your focus to the positive and strengthens your self-worth. Include one thing about yourself that you appreciate.',
    'resources.conflict.title': 'Managing Arguments Constructively',
    'resources.conflict.desc': 'Techniques to transform conflicts into opportunities for closeness',
    'resources.conflict.content': 'Conflicts are normal in relationships. The key is to listen actively, use "I" statements instead of "you" accusations, and focus on solutions rather than blame. Take breaks when emotions run high.',
    'resources.trust.title': 'Rebuilding Trust After Betrayal',
    'resources.trust.desc': 'Step-by-step guide to repair damaged trust in relationships',
    'resources.trust.content': 'Trust can be rebuilt with patience and consistent actions. It requires transparency, accountability, and time for healing. Both parties must be committed to the process and professional help may be beneficial.',
    'resources.listening.title': 'Active Listening',
    'resources.listening.desc': 'Learn to listen in a way that makes others feel heard and understood',
    'resources.listening.content': 'Active listening involves more than just hearing words. It means being fully present, asking clarifying questions, reflecting what you heard, and showing empathy through body language and responses.',
    
    // Emergency
    emergency: {
      title: "Emergency Support",
      subtitle: "If you're in crisis, these resources can help immediately",
      crisisTitle: "Immediate Help Needed?",
      crisisDesc: "If you or someone you know is in immediate danger, don't hesitate to call emergency services.",
      callEmergency: "Call 112",
      callHealthcare: "Call 1177",
      aiSupportTitle: "Immediate AI Support",
      aiSupportDesc: "Need someone to talk to right now? Our AI coach can provide immediate support and calming techniques.",
      aiSupportButton: "Start talking with AI coach",
      aiSupportClose: "Close AI support",
      breathingTitle: "Breathing Exercise for Anxiety",
      breathingDesc: "When you feel overwhelmed, this simple breathing exercise can help you regain control:",
      professionalTitle: "Professional Help",
      onlineResourcesTitle: "More resources online",
      onlineResourcesDesc: "Visit 1177.se for more information about mental health and where you can get help in your region.",
      bottomTitle: "You are valuable",
      bottomDesc: "No matter what you're going through right now, remember that you deserve love, support and to feel good. It's okay to ask for help - it shows strength, not weakness.",
      contacts: {
        healthcare: {
          name: "1177 Healthcare Guide",
          description: "Healthcare advice around the clock",
          available: "24/7"
        },
        suicide: {
          name: "Mind Suicide Line",
          description: "For those with suicidal thoughts",
          available: "Weekdays 12-24, Weekends 16-24"
        },
        women: {
          name: "Women's Shelter",
          description: "Support for women who have been victims of violence",
          available: "24/7"
        },
        men: {
          name: "Men's Shelter",
          description: "Support for men in crisis",
          available: "Weekdays 18-22"
        },
        youth: {
          name: "BRIS",
          description: "For children and young people up to 25 years",
          available: "24/7"
        }
      },
      breathingSteps: [
        "Sit comfortably with your feet on the floor",
        "Place one hand on your chest, one on your stomach",
        "Breathe in slowly through your nose for 4 seconds",
        "Hold your breath for 4 seconds",
        "Breathe out through your mouth for 6 seconds",
        "Repeat until you feel calmer"
      ],
      aiMessages: [
        "I notice you need extra support right now. It was brave of you to seek help.",
        "Your feelings are important and valid. You deserve to feel good.",
        "Remember to breathe deeply. In through the nose, hold for 4 seconds, out through the mouth.",
        "You are not alone in this. There are people who care about you.",
        "This feeling will pass. You have gotten through difficult times before."
      ]
    },
    
    // Auri translations
    auri: {
      personalities: {
        soothing: {
          name: "Soothing",
          description: "Calm and nurturing presence",
          welcomeMessages: [
            "Take a deep breath. I'm here to support you today.",
            "Welcome back. How can I help you feel more at peace?",
            "You're doing great by taking care of yourself. What's on your mind?"
          ]
        },
        encouraging: {
          name: "Encouraging", 
          description: "Motivating and uplifting spirit",
          welcomeMessages: [
            "You've got this! I believe in your strength and resilience.",
            "Every step forward is progress. What would you like to work on today?",
            "Your journey matters, and I'm here to cheer you on!"
          ]
        },
        wise: {
          name: "Wise",
          description: "Thoughtful and insightful guidance", 
          welcomeMessages: [
            "Sometimes the answers we seek are already within us. Let's explore together.",
            "Wisdom comes from understanding ourselves. What would you like to discover?",
            "Every experience teaches us something valuable. What's been on your heart lately?"
          ]
        },
        playful: {
          name: "Playful",
          description: "Light-hearted and fun companion",
          welcomeMessages: [
            "Hey there! Ready to add some lightness to your day?",
            "Life's too short not to find joy in small moments. What's making you smile today?",
            "I'm here to remind you that it's okay to have fun while growing!"
          ]
        }
      },
      contextMessages: {
        mood: [
          "I noticed you're checking in with your feelings. That's wonderful self-awareness!",
          "How you feel matters. Thank you for taking time to tune into yourself.",
          "Your emotional check-ins are building healthy habits. Keep it up!"
        ],
        relationship: [
          "Relationships take work and love. You're investing in something beautiful.",
          "Every conversation is a chance to deepen connection. You're doing great!",
          "The fact that you care about your relationships shows your heart."
        ],
        emergency: [
          "You're being so brave by reaching out when things feel overwhelming.",
          "Remember, asking for help is a sign of strength, not weakness.",
          "You don't have to face difficult moments alone. I'm here with you."
        ],
        welcome: [
          "Welcome to your safe space. I'm honored to be part of your wellness journey.",
          "This is your time for self-care and growth. I'm here to support you every step.",
          "You've created something beautiful by prioritizing your well-being."
        ]
      },
      settings: {
        title: "Auri Settings",
        enable: "Enable Auri", 
        disable: "Disable Auri",
        toneLabel: "Companion Tone",
        description: "Customize how your AI companion communicates with you"
      }
    },
    
    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Unlock your full potential with premium features',
    'pricing.free': 'Free',
    'pricing.premium': 'Premium', 
    'pricing.freePrice': '$0/month',
    'pricing.premiumPrice': '$9.99/month',
    'pricing.getStarted': 'Get Started',
    'pricing.upgrade': 'Upgrade Now',
    'pricing.currentPlan': 'Current Plan',
    'pricing.freeFeatures': [
      'Basic mood tracking',
      'Limited AI coach sessions',
      'Basic resources access',
      'Community support'
    ],
    'pricing.premiumFeatures': [
      'Unlimited mood tracking with insights',
      'Unlimited AI coach conversations',
      'Full resources library access',
      'Advanced roleplay scenarios',
      'Priority support',
      'Progress analytics'
    ],
    
    // Roleplay
    'roleplay.title': 'Practice Conversations',
    'roleplay.subtitle': 'Safe space to practice difficult conversations and build confidence',
    'roleplay.scenarios': 'Scenarios',
    'roleplay.customScenario': 'Create Custom Scenario',
    'roleplay.startPractice': 'Start Practice',
    'roleplay.difficulty': 'Difficulty',
    'roleplay.easy': 'Easy',
    'roleplay.medium': 'Medium', 
    'roleplay.hard': 'Hard',
    'roleplay.workplace': 'Workplace',
    'roleplay.personal': 'Personal',
    'roleplay.family': 'Family',
    'roleplay.romantic': 'Romantic'
  },

  es: {
    // Navigation
    'nav.mood': 'Estado de Ánimo',
    'nav.coach': 'Coach IA',
    'nav.roleplay': 'Simulación',
    'nav.resources': 'Recursos',
    'nav.settings': 'Configuración',
    'nav.pricing': 'Precios',
    'nav.logout': 'Cerrar Sesión',
    'nav.welcome': 'Bienvenido',
    'nav.language': 'Idioma',
    'nav.theme': 'Tema',
    'nav.light': 'Claro',
    'nav.dark': 'Oscuro',
    'nav.system': 'Sistema',
    
    // Index page
    'index.welcome': 'Bienvenido a tu viaje de bienestar',
    'index.subtitle': 'Tu espacio personal para la salud mental y el bienestar emocional',
    'index.moodToday': '¿Cómo te sientes hoy?',
    'index.currentMood': 'Estado de ánimo actual',
    'index.continueJourney': 'Continúa tu viaje',
    'index.aiCoach': 'Hablar con Coach IA',
    'index.aiCoachDesc': 'Obtén apoyo y orientación personalizados',
    'index.practiceRoleplay': 'Practicar Conversaciones',
    'index.practiceRoleplayDesc': 'Mejora tus habilidades de comunicación',
    'index.exploreResources': 'Explorar Recursos',
    'index.exploreResourcesDesc': 'Herramientas de autoayuda y ejercicios',
    'index.emergencySupport': 'Apoyo de Emergencia',
    'index.emergencySupportDesc': 'Apoyo en crisis y líneas de ayuda',
    'index.quickStats': 'Tu Progreso',
    'index.totalSessions': 'Sesiones Totales',
    'index.weekStreak': 'Racha Semanal',
    'index.completedExercises': 'Ejercicios Completados',
    
    // Common actions
    'common.getStarted': 'Comenzar',
    'common.continue': 'Continuar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.tryAgain': 'Intentar de Nuevo',
    'common.yes': 'Sí',
    'common.no': 'No',
    
    // Onboarding
    'onboarding.welcome': 'Bienvenido a Tu Viaje de Bienestar',
    'onboarding.subtitle': 'Personalicemos tu experiencia',
    'onboarding.step1Title': 'Elige el Tono de Tu Coach IA',
    'onboarding.step1Subtitle': '¿Cómo te gustaría que tu coach IA se comunique contigo?',
    'onboarding.step2Title': 'Define Tu Intención',
    'onboarding.step2Subtitle': '¿Qué te trae aquí hoy?',
    'onboarding.step3Title': '¡Todo Listo!',
    'onboarding.step3Subtitle': 'Tu experiencia personalizada de bienestar está lista',
    'onboarding.complete': 'Completar Configuración',
    'onboarding.tones.supportive': 'Solidario',
    'onboarding.tones.supportiveDesc': 'Cálido, alentador y empático',
    'onboarding.tones.direct': 'Directo',
    'onboarding.tones.directDesc': 'Claro, directo y enfocado en soluciones',
    'onboarding.tones.gentle': 'Gentil',
    'onboarding.tones.gentleDesc': 'Suave, calmante y nutritivo',
    'onboarding.intentions.stress': 'Manejar estrés y ansiedad',
    'onboarding.intentions.relationships': 'Mejorar relaciones',
    'onboarding.intentions.selfcare': 'Desarrollar mejores hábitos de autocuidado',
    'onboarding.intentions.communication': 'Mejorar habilidades de comunicación',
    'onboarding.intentions.general': 'Bienestar emocional general',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.account': 'Cuenta',
    'settings.preferences': 'Preferencias',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.aiTone': 'Tono del Coach IA',
    'settings.notifications': 'Notificaciones',
    'settings.privacy': 'Privacidad',
    'settings.support': 'Soporte',
    'settings.about': 'Acerca de',
    'settings.logout': 'Cerrar Sesión',
    'settings.deleteAccount': 'Eliminar Cuenta',
    'settings.saveChanges': 'Guardar Cambios',
    'settings.changesSaved': 'Cambios guardados exitosamente',
    
    // Authentication
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.resetPassword': 'Restablecer Contraseña',
    'auth.createAccount': 'Crear Cuenta',
    'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'auth.dontHaveAccount': '¿No tienes una cuenta?',
    'auth.signInWithGoogle': 'Iniciar sesión con Google',
    'auth.signUpWithGoogle': 'Registrarse con Google',
    'auth.passwordRequirements': 'La contraseña debe tener al menos 8 caracteres',
    'auth.passwordsDoNotMatch': 'Las contraseñas no coinciden',
    'auth.invalidEmail': 'Por favor ingresa un correo válido',
    'auth.signInSuccess': 'Sesión iniciada exitosamente',
    'auth.signUpSuccess': 'Cuenta creada exitosamente',
    'auth.signOutSuccess': 'Sesión cerrada exitosamente',
    'auth.resetEmailSent': 'Correo de restablecimiento enviado',
    
    // Mood tracking
    'mood.title': '¿Cómo te sientes?',
    'mood.subtitle': 'Tómate un momento para conectar contigo mismo',
    'mood.great': 'Excelente',
    'mood.greatDesc': '¡Sintiéndome maravilloso y lleno de energía!',
    'mood.good': 'Bien',
    'mood.goodDesc': 'Generalmente positivo y contento',
    'mood.okay': 'Regular',
    'mood.okayDesc': 'Neutral, ni bien ni mal',
    'mood.low': 'Bajo',
    'mood.lowDesc': 'Un poco decaído, pero está bien',
    'mood.difficult': 'Difícil',
    'mood.difficultDesc': 'Un día desafiante, necesito cuidado extra',
    'mood.supportMessage': 'Estamos aquí para ti',
    'mood.saveMood': 'Guardar mi sentimiento',
    'mood.viewHistory': 'Ver mi historial',
    'mood.dailyTip': 'Los registros diarios te ayudan a entender mejor tus patrones emocionales',
    'mood.alreadyRecorded': '¡Ya registraste tu estado de ánimo hoy!',
    
    // Coach page
    'coach.title': 'Tu',
    'coach.aiCoach': 'Coach IA Personal',
    'coach.subtitle': 'Obtén orientación y apoyo personalizado para tu salud emocional y relacional',
    'coach.chatTitle': 'Chatea con Aura',
    'coach.chatDescription': 'Tu compañero IA compasivo de bienestar',
    'coach.placeholder': 'Comparte lo que tienes en mente...',
    'coach.welcomeMessage': '¡Hola! Estoy aquí para apoyarte. ¿De qué te gustaría hablar hoy?',
    'coach.specializations': 'Especializaciones',
    'coach.emotional': 'Salud Emocional',
    'coach.emotionalDesc': 'Manejar estrés, ansiedad y emociones',
    'coach.relationships': 'Relaciones',
    'coach.relationshipsDesc': 'Mejorar comunicación e intimidad',
    'coach.communication': 'Comunicación',
    'coach.communicationDesc': 'Aprende a expresar tus necesidades claramente',
    'coach.mindfulness': 'Atención Plena',
    'coach.mindfulnessDesc': 'Desarrollar conciencia y presencia',
    
    // Resources
    'resources.title': 'Recursos de Autoayuda',
    'resources.subtitle': 'Herramientas prácticas y ejercicios para tu bienestar',
    'resources.search': 'Buscar por tema, técnica o sentimientos...',
    'resources.all': 'Todos',
    'resources.backToResources': '← Volver a recursos',
    'resources.content': 'Contenido',
    'resources.markComplete': 'Marcar como completado',
    'resources.saveForLater': 'Guardar para después',
    'resources.readMore': 'Leer más →',
    'resources.noResourcesFound': 'No se encontraron recursos',
    'resources.noResourcesDesc': 'Intenta buscar otros términos o selecciona una categoría diferente.',
    'resources.anxiety': 'Ansiedad',
    'resources.selfesteem': 'Autoestima',
    'resources.communication': 'Comunicación',
    'resources.trust': 'Confianza',
    'resources.conflict': 'Conflictos',
    'resources.practicalExercise': 'Ejercicio práctico',
    
    // Resource content
    'resources.breathing.title': 'Técnica de Respiración para la Ansiedad',
    'resources.breathing.desc': 'Aprende la respiración 4-7-8 que calma el sistema nervioso en solo 2 minutos',
    'resources.breathing.content': 'Ejercicio de respiración profunda que ayuda a calmar la ansiedad. Inhala por 4 segundos, mantén por 7 segundos, exhala por 8 segundos. Repite 3-4 veces para alivio inmediato.',
    'resources.boundaries.title': 'Establecer Límites Sin Culpa',
    'resources.boundaries.desc': 'Frases prácticas para decir no de manera amigable pero firme',
    'resources.boundaries.content': 'Aprender a establecer límites es crucial para relaciones saludables. Comienza con frases simples como "Necesito pensarlo" o "Eso no me funciona ahora mismo". Recuerda, decir no a una cosa significa decir sí a otra.',
    'resources.gratitude.title': 'Ejercicio de Autoestima: Diario de Gratitud',
    'resources.gratitude.desc': 'Un ejercicio diario simple para construir tu autoestima paso a paso',
    'resources.gratitude.content': 'Escribe tres cosas por las que estés agradecido cada día. Esto ayuda a cambiar tu enfoque hacia lo positivo y fortalece tu autoestima. Incluye algo sobre ti mismo que aprecias.',
    'resources.conflict.title': 'Manejar Discusiones Constructivamente',
    'resources.conflict.desc': 'Técnicas para transformar conflictos en oportunidades de cercanía',
    'resources.conflict.content': 'Los conflictos son normales en las relaciones. La clave es escuchar activamente, usar declaraciones "yo" en lugar de acusaciones "tú", y enfocarse en soluciones en lugar de culpas. Toma descansos cuando las emociones estén altas.',
    'resources.trust.title': 'Reconstruir la Confianza Después de una Traición',
    'resources.trust.desc': 'Guía paso a paso para reparar la confianza dañada en las relaciones',
    'resources.trust.content': 'La confianza puede reconstruirse con paciencia y acciones consistentes. Requiere transparencia, responsabilidad y tiempo para sanar. Ambas partes deben estar comprometidas con el proceso y la ayuda profesional puede ser beneficiosa.',
    'resources.listening.title': 'Escucha Activa',
    'resources.listening.desc': 'Aprende a escuchar de una manera que haga que otros se sientan escuchados y comprendidos',
    'resources.listening.content': 'La escucha activa involucra más que solo escuchar palabras. Significa estar completamente presente, hacer preguntas aclaradoras, reflejar lo que escuchaste, y mostrar empatía a través del lenguaje corporal y respuestas.',
    
    // Emergency
    emergency: {
      title: "Soporte de Emergencia",
      subtitle: "Si estás en crisis, estos recursos pueden ayudarte de inmediato",
      crisisTitle: "¿Necesitas Ayuda Inmediata?",
      crisisDesc: "Si tú o alguien que conoces está en peligro inmediato, no dudes en llamar a los servicios de emergencia.",
      callEmergency: "Llamar al 112",
      callHealthcare: "Llamar al 061",
      aiSupportTitle: "Soporte de IA Inmediato",
      aiSupportDesc: "¿Necesitas hablar con alguien ahora mismo? Nuestro coach de IA puede brindarte apoyo inmediato y técnicas calmantes.",
      aiSupportButton: "Comenzar a hablar con el coach de IA",
      aiSupportClose: "Cerrar soporte de IA",
      breathingTitle: "Ejercicio de Respiración para la Ansiedad",
      breathingDesc: "Cuando te sientas abrumado, este simple ejercicio de respiración puede ayudarte a recuperar el control:",
      professionalTitle: "Ayuda Profesional",
      onlineResourcesTitle: "Más recursos en línea",
      onlineResourcesDesc: "Visita sanidad.gob.es para más información sobre salud mental y dónde puedes obtener ayuda en tu región.",
      bottomTitle: "Eres valioso",
      bottomDesc: "Sin importar por lo que estés pasando ahora, recuerda que mereces amor, apoyo y sentirte bien. Está bien pedir ayuda - muestra fortaleza, no debilidad.",
      contacts: {
        healthcare: {
          name: "061 Emergencias Sanitarias",
          description: "Asistencia sanitaria las 24 horas",
          available: "24/7"
        },
        suicide: {
          name: "Teléfono de la Esperanza",
          description: "Para personas con pensamientos suicidas",
          available: "24/7"
        },
        women: {
          name: "016 Violencia de Género",
          description: "Apoyo para mujeres víctimas de violencia",
          available: "24/7"
        },
        men: {
          name: "Teléfono del Hombre",
          description: "Apoyo para hombres en crisis",
          available: "Lunes a Viernes 10-14, 16-22"
        },
        youth: {
          name: "ANAR",
          description: "Para niños y adolescentes",
          available: "24/7"
        }
      },
      breathingSteps: [
        "Siéntate cómodamente con los pies en el suelo",
        "Pon una mano en el pecho, otra en el estómago",
        "Respira lentamente por la nariz durante 4 segundos",
        "Mantén la respiración durante 4 segundos",
        "Exhala por la boca durante 6 segundos",
        "Repite hasta que te sientas más tranquilo"
      ],
      aiMessages: [
        "Noto que necesitas apoyo extra ahora mismo. Fue valiente de tu parte buscar ayuda.",
        "Tus sentimientos son importantes y válidos. Mereces sentirte bien.",
        "Recuerda respirar profundamente. Entra por la nariz, mantén 4 segundos, sal por la boca.",
        "No estás solo en esto. Hay personas que se preocupan por ti.",
        "Este sentimiento pasará. Has superado momentos difíciles antes."
      ]
    },
    
    // Auri translations
    auri: {
      personalities: {
        soothing: {
          name: "Tranquilizador",
          description: "Presencia calmada y nutritiva",
          welcomeMessages: [
            "Respira profundo. Estoy aquí para apoyarte hoy.",
            "Bienvenido de vuelta. ¿Cómo puedo ayudarte a sentirte más en paz?",
            "Lo estás haciendo genial cuidándote. ¿Qué tienes en mente?"
          ]
        },
        encouraging: {
          name: "Alentador",
          description: "Espíritu motivador y edificante",
          welcomeMessages: [
            "¡Tú puedes! Creo en tu fuerza y resistencia.",
            "Cada paso adelante es progreso. ¿En qué te gustaría trabajar hoy?",
            "Tu viaje importa, ¡y estoy aquí para apoyarte!"
          ]
        },
        wise: {
          name: "Sabio",
          description: "Guía reflexiva y perspicaz",
          welcomeMessages: [
            "A veces las respuestas que buscamos ya están dentro de nosotros. Exploremos juntos.",
            "La sabiduría viene de entendernos a nosotros mismos. ¿Qué te gustaría descubrir?",
            "Cada experiencia nos enseña algo valioso. ¿Qué ha estado en tu corazón últimamente?"
          ]
        },
        playful: {
          name: "Juguetón",
          description: "Compañero alegre y divertido",
          welcomeMessages: [
            "¡Hola! ¿Listo para añadir algo de alegría a tu día?",
            "La vida es muy corta para no encontrar gozo en los pequeños momentos. ¿Qué te hace sonreír hoy?",
            "¡Estoy aquí para recordarte que está bien divertirse mientras crecemos!"
          ]
        }
      },
      contextMessages: {
        mood: [
          "Noté que estás registrando tus sentimientos. ¡Esa es una maravillosa autoconciencia!",
          "Cómo te sientes importa. Gracias por tomarte tiempo para sintonizar contigo mismo.",
          "Tus registros emocionales están construyendo hábitos saludables. ¡Sigue así!"
        ],
        relationship: [
          "Las relaciones requieren trabajo y amor. Estás invirtiendo en algo hermoso.",
          "Cada conversación es una oportunidad para profundizar la conexión. ¡Lo estás haciendo genial!",
          "El hecho de que te preocupes por tus relaciones muestra tu corazón."
        ],
        emergency: [
          "Estás siendo muy valiente al pedir ayuda cuando las cosas se sienten abrumadoras.",
          "Recuerda, pedir ayuda es una señal de fuerza, no de debilidad.",
          "No tienes que enfrentar momentos difíciles solo. Estoy aquí contigo."
        ],
        welcome: [
          "Bienvenido a tu espacio seguro. Es un honor ser parte de tu viaje de bienestar.",
          "Este es tu tiempo para el autocuidado y crecimiento. Estoy aquí para apoyarte en cada paso.",
          "Has creado algo hermoso al priorizar tu bienestar."
        ]
      },
      settings: {
        title: "Configuración de Auri",
        enable: "Habilitar Auri",
        disable: "Deshabilitar Auri",
        toneLabel: "Tono del Compañero",
        description: "Personaliza cómo tu compañero IA se comunica contigo"
      }
    },
    
    // Pricing
    'pricing.title': 'Elige Tu Plan',
    'pricing.subtitle': 'Desbloquea tu potencial completo con características premium',
    'pricing.free': 'Gratis',
    'pricing.premium': 'Premium',
    'pricing.freePrice': '$0/mes',
    'pricing.premiumPrice': '$9.99/mes',
    'pricing.getStarted': 'Comenzar',
    'pricing.upgrade': 'Actualizar Ahora',
    'pricing.currentPlan': 'Plan Actual',
    'pricing.freeFeatures': [
      'Seguimiento básico del estado de ánimo',
      'Sesiones limitadas con coach IA',
      'Acceso básico a recursos',
      'Soporte de la comunidad'
    ],
    'pricing.premiumFeatures': [
      'Seguimiento ilimitado del estado de ánimo con insights',
      'Conversaciones ilimitadas con coach IA',
      'Acceso completo a la biblioteca de recursos',
      'Escenarios avanzados de roleplay',
      'Soporte prioritario',
      'Análisis de progreso'
    ],
    
    // Roleplay
    'roleplay.title': 'Practicar Conversaciones',
    'roleplay.subtitle': 'Espacio seguro para practicar conversaciones difíciles y construir confianza',
    'roleplay.scenarios': 'Escenarios',
    'roleplay.customScenario': 'Crear Escenario Personalizado',
    'roleplay.startPractice': 'Comenzar Práctica',
    'roleplay.difficulty': 'Dificultad',
    'roleplay.easy': 'Fácil',
    'roleplay.medium': 'Medio',
    'roleplay.hard': 'Difícil',
    'roleplay.workplace': 'Trabajo',
    'roleplay.personal': 'Personal',
    'roleplay.family': 'Familia',
    'roleplay.romantic': 'Romántico'
  },

  zh: {
    // Navigation
    'nav.mood': '心情记录',
    'nav.coach': 'AI 教练',
    'nav.roleplay': '角色扮演',
    'nav.resources': '资源',
    'nav.settings': '设置',
    'nav.pricing': '定价',
    'nav.logout': '登出',
    'nav.welcome': '欢迎',
    'nav.language': '语言',
    'nav.theme': '主题',
    'nav.light': '浅色',
    'nav.dark': '深色',
    'nav.system': '系统',
    
    // Index page
    'index.welcome': '欢迎来到您的健康之旅',
    'index.subtitle': '您的心理健康和情感福祉的私人空间',
    'index.moodToday': '您今天感觉如何？',
    'index.currentMood': '当前心情',
    'index.continueJourney': '继续您的旅程',
    'index.aiCoach': '与 AI 教练对话',
    'index.aiCoachDesc': '获得个性化支持和指导',
    'index.practiceRoleplay': '练习对话',
    'index.practiceRoleplayDesc': '提高您的沟通技巧',
    'index.exploreResources': '探索资源',
    'index.exploreResourcesDesc': '自助工具和练习',
    'index.emergencySupport': '紧急支持',
    'index.emergencySupportDesc': '危机支持和帮助热线',
    'index.quickStats': '您的进度',
    'index.totalSessions': '总会话数',
    'index.weekStreak': '周连续记录',
    'index.completedExercises': '完成的练习',
    
    // Common actions
    'common.getStarted': '开始',
    'common.continue': '继续',
    'common.back': '返回',
    'common.next': '下一步',
    'common.close': '关闭',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.tryAgain': '重试',
    'common.yes': '是',
    'common.no': '否',
    
    // Onboarding
    'onboarding.welcome': '欢迎来到您的健康之旅',
    'onboarding.subtitle': '让我们个性化您的体验',
    'onboarding.step1Title': '选择您的 AI 教练语调',
    'onboarding.step1Subtitle': '您希望您的 AI 教练如何与您沟通？',
    'onboarding.step2Title': '设定您的意图',
    'onboarding.step2Subtitle': '今天是什么带您来到这里？',
    'onboarding.step3Title': '一切就绪！',
    'onboarding.step3Subtitle': '您的个性化健康体验已准备好',
    'onboarding.complete': '完成设置',
    'onboarding.tones.supportive': '支持性',
    'onboarding.tones.supportiveDesc': '温暖、鼓励和富有同理心',
    'onboarding.tones.direct': '直接',
    'onboarding.tones.directDesc': '清晰、直接、以解决方案为导向',
    'onboarding.tones.gentle': '温和',
    'onboarding.tones.gentleDesc': '柔和、平静和滋养',
    'onboarding.intentions.stress': '管理压力和焦虑',
    'onboarding.intentions.relationships': '改善关系',
    'onboarding.intentions.selfcare': '培养更好的自我照顾习惯',
    'onboarding.intentions.communication': '提高沟通技巧',
    'onboarding.intentions.general': '一般情感健康',
    
    // Settings
    'settings.title': '设置',
    'settings.profile': '个人资料',
    'settings.account': '账户',
    'settings.preferences': '偏好设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.aiTone': 'AI 教练语调',
    'settings.notifications': '通知',
    'settings.privacy': '隐私',
    'settings.support': '支持',
    'settings.about': '关于',
    'settings.logout': '登出',
    'settings.deleteAccount': '删除账户',
    'settings.saveChanges': '保存更改',
    'settings.changesSaved': '更改保存成功',
    
    // Authentication
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.forgotPassword': '忘记密码？',
    'auth.resetPassword': '重置密码',
    'auth.createAccount': '创建账户',
    'auth.alreadyHaveAccount': '已有账户？',
    'auth.dontHaveAccount': '没有账户？',
    'auth.signInWithGoogle': '使用 Google 登录',
    'auth.signUpWithGoogle': '使用 Google 注册',
    'auth.passwordRequirements': '密码必须至少8个字符',
    'auth.passwordsDoNotMatch': '密码不匹配',
    'auth.invalidEmail': '请输入有效的邮箱地址',
    'auth.signInSuccess': '登录成功',
    'auth.signUpSuccess': '账户创建成功',
    'auth.signOutSuccess': '登出成功',
    'auth.resetEmailSent': '密码重置邮件已发送',
    
    // Mood tracking
    'mood.title': '您感觉如何？',
    'mood.subtitle': '花一点时间关注自己',
    'mood.great': '很棒',
    'mood.greatDesc': '感觉很棒，充满活力！',
    'mood.good': '好',
    'mood.goodDesc': '总体积极和满足',
    'mood.okay': '还好',
    'mood.okayDesc': '中性，既不好也不坏',
    'mood.low': '低落',
    'mood.lowDesc': '有点沮丧，但没关系',
    'mood.difficult': '困难',
    'mood.difficultDesc': '充满挑战的一天，需要额外关怀',
    'mood.supportMessage': '我们在这里支持您',
    'mood.saveMood': '保存我的感受',
    'mood.viewHistory': '查看我的历史',
    'mood.dailyTip': '每日记录有助于您更好地了解情感模式',
    'mood.alreadyRecorded': '您今天已经记录过心情了！',
    
    // Coach page
    'coach.title': '您的个人',
    'coach.aiCoach': 'AI 教练',
    'coach.subtitle': '获得针对您情感和关系健康的个性化指导和支持',
    'coach.chatTitle': '与 Aura 聊天',
    'coach.chatDescription': '您富有同情心的 AI 健康伙伴',
    'coach.placeholder': '分享您心中所想...',
    'coach.welcomeMessage': '您好！我在这里支持您。今天您想聊什么？',
    'coach.specializations': '专业领域',
    'coach.emotional': '情感健康',
    'coach.emotionalDesc': '管理压力、焦虑和情绪',
    'coach.relationships': '关系',
    'coach.relationshipsDesc': '改善沟通和亲密关系',
    'coach.communication': '沟通',
    'coach.communicationDesc': '学会清楚地表达您的需求',
    'coach.mindfulness': '正念',
    'coach.mindfulnessDesc': '培养觉察和存在感',
    
    // Resources
    'resources.title': '自助资源',
    'resources.subtitle': '实用工具和练习，促进您的福祉',
    'resources.search': '按主题、技巧或感受搜索...',
    'resources.all': '全部',
    'resources.backToResources': '← 返回资源',
    'resources.content': '内容',
    'resources.markComplete': '标记为完成',
    'resources.saveForLater': '稍后保存',
    'resources.readMore': '阅读更多 →',
    'resources.noResourcesFound': '未找到资源',
    'resources.noResourcesDesc': '尝试搜索其他术语或选择不同的类别。',
    'resources.anxiety': '焦虑',
    'resources.selfesteem': '自尊',
    'resources.communication': '沟通',
    'resources.trust': '信任',
    'resources.conflict': '冲突',
    'resources.practicalExercise': '实践练习',
    
    // Resource content
    'resources.breathing.title': '焦虑呼吸技巧',
    'resources.breathing.desc': '学习 4-7-8 呼吸法，仅需2分钟即可平静神经系统',
    'resources.breathing.content': '深呼吸练习有助于缓解焦虑。吸气4秒，屏气7秒，呼气8秒。重复3-4次可立即缓解。',
    'resources.boundaries.title': '无愧疚地设定界限',
    'resources.boundaries.desc': '以友好但坚定的方式说不的实用短语',
    'resources.boundaries.content': '学会设定界限对健康关系至关重要。从简单的短语开始，如"我需要考虑一下"或"现在这对我不合适"。记住，对一件事说不意味着对另一件事说是。',
    'resources.gratitude.title': '自尊练习：感恩日记',
    'resources.gratitude.desc': '一个简单的日常练习，逐步建立您的自尊',
    'resources.gratitude.content': '每天写下三件您感激的事情。这有助于将注意力转向积极面，增强自我价值感。包括一件您欣赏自己的事情。',
    'resources.conflict.title': '建设性地管理争论',
    'resources.conflict.desc': '将冲突转化为亲密机会的技巧',
    'resources.conflict.content': '冲突在关系中是正常的。关键是积极倾听，使用"我"的陈述而非"你"的指控，专注于解决方案而非责备。当情绪高涨时要休息。',
    'resources.trust.title': '背叛后重建信任',
    'resources.trust.desc': '修复关系中受损信任的逐步指南',
    'resources.trust.content': '信任可以通过耐心和一致的行动重建。它需要透明度、责任感和愈合时间。双方都必须致力于这个过程，专业帮助可能是有益的。',
    'resources.listening.title': '积极倾听',
    'resources.listening.desc': '学会以让他人感到被听到和理解的方式倾听',
    'resources.listening.content': '积极倾听不仅仅是听词语。它意味着完全在场，提出澄清问题，反映您听到的内容，并通过身体语言和回应表现同理心。',
    
    // Emergency
    emergency: {
      title: "紧急支持",
      subtitle: "如果您正处于危机中，这些资源可以立即帮助您",
      crisisTitle: "需要立即帮助？",
      crisisDesc: "如果您或您认识的人处于直接危险中，请不要犹豫拨打紧急服务电话。",
      callEmergency: "拨打 120",
      callHealthcare: "拨打 12320",
      aiSupportTitle: "立即 AI 支持",
      aiSupportDesc: "现在需要有人说话吗？我们的 AI 教练可以提供即时支持和镇静技巧。",
      aiSupportButton: "开始与 AI 教练对话",
      aiSupportClose: "关闭 AI 支持",
      breathingTitle: "焦虑呼吸练习",
      breathingDesc: "当您感到不知所措时，这个简单的呼吸练习可以帮助您重新获得控制：",
      professionalTitle: "专业帮助",
      onlineResourcesTitle: "更多在线资源",
      onlineResourcesDesc: "访问 12320.gov.cn 了解更多关于心理健康的信息以及在您所在地区可以获得帮助的地方。",
      bottomTitle: "您很宝贵",
      bottomDesc: "无论您现在正在经历什么，请记住您值得爱、支持和感觉良好。寻求帮助是可以的 - 这显示了力量，而不是弱点。",
      contacts: {
        healthcare: {
          name: "12320 卫生热线",
          description: "全天候健康咨询",
          available: "24/7"
        },
        suicide: {
          name: "心理危机干预热线",
          description: "为有自杀想法的人提供帮助",
          available: "24/7"
        },
        women: {
          name: "妇女权益保护热线",
          description: "为遭受暴力的妇女提供支持",
          available: "24/7"
        },
        men: {
          name: "男性心理援助热线",
          description: "为处于危机中的男性提供支持",
          available: "工作日 9-17"
        },
        youth: {
          name: "青少年心理热线",
          description: "为儿童和青少年提供帮助",
          available: "24/7"
        }
      },
      breathingSteps: [
        "舒适地坐着，脚放在地板上",
        "一只手放在胸前，一只手放在腹部",
        "通过鼻子缓慢吸气4秒",
        "屏住呼吸4秒",
        "通过嘴呼气6秒",
        "重复直到感觉更平静"
      ],
      aiMessages: [
        "我注意到您现在需要额外的支持。寻求帮助是勇敢的行为。",
        "您的感受很重要且有效。您值得感觉良好。",
        "记住深呼吸。通过鼻子吸气，保持4秒，通过嘴呼气。",
        "在这件事上您并不孤单。有人关心您。",
        "这种感觉会过去的。您以前也度过了困难时期。"
      ]
    },
    
    // Auri translations
    auri: {
      personalities: {
        soothing: {
          name: "舒缓",
          description: "平静和滋养的存在",
          welcomeMessages: [
            "深呼吸。我今天在这里支持您。",
            "欢迎回来。我如何帮助您感到更平静？",
            "您照顾自己做得很好。您在想什么？"
          ]
        },
        encouraging: {
          name: "鼓励",
          description: "激励和振奋的精神",
          welcomeMessages: [
            "您能做到！我相信您的力量和韧性。",
            "每一步前进都是进步。您今天想做什么？",
            "您的旅程很重要，我在这里为您加油！"
          ]
        },
        wise: {
          name: "智慧",
          description: "深思熟虑和富有洞察力的指导",
          welcomeMessages: [
            "有时我们寻求的答案已经在我们内心。让我们一起探索。",
            "智慧来自于了解自己。您想发现什么？",
            "每一次经历都教给我们宝贵的东西。最近什么在您心中？"
          ]
        },
        playful: {
          name: "顽皮",
          description: "轻松愉快的伙伴",
          welcomeMessages: [
            "您好！准备好为您的一天增添一些轻松吗？",
            "生命太短暂，不能不在小时刻中找到快乐。今天什么让您微笑？",
            "我在这里提醒您，在成长的同时享受乐趣是可以的！"
          ]
        }
      },
      contextMessages: {
        mood: [
          "我注意到您在检查自己的感受。这是很好的自我意识！",
          "您的感受很重要。感谢您花时间关注自己。",
          "您的情感记录正在建立健康的习惯。继续保持！"
        ],
        relationship: [
          "关系需要努力和爱。您正在投资于美好的事物。",
          "每次对话都是加深联系的机会。您做得很好！",
          "您关心关系的事实显示了您的内心。"
        ],
        emergency: [
          "当事情感到压倒性时，您寻求帮助非常勇敢。",
          "记住，寻求帮助是力量的标志，不是弱点。",
          "您不必独自面对困难时刻。我与您同在。"
        ],
        welcome: [
          "欢迎来到您的安全空间。能成为您健康之旅的一部分是我的荣幸。",
          "这是您自我照顾和成长的时间。我在这里支持您的每一步。",
          "通过优先考虑您的福祉，您创造了美好的东西。"
        ]
      },
      settings: {
        title: "Auri 设置",
        enable: "启用 Auri",
        disable: "禁用 Auri",
        toneLabel: "伙伴语调",
        description: "自定义您的 AI 伙伴如何与您沟通"
      }
    },
    
    // Pricing
    'pricing.title': '选择您的计划',
    'pricing.subtitle': '通过高级功能释放您的全部潜力',
    'pricing.free': '免费',
    'pricing.premium': '高级',
    'pricing.freePrice': '$0/月',
    'pricing.premiumPrice': '$9.99/月',
    'pricing.getStarted': '开始',
    'pricing.upgrade': '立即升级',
    'pricing.currentPlan': '当前计划',
    'pricing.freeFeatures': [
      '基础心情跟踪',
      '有限的 AI 教练会话',
      '基础资源访问',
      '社区支持'
    ],
    'pricing.premiumFeatures': [
      '无限心情跟踪与洞察',
      '无限 AI 教练对话',
      '完整资源库访问',
      '高级角色扮演场景',
      '优先支持',
      '进度分析'
    ],
    
    // Roleplay
    'roleplay.title': '练习对话',
    'roleplay.subtitle': '安全空间练习困难对话并建立信心',
    'roleplay.scenarios': '场景',
    'roleplay.customScenario': '创建自定义场景',
    'roleplay.startPractice': '开始练习',
    'roleplay.difficulty': '难度',
    'roleplay.easy': '简单',
    'roleplay.medium': '中等',
    'roleplay.hard': '困难',
    'roleplay.workplace': '工作场所',
    'roleplay.personal': '个人',
    'roleplay.family': '家庭',
    'roleplay.romantic': '浪漫'
  },

  sv: {
    // Navigation
    'nav.mood': 'Humörkoll',
    'nav.coach': 'AI-coach',
    'nav.roleplay': 'Rollspel',
    'nav.resources': 'Resurser',
    'nav.settings': 'Inställningar',
    'nav.pricing': 'Priser',
    'nav.logout': 'Logga ut',
    'nav.welcome': 'Välkommen',
    'nav.language': 'Språk',
    'nav.theme': 'Tema',
    'nav.light': 'Ljust',
    'nav.dark': 'Mörkt',
    'nav.system': 'System',
    
    // Index page
    'index.welcome': 'Välkommen till din hälsoresa',
    'index.subtitle': 'Ditt personliga utrymme för mental hälsa och emotionellt välbefinnande',
    'index.moodToday': 'Hur mår du idag?',
    'index.currentMood': 'Nuvarande humör',
    'index.continueJourney': 'Fortsätt din resa',
    'index.aiCoach': 'Prata med AI-coach',
    'index.aiCoachDesc': 'Få personligt stöd och vägledning',
    'index.practiceRoleplay': 'Öva konversationer',
    'index.practiceRoleplayDesc': 'Förbättra dina kommunikationsfärdigheter',
    'index.exploreResources': 'Utforska resurser',
    'index.exploreResourcesDesc': 'Självhjälpsverktyg och övningar',
    'index.emergencySupport': 'Akutstöd',
    'index.emergencySupportDesc': 'Krisstöd och hjälplinjer',
    'index.quickStats': 'Dina framsteg',
    'index.totalSessions': 'Totala sessioner',
    'index.weekStreak': 'Veckors följd',
    'index.completedExercises': 'Slutförda övningar',
    
    // Common actions
    'common.getStarted': 'Kom igång',
    'common.continue': 'Fortsätt',
    'common.back': 'Tillbaka',
    'common.next': 'Nästa',
    'common.close': 'Stäng',
    'common.save': 'Spara',
    'common.cancel': 'Avbryt',
    'common.delete': 'Ta bort',
    'common.edit': 'Redigera',
    'common.loading': 'Laddar...',
    'common.error': 'Fel',
    'common.success': 'Lyckades',
    'common.tryAgain': 'Försök igen',
    'common.yes': 'Ja',
    'common.no': 'Nej',
    
    // Onboarding
    'onboarding.welcome': 'Välkommen till din hälsoresa',
    'onboarding.subtitle': 'Låt oss personalisera din upplevelse',
    'onboarding.step1Title': 'Välj din AI-coachs ton',
    'onboarding.step1Subtitle': 'Hur vill du att din AI-coach ska kommunicera med dig?',
    'onboarding.step2Title': 'Sätt din intention',
    'onboarding.step2Subtitle': 'Vad för dig hit idag?',
    'onboarding.step3Title': 'Du är redo!',
    'onboarding.step3Subtitle': 'Din personliga hälsoupplevelse är redo',
    'onboarding.complete': 'Slutför installation',
    'onboarding.tones.supportive': 'Stödjande',
    'onboarding.tones.supportiveDesc': 'Varm, uppmuntrande och empatisk',
    'onboarding.tones.direct': 'Direkt',
    'onboarding.tones.directDesc': 'Tydlig, rak och lösningsfokuserad',
    'onboarding.tones.gentle': 'Mild',
    'onboarding.tones.gentleDesc': 'Mjuk, lugnande och omhändertagande',
    'onboarding.intentions.stress': 'Hantera stress och ångest',
    'onboarding.intentions.relationships': 'Förbättra relationer',
    'onboarding.intentions.selfcare': 'Utveckla bättre självomsorgsvanor',
    'onboarding.intentions.communication': 'Förbättra kommunikationsfärdigheter',
    'onboarding.intentions.general': 'Allmänt emotionellt välbefinnande',
    
    // Settings
    'settings.title': 'Inställningar',
    'settings.profile': 'Profil',
    'settings.account': 'Konto',
    'settings.preferences': 'Preferenser',
    'settings.language': 'Språk',
    'settings.theme': 'Tema',
    'settings.aiTone': 'AI-coachs ton',
    'settings.notifications': 'Notifikationer',
    'settings.privacy': 'Integritet',
    'settings.support': 'Support',
    'settings.about': 'Om',
    'settings.logout': 'Logga ut',
    'settings.deleteAccount': 'Ta bort konto',
    'settings.saveChanges': 'Spara ändringar',
    'settings.changesSaved': 'Ändringar sparade framgångsrikt',
    
    // Authentication
    'auth.signIn': 'Logga in',
    'auth.signUp': 'Registrera',
    'auth.email': 'E-post',
    'auth.password': 'Lösenord',
    'auth.confirmPassword': 'Bekräfta lösenord',
    'auth.forgotPassword': 'Glömt lösenord?',
    'auth.resetPassword': 'Återställ lösenord',
    'auth.createAccount': 'Skapa konto',
    'auth.alreadyHaveAccount': 'Har redan ett konto?',
    'auth.dontHaveAccount': 'Har inget konto?',
    'auth.signInWithGoogle': 'Logga in med Google',
    'auth.signUpWithGoogle': 'Registrera med Google',
    'auth.passwordRequirements': 'Lösenord måste vara minst 8 tecken',
    'auth.passwordsDoNotMatch': 'Lösenorden matchar inte',
    'auth.invalidEmail': 'Vänligen ange en giltig e-postadress',
    'auth.signInSuccess': 'Inloggning lyckades',
    'auth.signUpSuccess': 'Konto skapat framgångsrikt',
    'auth.signOutSuccess': 'Utloggning lyckades',
    'auth.resetEmailSent': 'E-post för lösenordsåterställning skickad',
    
    // Mood tracking
    'mood.title': 'Hur mår du?',
    'mood.subtitle': 'Ta dig tid att kolla in med dig själv',
    'mood.great': 'Fantastiskt',
    'mood.greatDesc': 'Känner mig underbar och energisk!',
    'mood.good': 'Bra',
    'mood.goodDesc': 'Generellt positiv och nöjd',
    'mood.okay': 'Okej',
    'mood.okayDesc': 'Neutral, varken bra eller dålig',
    'mood.low': 'Låg',
    'mood.lowDesc': 'Lite nedstämd, men det är okej',
    'mood.difficult': 'Svår',
    'mood.difficultDesc': 'En utmanande dag, behöver extra omvårdnad',
    'mood.supportMessage': 'Vi finns här för dig',
    'mood.saveMood': 'Spara min känsla',
    'mood.viewHistory': 'Visa min historik',
    'mood.dailyTip': 'Dagliga incheckning hjälper dig förstå dina emotionella mönster bättre',
    'mood.alreadyRecorded': 'Du har redan registrerat ditt humör idag!',
    
    // Coach page
    'coach.title': 'Din personliga',
    'coach.aiCoach': 'AI-coach',
    'coach.subtitle': 'Få personlig vägledning och stöd för din emotionella och relationella hälsa',
    'coach.chatTitle': 'Chatta med Aura',
    'coach.chatDescription': 'Din medkänsliga AI-hälsopartner',
    'coach.placeholder': 'Dela vad du har på hjärtat...',
    'coach.welcomeMessage': 'Hej! Jag finns här för att stödja dig. Vad vill du prata om idag?',
    'coach.specializations': 'Specialiseringar',
    'coach.emotional': 'Emotionell hälsa',
    'coach.emotionalDesc': 'Hantera stress, ångest och känslor',
    'coach.relationships': 'Relationer',
    'coach.relationshipsDesc': 'Förbättra kommunikation och intimitet',
    'coach.communication': 'Kommunikation',
    'coach.communicationDesc': 'Lär dig uttrycka dina behov tydligt',
    'coach.mindfulness': 'Mindfulness',
    'coach.mindfulnessDesc': 'Utveckla medvetenhet och närvaro',
    
    // Resources
    'resources.title': 'Självhjälpsresurser',
    'resources.subtitle': 'Praktiska verktyg och övningar för ditt välbefinnande',
    'resources.search': 'Sök efter ämne, teknik eller känslor...',
    'resources.all': 'Alla',
    'resources.backToResources': '← Tillbaka till resurser',
    'resources.content': 'Innehåll',
    'resources.markComplete': 'Markera som klar',
    'resources.saveForLater': 'Spara till senare',
    'resources.readMore': 'Läs mer →',
    'resources.noResourcesFound': 'Inga resurser hittades',
    'resources.noResourcesDesc': 'Prova att söka efter andra termer eller välj en annan kategori.',
    'resources.anxiety': 'Ångest',
    'resources.selfesteem': 'Självkänsla',
    'resources.communication': 'Kommunikation',
    'resources.trust': 'Förtroende',
    'resources.conflict': 'Konflikter',
    'resources.practicalExercise': 'Praktisk övning',
    
    // Resource content
    'resources.breathing.title': 'Andningsteknik för ångest',
    'resources.breathing.desc': 'Lär dig 4-7-8 andning som lugnar nervsystemet på bara 2 minuter',
    'resources.breathing.content': 'Djupandningsövning som hjälper till att lugna ångest. Andas in i 4 sekunder, håll i 7 sekunder, andas ut i 8 sekunder. Upprepa 3-4 gånger för omedelbar lättnad.',
    'resources.boundaries.title': 'Sätta gränser utan skuld',
    'resources.boundaries.desc': 'Praktiska fraser för att säga nej på ett vänligt men bestämt sätt',
    'resources.boundaries.content': 'Att lära sig sätta gränser är avgörande för hälsosamma relationer. Börja med enkla fraser som "Jag behöver tänka på det" eller "Det fungerar inte för mig just nu". Kom ihåg, att säga nej till en sak betyder att säga ja till något annat.',
    'resources.gratitude.title': 'Självkänsla övning: Tacksamhetsdagbok',
    'resources.gratitude.desc': 'En enkel daglig övning för att bygga din självkänsla steg för steg',
    'resources.gratitude.content': 'Skriv ner tre saker du är tacksam för varje dag. Detta hjälper till att förskjuta ditt fokus till det positiva och stärker din självkänsla. Inkludera en sak om dig själv som du uppskattar.',
    'resources.conflict.title': 'Hantera argument konstruktivt',
    'resources.conflict.desc': 'Tekniker för att förvandla konflikter till möjligheter för närhet',
    'resources.conflict.content': 'Konflikter är normala i relationer. Nyckeln är att lyssna aktivt, använda "jag"-påståenden istället för "du"-anklagelser, och fokusera på lösningar snarare än skuld. Ta pauser när känslorna går högt.',
    'resources.trust.title': 'Återuppbygga förtroende efter svek',
    'resources.trust.desc': 'Steg-för-steg guide för att reparera skadat förtroende i relationer',
    'resources.trust.content': 'Förtroende kan återuppbyggas med tålamod och konsekventa handlingar. Det kräver transparens, ansvarighet och tid för läkning. Båda parter måste vara engagerade i processen och professionell hjälp kan vara fördelaktig.',
    'resources.listening.title': 'Aktivt lyssnande',
    'resources.listening.desc': 'Lär dig lyssna på ett sätt som får andra att känna sig hörda och förstådda',
    'resources.listening.content': 'Aktivt lyssnande handlar om mer än att bara höra ord. Det betyder att vara helt närvarande, ställa förtydligande frågor, reflektera vad du hörde, och visa empati genom kroppsspråk och svar.',
    
    // Emergency
    emergency: {
      title: "Akutstöd",
      subtitle: "Om du befinner dig i kris kan dessa resurser hjälpa dig omedelbart",
      crisisTitle: "Behöver du omedelbar hjälp?",
      crisisDesc: "Om du eller någon du känner är i omedelbar fara, tveka inte att ringa nödtjänster.",
      callEmergency: "Ring 112",
      callHealthcare: "Ring 1177",
      aiSupportTitle: "Omedelbart AI-stöd",
      aiSupportDesc: "Behöver du någon att prata med just nu? Vår AI-coach kan ge dig omedelbart stöd och lugnande tekniker.",
      aiSupportButton: "Börja prata med AI-coach",
      aiSupportClose: "Stäng AI-stöd",
      breathingTitle: "Andningsövning för ångest",
      breathingDesc: "När du känner dig överväldigad, kan denna enkla andningsövning hjälpa dig att återfå kontrollen:",
      professionalTitle: "Professionell hjälp",
      onlineResourcesTitle: "Fler resurser online",
      onlineResourcesDesc: "Besök 1177.se för mer information om mental hälsa och var du kan få hjälp i din region.",
      bottomTitle: "Du är värdefull",
      bottomDesc: "Oavsett vad du går igenom just nu, kom ihåg att du förtjänar kärlek, stöd och att må bra. Det är okej att be om hjälp - det visar styrka, inte svaghet.",
      contacts: {
        healthcare: {
          name: "1177 Vårdguiden",
          description: "Sjukvårdsrådgivning dygnet runt",
          available: "24/7"
        },
        suicide: {
          name: "Mind Självmordslinjen",
          description: "För dig som har självmordstankar",
          available: "Vardagar 12-24, Helger 16-24"
        },
        women: {
          name: "Kvinnojouren",
          description: "Stöd för kvinnor som utsatts för våld",
          available: "24/7"
        },
        men: {
          name: "Mansjouren",
          description: "Stöd för män i kris",
          available: "Vardagar 18-22"
        },
        youth: {
          name: "BRIS",
          description: "För barn och unga upp till 25 år",
          available: "24/7"
        }
      },
      breathingSteps: [
        "Sätt dig bekvämt med fötterna i golvet",
        "Lägg en hand på bröstet, en på magen",
        "Andas in sakta genom näsan i 4 sekunder",
        "Håll andan i 4 sekunder",
        "Andas ut genom munnen i 6 sekunder",
        "Upprepa tills du känner dig lugnare"
      ],
      aiMessages: [
        "Jag märker att du behöver extra stöd just nu. Det var modigt av dig att söka hjälp.",
        "Dina känslor är viktiga och giltiga. Du förtjänar att må bra.",
        "Kom ihåg att andas djupt. In genom näsan, håll kvar i 4 sekunder, ut genom munnen.",
        "Du är inte ensam i det här. Det finns människor som bryr sig om dig.",
        "Denna känsla kommer att passera. Du har kommit igenom svåra stunder förut."
      ]
    },
    
    // Auri translations
    auri: {
      personalities: {
        soothing: {
          name: "Lugnande",
          description: "Lugn och omhändertagande närvaro",
          welcomeMessages: [
            "Ta ett djupt andetag. Jag är här för att stödja dig idag.",
            "Välkommen tillbaka. Hur kan jag hjälpa dig känna dig mer i fred?",
            "Du gör bra ifrån dig genom att ta hand om dig själv. Vad har du på hjärtat?"
          ]
        },
        encouraging: {
          name: "Uppmuntrande",
          description: "Motiverande och upplyftande anda",
          welcomeMessages: [
            "Du klarar det här! Jag tror på din styrka och motståndskraft.",
            "Varje steg framåt är framsteg. Vad vill du arbeta med idag?",
            "Din resa är viktig, och jag är här för att heja på dig!"
          ]
        },
        wise: {
          name: "Vis",
          description: "Eftertänksam och insiktsfull vägledning",
          welcomeMessages: [
            "Ibland finns svaren vi söker redan inom oss. Låt oss utforska tillsammans.",
            "Visdom kommer från att förstå oss själva. Vad skulle du vilja upptäcka?",
            "Varje upplevelse lär oss något värdefullt. Vad har varit i ditt hjärta på sistone?"
          ]
        },
        playful: {
          name: "Lekfull",
          description: "Lättsam och rolig kompanjon",
          welcomeMessages: [
            "Hej där! Redo att lägga till lite lätthet till din dag?",
            "Livet är för kort för att inte hitta glädje i små ögonblick. Vad får dig att le idag?",
            "Jag är här för att påminna dig om att det är okej att ha kul medan vi växer!"
          ]
        }
      },
      contextMessages: {
        mood: [
          "Jag märkte att du kollar in med dina känslor. Det är underbar självmedvetenhet!",
          "Hur du känner dig är viktigt. Tack för att du tar tid att stämma av med dig själv.",
          "Dina emotionella incheckning bygger hälsosamma vanor. Fortsätt så!"
        ],
        relationship: [
          "Relationer kräver arbete och kärlek. Du investerar i något vackert.",
          "Varje konversation är en chans att fördjupa kontakten. Du gör det bra!",
          "Det faktum att du bryr dig om dina relationer visar ditt hjärta."
        ],
        emergency: [
          "Du är så modig som söker hjälp när saker känns överväldigande.",
          "Kom ihåg, att be om hjälp är ett tecken på styrka, inte svaghet.",
          "Du behöver inte möta svåra stunder ensam. Jag är här med dig."
        ],
        welcome: [
          "Välkommen till ditt trygga utrymme. Det är en ära att vara del av din hälsoresa.",
          "Detta är din tid för självomvårdnad och tillväxt. Jag är här för att stödja dig varje steg.",
          "Du har skapat något vackert genom att prioritera ditt välbefinnande."
        ]
      },
      settings: {
        title: "Auri-inställningar",
        enable: "Aktivera Auri",
        disable: "Inaktivera Auri",
        toneLabel: "Kompanjonston",
        description: "Anpassa hur din AI-kompanjon kommunicerar med dig"
      }
    },
    
    // Pricing
    'pricing.title': 'Välj din plan',
    'pricing.subtitle': 'Lås upp din fulla potential med premiumfunktioner',
    'pricing.free': 'Gratis',
    'pricing.premium': 'Premium',
    'pricing.freePrice': '$0/månad',
    'pricing.premiumPrice': '$9.99/månad',
    'pricing.getStarted': 'Kom igång',
    'pricing.upgrade': 'Uppgradera nu',
    'pricing.currentPlan': 'Nuvarande plan',
    'pricing.freeFeatures': [
      'Grundläggande humörspårning',
      'Begränsade AI-coach sessioner',
      'Grundläggande resurstillgång',
      'Gemenskapsstöd'
    ],
    'pricing.premiumFeatures': [
      'Obegränsad humörspårning med insikter',
      'Obegränsade AI-coach konversationer',
      'Full tillgång till resursbiblioteket',
      'Avancerade rollspelsscenarier',
      'Prioriterat stöd',
      'Framstegsanalys'
    ],
    
    // Roleplay
    'roleplay.title': 'Öva konversationer',
    'roleplay.subtitle': 'Säkert utrymme att öva svåra konversationer och bygga självförtroende',
    'roleplay.scenarios': 'Scenarier',
    'roleplay.customScenario': 'Skapa anpassat scenario',
    'roleplay.startPractice': 'Börja öva',
    'roleplay.difficulty': 'Svårighet',
    'roleplay.easy': 'Lätt',
    'roleplay.medium': 'Medium',
    'roleplay.hard': 'Svår',
    'roleplay.workplace': 'Arbetsplats',
    'roleplay.personal': 'Personligt',
    'roleplay.family': 'Familj',
    'roleplay.romantic': 'Romantiskt'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const { user } = useAuth();
  const { toast } = useToast();

  // Load language preference from user preferences on auth
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('language_preference')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.log('No language preference found, using default');
            return;
          }

          if (data?.language_preference) {
            setLanguage(data.language_preference as Language);
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      }
    };

    loadLanguagePreference();
  }, [user]);

  // Save language preference when changed
  useEffect(() => {
    const saveLanguagePreference = async () => {
      if (user) {
        try {
          const { error } = await supabase
            .from('user_preferences')
            .upsert(
              { 
                user_id: user.id, 
                language_preference: language,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );

          if (error) {
            console.error('Error saving language preference:', error);
          }
        } catch (error) {
          console.error('Error saving language preference:', error);
        }
      }
    };

    // Only save if we have a user and it's not the initial load
    if (user && language) {
      saveLanguagePreference();
    }
  }, [language, user]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (value === undefined) {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};