import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreatePostDialogProps {
  onSubmit: (title: string, content: string) => void;
  isSubmitting: boolean;
}

export function CreatePostDialog({ onSubmit, isSubmitting }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onSubmit(title, content);
    setTitle('');
    setContent('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="bg-gold hover:bg-gold/90 text-background font-medium shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] bg-card/95 backdrop-blur-md border-border/50 rounded-2xl p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative Header Background */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gold/10 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-6 pb-2 relative">
            <DialogTitle className="flex items-center gap-2 text-xl font-serif">
              <div className="p-2 rounded-lg bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              Create a New Post
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or insights..."
                className="min-h-[160px] resize-none bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl border-border/50 hover:bg-muted/50"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || isSubmitting}
                  className="bg-gold hover:bg-gold/90 text-background font-medium rounded-xl shadow-lg shadow-gold/20 min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    'Post'
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}