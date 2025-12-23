import { motion } from "framer-motion";
import { AlertCircle, Crown, TrendingUp, ArrowRight, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { STRIPE_TIERS } from "@/lib/stripe-config";

const Upgrade = () => {
  const { profile, user } = useAuth();
  const { loading, startCheckout } = useSubscription();

  const currentTier = profile?.membership_tier || "free";
  const isExpired = profile?.membership_status === "expired";

  const handleSelectPlan = async (tier: "investor" | "elite") => {
    await startCheckout(tier);
  };

  return (
    <>
      <SEOHead
        title="Upgrade Your Membership | Dubai Wealth Hub"
        description="Upgrade your Dubai Wealth Hub membership to unlock premium features and exclusive content."
      />
      <Navbar />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Investor Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <TrendingUp className="h-5 w-5 text-foreground" />
                      </div>
                      <CardTitle>{STRIPE_TIERS.investor.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{STRIPE_TIERS.investor.monthly.priceDisplay}</span>
                      <span className="text-muted-foreground">{STRIPE_TIERS.investor.monthly.period}</span>
                    </div>
                    <CardDescription>
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
                      variant="outline"
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
                <Card className="h-full border-primary/50 shadow-lg shadow-primary/10 relative overflow-hidden">
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
                      <span className="text-3xl font-bold">{STRIPE_TIERS.elite.monthly.priceDisplay}</span>
                      <span className="text-muted-foreground">{STRIPE_TIERS.elite.monthly.period}</span>
                    </div>
                    <CardDescription>
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
                      className="w-full bg-primary hover:bg-primary/90"
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
