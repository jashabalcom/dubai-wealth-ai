import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { LazyLoadFallback } from "@/components/LazyLoadFallback";

// Eagerly loaded pages (core user journey)
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
import Profile from "@/pages/Profile";
import Pricing from "@/pages/Pricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import CheckoutRedirect from "@/pages/CheckoutRedirect";
import Upgrade from "@/pages/Upgrade";
import ResetPassword from "@/pages/ResetPassword";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Disclaimer from "@/pages/Disclaimer";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";
import Developers from "@/pages/Developers";
import DeveloperDetail from "@/pages/DeveloperDetail";
import Neighborhoods from "@/pages/Neighborhoods";
import NeighborhoodDetail from "@/pages/NeighborhoodDetail";
import AIAssistant from "@/pages/AIAssistant";

// Community Hub Pages (eagerly loaded - frequently used)
import { CommunityLayout } from "@/components/community/CommunityLayout";
import DiscussionsPage from "@/pages/community/DiscussionsPage";
import EventsPage from "@/pages/community/EventsPage";
import MembersPage from "@/pages/community/MembersPage";
import ConnectionsPage from "@/pages/community/ConnectionsPage";
import MessagesPage from "@/pages/community/MessagesPage";
import LeaderboardPage from "@/pages/community/LeaderboardPage";
import QAPage from "@/pages/community/QAPage";
import QuestionDetailPage from "@/pages/community/QuestionDetailPage";
import NewsPage from "@/pages/community/NewsPage";

// Lazy loaded pages - Tool calculators (users typically use 1-2)
const ROICalculator = lazy(() => import("@/pages/tools/ROICalculator"));
const MortgageCalculator = lazy(() => import("@/pages/tools/MortgageCalculator"));
const RentVsBuyCalculator = lazy(() => import("@/pages/tools/RentVsBuyCalculator"));
const AirbnbCalculator = lazy(() => import("@/pages/tools/AirbnbCalculator"));
const StrVsLtrCalculator = lazy(() => import("@/pages/tools/StrVsLtrCalculator"));
const TotalCostCalculator = lazy(() => import("@/pages/tools/TotalCostCalculator"));
const CapRateCalculator = lazy(() => import("@/pages/tools/CapRateCalculator"));
const DSCRCalculator = lazy(() => import("@/pages/tools/DSCRCalculator"));
const FreeZoneComparison = lazy(() => import("@/pages/tools/FreeZoneComparison"));
const CommercialLeaseAnalyzer = lazy(() => import("@/pages/tools/CommercialLeaseAnalyzer"));
const OffPlanCalculator = lazy(() => import("@/pages/tools/OffPlanCalculator"));

// Lazy loaded pages - Less frequently visited
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const GoldenVisaWizard = lazy(() => import("@/pages/GoldenVisaWizard"));
const MembershipFunnel = lazy(() => import("@/pages/MembershipFunnel"));
const EliteFunnel = lazy(() => import("@/pages/EliteFunnel"));

