import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserPreferencesProvider } from "@/providers/UserPreferencesProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/app/Layout";
import DebugPanel from "@/health/DebugPanel";

// Pages
import NewAuraHome from "@/components/NewAuraHome";
import AuriChat from "@/pages/AuriChat";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Health from "@/pages/Health";
import CrisisPage from "@/pages/CrisisPage";
import Roleplay from "@/components/Roleplay";

const queryClient = new QueryClient();

const NewApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <UserPreferencesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={
                      <Layout>
                        <Routes>
                          <Route path="/" element={<NewAuraHome />} />
                          <Route path="/chat" element={<AuriChat />} />
                          <Route path="/roleplay" element={<Roleplay />} />
                          <Route path="/crisis" element={<CrisisPage />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/health" element={<Health />} />
                          <Route path="/profile" element={<div className="p-6 text-center">Profile page coming soon</div>} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    } />
                  </Routes>
                </BrowserRouter>
                <DebugPanel />
              </TooltipProvider>
            </UserPreferencesProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default NewApp;