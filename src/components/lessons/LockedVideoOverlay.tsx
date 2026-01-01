import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LockedVideoOverlayProps {
  lessonTitle?: string;
  onUpgradeClick?: () => void;
}

export function LockedVideoOverlay({ lessonTitle, onUpgradeClick }: LockedVideoOverlayProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="aspect-video bg-gradient-to-br from-primary-dark to-secondary relative overflow-hidden rounded-lg">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent" />
      </div>
      
      {/* Lock overlay - centered and clickable */}
      <button
        onClick={handleClick}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-background"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold/20 border-2 border-gold/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-gold/30 transition-all duration-300">
          <Lock className="w-10 h-10 md:w-12 md:h-12 text-gold" />
        </div>
        
        <div className="text-center px-4">
          <h3 className="font-heading text-lg md:text-xl text-foreground mb-2">
            Premium Content
          </h3>
          {lessonTitle && (
            <p className="text-muted-foreground text-sm mb-2 max-w-xs truncate">
              {lessonTitle}
            </p>
          )}
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            Upgrade to Investor or Elite to unlock this lesson
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-primary-dark rounded-full font-medium group-hover:bg-gold/90 transition-colors">
            <Sparkles className="w-4 h-4" />
            Upgrade to Unlock
          </span>
        </div>
      </button>
    </div>
  );
}
