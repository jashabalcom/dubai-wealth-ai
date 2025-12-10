import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_MEASUREMENT_ID, pageview } from '@/lib/analytics';

export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Load GA4 script only if we have a measurement ID
    if (!GA_MEASUREMENT_ID) return;

    // Check if script already exists
    if (document.getElementById('ga-script')) return;

    // Add gtag script
    const script1 = document.createElement('script');
    script1.id = 'ga-script';
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      pageview(location.pathname + location.search);
    }
  }, [location]);

  return null;
}
