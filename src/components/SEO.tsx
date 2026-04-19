import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  schema?: object; // New: JSON-LD Support
  lang?: string;   // Added: Language support for <html> tag
}

/**
 * OrbiTrip SEO Engine (v3.1)
 * 
 * Localized, high-performance metadata and structured data management.
 * Handles Titles, OpenGraph, Twitter Cards, and Google-friendly Schema.
 * Now supports dynamic lang attribute and hreflang signals.
 */
const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://orbitrip.ge/logo.webp', 
  url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://orbitrip.ge', 
  type = 'website',
  keywords,
  schema,
  lang = 'en'
}) => {
  useEffect(() => {
    // 0. Update HTML Lang attribute (Critical for accessibility and SEO)
    document.documentElement.lang = lang;

    // 1. Update Title
    document.title = title.includes('OrbiTrip') ? title : `${title} | OrbiTrip Georgia`;

    // 2. Set Meta Tags
    const setMeta = (attr: string, name: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    
    // OG Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'OrbiTrip Georgia');
    setMeta('property', 'og:locale', lang === 'ru' ? 'ru_RU' : 'en_US');

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);

    // 3. Canonical & Hreflang (Alternate versions)
    const canonicalUrl = url.replace('www.', '');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Add hreflang for both languages to signal alternate versions
    const setHreflang = (hl: string, href: string) => {
        let link = document.querySelector(`link[hreflang="${hl}"]`);
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', hl);
            document.head.appendChild(link);
        }
        link.setAttribute('href', href);
    };

    // Even if URLs are the same, signaling alternates is a good "Best Practice" 
    // for when the user eventually moves to /en and /ru subdirectories.
    setHreflang('en', canonicalUrl);
    setHreflang('ru', canonicalUrl);
    setHreflang('x-default', canonicalUrl);

    // 4. Inject JSON-LD Schema (Google Structured Data)
    if (schema) {
        let script = document.querySelector('#json-ld-schema');
        if (!script) {
            script = document.createElement('script');
            script.setAttribute('id', 'json-ld-schema');
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(schema);
    }

  }, [title, description, image, url, type, keywords, schema, lang]);

  return null;
};

export default SEO;
