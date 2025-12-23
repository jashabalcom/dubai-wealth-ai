import { Check, Crown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STRIPE_TIERS, BillingPeriod } from "@/lib/stripe-config";

interface PlanSummaryProps {
  tier: "investor" | "elite";
  billingPeriod?: BillingPeriod;
  isUpgrade: boolean;
  userEmail: string;
}

const TIER_FEATURES = {
  investor: [
    "Full Academy Access (20+ courses)",
    "Investment Calculators Suite",
    "Community Access",
    "Monthly Market Reports",
    "AI Investment Assistant",
    "Property Search & Alerts",
  ],
  elite: [
    "Everything in Investor, plus:",
    "Priority Off-Plan Access",
    "AI Investor Blueprint Generator",
    "Portfolio Tracking Dashboard",
    "Elite-Only Community Channels",
    "Weekly Insights Reports",
    "1-on-1 Strategy Sessions",
    "Golden Visa Consultation",
  ],
};

const PlanSummary = ({ tier, billingPeriod = 'monthly', isUpgrade, userEmail }: PlanSummaryProps) => {
  const features = TIER_FEATURES[tier];
  const isElite = tier === "elite";
  const tierConfig = STRIPE_TIERS[tier];
  const priceConfig = billingPeriod === 'annual' ? tierConfig.annual : tierConfig.monthly;

  return (
    <div className="sticky top-24">
      <div className={`bg-card border rounded-2xl overflow-hidden ${
        isElite ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border"
      }`}>
        {/* Header */}
        <div className={`p-6 ${isElite ? "bg-primary/5" : "bg-muted/30"}`}>
          <div className="flex items-center gap-3 mb-4">
            {isElite ? (
              <div className="p-2 rounded-lg bg-primary/20">
                <Crown className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{tierConfig.name}</h3>
              {isElite && (
                <Badge variant="secondary" className="mt-1 bg-primary/20 text-primary border-0 text-xs">
                  Most Popular
                </Badge>
              )}
            </div>
          </div>

          {billingPeriod === 'annual' && 'monthlyEquivalent' in priceConfig ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{priceConfig.monthlyEquivalent}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billed annually ({priceConfig.priceDisplay})
              </p>
              <p className="text-xs font-medium text-green-400 mt-1">
                {priceConfig.savingsDisplay}
              </p>
            </>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{priceConfig.priceDisplay}</span>
              <span className="text-muted-foreground">{priceConfig.period}</span>
            </div>
          )}

          {!isUpgrade && billingPeriod === 'monthly' && (
            <p className="text-sm text-primary mt-2 font-medium">
              14-day free trial included
            </p>
          )}
        </div>

        {/* Features */}
        <div className="p-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">What's included:</h4>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Info */}
        <div className="p-6 border-t border-border bg-muted/20">
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Account</p>
            <p className="text-foreground font-medium truncate">{userEmail}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-6 border-t border-border">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {tierConfig.name} ({billingPeriod === 'annual' ? 'Annual' : 'Monthly'})
              </span>
              <span className="text-foreground">{priceConfig.priceDisplay}{priceConfig.period}</span>
            </div>
            {!isUpgrade && billingPeriod === 'monthly' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">14-day trial</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>
            )}
            <div className="pt-3 border-t border-border flex justify-between">
              <span className="font-medium text-foreground">Due today</span>
              <span className="font-bold text-foreground">
                {isUpgrade || billingPeriod === 'annual' ? priceConfig.priceDisplay : "$0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default PlanSummary;
