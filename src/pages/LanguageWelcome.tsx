import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/hooks/useLanguage';

const LanguageWelcome = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // If user has already selected a language, redirect to home
    const savedLanguage = localStorage.getItem('aura-language');
    if (savedLanguage && savedLanguage !== 'en') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <LanguageSelector variant="card" />
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/')}
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