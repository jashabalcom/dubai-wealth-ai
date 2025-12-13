import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Crown, TrendingUp, Share2, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CommunityStats {
  total_members: number;
  elite_members: number;
  posts_this_week: number;
}

interface TopMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
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

export function CommunityInfoCard() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [recentMembers, setRecentMembers] = useState<{ id: string; avatar_url: string | null; full_name: string | null }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch community stats
      const { data: statsData } = await supabase.rpc('get_community_stats');
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch top 5 members by points
      const { data: topData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, points, level')
        .eq('is_visible_in_directory', true)
        .order('points', { ascending: false })
        .limit(5);
      
      if (topData) {
        setTopMembers(topData);
      }

      // Fetch 8 most recent members
      const { data: recentData } = await supabase
        .from('profiles')
        .select('id, avatar_url, full_name')
        .eq('is_visible_in_directory', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (recentData) {
        setRecentMembers(recentData);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Community Info Card */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
        {/* Banner */}
        <div className="h-20 relative overflow-hidden">
          <img 
            src="/src/assets/hero-dubai-skyline.jpg" 
            alt="Dubai skyline" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/60 via-navy/40 to-gold/20" />
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-semibold">Dubai Wealth Hub</h3>
            <p className="text-sm text-muted-foreground">Exclusive investor community</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <Users className="h-4 w-4 text-gold" />
                {stats?.total_members || 0}
              </div>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <Crown className="h-4 w-4 text-gold" />
                {stats?.elite_members || 0}
              </div>
              <p className="text-xs text-muted-foreground">Elite</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <TrendingUp className="h-4 w-4 text-gold" />
                {stats?.posts_this_week || 0}
              </div>
              <p className="text-xs text-muted-foreground">Posts/wk</p>
            </div>
          </div>

          {/* Recent Members */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent Members</p>
            <div className="flex -space-x-2">
              {recentMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-card">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-xs">
                      {member.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Invite Button */}
          <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10">
            <Share2 className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h3 className="font-serif font-semibold">Top Contributors</h3>
          </div>
          <Link 
            to="/community/leaderboard" 
            className="text-xs text-gold hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {topMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                index === 0 && "bg-gold text-background",
                index === 1 && "bg-muted-foreground/50 text-background",
                index === 2 && "bg-amber-700/50 text-background",
                index > 2 && "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-muted text-xs">
                  {member.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.full_name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">
                  Lvl {member.level} • {LEVEL_NAMES[member.level - 1]}
                </p>
              </div>
              <span className="text-xs font-medium text-gold">{member.points} pts</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
