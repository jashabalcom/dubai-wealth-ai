import { useState } from 'react';
import { Video, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface VideoEmbedModalProps {
  onEmbed: (url: string) => void;
  trigger?: React.ReactNode;
}

const VIDEO_PATTERNS = [
  { name: 'YouTube', pattern: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/ },
  { name: 'Vimeo', pattern: /vimeo\.com\/(?:video\/)?(\d+)/ },
  { name: 'Loom', pattern: /loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/ },
];

export function VideoEmbedModal({ onEmbed, trigger }: VideoEmbedModalProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const validateUrl = (url: string): boolean => {
    return VIDEO_PATTERNS.some(({ pattern }) => pattern.test(url));
  };

  const getVideoPlatform = (url: string): string | null => {
    for (const { name, pattern } of VIDEO_PATTERNS) {
      if (pattern.test(url)) return name;
    }
    return null;
  };

  const handleSubmit = () => {
    if (!validateUrl(url)) {
      toast.error('Please enter a valid YouTube, Vimeo, or Loom URL');
      return;
    }
    
    onEmbed(url.trim());
    setUrl('');
    setOpen(false);
  };

  const platform = url ? getVideoPlatform(url) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-gold hover:bg-gold/10"
          >
            <Video className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Video className="h-5 w-5 text-gold" />
            Embed Video
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Video URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or Loom URL..."
                className="pl-10 bg-muted/30 border-border/50 focus:border-gold/50"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: YouTube, Vimeo, Loom
            </p>
          </div>
          
          {platform && (
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 text-sm">
              <span className="text-gold font-medium">{platform}</span> video detected
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!url.trim() || !platform}
              className="bg-gold hover:bg-gold/90 text-background"
            >
              Embed Video
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
