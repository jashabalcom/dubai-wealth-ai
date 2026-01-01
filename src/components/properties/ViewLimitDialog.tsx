import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Unlock, Heart, TrendingUp, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ViewLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewedCount: number;
}

export function ViewLimitDialog({ open, onOpenChange, viewedCount }: ViewLimitDialogProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onOpenChange(false);
    navigate("/auth?mode=signup");
  };

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/auth?mode=login");
  };

  const benefits = [
    { icon: Search, text: "Unlimited property browsing" },
    { icon: Heart, text: "Save and compare favorites" },
    { icon: TrendingUp, text: "Access market insights" },
    { icon: Sparkles, text: "AI-powered recommendations" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <Unlock className="h-8 w-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl font-bold">
            You've explored {viewedCount} properties
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a free account to continue browsing and unlock exclusive features
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
              <benefit.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={handleSignUp} 
            className="w-full"
            size="lg"
          >
            Create Free Account
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignIn}
            className="w-full"
          >
            Already have an account? Sign In
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Join thousands of investors discovering opportunities in Dubai
        </p>
      </DialogContent>
    </Dialog>
  );
}
