import { PitchDeckSlide } from "../PitchDeckSlide";
import { Building2, TrendingUp } from "lucide-react";

export const TitleSlide = () => (
  <PitchDeckSlide className="items-center justify-center text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12">
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Building2 className="h-16 w-16 text-primary" />
        <TrendingUp className="h-12 w-12 text-accent" />
      </div>
      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Dubai Wealth Hub
      </h1>
      <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl">
        The All-in-One Intelligence Platform for Dubai Real Estate Investment
      </p>
      <div className="pt-8 flex items-center justify-center gap-6 text-lg text-muted-foreground">
        <span>Series Seed Funding</span>
        <span className="text-primary">•</span>
        <span>Q1 2025</span>
      </div>
    </div>
  </PitchDeckSlide>
);
