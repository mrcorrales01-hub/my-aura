import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  AlertTriangle,
  Menu,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { t } = useLanguage();
  
  const navigationItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: BarChart3, label: t('nav.checkin'), path: "/checkin" },
    { icon: MessageCircle, label: t('nav.coach'), path: "/coach" },
    { icon: Heart, label: t('nav.roleplay'), path: "/roleplay" },
    { icon: BookOpen, label: t('nav.resources'), path: "/resources" },
    { icon: AlertTriangle, label: t('nav.emergency'), path: "/emergency" }
  ];

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.path;
        const isEmergency = item.path === "/emergency";
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant={isEmergency ? "destructive" : isActive ? "wellness" : "ghost"}
              className={`w-full justify-start gap-3 h-12 ${
                isEmergency ? "animate-pulse" : ""
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Aura
          </h1>
          <p className="text-sm text-muted-foreground">Din personliga guide</p>
        </div>
        <NavContent />
        <div className="mt-auto">
          <LanguageSelector />
        </div>
      </aside>

      {/* Mobile Navigation */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-sm border-b border-border z-50 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Aura
        </h1>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <p className="text-sm text-muted-foreground">Välj vart du vill gå</p>
              </div>
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </header>

      {/* Mobile spacing */}
      <div className="lg:hidden h-16" />
      {/* Desktop spacing */}
      <div className="hidden lg:block w-64" />
    </>
  );
};

export default Navigation;