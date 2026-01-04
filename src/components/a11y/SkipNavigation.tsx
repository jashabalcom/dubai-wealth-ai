import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gold focus:text-primary-dark focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-background"
    >
      Skip to main content
    </a>
  );
}

export function RouteAnnouncer() {
  const location = useLocation();

  useEffect(() => {
    // Announce page changes to screen readers
    const pageTitle = document.title;
    const announcement = document.getElementById('route-announcer');
    if (announcement) {
      announcement.textContent = `Navigated to ${pageTitle}`;
    }

    // Focus management - scroll to top on navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      id="route-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}

export function LiveRegion({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
