import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LanguageProvider } from "./hooks/useLanguage";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkin from "./pages/Checkin";
import Coach from "./pages/Coach";
import Roleplay from "./pages/Roleplay";
import Resources from "./pages/Resources";
import Emergency from "./pages/Emergency";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import LanguageWelcome from "./pages/LanguageWelcome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <Navigation />
              <main className="lg:pl-0">
                <Routes>
                  <Route path="/welcome" element={<LanguageWelcome />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/checkin" element={<Checkin />} />
                  <Route path="/coach" element={<Coach />} />
                  <Route path="/roleplay" element={<Roleplay />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
