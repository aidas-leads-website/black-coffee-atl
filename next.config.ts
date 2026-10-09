import type { NextConfig } from 'next'

// Canonical host. Every other host and every legacy path 301s here (S1, F9).
// statusCode 301 rather than `permanent` (308), as the spec and older crawlers expect 301.
const CANONICAL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blackcoffeeatl.com').replace(/\/$/, '')

// Old URLs from the previous site, mapped to their closest new page.
const legacy: Array<[string, string]> = [
  ['/home', '/'],
  ['/home-1', '/'],
  ['/index', '/'],
  ['/latenightmenu', '/menu'],
  ['/late-night-menu', '/menu'],
  ['/menu-1', '/menu'],
  ['/our-menu', '/menu'],
  ['/about', '/story'],
  ['/about-us', '/story'],
  ['/our-story', '/story'],
  ['/contact', '/visit'],
  ['/contact-us', '/visit'],
  ['/location', '/visit'],
  ['/hours', '/visit'],
  ['/events', '/private-hire'],
  ['/event-space', '/private-hire'],
  ['/book', '/private-hire'],
  ['/rentals', '/private-hire'],
  ['/faqs', '/faq'],
]

const canonicalHost = new URL(CANONICAL).host
const isProdBuild = process.env.NODE_ENV === 'production'
const isPreview = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production'

// Warn, never fail: a build without these still works, but the production site would be missing a feature.
if (isProdBuild && !isPreview) {
  const missing = ['RESEND_API_KEY', 'INQUIRY_FROM'].filter((k) => !process.env[k])
  if (missing.length) {
    console.warn(`\n⚠  Missing ${missing.join(', ')}: private-hire inquiries will not be emailed. See docs/LAUNCH.md.\n`)
  }
}

// Content Security Policy. Next.js streams page data in inline scripts, so 'unsafe-inline' is needed for scripts
// without per-request nonces (which would make every page dynamic). Origins are still locked down.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://maps.googleapis.com https://maps.gstatic.com",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      // Second domain, with or without www, goes to the canonical host, path kept.
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?:www\\.)?blackcoffeeatlanta\\.com' }],
        destination: `${CANONICAL}/:path*`,
        statusCode: 301 as const,
      },
      // Bare apex goes to www (only when www is the canonical host, so this can never loop).
      ...(canonicalHost === 'www.blackcoffeeatl.com'
        ? [
            {
              source: '/:path*',
              has: [{ type: 'host' as const, value: 'blackcoffeeatl\\.com' }],
              destination: `${CANONICAL}/:path*`,
              statusCode: 301 as const,
            },
          ]
        : []),
      ...legacy.map(([source, destination]) => ({ source, destination, statusCode: 301 as const })),
      { source: '/order', destination: 'https://blackcoffeeatl.square.site/', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          ...(isProdBuild
            ? [
                { key: 'Content-Security-Policy', value: csp },
                { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
              ]
            : []),
          // Preview deployments stay out of search even if a link to one leaks.
          ...(isPreview ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
        ],
      },

      {
        source: '/llms.txt',
        headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }],
      },
    ]
  },
}

export default nextConfig
