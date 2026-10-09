import type { MetadataRoute } from 'next'
import { SITE_URL, INDEXABLE } from '@/lib/site'

// G1: search engines and AI assistants are explicitly welcome. Named so a future
// blanket rule from a host or CDN is easy to spot against this list.
const AI_AND_SEARCH_BOTS = [
  'Googlebot',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'DuckDuckBot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'Amazonbot',
  'MistralAI-User',
]

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [
      { userAgent: AI_AND_SEARCH_BOTS, allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
