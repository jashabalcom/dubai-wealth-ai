import { PitchDeckSlide } from "../PitchDeckSlide";
import { TrendingUp, Users, Building2, GraduationCap } from "lucide-react";

export const TractionSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">TRACTION</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Early Momentum & Validation
        </h2>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-4xl font-bold text-primary">905</p>
          <p className="text-muted-foreground">Properties Listed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Users className="h-10 w-10 text-accent mx-auto mb-3" />
          <p className="text-4xl font-bold text-accent">106</p>
          <p className="text-muted-foreground">Neighborhoods</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-4xl font-bold text-primary">50+</p>
          <p className="text-muted-foreground">Academy Lessons</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <TrendingUp className="h-10 w-10 text-accent mx-auto mb-3" />
          <p className="text-4xl font-bold text-accent">11</p>
          <p className="text-muted-foreground">Investment Tools</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-8">
        <h3 className="text-xl font-bold mb-6">Product Milestones</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="font-semibold">Platform Launch</span>
            </div>
            <p className="text-sm text-muted-foreground pl-5">Full-stack MVP with core features</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="font-semibold">Payment Integration</span>
            </div>
            <p className="text-sm text-muted-foreground pl-5">Stripe subscriptions live</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="font-semibold">AI Features</span>
            </div>
            <p className="text-sm text-muted-foreground pl-5">Property analysis & insights</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          Pre-revenue stage • Seeking seed funding to accelerate growth
        </p>
      </div>
    </div>
  </PitchDeckSlide>
);
