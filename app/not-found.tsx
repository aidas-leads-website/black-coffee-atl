import Link from 'next/link'
import type { Metadata } from 'next'
import { business, directionsUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: { absolute: 'Page not found | Black Coffee ATL' },
  description: 'This page has moved or no longer exists. Find the Black Coffee ATL menu, hours and directions here.',
  robots: { index: false, follow: true },
}

/** F14: a 404 that offers the menu and directions. */
export default function NotFound() {
  return (
    <main className="page" id="main">
      <header className="page-head">
        <p className="when">Error 404</p>
        <h1>The needle skipped.</h1>
        <p className="lede">
          This page has moved or no longer exists. Most people are looking for the menu, the hours or how to get to {business.name}.
        </p>
        <div className="btns">
          <Link className="btn primary" href="/menu">
            See the menu
          </Link>
          <a className="btn" href={directionsUrl} target="_blank" rel="noopener" data-track="directions">
            Get directions
          </a>
          <Link className="btn" href="/visit">
            Hours and parking
          </Link>
          <Link className="btn" href="/">
            Home
          </Link>
        </div>
      </header>
    </main>
  )
}
