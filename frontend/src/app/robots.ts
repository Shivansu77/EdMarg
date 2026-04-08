import { MetadataRoute } from 'next';
const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://edmarg.com';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/student/', '/admin/', '/mentor/'],
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
