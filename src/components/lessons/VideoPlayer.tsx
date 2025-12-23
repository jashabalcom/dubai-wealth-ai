import { Play } from 'lucide-react';
import { WistiaPlayer } from './WistiaPlayer';

interface VideoPlayerProps {
  url: string | null;
  title?: string;
  lessonId?: string;
  initialPosition?: number;
  onProgress?: (positionSeconds: number, durationSeconds: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ 
  url, 
  title, 
  lessonId,
  initialPosition = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  if (!url) {
    return (
      <div className="aspect-video bg-secondary relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
            <Play className="w-10 h-10 text-gold fill-gold ml-1" />
          </div>
          <p className="text-muted-foreground">Video coming soon</p>
        </div>
      </div>
    );
  }

  // Detect video type and render appropriate player
  const getVideoEmbed = () => {
    // Wistia - Use enhanced player with progress tracking
    const wistiaMatch = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
    if (wistiaMatch) {
      return (
        <WistiaPlayer
          videoId={wistiaMatch[1]}
          title={title}
          initialPosition={initialPosition}
          onProgress={onProgress}
          onComplete={onComplete}
        />
      );
    }

    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (youtubeMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`}
          title={title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`}
          title={title || 'Video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
      return (
        <iframe
          src={`https://www.loom.com/embed/${loomMatch[1]}`}
          title={title || 'Video'}
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }

    // Direct video URL (mp4, webm, etc.) - with progress tracking
    if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
      return (
        <video
          controls
          className="absolute inset-0 w-full h-full object-contain bg-black"
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (onProgress && video.duration) {
              onProgress(video.currentTime, video.duration);
            }
          }}
          onEnded={() => onComplete?.()}
          onLoadedMetadata={(e) => {
            // Resume from saved position for direct videos
            if (initialPosition > 0) {
              e.currentTarget.currentTime = initialPosition;
            }
          }}
        >
          <source src={url} type={`video/${url.split('.').pop()?.split('?')[0]}`} />
          Your browser does not support video playback.
        </video>
      );
    }

    // Fallback - try as iframe
    return (
      <iframe
        src={url}
        title={title || 'Video'}
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    );
  };

  const embed = getVideoEmbed();
  
  // WistiaPlayer handles its own container
  const isWistia = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
  if (isWistia) {
    return embed;
  }

  return (
    <div className="aspect-video bg-black relative overflow-hidden">
      {embed}
    </div>
  );
}
