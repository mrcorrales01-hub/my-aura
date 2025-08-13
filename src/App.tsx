import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { I18nProvider } from "./hooks/useI18n";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Coach from "./pages/Coach";
import LiveSession from "./pages/LiveSession";
import Exercises from "./pages/Exercises";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Relationships from "./pages/Relationships";
import Resources from "./pages/Resources";
import Emergency from "./pages/Emergency";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import LanguageWelcome from "./pages/LanguageWelcome";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";
import SkipLink from "./components/SkipLink";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SubscriptionProvider>
                <BrowserRouter>
                  <SkipLink href="#site-main" />
                  <Navigation />
                  <ScrollToTop />
                  <main id="site-main" className="pt-16 lg:pt-0 lg:pl-64" role="main">
                    <Routes>
                      <Route path="/language" element={<ErrorBoundaryWrapper><LanguageWelcome /></ErrorBoundaryWrapper>} />
                      <Route path="/" element={<ErrorBoundaryWrapper><Index /></ErrorBoundaryWrapper>} />
                      <Route path="/auth" element={<ErrorBoundaryWrapper><Auth /></ErrorBoundaryWrapper>} />
                      <Route path="/dashboard" element={<ErrorBoundaryWrapper><Dashboard /></ErrorBoundaryWrapper>} />
                      <Route path="/coach" element={<ErrorBoundaryWrapper><Coach /></ErrorBoundaryWrapper>} />
                      <Route path="/live" element={<ErrorBoundaryWrapper><LiveSession /></ErrorBoundaryWrapper>} />
                      <Route path="/exercises" element={<ErrorBoundaryWrapper><Exercises /></ErrorBoundaryWrapper>} />
                      <Route path="/journal" element={<ErrorBoundaryWrapper><Journal /></ErrorBoundaryWrapper>} />
                      <Route path="/goals" element={<ErrorBoundaryWrapper><Goals /></ErrorBoundaryWrapper>} />
                      <Route path="/relationships" element={<ErrorBoundaryWrapper><Relationships /></ErrorBoundaryWrapper>} />
                      <Route path="/resources" element={<ErrorBoundaryWrapper><Resources /></ErrorBoundaryWrapper>} />
                      <Route path="/emergency" element={<ErrorBoundaryWrapper><Emergency /></ErrorBoundaryWrapper>} />
                      <Route path="/pricing" element={<ErrorBoundaryWrapper><Pricing /></ErrorBoundaryWrapper>} />
                      <Route path="/settings" element={<ErrorBoundaryWrapper><Settings /></ErrorBoundaryWrapper>} />
                      <Route path="/success" element={<ErrorBoundaryWrapper><PaymentSuccess /></ErrorBoundaryWrapper>} />
                      <Route path="/cancel" element={<ErrorBoundaryWrapper><PaymentCancel /></ErrorBoundaryWrapper>} />
                      <Route path="*" element={<ErrorBoundaryWrapper><NotFound /></ErrorBoundaryWrapper>} />
                    </Routes>
                  </main>
                  <PWAInstallPrompt />
                </BrowserRouter>
              </SubscriptionProvider>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
