/**
 * Unified Analytics System for OrbiTrip
 * Integrates GA4, Google Ads, Yandex Metrica, Microsoft Clarity, and GTM
 */

type EventName = 
  | 'search' 
  | 'results_viewed'
  | 'driver_selected' 
  | 'booking_initiated' 
  | 'booking_step_personal'
  | 'booking_completed' 
  | 'booking_error'
  | 'contact_click' 
  | 'page_view'
  | 'gads_arrival';

interface AnalyticsUser {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export const analytics = {
  /**
   * Identifies user across all platforms
   */
  identify: (user: AnalyticsUser) => {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');
    const utm_term = params.get('utm_term');
    const utm_source = params.get('utm_source');

    const userId = user.id || user.phone || gclid || 'anonymous';
    
    // 1. GTM DataLayer
    (window as any).dataLayer?.push({
      event: 'user_identified',
      user_id: userId,
      user_name: user.name,
      user_phone: user.phone,
      gclid: gclid,
      utm_term: utm_term,
      utm_source: utm_source
    });


    // 3. Yandex Metrica
    if ((window as any).ym) {
      (window as any).ym(108558502, 'userParams', {
        UserID: userId,
        UserName: user.name,
        UserPhone: user.phone
      });
    }

    // 4. GA4
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        user_id: userId,
        user_name: user.name
      });
    }
    
    console.log(`[Analytics] Identified user: ${userId}`);
  },

  /**
   * Tracks custom events
   */
  trackEvent: (name: EventName, params: any = {}) => {
    // 1. GTM DataLayer
    (window as any).dataLayer?.push({
      event: name,
      ...params
    });

    // 2. Yandex Metrica
    if ((window as any).ym) {
      (window as any).ym(108558502, 'reachGoal', name, params);
    }


    // 4. GA4 / Google Ads
    if ((window as any).gtag) {
      (window as any).gtag('event', name, params);
    }

    // 5. INTERNAL POSTGRES ANALYTICS (V24.7 — RESTORED)
    fetch('/api/analytics', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         event_name: name, 
         details: params,
         created_at: Date.now()
       })
    }).catch(err => console.error("[Analytics] Internal log failure:", err));

    console.log(`[Analytics] Event Tracked: ${name}`, params);
  },

  /**
   * Specifically for Search tracking with Keywords
   */
  trackSearch: (from: string, to: string, distance: number) => {
    const params = new URLSearchParams(window.location.search);
    analytics.trackEvent('search', {
      search_term: `${from} to ${to}`,
      route_from: from,
      route_to: to,
      distance_km: distance,
      gclid: params.get('gclid'),
      keyword: params.get('utm_term') || params.get('q') // Capture keyword if present
    });
  }
};
