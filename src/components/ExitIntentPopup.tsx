import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Mail, ArrowRight } from "lucide-react";
import { useEmailSubscribe } from "@/hooks/useEmailSubscribe";

const POPUP_SHOWN_KEY = "exit_intent_popup_shown";
const POPUP_COOLDOWN_DAYS = 7;

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { subscribe, isLoading } = useEmailSubscribe();

  const shouldShowPopup = useCallback(() => {
    const lastShown = localStorage.getItem(POPUP_SHOWN_KEY);
    if (!lastShown) return true;
    
    const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
    return daysSinceShown >= POPUP_COOLDOWN_DAYS;
  }, []);

  const markPopupShown = useCallback(() => {
    localStorage.setItem(POPUP_SHOWN_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    if (!shouldShowPopup()) return;

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from top of page
      if (e.clientY <= 0 && !triggered) {
        triggered = true;
        setIsOpen(true);
        markPopupShown();
      }
    };

    // Add delay before enabling exit intent
    const timeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [shouldShowPopup, markPopupShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const success = await subscribe(email, {
      source: "exit_intent",
      leadMagnet: "dubai_investment_guide_2025",
    });

    if (success) {
      setIsSubmitted(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-secondary border-primary/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 p-1 rounded-full hover:bg-primary/10 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Gift className="w-8 h-8 text-primary" />
                </div>

                <DialogHeader className="text-center mb-6">
                  <DialogTitle className="text-2xl font-serif text-secondary-foreground mb-3">
                    Wait! Don't Miss This
                  </DialogTitle>
                  <p className="text-secondary-foreground/70">
                    Get our exclusive <span className="text-primary font-medium">Dubai Investment Guide 2025</span> — 
                    the same research our Elite members use.
                  </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Get Free Guide"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground/50 text-center mt-4">
                  No spam. Unsubscribe anytime.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-secondary-foreground mb-2">
                  You're All Set!
                </h3>
                <p className="text-secondary-foreground/70 mb-6">
                  Check your inbox for the Dubai Investment Guide.
                </p>
                <Button variant="outline" onClick={handleClose}>
                  Continue Browsing
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
