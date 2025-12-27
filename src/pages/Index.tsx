import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { WhoItsForSection } from "@/components/sections/WhoItsForSection";
import { MembershipSection } from "@/components/sections/MembershipSection";
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
        <PlatformSection />
        <WhoItsForSection />
        <MembershipSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
