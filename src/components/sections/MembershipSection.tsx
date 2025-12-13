import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic insights and community access.",
    features: [
      "Limited market reports",
      "Basic community access",
      "Property listings browser",
      "Newsletter & updates",
    ],
    cta: "Sign Up Free",
    variant: "outline" as const,
    highlighted: false,
    tier: "free" as const,
  },
  {
    name: "Dubai Investor",
    price: "$29",
    period: "/month",
    description: "Full access to education, tools, and community for serious investors.",
    features: [
      "Full Academy access (50+ lessons)",
      "All investment tools & calculators",
      "Core community channels",
      "Monthly market reports",
      "Basic AI Assistant",
      "Off-plan project browser",
      "Email support",
    ],
    cta: "Start Investing",
    variant: "hero" as const,
    highlighted: true,
    badge: "Most Popular",
    tier: "investor" as const,
  },
  {
    name: "Dubai Elite Investor",
    price: "$97",
    period: "/month",
    description: "Priority access, advanced AI, and elite networking for serious wealth builders.",
    features: [
      "Everything in Dubai Investor, plus:",
      "Priority off-plan allocations",
      "AI Investment Blueprint Generator",
      "Portfolio tracking dashboard",
      "Elite-only community & deal room",
      "Weekly market intelligence",
      "Monthly live investor calls",
      "Direct expert consultation",
      "Elite badge on profile",
    ],
    cta: "Go Elite",
    variant: "secondary" as const,
    highlighted: false,
    badge: "Best Value",
    tier: "elite" as const,
  },
];

export function MembershipSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startCheckout, loading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleTierClick = async (tier: "free" | "investor" | "elite") => {
    if (tier === "free") {
      navigate('/auth');
      return;
    }

    if (!user) {
      localStorage.setItem('pending_checkout_tier', tier);
      navigate('/auth');
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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
            Membership
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
            Choose Your
            <br />
            <span className="text-gradient-gold">Investment Path</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Select the membership that matches your investment goals. 
            Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative ${tier.highlighted ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs uppercase tracking-[0.1em] font-sans">
                    {tier.name === "Dubai Investor" ? <Zap size={12} /> : <Star size={12} />}
                    {tier.badge}
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-2xl p-8 lg:p-10 transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-card border-2 border-primary shadow-elegant"
                    : "bg-card border border-border hover:border-primary/30"
                }`}
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-serif text-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-serif text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-4">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-10">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
                      Redirecting...
                    </>
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
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
