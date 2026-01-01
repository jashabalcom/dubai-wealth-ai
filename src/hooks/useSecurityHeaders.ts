import { useEffect } from 'react';

/**
 * Security headers and CSP configuration
 * This hook adds client-side security measures and monitors for violations
 */
export function useSecurityHeaders() {
  useEffect(() => {
    // Prevent clickjacking - ensure we're not in an iframe (unless allowed)
    if (window.self !== window.top) {
      const allowedParents = ['lovable.app', 'dubai-rei.lovable.app'];
      try {
        const parentHost = window.parent.location.hostname;
        if (!allowedParents.some(domain => parentHost.endsWith(domain))) {
          console.warn('[SECURITY] Potential clickjacking detected');
        }
      } catch {
        // Cross-origin parent - can't access location
        console.warn('[SECURITY] Cross-origin iframe detected');
      }
    }

    // CSP violation reporting
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      console.error('[CSP Violation]', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
      });
      
      // In production, you could send this to your logging service
      if (import.meta.env.PROD) {
        // Could integrate with Sentry or custom logging endpoint
      }
    };

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', handleSecurityViolation);

    // Disable right-click on sensitive elements
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-sensitive]')) {
        e.preventDefault();
      }
    };

    // Prevent drag on sensitive elements (data exfiltration protection)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-sensitive]')) {
        e.preventDefault();
      }
    };

    // Block potentially dangerous protocols in links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
        if (dangerousProtocols.some(proto => href.toLowerCase().startsWith(proto))) {
          e.preventDefault();
          console.warn('[SECURITY] Blocked dangerous protocol:', href);
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('click', handleClick, true);

    // Dev tools detection (production only)
    let devToolsInterval: number | undefined;
    if (import.meta.env.PROD) {
      const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          // Dev tools likely open - could log this event
        }
      };
      devToolsInterval = window.setInterval(detectDevTools, 1000);
    }

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityViolation);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('click', handleClick, true);
      if (devToolsInterval) {
        clearInterval(devToolsInterval);
      }
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

// Sanitize URL to prevent XSS via javascript: protocol
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
  
  if (dangerousProtocols.some(proto => trimmed.startsWith(proto))) {
    return '#';
  }
  
  return url;
}

// Check if URL is from trusted domain
export function isTrustedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const trustedDomains = [
      'dubai-rei.lovable.app',
      'lovable.app',
      'supabase.co',
      'stripe.com',
      'mapbox.com',
      'google-analytics.com',
      'googletagmanager.com',
      'sentry.io',
    ];
    
    return trustedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
