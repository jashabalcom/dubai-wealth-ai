import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "dwh_cookie_consent";

type ConsentStatus = "accepted" | "rejected" | null;

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status || "");
    setShowBanner(false);
    
    if (status === "accepted") {
      console.log("Cookies accepted - analytics enabled");
    } else {
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
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg shadow-lg px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cookie className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  We use cookies to enhance your experience.{" "}
                  <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                    Learn more
                  </Link>
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConsent("rejected")}
                >
                  Essential Only
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConsent("accepted")}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
