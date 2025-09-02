import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import LanguageSelector22 from '@/components/LanguageSelector22';
import { 
  MessageCircle, 
  Calendar, 
  Users, 
  Sparkles, 
  User, 
  Menu, 
  X,
  Heart,
  Shield,
  Music,
  Video
} from 'lucide-react';

const AuraNavigation = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: t('nav.home'), path: '/', icon: MessageCircle, color: 'text-aura-primary' },
    { name: t('auri.title', 'Auri'), path: '/auri', icon: Sparkles, color: 'text-aura-secondary' },
    { name: t('roleplay.title', 'Roleplay'), path: '/roleplay', icon: Users, color: 'text-aura-growth' },
    { name: t('nav.music'), path: '/music', icon: Music, color: 'text-purple-500' },
    { name: t('nav.videos'), path: '/videos', icon: Video, color: 'text-blue-500' },
    { name: t('nav.community'), path: '/community', icon: Users, color: 'text-aura-growth' },
    { name: t('nav.profile'), path: '/profile', icon: User, color: 'text-aura-warm' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden md:flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-aura-gradient flex items-center justify-center aura-glow">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-aura-primary">Aura</span>
            <Badge variant="secondary" className="text-xs bg-aura-secondary/20 text-aura-secondary border-0">
              {t('nav.aiCoach')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Button
                key={item.name}
                asChild
                variant={active ? "default" : "ghost"}
                className={`relative transition-all duration-300 ${
                  active 
                    ? 'bg-aura-primary text-white shadow-aura' 
                    : 'hover:bg-aura-calm text-foreground/70 hover:text-aura-primary'
                }`}
              >
                <Link to={item.path}>
                  <Icon className={`w-4 h-4 mr-2 ${active ? 'text-white' : item.color}`} />
                  {item.name}
                  {active && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-aura-primary rounded-full" />
                  )}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSelector22 />
          <Button variant="outline" size="sm" className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white">
            <Shield className="w-4 h-4 mr-2" />
            {t('nav.crisisSupport')}
          </Button>
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Card className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-aura-gradient flex items-center justify-center aura-glow">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-aura-primary">Aura</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-aura-primary"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </Card>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <Card className="absolute top-20 left-4 right-4 z-50 p-4 bg-white/95 backdrop-blur-sm border-0 shadow-aura animate-fade-in">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start transition-all duration-300 ${
                      active 
                        ? 'bg-aura-primary text-white shadow-aura' 
                        : 'hover:bg-aura-calm text-foreground/70 hover:text-aura-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to={item.path}>
                      <Icon className={`w-4 h-4 mr-3 ${active ? 'text-white' : item.color}`} />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
              
              <hr className="my-3 border-aura-calm" />
              
              <LanguageSelector22 />
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4 mr-3" />
                {t('nav.crisisSupport')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default AuraNavigation;