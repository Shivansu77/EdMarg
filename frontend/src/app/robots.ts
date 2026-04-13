import { MetadataRoute } from 'next';
import { SITE_URL } from '@/utils/site-url';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/student/', '/admin/', '/mentor/', '/assessment'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
