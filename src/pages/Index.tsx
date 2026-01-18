import { lazy, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomePageSEO } from "@/components/SEOHead";

// Lazy load below-the-fold sections to improve TTI
const DynamicTrustSignals = lazy(() => import("@/components/sections/DynamicTrustSignals").then(m => ({ default: m.DynamicTrustSignals })));
const PlatformSection = lazy(() => import("@/components/sections/PlatformSection").then(m => ({ default: m.PlatformSection })));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const WhoItsForSection = lazy(() => import("@/components/sections/WhoItsForSection").then(m => ({ default: m.WhoItsForSection })));
const EmailCaptureSection = lazy(() => import("@/components/sections/EmailCaptureSection").then(m => ({ default: m.EmailCaptureSection })));
const FAQSection = lazy(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })));
const MembershipSection = lazy(() => import("@/components/sections/MembershipSection").then(m => ({ default: m.MembershipSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));
const ExitIntentPopup = lazy(() => import("@/components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));

// Minimal loading placeholder for sections
const SectionPlaceholder = () => (
  <div className="min-h-[200px]" aria-hidden="true" />
);

const Index = () => {
  return (
    <div className="min-h-screen">
      <HomePageSEO />
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionPlaceholder />}>
          <DynamicTrustSignals />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <PlatformSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <WhoItsForSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <EmailCaptureSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <MembershipSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder />}>
          <CTASection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
    </div>
  );
};

export default Index;
