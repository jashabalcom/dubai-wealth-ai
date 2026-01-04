import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  actionDescription: string;
}

export function ReauthDialog({ open, onOpenChange, onSuccess, actionDescription }: ReauthDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !user?.email) return;

    setIsVerifying(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        setError('Incorrect password. Please try again.');
        
        // Log failed re-auth attempt
        await supabase.rpc('log_security_event', {
          p_event_type: 'reauth_failure',
          p_severity: 'warn',
          p_user_id: user.id,
          p_details: { action: actionDescription },
        });
        
        return;
      }

      // Log successful re-auth
      await supabase.rpc('log_security_event', {
        p_event_type: 'reauth_success',
        p_severity: 'info',
        p_user_id: user.id,
        p_details: { action: actionDescription },
      });

      toast({
        title: 'Identity verified',
        description: 'You may now proceed with the action.',
      });

      setPassword('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>
            For your security, please enter your password to {actionDescription}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerify}>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This is a sensitive action. Re-authentication is required to proceed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reauth-password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reauth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!password || isVerifying}>
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
