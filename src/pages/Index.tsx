import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyDubaiSection } from "@/components/sections/WhyDubaiSection";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { AcademySection } from "@/components/sections/AcademySection";
import { MembershipSection } from "@/components/sections/MembershipSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { HomePageSEO } from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HomePageSEO />
      <Navbar />
      <main>
        <HeroSection />
        <WhyDubaiSection />
        <PlatformSection />
        <AcademySection />
        <TestimonialsSection />
        <MembershipSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
