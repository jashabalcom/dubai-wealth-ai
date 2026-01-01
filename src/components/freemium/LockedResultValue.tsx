import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LockedResultValueProps {
  label: string;
  lockedMessage?: string;
  requiredTier?: 'investor' | 'elite' | 'private';
  isLocked: boolean;
  value: string | number;
  valueClassName?: string;
  showPlaceholder?: boolean;
}

const tierLabels = {
  investor: 'Investor',
  elite: 'Elite',
  private: 'Private',
};

export function LockedResultValue({
  label,
  lockedMessage,
  requiredTier = 'investor',
  isLocked,
  value,
  valueClassName = 'font-heading text-3xl text-emerald-400',
  showPlaceholder = true,
}: LockedResultValueProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      localStorage.setItem('pending_checkout_tier', requiredTier);
      navigate('/auth');
    } else {
      navigate('/upgrade');
    }
  };

  if (!isLocked) {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={valueClassName}>{value}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="cursor-pointer group transition-all hover:opacity-80"
            onClick={handleClick}
          >
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <div className="flex items-center gap-2">
              {showPlaceholder ? (
                <>
                  <span className={`${valueClassName} opacity-50`}>---</span>
                  <Lock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Locked</span>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">
            {lockedMessage || `Upgrade to ${tierLabels[requiredTier]} to see your ${label.toLowerCase()}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
