import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Crown, TrendingUp, ArrowRight, Check, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { STRIPE_TIERS, BillingPeriod } from "@/lib/stripe-config";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers-config";

const Upgrade = () => {
  const { profile } = useAuth();
  const { loading, startCheckout } = useSubscription();
  const [searchParams] = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual');

  const currentTier = profile?.membership_tier || "free";
  const isExpired = profile?.membership_status === "expired";
  const highlightedTier = searchParams.get('tier') || 'elite';

  const handleSelectPlan = async (tier: "investor" | "elite" | "private") => {
    if (tier === 'private') {
      window.location.href = '/contact?subject=Private+Membership';
      return;
    }
    await startCheckout(tier, billingPeriod);
  };

  const getPrice = (tier: 'investor' | 'elite' | 'private') => {
    const tierConfig = MEMBERSHIP_TIERS[tier];
    if (billingPeriod === 'annual') {
      return {
        display: tierConfig.annualMonthlyEquivalent,
        period: '/month',
        billedAs: `Billed annually (${tierConfig.annualPriceDisplay})`,
        savings: tierConfig.annualSavings,
      };
    }
    return {
      display: tierConfig.priceDisplay,
      period: tierConfig.period,
    };
  };

  return (
    <>
      <SEOHead
        title="Upgrade Your Membership | Dubai Wealth Hub"
        description="Upgrade your Dubai Wealth Hub membership to unlock premium features and exclusive content."
      />
      <Navbar />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              {isExpired ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Subscription Expired</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                    Your Membership Has Expired
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Renew your subscription to regain access to all premium features, 
                    the community, investment tools, and exclusive content.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Upgrade Your Experience</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                    Unlock More Features
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Take your Dubai real estate investment journey to the next level 
                    with our premium membership tiers.
                  </p>
                </>
              )}
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingPeriod === 'annual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annual
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                    2 Months Free
                  </span>
                </button>
              </div>
            </div>

            {/* What You're Missing (for expired) */}
            {isExpired && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 mb-8"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Features you can't access right now:
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Community discussions & networking",
                    "Investment calculators & tools",
                    "Academy courses & lessons",
                    "Property search & alerts",
                    "AI Investment Assistant",
                    "Market reports & insights",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Investor Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`h-full transition-colors ${
                  highlightedTier === 'investor' 
                    ? 'border-primary/50 shadow-lg shadow-primary/10' 
                    : 'border-border hover:border-primary/30'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <TrendingUp className="h-5 w-5 text-foreground" />
                      </div>
                      <CardTitle>{STRIPE_TIERS.investor.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{getPrice('investor').display}</span>
                      <span className="text-muted-foreground">{getPrice('investor').period}</span>
                    </div>
                    {'billedAs' in getPrice('investor') && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">{getPrice('investor').billedAs}</p>
                        <p className="text-xs font-medium text-green-400">Save {getPrice('investor').savings}/year</p>
                      </div>
                    )}
                    <CardDescription className="mt-2">
                      Perfect for getting started with Dubai real estate investing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {[
                        "Full Academy Access",
                        "Investment Calculators",
                        "Community Access",
                        "AI Investment Assistant",
                        "Property Alerts",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan("investor")}
                      variant={highlightedTier === 'investor' ? 'default' : 'outline'}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {isExpired ? "Renew" : "Select"} Investor
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Elite Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`h-full relative overflow-hidden ${
                  highlightedTier === 'elite' 
                    ? 'border-primary/50 shadow-lg shadow-primary/10' 
                    : 'border-border hover:border-primary/30'
                }`}>
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                      Recommended
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{STRIPE_TIERS.elite.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{getPrice('elite').display}</span>
                      <span className="text-muted-foreground">{getPrice('elite').period}</span>
                    </div>
                    {'billedAs' in getPrice('elite') && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">{getPrice('elite').billedAs}</p>
                        <p className="text-xs font-medium text-green-400">Save {getPrice('elite').savings}/year</p>
                      </div>
                    )}
                    <CardDescription className="mt-2">
                      For serious investors who want every advantage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {[
                        "Everything in Investor",
                        "Priority Off-Plan Access",
                        "Portfolio Tracking",
                        "Elite Community Channels",
                        "1-on-1 Strategy Sessions",
                        "Golden Visa Consultation",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan("elite")}
                      className={`w-full ${highlightedTier === 'elite' ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={highlightedTier === 'elite' ? 'default' : 'outline'}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {isExpired ? "Renew" : "Select"} Elite
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Private Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`h-full relative overflow-hidden ${
                  highlightedTier === 'private' 
                    ? 'border-gold/50 shadow-lg shadow-gold/10' 
                    : 'border-border hover:border-gold/30'
                }`}>
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-gold text-gold-foreground">
                      Concierge
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gold/20">
                        <Shield className="h-5 w-5 text-gold" />
                      </div>
                      <CardTitle>{STRIPE_TIERS.private.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{getPrice('private').display}</span>
                      <span className="text-muted-foreground">{getPrice('private').period}</span>
                    </div>
                    {'billedAs' in getPrice('private') && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">{getPrice('private').billedAs}</p>
                        <p className="text-xs font-medium text-green-400">Save {getPrice('private').savings}/year</p>
                      </div>
                    )}
                    <CardDescription className="mt-2">
                      High-touch advisory with your dedicated team in Dubai
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {[
                        "Everything in Elite",
                        "Dedicated Concierge",
                        "Off-Market Opportunities",
                        "Same-Day Priority Response",
                        "White-Glove Transaction Support",
                        "Quarterly Portfolio Reviews",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-gold" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan("private")}
                      variant="gold"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Request Private Access
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Help Text */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Questions? <a href="/contact" className="text-primary hover:underline">Contact our team</a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Upgrade;
