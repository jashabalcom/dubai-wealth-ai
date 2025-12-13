import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Academy from "@/pages/Academy";
import Course from "@/pages/Course";
import Lesson from "@/pages/Lesson";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import SavedProperties from "@/pages/SavedProperties";
import Tools from "@/pages/Tools";
import ROICalculator from "@/pages/tools/ROICalculator";
import MortgageCalculator from "@/pages/tools/MortgageCalculator";
import RentVsBuyCalculator from "@/pages/tools/RentVsBuyCalculator";
import AirbnbCalculator from "@/pages/tools/AirbnbCalculator";
import StrVsLtrCalculator from "@/pages/tools/StrVsLtrCalculator";
import TotalCostCalculator from "@/pages/tools/TotalCostCalculator";
import AIAssistant from "@/pages/AIAssistant";
import Portfolio from "@/pages/Portfolio";
import Profile from "@/pages/Profile";
import GoldenVisaWizard from "@/pages/GoldenVisaWizard";
import Pricing from "@/pages/Pricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import MembershipFunnel from "@/pages/MembershipFunnel";
import EliteFunnel from "@/pages/EliteFunnel";
import CheckoutRedirect from "@/pages/CheckoutRedirect";
import Upgrade from "@/pages/Upgrade";
import ResetPassword from "@/pages/ResetPassword";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminLessons from "@/pages/admin/AdminLessons";
import AdminProperties from "@/pages/admin/AdminProperties";
import AdminAgents from "@/pages/admin/AdminAgents";
import AdminBrokerages from "@/pages/admin/AdminBrokerages";
import AdminDevelopers from "@/pages/admin/AdminDevelopers";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminRevenue from "@/pages/admin/AdminRevenue";
import AdminMarketing from "@/pages/admin/AdminMarketing";
import NotFound from "@/pages/NotFound";
import Disclaimer from "@/pages/Disclaimer";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";

// Community Hub Pages
import { CommunityLayout } from "@/components/community/CommunityLayout";
import DiscussionsPage from "@/pages/community/DiscussionsPage";
import EventsPage from "@/pages/community/EventsPage";
import MembersPage from "@/pages/community/MembersPage";
import ConnectionsPage from "@/pages/community/ConnectionsPage";
import MessagesPage from "@/pages/community/MessagesPage";

// Wrapper component for page transitions
function AnimatedPage({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
        <Route path="/auth" element={<AnimatedPage><Auth /></AnimatedPage>} />
        <Route path="/reset-password" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
        <Route path="/settings" element={<ProtectedRoute><AnimatedPage><Settings /></AnimatedPage></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AnimatedPage><Dashboard /></AnimatedPage>
            </ProtectedRoute>
          }
        />
        {/* Academy - Investor tier required */}
        <Route path="/academy" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><Academy /></AnimatedPage></ProtectedRoute>} />
        <Route path="/academy/:slug" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><Course /></AnimatedPage></ProtectedRoute>} />
        <Route path="/academy/:courseSlug/:lessonSlug" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><Lesson /></AnimatedPage></ProtectedRoute>} />
        
        {/* Properties - Public browse, saved requires auth */}
        <Route path="/properties" element={<AnimatedPage><Properties /></AnimatedPage>} />
        <Route path="/properties/:slug" element={<AnimatedPage><PropertyDetail /></AnimatedPage>} />
        <Route path="/properties/saved" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><SavedProperties /></AnimatedPage></ProtectedRoute>} />
        
        {/* Tools - Investor tier required */}
        <Route path="/tools" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><Tools /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/roi" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><ROICalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/mortgage" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><MortgageCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/rent-vs-buy" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><RentVsBuyCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/airbnb" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><AirbnbCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/str-vs-ltr" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><StrVsLtrCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/total-cost" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><TotalCostCalculator /></AnimatedPage></ProtectedRoute>} />
        
        {/* AI Assistant - Investor tier required */}
        <Route path="/ai-assistant" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><AIAssistant /></AnimatedPage></ProtectedRoute>} />
        
        {/* Portfolio - Elite tier required */}
        <Route path="/portfolio" element={<ProtectedRoute requiredTier="elite"><AnimatedPage><Portfolio /></AnimatedPage></ProtectedRoute>} />
        
        <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        <Route path="/profile/:userId" element={<AnimatedPage><Profile /></AnimatedPage>} />
        
        {/* Community Hub Routes - Investor tier required */}
        <Route path="/community" element={<ProtectedRoute requiredTier="investor"><CommunityLayout /></ProtectedRoute>}>
          <Route index element={<DiscussionsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:oderId" element={<MessagesPage />} />
          <Route path="messages/group/:groupId" element={<MessagesPage />} />
        </Route>
        
        {/* Golden Visa - Elite tier required */}
        <Route path="/golden-visa" element={<ProtectedRoute requiredTier="elite"><AnimatedPage><GoldenVisaWizard /></AnimatedPage></ProtectedRoute>} />
        <Route path="/pricing" element={<AnimatedPage><Pricing /></AnimatedPage>} />
        <Route path="/join" element={<AnimatedPage><MembershipFunnel /></AnimatedPage>} />
        <Route path="/join-elite" element={<AnimatedPage><EliteFunnel /></AnimatedPage>} />
        <Route path="/checkout/:tier" element={<AnimatedPage><CheckoutRedirect /></AnimatedPage>} />
        <Route path="/upgrade" element={<AnimatedPage><Upgrade /></AnimatedPage>} />
        <Route path="/subscription-success" element={<AnimatedPage><SubscriptionSuccess /></AnimatedPage>} />
        <Route path="/admin" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
        <Route path="/admin/users" element={<AnimatedPage><AdminUsers /></AnimatedPage>} />
        <Route path="/admin/courses" element={<AnimatedPage><AdminCourses /></AnimatedPage>} />
        <Route path="/admin/courses/:courseId/lessons" element={<AnimatedPage><AdminLessons /></AnimatedPage>} />
        <Route path="/admin/properties" element={<AnimatedPage><AdminProperties /></AnimatedPage>} />
        <Route path="/admin/agents" element={<AnimatedPage><AdminAgents /></AnimatedPage>} />
        <Route path="/admin/brokerages" element={<AnimatedPage><AdminBrokerages /></AnimatedPage>} />
        <Route path="/admin/developers" element={<AnimatedPage><AdminDevelopers /></AnimatedPage>} />
        <Route path="/admin/events" element={<AnimatedPage><AdminEvents /></AnimatedPage>} />
        <Route path="/admin/analytics" element={<AnimatedPage><AdminAnalytics /></AnimatedPage>} />
        <Route path="/admin/revenue" element={<AnimatedPage><AdminRevenue /></AnimatedPage>} />
        <Route path="/admin/marketing" element={<AnimatedPage><AdminMarketing /></AnimatedPage>} />
        <Route path="/disclaimer" element={<AnimatedPage><Disclaimer /></AnimatedPage>} />
        <Route path="/terms" element={<AnimatedPage><TermsOfService /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
