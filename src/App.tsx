import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Checkin from "./pages/Checkin";
import Coach from "./pages/Coach";
import Roleplay from "./pages/Roleplay";
import Resources from "./pages/Resources";
import Emergency from "./pages/Emergency";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <main className="lg:pl-0">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/roleplay" element={<Roleplay />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/emergency" element={<Emergency />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
