import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CookiePreferences, 
  loadCookiePreferences, 
  saveCookiePreferences,
  CookiePreferencesManager 
} from "@/components/CookiePreferences";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CONSENT_EXPIRY_MONTHS = 12;

const getDefaultPreferences = (allAccepted: boolean): CookiePreferences => ({
  essential: true,
  analytics: allAccepted,
  marketing: allAccepted,
  consented_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + CONSENT_EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString(),
});

export const CookieConsent = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const localPrefs = loadCookiePreferences();
      
      // If logged in, try to load from profile
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("cookie_consent")
          .eq("id", user.id)
          .single();
        
        if (data?.cookie_consent) {
          const profilePrefs = data.cookie_consent as unknown as CookiePreferences;
          // Check if profile prefs are valid and not expired
          if (new Date(profilePrefs.expires_at) > new Date()) {
            // Sync to localStorage
            saveCookiePreferences(profilePrefs);
            return; // Don't show banner
          }
        }
      }
      
      // Check if local consent exists and hasn't expired
      if (!localPrefs) {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    };
    
    checkConsent();
  }, [user]);

  const handleConsent = async (acceptAll: boolean) => {
    const prefs = getDefaultPreferences(acceptAll);
    saveCookiePreferences(prefs);
    setShowBanner(false);
    
    // Sync to profile if logged in
    if (user) {
      await supabase
        .from("profiles")
        .update({ cookie_consent: JSON.parse(JSON.stringify(prefs)) })
        .eq("id", user.id);
    }
    
    if (acceptAll) {
      console.log("Cookies accepted - analytics enabled");
    } else {
      console.log("Cookies rejected - only essential cookies");
    }
  };

  const handlePreferencesSaved = () => {
    setShowPreferences(false);
    setShowBanner(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pb-safe"
          >
            <div className="max-w-2xl mx-auto bg-background/95 backdrop-blur-xl border-t border-x border-primary/20 rounded-t-2xl shadow-2xl shadow-black/20 px-5 py-4 sm:mx-4 sm:mb-4 sm:border sm:rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Cookie className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    We use cookies to improve your experience.{" "}
                    <Link to="/cookie-policy" className="text-primary hover:underline transition-colors">
                      Learn more
                    </Link>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreferences(true)}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Customize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConsent(false)}
                    className="border-border/50"
                  >
                    Essential Only
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleConsent(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
          </DialogHeader>
          <CookiePreferencesManager 
            variant="inline" 
            onSave={handlePreferencesSaved} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
