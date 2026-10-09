import type { Metadata } from 'next'
import { business } from './site'
import { url } from './schema'

const shareImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Black Coffee ATL: Come for the coffee. Stay for the culture. Inside The Vivian on the Atlanta BeltLine.',
}

/** S3: every page gets a unique title under 60 characters and a description under 155, plus a canonical URL. */
export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url(opts.path) },
    openGraph: {
      type: 'website',
      url: url(opts.path),
      siteName: business.name,
      title: opts.title,
      description: opts.description,
      locale: 'en_US',
      images: [shareImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: business.twitter,
      title: opts.title,
      description: opts.description,
      images: [shareImage.url],
    },
  }
}
