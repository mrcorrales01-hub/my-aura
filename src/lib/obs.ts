export function initObs() {
  try {
    if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') return;
    
    // PostHog EU (safe import)
    if (typeof window !== 'undefined') {
      (window as any).phCapture = (event: string, properties?: any) => {
        // Will be replaced when PostHog loads
      };
    }
    
    // Sentry (safe import)
    
  } catch {}
}

// Track events safely
export function trackEvent(event: string, properties?: any) {
  try {
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
      (window as any).phCapture?.(event, properties);
    }
  } catch {}
}