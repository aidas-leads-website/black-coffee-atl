'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { business, fullAddress, hoursText } from '@/lib/site'

/** Shown if a page fails while rendering. Offers the facts people came for. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="page" id="main">
      <header className="page-head">
        <p className="when">Something went wrong</p>
        <h1>The record skipped.</h1>
        <p className="lede">
          This page did not load properly. {business.name} is at {fullAddress}. {hoursText}.
        </p>
        <div className="btns">
          <button className="btn primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn" href="/menu">
            See the menu
          </Link>
          <Link className="btn" href="/visit">
            Hours and directions
          </Link>
        </div>
      </header>
    </main>
  )
}
