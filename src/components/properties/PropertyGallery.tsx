import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];           // Re-hosted images (Supabase)
  galleryUrls?: string[];     // CDN references (Bayut) - optional for hybrid storage
  title: string;
}

export function PropertyGallery({ images, galleryUrls = [], title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Combine re-hosted images with CDN references
  const allImages = [...images, ...galleryUrls];
  
  // Filter out failed images and provide fallback if all fail
  const validImages = allImages.length > 0 
    ? allImages.filter((_, index) => !failedImages.has(index))
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'];

  // If all images failed, show fallback
  const displayImages = validImages.length > 0 
    ? validImages 
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'];

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // Handle CDN image failures
  const handleImageError = (originalIndex: number) => {
    console.warn(`[PropertyGallery] Image failed to load at index ${originalIndex}`);
    setFailedImages(prev => new Set(prev).add(originalIndex));
    
    // If current image failed, move to next valid image
    if (originalIndex === currentIndex && displayImages.length > 1) {
      nextImage();
    }
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

  // Get the actual index in allImages array for error tracking
  const getOriginalIndex = (displayIndex: number): number => {
    let count = 0;
    for (let i = 0; i < allImages.length; i++) {
      if (!failedImages.has(i)) {
        if (count === displayIndex) return i;
        count++;
      }
    }
    return -1;
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Hero Image */}
        <div 
          className="relative h-[50vh] md:h-[60vh] bg-primary-dark cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={displayImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(getOriginalIndex(currentIndex))}
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
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                    index === currentIndex 
                      ? "ring-2 ring-gold opacity-100" 
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(getOriginalIndex(index))}
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
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white/80 text-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>

            {/* Main Image */}
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={displayImages[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={() => handleImageError(getOriginalIndex(currentIndex))}
            />

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "relative w-16 h-12 rounded overflow-hidden flex-shrink-0 transition-all",
                    index === currentIndex 
                      ? "ring-2 ring-gold opacity-100" 
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(getOriginalIndex(index))}
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
