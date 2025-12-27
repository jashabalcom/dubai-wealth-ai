import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore Dubai real estate basics and community access.",
    features: [
      "Property listings browser",
      "Basic community access",
      "Newsletter & market updates",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    highlighted: false,
    tier: "free" as const,
    icon: Star,
  },
  {
    name: "Dubai Investor",
    price: "$29",
    period: "/month",
    description: "Full access to education, tools, and community.",
    features: [
      "Full Academy (50+ lessons)",
      "All investment calculators",
      "AI-powered analysis",
      "Save & compare properties",
      "Core community channels",
      "Monthly market reports",
    ],
    cta: "Become an Investor",
    variant: "hero" as const,
    highlighted: true,
    badge: "Recommended",
    tier: "investor" as const,
    icon: Zap,
  },
  {
    name: "Dubai Elite",
    price: "$97",
    period: "/month",
    description: "Priority access, advanced AI, and elite networking.",
    features: [
      "Everything in Investor, plus:",
      "Priority off-plan allocations",
      "AI Investment Blueprint",
      "Portfolio tracking dashboard",
      "Elite-only Deal Room",
      "Weekly intelligence reports",
      "Direct expert consultation",
    ],
    cta: "Go Elite",
    variant: "secondary" as const,
    highlighted: false,
    badge: "Best Value",
    tier: "elite" as const,
    icon: Crown,
  },
  {
    name: "Dubai Private",
    price: "$149",
    period: "/month",
    description: "You now have a team in Dubai.",
    features: [
      "Everything in Elite, plus:",
      "Dedicated concierge",
      "Off-market opportunities",
      "Direct advisory support",
      "Same-day priority response",
      "White-glove transaction support",
    ],
    cta: "Request Private Access",
    variant: "outline" as const,
    highlighted: false,
    badge: "Concierge",
    tier: "private" as const,
    icon: Shield,
  },
];

export function MembershipSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, loading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleTierClick = async (tier: "free" | "investor" | "elite" | "private") => {
    if (tier === "free") {
      navigate('/auth');
      return;
    }

    if (!user) {
      localStorage.setItem('pending_checkout_tier', tier);
      navigate('/auth');
      return;
    }

    // For private tier, navigate to contact/upgrade page
    if (tier === "private") {
      navigate('/upgrade?tier=private');
      return;
    }

    setLoadingTier(tier);
    await startCheckout(tier);
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
            Membership
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Choose Your
            <br />
            <span className="text-gradient-gold">Level of Access</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Select the membership that aligns with your investment goals. 
            Upgrade or adjust anytime.
          </p>
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
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
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
                  size="lg"
                  className="w-full"
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
