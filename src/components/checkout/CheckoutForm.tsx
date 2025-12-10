import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface CheckoutFormProps {
  tier: "investor" | "elite";
  tierConfig: {
    name: string;
    price: number;
    priceDisplay: string;
    period: string;
  };
  isUpgrade: boolean;
  subscriptionId: string;
  intentType?: 'setup' | 'payment';
}

const CheckoutForm = ({ tier, tierConfig, isUpgrade, subscriptionId, intentType = 'payment' }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkSubscription } = useSubscription();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const successUrl = `${window.location.origin}/subscription-success?tier=${tier}`;

      // For trial subscriptions, use confirmSetup; for immediate charges, use confirmPayment
      if (intentType === 'setup') {
        // Setup Intent - collecting payment method for trial (no immediate charge)
        const { error } = await stripe.confirmSetup({
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
        } else {
          // Setup succeeded - trial started
          await checkSubscription();
          
          toast({
            title: "Welcome to Dubai Wealth Hub!",
            description: `Your ${tierConfig.name} trial has started. You won't be charged for 14 days.`,
          });

          navigate(`/subscription-success?tier=${tier}`);
        }
      } else {
        // Payment Intent - immediate charge (upgrades or non-trial)
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: successUrl,
          },
          redirect: "if_required",
        });

        if (error) {
          setErrorMessage(error.message || "Payment failed. Please try again.");
          toast({
            title: "Payment Failed",
            description: error.message || "An error occurred during payment.",
            variant: "destructive",
          });
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
          // Refresh subscription status
          await checkSubscription();
          
          toast({
            title: "Welcome to Dubai Wealth Hub!",
            description: `Your ${tierConfig.name} membership is now active.`,
          });

          navigate(`/subscription-success?tier=${tier}`);
        }
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
            {isUpgrade ? "Upgrade Now" : "Start Free Trial"} — {tierConfig.priceDisplay}{tierConfig.period}
          </>
        )}
      </Button>

      {!isUpgrade && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Your 14-day free trial starts today. You won't be charged until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        </p>
      )}
    </form>
  );
};

export default CheckoutForm;
