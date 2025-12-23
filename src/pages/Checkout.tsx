import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Shield, Check, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import PlanSummary from "@/components/checkout/PlanSummary";
import { SEOHead } from "@/components/SEOHead";
import { STRIPE_TIERS, STRIPE_PUBLISHABLE_KEY, BillingPeriod } from "@/lib/stripe-config";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const { tier } = useParams<{ tier: string }>();
  const [searchParams] = useSearchParams();
  const isUpgrade = searchParams.get("upgrade") === "true";
  const billingPeriod = (searchParams.get("billing") || 'monthly') as BillingPeriod;
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'setup' | 'payment'>('payment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validTier = tier === "investor" || tier === "elite" ? tier : null;
  const tierConfig = validTier ? STRIPE_TIERS[validTier] : null;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Store intent and redirect to auth
      if (validTier) {
        localStorage.setItem("pending_checkout_tier", validTier);
        localStorage.setItem("pending_checkout_billing", billingPeriod);
        if (isUpgrade) {
          localStorage.setItem("pending_checkout_upgrade", "true");
        }
      }
      navigate("/auth");
      return;
    }

    if (!validTier || !tierConfig) {
      navigate("/pricing");
      return;
    }

    createSubscriptionIntent();
  }, [user, authLoading, validTier]);

  const createSubscriptionIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-subscription-intent",
        {
          body: { tier: validTier, isUpgrade, billingPeriod },
        }
      );

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      setIntentType(data.intentType || 'payment');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize checkout";
      setError(message);
      toast({
        title: "Checkout Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#CBB89E",
      colorBackground: "#0A0F1D",
      colorText: "#FFFFFF",
      colorDanger: "#ef4444",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "12px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        backgroundColor: "hsl(222, 47%, 11%)",
        border: "1px solid hsl(217, 33%, 17%)",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #CBB89E",
        boxShadow: "0 0 0 1px #CBB89E",
      },
      ".Label": {
        color: "hsl(215, 20%, 65%)",
        fontSize: "14px",
        fontWeight: "500",
      },
      ".Tab": {
        backgroundColor: "hsl(222, 47%, 11%)",
        border: "1px solid hsl(217, 33%, 17%)",
      },
      ".Tab--selected": {
        backgroundColor: "#CBB89E",
        borderColor: "#CBB89E",
        color: "#0A0F1D",
      },
    },
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const hasActiveSubscription = error.includes("already have an active subscription");
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className={`${hasActiveSubscription ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'} border rounded-2xl p-8`}>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {hasActiveSubscription ? "You're Already Subscribed!" : "Checkout Error"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {hasActiveSubscription 
                ? "You already have an active subscription. Use the customer portal to manage your plan, upgrade, or update payment methods."
                : error}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {hasActiveSubscription ? (
                <>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={() => navigate("/settings")}>
                    Manage Subscription
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/pricing")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Pricing
                  </Button>
                  <Button onClick={createSubscriptionIntent}>Try Again</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret || !tierConfig) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Checkout | Dubai Wealth Hub"
        description="Complete your subscription to Dubai Wealth Hub"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pricing")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isUpgrade ? "Upgrade Your Membership" : "Start Your Journey"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                {isUpgrade ? "Upgrade to" : "Join"} {tierConfig.name}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Complete your payment details below to {isUpgrade ? "upgrade" : "start"} your membership
                {!isUpgrade && billingPeriod === 'monthly' && " with a 14-day free trial"}.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Checkout Form */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Payment Details</h2>
                  
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance,
                    }}
                  >
                    <CheckoutForm
                      tier={validTier}
                      billingPeriod={billingPeriod}
                      isUpgrade={isUpgrade}
                      subscriptionId={subscriptionId!}
                      intentType={intentType}
                    />
                  </Elements>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>256-bit SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Cancel anytime</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Instant access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Secure payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <PlanSummary
                  tier={validTier}
                  billingPeriod={billingPeriod}
                  isUpgrade={isUpgrade}
                  userEmail={user?.email || ""}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
