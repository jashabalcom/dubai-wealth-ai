import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProgressiveImage from '@/components/ui/progressive-image';

interface PropertyGalleryProps {
  images: string[];           // Re-hosted images (Supabase)
  galleryUrls?: string[];     // CDN references (Bayut) - optional for hybrid storage
  title: string;
}

export function PropertyGallery({ images, galleryUrls = [], title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Combine and sanitize images - filter out invalid URLs
  const allImages = [...images, ...galleryUrls]
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map(url => url.trim());
  
  // Filter out failed images
  const validImages = allImages.filter(url => !failedImages.has(url));

  // Fallback if all images failed or none provided
  const fallbackImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200';
  const displayImages = validImages.length > 0 ? validImages : [fallbackImage];

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // Handle image failures by URL
  const handleImageError = (url: string) => {
    console.warn(`[PropertyGallery] Image failed to load: ${url}`);
    setFailedImages(prev => new Set(prev).add(url));
  };

  // Reset current index if it exceeds valid images
  useEffect(() => {
    if (currentIndex >= displayImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, displayImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Hero Image */}
        <div 
          className="relative h-[50vh] md:h-[60vh] bg-secondary cursor-pointer group overflow-hidden"
          onClick={() => setIsLightboxOpen(true)}
        >
          <ProgressiveImage
            src={displayImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full"
            objectFit="cover"
            priority
            onLoad={() => setIsLoading(false)}
            onError={() => handleImageError(displayImages[currentIndex])}
          />
          
          {/* Zoom Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* CDN Badge (optional - shows when viewing CDN images) */}
          {galleryUrls.length > 0 && currentIndex >= images.length && (
            <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
              External Image
            </div>
          )}

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentIndex + 1} / {displayImages.length}
            {failedImages.size > 0 && (
              <span className="ml-2 text-yellow-400">
                ({failedImages.size} unavailable)
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="bg-card border-t border-border p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {displayImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all bg-muted",
                    index === currentIndex 
                      ? "ring-2 ring-gold opacity-100" 
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <ProgressiveImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full"
                    objectFit="cover"
                    onError={() => handleImageError(image)}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white/80 text-sm z-10">
              {currentIndex + 1} / {displayImages.length}
            </div>

            {/* Main Image Container */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ProgressiveImage
                src={displayImages[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh]"
                objectFit="contain"
                priority
                onError={() => handleImageError(displayImages[currentIndex])}
                fallback={fallbackImage}
              />
            </motion.div>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto z-10">
              {displayImages.map((image, index) => (
                <button
                  key={`lightbox-${image}-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "relative w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all bg-muted/20",
                    index === currentIndex 
                      ? "ring-2 ring-gold opacity-100" 
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <ProgressiveImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full"
                    objectFit="cover"
                    onError={() => handleImageError(image)}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
