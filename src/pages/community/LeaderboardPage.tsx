import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition } from '@/components/community/PageTransition';
import { MemberLevelBadge } from '@/components/community/MemberLevelBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface LeaderboardMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
  membership_tier: string;
}

const LEVEL_NAMES = [
  'Prospect',
  'Explorer', 
  'Researcher',
  'Investor',
  'Portfolio Builder',
  'Market Expert',
  'Dubai Insider',
  'Elite Investor',
  'Wealth Architect'
];

const LEVEL_THRESHOLDS = [0, 10, 25, 50, 100, 200, 300, 500, 1000];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<LeaderboardMember[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myProfile, setMyProfile] = useState<LeaderboardMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points, level, membership_tier')
        .eq('is_visible_in_directory', true)
        .order('points', { ascending: false })
        .limit(50);
      
      if (data) {
        setMembers(data);
        
        if (user) {
          const rank = data.findIndex(m => m.id === user.id);
          if (rank !== -1) {
            setMyRank(rank + 1);
            setMyProfile(data[rank]);
          }
        }
      }
      
      setLoading(false);
    };

    fetchLeaderboard();
  }, [user]);

  const getNextLevelProgress = () => {
    if (!myProfile) return 0;
    const currentThreshold = LEVEL_THRESHOLDS[myProfile.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[myProfile.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const progress = ((myProfile.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 mb-4">
            <Trophy className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Community Leaderboard</h1>
          <p className="text-muted-foreground">Top contributors in the Dubai Wealth Hub community</p>
        </motion.div>

        {/* My Progress Card */}
        {myProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-4 ring-gold/30">
                  <AvatarImage src={myProfile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gold/20 text-gold text-xl">
                    {myProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {myRank && myRank <= 3 && (
                  <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gold shadow-lg">
                    <Crown className="h-4 w-4 text-background" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{myProfile.full_name || 'You'}</h3>
                  <MemberLevelBadge level={myProfile.level} />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Rank #{myRank} • {myProfile.points} points
                </p>
                
                {/* Progress to next level */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Level {myProfile.level}: {LEVEL_NAMES[myProfile.level - 1]}
                    </span>
                    {myProfile.level < 9 && (
                      <span className="text-gold">
                        Next: {LEVEL_NAMES[myProfile.level]}
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getNextLevelProgress()}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="all-time" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="all-time" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              All Time
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Month
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Week
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-time">
            <LeaderboardList members={members} loading={loading} currentUserId={user?.id} />
          </TabsContent>
          <TabsContent value="monthly">
            <LeaderboardList members={members} loading={loading} currentUserId={user?.id} />
          </TabsContent>
          <TabsContent value="weekly">
            <LeaderboardList members={members} loading={loading} currentUserId={user?.id} />
          </TabsContent>
        </Tabs>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="font-serif font-semibold text-lg mb-4">How to Earn Points</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: 'Create a post', points: 10 },
              { action: 'Leave a comment', points: 5 },
              { action: 'Receive a like', points: 2 },
              { action: 'Complete a lesson', points: 15 },
            ].map((item, index) => (
              <div key={index} className="text-center p-3 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold text-gold">+{item.points}</p>
                <p className="text-xs text-muted-foreground">{item.action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function LeaderboardList({ 
  members, 
  loading, 
  currentUserId 
}: { 
  members: LeaderboardMember[]; 
  loading: boolean;
  currentUserId?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card/50 rounded-xl animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
      {members.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={cn(
            "flex items-center gap-4 p-4 transition-colors",
            index !== members.length - 1 && "border-b border-border/50",
            member.id === currentUserId && "bg-gold/5",
            index < 3 && "bg-gradient-to-r from-gold/5 to-transparent"
          )}
        >
          {/* Rank */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
            index === 0 && "bg-gradient-to-br from-gold to-amber-500 text-background shadow-lg shadow-gold/25",
            index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400 text-background",
            index === 2 && "bg-gradient-to-br from-amber-600 to-amber-700 text-background",
            index > 2 && "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>

          {/* Avatar */}
          <Avatar className={cn(
            "h-12 w-12 ring-2 ring-offset-2 ring-offset-card",
            member.membership_tier === 'elite' ? "ring-gold/50" : "ring-border/30"
          )}>
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="bg-muted">
              {member.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{member.full_name || 'Anonymous'}</p>
              {member.membership_tier === 'elite' && (
                <Crown className="h-4 w-4 text-gold shrink-0" />
              )}
            </div>
            <MemberLevelBadge level={member.level} size="sm" />
          </div>

          {/* Points */}
          <div className="text-right shrink-0">
            <p className="font-bold text-gold">{member.points}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
