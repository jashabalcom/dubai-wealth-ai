import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PollDisplayProps {
  pollId: string;
  question: string;
  options: string[];
  onVote?: (optionIndex: number) => void;
}

interface VoteData {
  option_index: number;
  count: number;
}

export function PollDisplay({ pollId, question, options, onVote }: PollDisplayProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<VoteData[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchVotes();
  }, [pollId]);

  const fetchVotes = async () => {
    try {
      // Get vote counts
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // Aggregate votes
      const voteCounts = options.map((_, index) => ({
        option_index: index,
        count: votesData?.filter(v => v.option_index === index).length || 0,
      }));
      setVotes(voteCounts);

      // Check if user has voted
      if (user) {
        const { data: userVoteData } = await supabase
          .from('poll_votes')
          .select('option_index')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserVote(userVoteData?.option_index ?? null);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!user || userVote !== null || voting) return;

    setVoting(true);
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex,
        });

      if (error) throw error;

      setUserVote(optionIndex);
      fetchVotes();
      onVote?.(optionIndex);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
  const hasVoted = userVote !== null;

  if (loading) {
    return (
      <div className="bg-muted/30 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-gold" />
        <h4 className="font-medium">{question}</h4>
      </div>
      
      <div className="space-y-2">
        {options.map((option, index) => {
          const voteCount = votes.find(v => v.option_index === index)?.count || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isUserVote = userVote === index;

          return (
            <motion.button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted || voting || !user}
              whileHover={!hasVoted && user ? { scale: 1.01 } : {}}
              whileTap={!hasVoted && user ? { scale: 0.99 } : {}}
              className={cn(
                "w-full text-left relative overflow-hidden rounded-lg transition-all",
                hasVoted
                  ? "cursor-default"
                  : user
                  ? "cursor-pointer hover:bg-muted/40"
                  : "cursor-not-allowed opacity-60"
              )}
            >
              <div 
                className={cn(
                  "relative z-10 p-3 flex items-center justify-between border rounded-lg",
                  isUserVote 
                    ? "border-gold/50 bg-gold/10" 
                    : "border-border/30 bg-background/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {isUserVote && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-0.5 rounded-full bg-gold text-background"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                  <span className={cn("text-sm", isUserVote && "font-medium")}>
                    {option}
                  </span>
                </div>
                
                {hasVoted && (
                  <span className="text-sm text-muted-foreground">
                    {voteCount} ({percentage.toFixed(0)}%)
                  </span>
                )}
              </div>
              
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-lg -z-0",
                    isUserVote ? "bg-gold/20" : "bg-muted/30"
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        {!hasVoted && user && ' · Click to vote'}
        {!user && ' · Sign in to vote'}
      </p>
    </div>
  );
}
