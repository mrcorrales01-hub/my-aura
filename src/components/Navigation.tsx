import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Menu, 
  X, 
  Heart, 
  MessageCircle, 
  Video, 
  BookOpen, 
  PenTool,
  Target,
  Users,
  FileText,
  Settings,
  Home
} from 'lucide-react';

export const Navigation = () => {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuthContext();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    ...(user ? [
      { href: '/dashboard', label: t('nav.dashboard'), icon: Heart },
      { href: '/coach', label: t('nav.coach'), icon: MessageCircle },
      { href: '/live', label: t('nav.live'), icon: Video },
      { href: '/exercises', label: t('nav.exercises'), icon: BookOpen },
      { href: '/journal', label: t('nav.journal'), icon: PenTool },
      { href: '/goals', label: t('nav.goals'), icon: Target },
      { href: '/relationships', label: t('nav.relationships'), icon: Users },
      { href: '/resources', label: t('nav.resources'), icon: FileText },
      { href: '/settings', label: t('nav.settings'), icon: Settings },
    ] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-wellness flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">{t('app.name')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user ? (
              <Button onClick={signOut} variant="outline" size="sm">
                {t('auth.logout')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;