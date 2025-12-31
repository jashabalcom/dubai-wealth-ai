import { PitchDeckSlide } from "../PitchDeckSlide";
import { Smartphone, Globe, Apple, PlayCircle, CheckCircle, Clock, Rocket } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    timeline: "Launch",
    stores: ["Apple App Store", "Google Play Store"],
    coverage: "95%",
    description: "Primary markets for UAE and international users",
    icon: Rocket
  },
  {
    phase: "Phase 2", 
    timeline: "Month 6",
    stores: ["Huawei AppGallery"],
    coverage: "+5%",
    description: "3rd largest app store globally, strong in ME/Asia",
    icon: Clock
  },
  {
    phase: "Phase 3",
    timeline: "Month 12",
    stores: ["China via AppInChina"],
    coverage: "China Market",
    description: "Access all 10+ Chinese Android stores via single integration",
    icon: Globe
  }
];

const marketStats = [
  { store: "Apple App Store", share: "60%", color: "from-primary to-primary/70" },
  { store: "Google Play", share: "35%", color: "from-accent to-accent/70" },
  { store: "Huawei AppGallery", share: "5%", color: "from-primary/70 to-accent/70" }
];

const pwaBenefits = [
  "Zero download friction",
  "Instant updates",
  "Same codebase (Capacitor)",
  "Offline capable",
  "Add to home screen"
];

export const AppStoreSlide = () => (
  <PitchDeckSlide className="p-8 md:p-12">
    <div className="space-y-6">
      <div>
        <p className="text-primary font-semibold mb-2">DISTRIBUTION STRATEGY</p>
        <h2 className="text-3xl md:text-4xl font-bold">
          Multi-Platform Mobile Launch
        </h2>
      </div>

      {/* Phased Rollout */}
      <div className="grid md:grid-cols-3 gap-4">
        {phases.map((phase, i) => (
          <div 
            key={i}
            className={`bg-gradient-to-br ${i === 0 ? 'from-primary/20 to-primary/5 border-primary/30' : 'from-card to-muted/50 border-border'} border rounded-xl p-5`}
          >
            <div className="flex items-center gap-2 mb-3">
              <phase.icon className={`h-5 w-5 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {phase.phase}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">{phase.timeline}</span>
            </div>
            <div className="space-y-2">
              {phase.stores.map((store, j) => (
                <div key={j} className="flex items-center gap-2">
                  {store.includes('Apple') && <Apple className="h-4 w-4 text-foreground" />}
                  {store.includes('Google') && <PlayCircle className="h-4 w-4 text-foreground" />}
                  {store.includes('Huawei') && <Smartphone className="h-4 w-4 text-foreground" />}
                  {store.includes('China') && <Globe className="h-4 w-4 text-foreground" />}
                  <span className="text-sm font-medium">{store}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{phase.description}</p>
              <p className={`text-lg font-bold mt-1 ${i === 0 ? 'text-primary' : 'text-accent'}`}>
                {phase.coverage}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Market Coverage */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="font-bold text-sm mb-4">UAE Smartphone Market Share</h4>
          <div className="space-y-3">
            {marketStats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{stat.store}</span>
                  <span className="font-bold">{stat.share}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    style={{ width: stat.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="font-bold text-sm mb-4">PWA Strategy (Parallel)</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Progressive Web App available immediately for web users
          </p>
          <div className="grid grid-cols-2 gap-2">
            {pwaBenefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Note */}
      <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Already Built: Capacitor Mobile Framework</p>
          <p className="text-xs text-muted-foreground">
            Single React codebase compiles to native iOS and Android apps. Android/iOS configurations already in place.
          </p>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
