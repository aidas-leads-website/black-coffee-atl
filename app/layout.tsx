import type { Metadata, Viewport } from 'next'
import { Archivo, Bodoni_Moda } from 'next/font/google'
import Script from 'next/script'
import { SITE_URL, INDEXABLE, business } from '@/lib/site'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ActionBar } from '@/components/ActionBar'
import { SiteEffects } from '@/components/SiteEffects'
import './globals.css'

// Self-hosted, subsetted WOFF2 via next/font. Archivo carries the width axis the headlines animate.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
})
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  style: ['italic'],
  axes: ['opsz'],
  display: 'swap',
  // Drink names only, never the largest paint: don't let it compete with Archivo for bandwidth.
  preload: false,
  variable: '--font-bodoni',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: business.name,
  authors: [{ name: business.name, url: SITE_URL }],
  creator: business.name,
  publisher: business.name,
  formatDetection: { telephone: false, address: false, email: false },
  robots: INDEXABLE
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
      }
    : { index: false, follow: false },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  other: {
    'geo.region': 'US-GA',
    'geo.placename': 'Atlanta',
    'geo.position': `${business.geo.lat};${business.geo.lng}`,
    ICBM: `${business.geo.lat}, ${business.geo.lng}`,
  },
}

// S8: no maximum-scale, so pinch-zoom always works.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1A0F0A' },
    { media: '(prefers-color-scheme: light)', color: '#1A0F0A' },
  ],
}

// Runs before first paint: marks scripts as on and picks the motion level (M2, M3),
// so a reduced-motion visitor never sees a frame of animation.
const motionScript = `(function(){var d=document.documentElement;d.classList.add('js');var p=null;try{p=localStorage.getItem('bca-motion')}catch(e){}var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var c=navigator.connection;var sd=!!(c&&c.saveData);var lm=navigator.deviceMemory&&navigator.deviceMemory<2;if(p?p==='off':(rm||sd||lm))d.classList.add('still')})()`

const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${archivo.variable} ${bodoni.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <ActionBar />
        <SiteEffects />
        {plausible ? (
          <Script defer data-domain={plausible} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
        ) : null}
      </body>
    </html>
  )
}
