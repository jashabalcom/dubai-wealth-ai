import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import AIAssistant from "./pages/AIAssistant";
import Community from "./pages/Community";
import Portfolio from "./pages/Portfolio";
import GoldenVisaWizard from "./pages/GoldenVisaWizard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/community" element={<Community />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/golden-visa" element={<GoldenVisaWizard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
