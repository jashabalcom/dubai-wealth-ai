import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEmailVerification } from '@/hooks/useEmailVerification';

const DISMISS_KEY = 'email_verification_banner_dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { isEmailVerified, resendVerificationEmail, userEmail } = useEmailVerification();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        setDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleResend = async () => {
    setSending(true);
    await resendVerificationEmail();
    setSending(false);
  };

  // Don't show if: no user, email is verified, or dismissed
  if (!user || isEmailVerified || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 rounded-lg shadow-lg border border-amber-400/20 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium text-white">
                  Verify your email to unlock all features
                </span>
                <span className="text-xs text-white/80 hidden sm:inline">
                  ({userEmail})
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleResend}
                disabled={sending}
                className="text-xs h-7 bg-white/90 hover:bg-white text-amber-700"
              >
                <Send className="h-3 w-3 mr-1" />
                {sending ? 'Sending...' : 'Resend Email'}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
