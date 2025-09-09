import { Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { HeaderNav } from '@/components/HeaderNav';
import { HeaderAuthStatus } from '@/components/HeaderAuthStatus';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation(['common', 'nav', 'auth']);
  const { user, signOut } = useAuthContext();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg">
        Skip to main content
      </a>
      
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              <Heart className="h-5 w-5 text-primary" />
              {t('common:appName')}
            </Link>

            {/* Navigation */}
            <HeaderNav />

            {/* Right side */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <HeaderAuthStatus />
              
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Link to="/crisis">
                  {t('nav:crisis')}
                </Link>
              </Button>
              
              {user && (
                <Button 
                  onClick={handleSignOut} 
                  variant="ghost" 
                  size="sm"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {t('auth:logout')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};