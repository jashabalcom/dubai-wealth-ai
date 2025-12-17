import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type QACategory = 
  | 'mortgages' 
  | 'legal' 
  | 'golden_visa' 
  | 'property_management' 
  | 'taxes' 
  | 'off_plan' 
  | 'snagging' 
  | 'general';

export const QA_CATEGORIES: { value: QACategory; label: string; description: string }[] = [
  { value: 'mortgages', label: 'Mortgages', description: 'Financing, rates, and loan processes' },
  { value: 'legal', label: 'Legal', description: 'Contracts, ownership, and regulations' },
  { value: 'golden_visa', label: 'Golden Visa', description: 'Residency through investment' },
  { value: 'property_management', label: 'Property Management', description: 'Rentals, maintenance, and tenants' },
  { value: 'taxes', label: 'Taxes', description: 'UAE tax implications and structures' },
  { value: 'off_plan', label: 'Off-Plan', description: 'Pre-construction purchases' },
  { value: 'snagging', label: 'Snagging', description: 'Property inspections and handover' },
  { value: 'general', label: 'General', description: 'Other Dubai investment questions' },
];

export interface QAQuestion {
  id: string;
  user_id: string;
  category: QACategory;
  title: string;
  content: string;
  is_anonymous: boolean;
  is_solved: boolean;
  best_answer_id: string | null;
  views_count: number;
  answers_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    membership_tier: string;
  };
}

export interface QAAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  upvotes_count: number;
  is_best_answer: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    membership_tier: string;
  };
  user_vote?: 'up' | 'down' | null;
}

export interface CreateQuestionData {
  title: string;
  content: string;
  category: QACategory;
  is_anonymous: boolean;
}

export interface CreateAnswerData {
  question_id: string;
  content: string;
}

export function useQA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<QACategory | 'all'>('all');

  // Fetch all questions
  const { data: questions = [], isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ['qa-questions', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('qa_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author profiles for non-anonymous questions
      const authorIds = data
        .filter(q => !q.is_anonymous)
        .map(q => q.user_id);
      
      const uniqueAuthorIds = [...new Set(authorIds)];
      
      let profiles: Record<string, any> = {};
      if (uniqueAuthorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, membership_tier')
          .in('id', uniqueAuthorIds);
        
        if (profilesData) {
          profiles = profilesData.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      return data.map(q => ({
        ...q,
        author: q.is_anonymous ? undefined : profiles[q.user_id],
      })) as QAQuestion[];
    },
  });

  // Fetch single question with answers
  const fetchQuestion = async (questionId: string) => {
    // Fetch question
    const { data: question, error: questionError } = await supabase
      .from('qa_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    // Increment view count
    await supabase
      .from('qa_questions')
      .update({ views_count: (question.views_count || 0) + 1 })
      .eq('id', questionId);

    // Fetch author profile if not anonymous
    let author = undefined;
    if (!question.is_anonymous) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier')
        .eq('id', question.user_id)
        .single();
      author = profile;
    }

    // Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from('qa_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('is_best_answer', { ascending: false })
      .order('upvotes_count', { ascending: false })
      .order('created_at', { ascending: true });

    if (answersError) throw answersError;

    // Fetch answer author profiles
    const answerAuthorIds = answers?.map(a => a.user_id) || [];
    const uniqueAnswerAuthorIds = [...new Set(answerAuthorIds)];
    
    let answerProfiles: Record<string, any> = {};
    if (uniqueAnswerAuthorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier')
        .in('id', uniqueAnswerAuthorIds);
      
      if (profilesData) {
        answerProfiles = profilesData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Fetch user's votes if logged in
    let userVotes: Record<string, 'up' | 'down'> = {};
    if (user) {
      const { data: votesData } = await supabase
        .from('qa_votes')
        .select('answer_id, vote_type')
        .eq('user_id', user.id)
        .in('answer_id', answers?.map(a => a.id) || []);
      
      if (votesData) {
        userVotes = votesData.reduce((acc, v) => {
          acc[v.answer_id] = v.vote_type as 'up' | 'down';
          return acc;
        }, {} as Record<string, 'up' | 'down'>);
      }
    }

    const enrichedAnswers = (answers || []).map(a => ({
      ...a,
      author: answerProfiles[a.user_id],
      user_vote: userVotes[a.id] || null,
    })) as QAAnswer[];

    return {
      ...question,
      author,
      answers: enrichedAnswers,
    } as QAQuestion & { answers: QAAnswer[] };
  };

  // Create question
  const createQuestion = useMutation({
    mutationFn: async (data: CreateQuestionData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: question, error } = await supabase
        .from('qa_questions')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          category: data.category,
          is_anonymous: data.is_anonymous,
        })
        .select()
        .single();

      if (error) throw error;
      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-questions'] });
      toast.success('Question posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post question: ' + error.message);
    },
  });

  // Create answer
  const createAnswer = useMutation({
    mutationFn: async (data: CreateAnswerData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: answer, error } = await supabase
        .from('qa_answers')
        .insert({
          user_id: user.id,
          question_id: data.question_id,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;
      return answer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qa-question', variables.question_id] });
      queryClient.invalidateQueries({ queryKey: ['qa-questions'] });
      toast.success('Answer posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post answer: ' + error.message);
    },
  });

  // Vote on answer
  const voteAnswer = useMutation({
    mutationFn: async ({ answerId, voteType, questionId }: { 
      answerId: string; 
      voteType: 'up' | 'down'; 
      questionId: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('qa_votes')
        .select('*')
        .eq('answer_id', answerId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('qa_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Change vote
          await supabase
            .from('qa_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('qa_votes')
          .insert({
            answer_id: answerId,
            user_id: user.id,
            vote_type: voteType,
          });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qa-question', variables.questionId] });
    },
    onError: (error) => {
      toast.error('Failed to vote: ' + error.message);
    },
  });

  // Mark answer as best
  const markBestAnswer = useMutation({
    mutationFn: async ({ questionId, answerId }: { questionId: string; answerId: string }) => {
      if (!user) throw new Error('Must be logged in');

      // First, unmark any existing best answer
      await supabase
        .from('qa_answers')
        .update({ is_best_answer: false })
        .eq('question_id', questionId);

      // Mark new best answer
      await supabase
        .from('qa_answers')
        .update({ is_best_answer: true })
        .eq('id', answerId);

      // Update question
      await supabase
        .from('qa_questions')
        .update({ 
          best_answer_id: answerId,
          is_solved: true,
        })
        .eq('id', questionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qa-question', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['qa-questions'] });
      toast.success('Best answer marked!');
    },
    onError: (error) => {
      toast.error('Failed to mark best answer: ' + error.message);
    },
  });

  return {
    questions,
    questionsLoading,
    selectedCategory,
    setSelectedCategory,
    fetchQuestion,
    createQuestion,
    createAnswer,
    voteAnswer,
    markBestAnswer,
    refetchQuestions,
  };
}
