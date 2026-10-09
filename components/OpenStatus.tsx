'use client'

import { useEffect, useState } from 'react'
import { statusAt, staticStatus, type OpenStatus as Status } from '@/lib/hours'

/** F1: live open or closed status. The server renders a line that is always true; the browser refines it. */
export function OpenStatus() {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    const tick = () => {
      try {
        setStatus(statusAt(new Date()))
      } catch {
        /* keep the static line */
      }
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className={`status${status?.open ? ' open' : ''}`} aria-live="polite">
      <span className="dot" aria-hidden="true" />
      <span>{status ? status.text : staticStatus}</span>
    </p>
  )
}
