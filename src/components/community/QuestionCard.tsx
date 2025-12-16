import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, CheckCircle2, User, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { QAQuestion, QA_CATEGORIES } from '@/hooks/useQA';

interface QuestionCardProps {
  question: QAQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const category = QA_CATEGORIES.find(c => c.value === question.category);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/community/qa/${question.id}`}>
        <Card className={cn(
          "transition-all duration-200 hover:shadow-lg hover:border-gold/30",
          question.is_solved && "border-l-4 border-l-green-500"
        )}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex gap-4">
              {/* Stats Column */}
              <div className="hidden sm:flex flex-col items-center gap-2 text-center min-w-[60px]">
                <div className={cn(
                  "text-lg font-semibold",
                  question.answers_count > 0 ? "text-gold" : "text-muted-foreground"
                )}>
                  {question.answers_count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {question.answers_count === 1 ? 'answer' : 'answers'}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Eye className="h-3 w-3" />
                  {question.views_count}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-gold transition-colors">
                    {question.title}
                  </h3>
                  {question.is_solved && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {question.content}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {category?.label || question.category}
                  </Badge>

                  {/* Mobile stats */}
                  <div className="flex items-center gap-3 sm:hidden text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {question.answers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {question.views_count}
                    </span>
                  </div>

                  <div className="flex-1" />

                  {/* Author info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {question.is_anonymous ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span>Anonymous</span>
                      </div>
                    ) : question.author ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={question.author.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {question.author.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[100px]">{question.author.full_name}</span>
                        {question.author.membership_tier === 'elite' && (
                          <Crown className="h-3 w-3 text-gold" />
                        )}
                      </div>
                    ) : null}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
