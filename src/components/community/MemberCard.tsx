import { Link } from 'react-router-dom';
import { Crown, MapPin, Target, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/components/community/ConnectButton';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useOnlineStatus } from '@/contexts/OnlinePresenceContext';
import { cn } from '@/lib/utils';
import { COMMUNITY_LAYOUT } from '@/lib/designTokens';
import type { DirectoryMember } from '@/hooks/useMemberDirectory';

interface MemberCardProps {
  member: DirectoryMember;
  index?: number;
  variant?: 'grid' | 'list';
}

export function MemberCard({ member, index = 0, variant = 'grid' }: MemberCardProps) {
  const { isUserOnline } = useOnlineStatus();
  const isOnline = isUserOnline(member.id);

  const getMembershipBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border-gold/30';
      case 'investor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group h-full',
        COMMUNITY_LAYOUT.card.base,
        COMMUNITY_LAYOUT.card.padding,
        COMMUNITY_LAYOUT.card.hover,
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header: Avatar + Name */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className={cn(
              'h-14 w-14 ring-2 ring-offset-2 ring-offset-card transition-all duration-300',
              member.membership_tier === 'elite' 
                ? 'ring-gold/50 group-hover:ring-gold' 
                : 'ring-border/30 group-hover:ring-gold/30'
            )}>
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback className={cn(
                'text-base font-serif transition-colors',
                member.membership_tier === 'elite' 
                  ? 'bg-gold/20 text-gold' 
                  : 'bg-muted group-hover:bg-gold/10'
              )}>
                {member.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {member.membership_tier === 'elite' && (
              <motion.div 
                className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-gold/30 shadow-lg shadow-gold/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-3 w-3 text-gold" />
              </motion.div>
            )}
            <OnlineIndicator 
              isOnline={isOnline} 
              size="md" 
              className="absolute bottom-0 right-0"
            />
          </div>

          {/* Name + Tier */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-base truncate group-hover:text-gold transition-colors duration-300">
              {member.full_name || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs capitalize transition-all duration-300',
                  getMembershipBadgeStyle(member.membership_tier),
                  'group-hover:scale-105'
                )}
              >
                {member.membership_tier === 'elite' && <Crown className="h-3 w-3 mr-1" />}
                {member.membership_tier}
              </Badge>
              {member.country && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{member.country}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio - Fixed height for grid consistency */}
        <div className="flex-1 mt-3">
          {member.bio ? (
            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {member.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No bio yet
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3 min-h-[28px]">
          {member.investment_goal && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-all">
              <Target className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[100px]">{member.investment_goal}</span>
            </span>
          )}
          {member.looking_for && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/10 text-gold group-hover:bg-gold/20 transition-all">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[100px]">{member.looking_for}</span>
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 group-hover:border-gold/20 transition-colors">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Joined</span> {format(new Date(member.created_at), 'MMM yyyy')}
          </span>
          <div className="flex items-center gap-2">
            <ConnectButton 
              userId={member.id} 
              userName={member.full_name || undefined}
              className="text-xs h-7 px-2.5"
            />
            <Link to={`/profile/${member.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2.5 hover:text-gold hover:bg-gold/10 transition-all"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
