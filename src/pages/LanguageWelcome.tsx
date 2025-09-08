import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/hooks/useI18n';

const LanguageWelcome = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useI18n();

  useEffect(() => {
    // If user has already selected a language, redirect to home
    const savedLanguage = localStorage.getItem('aura-language');
    if (savedLanguage && savedLanguage !== 'en') {
      navigate('/');
    }
  }, [navigate]);

  const handleLanguageSelect = () => {
    localStorage.setItem('aura-language-selected', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <LanguageSwitcher />
        <div className="text-center mt-6">
          <button 
            onClick={handleLanguageSelect}
            className="text-foreground/60 hover:text-foreground transition-colors text-sm"
          >
            Continue with English →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageWelcome;