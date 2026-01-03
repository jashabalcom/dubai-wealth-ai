import { useState, useRef } from 'react';
import { Maximize2, Minimize2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VirtualTourEmbedProps {
  url: string;
  title?: string;
  brandColor?: string;
}

export function VirtualTourEmbed({ url, title = 'Virtual Tour', brandColor }: VirtualTourEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Listen for fullscreen changes
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  // Detect tour provider for optimized embed
  const getEmbedUrl = (rawUrl: string): string => {
    // Matterport - ensure proper embed format
    if (rawUrl.includes('matterport.com')) {
      if (!rawUrl.includes('m=')) {
        return rawUrl;
      }
      const modelId = rawUrl.match(/m=([^&]+)/)?.[1];
      if (modelId) {
        return `https://my.matterport.com/show/?m=${modelId}&play=1`;
      }
    }
    
    // Kuula
    if (rawUrl.includes('kuula.co')) {
      return rawUrl.replace('/share/', '/embed/');
    }
    
    return rawUrl;
  };

  // Add fullscreen event listener
  useState(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full rounded-xl overflow-hidden bg-muted",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
      )}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-3">
            <Loader2 
              className="h-8 w-8 animate-spin" 
              style={{ color: brandColor || 'hsl(var(--primary))' }}
            />
            <span className="text-sm text-muted-foreground">Loading virtual tour...</span>
          </div>
        </div>
      )}

      {/* Virtual Tour Iframe */}
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        className={cn(
          "w-full h-full border-0",
          isLoading && "opacity-0"
        )}
        allow="fullscreen; vr; gyroscope; accelerometer; xr-spatial-tracking"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Title Overlay */}
      {title && !isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h4 className="text-white font-medium">{title}</h4>
        </div>
      )}
    </div>
  );
}
