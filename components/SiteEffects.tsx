'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track as vercelTrack } from '@vercel/analytics'

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * F10: one place that reports order, call, directions and form events. They go to Vercel Web Analytics,
 * and also to Plausible, gtag or dataLayer if any of those is loaded.
 */
export function track(event: string, props: Record<string, string> = {}) {
  try {
    vercelTrack(event, props)
    window.plausible?.(event, { props })
    window.gtag?.('event', event, props)
    window.dataLayer?.push({ event, ...props })
    window.dispatchEvent(new CustomEvent('bca:track', { detail: { event, ...props } }))
  } catch {
    /* analytics must never break the page */
  }
}

/** Site-wide behaviour with no UI of its own: click tracking, header record needle, closing the phone menu. */
export function SiteEffects() {
  const pathname = usePathname()

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (el?.dataset.track) track(el.dataset.track, { page: location.pathname, label: el.textContent?.trim().slice(0, 60) || '' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // The needle on the header record shows how far down the page you are.
  useEffect(() => {
    const needle = document.getElementById('miniNeedle')
    if (!needle) return
    let raf = 0
    const set = () => {
      raf = 0
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      const p = Math.min(1, Math.max(0, scrollY / max))
      needle.setAttribute('transform', `rotate(${(-24 + 34 * p).toFixed(2)} 27 3)`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(set)
    }
    set()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [pathname])

  useEffect(() => {
    document.querySelectorAll('details.mnav[open]').forEach((d) => d.removeAttribute('open'))
  }, [pathname])

  return null
}
