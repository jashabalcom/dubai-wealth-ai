import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { LazyLoadFallback } from "@/components/LazyLoadFallback";

// Eagerly loaded pages (critical for initial load / SEO)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Lazy loaded - Dashboard & Core pages (loaded after auth)
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));

// Lazy loaded - Academy pages
const Academy = lazy(() => import("@/pages/Academy"));
const Course = lazy(() => import("@/pages/Course"));
const Lesson = lazy(() => import("@/pages/Lesson"));

// Lazy loaded - Properties pages
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const SavedProperties = lazy(() => import("@/pages/SavedProperties"));

// Lazy loaded - Tools main page
const Tools = lazy(() => import("@/pages/Tools"));

// Lazy loaded - Pricing & Subscription pages
const Pricing = lazy(() => import("@/pages/Pricing"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Upgrade = lazy(() => import("@/pages/Upgrade"));
const Funnel = lazy(() => import("@/pages/Funnel"));

// Lazy loaded - Static/Legal pages
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Contact = lazy(() => import("@/pages/Contact"));

// Lazy loaded - Developers & Neighborhoods
const Developers = lazy(() => import("@/pages/Developers"));
const DeveloperDetail = lazy(() => import("@/pages/DeveloperDetail"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Neighborhoods = lazy(() => import("@/pages/Neighborhoods"));
const NeighborhoodDetail = lazy(() => import("@/pages/NeighborhoodDetail"));

// Lazy loaded - AI Assistant
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));

// Community Hub Pages (lazy loaded)
const CommunityLayout = lazy(() => import("@/components/community/CommunityLayout").then(m => ({ default: m.CommunityLayout })));
const DiscussionsPage = lazy(() => import("@/pages/community/DiscussionsPage"));
const EventsPage = lazy(() => import("@/pages/community/EventsPage"));
const MembersPage = lazy(() => import("@/pages/community/MembersPage"));
const ConnectionsPage = lazy(() => import("@/pages/community/ConnectionsPage"));
const MessagesPage = lazy(() => import("@/pages/community/MessagesPage"));
const LeaderboardPage = lazy(() => import("@/pages/community/LeaderboardPage"));
const QAPage = lazy(() => import("@/pages/community/QAPage"));
const QuestionDetailPage = lazy(() => import("@/pages/community/QuestionDetailPage"));
const NewsPage = lazy(() => import("@/pages/community/NewsPage"));
const MemberProfilePage = lazy(() => import("@/pages/community/MemberProfilePage"));

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
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const DailyBriefing = lazy(() => import("@/pages/DailyBriefing"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const AffiliateDashboard = lazy(() => import("@/pages/AffiliateDashboard"));

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
const AdminCalendarEvents = lazy(() => import("@/pages/admin/AdminCalendarEvents"));
const AdminOKRs = lazy(() => import("@/pages/admin/AdminOKRs"));
const AdminInvestorMetrics = lazy(() => import("@/pages/admin/AdminInvestorMetrics"));
const AdminDigest = lazy(() => import("@/pages/admin/AdminDigest"));
const AdminNewsSources = lazy(() => import("@/pages/admin/AdminNewsSources"));
const AdminAffiliates = lazy(() => import("@/pages/admin/AdminAffiliates"));

// Lazy loaded - Public investor page
const Investors = lazy(() => import("@/pages/Investors"));
const PitchDeck = lazy(() => import("@/pages/PitchDeck"));
const Team = lazy(() => import("@/pages/Team"));
const OnePager = lazy(() => import("@/pages/OnePager"));

// Lazy loaded pages - Agent Portal (only agents use these)
const AgentPortalLanding = lazy(() => import("@/pages/agent-portal/AgentPortalLanding"));
const AgentLogin = lazy(() => import("@/pages/agent-portal/AgentLogin"));
const AgentRegister = lazy(() => import("@/pages/agent-portal/AgentRegister"));
const AgentDashboard = lazy(() => import("@/pages/agent-portal/AgentDashboard"));
const AgentListings = lazy(() => import("@/pages/agent-portal/AgentListings"));
const AgentPropertyForm = lazy(() => import("@/pages/agent-portal/AgentPropertyForm"));
const AgentPortalLayout = lazy(() => import("@/components/agent-portal/AgentPortalLayout").then(m => ({ default: m.AgentPortalLayout })));
const AgentProtectedRoute = lazy(() => import("@/components/agent-portal/AgentProtectedRoute").then(m => ({ default: m.AgentProtectedRoute })));

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
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />
        <Route path="/settings" element={<ProtectedRoute><LazyPage><Settings /></LazyPage></ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LazyPage><Dashboard /></LazyPage>
            </ProtectedRoute>
          }
        />
        {/* Academy - Free to browse, lesson access controlled in-page */}
        <Route path="/academy" element={<LazyPage><Academy /></LazyPage>} />
        <Route path="/academy/:slug" element={<LazyPage><Course /></LazyPage>} />
        <Route path="/academy/:courseSlug/:lessonSlug" element={<ProtectedRoute><LazyPage><Lesson /></LazyPage></ProtectedRoute>} />
        
        {/* Properties - Public browse, saved requires auth */}
        <Route path="/properties" element={<LazyPage><Properties /></LazyPage>} />
        <Route path="/properties/:slug" element={<LazyPage><PropertyDetail /></LazyPage>} />
        <Route path="/properties/saved" element={<ProtectedRoute requiredTier="investor"><LazyPage><SavedProperties /></LazyPage></ProtectedRoute>} />
        
        {/* Developers & Projects - Free to browse listing, detail pages require Investor tier */}
        <Route path="/developers" element={<LazyPage><Developers /></LazyPage>} />
        <Route path="/developers/:slug" element={<ProtectedRoute requiredTier="investor"><LazyPage><DeveloperDetail /></LazyPage></ProtectedRoute>} />
        <Route path="/projects/:slug" element={<ProtectedRoute requiredTier="investor"><LazyPage><ProjectDetail /></LazyPage></ProtectedRoute>} />
        
        {/* Neighborhoods - Public browse */}
        <Route path="/neighborhoods" element={<LazyPage><Neighborhoods /></LazyPage>} />
        <Route path="/neighborhoods/:slug" element={<LazyPage><NeighborhoodDetail /></LazyPage>} />
        
        {/* Tools - Auth required, usage-based gating in-page (lazy loaded) */}
        <Route path="/tools" element={<ProtectedRoute><LazyPage><Tools /></LazyPage></ProtectedRoute>} />
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
        <Route path="/ai" element={<ProtectedRoute><LazyPage><AIAssistant /></LazyPage></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><LazyPage><AIAssistant /></LazyPage></ProtectedRoute>} />
        
        {/* Portfolio - Elite tier required (lazy loaded) */}
        <Route path="/portfolio" element={<ProtectedRoute requiredTier="elite"><LazyPage><Portfolio /></LazyPage></ProtectedRoute>} />
        
{/* Calendar - Public */}
        <Route path="/calendar" element={<LazyPage><Calendar /></LazyPage>} />
        
        {/* Affiliate Program */}
        <Route path="/affiliate" element={<ProtectedRoute><LazyPage><AffiliateDashboard /></LazyPage></ProtectedRoute>} />
        
        <Route path="/profile" element={<LazyPage><Profile /></LazyPage>} />
        <Route path="/profile/:userId" element={<LazyPage><Profile /></LazyPage>} />
        
        {/* Member Profile - Public view of community member */}
        <Route path="/member/:memberId" element={<LazyPage><MemberProfilePage /></LazyPage>} />
        
        {/* Community Hub Routes - Auth required, read-only gating in-page */}
        <Route path="/community" element={
          <ProtectedRoute>
            <Suspense fallback={<LazyLoadFallback />}>
              <CommunityLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={<Suspense fallback={<LazyLoadFallback />}><DiscussionsPage /></Suspense>} />
          <Route path="news" element={<Suspense fallback={<LazyLoadFallback />}><NewsPage /></Suspense>} />
          <Route path="qa" element={<Suspense fallback={<LazyLoadFallback />}><QAPage /></Suspense>} />
          <Route path="qa/:questionId" element={<Suspense fallback={<LazyLoadFallback />}><QuestionDetailPage /></Suspense>} />
          <Route path="events" element={<Suspense fallback={<LazyLoadFallback />}><EventsPage /></Suspense>} />
          <Route path="members" element={<Suspense fallback={<LazyLoadFallback />}><MembersPage /></Suspense>} />
          <Route path="connections" element={<Suspense fallback={<LazyLoadFallback />}><ConnectionsPage /></Suspense>} />
          <Route path="messages" element={<Suspense fallback={<LazyLoadFallback />}><MessagesPage /></Suspense>} />
          <Route path="messages/:oderId" element={<Suspense fallback={<LazyLoadFallback />}><MessagesPage /></Suspense>} />
          <Route path="messages/group/:groupId" element={<Suspense fallback={<LazyLoadFallback />}><MessagesPage /></Suspense>} />
          <Route path="leaderboard" element={<Suspense fallback={<LazyLoadFallback />}><LeaderboardPage /></Suspense>} />
        </Route>
        
        {/* Golden Visa - Elite tier required (lazy loaded) */}
        <Route path="/golden-visa" element={<ProtectedRoute requiredTier="elite"><LazyPage><GoldenVisaWizard /></LazyPage></ProtectedRoute>} />
        <Route path="/pricing" element={<LazyPage><Pricing /></LazyPage>} />
        <Route path="/join" element={<LazyPage><MembershipFunnel /></LazyPage>} />
        <Route path="/join-elite" element={<LazyPage><EliteFunnel /></LazyPage>} />
        <Route path="/checkout/:tier" element={<ProtectedRoute><LazyPage><Checkout /></LazyPage></ProtectedRoute>} />
        <Route path="/upgrade" element={<LazyPage><Upgrade /></LazyPage>} />
        <Route path="/funnel/:funnelType" element={<LazyPage><Funnel /></LazyPage>} />
        <Route path="/subscription-success" element={<LazyPage><SubscriptionSuccess /></LazyPage>} />
        
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
        <Route path="/admin/digest" element={<LazyPage><AdminDigest /></LazyPage>} />
        <Route path="/admin/news-sources" element={<LazyPage><AdminNewsSources /></LazyPage>} />
        <Route path="/admin/mortgage-leads" element={<LazyPage><AdminMortgageLeads /></LazyPage>} />
        <Route path="/admin/mortgage-partners" element={<LazyPage><AdminMortgagePartners /></LazyPage>} />
        <Route path="/admin/bayut-sync" element={<LazyPage><AdminBayutSync /></LazyPage>} />
        <Route path="/admin/calendar-events" element={<LazyPage><AdminCalendarEvents /></LazyPage>} />
        <Route path="/admin/okrs" element={<LazyPage><AdminOKRs /></LazyPage>} />
        <Route path="/admin/investor-metrics" element={<LazyPage><AdminInvestorMetrics /></LazyPage>} />
        <Route path="/admin/affiliates" element={<LazyPage><AdminAffiliates /></LazyPage>} />
        
        {/* Public Investor Page */}
        <Route path="/investors" element={<LazyPage><Investors /></LazyPage>} />
        <Route path="/pitch-deck" element={<PitchDeck />} />
        <Route path="/team" element={<LazyPage><Team /></LazyPage>} />
        <Route path="/one-pager" element={<LazyPage><OnePager /></LazyPage>} />
        
        <Route path="/disclaimer" element={<LazyPage><Disclaimer /></LazyPage>} />
        <Route path="/terms" element={<LazyPage><TermsOfService /></LazyPage>} />
        <Route path="/privacy" element={<LazyPage><PrivacyPolicy /></LazyPage>} />
        <Route path="/cookie-policy" element={<LazyPage><CookiePolicy /></LazyPage>} />
        <Route path="/about" element={<LazyPage><About /></LazyPage>} />
        <Route path="/blog" element={<LazyPage><Blog /></LazyPage>} />
        <Route path="/blog/:slug" element={<LazyPage><BlogArticle /></LazyPage>} />
        <Route path="/briefing" element={<LazyPage><DailyBriefing /></LazyPage>} />
        <Route path="/briefing/:date" element={<LazyPage><DailyBriefing /></LazyPage>} />
        <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
        
        {/* Agent Portal Routes (lazy loaded) */}
        <Route path="/agent-portal" element={<LazyPage><AgentPortalLanding /></LazyPage>} />
        <Route path="/agent-portal/login" element={<LazyPage><AgentLogin /></LazyPage>} />
        <Route path="/agent-portal/register" element={<LazyPage><AgentRegister /></LazyPage>} />
        <Route path="/agent-portal/dashboard" element={
          <Suspense fallback={<LazyLoadFallback />}>
            <AgentProtectedRoute>
              <Suspense fallback={<LazyLoadFallback />}>
                <AgentPortalLayout>
                  <LazyPage><AgentDashboard /></LazyPage>
                </AgentPortalLayout>
              </Suspense>
            </AgentProtectedRoute>
          </Suspense>
        } />
        <Route path="/agent-portal/listings" element={
          <Suspense fallback={<LazyLoadFallback />}>
            <AgentProtectedRoute>
              <Suspense fallback={<LazyLoadFallback />}>
                <AgentPortalLayout>
                  <LazyPage><AgentListings /></LazyPage>
                </AgentPortalLayout>
              </Suspense>
            </AgentProtectedRoute>
          </Suspense>
        } />
        <Route path="/agent-portal/listings/new" element={
          <Suspense fallback={<LazyLoadFallback />}>
            <AgentProtectedRoute>
              <Suspense fallback={<LazyLoadFallback />}>
                <AgentPortalLayout>
                  <LazyPage><AgentPropertyForm /></LazyPage>
                </AgentPortalLayout>
              </Suspense>
            </AgentProtectedRoute>
          </Suspense>
        } />
        <Route path="/agent-portal/listings/:id/edit" element={
          <Suspense fallback={<LazyLoadFallback />}>
            <AgentProtectedRoute>
              <Suspense fallback={<LazyLoadFallback />}>
                <AgentPortalLayout>
                  <LazyPage><AgentPropertyForm /></LazyPage>
                </AgentPortalLayout>
              </Suspense>
            </AgentProtectedRoute>
          </Suspense>
        } />
        
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
