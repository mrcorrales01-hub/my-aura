import { Home, MessageCircle, Users, Shield, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export const HeaderNav = () => {
  const { t } = useTranslation('nav');
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: t('home'), color: 'text-primary' },
    { path: '/chat', icon: MessageCircle, label: t('auri'), color: 'text-blue-500' },
    { path: '/roleplay', icon: Users, label: t('roleplay'), color: 'text-green-500' },
    { path: '/profile', icon: User, label: t('profile'), color: 'text-purple-500' },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <Icon className={cn("h-4 w-4", isActive ? item.color : "text-muted-foreground")} />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};