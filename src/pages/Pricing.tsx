import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { PAGE_SEO } from "@/lib/seo-config";

const tiers = [
  {
    id: 'free' as const,
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
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: 'investor' as const,
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
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: 'elite' as const,
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
    highlighted: false,
    badge: "Best Value",
  },
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const { loading, startCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();

  const handleTierClick = async (tierId: 'free' | 'investor' | 'elite') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (tierId === 'free') {
      navigate('/dashboard');
      return;
    }

    // If user already has this tier or higher
    if (profile?.membership_tier === tierId || 
        (tierId === 'investor' && profile?.membership_tier === 'elite')) {
      openCustomerPortal();
      return;
    }

    await startCheckout(tierId);
  };

  const getButtonText = (tierId: 'free' | 'investor' | 'elite', defaultCta: string) => {
    if (!user) return "Sign Up";
    if (!profile) return defaultCta;
    
    const currentTier = profile.membership_tier;
    
    if (tierId === currentTier) return "Current Plan";
    if (tierId === 'free' && currentTier !== 'free') return "Downgrade";
    if (tierId === 'investor' && currentTier === 'elite') return "Downgrade";
    if (tierId === 'investor' && currentTier === 'free') return "Upgrade";
    if (tierId === 'elite') return "Upgrade to Elite";
    
    return defaultCta;
  };

  const isCurrentPlan = (tierId: string) => {
    return profile?.membership_tier === tierId;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...PAGE_SEO.pricing} />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container-luxury">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
              Membership Plans
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
              Choose Your
              <br />
              <span className="text-gradient-gold">Investment Path</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Select the membership that matches your investment goals. 
              Upgrade or downgrade anytime.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">14-Day Free Trial • Credit Card Required</span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
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

                {isCurrentPlan(tier.id) && (
                  <div className="absolute -top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                      <Crown size={12} />
                      Your Plan
                    </span>
                  </div>
                )}

                <div
                  className={`h-full rounded-2xl p-8 lg:p-10 transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-card border-2 border-primary shadow-elegant"
                      : isCurrentPlan(tier.id)
                      ? "bg-card border-2 border-green-500/50"
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
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => handleTierClick(tier.id)}
                    disabled={loading || isCurrentPlan(tier.id)}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      getButtonText(tier.id, tier.cta)
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground text-sm">
              30-day money-back guarantee · Cancel anytime · No questions asked
            </p>
          </motion.div>

          {/* Manage Subscription for existing subscribers */}
          {user && profile?.membership_tier !== 'free' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mt-8"
            >
              <Button
                variant="outline"
                onClick={() => openCustomerPortal()}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Manage Subscription
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
