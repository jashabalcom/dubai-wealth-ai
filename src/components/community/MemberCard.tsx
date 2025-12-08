import { Link } from 'react-router-dom';
import { Crown, MapPin, Target, Briefcase, Calendar, Linkedin } from 'lucide-react';
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
}

export function MemberCard({ member, index = 0 }: MemberCardProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-gold/5 hover:border-gold/20 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className={cn(
            'h-16 w-16 ring-2 ring-offset-2 ring-offset-card transition-all duration-300',
            member.membership_tier === 'elite' ? 'ring-gold/50 group-hover:ring-gold' : 'ring-border/30 group-hover:ring-gold/30'
          )}>
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className={cn(
              'text-lg font-serif transition-colors',
              member.membership_tier === 'elite' ? 'bg-gold/20 text-gold' : 'bg-muted group-hover:bg-gold/10'
            )}>
              {member.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          {member.membership_tier === 'elite' && (
            <motion.div 
              className="absolute -top-1 -right-1 p-1.5 rounded-full bg-card border border-gold/30 shadow-lg shadow-gold/20"
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-semibold text-lg truncate group-hover:text-gold transition-colors duration-300">
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
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <MapPin className="h-3 w-3" />
                    {member.country}
                  </span>
                )}
              </div>
            </div>
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {member.bio}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {member.investment_goal && (
              <motion.span 
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-muted group-hover:text-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <Target className="h-3 w-3" />
                {member.investment_goal}
              </motion.span>
            )}
            {member.looking_for && (
              <motion.span 
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/10 text-gold transition-all group-hover:bg-gold/20"
                whileHover={{ scale: 1.05 }}
              >
                <Briefcase className="h-3 w-3" />
                {member.looking_for}
              </motion.span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 group-hover:border-gold/20 transition-colors">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {format(new Date(member.created_at), 'MMM yyyy')}
            </span>
            <div className="flex items-center gap-2">
              <ConnectButton 
                userId={member.id} 
                userName={member.full_name || undefined}
                className="text-xs h-8"
              />
              <Link to={`/profile/${member.id}`}>
                <Button variant="ghost" size="sm" className="text-xs hover:text-gold hover:bg-gold/10 transition-all">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
