import { PitchDeckSlide } from "../PitchDeckSlide";
import { Users, Building2, Percent } from "lucide-react";

const b2cTiers = [
  { name: "Free", price: "$0", features: "Limited access, lead capture" },
  { name: "Investor", price: "$29/mo", features: "Full tools, Academy access" },
  { name: "Elite", price: "$79/mo", features: "AI features, Community" },
  { name: "Private", price: "$149/mo", features: "Concierge, Priority support" }
];

const b2bTiers = [
  { name: "Basic", price: "$99/mo", features: "5 listings, Basic profile" },
  { name: "Preferred", price: "$199/mo", features: "20 listings, Featured" },
  { name: "Premium", price: "$299/mo", features: "Unlimited, Priority placement" }
];

export const BusinessModelSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-6">
      <div>
        <p className="text-primary font-semibold mb-2">BUSINESS MODEL</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Dual Revenue Streams
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">B2C Subscriptions</h3>
              <p className="text-sm text-muted-foreground">Investors & researchers</p>
            </div>
          </div>
          <div className="space-y-2">
            {b2cTiers.map((tier, i) => (
              <div key={i} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                <span className="font-medium">{tier.name}</span>
                <span className="text-primary font-bold">{tier.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold">B2B Agent Portal</h3>
              <p className="text-sm text-muted-foreground">Agents & brokerages</p>
            </div>
          </div>
          <div className="space-y-2">
            {b2bTiers.map((tier, i) => (
              <div key={i} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                <span className="font-medium">{tier.name}</span>
                <span className="text-accent font-bold">{tier.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-4">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-5 text-center">
          <Percent className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">85%+</p>
          <p className="text-sm text-muted-foreground">Gross Margin</p>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent rounded-xl p-5 text-center">
          <Users className="h-8 w-8 text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold">$55</p>
          <p className="text-sm text-muted-foreground">Blended ARPU</p>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-5 text-center">
          <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">2</p>
          <p className="text-sm text-muted-foreground">Revenue Streams</p>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
