import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Home,
  MessageCircle,
  Heart,
  BookOpen,
  Target,
  Dumbbell,
  AlertTriangle,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const navigationItems = [
  { path: '/', icon: Home, key: 'home' },
  { path: '/chat', icon: MessageCircle, key: 'chat' },
  { path: '/mood', icon: Heart, key: 'mood' },
  { path: '/journal', icon: BookOpen, key: 'journal' },
  { path: '/plan', icon: Target, key: 'plan' },
  { path: '/exercises', icon: Dumbbell, key: 'exercises' },
  { path: '/crisis', icon: AlertTriangle, key: 'crisis', badge: true },
  { path: '/therapists', icon: Users, key: 'therapists' },
  { path: '/settings', icon: Settings, key: 'settings' }
];

export const AppNavigation = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { signOut, user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-lg">My Aura</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(({ path, icon: Icon, key, badge }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "relative",
                    location.pathname === path && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {t(`nav.${key}`)}
                  {badge && key === 'crisis' && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      24/7
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-4 gap-2">
            {navigationItems.slice(0, 8).map(({ path, icon: Icon, key, badge }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full flex flex-col h-auto py-2",
                    location.pathname === path && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs truncate">{t(`nav.${key}`)}</span>
                  {badge && key === 'crisis' && (
                    <Badge variant="destructive" className="mt-1 text-xs px-1 py-0">
                      24/7
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};