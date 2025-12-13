import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Commenter {
  avatar_url: string | null;
  full_name: string | null;
}

interface CommenterAvatarsProps {
  commenters: Commenter[];
  totalComments: number;
  maxDisplay?: number;
}

export function CommenterAvatars({ 
  commenters, 
  totalComments, 
  maxDisplay = 3 
}: CommenterAvatarsProps) {
  const displayedCommenters = commenters.slice(0, maxDisplay);
  const remaining = totalComments - displayedCommenters.length;

  if (commenters.length === 0) return null;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayedCommenters.map((commenter, index) => (
          <Avatar 
            key={index} 
            className="h-6 w-6 ring-2 ring-card"
          >
            <AvatarImage src={commenter.avatar_url || undefined} />
            <AvatarFallback className="bg-muted text-[10px]">
              {commenter.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remaining > 0 && (
        <span className="ml-2 text-xs text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
