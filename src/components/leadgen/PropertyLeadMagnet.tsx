import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, FileText, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useEmailSubscribe } from "@/hooks/useEmailSubscribe";
import { useAuth } from "@/hooks/useAuth";

interface PropertyLeadMagnetProps {
  propertyTitle: string;
  propertyArea: string;
  isOffPlan?: boolean;
}

export function PropertyLeadMagnet({ 
  propertyTitle, 
  propertyArea, 
  isOffPlan = false 
}: PropertyLeadMagnetProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { subscribe, isLoading } = useEmailSubscribe();
  const { user } = useAuth();

  // Don't show for logged-in users
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const success = await subscribe(email, {
      source: "property_detail",
      leadMagnet: "property_deal_breakdown",
      investorIntent: isOffPlan ? "off_plan" : "investor",
    });

    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-foreground">
                    Unlock Full Deal Breakdown
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get the complete investment analysis
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  True cost analysis with all fees
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  ROI projection & rental estimates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Comparable sales in {propertyArea}
                </li>
                {isOffPlan && (
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Payment plan breakdown
                  </li>
                )}
              </ul>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Get Deal Breakdown"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground/50 text-center mt-3">
                Free access. No spam.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                Check Your Inbox!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your full deal breakdown for {propertyTitle} is on its way.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
