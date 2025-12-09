import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "dwh_cookie_consent";

type ConsentStatus = "accepted" | "rejected" | null;

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status || "");
    setShowBanner(false);
    
    // Here you would typically initialize or disable analytics based on consent
    if (status === "accepted") {
      // Initialize analytics, tracking, etc.
      console.log("Cookies accepted - analytics enabled");
    } else {
      // Disable non-essential cookies
      console.log("Cookies rejected - only essential cookies");
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Cookie Preferences</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                        By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or reject non-essential cookies.
                      </p>
                    </div>
                    <button
                      onClick={() => handleConsent("rejected")}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Close cookie banner"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Button
                      onClick={() => handleConsent("accepted")}
                      className="order-1 sm:order-2"
                    >
                      Accept All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleConsent("rejected")}
                      className="order-2 sm:order-1"
                    >
                      Essential Only
                    </Button>
                    <Link
                      to="/privacy"
                      className="order-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center sm:text-left sm:ml-2"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
