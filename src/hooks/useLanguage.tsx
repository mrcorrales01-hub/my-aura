import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'pt' | 'bn' | 'ru' | 'ja' | 'pa' | 'de' | 'fr' | 'tr' | 'vi' | 'ko' | 'it' | 'ur' | 'fa' | 'sw' | 'tl' | 'sv' | 'no';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  zh: { name: '简体中文', flag: '🇨🇳' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  pt: { name: 'Português', flag: '🇧🇷' },
  bn: { name: 'বাংলা', flag: '🇧🇩' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ur: { name: 'اردو', flag: '🇵🇰' },
  fa: { name: 'فارسی', flag: '🇮🇷' },
  sw: { name: 'Kiswahili', flag: '🇰🇪' },
  tl: { name: 'Filipino', flag: '🇵🇭' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  no: { name: 'Norsk', flag: '🇳🇴' }
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('aura-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aura-language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('aura-language', language);
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (!value && currentLanguage !== 'en') {
      let fallback: any = translations.en;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      value = fallback;
    }
    
    let result = value || key;
    
    // Replace placeholders if replacements provided
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), replacement);
      });
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations: Record<Language, Record<string, any>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.checkin': 'Check-in',
    'nav.coach': 'AI Coach',
    'nav.roleplay': 'Roleplay',
    'nav.resources': 'Resources',
    'nav.emergency': 'Emergency',
    
    // Home page
    'home.title': 'Welcome to Aura',
    'home.subtitle': 'Your personal companion for emotional and relational health',
    'home.description': 'Daily emotional check-ins combined with AI-powered relationship coaching to help you thrive.',
    'home.getStarted': 'Get Started',
    
    // Features
    'features.title': 'Your Journey to Better Wellbeing',
    'features.moodTracking': 'Daily Mood Tracking',
    'features.moodTrackingDesc': 'Track your emotional patterns and get personalized insights',
    'features.aiCoach': 'AI-Powered Coach',
    'features.aiCoachDesc': 'Get personalized relationship advice and communication tips',
    'features.roleplay': 'Practice Conversations',
    'features.roleplayDesc': 'Safe space to practice difficult conversations and scenarios',
    'features.resources': 'Self-Help Resources',
    'features.resourcesDesc': 'Access articles, exercises, and tools for personal growth',
    'features.emergency': 'Emergency Support',
    'features.emergencyDesc': '24/7 access to crisis resources and professional help',
    
    // Check-in page
    'checkin.title': 'Daily Check-in',
    'checkin.subtitle': 'How are you feeling today?',
    'checkin.mood': 'Your Mood',
    'checkin.reflection': 'Your Reflection',
    'checkin.reflectionPlaceholder': 'Share your thoughts about today...',
    'checkin.submit': 'Submit Check-in',
    'checkin.success': 'Check-in saved successfully!',
    
    // Mood Tracking
    'mood.title': 'How are you feeling',
    'mood.today': 'today?',
    'mood.subtitle': 'Take a moment to check in with yourself. Your feelings matter.',
    'mood.amazing': 'Amazing',
    'mood.amazingDesc': 'I feel energetic and happy!',
    'mood.good': 'Good',
    'mood.goodDesc': 'A good day with positive feelings',
    'mood.neutral': 'Okay',
    'mood.neutralDesc': 'Feeling pretty neutral today',
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
    'emergency.title': 'Emergency Support',
    'emergency.subtitle': 'You are not alone. Help is available.',
    'emergency.crisisTitle': 'Immediate danger?',
    'emergency.crisisDesc': 'If you have thoughts of harming yourself or others, or if you are in immediate danger:',
    'emergency.callEmergency': 'Call 112 (Emergency)',
    'emergency.callHealthcare': 'Call 1177 (Healthcare Guide)',
    'emergency.aiSupportTitle': 'Immediate AI Support',
    'emergency.aiSupportDesc': 'Need someone to talk to right now? Our AI coach can provide immediate support and calming techniques.',
    'emergency.startAiChat': 'Start talking with AI coach',
    'emergency.closeAiSupport': 'Close AI support',
    'emergency.breathingTitle': 'Breathing exercise for anxiety',
    'emergency.breathingDesc': 'When you feel overwhelmed, this simple breathing exercise can help you regain control:',
    'emergency.professionalHelp': 'Professional help',
    'emergency.moreResourcesOnline': 'More resources online',
    'emergency.youAreValuable': 'You are valuable',
    'emergency.supportMessage': 'Whatever you are going through right now, remember that you deserve love, support and to feel good. It\'s okay to ask for help - it shows strength, not weakness.',
    
    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.language': 'Language',
    'common.selectLanguage': 'Select Language',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.complete': 'Complete',
    'common.skip': 'Skip',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.confirm': 'Confirm',
    'common.saving': 'Saving...',
    'common.tip': 'Tip',
    
    // Language
    'language.welcome': 'Welcome to Aura',
    'language.selectPreferred': 'Please select your preferred language to continue',
    'language.selectLanguage': 'Select Language',
    
    // Navigation
    nav: {
      home: "Home",
      checkin: "Check-in",
      coach: "Coach",
      roleplay: "Roleplay",
      resources: "Resources",
      emergency: "Emergency",
      settings: "Settings",
      subscription: "Subscription",
      signIn: "Sign In",
      signOut: "Sign out",
      loginRequired: "Login required",
      plan: "Plan",
      freePlan: "Free Plan"
    },
    
    // Auth
    auth: {
      passwordStrength: "Password Strength",
      passwordWeak: "Weak",
      passwordFair: "Fair", 
      passwordGood: "Good",
      passwordStrong: "Strong",
      passwordTooShort: "At least 8 characters",
      passwordNeedsCases: "Upper and lowercase letters",
      passwordNeedsNumber: "At least one number",
      passwordNeedsSpecial: "At least one special character",
      error: "Error",
      success: "Success",
      passwordsDontMatch: "Passwords do not match",
      checkEmail: "Please check your email to verify your account"
    },
    
    // Upgrade prompts
    upgrade: {
      premiumFeature: "Premium Feature",
      unlockFeature: "Unlock {feature} with Premium",
      upgradeToPremium: "Upgrade to Premium",
      upgrade: "Upgrade",
      pro: "PRO",
      premiumBenefits: "Get unlimited access to all features",
      benefit1: "Unlimited AI conversations",
      benefit2: "Advanced mood tracking",
      benefit3: "Priority support"
    },
    
    // Settings
    settings: {
      light: "Light",
      dark: "Dark",
      auto: "Auto"
    },
    
    // Auri
    auri: {
      name: "Auri",
      welcome: {
        default: "Hello! I'm Auri, your wellness companion. How are you feeling today?",
        mood: "I'm here to support your emotional journey. Would you like to share how you're feeling?",
        relationship: "I'm here to help with relationship guidance. What's on your mind?",
        general: "Welcome back! I'm here to support your wellness journey."
      },
      personalities: {
        soothing: {
          name: "Soothing",
          description: "Gentle, calming, and nurturing companion",
          emoji: "🌸",
          welcome: "I'm here to provide gentle support and comfort. Take a deep breath with me.",
          encouragement: "You're doing beautifully. Every step forward matters."
        },
        playful: {
          name: "Playful",
          description: "Energetic, fun, and uplifting companion",
          emoji: "😊", 
          welcome: "Hey there! Ready to brighten your day together?",
          encouragement: "You've got this! Let's tackle challenges with positivity!"
        },
        professional: {
          name: "Professional",
          description: "Clear, direct, and goal-focused companion",
          emoji: "🎯",
          welcome: "I'm here to provide structured guidance for your wellness goals.",
          encouragement: "You're making measurable progress. Let's continue building momentum."
        }
      },
      messages: {
        thinking: "Let me think about that...",
        typing: "I'm here with you...",
        error: "I'm having trouble right now. Please try again in a moment.",
        offline: "I'm currently offline. Please check your connection.",
        loading: "Just a moment while I gather my thoughts..."
      },
      settings: {
        title: "Auri Settings",
        enable: "Enable Auri",
        disable: "Disable Auri", 
        personality: "Choose Personality",
        tone: "Communication Style"
      }
    }
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.checkin': 'Check-in',
    'nav.coach': 'Coach IA',
    'nav.roleplay': 'Roleplay',
    'nav.resources': 'Recursos',
    'nav.emergency': 'Emergencia',
    
    // Home page
    'home.title': 'Bienvenido a Aura',
    'home.subtitle': 'Tu compañero personal para la salud emocional y relacional',
    'home.description': 'Check-ins emocionales diarios combinados con coaching relacional impulsado por IA para ayudarte a prosperar.',
    'home.getStarted': 'Comenzar',
    
    // Resources
    'resources.title': 'Recursos de Autoayuda',
    'resources.subtitle': 'Herramientas prácticas y ejercicios para tu bienestar',
    'resources.search': 'Buscar por tema, técnica o sentimientos...',
    'resources.all': 'Todos',
    'resources.backToResources': '← Volver a recursos',
    'resources.content': 'Contenido',
    'resources.markComplete': 'Marcar como completo',
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
    'resources.breathing.title': 'Técnica de respiración para la ansiedad',
    'resources.breathing.desc': 'Aprende la respiración 4-7-8 que calma el sistema nervioso en solo 2 minutos',
    'resources.breathing.content': 'Ejercicio de respiración profunda que ayuda a calmar la ansiedad. Respira durante 4 segundos, mantén durante 7 segundos, exhala durante 8 segundos. Repite 3-4 veces.',
    'resources.boundaries.title': 'Establecer límites sin culpa',
    'resources.boundaries.desc': 'Frases prácticas para decir no de manera amable pero firme',
    'resources.boundaries.content': 'Aprender a establecer límites es crucial para relaciones saludables. Comienza con frases simples como "Necesito pensarlo" o "No me conviene en este momento".',
    'resources.gratitude.title': 'Ejercicio de autoestima: Diario de gratitud',
    'resources.gratitude.desc': 'Un ejercicio diario simple para construir autoestima paso a paso',
    'resources.gratitude.content': 'Escribe tres cosas por las que estés agradecido cada día. Esto te ayuda a enfocarte en lo positivo y fortalece tu autoestima.',
    'resources.conflict.title': 'Manejar conflictos constructivamente',
    'resources.conflict.desc': 'Técnicas para transformar conflictos en oportunidades de cercanía',
    'resources.conflict.content': 'Los conflictos son normales en las relaciones. La clave es escuchar activamente, usar mensajes "yo" y enfocarse en soluciones en lugar de culpas.',
    'resources.trust.title': 'Reconstruir la confianza después de una traición',
    'resources.trust.desc': 'Guía paso a paso para reparar la confianza dañada en las relaciones',
    'resources.trust.content': 'La confianza puede reconstruirse con paciencia y acciones consistentes. Requiere transparencia, responsabilidad y tiempo para la curación.',
    'resources.listening.title': 'Escucha activa',
    'resources.listening.desc': 'Aprende a escuchar de una manera que haga que otros se sientan escuchados y comprendidos',
    'resources.listening.content': 'La escucha activa implica más que solo oír palabras. Se trata de estar completamente presente, hacer preguntas aclaratorias y mostrar empatía.',
    
    // Emergency
    'emergency.title': 'Apoyo de Emergencia',
    'emergency.subtitle': 'No estás solo. La ayuda está disponible.',
    'emergency.professionalHelp': 'Ayuda profesional',
    
    // Common
    'common.close': 'Cerrar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': '¡Éxito!',
    'common.language': 'Idioma',
    'common.selectLanguage': 'Seleccionar Idioma',
    
    // Auri
    auri: {
      name: "Auri",
      welcome: {
        default: "¡Hola! Soy Auri, tu compañera de bienestar. ¿Cómo te sientes hoy?",
        mood: "Estoy aquí para apoyar tu viaje emocional. ¿Te gustaría compartir cómo te sientes?",
        relationship: "Estoy aquí para ayudar con orientación en relaciones. ¿Qué tienes en mente?",
        general: "¡Bienvenido de vuelta! Estoy aquí para apoyar tu viaje de bienestar."
      },
      personalities: {
        soothing: {
          name: "Tranquilizante",
          description: "Compañera gentil, calmante y nutritiva",
          emoji: "🌸",
          welcome: "Estoy aquí para brindarte apoyo gentil y consuelo. Respira profundo conmigo.",
          encouragement: "Lo estás haciendo hermosamente. Cada paso adelante importa."
        },
        playful: {
          name: "Juguetona",
          description: "Compañera energética, divertida y animada",
          emoji: "😊",
          welcome: "¡Hola! ¿Lista para alegrar tu día juntas?",
          encouragement: "¡Tú puedes! ¡Enfrentemos los desafíos con positividad!"
        },
        professional: {
          name: "Profesional", 
          description: "Compañera clara, directa y enfocada en objetivos",
          emoji: "🎯",
          welcome: "Estoy aquí para proporcionar orientación estructurada para tus metas de bienestar.",
          encouragement: "Estás haciendo progreso medible. Sigamos construyendo impulso."
        }
      },
      messages: {
        thinking: "Déjame pensar en eso...",
        typing: "Estoy aquí contigo...",
        error: "Tengo problemas ahora. Por favor intenta de nuevo en un momento.",
        offline: "Actualmente estoy desconectada. Por favor verifica tu conexión.",
        loading: "Solo un momento mientras reúno mis pensamientos..."
      },
      settings: {
        title: "Configuración de Auri",
        enable: "Habilitar Auri",
        disable: "Deshabilitar Auri",
        personality: "Elegir Personalidad", 
        tone: "Estilo de Comunicación"
      }
    }
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.checkin': '签到',
    'nav.coach': 'AI教练',
    'nav.roleplay': '角色扮演',
    'nav.resources': '资源',
    'nav.emergency': '紧急情况',
    
    // Home page
    'home.title': '欢迎来到Aura',
    'home.subtitle': '您的情感和关系健康个人伴侣',
    'home.description': '每日情感签到结合AI驱动的关系指导，帮助您茁壮成长。',
    'home.getStarted': '开始使用',
    
    // Resources
    'resources.title': '自助资源',
    'resources.subtitle': '实用工具和练习帮助您的健康',
    'resources.all': '全部',
    'resources.anxiety': '焦虑',
    'resources.selfesteem': '自尊',
    'resources.communication': '沟通',
    'resources.trust': '信任',
    'resources.conflict': '冲突',
    
    // Common
    'common.close': '关闭',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.success': '成功！',
    'common.language': '语言',
    'common.selectLanguage': '选择语言',
    
    // Auri
    auri: {
      name: "Auri",
      welcome: {
        default: "你好！我是Auri，你的健康伙伴。你今天感觉怎么样？",
        mood: "我在这里支持你的情感之旅。你愿意分享你的感受吗？",
        relationship: "我在这里帮助你解决关系问题。你在想什么？",
        general: "欢迎回来！我在这里支持你的健康之旅。"
      },
      personalities: {
        soothing: {
          name: "舒缓",
          description: "温和、平静、关怀的伙伴",
          emoji: "🌸",
          welcome: "我在这里提供温和的支持和安慰。和我一起深呼吸。",
          encouragement: "你做得很好。每一步前进都很重要。"
        },
        playful: {
          name: "活泼",
          description: "精力充沛、有趣、振奋的伙伴",
          emoji: "😊",
          welcome: "嗨！准备好一起让你的一天更美好吗？",
          encouragement: "你能做到！让我们积极地面对挑战！"
        },
        professional: {
          name: "专业",
          description: "清晰、直接、目标导向的伙伴",
          emoji: "🎯",
          welcome: "我在这里为你的健康目标提供结构化指导。",
          encouragement: "你正在取得可衡量的进步。让我们继续保持势头。"
        }
      },
      messages: {
        thinking: "让我想想...",
        typing: "我和你在一起...",
        error: "我现在遇到了问题。请稍后再试。",
        offline: "我目前离线。请检查你的连接。",
        loading: "请稍等，我正在整理思路..."
      },
      settings: {
        title: "Auri设置",
        enable: "启用Auri",
        disable: "禁用Auri",
        personality: "选择个性",
        tone: "沟通风格"
      }
    }
  },
  sv: {
    // Navigation
    'nav.home': 'Hem',
    'nav.checkin': 'Incheckning',
    'nav.coach': 'AI-Coach',
    'nav.roleplay': 'Rollspel',
    'nav.resources': 'Resurser',
    'nav.emergency': 'Akutläge',
    
    // Home page
    'home.title': 'Välkommen till Aura',
    'home.subtitle': 'Din personliga följeslagare för emotionell och relationell hälsa',
    'home.description': 'Dagliga emotionella incheckningar kombinerat med AI-driven relationscoaching för att hjälpa dig blomstra.',
    'home.getStarted': 'Kom igång',
    
    // Resources
    'resources.title': 'Självhjälpsresurser',
    'resources.subtitle': 'Praktiska verktyg och övningar för ditt välbefinnande',
    'resources.search': 'Sök efter ämne, teknik eller känslor...',
    'resources.all': 'Alla',
    'resources.backToResources': '← Tillbaka till resurser',
    'resources.content': 'Innehåll',
    'resources.markComplete': 'Markera som klar',
    'resources.saveForLater': 'Spara för senare',
    'resources.readMore': 'Läs mer →',
    'resources.noResourcesFound': 'Inga resurser hittades',
    'resources.noResourcesDesc': 'Prova att söka på andra termer eller välj en annan kategori.',
    'resources.anxiety': 'Ångest',
    'resources.selfesteem': 'Självkänsla',
    'resources.communication': 'Kommunikation',
    'resources.trust': 'Tillit',
    'resources.conflict': 'Konflikter',
    'resources.practicalExercise': 'Praktisk övning',
    
    // Resource content
    'resources.breathing.title': 'Andningsteknik för ångest',
    'resources.breathing.desc': 'Lär dig 4-7-8 andning som lugnar nervsystemet på bara 2 minuter',
    'resources.breathing.content': 'Djupandningsövning som hjälper till att lugna ångest. Andas in på 4 sekunder, håll andan i 7 sekunder, andas ut på 8 sekunder. Upprepa 3-4 gånger.',
    'resources.boundaries.title': 'Sätta gränser utan skuld',
    'resources.boundaries.desc': 'Praktiska fraser för att säga nej på ett vänligt men bestämt sätt',
    'resources.boundaries.content': 'Att lära sig sätta gränser är avgörande för hälsosamma relationer. Börja med enkla fraser som "Jag behöver tänka på det" eller "Det passar mig inte just nu".',
    'resources.gratitude.title': 'Självkänsla-övning: Tacksamhetsdagbok',
    'resources.gratitude.desc': 'En enkel daglig övning för att bygga självkänsla steg för steg',
    'resources.gratitude.content': 'Skriv ner tre saker du är tacksam för varje dag. Detta hjälper dig att fokusera på det positiva och stärker din självkänsla.',
    'resources.conflict.title': 'Hantera konflikter konstruktivt',
    'resources.conflict.desc': 'Tekniker för att förvandla konflikter till möjligheter för närhet',
    'resources.conflict.content': 'Konflikter är normala i relationer. Nyckeln är att lyssna aktivt, använda "jag"-meddelanden och fokusera på lösningar snarare än skuld.',
    'resources.trust.title': 'Återuppbygga förtroende efter svek',
    'resources.trust.desc': 'Steg-för-steg guide för att reparera skadat förtroende i relationer',
    'resources.trust.content': 'Förtroende kan återuppbyggas med tålamod och konsekventa handlingar. Det kräver transparens, ansvar och tid för läkning.',
    'resources.listening.title': 'Aktivt lyssnande',
    'resources.listening.desc': 'Lär dig lyssna på ett sätt som får andra att känna sig hörda och förstådda',
    'resources.listening.content': 'Aktivt lyssnande innebär mer än att bara höra ord. Det handlar om att vara fullt närvarande, ställa förtydligande frågor och visa empati.',
    
    // Emergency
    'emergency.title': 'Akutläge',
    'emergency.subtitle': 'Du är inte ensam. Här finns omedelbar hjälp och stöd.',
    'emergency.crisisTitle': 'Akut fara?',
    'emergency.crisisDesc': 'Om du har tankar på att skada dig själv eller andra, eller om du befinner dig i omedelbar fara:',
    'emergency.callEmergency': 'Ring 112 (Akut)',
    'emergency.callHealthcare': 'Ring 1177 (Vårdguiden)',
    'emergency.aiSupportTitle': 'Omedelbart AI-stöd',
    'emergency.aiSupportDesc': 'Behöver du någon att prata med just nu? Vår AI-coach kan ge dig omedelbart stöd och lugnande tekniker.',
    'emergency.startAiChat': 'Börja prata med AI-coach',
    'emergency.closeAiSupport': 'Stäng AI-stöd',
    'emergency.breathingTitle': 'Andningsövning för ångest',
    'emergency.breathingDesc': 'När du känner dig överväldigad, kan denna enkla andningsövning hjälpa dig att återfå kontrollen:',
    'emergency.professionalHelp': 'Professionell hjälp',
    'emergency.moreResourcesOnline': 'Fler resurser online',
    'emergency.youAreValuable': 'Du är värdefull',
    'emergency.supportMessage': 'Oavsett vad du går igenom just nu, kom ihåg att du förtjänar kärlek, stöd och att må bra. Det är okej att be om hjälp - det visar styrka, inte svaghet.',
    
    // Common
    'common.close': 'Stäng',
    'common.cancel': 'Avbryt',
    'common.save': 'Spara',
    'common.edit': 'Redigera',
    'common.delete': 'Ta bort',
    'common.loading': 'Laddar...',
    'common.error': 'Ett fel uppstod',
    'common.success': 'Framgång!',
    'common.language': 'Språk',
    'common.selectLanguage': 'Välj språk',
    'common.hello': 'Hej',
    'common.aiInsight': 'AI-insikt',
    
    // Coach
    'coach.emotional': 'Emotionell hälsa',
    'coach.emotionalDesc': 'Hantera stress, ångest och känslor',
    'coach.relationships': 'Relationer',
    'coach.relationshipsDesc': 'Förbättra kommunikation och intimitet',
    'coach.communication': 'Kommunikation',
    'coach.communicationDesc': 'Lär dig uttrycka dina behov tydligt',
    'coach.mindfulness': 'Mindfulness',
    'coach.mindfulnessDesc': 'Utveckla närvaro och inre balans',
    
    // Roleplay page
    'roleplay.title': 'Interaktiva Rollspel',
    'roleplay.subtitle': 'Träna på svåra samtal i en trygg miljö',
    'roleplay.partner.title': 'Samtal med partner',
    'roleplay.partner.description': 'Öva på att kommunicera med din partner om känslor och behov',
    'roleplay.partner.role': 'Jag spelar din partner som är lite defensiv men vill förstå',
    'roleplay.parent.title': 'Gränssättning med förälder',
    'roleplay.parent.description': 'Träna på att sätta gränser med en förälder som är påträngande',
    'roleplay.parent.role': 'Jag spelar en förälder som har svårt att respektera gränser',
    'roleplay.boss.title': 'Konflikt med chef',
    'roleplay.boss.description': 'Öva på att hantera en svår arbetssituation professionellt',
    'roleplay.boss.role': 'Jag spelar en stressad chef som är kritisk',
    'roleplay.friend.title': 'Besviken vän',
    'roleplay.friend.description': 'Träna på att hantera en vän som känner sig bortglömd',
    'roleplay.friend.role': 'Jag spelar en vän som känner sig sårad och missförstådd',
    'roleplay.startRoleplay': 'Starta rollspel',
    'roleplay.howItWorks': 'Så fungerar rollspelen',
    'roleplay.instructions.ai': '• AI:n spelar en specifik roll och reagerar realistiskt',
    'roleplay.instructions.practice': '• Träna på att uttrycka dina känslor och sätta gränser',
    'roleplay.instructions.experiment': '• Experimentera med olika sätt att kommunicera',
    'roleplay.instructions.safe': '• Kom ihåg att detta är en trygg träningsplats',
    'roleplay.instructions.stop': '• Du kan avbryta när som helst om det känns för intensivt',
    'roleplay.active': 'Rollspel aktiv',
    'roleplay.end': 'Avsluta',
    'roleplay.placeholder': 'Skriv ditt svar här...',
    'roleplay.send': 'Skicka',
    'roleplay.reminder': 'Kom ihåg: Detta är träning. Ta din tid och experimentera med olika sätt att kommunicera.',
    'roleplay.started': 'Rollspel startat! 🎭',
    'roleplay.startedDesc': 'Du kan avbryta när som helst. Kom ihåg att detta är träning i en trygg miljö.',
    
    // Checkin page
    'checkin.title': 'Daglig Incheckning',
    'checkin.subtitle': 'Hur mår du idag? Ta en stund att checka in med dig själv.',
    'checkin.selectMood': 'Välj ditt humör',
    'checkin.reflection': 'Reflektion (valfritt)',
    'checkin.reflectionPlaceholder': 'Berätta kort om din dag... Vad är du tacksam för? Vad känns utmanande?',
    'checkin.saveMood': 'Spara min känsla',
    'checkin.showTrends': 'Visa trends',
    'checkin.hideTrends': 'Dölj trends',
    'checkin.weekOverview': 'Din vecka i översikt',
    'checkin.aiInsight': 'Du verkar må bättre under vardagar. Kanske helger kräver extra omsorg om dig själv? Prova att planera in något roligt redan på fredagen!',
    'checkin.thanks': 'Tack för din incheckning! 💙',
    'checkin.thanksDesc': 'Din känsla har sparats. Kom ihåg att du är värdefull precis som du är.',
    'checkin.shareDesc': 'Tack för att du delar med dig',
    'checkin.alreadyCheckedIn': 'Redan incheckad idag',
    'checkin.moods.amazing': 'Fantastisk',
    'checkin.moods.good': 'Bra', 
    'checkin.moods.neutral': 'Okej',
    'checkin.moods.low': 'Låg',
    'checkin.moods.difficult': 'Svår',
    'checkin.moods.amazingDesc': 'Jag känner mig energisk och lycklig!',
    'checkin.moods.goodDesc': 'En bra dag med positiva känslor',
    'checkin.moods.neutralDesc': 'Känner mig ganska neutral idag',
    'checkin.moods.lowDesc': 'Lite nedstämd, men det är okej',
    'checkin.moods.difficultDesc': 'En utmanande dag, behöver extra omsorg',
    
    // Features page
    'features.title': 'Allt du behöver för ditt',
    'features.titleHighlight': 'välbefinnande',
    'features.subtitle': 'Aura kombinerar vetenskapligt beprövade metoder med modern teknologi för att ge dig de bästa verktygen för emotionell och relationell hälsa.',
    'features.moodTracking': 'Daglig Mood Tracking',
    'features.moodTrackingDesc': 'Följ dina känslor och humör med vackra visualiseringar och insiktsfulla analyser.',
    'features.aiCoaching': 'AI-stödd Coaching',
    'features.aiCoachingDesc': 'Få personliga råd och coaching baserat på din unika resa och dina mål.',
    'features.relationships': 'Parterapi & Relationer',
    'features.relationshipsDesc': 'Verktyg och övningar för att stärka kommunikation och intimitet i din relation.',
    'features.design': 'Intuitiv Design',
    'features.designDesc': 'Vacker och användarvänlig design som gör det enkelt att hålla koll på ditt välbefinnande.',
    'features.multilingual': 'Flerspråkigt Stöd',
    'features.multilingualDesc': 'Tillgänglig på flera språk för att nå användare över hela världen.',
    'features.security': 'Säkerhet & Integritet',
    'features.securityDesc': 'Dina personliga data är säkra med oss. Full kryptering och GDPR-kompatibel.',
    'features.learnMore': 'Läs mer',
    'features.exploreAll': 'Utforska alla funktioner',
    
    // Hero component
    'hero.mentalHealth': 'Mental Hälsa',
    'hero.emotionalBalance': 'Emotionell Balans', 
    'hero.relationshipCoaching': 'Relationscoaching',
    'hero.learnMore': 'Lär dig mer',
    
    // Auri
    auri: {
      name: "Auri",
      welcome: {
        default: "Hej! Jag är Auri, din välbefinnandecompanion. Hur mår du idag?",
        mood: "Jag är här för att stödja din emotionella resa. Vill du dela hur du känner dig?",
        relationship: "Jag är här för att hjälpa med relationsvägledning. Vad tänker du på?",
        general: "Välkommen tillbaka! Jag är här för att stödja din välbefinnanderesa."
      },
      personalities: {
        soothing: {
          name: "Lugnande",
          description: "Mild, lugnande och omvårdande companion",
          emoji: "🌸",
          welcome: "Jag är här för att ge mild support och tröst. Ta ett djupt andetag med mig.",
          encouragement: "Du gör det vackert. Varje steg framåt betyder något."
        },
        playful: {
          name: "Lekfull",
          description: "Energisk, rolig och upplyftande companion",
          emoji: "😊",
          welcome: "Hej där! Redo att ljusa upp din dag tillsammans?",
          encouragement: "Du klarar det! Låt oss ta itu med utmaningar med positivitet!"
        },
        professional: {
          name: "Professionell",
          description: "Tydlig, direkt och målfokuserad companion",
          emoji: "🎯",
          welcome: "Jag är här för att ge strukturerad vägledning för dina välbefinnandemål.",
          encouragement: "Du gör mätbara framsteg. Låt oss fortsätta bygga momentum."
        }
      },
      messages: {
        thinking: "Låt mig tänka på det...",
        typing: "Jag är här med dig...",
        error: "Jag har problem just nu. Försök igen om ett ögonblick.",
        offline: "Jag är för närvarande offline. Kontrollera din anslutning.",
        loading: "Bara ett ögonblick medan jag samlar mina tankar..."
      },
      settings: {
        title: "Auri-inställningar",
        enable: "Aktivera Auri",
        disable: "Inaktivera Auri",
        personality: "Välj Personlighet",
        tone: "Kommunikationsstil"
      }
    }
  },
  // Placeholder translations for other languages
  hi: {
    'nav.home': 'होम',
    'nav.checkin': 'चेक-इन',
    'nav.coach': 'AI कोच',
    'nav.roleplay': 'रोलप्ले',
    'nav.resources': 'संसाधन',
    'nav.emergency': 'आपातकाल',
    'home.title': 'Aura में आपका स्वागत है',
    'home.subtitle': 'भावनात्मक और रिश्तों के स्वास्थ्य के लिए आपका व्यक्तिगत साथी',
    'common.language': 'भाषा',
    'common.selectLanguage': 'भाषा चुनें'
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.checkin': 'تسجيل الوصول',
    'nav.coach': 'مدرب الذكي',
    'nav.roleplay': 'لعب الأدوار',
    'nav.resources': 'الموارد',
    'nav.emergency': 'الطوارئ',
    'home.title': 'مرحباً بك في أورا',
    'home.subtitle': 'رفيقك الشخصي للصحة العاطفية والعلائقية',
    'common.language': 'اللغة',
    'common.selectLanguage': 'اختر اللغة'
  },
  pt: {
    'nav.home': 'Início',
    'nav.checkin': 'Check-in',
    'nav.coach': 'Coach IA',
    'nav.roleplay': 'Roleplay',
    'nav.resources': 'Recursos',
     'nav.emergency': 'Emergência',
    'home.title': 'Bem-vindo ao Aura',
    'home.subtitle': 'Seu companheiro pessoal para saúde emocional e relacional',
    'common.language': 'Idioma',
    'common.selectLanguage': 'Selecionar Idioma',
    'common.hello': 'Olá',
    'common.aiInsight': 'Insight da IA',
    
    // Emergency page
    'emergency.title': 'Apoio de Emergência',
    'emergency.subtitle': 'Ajuda imediata quando você mais precisa',
    
    // Roleplay page
    'roleplay.title': 'Interactive Roleplay',
    'roleplay.subtitle': 'Practice difficult conversations in a safe environment',
    'roleplay.partner.title': 'Conversation with Partner',
    'roleplay.partner.description': 'Practice communicating with your partner about feelings and needs',
    'roleplay.partner.role': 'I play your partner who is a bit defensive but wants to understand',
    'roleplay.parent.title': 'Setting Boundaries with Parent',
    'roleplay.parent.description': 'Practice setting boundaries with an intrusive parent',
    'roleplay.parent.role': 'I play a parent who has difficulty respecting boundaries',
    'roleplay.boss.title': 'Conflict with Boss',
    'roleplay.boss.description': 'Practice handling a difficult work situation professionally',
    'roleplay.boss.role': 'I play a stressed boss who is critical',
    'roleplay.friend.title': 'Disappointed Friend',
    'roleplay.friend.description': 'Practice handling a friend who feels forgotten',
    'roleplay.friend.role': 'I play a friend who feels hurt and misunderstood',
    'roleplay.startRoleplay': 'Start Roleplay',
    'roleplay.howItWorks': 'How Roleplay Works',
    'roleplay.instructions.ai': '• AI plays a specific role and reacts realistically',
    'roleplay.instructions.practice': '• Practice expressing your feelings and setting boundaries',
    'roleplay.instructions.experiment': '• Experiment with different ways to communicate',
    'roleplay.instructions.safe': '• Remember this is a safe training space',
    'roleplay.instructions.stop': '• You can stop anytime if it feels too intense',
    'roleplay.active': 'Roleplay Active',
    'roleplay.end': 'End',
    'roleplay.placeholder': 'Write your response here...',
    'roleplay.send': 'Send',
    'roleplay.reminder': 'Remember: This is training. Take your time and experiment with different ways to communicate.',
    'roleplay.started': 'Roleplay Started! 🎭',
    'roleplay.startedDesc': 'You can stop anytime. Remember this is training in a safe environment.',
    
    // Checkin page
    'checkin.title': 'Daily Check-in',
    'checkin.subtitle': 'How are you feeling today? Take a moment to check in with yourself.',
    'checkin.selectMood': 'Choose your mood',
    'checkin.reflection': 'Reflection (optional)',
    'checkin.reflectionPlaceholder': 'Tell us briefly about your day... What are you grateful for? What feels challenging?',
    'checkin.saveMood': 'Save my feeling',
    'checkin.showTrends': 'Show trends',
    'checkin.hideTrends': 'Hide trends',
    'checkin.weekOverview': 'Your week overview',
    'checkin.aiInsight': 'You seem to feel better on weekdays. Maybe weekends require extra self-care? Try planning something fun already on Friday!',
    'checkin.thanks': 'Thanks for checking in! 💙',
    'checkin.thanksDesc': 'Your feeling has been saved. Remember that you are valuable just as you are.',
    'checkin.shareDesc': 'Thanks for sharing with us',
    'checkin.alreadyCheckedIn': 'Already checked in today',
    'checkin.moods.amazing': 'Amazing',
    'checkin.moods.good': 'Good', 
    'checkin.moods.neutral': 'Okay',
    'checkin.moods.low': 'Low',
    'checkin.moods.difficult': 'Difficult',
    'checkin.moods.amazingDesc': 'I feel energetic and happy!',
    'checkin.moods.goodDesc': 'A good day with positive feelings',
    'checkin.moods.neutralDesc': 'Feeling quite neutral today',
    'checkin.moods.lowDesc': 'A bit down, but that\'s okay',
    'checkin.moods.difficultDesc': 'A challenging day, need extra care',
    
    // Features page
    'features.title': 'Everything you need for your',
    'features.titleHighlight': 'wellbeing',
    'features.subtitle': 'Aura combines scientifically proven methods with modern technology to give you the best tools for emotional and relational health.',
    'features.moodTracking': 'Daily Mood Tracking',
    'features.moodTrackingDesc': 'Track your feelings and mood with beautiful visualizations and insightful analytics.',
    'features.aiCoaching': 'AI-powered Coaching',
    'features.aiCoachingDesc': 'Get personalized advice and coaching based on your unique journey and goals.',
    'features.relationships': 'Couple Therapy & Relationships',
    'features.relationshipsDesc': 'Tools and exercises to strengthen communication and intimacy in your relationship.',
    'features.design': 'Intuitive Design',
    'features.designDesc': 'Beautiful and user-friendly design that makes it easy to keep track of your wellbeing.',
    'features.multilingual': 'Multilingual Support',
    'features.multilingualDesc': 'Available in multiple languages to reach users worldwide.',
    'features.security': 'Security & Privacy',
    'features.securityDesc': 'Your personal data is safe with us. Full encryption and GDPR compliant.',
    'features.learnMore': 'Learn more',
    'features.exploreAll': 'Explore all features',
    
    // Hero component
    'hero.mentalHealth': 'Mental Health',
    'hero.emotionalBalance': 'Emotional Balance', 
    'hero.relationshipCoaching': 'Relationship Coaching',
    'hero.learnMore': 'Learn more',
    'resources.breathing.title': 'Breathing Technique for Anxiety',
    'resources.breathing.desc': 'Learn 4-7-8 breathing that calms the nervous system in just 2 minutes',
    'resources.breathing.content': 'Deep breathing exercise that helps calm anxiety...',
    'resources.boundaries.title': 'Setting Boundaries Without Guilt',
    'resources.boundaries.desc': 'Practical phrases for saying no in a friendly but firm way',
    'resources.boundaries.content': 'Learning to set boundaries is crucial for healthy relationships...',
    'resources.gratitude.title': 'Self-esteem Exercise: Gratitude Journal',
    'resources.gratitude.desc': 'A simple daily exercise to build your self-esteem step by step',
    'resources.gratitude.content': 'Write down three things you\'re grateful for each day...',
    'resources.conflict.title': 'Managing Arguments Constructively',
    'resources.conflict.desc': 'Techniques to transform conflicts into opportunities for closeness',
    'resources.conflict.content': 'Conflicts are normal in relationships. Here\'s how to handle them...',
    'resources.trust.title': 'Rebuilding Trust After Betrayal',
    'resources.trust.desc': 'Step-by-step guide to repair damaged trust in relationships',
    'resources.trust.content': 'Trust can be rebuilt with patience and consistent actions...',
    'resources.listening.title': 'Active Listening',
    'resources.listening.desc': 'Learn to listen in a way that makes others feel heard and understood',
    'resources.listening.content': 'Active listening involves more than just hearing words...',
    'resources.practicalExercise': 'Practical exercise'
  },
  // Add minimal translations for other languages...
  bn: { 'common.language': 'ভাষা', 'common.selectLanguage': 'ভাষা নির্বাচন' },
  ru: { 'common.language': 'Язык', 'common.selectLanguage': 'Выбрать язык' },
  ja: { 'common.language': '言語', 'common.selectLanguage': '言語を選択' },
  pa: { 'common.language': 'ਭਾਸ਼ਾ', 'common.selectLanguage': 'ਭਾਸ਼ਾ ਚੁਣੋ' },
  de: { 'common.language': 'Sprache', 'common.selectLanguage': 'Sprache wählen' },
  fr: { 'common.language': 'Langue', 'common.selectLanguage': 'Choisir la langue' },
  tr: { 'common.language': 'Dil', 'common.selectLanguage': 'Dil seç' },
  vi: { 'common.language': 'Ngôn ngữ', 'common.selectLanguage': 'Chọn ngôn ngữ' },
  ko: { 'common.language': '언어', 'common.selectLanguage': '언어 선택' },
  it: { 'common.language': 'Lingua', 'common.selectLanguage': 'Seleziona lingua' },
  ur: { 'common.language': 'زبان', 'common.selectLanguage': 'زبان منتخب کریں' },
  fa: { 'common.language': 'زبان', 'common.selectLanguage': 'انتخاب زبان' },
  sw: { 'common.language': 'Lugha', 'common.selectLanguage': 'Chagua lugha' },
  tl: { 'common.language': 'Wika', 'common.selectLanguage': 'Pumili ng wika' },
  no: { 'common.language': 'Språk', 'common.selectLanguage': 'Velg språk' }
};