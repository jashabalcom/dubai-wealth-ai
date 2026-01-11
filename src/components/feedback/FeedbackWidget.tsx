import { useState } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle, BookOpen, Palette, X, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FeedbackCategory = 'bug' | 'feature' | 'general' | 'content' | 'ux';

const categories: { value: FeedbackCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" />, description: 'Something is broken' },
  { value: 'feature', label: 'Feature Request', icon: <Lightbulb className="h-4 w-4" />, description: 'Suggest an improvement' },
  { value: 'general', label: 'General Feedback', icon: <MessageCircle className="h-4 w-4" />, description: 'Share your thoughts' },
  { value: 'content', label: 'Content', icon: <BookOpen className="h-4 w-4" />, description: 'About courses or data' },
  { value: 'ux', label: 'UX/Design', icon: <Palette className="h-4 w-4" />, description: 'User experience' },
];

export function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'category' | 'details'>('category');

  const resetForm = () => {
    setCategory(null);
    setTitle('');
    setDescription('');
    setRating(0);
    setStep('category');
  };

  const handleSubmit = async () => {
    if (!category || !title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('user_feedback').insert({
        user_id: user?.id || null,
        category,
        title: title.trim(),
        description: description.trim(),
        rating: rating || null,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback! 🙏');
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (cat: FeedbackCategory) => {
    setCategory(cat);
    setStep('details');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Send feedback"
          >
            <MessageSquarePlus className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="end" 
          side="top"
          sideOffset={12}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {step === 'category' ? 'Send Feedback' : categories.find(c => c.value === category)?.label}
              </h3>
              {step === 'details' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('category')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back
                </Button>
              )}
            </div>

            {step === 'category' ? (
              <div className="grid gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border",
                      "hover:bg-accent hover:border-accent transition-colors",
                      "text-left w-full"
                    )}
                  >
                    <div className="text-primary">{cat.icon}</div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback-title" className="text-foreground">Title *</Label>
                  <Input
                    id="feedback-title"
                    placeholder="Brief summary..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback-desc" className="text-foreground">Description *</Label>
                  <Textarea
                    id="feedback-desc"
                    placeholder="Tell us more..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="mt-1 resize-none"
                  />
                </div>

                <div>
                  <Label className="text-foreground">How would you rate your experience?</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 transition-colors",
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Sign in to track your feedback status
                  </p>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
