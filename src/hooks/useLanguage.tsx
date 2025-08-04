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
    
    // Check-in page
    'checkin.title': 'Daily Check-in',
    'checkin.subtitle': 'How are you feeling today?',
    'checkin.mood': 'Your Mood',
    'checkin.reflection': 'Your Reflection',
    'checkin.reflectionPlaceholder': 'Share your thoughts about today...',
    'checkin.submit': 'Submit Check-in',
    'checkin.success': 'Check-in saved successfully!',
    
    // Coach page
    'coach.title': 'AI-Coach',
    'coach.subtitle': 'Your personal coach for relationships and emotions',
    'coach.relationshipStatus': 'Your relationship status:',
    'coach.single': 'Single',
    'coach.relationship': 'In relationship',
    'coach.separated': 'Separated',
    'coach.online': 'Online',
    'coach.inputPlaceholder': 'Type your message here...',
    'coach.quickTopics': 'Common topics to discuss:',
    
    // Emergency page
    'emergency.title': 'Emergency Support',
    'emergency.subtitle': 'You\'re not alone. Help is available.',
    'emergency.breathing': 'Breathing Exercise',
    'emergency.breathingDesc': 'Take a moment to breathe and center yourself',
    'emergency.contacts': 'Emergency Contacts',
    'emergency.contactsDesc': 'Professional help is available 24/7',
    'emergency.breathingGuide': 'Follow this breathing pattern',
    'emergency.inhale': 'Inhale',
    'emergency.hold': 'Hold',
    'emergency.exhale': 'Exhale',
    
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
    'common.selectLanguage': 'Select Language'
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
    
    // Features
    'features.title': 'Tu Camino hacia un Mejor Bienestar',
    'features.moodTracking': 'Seguimiento del Estado de Ánimo Diario',
    'features.moodTrackingDesc': 'Rastrea tus patrones emocionales y obtén información personalizada',
    'features.aiCoach': 'Coach Impulsado por IA',
    'features.aiCoachDesc': 'Obtén consejos personalizados sobre relaciones y comunicación',
    'features.roleplay': 'Practicar Conversaciones',
    'features.roleplayDesc': 'Espacio seguro para practicar conversaciones y escenarios difíciles',
    'features.resources': 'Recursos de Autoayuda',
    'features.resourcesDesc': 'Accede a artículos, ejercicios y herramientas para el crecimiento personal',
    
    // Check-in page
    'checkin.title': 'Check-in Diario',
    'checkin.subtitle': '¿Cómo te sientes hoy?',
    'checkin.mood': 'Tu Estado de Ánimo',
    'checkin.reflection': 'Tu Reflexión',
    'checkin.reflectionPlaceholder': 'Comparte tus pensamientos sobre hoy...',
    'checkin.submit': 'Enviar Check-in',
    'checkin.success': '¡Check-in guardado exitosamente!',
    
    // Coach page
    'coach.title': 'Coach-IA',
    'coach.subtitle': 'Tu coach personal para relaciones y emociones',
    'coach.relationshipStatus': 'Tu estado de relación:',
    'coach.single': 'Soltero',
    'coach.relationship': 'En relación',
    'coach.separated': 'Separado',
    'coach.online': 'En línea',
    'coach.inputPlaceholder': 'Escribe tu mensaje aquí...',
    'coach.quickTopics': 'Temas comunes para discutir:',
    
    // Emergency page
    'emergency.title': 'Apoyo de Emergencia',
    'emergency.subtitle': 'No estás solo. La ayuda está disponible.',
    'emergency.breathing': 'Ejercicio de Respiración',
    'emergency.breathingDesc': 'Tómate un momento para respirar y centrarte',
    'emergency.contacts': 'Contactos de Emergencia',
    'emergency.contactsDesc': 'La ayuda profesional está disponible 24/7',
    'emergency.breathingGuide': 'Sigue este patrón de respiración',
    'emergency.inhale': 'Inhala',
    'emergency.hold': 'Mantén',
    'emergency.exhale': 'Exhala',
    
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
    
    // Features
    'features.title': '您的健康之旅',
    'features.moodTracking': '每日情绪跟踪',
    'features.moodTrackingDesc': '跟踪您的情绪模式并获得个性化见解',
    'features.aiCoach': 'AI驱动的教练',
    'features.aiCoachDesc': '获得个性化的关系建议和沟通技巧',
    'features.roleplay': '练习对话',
    'features.roleplayDesc': '安全的空间来练习困难的对话和场景',
    'features.resources': '自助资源',
    'features.resourcesDesc': '访问文章、练习和个人成长工具',
    
    // Check-in page
    'checkin.title': '每日签到',
    'checkin.subtitle': '您今天感觉如何？',
    'checkin.mood': '您的心情',
    'checkin.reflection': '您的反思',
    'checkin.reflectionPlaceholder': '分享您对今天的想法...',
    'checkin.submit': '提交签到',
    'checkin.success': '签到保存成功！',
    
    // Coach page
    'coach.title': 'AI教练',
    'coach.subtitle': '您的关系和情感个人教练',
    'coach.relationshipStatus': '您的关系状态：',
    'coach.single': '单身',
    'coach.relationship': '恋爱中',
    'coach.separated': '分居',
    'coach.online': '在线',
    'coach.inputPlaceholder': '在此输入您的消息...',
    'coach.quickTopics': '常见讨论话题：',
    
    // Emergency page
    'emergency.title': '紧急支持',
    'emergency.subtitle': '您并不孤单。帮助随时可用。',
    'emergency.breathing': '呼吸练习',
    'emergency.breathingDesc': '花一点时间呼吸并让自己平静下来',
    'emergency.contacts': '紧急联系人',
    'emergency.contactsDesc': '专业帮助24/7可用',
    'emergency.breathingGuide': '跟随这个呼吸模式',
    'emergency.inhale': '吸气',
    'emergency.hold': '屏住',
    'emergency.exhale': '呼气',
    
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
    
    // Features
    'features.title': 'Din resa till bättre välbefinnande',
    'features.moodTracking': 'Daglig humörspårning',
    'features.moodTrackingDesc': 'Spåra dina emotionella mönster och få personliga insikter',
    'features.aiCoach': 'AI-driven Coach',
    'features.aiCoachDesc': 'Få personliga relationsråd och kommunikationstips',
    'features.roleplay': 'Öva konversationer',
    'features.roleplayDesc': 'Säker plats att öva svåra konversationer och scenarier',
    'features.resources': 'Självhjälpsresurser',
    'features.resourcesDesc': 'Få tillgång till artiklar, övningar och verktyg för personlig utveckling',
    
    // Check-in page
    'checkin.title': 'Daglig incheckning',
    'checkin.subtitle': 'Hur mår du idag?',
    'checkin.mood': 'Ditt humör',
    'checkin.reflection': 'Din reflektion',
    'checkin.reflectionPlaceholder': 'Dela dina tankar om idag...',
    'checkin.submit': 'Skicka incheckning',
    'checkin.success': 'Incheckning sparad framgångsrikt!',
    
    // Coach page
    'coach.title': 'AI-Coach',
    'coach.subtitle': 'Din personliga coach för relationer och känslor',
    'coach.relationshipStatus': 'Din relationsstatus:',
    'coach.single': 'Singel',
    'coach.relationship': 'I förhållande',
    'coach.separated': 'Separerad',
    'coach.online': 'Online',
    'coach.inputPlaceholder': 'Skriv ditt meddelande här...',
    'coach.quickTopics': 'Vanliga ämnen att diskutera:',
    
    // Emergency page
    'emergency.title': 'Akutstöd',
    'emergency.subtitle': 'Du är inte ensam. Hjälp finns tillgänglig.',
    'emergency.breathing': 'Andningsövning',
    'emergency.breathingDesc': 'Ta en stund att andas och centrera dig själv',
    'emergency.contacts': 'Akutkontakter',
    'emergency.contactsDesc': 'Professionell hjälp finns tillgänglig 24/7',
    'emergency.breathingGuide': 'Följ detta andningsmönster',
    'emergency.inhale': 'Andas in',
    'emergency.hold': 'Håll',
    'emergency.exhale': 'Andas ut',
    
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
    'common.selectLanguage': 'Välj språk'
  },
  // Adding placeholder translations for other languages (shortened for brevity)
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
    'common.selectLanguage': 'Selecionar Idioma'
  },
  bn: {
    'nav.home': 'হোম',
    'nav.checkin': 'চেক-ইন',
    'nav.coach': 'এআই কোচ',
    'nav.roleplay': 'রোলপ্লে',
    'nav.resources': 'রিসোর্স',
    'nav.emergency': 'জরুরি',
    'home.title': 'অরা তে স্বাগতম',
    'home.subtitle': 'আবেগগত এবং সম্পর্কগত স্বাস্থ্যের জন্য আপনার ব্যক্তিগত সাথী',
    'common.language': 'ভাষা',
    'common.selectLanguage': 'ভাষা নির্বাচন করুন'
  },
  ru: {
    'nav.home': 'Главная',
    'nav.checkin': 'Чек-ин',
    'nav.coach': 'ИИ Тренер',
    'nav.roleplay': 'Ролевая игра',
    'nav.resources': 'Ресурсы',
    'nav.emergency': 'Экстренная помощь',
    'home.title': 'Добро пожаловать в Aura',
    'home.subtitle': 'Ваш личный компаньон для эмоционального и отношенческого здоровья',
    'common.language': 'Язык',
    'common.selectLanguage': 'Выбрать язык'
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.checkin': 'チェックイン',
    'nav.coach': 'AIコーチ',
    'nav.roleplay': 'ロールプレイ',
    'nav.resources': 'リソース',
    'nav.emergency': '緊急事態',
    'home.title': 'Auraへようこそ',
    'home.subtitle': '感情的および関係的健康のための個人的なコンパニオン',
    'common.language': '言語',
    'common.selectLanguage': '言語を選択'
  },
  pa: {
    'nav.home': 'ਘਰ',
    'nav.checkin': 'ਚੈੱਕ-ਇਨ',
    'nav.coach': 'AI ਕੋਚ',
    'nav.roleplay': 'ਰੋਲਪਲੇ',
    'nav.resources': 'ਸਰੋਤ',
    'nav.emergency': 'ਐਮਰਜੈਂਸੀ',
    'home.title': 'Aura ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
    'home.subtitle': 'ਭਾਵਨਾਤਮਕ ਅਤੇ ਰਿਸ਼ਤਿਆਂ ਦੀ ਸਿਹਤ ਲਈ ਤੁਹਾਡਾ ਨਿੱਜੀ ਸਾਥੀ',
    'common.language': 'ਭਾਸ਼ਾ',
    'common.selectLanguage': 'ਭਾਸ਼ਾ ਚੁਣੋ'
  },
  de: {
    'nav.home': 'Startseite',
    'nav.checkin': 'Check-in',
    'nav.coach': 'KI-Coach',
    'nav.roleplay': 'Rollenspiel',
    'nav.resources': 'Ressourcen',
    'nav.emergency': 'Notfall',
    'home.title': 'Willkommen bei Aura',
    'home.subtitle': 'Ihr persönlicher Begleiter für emotionale und Beziehungsgesundheit',
    'common.language': 'Sprache',
    'common.selectLanguage': 'Sprache auswählen'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.checkin': 'Check-in',
    'nav.coach': 'Coach IA',
    'nav.roleplay': 'Jeu de rôle',
    'nav.resources': 'Ressources',
    'nav.emergency': 'Urgence',
    'home.title': 'Bienvenue dans Aura',
    'home.subtitle': 'Votre compagnon personnel pour la santé émotionnelle et relationnelle',
    'common.language': 'Langue',
    'common.selectLanguage': 'Sélectionner la langue'
  },
  tr: {
    'nav.home': 'Ana Sayfa',
    'nav.checkin': 'Giriş',
    'nav.coach': 'Yapay Zeka Koçu',
    'nav.roleplay': 'Rol Yapma',
    'nav.resources': 'Kaynaklar',
    'nav.emergency': 'Acil Durum',
    'home.title': 'Aura\'ya Hoş Geldiniz',
    'home.subtitle': 'Duygusal ve ilişkisel sağlık için kişisel arkadaşınız',
    'common.language': 'Dil',
    'common.selectLanguage': 'Dil Seçin'
  },
  vi: {
    'nav.home': 'Trang chủ',
    'nav.checkin': 'Đăng ký',
    'nav.coach': 'HLV AI',
    'nav.roleplay': 'Đóng vai',
    'nav.resources': 'Tài nguyên',
    'nav.emergency': 'Khẩn cấp',
    'home.title': 'Chào mừng đến với Aura',
    'home.subtitle': 'Người bạn đồng hành cá nhân cho sức khỏe cảm xúc và mối quan hệ',
    'common.language': 'Ngôn ngữ',
    'common.selectLanguage': 'Chọn ngôn ngữ'
  },
  ko: {
    'nav.home': '홈',
    'nav.checkin': '체크인',
    'nav.coach': 'AI 코치',
    'nav.roleplay': '역할극',
    'nav.resources': '리소스',
    'nav.emergency': '응급상황',
    'home.title': 'Aura에 오신 것을 환영합니다',
    'home.subtitle': '감정적, 관계적 건강을 위한 개인 동반자',
    'common.language': '언어',
    'common.selectLanguage': '언어 선택'
  },
  it: {
    'nav.home': 'Home',
    'nav.checkin': 'Check-in',
    'nav.coach': 'Coach IA',
    'nav.roleplay': 'Gioco di ruolo',
    'nav.resources': 'Risorse',
    'nav.emergency': 'Emergenza',
    'home.title': 'Benvenuto in Aura',
    'home.subtitle': 'Il tuo compagno personale per la salute emotiva e relazionale',
    'common.language': 'Lingua',
    'common.selectLanguage': 'Seleziona lingua'
  },
  ur: {
    'nav.home': 'ہوم',
    'nav.checkin': 'چیک-ان',
    'nav.coach': 'AI کوچ',
    'nav.roleplay': 'رول پلے',
    'nav.resources': 'وسائل',
    'nav.emergency': 'ہنگامی',
    'home.title': 'Aura میں خوش آمدید',
    'home.subtitle': 'جذباتی اور رشتہ دار صحت کے لیے آپ کا ذاتی ساتھی',
    'common.language': 'زبان',
    'common.selectLanguage': 'زبان منتخب کریں'
  },
  fa: {
    'nav.home': 'خانه',
    'nav.checkin': 'چک-این',
    'nav.coach': 'مربی هوش مصنوعی',
    'nav.roleplay': 'ایفای نقش',
    'nav.resources': 'منابع',
    'nav.emergency': 'اورژانس',
    'home.title': 'به Aura خوش آمدید',
    'home.subtitle': 'همراه شخصی شما برای سلامت عاطفی و روابط',
    'common.language': 'زبان',
    'common.selectLanguage': 'انتخاب زبان'
  },
  sw: {
    'nav.home': 'Nyumbani',
    'nav.checkin': 'Kuingia',
    'nav.coach': 'Kocha wa AI',
    'nav.roleplay': 'Kucheza jukumu',
    'nav.resources': 'Rasilimali',
    'nav.emergency': 'Dharura',
    'home.title': 'Karibu Aura',
    'home.subtitle': 'Mwenzako wa kibinafsi kwa afya ya kihisia na mahusiano',
    'common.language': 'Lugha',
    'common.selectLanguage': 'Chagua lugha'
  },
  tl: {
    'nav.home': 'Home',
    'nav.checkin': 'Check-in',
    'nav.coach': 'AI Coach',
    'nav.roleplay': 'Roleplay',
    'nav.resources': 'Resources',
    'nav.emergency': 'Emergency',
    'home.title': 'Maligayang pagdating sa Aura',
    'home.subtitle': 'Ang inyong personal na kasama para sa emotional at relational health',
    'common.language': 'Wika',
    'common.selectLanguage': 'Pumili ng wika'
  },
  no: {
    'nav.home': 'Hjem',
    'nav.checkin': 'Innsjekking',
    'nav.coach': 'AI-trener',
    'nav.roleplay': 'Rollespill',
    'nav.resources': 'Ressurser',
    'nav.emergency': 'Nødsituasjon',
    'home.title': 'Velkommen til Aura',
    'home.subtitle': 'Din personlige følgesvenn for emosjonell og relasjonell helse',
    'common.language': 'Språk',
    'common.selectLanguage': 'Velg språk'
  }
};