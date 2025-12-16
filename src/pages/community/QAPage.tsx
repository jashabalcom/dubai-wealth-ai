import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, Filter, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useQA, QA_CATEGORIES, QACategory } from '@/hooks/useQA';
import { QuestionCard } from '@/components/community/QuestionCard';
import { AskQuestionDialog } from '@/components/community/AskQuestionDialog';
import { EmptyState } from '@/components/ui/empty-state';

export default function QAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { questions, questionsLoading, selectedCategory, setSelectedCategory } = useQA();

  // Filter questions by search
  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into solved and unsolved
  const unsolvedQuestions = filteredQuestions.filter(q => !q.is_solved);
  const solvedQuestions = filteredQuestions.filter(q => q.is_solved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-7 w-7 text-gold" />
              Q&A Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Get answers from experienced Dubai investors
            </p>
          </div>
          <AskQuestionDialog />
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              selectedCategory === 'all' && "bg-gold hover:bg-gold/90"
            )}
          >
            All Topics
          </Button>
          {QA_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                selectedCategory === cat.value && "bg-gold hover:bg-gold/90"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Questions List */}
      {questionsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions yet"
          description={
            selectedCategory !== 'all'
              ? `Be the first to ask about ${QA_CATEGORIES.find(c => c.value === selectedCategory)?.label}`
              : "Be the first to ask a question and help build our knowledge base"
          }
        >
          <AskQuestionDialog
            trigger={
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Ask the First Question
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {/* Unanswered Questions */}
          {unsolvedQuestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Open Questions
                <Badge variant="secondary">{unsolvedQuestions.length}</Badge>
              </h2>
              <div className="space-y-3">
                {unsolvedQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <QuestionCard question={question} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Solved Questions */}
          {solvedQuestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Solved Questions
                <Badge variant="secondary">{solvedQuestions.length}</Badge>
              </h2>
              <div className="space-y-3">
                {solvedQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <QuestionCard question={question} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
