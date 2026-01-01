import * as React from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  blur?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  objectFit?: "cover" | "contain" | "fill";
  fallback?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  blur = true,
  aspectRatio,
  objectFit = "cover",
  fallback = "/placeholder.svg",
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Handle image load
  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Handle image error
  const handleError = React.useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Generate srcset for responsive images
  const generateSrcSet = React.useCallback((baseSrc: string) => {
    // Skip for data URLs or SVGs
    if (baseSrc.startsWith("data:") || baseSrc.endsWith(".svg")) {
      return undefined;
    }

    // For Supabase storage URLs, we could add transforms here
    // For now, just return the base src
    return undefined;
  }, []);

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {blur && !isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}

      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleError}
        srcSet={generateSrcSet(src)}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />
    </div>
  );
}

// Hero image with overlay support
interface HeroImageProps extends OptimizedImageProps {
  overlay?: boolean;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export function HeroImage({
  overlay = true,
  overlayOpacity = 60,
  children,
  className,
  ...props
}: HeroImageProps) {
  return (
    <div className={cn("relative", className)}>
      <OptimizedImage
        priority
        blur
        className="absolute inset-0 w-full h-full"
        objectFit="cover"
        {...props}
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-secondary"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

// Thumbnail with zoom on hover
interface ThumbnailProps extends OptimizedImageProps {
  zoom?: boolean;
}

export function Thumbnail({ zoom = true, className, ...props }: ThumbnailProps) {
  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <OptimizedImage
        className={cn(
          "w-full h-full transition-transform duration-500",
          zoom && "group-hover:scale-110"
        )}
        {...props}
      />
    </div>
  );
}

// Avatar image with fallback initials
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  fallbackInitials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function AvatarImage({
  src,
  alt,
  fallbackInitials,
  size = "md",
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials = fallbackInitials || alt.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary",
          avatarSizes[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn(
        "rounded-full object-cover",
        avatarSizes[size],
        className
      )}
    />
  );
}
