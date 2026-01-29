import { eventConfig } from '@/lib/config';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `Australian AI Safety Forum ${eventConfig.year}`,
    short_name: 'AI Safety Forum',
    description: 'Rigorous dialogue on the future of AI safety in Australia.',
    start_url: '/',
    display: 'browser',
    background_color: '#f9fafb',
    theme_color: '#0a1f5c',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
