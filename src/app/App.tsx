import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import '@/lib/i18n'; // Initialize i18n

// Layout components
import AppLayout from "@/app/layout/AppLayout";

// Pages
import AuraHome from "@/pages/AuraHome";
import AuriChat from "@/pages/AuriChat";
import MoodPage from "@/pages/MoodPage";
import JournalPage from "@/pages/JournalPage";
import PlanPage from "@/pages/PlanPage";
import ExercisesPage from "@/pages/ExercisesPage";
import CrisisPage from "@/pages/CrisisPage";
import TherapistsPage from "@/pages/TherapistsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<AuraHome />} />
                <Route path="chat" element={<AuriChat />} />
                <Route path="mood" element={<MoodPage />} />
                <Route path="journal" element={<JournalPage />} />
                <Route path="plan" element={<PlanPage />} />
                <Route path="exercises" element={<ExercisesPage />} />
                <Route path="crisis" element={<CrisisPage />} />
                <Route path="therapists" element={<TherapistsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;