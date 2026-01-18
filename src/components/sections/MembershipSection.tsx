import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { STRIPE_TIERS, type BillingPeriod } from "@/lib/stripe-config";

const tiers = [
  {
    name: "Explorer",
    monthlyPrice: "$0",
    annualPrice: "$0",
    period: "forever",
    annualPeriod: "forever",
    description: "Learn the fundamentals at your own pace.",
    features: [
      "Browse property listings",
      "Basic community access",
      "Weekly market updates",
    ],
    cta: "Start Learning Free",
    variant: "outline" as const,
    highlighted: false,
    tier: "free" as const,
    icon: Star,
  },
  {
    name: "Investor",
    monthlyPrice: STRIPE_TIERS.investor.monthly.priceDisplay,
    annualPrice: STRIPE_TIERS.investor.annual.monthlyEquivalent,
    period: "/month",
    annualPeriod: "/month (billed yearly)",
    annualSavings: STRIPE_TIERS.investor.annual.savingsDisplay,
    description: "Everything you need to invest with confidence.",
    features: [
      "Full Academy (50+ lessons)",
      "All investment calculators",
      "AI-powered deal analysis",
      "Save & compare properties",
      "Core community channels",
      "Monthly market intelligence",
    ],
    cta: "Get Full Access",
    variant: "hero" as const,
    highlighted: true,
    badge: "Most Popular",
    tier: "investor" as const,
    icon: Zap,
  },
  {
    name: "Investor Pro",
    monthlyPrice: STRIPE_TIERS.elite.monthly.priceDisplay,
    annualPrice: STRIPE_TIERS.elite.annual.monthlyEquivalent,
    period: "/month",
    annualPeriod: "/month (billed yearly)",
    annualSavings: STRIPE_TIERS.elite.annual.savingsDisplay,
    description: "Priority access and personalized guidance.",
    features: [
      "Everything in Investor, plus:",
      "Priority off-plan allocations",
      "AI Investment Blueprint",
      "Portfolio tracking dashboard",
      "Elite-only Deal Room",
      "Weekly intelligence reports",
      "Direct expert consultation",
    ],
    cta: "Unlock Pro Features",
    variant: "default" as const,
    highlighted: false,
    badge: "Best Value",
    tier: "elite" as const,
    icon: Crown,
  },
  {
    name: "Private",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    period: "",
    annualPeriod: "",
    annualSavings: null,
    description: "Your dedicated team in Dubai.",
    features: [
      "Everything in Pro, plus:",
      "Dedicated concierge",
      "Off-market opportunities",
      "Direct advisory support",
      "Same-day priority response",
      "White-glove transaction support",
    ],
    cta: "Request Access",
    variant: "private" as const,
    highlighted: false,
    badge: "Concierge",
    tier: "private" as const,
    icon: Shield,
    isApplication: true,
  },
];

export function MembershipSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, loading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  const handleTierClick = async (tier: "free" | "investor" | "elite" | "private") => {
    if (tier === "free") {
      navigate('/auth');
      return;
    }

    if (!user) {
      sessionStorage.setItem('pending_checkout_tier', tier);
      sessionStorage.setItem('pending_checkout_billing', isAnnual ? 'annual' : 'monthly');
      navigate('/auth');
      return;
    }

    // For private tier, navigate to contact/upgrade page
    if (tier === "private") {
      navigate('/upgrade?tier=private');
      return;
    }

    setLoadingTier(tier);
    const billingPeriod: BillingPeriod = isAnnual ? 'annual' : 'monthly';
    await startCheckout(tier, billingPeriod);
    setLoadingTier(null);
  };
  
  return (
    <section id="membership" className="section-padding bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-transparent to-transparent" />

      <div className="container-luxury relative">
        {/* Section Header - Advisory tone */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
            Your Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Choose Your Path
            <br />
            <span className="text-gradient-gold">to Confidence</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Start free. Upgrade when you're ready. Go at your own pace.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label 
              htmlFor="billing-toggle" 
              className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="billing-toggle" 
              className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Annual
            </Label>
            {isAnnual && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Save up to 17%
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards - 4 tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${tier.highlighted ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.1em] font-sans">
                    <tier.icon size={12} />
                    {tier.badge}
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-card border-2 border-primary shadow-elegant"
                    : "bg-card border border-border hover:border-primary/30"
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-lg font-serif text-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl md:text-4xl font-serif text-foreground">
                      {isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    {(isAnnual ? tier.annualPeriod : tier.period) && (
                      <span className="text-muted-foreground text-sm">
                        {isAnnual ? tier.annualPeriod : tier.period}
                      </span>
                    )}
                  </div>
                  {'isApplication' in tier && tier.isApplication && (
                    <span className="inline-block mt-2 text-xs text-gold font-medium">
                      By Application Only
                    </span>
                  )}
                  {isAnnual && tier.annualSavings && (
                    <span className="inline-block mt-2 text-xs text-emerald-500 font-medium">
                      {tier.annualSavings}
                    </span>
                  )}
                  <p className="text-muted-foreground text-sm mt-3">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.variant}
                  size="default"
                  className="w-full min-h-[48px] text-xs sm:text-sm"
                  onClick={() => handleTierClick(tier.tier)}
                  disabled={loading || loadingTier === tier.tier}
                >
                  {loadingTier === tier.tier ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            30-day money-back guarantee · Cancel anytime · No questions asked
          </p>
        </motion.div>
      </div>
    </section>
  );
}
