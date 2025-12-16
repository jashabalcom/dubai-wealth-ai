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
import CapRateCalculator from "@/pages/tools/CapRateCalculator";
import DSCRCalculator from "@/pages/tools/DSCRCalculator";
import FreeZoneComparison from "@/pages/tools/FreeZoneComparison";
import CommercialLeaseAnalyzer from "@/pages/tools/CommercialLeaseAnalyzer";
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
import AdminDeveloperProjects from "@/pages/admin/AdminDeveloperProjects";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminRevenue from "@/pages/admin/AdminRevenue";
import AdminMarketing from "@/pages/admin/AdminMarketing";
import NotFound from "@/pages/NotFound";
import Disclaimer from "@/pages/Disclaimer";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";
import Developers from "@/pages/Developers";
import DeveloperDetail from "@/pages/DeveloperDetail";
import Neighborhoods from "@/pages/Neighborhoods";
import NeighborhoodDetail from "@/pages/NeighborhoodDetail";
import AdminNeighborhoods from "@/pages/admin/AdminNeighborhoods";
import AdminNeighborhoodPOIs from "@/pages/admin/AdminNeighborhoodPOIs";
import AdminBayutSync from "@/pages/admin/AdminBayutSync";
import AdminNews from "@/pages/admin/AdminNews";
import AdminMortgageLeads from "@/pages/admin/AdminMortgageLeads";
import AdminMortgagePartners from "@/pages/admin/AdminMortgagePartners";

// Community Hub Pages
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

// Agent Portal Pages
import AgentPortalLanding from "@/pages/agent-portal/AgentPortalLanding";
import AgentLogin from "@/pages/agent-portal/AgentLogin";
import AgentRegister from "@/pages/agent-portal/AgentRegister";
import AgentDashboard from "@/pages/agent-portal/AgentDashboard";
import AgentListings from "@/pages/agent-portal/AgentListings";
import AgentPropertyForm from "@/pages/agent-portal/AgentPropertyForm";
import { AgentPortalLayout } from "@/components/agent-portal/AgentPortalLayout";
import { AgentProtectedRoute } from "@/components/agent-portal/AgentProtectedRoute";

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
        
        {/* Tools - Auth required, usage-based gating in-page */}
        <Route path="/tools" element={<ProtectedRoute><AnimatedPage><Tools /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/roi" element={<ProtectedRoute><AnimatedPage><ROICalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/mortgage" element={<ProtectedRoute><AnimatedPage><MortgageCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/rent-vs-buy" element={<ProtectedRoute><AnimatedPage><RentVsBuyCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/airbnb" element={<ProtectedRoute><AnimatedPage><AirbnbCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/str-vs-ltr" element={<ProtectedRoute><AnimatedPage><StrVsLtrCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/total-cost" element={<ProtectedRoute><AnimatedPage><TotalCostCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/cap-rate" element={<ProtectedRoute><AnimatedPage><CapRateCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/dscr" element={<ProtectedRoute><AnimatedPage><DSCRCalculator /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/free-zone" element={<ProtectedRoute><AnimatedPage><FreeZoneComparison /></AnimatedPage></ProtectedRoute>} />
        <Route path="/tools/lease-analyzer" element={<ProtectedRoute><AnimatedPage><CommercialLeaseAnalyzer /></AnimatedPage></ProtectedRoute>} />
        
        {/* AI Assistant - Auth required, usage-based gating in-page */}
        <Route path="/ai" element={<ProtectedRoute><AnimatedPage><AIAssistant /></AnimatedPage></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AnimatedPage><AIAssistant /></AnimatedPage></ProtectedRoute>} />
        
        {/* Portfolio - Elite tier required */}
        <Route path="/portfolio" element={<ProtectedRoute requiredTier="elite"><AnimatedPage><Portfolio /></AnimatedPage></ProtectedRoute>} />
        
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
        <Route path="/admin/developers/:developerId/projects" element={<AnimatedPage><AdminDeveloperProjects /></AnimatedPage>} />
        <Route path="/admin/neighborhoods" element={<AnimatedPage><AdminNeighborhoods /></AnimatedPage>} />
        <Route path="/admin/neighborhoods/:neighborhoodId/pois" element={<AnimatedPage><AdminNeighborhoodPOIs /></AnimatedPage>} />
        <Route path="/admin/events" element={<AnimatedPage><AdminEvents /></AnimatedPage>} />
        <Route path="/admin/analytics" element={<AnimatedPage><AdminAnalytics /></AnimatedPage>} />
        <Route path="/admin/revenue" element={<AnimatedPage><AdminRevenue /></AnimatedPage>} />
        <Route path="/admin/marketing" element={<AnimatedPage><AdminMarketing /></AnimatedPage>} />
        <Route path="/admin/news" element={<AnimatedPage><AdminNews /></AnimatedPage>} />
        <Route path="/admin/mortgage-leads" element={<AnimatedPage><AdminMortgageLeads /></AnimatedPage>} />
        <Route path="/admin/mortgage-partners" element={<AnimatedPage><AdminMortgagePartners /></AnimatedPage>} />
        <Route path="/admin/bayut-sync" element={<AnimatedPage><AdminBayutSync /></AnimatedPage>} />
        <Route path="/disclaimer" element={<AnimatedPage><Disclaimer /></AnimatedPage>} />
        <Route path="/terms" element={<AnimatedPage><TermsOfService /></AnimatedPage>} />
        <Route path="/privacy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
        <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
        
        {/* Agent Portal Routes */}
        <Route path="/agent-portal" element={<AnimatedPage><AgentPortalLanding /></AnimatedPage>} />
        <Route path="/agent-portal/login" element={<AnimatedPage><AgentLogin /></AnimatedPage>} />
        <Route path="/agent-portal/register" element={<AnimatedPage><AgentRegister /></AnimatedPage>} />
        <Route path="/agent-portal/dashboard" element={<AgentProtectedRoute><AgentPortalLayout><AnimatedPage><AgentDashboard /></AnimatedPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings" element={<AgentProtectedRoute><AgentPortalLayout><AnimatedPage><AgentListings /></AnimatedPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings/new" element={<AgentProtectedRoute><AgentPortalLayout><AnimatedPage><AgentPropertyForm /></AnimatedPage></AgentPortalLayout></AgentProtectedRoute>} />
        <Route path="/agent-portal/listings/:id/edit" element={<AgentProtectedRoute><AgentPortalLayout><AnimatedPage><AgentPropertyForm /></AnimatedPage></AgentPortalLayout></AgentProtectedRoute>} />
        
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
