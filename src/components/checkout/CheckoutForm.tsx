import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS, BillingPeriod } from "@/lib/stripe-config";
import { trackSubscription, trackTrialStart } from "@/lib/analytics";

interface CheckoutFormProps {
  tier: "investor" | "elite";
  billingPeriod?: BillingPeriod;
  isUpgrade: boolean;
  subscriptionId?: string;
  intentType?: 'setup' | 'payment';
  // New props for SetupIntent flow
  setupIntentId?: string;
  customerId?: string;
  priceId?: string;
}

const CheckoutForm = ({ 
  tier, 
  billingPeriod = 'monthly', 
  isUpgrade, 
  subscriptionId, 
  intentType = 'setup',
  setupIntentId,
  customerId,
  priceId,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tierConfig = STRIPE_TIERS[tier];
  const priceConfig = billingPeriod === 'annual' ? tierConfig.annual : tierConfig.monthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const successUrl = `${window.location.origin}/subscription-success?tier=${tier}`;

      // Always use confirmSetup since we're using SetupIntent for all flows now
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: successUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Setup failed. Please try again.");
        toast({
          title: "Setup Failed",
          description: error.message || "An error occurred during setup.",
          variant: "destructive",
        });
        return;
      }

      // Setup succeeded - now we need to complete the subscription
      // For trial subscriptions, the subscription is already created
      // For non-trial, we need to call complete-subscription
      
      if (subscriptionId) {
        // Trial flow - subscription already exists, just need to refresh status
        await checkSubscription();
        trackTrialStart(tier, billingPeriod);
        
        toast({
          title: "Welcome to Dubai Wealth Hub!",
          description: `Your ${tierConfig.name} trial has started.`,
        });

        navigate(`/subscription-success?tier=${tier}`);
      } else if (setupIntentId && customerId && priceId) {
        // Non-trial flow - need to create the subscription now
        const { data, error: fnError } = await supabase.functions.invoke(
          "complete-subscription",
          {
            body: { 
              setupIntentId, 
              tier, 
              billingPeriod, 
              priceId, 
              customerId 
            },
          }
        );

        if (fnError || data?.error) {
          throw new Error(data?.error || fnError?.message || "Failed to complete subscription");
        }

        await checkSubscription();
        trackSubscription(tier, billingPeriod, priceConfig.price, isUpgrade);
        
        toast({
          title: "Welcome to Dubai Wealth Hub!",
          description: `Your ${tierConfig.name} membership is now active.`,
        });

        navigate(`/subscription-success?tier=${tier}`);
      } else {
        // Fallback - just check subscription and navigate
        await checkSubscription();
        navigate(`/subscription-success?tier=${tier}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
          paymentMethodOrder: ["apple_pay", "google_pay", "card"],
        }}
      />

      {errorMessage && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full mt-6 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {isUpgrade ? "Upgrade Now" : "Subscribe Now"} — {priceConfig.priceDisplay}{priceConfig.period}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        You will be charged {priceConfig.priceDisplay} {billingPeriod === 'annual' ? 'per year' : 'per month'}.
      </p>
    </form>
  );
};

export default CheckoutForm;
