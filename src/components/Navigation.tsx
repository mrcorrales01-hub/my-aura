import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Heart, MessageCircle, Users, BookOpen, AlertTriangle, User, CreditCard, Settings, LogOut, Video, BarChart2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GlobalLanguageSelector } from "./GlobalLanguageSelector";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTranslations } from "@/hooks/useTranslations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Navigation items configuration
const getNavigationItems = (t: (key: string) => string) => [
  { icon: Home, label: t("nav.home"), path: "/" },
  { icon: BarChart2, label: t("nav.dashboard"), path: "/dashboard", requiresAuth: true },
  { icon: Heart, label: t("nav.checkin"), path: "/checkin", requiresAuth: true },
  { icon: MessageCircle, label: t("nav.coach"), path: "/coach", requiresAuth: true },
  { icon: Video, label: t("nav.therapy"), path: "/therapy", requiresAuth: true },
  { icon: Users, label: t("nav.roleplay"), path: "/roleplay", requiresAuth: true },
  { icon: BookOpen, label: t("nav.resources"), path: "/resources" },
  { icon: AlertTriangle, label: t("nav.emergency"), path: "/emergency", destructive: true },
];

// Navigation content component
const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslations();
  
  const navigationItems = getNavigationItems(t);
  
  return (
    <nav className="flex-1 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
        const isDisabled = item.requiresAuth && !user;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={isDisabled ? "pointer-events-none" : ""}
            onClick={() => { if (onNavigate) onNavigate(); }}
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${item.destructive ? "text-destructive hover:text-destructive" : ""} ${isDisabled ? "opacity-50" : ""}`}
              disabled={isDisabled}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
              {isDisabled && <span className="ml-auto text-xs">{t("nav.loginRequired")}</span>}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { subscribed, subscription_tier } = useSubscription();
  const { t } = useTranslations();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button onClick={() => navigate('/auth')} size="sm">
        {t("nav.signIn")}
      </Button>
    );
  }

  const initials = user.email?.split('@')[0].slice(0, 2).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover z-50 shadow-md" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.email}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {subscribed ? `${subscription_tier} ${t("nav.plan")}` : t("nav.freePlan")}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("nav.settings")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/pricing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>{t("nav.subscription")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("nav.signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-sidebar lg:border-r lg:border-sidebar-border">
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg mr-3" />
            <span className="text-xl font-bold text-sidebar-foreground">Aura</span>
          </div>
          
          {/* Navigation */}
          <NavContent />
          
          {/* Language Selector and User Menu */}
          <div className="mt-auto pt-4 border-t border-sidebar-border space-y-4">
            <GlobalLanguageSelector variant="button" />
            <UserMenu />
          </div>
        </div>
      </aside>

      {/* Mobile Navigation - Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-primary rounded mr-2" />
            <span className="text-lg font-bold text-foreground">Aura</span>
          </div>
          
          {/* Mobile Menu */}
          <div className="flex items-center space-x-2">
            <GlobalLanguageSelector variant="compact" />
            <UserMenu />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-6 bg-background z-50">
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-8">
                    <div className="w-6 h-6 bg-gradient-primary rounded mr-2" />
                    <span className="text-lg font-bold">Aura</span>
                  </div>
                  <NavContent onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      
    </>
  );
};

export default Navigation;