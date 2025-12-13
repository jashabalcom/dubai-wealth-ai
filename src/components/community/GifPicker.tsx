import { useState, useEffect, useCallback } from 'react';
import { Search, X, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  disabled?: boolean;
}

interface TenorGif {
  id: string;
  media_formats: {
    gif: { url: string };
    tinygif: { url: string };
  };
}

export function GifPicker({ onSelect, disabled }: GifPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGifs = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('search-gifs', {
        body: { query: query || 'trending', limit: 20 },
      });

      if (fnError) throw fnError;
      setGifs(data?.results || []);
    } catch (err) {
      console.error('Failed to fetch GIFs:', err);
      setError('Failed to load GIFs');
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trending GIFs on open
  useEffect(() => {
    if (isOpen && gifs.length === 0) {
      fetchGifs('');
    }
  }, [isOpen, fetchGifs, gifs.length]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      fetchGifs(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isOpen, fetchGifs]);

  const handleSelect = (gif: TenorGif) => {
    onSelect(gif.media_formats.gif.url);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-muted-foreground hover:text-gold hover:bg-gold/10"
        >
          <span className="font-bold text-xs">GIF</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card border-border/50" 
        align="start"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search GIFs..."
              className="pl-9 pr-8 bg-muted/30 border-border/50 focus:border-gold/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchGifs(search)}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No GIFs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 p-2">
              <AnimatePresence mode="popLayout">
                {gifs.map((gif) => (
                  <motion.button
                    key={gif.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleSelect(gif)}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted hover:ring-2 hover:ring-gold/50 transition-all group"
                  >
                    <img
                      src={gif.media_formats.tinygif.url}
                      alt="GIF"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border/50 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Powered by Tenor</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}