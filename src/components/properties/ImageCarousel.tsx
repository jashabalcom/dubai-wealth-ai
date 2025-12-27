import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getOptimizedImageUrl, 
  generateSrcSet, 
  IMAGE_SIZES,
  PROPERTY_CARD_SIZES 
} from '@/lib/imageUtils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  sizes?: string;
}

export function ImageCarousel({ images, alt, className, sizes = PROPERTY_CARD_SIZES }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const validImages = images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'];

  const goToPrevious = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setCurrentIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1));
  }, [validImages.length]);

  const goToIndex = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (index !== currentIndex) {
      setIsLoading(true);
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Image with lazy loading and responsive srcset */}
      <img
        src={getOptimizedImageUrl(validImages[currentIndex], IMAGE_SIZES.large)}
        srcSet={generateSrcSet(validImages[currentIndex])}
        sizes={sizes}
        alt={`${alt} - Image ${currentIndex + 1}`}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          "w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform",
          "group-hover:scale-110",
          isLoading && "opacity-0",
          !isLoading && "opacity-100"
        )}
      />

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}

      {/* Navigation Arrows - Only show if more than 1 image */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center",
              "transition-all duration-200 hover:bg-background hover:scale-110 will-change-transform",
              "opacity-0 translate-x-2",
              isHovering && "opacity-100 translate-x-0"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center",
              "transition-all duration-200 hover:bg-background hover:scale-110 will-change-transform",
              "opacity-0 -translate-x-2",
              isHovering && "opacity-100 translate-x-0"
            )}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validImages.length > 1 && (
        <div 
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-background/60 backdrop-blur-sm",
            "transition-opacity duration-200",
            isHovering ? "opacity-100" : "opacity-0"
          )}
        >
          {validImages.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToIndex(e, index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                index === currentIndex 
                  ? "bg-foreground w-3" 
                  : "bg-foreground/40 hover:bg-foreground/60"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
          {validImages.length > 5 && (
            <span className="text-[10px] text-foreground/60 ml-1">
              +{validImages.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div 
          className={cn(
            "absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-sm text-xs text-foreground",
            "transition-opacity duration-200",
            isHovering ? "opacity-100" : "opacity-0"
          )}
        >
          {currentIndex + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}