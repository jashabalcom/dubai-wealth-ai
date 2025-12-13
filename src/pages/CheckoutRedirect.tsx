import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

/**
 * Redirects to Stripe hosted checkout instead of using embedded Payment Element.
 * This simplifies the checkout flow and avoids setup intent complexity.
 */
export default function CheckoutRedirect() {
  const { tier } = useParams<{ tier: string }>();
  const { user, loading: authLoading } = useAuth();
  const { startCheckout } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Store tier for after auth
      if (tier === 'investor' || tier === 'elite') {
        localStorage.setItem('pending_checkout_tier', tier);
      }
      navigate('/auth');
      return;
    }

    // Redirect to Stripe hosted checkout
    if (tier === 'investor' || tier === 'elite') {
      startCheckout(tier);
    } else {
      navigate('/pricing');
    }
  }, [tier, user, authLoading, navigate, startCheckout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to checkout...</p>
      </div>
    </div>
  );
}
