import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Check, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailSubscribe } from "@/hooks/useEmailSubscribe";
import { useAuth } from "@/hooks/useAuth";

interface NeighborhoodLeadCaptureProps {
  neighborhoodName: string;
}

export function NeighborhoodLeadCapture({ neighborhoodName }: NeighborhoodLeadCaptureProps) {
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
      source: "neighborhood_detail",
      leadMagnet: "top_3_investment_picks",
      investorIntent: "investor",
    });

    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden sticky top-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="font-heading text-lg">
            Investment Picks
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Get the <span className="text-primary font-medium">top 3 investment properties</span> in {neighborhoodName} based on ROI potential.
              </p>

              <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Hand-picked by our analysts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Rental yield estimates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>Price trend analysis</span>
                </li>
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
                  {isLoading ? "Sending..." : "Get Top 3 Picks"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground/50 text-center mt-3">
                Free. Unsubscribe anytime.
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
                <Sparkles className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                You're In!
              </h3>
              <p className="text-sm text-muted-foreground">
                Check your inbox for the top picks in {neighborhoodName}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
