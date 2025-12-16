import { useState } from 'react';
import { Loader2, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useQA } from '@/hooks/useQA';
import { Link } from 'react-router-dom';

interface AnswerFormProps {
  questionId: string;
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createAnswer } = useQA();

  const canAnswer = profile?.membership_tier === 'investor' || profile?.membership_tier === 'elite';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !canAnswer) return;

    await createAnswer.mutateAsync({
      question_id: questionId,
      content: content.trim(),
    });

    setContent('');
  };

  if (!user) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground mb-3">Sign in to answer this question</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!canAnswer) {
    return (
      <Card className="bg-muted/30 border-gold/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Lock className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Upgrade to Answer</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Dubai Investor and Elite members can share their knowledge and help other investors.
              </p>
              <Button asChild size="sm" variant="gold">
                <Link to="/pricing">Upgrade Membership</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="Share your knowledge and experience to help fellow investors..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={5000}
            className="mb-3"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {content.length}/5000 characters
            </p>
            <Button 
              type="submit" 
              disabled={!content.trim() || createAnswer.isPending}
              className="gap-2"
            >
              {createAnswer.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Answer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
