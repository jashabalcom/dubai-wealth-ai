import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url: string | null;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
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

    // Wistia
    const wistiaMatch = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/);
    if (wistiaMatch) {
      return (
        <iframe
          src={`https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`}
          title={title || 'Video'}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }

    // Direct video URL (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
      return (
        <video
          controls
          className="absolute inset-0 w-full h-full object-contain bg-black"
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

  return (
    <div className="aspect-video bg-black relative overflow-hidden">
      {getVideoEmbed()}
    </div>
  );
}
