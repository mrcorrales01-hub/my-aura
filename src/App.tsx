import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LanguageProvider } from "./hooks/useLanguage";
import { GlobalLanguageProvider } from "./hooks/useGlobalLocalization";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkin from "./pages/Checkin";
import Coach from "./pages/Coach";
import Therapy from "./pages/Therapy";
import Roleplay from "./pages/Roleplay";
import Resources from "./pages/Resources";
import Emergency from "./pages/Emergency";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import LanguageWelcome from "./pages/LanguageWelcome";
import GlobalWelcome from "./pages/GlobalWelcome";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <GlobalLanguageProvider>
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <SubscriptionProvider>
                  <BrowserRouter>
                    <Navigation />
                    <main className="lg:pl-0">
                      <Routes>
                        <Route path="/global-welcome" element={<ErrorBoundaryWrapper><GlobalWelcome /></ErrorBoundaryWrapper>} />
                        <Route path="/welcome" element={<ErrorBoundaryWrapper><LanguageWelcome /></ErrorBoundaryWrapper>} />
                        <Route path="/" element={<ErrorBoundaryWrapper><Index /></ErrorBoundaryWrapper>} />
                        <Route path="/auth" element={<ErrorBoundaryWrapper><Auth /></ErrorBoundaryWrapper>} />
                        <Route path="/checkin" element={<ErrorBoundaryWrapper><Checkin /></ErrorBoundaryWrapper>} />
                        <Route path="/coach" element={<ErrorBoundaryWrapper><Coach /></ErrorBoundaryWrapper>} />
                        <Route path="/therapy" element={<ErrorBoundaryWrapper><Therapy /></ErrorBoundaryWrapper>} />
                        <Route path="/roleplay" element={<ErrorBoundaryWrapper><Roleplay /></ErrorBoundaryWrapper>} />
                        <Route path="/resources" element={<ErrorBoundaryWrapper><Resources /></ErrorBoundaryWrapper>} />
                        <Route path="/emergency" element={<ErrorBoundaryWrapper><Emergency /></ErrorBoundaryWrapper>} />
                        <Route path="/pricing" element={<ErrorBoundaryWrapper><Pricing /></ErrorBoundaryWrapper>} />
                        <Route path="/settings" element={<ErrorBoundaryWrapper><Settings /></ErrorBoundaryWrapper>} />
                        <Route path="/success" element={<ErrorBoundaryWrapper><PaymentSuccess /></ErrorBoundaryWrapper>} />
                        <Route path="/cancel" element={<ErrorBoundaryWrapper><PaymentCancel /></ErrorBoundaryWrapper>} />
                        <Route path="/dashboard" element={<ErrorBoundaryWrapper><Dashboard /></ErrorBoundaryWrapper>} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<ErrorBoundaryWrapper><NotFound /></ErrorBoundaryWrapper>} />
                      </Routes>
                    </main>
                    <PWAInstallPrompt />
                  </BrowserRouter>
                </SubscriptionProvider>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </GlobalLanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
