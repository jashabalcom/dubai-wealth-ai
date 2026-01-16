import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  IMAGE_SIZES,
  PROPERTY_CARD_SIZES 
} from '@/lib/imageUtils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | '4/3' | '3/2' | '16/9' | 'auto';
  priority?: boolean;
  fallback?: string;
  blurPlaceholder?: boolean;
  onLoadComplete?: () => void;
}

const aspectRatioClasses: Record<string, string> = {
  'square': 'aspect-square',
  'video': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-[16/9]',
  'auto': '',
};

/**
 * Optimized image component with:
 * - Intersection Observer for true lazy loading
 * - Blur-up placeholder effect
 * - Responsive srcset generation
 * - Error handling with fallback
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  aspectRatio = 'auto',
  priority = false,
  fallback = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
  blurPlaceholder = true,
  sizes = PROPERTY_CARD_SIZES,
  className,
  onLoadComplete,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '200px', // Start loading 200px before entering viewport
        threshold: 0.01 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = hasError ? fallback : src;
  const optimizedSrc = getOptimizedImageUrl(imageSrc, IMAGE_SIZES.large);
  const srcSet = !hasError ? generateSrcSet(imageSrc) : undefined;

  // Generate tiny placeholder for blur effect
  const placeholderSrc = blurPlaceholder && !hasError
    ? getOptimizedImageUrl(src, 20, 20)
    : undefined;

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Blur placeholder - tiny version scaled up */}
      {blurPlaceholder && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70"
        />
      )}

      {/* Skeleton shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-wave" />
      )}

      {/* Main image - only load when in view */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * Simple lazy image for non-critical images
 * Uses native lazy loading only
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  fallback = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? fallback : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
});

export default OptimizedImage;