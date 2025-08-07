import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'pt' | 'bn' | 'ru' | 'ja' | 'pa' | 'de' | 'fr' | 'tr' | 'vi' | 'ko' | 'it' | 'ur' | 'fa' | 'sw' | 'tl' | 'sv' | 'no';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
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
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
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
const translations: Record<Language, Record<string, string>> = {
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
    'language.selectLanguage': 'Select Language'
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
    'resources.anxiety': 'Ansiedad',
    'resources.selfesteem': 'Autoestima',
    'resources.communication': 'Comunicación',
    'resources.trust': 'Confianza',
    'resources.conflict': 'Conflictos',
    
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
    'common.selectLanguage': 'Seleccionar Idioma'
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
    'common.selectLanguage': '选择语言'
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
    'hero.learnMore': 'Lär dig mer'
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
    'hero.learnMore': 'Learn more'
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