import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Shield, Check, ArrowLeft, Loader2, Lock } from "lucide-react";
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
  const [setupIntentId, setSetupIntentId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'setup' | 'payment'>('setup');
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
      setSubscriptionId(data.subscriptionId || null);
      setSetupIntentId(data.setupIntentId || null);
      setCustomerId(data.customerId || null);
      setPriceId(data.priceId || null);
      setIntentType(data.intentType || 'setup');
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
      colorBackground: "#0D1321",
      colorText: "#FFFFFF",
      colorTextSecondary: "#9CA3AF",
      colorDanger: "#EF4444",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "12px",
      spacingUnit: "5px",
    },
    rules: {
      ".Input": {
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
        padding: "14px 16px",
        transition: "all 0.2s ease",
      },
      ".Input:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      },
      ".Input:focus": {
        border: "1px solid #CBB89E",
        boxShadow: "0 0 0 3px rgba(203, 184, 158, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.2)",
      },
      ".Label": {
        color: "#9CA3AF",
        fontSize: "13px",
        fontWeight: "500",
        marginBottom: "8px",
      },
      ".Tab": {
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        padding: "12px 16px",
        transition: "all 0.2s ease",
      },
      ".Tab:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      },
      ".Tab--selected": {
        backgroundColor: "#CBB89E",
        borderColor: "#CBB89E",
        color: "#0A0F1D",
      },
      ".TabIcon": {
        fill: "#9CA3AF",
      },
      ".TabIcon--selected": {
        fill: "#0A0F1D",
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
            
            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">Choose Plan</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-foreground">2</span>
                </div>
                <span className="text-foreground font-medium">Payment</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                Complete Your {tierConfig.name} Membership
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Secure your access to Dubai's exclusive real estate investment community.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Checkout Form */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20">
                  {/* Subtle gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  
                  <div className="relative">
                    <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Payment Details
                    </h2>
                    
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
                        subscriptionId={subscriptionId || undefined}
                        intentType={intentType}
                        setupIntentId={setupIntentId || undefined}
                        customerId={customerId || undefined}
                        priceId={priceId || undefined}
                      />
                    </Elements>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>256-bit SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>Cancel anytime</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>Instant access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>PCI DSS compliant</span>
                      </div>
                    </div>
                    
                    {/* Stripe Trust Badge & Payment Methods */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        <span className="text-xs">Powered by</span>
                        {/* Official Stripe Blurple Logo */}
                        <svg className="h-5 w-auto" viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M360 77.4001C360 51.8001 347.6 31.6001 323.9 31.6001C300.1 31.6001 285.7 51.8001 285.7 77.2001C285.7 107.3 302.7 122.5 327.1 122.5C339 122.5 348 119.8 354.8 116V96.0001C348 99.4001 340.2 101.5 330.3 101.5C320.6 101.5 312 98.1001 310.9 86.3001H359.8C359.8 85.0001 360 79.8001 360 77.4001ZM310.6 67.9001C310.6 56.6001 317.5 51.9001 323.8 51.9001C329.9 51.9001 336.4 56.6001 336.4 67.9001H310.6Z" fill="#635BFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M247.1 31.6001C237.3 31.6001 231 36.2001 227.5 39.4001L226.2 33.2001H204.2V149.8L229.2 144.5L229.3 116.2C232.9 118.8 238.2 122.5 247 122.5C264.9 122.5 281.2 108.1 281.2 76.4001C281.1 47.4001 264.6 31.6001 247.1 31.6001ZM241.1 100.5C235.2 100.5 231.7 98.4001 229.3 95.8001L229.2 58.7001C231.8 55.8001 235.4 53.8001 241.1 53.8001C250.2 53.8001 256.5 64.0001 256.5 77.1001C256.5 90.5001 250.3 100.5 241.1 100.5Z" fill="#635BFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M169.8 25.7L194.9 20.3V0L169.8 5.3V25.7Z" fill="#635BFF"/>
                          <path d="M194.9 33.3H169.8V120.8H194.9V33.3Z" fill="#635BFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M142.9 40.7L141.3 33.3H119.7V120.8H144.7V61.5C150.6 53.8 160.6 55.2 163.7 56.3V33.3C160.5 32.1 148.8 29.9 142.9 40.7Z" fill="#635BFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M92.8999 11.6001L68.4999 16.8001L68.3999 96.9001C68.3999 111.7 79.4999 122.6 94.2999 122.6C102.5 122.6 108.5 121.1 111.8 119.3V99.0001C108.6 100.3 92.7999 104.9 92.7999 90.1001V54.6001H111.8V33.3001H92.7999L92.8999 11.6001Z" fill="#635BFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M25.3 58.7001C25.3 54.8001 28.5 53.3001 33.8 53.3001C41.4 53.3001 51 55.6001 58.6 59.7001V36.2001C50.3 32.9001 42.1 31.6001 33.8 31.6001C13.5 31.6001 0 42.2001 0 59.9001C0 87.5001 38 83.1001 38 95.0001C38 99.6001 34 101.1 28.4 101.1C20.1 101.1 9.5 97.7001 1.1 93.1001V116.9C10.4 120.9 19.8 122.6 28.4 122.6C49.2 122.6 63.5 112.3 63.5 94.4001C63.4 64.6001 25.3 69.9001 25.3 58.7001Z" fill="#635BFF"/>
                        </svg>
                      </div>
                      
                      {/* Payment Method Icons */}
                      <div className="flex items-center gap-2">
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
                        <div className="bg-[#006FCF] rounded px-2 py-1 flex items-center justify-center">
                          <svg className="h-4 w-auto" viewBox="0 0 40 14" fill="none">
                            <text x="2" y="11" fill="white" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold">AMEX</text>
                          </svg>
                        </div>
                        {/* Apple Pay */}
                        <div className="bg-black rounded px-2 py-1 flex items-center justify-center">
                          <svg className="h-4 w-auto" viewBox="0 0 43 18" fill="white">
                            <path d="M7.854 3.182c.527-.677.886-1.607.79-2.537-.768.032-1.696.512-2.245 1.156-.492.565-.922 1.479-.805 2.35.853.065 1.729-.437 2.26-1.119m.78 1.172c-1.244-.073-2.305.707-2.896.707-.593 0-1.505-.67-2.481-.652-1.276.02-2.458.743-3.116 1.882-1.331 2.307-.342 5.722.955 7.595.633.927 1.389 1.954 2.384 1.918.953-.038 1.316-.618 2.466-.618 1.152 0 1.478.618 2.486.599 1.028-.018 1.675-.927 2.308-1.864.719-1.053 1.016-2.07 1.034-2.124-.023-.01-1.98-.762-2-3.02-.018-1.89 1.542-2.798 1.614-2.853-.88-1.304-2.252-1.451-2.74-1.486m8.135-2.447v12.96h2.017V10.52h2.79c2.548 0 4.34-1.752 4.34-4.31 0-2.557-1.759-4.303-4.27-4.303h-4.877zm2.017 1.679h2.328c1.75 0 2.75.93 2.75 2.63 0 1.7-.999 2.64-2.759 2.64h-2.32V3.586zm11.917 11.408c1.268 0 2.443-.643 2.979-1.66h.04v1.533h1.867V8.432c0-1.875-1.498-3.084-3.802-3.084-2.132 0-3.722 1.227-3.782 2.913h1.816c.15-.804.901-1.332 1.894-1.332 1.226 0 1.914.573 1.914 1.628v.714l-2.503.151c-2.327.14-3.587 1.096-3.587 2.76 0 1.68 1.302 2.812 3.164 2.812zm.539-1.52c-1.067 0-1.746-.513-1.746-1.298 0-.81.652-1.28 1.897-1.355l2.23-.143v.73c0 1.205-1.02 2.066-2.381 2.066zm6.394 5.067c1.966 0 2.89-.752 3.698-3.032l3.546-9.931h-2.06l-2.38 7.643h-.04l-2.38-7.643h-2.112l3.418 9.464-.185.577c-.309.975-.81 1.353-1.705 1.353-.16 0-.468-.017-.595-.035v1.552c.118.035.619.052.795.052z"/>
                          </svg>
                        </div>
                        {/* Google Pay */}
                        <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                          <svg className="h-4 w-auto" viewBox="0 0 41 17" fill="none">
                            <path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.997-2.583.997h-2.485z" fill="#5F6368"/>
                            <path d="M27.194 10.442c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.196-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.12.148-1.528.442-.409.294-.613.652-.613 1.093m1.946-5.815c1.112 0 1.989.297 2.633.89.642.594.964 1.408.964 2.442v4.932h-1.439v-1.11h-.065c-.622.914-1.45 1.372-2.486 1.372-.882 0-1.621-.262-2.215-.784-.594-.523-.891-1.176-.891-1.96 0-.828.313-1.486.94-1.976s1.463-.735 2.51-.735c.892 0 1.629.163 2.206.49v-.344c0-.522-.207-.966-.621-1.33a2.132 2.132 0 00-1.455-.547c-.84 0-1.504.353-1.995 1.062l-1.324-.834c.731-1.045 1.822-1.568 3.238-1.568" fill="#5F6368"/>
                            <path d="M40.993 4.889l-5.02 11.53H34.42l1.864-4.034-3.302-7.496h1.635l2.387 5.749h.032l2.322-5.75h1.635z" fill="#5F6368"/>
                            <path d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 01-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944" fill="#4285F4"/>
                            <path d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 006.01 3.703" fill="#34A853"/>
                            <path d="M3.212 8.267a4.034 4.034 0 010-2.572V3.964H.978A6.678 6.678 0 000 6.982c0 1.085.26 2.11.978 3.017l2.234-1.732z" fill="#FABB05"/>
                            <path d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.747 8.804.263 6.989.263a6.728 6.728 0 00-6.01 3.701l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774" fill="#E94235"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Message */}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Your payment information is encrypted and securely processed.
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