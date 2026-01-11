import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 2 minutes - reduces redundant API calls
      staleTime: 1000 * 60 * 2,
      // Cache persists for 10 minutes - good for memory management
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Refetch when reconnecting to network
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

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
            </BrowserRouter>
          </TooltipProvider>
        </OnlinePresenceProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