// Lazy loaded pages - Admin (only ~1% of users are admins)
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("@/pages/admin/AdminCourses"));
const AdminLessons = lazy(() => import("@/pages/admin/AdminLessons"));
const AdminProperties = lazy(() => import("@/pages/admin/AdminProperties"));
const AdminAgents = lazy(() => import("@/pages/admin/AdminAgents"));
const AdminBrokerages = lazy(() => import("@/pages/admin/AdminBrokerages"));
const AdminDevelopers = lazy(() => import("@/pages/admin/AdminDevelopers"));
const AdminDeveloperProjects = lazy(() => import("@/pages/admin/AdminDeveloperProjects"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminRevenue = lazy(() => import("@/pages/admin/AdminRevenue"));
const AdminMarketing = lazy(() => import("@/pages/admin/AdminMarketing"));
const AdminNeighborhoods = lazy(() => import("@/pages/admin/AdminNeighborhoods"));
const AdminNeighborhoodPOIs = lazy(() => import("@/pages/admin/AdminNeighborhoodPOIs"));
const AdminBayutSync = lazy(() => import("@/pages/admin/AdminBayutSync"));
const AdminNews = lazy(() => import("@/pages/admin/AdminNews"));
const AdminMortgageLeads = lazy(() => import("@/pages/admin/AdminMortgageLeads"));
const AdminMortgagePartners = lazy(() => import("@/pages/admin/AdminMortgagePartners"));

// Lazy loaded pages - Agent Portal (only agents use these)
const AgentPortalLanding = lazy(() => import("@/pages/agent-portal/AgentPortalLanding"));
const AgentLogin = lazy(() => import("@/pages/agent-portal/AgentLogin"));
const AgentRegister = lazy(() => import("@/pages/agent-portal/AgentRegister"));
const AgentDashboard = lazy(() => import("@/pages/agent-portal/AgentDashboard"));
const AgentListings = lazy(() => import("@/pages/agent-portal/AgentListings"));
const AgentPropertyForm = lazy(() => import("@/pages/agent-portal/AgentPropertyForm"));
import { AgentPortalLayout } from "@/components/agent-portal/AgentPortalLayout";
import { AgentProtectedRoute } from "@/components/agent-portal/AgentProtectedRoute";

// Wrapper component for page transitions
function AnimatedPage({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

// Wrapper for lazy-loaded pages with Suspense
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LazyLoadFallback />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
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
        {/* Academy - Free to browse, lesson access controlled in-page */}
        <Route path="/academy" element={<AnimatedPage><Academy /></AnimatedPage>} />
        <Route path="/academy/:slug" element={<AnimatedPage><Course /></AnimatedPage>} />
        <Route path="/academy/:courseSlug/:lessonSlug" element={<ProtectedRoute><AnimatedPage><Lesson /></AnimatedPage></ProtectedRoute>} />
        
        {/* Properties - Public browse, saved requires auth */}
        <Route path="/properties" element={<AnimatedPage><Properties /></AnimatedPage>} />
        <Route path="/properties/:slug" element={<AnimatedPage><PropertyDetail /></AnimatedPage>} />
        <Route path="/properties/saved" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><SavedProperties /></AnimatedPage></ProtectedRoute>} />
        
        {/* Developers - Free to browse listing, detail pages require Investor tier */}
        <Route path="/developers" element={<AnimatedPage><Developers /></AnimatedPage>} />
        <Route path="/developers/:slug" element={<ProtectedRoute requiredTier="investor"><AnimatedPage><DeveloperDetail /></AnimatedPage></ProtectedRoute>} />
        
        {/* Neighborhoods - Public browse */}
        <Route path="/neighborhoods" element={<AnimatedPage><Neighborhoods /></AnimatedPage>} />
        <Route path="/neighborhoods/:slug" element={<AnimatedPage><NeighborhoodDetail /></AnimatedPage>} />
        
        {/* Tools - Auth required, usage-based gating in-page (lazy loaded) */}
        <Route path="/tools" element={<ProtectedRoute><AnimatedPage><Tools /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/roi" element={<ProtectedRoute><LazyPage><ROICalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/mortgage" element={<ProtectedRoute><LazyPage><MortgageCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/rent-vs-buy" element={<ProtectedRoute><LazyPage><RentVsBuyCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/airbnb" element={<ProtectedRoute><LazyPage><AirbnbCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/str-vs-ltr" element={<ProtectedRoute><LazyPage><StrVsLtrCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/total-cost" element={<ProtectedRoute><LazyPage><TotalCostCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/cap-rate" element={<ProtectedRoute><LazyPage><CapRateCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/dscr" element={<ProtectedRoute><LazyPage><DSCRCalculator /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/free-zone" element={<ProtectedRoute><LazyPage><FreeZoneComparison /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/lease-analyzer" element={<ProtectedRoute><LazyPage><CommercialLeaseAnalyzer /></LazyPage></ProtectedRoute>} />
        <Route path="/tools/offplan" element={<ProtectedRoute><LazyPage><OffPlanCalculator /></LazyPage></ProtectedRoute>} />
        
        {/* AI Assistant - Auth required, usage-based gating in-page */}
        <Route path="/ai" element={<ProtectedRoute><AnimatedPage><AIAssistant /></AnimatedPage></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AnimatedPage><AIAssistant /></AnimatedPage></ProtectedRoute>} />
        
        {/* Portfolio - Elite tier required (lazy loaded) */}
        <Route path="/portfolio" element={<ProtectedRoute requiredTier="elite"><LazyPage><Portfolio /></LazyPage></ProtectedRoute>} />
        
        <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        <Route path="/profile/:userId" element={<AnimatedPage><Profile /></AnimatedPage>} />
        
        {/* Community Hub Routes - Auth required, read-only gating in-page */}
        <Route path="/community" element={<ProtectedRoute><CommunityLayout /></ProtectedRoute>}>
          <Route index element={<DiscussionsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="qa" element={<QAPage />} />
          <Route path="qa/:questionId" element={<QuestionDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:oderId" element={<MessagesPage />} />
          <Route path="messages/group/:groupId" element={<MessagesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
        </Route>
        
        {/* Golden Visa - Elite tier required (lazy loaded) */}
        <Route path="/golden-visa" element={<ProtectedRoute requiredTier="elite"><LazyPage><GoldenVisaWizard /></LazyPage></ProtectedRoute>} />
        <Route path="/pricing" element={<AnimatedPage><Pricing /></AnimatedPage>} />
        <Route path="/join" element={<LazyPage><MembershipFunnel /></LazyPage>} />
        <Route path="/join-elite" element={<LazyPage><EliteFunnel /></LazyPage>} />
        <Route path="/checkout/:tier" element={<AnimatedPage><CheckoutRedirect /></AnimatedPage>} />
        <Route path="/upgrade" element={<AnimatedPage><Upgrade /></AnimatedPage>} />
        <Route path="/subscription-success" element={<AnimatedPage><SubscriptionSuccess /></AnimatedPage>} />
        
        {/* Admin Routes (lazy loaded) */}
        <Route path="/admin" element={<LazyPage><AdminDashboard /></LazyPage>} />
        <Route path="/admin/users" element={<LazyPage><AdminUsers /></LazyPage>} />
        <Route path="/admin/courses" element={<LazyPage><AdminCourses /></LazyPage>} />
        <Route path="/admin/courses/:courseId/lessons" element={<LazyPage><AdminLessons /></LazyPage>} />
        <Route path="/admin/properties" element={<LazyPage><AdminProperties /></LazyPage>} />
        <Route path="/admin/agents" element={<LazyPage><AdminAgents /></LazyPage>} />
        <Route path="/admin/brokerages" element={<LazyPage><AdminBrokerages /></LazyPage>} />
        <Route path="/admin/developers" element={<LazyPage><AdminDevelopers /></LazyPage>} />
        <Route path="/admin/developers/:developerId/projects" element={<LazyPage><AdminDeveloperProjects /></LazyPage>} />
        <Route path="/admin/neighborhoods" element={<LazyPage><AdminNeighborhoods /></LazyPage>} />
        <Route path="/admin/neighborhoods/:neighborhoodId/pois" element={<LazyPage><AdminNeighborhoodPOIs /></LazyPage>} />
        <Route path="/admin/events" element={<LazyPage><AdminEvents /></LazyPage>} />
        <Route path="/admin/analytics" element={<LazyPage><AdminAnalytics /></LazyPage>} />
        <Route path="/admin/revenue" element={<LazyPage><AdminRevenue /></LazyPage>} />
        <Route path="/admin/marketing" element={<LazyPage><AdminMarketing /></LazyPage>} />
        <Route path="/admin/news" element={<LazyPage><AdminNews /></LazyPage>} />
        <Route path="/admin/mortgage-leads" element={<LazyPage><AdminMortgageLeads /></LazyPage>} />
        <Route path="/admin/mortgage-partners" element={<LazyPage><AdminMortgagePartners /></LazyPage>} />
        <Route path="/admin/bayut-sync" element={<LazyPage><AdminBayutSync /></LazyPage>} />
        
        <Route path="/disclaimer" element={<AnimatedPage><Disclaimer /></AnimatedPage>} />
        <Route path="/terms" element={<AnimatedPage><TermsOfService /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
        
        {/* Agent Portal Routes (lazy loaded) */}
        <Route path="/agent-portal" element={<LazyPage><AgentPortalLanding /></LazyPage>} />
        <Route path="/agent-portal/login" element={<LazyPage><AgentLogin /></LazyPage>} />
        <Route path="/agent-portal/register" element={<LazyPage><AgentRegister /></LazyPage>} />
        <Route path="/agent-portal/dashboard" element={<AgentProtectedRoute><AgentPortalLayout><LazyPage><AgentDashboard /></LazyPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings" element={<AgentProtectedRoute><AgentPortalLayout><LazyPage><AgentListings /></LazyPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings/new" element={<AgentProtectedRoute><AgentPortalLayout><LazyPage><AgentPropertyForm /></LazyPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings/:id/edit" element={<AgentProtectedRoute><AgentPortalLayout><LazyPage><AgentPropertyForm /></LazyPage></AgentPortalLayout></AgentProtectedRoute>} />
        
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
