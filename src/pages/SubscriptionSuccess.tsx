import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { trackSubscription } from "@/lib/analytics";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier') as 'investor' | 'elite' | 'private' | null;
  const { checkSubscription } = useSubscription();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // Give Stripe a moment to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await checkSubscription();
      if (status?.subscribed) {
        setVerified(true);
        
        // Fallback tracking - only fire once and if not already tracked in checkout
        if (!hasTracked.current && tier) {
          hasTracked.current = true;
          // Use a lower value as fallback since we don't have exact price here
          const fallbackPrice = tier === 'private' ? 149 : tier === 'elite' ? 97 : 29;
          trackSubscription(tier, 'monthly', fallbackPrice, false);
        }
      }
      setVerifying(false);
    };

    if (sessionId) {
      verify();
    } else {
      setVerifying(false);
    }
  }, [sessionId, checkSubscription, tier]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="bg-card border border-border rounded-2xl p-10">
              {verifying ? (
                <>
                  <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
                  <h1 className="text-2xl font-serif text-foreground mb-4">
                    Verifying your subscription...
                  </h1>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment.
                  </p>
                </>
              ) : verified ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-serif text-foreground mb-4">
                    Welcome to the Club!
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    Your subscription is now active. You have full access to all premium features.
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      className="w-full"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/academy')}
                      className="w-full"
                    >
                      Explore Academy
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-serif text-foreground mb-4">
                    Thank You!
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    Your payment was received. It may take a moment for your subscription to activate.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
