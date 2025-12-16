-- Create Q&A categories enum
CREATE TYPE public.qa_category AS ENUM (
  'mortgages',
  'legal',
  'golden_visa',
  'property_management',
  'taxes',
  'off_plan',
  'snagging',
  'general'
);

-- Create qa_questions table
CREATE TABLE public.qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category qa_category NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  best_answer_id UUID,
  views_count INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qa_answers table
CREATE TABLE public.qa_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.qa_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  is_best_answer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for best_answer_id after qa_answers exists
ALTER TABLE public.qa_questions 
ADD CONSTRAINT qa_questions_best_answer_fkey 
FOREIGN KEY (best_answer_id) REFERENCES public.qa_answers(id) ON DELETE SET NULL;

-- Create qa_votes table for tracking user votes on answers
CREATE TABLE public.qa_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.qa_answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_qa_questions_category ON public.qa_questions(category);
CREATE INDEX idx_qa_questions_user_id ON public.qa_questions(user_id);
CREATE INDEX idx_qa_questions_is_solved ON public.qa_questions(is_solved);
CREATE INDEX idx_qa_questions_created_at ON public.qa_questions(created_at DESC);
CREATE INDEX idx_qa_answers_question_id ON public.qa_answers(question_id);
CREATE INDEX idx_qa_answers_user_id ON public.qa_answers(user_id);
CREATE INDEX idx_qa_votes_answer_id ON public.qa_votes(answer_id);
CREATE INDEX idx_qa_votes_user_id ON public.qa_votes(user_id);

-- Enable RLS
ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qa_questions
-- All authenticated users can view questions
CREATE POLICY "Anyone can view questions"
ON public.qa_questions FOR SELECT
USING (true);

-- All authenticated users can ask questions
CREATE POLICY "Authenticated users can ask questions"
ON public.qa_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own questions
CREATE POLICY "Users can update their own questions"
ON public.qa_questions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete their own questions"
ON public.qa_questions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for qa_answers
-- All authenticated users can view answers
CREATE POLICY "Anyone can view answers"
ON public.qa_answers FOR SELECT
USING (true);

-- Investor+ members can post answers (check membership tier)
CREATE POLICY "Investor+ members can answer questions"
ON public.qa_answers FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.membership_tier IN ('investor', 'elite')
  )
);

-- Users can update their own answers
CREATE POLICY "Users can update their own answers"
ON public.qa_answers FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete their own answers"
ON public.qa_answers FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for qa_votes
-- All authenticated users can view votes
CREATE POLICY "Anyone can view votes"
ON public.qa_votes FOR SELECT
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
ON public.qa_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can change their own votes
CREATE POLICY "Users can update their own votes"
ON public.qa_votes FOR UPDATE
USING (auth.uid() = user_id);

-- Users can remove their own votes
CREATE POLICY "Users can delete their own votes"
ON public.qa_votes FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update answers_count on qa_questions
CREATE OR REPLACE FUNCTION public.update_qa_answers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.qa_questions 
    SET answers_count = answers_count + 1 
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.qa_questions 
    SET answers_count = answers_count - 1 
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_qa_answers_count
AFTER INSERT OR DELETE ON public.qa_answers
FOR EACH ROW EXECUTE FUNCTION public.update_qa_answers_count();

-- Create trigger to update upvotes_count on qa_answers
CREATE OR REPLACE FUNCTION public.update_qa_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.qa_answers SET upvotes_count = upvotes_count + 1 WHERE id = NEW.answer_id;
    ELSE
      UPDATE public.qa_answers SET upvotes_count = upvotes_count - 1 WHERE id = NEW.answer_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.qa_answers SET upvotes_count = upvotes_count - 1 WHERE id = OLD.answer_id;
    ELSE
      UPDATE public.qa_answers SET upvotes_count = upvotes_count + 1 WHERE id = OLD.answer_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE public.qa_answers SET upvotes_count = upvotes_count - 2 WHERE id = NEW.answer_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE public.qa_answers SET upvotes_count = upvotes_count + 2 WHERE id = NEW.answer_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_qa_upvotes_count
AFTER INSERT OR UPDATE OR DELETE ON public.qa_votes
FOR EACH ROW EXECUTE FUNCTION public.update_qa_upvotes_count();