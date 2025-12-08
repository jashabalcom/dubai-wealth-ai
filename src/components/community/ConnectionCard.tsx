import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Crown, UserMinus, Check, X, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: string;
  country?: string | null;
  bio?: string | null;
}

interface ConnectionCardProps {
  connection: {
    id: string;
    status: string;
    message?: string | null;
    created_at: string;
    updated_at: string;
  };
  profile: ConnectionProfile;
  type: 'accepted' | 'received' | 'sent';
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onCancel?: (connectionId: string) => void;
  onRemove?: (connectionId: string) => void;
  isLoading?: boolean;
}

export function ConnectionCard({
  connection,
  profile,
  type,
  onAccept,
  onReject,
  onCancel,
  onRemove,
  isLoading,
}: ConnectionCardProps) {
  const isElite = profile.membership_tier === 'elite';
  const initials = profile.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const timeLabel = type === 'accepted' 
    ? `Connected ${formatDistanceToNow(new Date(connection.updated_at), { addSuffix: true })}`
    : type === 'received'
    ? `Received ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}`
    : `Sent ${formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}`;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-gold/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link to={`/profile/${profile.id}`}>
            <Avatar className="h-14 w-14 border-2 border-border/50 hover:border-gold/50 transition-colors">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/profile/${profile.id}`}
                className="font-semibold text-foreground hover:text-gold transition-colors"
              >
                {profile.full_name || 'Anonymous'}
              </Link>
              {isElite && (
                <Crown className="h-4 w-4 text-gold fill-gold/20" />
              )}
              <Badge 
                variant="outline" 
                className={`text-xs ${isElite ? 'border-gold/50 text-gold' : 'border-border'}`}
              >
                {profile.membership_tier === 'elite' ? 'Elite' : profile.membership_tier === 'investor' ? 'Investor' : 'Free'}
              </Badge>
            </div>

            {/* Bio for accepted connections */}
            {type === 'accepted' && profile.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Message for received requests */}
            {type === 'received' && connection.message && (
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground italic">
                  "{connection.message}"
                </p>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLabel}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {type === 'accepted' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-border/50 hover:border-gold/50 hover:text-gold"
                >
                  <Link to={`/profile/${profile.id}`}>View Profile</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove?.(connection.id)}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </>
            )}

            {type === 'received' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(connection.id)}
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold/90 text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(connection.id)}
                  disabled={isLoading}
                  className="border-border/50 hover:border-destructive/50 hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}

            {type === 'sent' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel?.(connection.id)}
                disabled={isLoading}
                className="border-border/50 hover:border-destructive/50 hover:text-destructive"
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
