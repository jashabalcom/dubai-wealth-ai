import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, generateSrcSet, IMAGE_SIZES } from '@/lib/imageUtils';

interface ProgressiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blur?: boolean;
  blurhash?: string;
  aspectRatio?: 'square' | 'video' | '4/3' | '3/2' | '21/9' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  fallback?: string;
  onLoadComplete?: () => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  showSkeleton?: boolean;
}

const aspectRatioClasses: Record<string, string> = {
  'square': 'aspect-square',
  'video': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '21/9': 'aspect-[21/9]',
  'auto': '',
};

const objectFitClasses: Record<string, string> = {
  'cover': 'object-cover',
  'contain': 'object-contain',
  'fill': 'object-fill',
  'none': 'object-none',
};

/**
 * Progressive image component with blur-up loading effect
 * Supports WebP/AVIF format detection and responsive srcset
 */
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  priority = false,
  blur = true,
  blurhash,
  aspectRatio = 'auto',
  objectFit = 'cover',
  fallback = '/placeholder.svg',
  onLoadComplete,
  onLoad: onLoadProp,
  onError: onErrorProp,
  showSkeleton = true,
  className,
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState<string>(src);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Detect WebP/AVIF support
  const supportsWebP = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }, []);

  // Generate optimized image URL
  const optimizedSrc = React.useMemo(() => {
    if (!src || hasError) return fallback;
    return getOptimizedImageUrl(src, width || IMAGE_SIZES.large, 80);
  }, [src, width, hasError, fallback]);

  // Generate srcset for responsive images
  const srcSet = React.useMemo(() => {
    if (!src || src.startsWith('data:') || src.endsWith('.svg')) return undefined;
    return generateSrcSet(src, undefined, 80);
  }, [src]);

  // Generate low-quality placeholder
  const placeholderSrc = React.useMemo(() => {
    if (!src || src.startsWith('data:') || src.endsWith('.svg')) return undefined;
    return getOptimizedImageUrl(src, 20, 20); // Tiny placeholder
  }, [src]);

  const handleLoad = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoadComplete?.();
    onLoadProp?.(event);
  }, [onLoadComplete, onLoadProp]);

  const handleError = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`[ProgressiveImage] Failed to load: ${src}`);
    setHasError(true);
    setIsLoaded(true);
    setCurrentSrc(fallback);
    onErrorProp?.(event);
  }, [fallback, onErrorProp, src]);

  // Reset state when src changes
  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        className
      )}
      style={{ width, height }}
    >
      {/* Skeleton/blur placeholder */}
      <AnimatePresence>
        {!isLoaded && showSkeleton && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Blur-up placeholder */}
            {blur && placeholderSrc && (
              <img
                src={placeholderSrc}
                alt=""
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 w-full h-full blur-xl scale-110',
                  objectFitClasses[objectFit]
                )}
              />
            )}
            
            {/* Shimmer skeleton overlay */}
            <div className="absolute inset-0 skeleton-wave" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        <img
          ref={imgRef}
          src={hasError ? fallback : optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          srcSet={!hasError ? srcSet : undefined}
          sizes={props.sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn('w-full h-full', objectFitClasses[objectFit])}
        />
      </motion.div>
    </div>
  );
}

/**
 * Lazy background image with progressive loading
 */
interface LazyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  overlay?: boolean;
  overlayOpacity?: number;
  blur?: boolean;
  children?: React.ReactNode;
}

export function LazyBackground({
  src,
  overlay = true,
  overlayOpacity = 50,
  blur = false,
  children,
  className,
  style,
  ...props
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use Intersection Observer for lazy loading
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Preload image when visible
  React.useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.src = getOptimizedImageUrl(src, IMAGE_SIZES.full, 80);
    img.onload = () => setIsLoaded(true);
  }, [isVisible, src]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {/* Background image */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-cover bg-center bg-no-repeat',
          blur && 'blur-sm scale-105'
        )}
        style={{
          backgroundImage: isLoaded 
            ? `url(${getOptimizedImageUrl(src, IMAGE_SIZES.full, 80)})` 
            : undefined,
          ...style,
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.1,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-wave" />
      )}

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-secondary"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

/**
 * Gallery image with zoom and lightbox support
 */
interface GalleryImageProps extends ProgressiveImageProps {
  onClick?: () => void;
  zoomOnHover?: boolean;
}

export function GalleryImage({
  onClick,
  zoomOnHover = true,
  className,
  ...props
}: GalleryImageProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden cursor-pointer group',
        className
      )}
      onClick={onClick}
      whileHover={zoomOnHover ? { scale: 1.02 } : undefined}
      whileTap={{ scale: 0.98 }}
    >
      <ProgressiveImage
        {...props}
        className={cn(
          'transition-transform duration-500',
          zoomOnHover && 'group-hover:scale-110'
        )}
      />
      
      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-secondary/0 flex items-center justify-center"
        whileHover={{ backgroundColor: 'hsl(220 40% 8% / 0.3)' }}
      >
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ scale: 0.8 }}
          whileHover={{ scale: 1 }}
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ProgressiveImage;
