import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Heart, Sparkles, Shield, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useEmailVerification } from "@/hooks/useEmailVerification";

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function EmailVerificationDialog({ 
  open, 
  onOpenChange,
  feature = "this feature"
}: EmailVerificationDialogProps) {
  const { resendVerificationEmail, userEmail } = useEmailVerification();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    const { error } = await resendVerificationEmail();
    setSending(false);
    if (!error) {
      setSent(true);
    }
  };

  const benefits = [
    { icon: Heart, text: "Save favorite properties" },
    { icon: Sparkles, text: "Get AI investment analysis" },
    { icon: Shield, text: "Secure your account" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10"
          >
            <Mail className="h-8 w-8 text-amber-500" />
          </motion.div>
          <DialogTitle className="text-xl font-bold">
            Verify Your Email
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Verify your email to access {feature} and unlock all features
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="my-4 space-y-3"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
            >
              <benefit.icon className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {userEmail && (
          <p className="text-center text-sm text-muted-foreground">
            We'll send a verification link to <strong>{userEmail}</strong>
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {sent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-emerald-500 font-medium">
                <Mail className="h-5 w-5" />
                Email sent! Check your inbox.
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Click the link in the email to verify your account.
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleResend} 
              className="w-full bg-amber-500 hover:bg-amber-600"
              size="lg"
              disabled={sending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Verification Email'}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            I'll do this later
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Didn't receive the email? Check your spam folder.
        </p>
      </DialogContent>
    </Dialog>
  );
}
