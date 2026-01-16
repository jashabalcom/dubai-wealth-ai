import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnlinePresenceProvider } from "@/contexts/OnlinePresenceContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothScrollHandler } from "@/components/SmoothScrollHandler";
import { NavigationProgress } from "@/components/NavigationProgress";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { TrialBannerWrapper } from "@/components/TrialBannerWrapper";
import { EmailVerificationBanner } from "@/components/freemium/EmailVerificationBanner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { SkipNavigation, RouteAnnouncer } from "@/components/a11y/SkipNavigation";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { AISupportChat } from "@/components/support/AISupportChat";
import { queryClient } from "@/lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
        <OnlinePresenceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineBanner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <SkipNavigation />
              <RouteAnnouncer />
              <GoogleAnalytics />
              <NavigationProgress />
              <ScrollToTop />
              <SmoothScrollHandler />
              <EmailVerificationBanner />
              <TrialBannerWrapper />
              <AnimatedRoutes />
              <CookieConsent />
              <InstallPrompt />
              <FeedbackWidget />
              <AISupportChat />
            </BrowserRouter>
          </TooltipProvider>
        </OnlinePresenceProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
