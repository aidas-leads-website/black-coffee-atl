import type { MetadataRoute } from 'next'
import { FACTS_REVIEWED } from '@/lib/site'
import { menu } from '@/lib/menu'
import { url } from '@/lib/schema'

export default function sitemap(): MetadataRoute.Sitemap {
  const facts = new Date(FACTS_REVIEWED)
  return [
    { url: url('/'), lastModified: facts, changeFrequency: 'weekly', priority: 1 },
    { url: url('/menu'), lastModified: new Date(menu.updated), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/visit'), lastModified: facts, changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/private-hire'), lastModified: facts, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/faq'), lastModified: facts, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/story'), lastModified: facts, changeFrequency: 'yearly', priority: 0.6 },
  ]
}
