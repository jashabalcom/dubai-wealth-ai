import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
}

const benefits = [
  { icon: MessageSquare, text: 'Track all your property inquiries' },
  { icon: Heart, text: 'Save properties and compare options' },
  { icon: TrendingUp, text: 'Access exclusive investor tools' },
];

export function AuthPromptDialog({ open, onOpenChange, propertyTitle }: AuthPromptDialogProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    onOpenChange(false);
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    onOpenChange(false);
    navigate('/auth?mode=login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4"
          >
            <User className="w-8 h-8 text-gold" />
          </motion.div>
          <DialogTitle className="font-heading text-2xl text-foreground">
            Create an account to continue
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign up to submit your inquiry for "{propertyTitle}" and unlock exclusive features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-3 text-sm text-foreground"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-gold" />
              </div>
              <span>{benefit.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            variant="gold"
            className="w-full"
            onClick={handleSignUp}
          >
            Create Free Account
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignIn}
          >
            Already have an account? Sign In
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Your inquiry details are saved and will be submitted after sign up.
        </p>
      </DialogContent>
    </Dialog>
  );
}
