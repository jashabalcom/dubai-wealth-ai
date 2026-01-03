import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectVideoPlayerProps {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  brandColor?: string;
}

export function ProjectVideoPlayer({ 
  url, 
  title = 'Project Video', 
  thumbnailUrl,
  brandColor 
}: ProjectVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID and platform
  const getVideoEmbed = (rawUrl: string): { embedUrl: string; platform: string } | null => {
    // YouTube
    const youtubeMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`,
        platform: 'YouTube'
      };
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        platform: 'Vimeo'
      };
    }

    // Direct video URL
    if (rawUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        embedUrl: rawUrl,
        platform: 'direct'
      };
    }

    // Generic iframe
    return {
      embedUrl: rawUrl,
      platform: 'other'
    };
  };

  const videoInfo = getVideoEmbed(url);

  // Generate thumbnail from YouTube if not provided
  const getThumbnail = (): string | null => {
    if (thumbnailUrl) return thumbnailUrl;
    
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    return null;
  };

  const thumbnail = getThumbnail();

  if (!videoInfo) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
      {!isPlaying ? (
        // Thumbnail with play button
        <div 
          className="relative w-full h-full cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "bg-white/90 group-hover:bg-white transition-all",
                "group-hover:scale-110 shadow-xl"
              )}
            >
              <Play 
                className="h-8 w-8 ml-1" 
                style={{ color: brandColor || 'hsl(var(--primary))' }}
                fill={brandColor || 'hsl(var(--primary))'}
              />
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h4 className="text-white font-medium">{title}</h4>
            <p className="text-white/70 text-sm">Click to play</p>
          </div>

          {/* External link */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              window.open(url, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Video Player
        <>
          {videoInfo.platform === 'direct' ? (
            <video
              src={videoInfo.embedUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={videoInfo.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </>
      )}
    </div>
  );
}
