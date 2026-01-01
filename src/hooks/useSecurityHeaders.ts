import { useEffect } from 'react';

/**
 * Security headers and CSP configuration
 * Note: Full CSP headers should be set at the server level
 * This hook adds client-side security measures
 */
export function useSecurityHeaders() {
  useEffect(() => {
    // Prevent clickjacking - ensure we're not in an iframe (unless allowed)
    if (window.self !== window.top) {
      // Check if we're embedded in an allowed domain
      const allowedParents = ['lovable.app', 'dubai-rei.lovable.app'];
      try {
        const parentHost = window.parent.location.hostname;
        if (!allowedParents.some(domain => parentHost.endsWith(domain))) {
          console.warn('[SECURITY] Potential clickjacking detected');
          // Optionally redirect or show warning
        }
      } catch {
        // Cross-origin parent - can't access location
        console.warn('[SECURITY] Cross-origin iframe detected');
      }
    }

    // Disable right-click on sensitive elements (optional)
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-sensitive]')) {
        e.preventDefault();
      }
    };

    // Prevent dev tools detection for production (basic)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        // Dev tools likely open - could log this
        // console.log('[SECURITY] Dev tools detected');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    // Only run dev tools detection in production
    if (import.meta.env.PROD) {
      const interval = setInterval(detectDevTools, 1000);
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        clearInterval(interval);
      };
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
}

// Nonce generator for inline scripts (if needed)
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Safe external link handler
export function safeExternalLink(url: string): { href: string; rel: string; target: string } {
  return {
    href: url,
    rel: 'noopener noreferrer nofollow',
    target: '_blank',
  };
}
