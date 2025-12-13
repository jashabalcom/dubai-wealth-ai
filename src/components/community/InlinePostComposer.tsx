import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, BarChart3, Smile, Send, X, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

interface InlinePostComposerProps {
  onSubmit: (title: string, content: string, images: File[]) => void;
  isSubmitting: boolean;
  canPost: boolean;
}

export function InlinePostComposer({ onSubmit, isSubmitting, canPost }: InlinePostComposerProps) {
  const { profile } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      return;
    }
    
    const newImages = [...images, ...files];
    setImages(newImages);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit(title, content, images);
    setTitle('');
    setContent('');
    setImages([]);
    setPreviews([]);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setImages([]);
    setPreviews([]);
    setIsExpanded(false);
  };

  if (!canPost) {
    return (
      <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 opacity-60">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-2 ring-offset-card">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-muted text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 text-muted-foreground text-sm">
            Upgrade to post in the community...
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        "bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300",
        isExpanded && "ring-2 ring-gold/20"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none" />
      
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <Avatar className={cn(
            "h-10 w-10 ring-2 ring-offset-2 ring-offset-card transition-all",
            profile?.membership_tier === 'elite' ? "ring-gold/50" : "ring-border/30"
          )}>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-muted text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.button
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsExpanded(true)}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-muted/50 text-muted-foreground text-sm hover:bg-muted/70 transition-colors"
                >
                  Share your thoughts, wins, or questions...
                </motion.button>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title..."
                    className="bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 font-serif text-lg"
                  />
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={4}
                    className="bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 resize-none"
                  />
                  
                  {/* Image Previews */}
                  {previews.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Action Bar */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 4}
                    className="text-muted-foreground hover:text-gold hover:bg-gold/10"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-gold hover:bg-gold/10"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-gold hover:bg-gold/10"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-gold hover:bg-gold/10"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !content.trim() || isSubmitting}
                    size="sm"
                    className="bg-gold hover:bg-gold/90 text-background"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
