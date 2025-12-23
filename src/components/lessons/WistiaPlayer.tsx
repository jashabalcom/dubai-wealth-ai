import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WistiaPlayerProps {
  videoId: string;
  title?: string;
  initialPosition?: number;
  onProgress?: (positionSeconds: number, durationSeconds: number) => void;
  onComplete?: () => void;
}

declare global {
  interface Window {
    _wq: Array<{
      id?: string;
      onReady?: (video: WistiaVideo) => void;
    }>;
    Wistia?: {
      api: (id: string) => WistiaVideo | undefined;
    };
  }
}

interface WistiaVideo {
  bind: (event: string, callback: (data?: number) => void) => void;
  unbind: (event: string) => void;
  time: (seconds?: number) => number;
  duration: () => number;
  play: () => void;
  pause: () => void;
}

export function WistiaPlayer({
  videoId,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
}: WistiaPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<WistiaVideo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResume, setShowResume] = useState(initialPosition > 10);
  const hasResumedRef = useRef(false);

  // Load Wistia script
  useEffect(() => {
    const scriptId = 'wistia-external-script';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize Wistia queue
    window._wq = window._wq || [];
    
    window._wq.push({
      id: videoId,
      onReady: (video: WistiaVideo) => {
        videoRef.current = video;
        setIsLoaded(true);

        // Bind to timechange event for progress tracking
        video.bind('timechange', (time?: number) => {
          if (time !== undefined && onProgress) {
            const duration = video.duration();
            onProgress(time, duration);
            
            // Auto-complete at 90%
            if (time / duration >= 0.9 && onComplete) {
              onComplete();
            }
          }
        });

        // Bind to end event
        video.bind('end', () => {
          if (onComplete) {
            onComplete();
          }
        });
      },
    });

    return () => {
      // Cleanup video bindings
      if (videoRef.current) {
        videoRef.current.unbind('timechange');
        videoRef.current.unbind('end');
      }
    };
  }, [videoId, onProgress, onComplete]);

  // Handle resume functionality
  const handleResume = () => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.time(initialPosition);
      videoRef.current.play();
      setShowResume(false);
      hasResumedRef.current = true;
    }
  };

  const handleStartOver = () => {
    if (videoRef.current) {
      videoRef.current.time(0);
      videoRef.current.play();
      setShowResume(false);
      hasResumedRef.current = true;
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative aspect-video bg-black" ref={containerRef}>
      {/* Wistia embed div */}
      <div
        className={`wistia_embed wistia_async_${videoId} seo=true videoFoam=true`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Resume overlay */}
      {showResume && isLoaded && initialPosition > 10 && !hasResumedRef.current && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <p className="text-white text-lg">
              Resume from <span className="text-gold font-semibold">{formatTime(initialPosition)}</span>?
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button variant="gold" size="sm" onClick={handleResume}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
