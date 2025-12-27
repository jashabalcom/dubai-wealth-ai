/**
 * Image optimization utilities for responsive images
 * Generates optimized image URLs and srcset attributes for different screen sizes
 */

// Breakpoints for property images (in pixels)
export const IMAGE_SIZES = {
  thumbnail: 400,   // Mobile cards
  medium: 600,      // Tablet cards  
  large: 800,       // Desktop cards
  full: 1200        // Lightbox/detail views
} as const;

/**
 * Generate an optimized image URL with width and quality parameters
 * Supports Supabase Storage and Unsplash image transformations
 */
export function getOptimizedImageUrl(
  url: string, 
  width: number, 
  quality: number = 80
): string {
  if (!url) return url;
  
  // Check if it's a Supabase storage URL
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Convert to render/image endpoint with transforms
    return url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    ) + `?width=${width}&quality=${quality}`;
  }
  
  // Handle Unsplash URLs (already support width params)
  if (url.includes('unsplash.com')) {
    // Remove existing width/quality params if present
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&q=${quality}&auto=format`;
  }
  
  // Return original for unknown sources (external URLs, etc.)
  return url;
}

/**
 * Generate a srcset string for responsive images
 * Creates multiple image sizes for browser to choose from
 */
export function generateSrcSet(
  url: string, 
  sizes: number[] = [IMAGE_SIZES.thumbnail, IMAGE_SIZES.medium, IMAGE_SIZES.large, IMAGE_SIZES.full],
  quality: number = 80
): string {
  if (!url) return '';
  
  return sizes
    .map(size => `${getOptimizedImageUrl(url, size, quality)} ${size}w`)
    .join(', ');
}

/**
 * Default sizes attribute for property cards in a responsive grid
 * Matches typical property listing layouts
 */
export const PROPERTY_CARD_SIZES = 
  '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw';

/**
 * Sizes attribute for full-width images (hero, detail view)
 */
export const FULL_WIDTH_SIZES = '100vw';

/**
 * Sizes attribute for gallery thumbnails
 */
export const THUMBNAIL_SIZES = '(max-width: 640px) 25vw, 100px';
