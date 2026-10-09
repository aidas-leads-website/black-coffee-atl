import type { MetadataRoute } from 'next'
import { business } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.name,
    short_name: business.name,
    description: business.identity,
    start_url: '/',
    display: 'browser',
    background_color: '#1A0F0A',
    theme_color: '#1A0F0A',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  }
}
