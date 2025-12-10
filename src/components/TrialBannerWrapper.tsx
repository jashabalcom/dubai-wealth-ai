import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { TrialBanner } from './TrialBanner';

export function TrialBannerWrapper() {
  const { user, profile } = useAuth();
  const { checkSubscription } = useSubscription();
  const [trialInfo, setTrialInfo] = useState<{
    isTrialing: boolean;
    trialEnd: string | null;
    tier: string;
  } | null>(null);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) {
        setTrialInfo(null);
        return;
      }

      // Check if profile shows trialing status
      if (profile?.membership_status === 'trialing') {
        // Fetch fresh subscription data to get trial_end
        const status = await checkSubscription();
        if (status?.is_trialing && status.trial_end) {
          setTrialInfo({
            isTrialing: true,
            trialEnd: status.trial_end,
            tier: status.tier,
          });
        }
      } else {
        setTrialInfo(null);
      }
    };

    fetchTrialStatus();
  }, [user, profile?.membership_status, checkSubscription]);

  if (!trialInfo?.isTrialing) return null;

  return <TrialBanner trialEnd={trialInfo.trialEnd} tier={trialInfo.tier} />;
}
