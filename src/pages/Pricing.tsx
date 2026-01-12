import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Zap, Crown, Loader2, Sparkles, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { PAGE_SEO } from "@/lib/seo-config";
import { MEMBERSHIP_TIERS, FEATURE_COMPARISON, PRICING_TESTIMONIALS } from "@/lib/membership-tiers-config";
import { BillingPeriod } from "@/lib/stripe-config";

const tiers = [
  MEMBERSHIP_TIERS.free,
  MEMBERSHIP_TIERS.investor,
  MEMBERSHIP_TIERS.elite,
  MEMBERSHIP_TIERS.private,
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const { loading, startCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [showComparison, setShowComparison] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');

  const handleTierClick = async (tierId: 'free' | 'investor' | 'elite' | 'private') => {
    if (!user) {
      if (tierId !== 'free') {
        // Use sessionStorage for security - clears when tab closes
        sessionStorage.setItem('pending_checkout_tier', tierId);
        sessionStorage.setItem('pending_checkout_billing', billingPeriod);
      }
      navigate('/auth');
      return;
    }

    if (tierId === 'free') {
      navigate('/dashboard');
      return;
    }

    // Private tier uses contact flow
    if (tierId === 'private') {
      window.location.href = '/contact?subject=Private+Membership';
      return;
    }

    const currentTier = profile?.membership_tier;
    const isExpired = profile?.membership_status === 'expired';
    const isTrialing = profile?.membership_status === 'trialing';

    // Same tier and not expired/trialing - manage via portal
    if (currentTier === tierId && !isExpired && !isTrialing) {
      openCustomerPortal();
      return;
    }

    // Downgrade from elite to investor - manage via portal
    if (tierId === 'investor' && currentTier === 'elite' && !isExpired) {
      openCustomerPortal();
      return;
    }

    // Use Stripe hosted checkout (opens in new tab)
    await startCheckout(tierId, billingPeriod);
  };

  const getButtonText = (tierId: 'free' | 'investor' | 'elite' | 'private', defaultCta: string) => {
    if (!user) return "Sign Up";
    if (!profile) return defaultCta;
    
    const currentTier = profile.membership_tier;
    
    if (tierId === currentTier) return "Current Plan";
    if (tierId === 'free' && currentTier !== 'free') return "Downgrade";
    if (tierId === 'investor' && (currentTier === 'elite' || currentTier === 'private')) return "Downgrade";
    if (tierId === 'investor' && currentTier === 'free') return "Upgrade";
    if (tierId === 'elite' && currentTier === 'private') return "Downgrade";
    if (tierId === 'elite' && (currentTier === 'free' || currentTier === 'investor')) return "Upgrade to Elite";
    if (tierId === 'private') return "Request Access";
    
    return defaultCta;
  };

  const isCurrentPlan = (tierId: string) => {
    return profile?.membership_tier === tierId;
  };

  const getPriceDisplay = (tier: typeof tiers[number]) => {
    if (tier.id === 'free') {
      return { price: tier.priceDisplay, period: tier.period };
    }
    
    // Private tier shows "By Application" instead of price
    if (tier.id === 'private') {
      return {
        price: 'Custom',
        period: '',
        isApplication: true,
      };
    }
    
    const paidTier = tier as typeof MEMBERSHIP_TIERS.investor | typeof MEMBERSHIP_TIERS.elite;
    
    if (billingPeriod === 'annual') {
      return {
        price: paidTier.annualMonthlyEquivalent,
        period: '/month',
        fullPrice: paidTier.annualPriceDisplay,
        savings: paidTier.annualSavings,
        billedAs: 'Billed annually',
      };
    }
    
    return { price: paidTier.priceDisplay, period: paidTier.period };
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'investor': return <Zap size={12} />;
      case 'elite': return <Crown size={12} />;
      case 'private': return <Shield size={12} />;
      default: return <Star size={12} />;
    }
  };

  // Group features by category for comparison table
  const categories = [...new Set(FEATURE_COMPARISON.map(f => f.category))];

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
            className="text-center max-w-3xl mx-auto mb-10"
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
              <span className="text-sm font-medium text-primary">Cancel anytime • Secure checkout</span>
            </div>
          </motion.div>

          {/* Billing Period Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  billingPeriod === 'annual'
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Annual
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-emerald-600/20 text-emerald-600'
                }`}>
                  2 Months Free
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {tiers.map((tier, index) => {
              const priceInfo = getPriceDisplay(tier);
              const isPrivate = tier.id === 'private';
              
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative ${tier.highlighted ? "lg:-mt-4 lg:mb-4" : ""}`}
                >
                  {/* Show tier badge OR "Your Plan" badge, not both to avoid overlap */}
                  {isCurrentPlan(tier.id) ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs uppercase tracking-[0.1em] font-sans">
                        <Check size={12} />
                        Your Plan
                      </span>
                    </div>
                  ) : tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.1em] font-sans ${
                        isPrivate 
                          ? 'bg-gold text-gold-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {getTierIcon(tier.id)}
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div
                    className={`h-full rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-card border-2 border-primary shadow-elegant"
                        : isPrivate
                        ? "bg-card border-2 border-gold/50"
                        : isCurrentPlan(tier.id)
                        ? "bg-card border-2 border-green-500/50"
                        : "bg-card border border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-serif text-foreground mb-2">{tier.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl md:text-4xl font-serif text-foreground">
                          {priceInfo.price}
                        </span>
                        {priceInfo.period && (
                          <span className="text-muted-foreground text-sm">{priceInfo.period}</span>
                        )}
                      </div>
                      {'isApplication' in priceInfo && (
                        <p className="text-xs text-gold mt-1">By Application Only</p>
                      )}
                      {'billedAs' in priceInfo && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">{priceInfo.billedAs} ({priceInfo.fullPrice})</p>
                          <p className="text-xs font-medium text-emerald-600">Save {priceInfo.savings}/year</p>
                        </div>
                      )}
                      <p className="text-muted-foreground text-xs mt-3 line-clamp-2">{tier.shortDescription || tier.description}</p>
                    </div>

                    <ul className="space-y-2 mb-8">
                      {tier.features.slice(0, 6).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isPrivate ? 'text-gold' : tier.id === 'elite' ? 'text-gold' : 'text-primary'
                          }`} />
                          <span className="text-xs text-foreground/80">{feature}</span>
                        </li>
                      ))}
                      {tier.features.length > 6 && (
                        <li className="text-xs text-muted-foreground pl-6">
                          +{tier.features.length - 6} more features
                        </li>
                      )}
                    </ul>

                    <Button
                      variant={isPrivate ? "gold" : tier.highlighted ? "default" : "outline"}
                      size="default"
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
              );
            })}
          </div>

          {/* Compare Features Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2"
            >
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showComparison ? "Hide" : "Compare"} All Features
            </Button>
          </motion.div>

          {/* Feature Comparison Table */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto mb-16 overflow-hidden"
              >
                <div className="bg-card rounded-2xl border border-border overflow-x-auto">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 gap-4 p-4 md:p-6 border-b border-border bg-muted/30 min-w-[600px]">
                    <div className="font-medium text-foreground">Features</div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">Free</div>
                      <div className="text-sm text-muted-foreground">$0</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-primary">Investor</div>
                      <div className="text-sm text-muted-foreground">
                        {billingPeriod === 'annual' ? '$24/mo' : '$29/mo'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-medium text-gold">
                        <Crown className="w-4 h-4" />
                        Elite
                      </div>
                      <div className="text-sm text-gold/70">
                        {billingPeriod === 'annual' ? '$81/mo' : '$97/mo'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-medium text-gold">
                        <Shield className="w-4 h-4" />
                        Private
                      </div>
                      <div className="text-sm text-gold/70">
                        By Application
                      </div>
                    </div>
                  </div>

                  {/* Table Body by Category */}
                  {categories.map((category) => (
                    <div key={category}>
                      <div className="px-4 md:px-6 py-3 bg-muted/20 border-b border-border min-w-[600px]">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          {category}
                        </span>
                      </div>
                      {FEATURE_COMPARISON.filter(f => f.category === category).map((item, index) => (
                        <div
                          key={item.feature}
                          className={`grid grid-cols-5 gap-4 px-4 md:px-6 py-3 min-w-[600px] ${
                            index !== FEATURE_COMPARISON.filter(f => f.category === category).length - 1 
                              ? 'border-b border-border/50' 
                              : ''
                          }`}
                        >
                          <div className="text-sm text-foreground/80">{item.feature}</div>
                          <div className="flex justify-center">
                            {item.free ? (
                              <Check className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            {item.investor ? (
                              <Check className="w-5 h-5 text-primary" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            {item.elite ? (
                              <Check className="w-5 h-5 text-gold" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            {item.private ? (
                              <Check className="w-5 h-5 text-gold" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Money-back guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-muted-foreground text-sm">
              30-day money-back guarantee · Cancel anytime · No questions asked
            </p>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto mb-16"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-3">
                What Our <span className="text-gradient-gold">Members</span> Say
              </h2>
              <p className="text-muted-foreground">Join thousands of investors building wealth in Dubai</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic text-sm leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      testimonial.tier === 'private' ? 'bg-gold/20' :
                      testimonial.tier === 'elite' ? 'bg-gold/20' : 'bg-primary/20'
                    }`}>
                      {testimonial.tier === 'private' ? (
                        <Shield className="w-5 h-5 text-gold" />
                      ) : testimonial.tier === 'elite' ? (
                        <Crown className="w-5 h-5 text-gold" />
                      ) : (
                        <Zap className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                        {testimonial.investment && ` • ${testimonial.investment}`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Manage Subscription for users with active/trialing subscriptions */}
          {user && profile && (profile.membership_status === 'active' || profile.membership_status === 'trialing') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
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
