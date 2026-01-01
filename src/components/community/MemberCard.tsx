import { Link } from 'react-router-dom';
import { Crown, MapPin, Target, Briefcase, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/components/community/ConnectButton';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useOnlineStatus } from '@/contexts/OnlinePresenceContext';
import { cn } from '@/lib/utils';
import type { DirectoryMember } from '@/hooks/useMemberDirectory';

interface MemberCardProps {
  member: DirectoryMember;
  index?: number;
  variant?: 'grid' | 'list';
}

export function MemberCard({ member, index = 0, variant = 'grid' }: MemberCardProps) {
  const { isUserOnline } = useOnlineStatus();
  const isOnline = isUserOnline(member.id);
  const isElite = member.membership_tier === 'elite';

  const getMembershipBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-gold/30 to-gold/10 text-gold border-gold/40 shimmer-badge';
      case 'investor':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted/80 text-muted-foreground border-border/50';
    }
  };

  // Show max 2 tags with "+X more" indicator
  const allTags = [
    member.investment_goal && { label: member.investment_goal, icon: Target, type: 'goal' },
    member.looking_for && { label: member.looking_for, icon: Briefcase, type: 'looking' },
  ].filter(Boolean) as { label: string; icon: any; type: string }[];

  const visibleTags = allTags.slice(0, 2);
  const remainingCount = Math.max(0, allTags.length - 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        'group relative h-full overflow-hidden',
        'bg-card/90 backdrop-blur-xl border border-border/40 rounded-3xl shadow-lg',
        'hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30',
        'transition-all duration-300 ease-out'
      )}
    >
      {/* Premium gradient overlay */}
      <div className={cn(
        'absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        isElite 
          ? 'bg-gradient-to-br from-gold/8 via-transparent to-gold/5' 
          : 'bg-gradient-to-br from-primary/5 via-transparent to-transparent'
      )} />
      
      {/* Inner glow on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 1px 1px hsl(var(--gold) / 0.1)' }}
      />

      <div className="relative p-5 sm:p-6 flex flex-col h-full">
        {/* Header: Avatar + Name + Badge */}
        <div className="flex items-start gap-4">
          {/* Enhanced Avatar */}
          <div className="relative shrink-0">
            <div className={cn(
              'relative p-0.5 rounded-full transition-all duration-300',
              isElite 
                ? 'bg-gradient-to-br from-gold via-gold/60 to-gold group-hover:shadow-lg group-hover:shadow-gold/30' 
                : 'bg-gradient-to-br from-border/50 to-border/30 group-hover:from-gold/40 group-hover:to-gold/20'
            )}>
              <Avatar className="h-16 w-16 sm:h-[72px] sm:w-[72px] ring-2 ring-card">
                <AvatarImage src={member.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className={cn(
                  'text-lg sm:text-xl font-serif transition-colors',
                  isElite 
                    ? 'bg-gradient-to-br from-gold/30 to-gold/10 text-gold' 
                    : 'bg-muted group-hover:bg-gold/10 group-hover:text-gold'
                )}>
                  {member.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Elite crown badge */}
            {isElite && (
              <motion.div 
                className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-gradient-to-br from-gold to-gold/80 shadow-lg shadow-gold/40"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 4px 12px -2px hsl(var(--gold) / 0.4)',
                    '0 6px 16px -2px hsl(var(--gold) / 0.6)',
                    '0 4px 12px -2px hsl(var(--gold) / 0.4)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="h-3.5 w-3.5 text-secondary" />
              </motion.div>
            )}
            
            {/* Online indicator */}
            <OnlineIndicator 
              isOnline={isOnline} 
              size="md" 
              className="absolute bottom-0 right-0 ring-2 ring-card"
            />
          </div>

          {/* Name + Tier + Location */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-serif font-semibold text-base sm:text-lg truncate group-hover:text-gold transition-colors duration-300">
              {member.full_name || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs capitalize font-medium px-2.5 py-0.5 transition-all duration-300',
                  getMembershipBadgeStyle(member.membership_tier),
                  'group-hover:scale-105'
                )}
              >
                {isElite && <Sparkles className="h-3 w-3 mr-1" />}
                {member.membership_tier}
              </Badge>
            </div>
            {member.country && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 group-hover:text-foreground/70 transition-colors">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="flex-1 mt-4">
          {member.bio ? (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors">
              {member.bio}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground/40 italic">
              <span className="w-full border border-dashed border-border/50 rounded-lg py-3 text-center">
                No bio yet
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Tags */}
        <div className="flex flex-wrap gap-2 mt-4 min-h-[32px]">
          {visibleTags.map((tag, i) => (
            <motion.span 
              key={tag.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200',
                tag.type === 'goal' 
                  ? 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                  : 'bg-gold/10 text-gold/90 group-hover:bg-gold/20 group-hover:text-gold'
              )}
            >
              <tag.icon className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[100px]">{tag.label}</span>
            </motion.span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-full bg-border/50 text-muted-foreground">
              +{remainingCount} more
            </span>
          )}
        </div>

        {/* Footer - Reorganized */}
        <div className="mt-5 pt-4 border-t border-border/30 group-hover:border-gold/20 transition-colors">
          {/* Join date - subtle */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 mb-3">
            <Calendar className="h-3 w-3" />
            <span>Member since {format(new Date(member.created_at), 'MMM yyyy')}</span>
          </div>
          
          {/* Action buttons - stacked on small, side by side on larger */}
          <div className="flex flex-col sm:flex-row gap-2">
            <ConnectButton 
              userId={member.id} 
              userName={member.full_name || undefined}
              className="flex-1"
            />
            <Link to={`/member/${member.id}`} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-9 text-sm font-medium border-border/50 hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}