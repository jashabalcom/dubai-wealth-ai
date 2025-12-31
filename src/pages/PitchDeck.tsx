import { SEOHead } from "@/components/SEOHead";
import { PitchDeck } from "@/components/investors/PitchDeck";

const PitchDeckPage = () => {
  return (
    <>
      <SEOHead
        title="Investor Pitch Deck | Dubai Wealth Hub"
        description="Series Seed investment opportunity for Dubai Wealth Hub - the all-in-one intelligence platform for Dubai real estate investment."
        keywords={["investment", "pitch deck", "series seed", "dubai real estate", "proptech"]}
      />
      <div className="min-h-screen bg-background">
        <PitchDeck />
      </div>
    </>
  );
};

export default PitchDeckPage;
