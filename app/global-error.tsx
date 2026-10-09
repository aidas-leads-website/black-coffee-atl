'use client'

import { business, fullAddress } from '@/lib/site'

/** Last-resort error page, used if the root layout itself fails. Self-contained: no site CSS is available here. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-US">
      <body style={{ margin: 0, background: '#1A0F0A', color: '#F2F3F0', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '20vh 24px' }}>
          <h1 style={{ fontSize: 40, margin: '0 0 16px' }}>The record skipped.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5 }}>
            {business.name} is at {fullAddress}. Call{' '}
            <a href={`tel:${business.phone.e164}`} style={{ color: 'inherit' }}>
              {business.phone.display}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, minHeight: 48, padding: '0 24px', borderRadius: 999, border: 0, fontWeight: 700, cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
