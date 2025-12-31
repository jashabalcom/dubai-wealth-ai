import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Shield, Check, ArrowLeft, Loader2, Sparkles, Lock, CreditCard } from "lucide-react";
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'setup' | 'payment'>('payment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Include private tier in validation
  const validTier = tier === "investor" || tier === "elite" || tier === "private" ? tier : null;
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

    // Private tier uses contact form, not Stripe checkout
    if (validTier === "private") {
      navigate("/contact?subject=Private+Membership");
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

  if (!clientSecret || !tierConfig || validTier === "private") {
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
              <Lock className="h-4 w-4 text-emerald-600" />
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
                      tier={validTier as "investor" | "elite"}
                      billingPeriod={billingPeriod}
                      isUpgrade={isUpgrade}
                      subscriptionId={subscriptionId!}
                      intentType={intentType}
                    />
                  </Elements>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>256-bit SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Cancel anytime</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Instant access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>PCI DSS compliant</span>
                      </div>
                    </div>
                    
                    {/* Stripe Trust Badge & Payment Methods */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs">Powered by</span>
                        <svg className="h-5 w-auto" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M59.64 14.28H60.08V14.28H60.1L60.08 14.28H59.64ZM25.244 7.05C25.244 5.86 26.244 5.39 27.864 5.39C30.164 5.39 33.074 6.13 35.374 7.47V2.39C32.864 1.39 30.384 1.01 27.864 1.01C22.244 1.01 18.524 3.88 18.524 8.43C18.524 15.43 28.244 14.25 28.244 17.29C28.244 18.68 27.024 19.15 25.284 19.15C22.764 19.15 19.534 18.13 17.024 16.63V21.81C19.804 23.02 22.624 23.52 25.284 23.52C31.044 23.52 34.984 20.74 34.984 16.11C34.954 8.57 25.244 9.97 25.244 7.05ZM6.024 2.11L0 23.11H6.81L7.614 20.11H14.464L15.274 23.11H22.084L16.064 2.11H6.024ZM8.944 15.58L11.034 8.07L13.124 15.58H8.944ZM44.244 2.11L38.224 23.11H45.034L45.838 20.11H52.688L53.498 23.11H60.308L54.288 2.11H44.244ZM47.164 15.58L49.254 8.07L51.344 15.58H47.164Z" fill="currentColor"/>
                        </svg>
                      </div>
                      
                      {/* Payment Method Icons */}
                      <div className="flex items-center gap-3">
                        {/* Visa */}
                        <div className="bg-white rounded px-2 py-1">
                          <svg className="h-4 w-auto" viewBox="0 0 50 16" fill="none">
                            <path d="M19.13 15.3H15.56L17.88 0.69H21.44L19.13 15.3Z" fill="#00579F"/>
                            <path d="M34.07 1.02C33.35 0.73 32.22 0.42 30.82 0.42C27.29 0.42 24.83 2.25 24.81 4.86C24.79 6.79 26.62 7.87 28.01 8.52C29.44 9.19 29.93 9.62 29.93 10.21C29.92 11.1 28.83 11.52 27.81 11.52C26.39 11.52 25.64 11.31 24.47 10.81L24.01 10.59L23.51 13.71C24.38 14.1 25.99 14.44 27.67 14.46C31.41 14.46 33.82 12.65 33.85 9.85C33.87 8.33 32.9 7.18 30.81 6.23C29.53 5.6 28.76 5.18 28.76 4.54C28.77 3.97 29.41 3.37 30.8 3.37C31.96 3.35 32.82 3.64 33.48 3.93L33.81 4.09L34.07 1.02Z" fill="#00579F"/>
                            <path d="M39.15 9.97C39.45 9.15 40.61 6.07 40.61 6.07C40.59 6.1 40.91 5.24 41.1 4.71L41.36 5.93C41.36 5.93 42.06 9.27 42.21 9.97H39.15ZM43.69 0.69H40.93C40.09 0.69 39.45 0.94 39.07 1.8L33.79 15.3H37.53L38.29 13.08H42.84C42.96 13.57 43.36 15.3 43.36 15.3H46.68L43.69 0.69Z" fill="#00579F"/>
                            <path d="M13.22 0.69L9.72 10.5L9.34 8.62C8.66 6.36 6.53 3.89 4.16 2.65L7.37 15.28H11.14L17 0.69H13.22Z" fill="#00579F"/>
                            <path d="M6.19 0.69H0.5L0.46 0.97C4.9 2.07 7.84 4.77 9.1 8.04L7.82 1.82C7.6 0.97 6.97 0.72 6.19 0.69Z" fill="#FAA61A"/>
                          </svg>
                        </div>
                        {/* Mastercard */}
                        <div className="bg-white rounded px-2 py-1">
                          <svg className="h-4 w-auto" viewBox="0 0 32 20" fill="none">
                            <circle cx="10" cy="10" r="10" fill="#EB001B"/>
                            <circle cx="22" cy="10" r="10" fill="#F79E1B"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M16 17.3C18.2 15.5 19.6 12.9 19.6 10C19.6 7.1 18.2 4.5 16 2.7C13.8 4.5 12.4 7.1 12.4 10C12.4 12.9 13.8 15.5 16 17.3Z" fill="#FF5F00"/>
                          </svg>
                        </div>
                        {/* Amex */}
                        <div className="bg-[#006FCF] rounded px-2 py-1">
                          <svg className="h-4 w-auto" viewBox="0 0 40 12" fill="none">
                            <path d="M5 0L0 12H6L7 9H11L12 12H18V0H12V8L10 0H8L6 8V0H5ZM20 0L16 12H21L22 9H26L27 12H33L29 0H20ZM24 3L26 7H22L24 3ZM33 0V12H39V8H36V6H39V4H36V2H39V0H33Z" fill="white"/>
                          </svg>
                        </div>
                        {/* Apple Pay */}
                        <div className="bg-black rounded px-2 py-1">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Message */}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Your payment information is encrypted and securely processed by Stripe. 
                      We never store your full card details on our servers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <PlanSummary
                  tier={validTier as "investor" | "elite"}
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
