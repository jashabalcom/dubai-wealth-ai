import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OnlinePresenceProvider } from "@/contexts/OnlinePresenceContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Academy from "./pages/Academy";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Tools from "./pages/Tools";
import ROICalculator from "./pages/tools/ROICalculator";
import MortgageCalculator from "./pages/tools/MortgageCalculator";
import RentVsBuyCalculator from "./pages/tools/RentVsBuyCalculator";
import AirbnbCalculator from "./pages/tools/AirbnbCalculator";
import TotalCostCalculator from "./pages/tools/TotalCostCalculator";
import AIAssistant from "./pages/AIAssistant";
import Community from "./pages/Community";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import MemberDirectory from "./pages/MemberDirectory";
import Connections from "./pages/Connections";
import Messages from "./pages/Messages";
import GoldenVisaWizard from "./pages/GoldenVisaWizard";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import MembershipFunnel from "./pages/MembershipFunnel";
import EliteFunnel from "./pages/EliteFunnel";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnlinePresenceProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/academy" element={<Academy />} />
            <Route path="/academy/:slug" element={<Course />} />
            <Route path="/academy/:courseSlug/:lessonSlug" element={<Lesson />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:slug" element={<PropertyDetail />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/roi" element={<ROICalculator />} />
            <Route path="/tools/mortgage" element={<MortgageCalculator />} />
            <Route path="/tools/rent-vs-buy" element={<RentVsBuyCalculator />} />
            <Route path="/tools/airbnb" element={<AirbnbCalculator />} />
            <Route path="/tools/total-cost" element={<TotalCostCalculator />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/community" element={<Community />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/members" element={<MemberDirectory />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<Messages />} />
            <Route path="/messages/group/:groupId" element={<Messages />} />
            <Route path="/golden-visa" element={<GoldenVisaWizard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/join" element={<MembershipFunnel />} />
            <Route path="/join-elite" element={<EliteFunnel />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OnlinePresenceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
