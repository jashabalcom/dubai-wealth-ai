import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnlinePresenceProvider } from "@/contexts/OnlinePresenceContext";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothScrollHandler } from "@/components/SmoothScrollHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnlinePresenceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
  <BrowserRouter>
    <ScrollToTop />
    <SmoothScrollHandler />
    <AnimatedRoutes />
  </BrowserRouter>
        </TooltipProvider>
      </OnlinePresenceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
