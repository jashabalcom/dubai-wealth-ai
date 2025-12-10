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
import { NavigationProgress } from "@/components/NavigationProgress";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { TrialBannerWrapper } from "@/components/TrialBannerWrapper";
import { DevModeToggle } from "@/components/DevModeToggle";
import { DevModeProvider, useDevModeProvider } from "@/hooks/useDevMode";

const queryClient = new QueryClient();

function AppContent() {
  const devModeState = useDevModeProvider();
  
  return (
    <DevModeProvider value={devModeState}>
      <AuthProvider>
        <OnlinePresenceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GoogleAnalytics />
              <NavigationProgress />
              <ScrollToTop />
              <SmoothScrollHandler />
              <TrialBannerWrapper />
              <AnimatedRoutes />
              <CookieConsent />
              <DevModeToggle />
            </BrowserRouter>
          </TooltipProvider>
        </OnlinePresenceProvider>
      </AuthProvider>
    </DevModeProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
