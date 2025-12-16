import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle2, Award, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { QAAnswer } from '@/hooks/useQA';
import { useAuth } from '@/hooks/useAuth';

interface AnswerCardProps {
  answer: QAAnswer;
  questionAuthorId: string;
  onVote: (voteType: 'up' | 'down') => void;
  onMarkBest: () => void;
  isVoting?: boolean;
}

export function AnswerCard({ 
  answer, 
  questionAuthorId, 
  onVote, 
  onMarkBest,
  isVoting 
}: AnswerCardProps) {
  const { user } = useAuth();
  const isQuestionAuthor = user?.id === questionAuthorId;
  const isOwnAnswer = user?.id === answer.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "transition-all",
        answer.is_best_answer && "border-green-500 bg-green-500/5"
      )}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            {/* Voting Column */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  answer.user_vote === 'up' && "text-gold bg-gold/10"
                )}
                onClick={() => onVote('up')}
                disabled={isVoting || !user}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span className={cn(
                "text-sm font-semibold",
                answer.upvotes_count > 0 ? "text-gold" : "text-muted-foreground"
              )}>
                {answer.upvotes_count}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  answer.user_vote === 'down' && "text-destructive bg-destructive/10"
                )}
                onClick={() => onVote('down')}
                disabled={isVoting || !user}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              {/* Best Answer Badge */}
              {answer.is_best_answer && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Best Answer
                  </span>
                </div>
              )}

              {/* Answer Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                <p className="whitespace-pre-wrap">{answer.content}</p>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Author Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={answer.author?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {answer.author?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {answer.author?.full_name || 'Member'}
                    </span>
                    {answer.author?.membership_tier === 'elite' && (
                      <Crown className="h-3 w-3 text-gold" />
                    )}
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {isQuestionAuthor && !isOwnAnswer && !answer.is_best_answer && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={onMarkBest}
                  >
                    <Award className="h-3.5 w-3.5" />
                    Mark as Best
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
