import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { I18nProvider } from "@/hooks/useI18n";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserPreferencesProvider } from "@/providers/UserPreferencesProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SkipLink from "@/components/SkipLink";
import ScrollToTop from "@/components/ScrollToTop";
import AuraNavigation from "@/components/AuraNavigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Aura App Pages
import AuraHome from "@/components/AuraHome";
import AuriChat from "@/components/AuriChat";
import MyPlan from "@/components/MyPlan";
import MoodTracker from "@/components/MoodTracker";
import DailyQuests from "@/components/DailyQuests";
import RoleplaySimulator from "@/components/RoleplaySimulator";
import DailyCheckin from "@/components/DailyCheckin";
import CrisisSupport from "@/components/CrisisSupport";

// Legacy Pages (for compatibility)
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Coach from "@/pages/Coach";
import LiveSession from "@/pages/LiveSession";
import Exercises from "@/pages/Exercises";
import Journal from "@/pages/Journal";
import Goals from "@/pages/Goals";
import Relationships from "@/pages/Relationships";
import Resources from "@/pages/Resources";
import Emergency from "@/pages/Emergency";
import Pricing from "@/pages/Pricing";
import Settings from "@/pages/Settings";
import LanguageWelcome from "@/pages/LanguageWelcome";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import NotFound from "@/pages/NotFound";
import TherapistDashboard from "@/components/therapy/TherapistDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <ThemeProvider>
            <SubscriptionProvider>
              <UserPreferencesProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <main className="min-h-screen bg-calm-gradient">
                      <SkipLink />
                      <div className="container mx-auto px-4 py-6 space-y-6">
                        <AuraNavigation />
                        <Routes>
                          {/* Aura Mental Health App Routes */}
                          <Route path="/" element={<AuraHome />} />
                          <Route path="/chat" element={<AuriChat />} />
                          <Route path="/plan" element={<MyPlan />} />
                          <Route path="/mood" element={<MoodTracker />} />
                          <Route path="/quests" element={<DailyQuests />} />
                          <Route path="/roleplay" element={<RoleplaySimulator />} />
                          <Route path="/crisis" element={<CrisisSupport />} />
                          <Route path="/community" element={
                            <div className="flex items-center justify-center min-h-[60vh]">
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-aura-gradient rounded-full flex items-center justify-center">
                                  <span className="text-2xl">👥</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-aura-primary">Community</h2>
                                <p className="text-foreground/70 max-w-md">
                                  Peer support groups, buddy system, and wellness events coming soon.
                                </p>
                              </div>
                            </div>
                          } />
                          <Route path="/tools" element={
                            <div className="flex items-center justify-center min-h-[60vh]">
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-aura-gradient rounded-full flex items-center justify-center">
                                  <span className="text-2xl">✨</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-aura-primary">Growth Tools</h2>
                                <p className="text-foreground/70 max-w-md">
                                  Meditation, breathing exercises, journaling, and mindfulness tools coming soon.
                                </p>
                              </div>
                            </div>
                          } />
                          <Route path="/profile" element={
                            <div className="flex items-center justify-center min-h-[60vh]">
                              <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-aura-gradient rounded-full flex items-center justify-center">
                                  <span className="text-2xl">👤</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-aura-primary">Profile</h2>
                                <p className="text-foreground/70 max-w-md">
                                  Account settings, subscriptions, and personal preferences coming soon.
                                </p>
                              </div>
                            </div>
                          } />
                          
                          {/* Legacy Routes for Backwards Compatibility */}
                          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkin" element={<DailyCheckin />} />
          <Route path="/coach" element={<Coach />} />
                          <Route path="/live" element={<LiveSession />} />
                          <Route path="/exercises" element={<Exercises />} />
                          <Route path="/journal" element={<Journal />} />
                          <Route path="/goals" element={<Goals />} />
                          <Route path="/relationships" element={<Relationships />} />
                          <Route path="/resources" element={<Resources />} />
                          <Route path="/emergency" element={<Emergency />} />
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/language" element={<LanguageWelcome />} />
                          <Route path="/success" element={<PaymentSuccess />} />
                          <Route path="/cancel" element={<PaymentCancel />} />
                          <Route path="/therapist" element={<TherapistDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                      <ScrollToTop />
                    </main>
                    <PWAInstallPrompt />
                  </BrowserRouter>
                </TooltipProvider>
              </UserPreferencesProvider>
            </SubscriptionProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;