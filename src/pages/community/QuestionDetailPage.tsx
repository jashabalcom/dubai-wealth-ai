import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  User,
  Clock,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQA, QA_CATEGORIES } from '@/hooks/useQA';
import { AnswerCard } from '@/components/community/AnswerCard';
import { Crown } from 'lucide-react';
import { AnswerForm } from '@/components/community/AnswerForm';


export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { fetchQuestion, voteAnswer, markBestAnswer } = useQA();

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['qa-question', questionId],
    queryFn: () => fetchQuestion(questionId!),
    enabled: !!questionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Question not found</p>
        <Button asChild variant="outline">
          <Link to="/community/qa">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Q&A
          </Link>
        </Button>
      </div>
    );
  }

  const category = QA_CATEGORIES.find(c => c.value === question.category);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/community/qa">
            <ArrowLeft className="h-4 w-4" />
            Back to Q&A
          </Link>
        </Button>
      </motion.div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          question.is_solved && "border-l-4 border-l-green-500"
        )}>
          <CardContent className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {category?.label || question.category}
              </Badge>
              {question.is_solved && (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold mb-4">
              {question.title}
            </h1>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              <p className="whitespace-pre-wrap text-foreground/90">
                {question.content}
              </p>
            </div>

            <Separator className="my-4" />

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                {question.is_anonymous ? (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-muted-foreground">Anonymous</span>
                  </div>
                ) : question.author ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={question.author.avatar_url || undefined} />
                      <AvatarFallback>
                        {question.author.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{question.author.full_name}</span>
                      {question.author.membership_tier === 'elite' && (
                        <Crown className="h-3.5 w-3.5 text-gold" />
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views_count} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {question.answers_count} answers
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Answers Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gold" />
          {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {/* Answer Form */}
        <AnswerForm questionId={question.id} />

        {/* Answers List */}
        {question.answers && question.answers.length > 0 ? (
          <div className="space-y-4">
            {question.answers.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
              >
                <AnswerCard
                  answer={answer}
                  questionAuthorId={question.user_id}
                  onVote={(voteType) => voteAnswer.mutate({ 
                    answerId: answer.id, 
                    voteType, 
                    questionId: question.id 
                  })}
                  onMarkBest={() => markBestAnswer.mutate({ 
                    questionId: question.id, 
                    answerId: answer.id 
                  })}
                  isVoting={voteAnswer.isPending}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-1">No answers yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to help this investor!
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
