import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Infinity, Sparkles, LineChart, Users } from "lucide-react";
import { motion } from "framer-motion";

interface UpgradeLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewedCount: number;
}

export function UpgradeLimitDialog({ open, onOpenChange, viewedCount }: UpgradeLimitDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  const handleViewPlans = () => {
    onOpenChange(false);
    navigate("/pricing");
  };

  const benefits = [
    { icon: Infinity, text: "Unlimited property browsing" },
    { icon: Sparkles, text: "AI-powered investment analysis" },
    { icon: LineChart, text: "Advanced market insights" },
    { icon: Users, text: "Exclusive investor community" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-primary/20"
          >
            <Rocket className="h-8 w-8 text-gold" />
          </motion.div>
          <DialogTitle className="text-xl font-bold">
            You're getting great insights!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You've explored {viewedCount} properties. Upgrade to Investor for unlimited access.
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
              <benefit.icon className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={handleUpgrade} 
            variant="gold"
            className="w-full"
            size="lg"
          >
            Upgrade to Investor
          </Button>
          <Button 
            variant="outline" 
            onClick={handleViewPlans}
            className="w-full"
          >
            View All Plans
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Join thousands of investors making smarter decisions in Dubai
        </p>
      </DialogContent>
    </Dialog>
  );
}
