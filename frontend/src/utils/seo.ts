/**
 * SEO Utility Functions
 * Handles meta tags, Open Graph, Twitter cards, and structured data
 */

interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'article' | 'website';
  author?: string;
  publishedDate?: string;
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string): void {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update or create an Open Graph meta tag
 */
function updateOGTag(property: string, content: string): void {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update or create a Twitter Card meta tag
 */
function updateTwitterTag(name: string, content: string): void {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update or create a canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Inject JSON-LD structured data
 */
function injectJSONLD(structuredData: Record<string, unknown>): void {
  // Remove existing JSON-LD for this type if present
  const existingScript = document.querySelector(`script[type="application/ld+json"]`);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

/**
 * Update all SEO metadata for a page
 * Handles meta tags, OG tags, Twitter cards, canonical URL, and structured data
 */
export function updateSEOMetadata(metadata: SEOMetadata): void {
  // Update basic meta tags
  document.title = metadata.title;
  updateMetaTag('description', metadata.description);
  updateMetaTag('robots', 'index, follow');

  // Update Open Graph tags
  updateOGTag('og:title', metadata.title);
  updateOGTag('og:description', metadata.description);
  updateOGTag('og:url', metadata.url);
  updateOGTag('og:type', metadata.type || 'website');
  
  // Add siteName if available
  updateOGTag('og:site_name', 'EdMarg');

  if (metadata.image) {
    updateOGTag('og:image', metadata.image);
    updateOGTag('og:image:alt', metadata.title);
  }

  // Update Twitter Card tags
  updateTwitterTag('twitter:card', 'summary_large_image');
  updateTwitterTag('twitter:title', metadata.title);
  updateTwitterTag('twitter:description', metadata.description);
  if (metadata.image) {
    updateTwitterTag('twitter:image', metadata.image);
  }

  // Update canonical URL
  updateCanonicalLink(metadata.url);
}

/**
 * Update SEO for 404 page
 */
export function updateSEO404(): void {
  document.title = 'Page Not Found | EdMarg';
  updateMetaTag('description', 'The page you are looking for does not exist.');
  updateMetaTag('robots', 'noindex, follow');
}

/**
 * Inject Article structured data (JSON-LD)
 */
export function injectArticleStructuredData(data: {
  title: string;
  description: string;
  image?: string;
  author: string;
  publishDate: string;
  url: string;
}): void {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    datePublished: data.publishDate,
    url: data.url,
  };

  injectJSONLD(structuredData);
}

/**
 * Inject Organization structured data (for homepage)
 */
export function injectOrganizationStructuredData(): void {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EdMarg',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    description: 'Education mentorship and career guidance platform',
  };

  injectJSONLD(structuredData);
}
