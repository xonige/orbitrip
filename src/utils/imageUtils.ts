/**
 * V24.8.1 - Senior Image Optimization Update
 * Utility to convert local image paths to WebP optimized versions,
 * AND proxy heavy external driver/car photos through a free CDN (wsrv.nl)
 * to prevent live server overload and fix 3G mobile bounce rate.
 */
export const getOptimizedImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Clean potential ?v=Date.now() cache busters added by old DB logic
  const cleanUrl = url.split('?')[0];

  // If it's a data URI or blob, leave it be
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // If it's an external URL (supabase, firebase, myauto)
  if (cleanUrl.startsWith('http')) {
    // If it's already going through wsrv.nl or similar optimized proxy, return it
    if (cleanUrl.includes('wsrv.nl') || cleanUrl.includes('cloudinary')) return url;
    
    // Proxy through Cloudflare/wsrv.nl: w=600 for mobile friendly, WebP out, 80% qual.
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=800&output=webp&q=80&we`;
  }

  // Local images: Only convert to .webp for known pre-optimized directories (/cars/)
  // Driver-uploaded photos in /drivers/ exist only as .jpg originals
  if (cleanUrl.startsWith('/drivers/')) {
    return cleanUrl; // Serve original format, server has .jpg only
  }
  return cleanUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp');
};
