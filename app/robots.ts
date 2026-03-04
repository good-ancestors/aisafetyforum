import { isProductionDomain, siteConfig } from '@/lib/config';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Only allow indexing on the canonical production domain.
  // Vercel preview/branch deploys get noindex to avoid duplicate content.
  if (!isProductionDomain) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/register/success', '/register/invoice-sent'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
