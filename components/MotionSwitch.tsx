'use client'

import { useEffect, useState } from 'react'

/** The footer "Motion: on / off" switch. The choice is remembered and applied before paint by the head script. */
export function MotionSwitch() {
  const [still, setStill] = useState<boolean | null>(null)

  useEffect(() => {
    setStill(document.documentElement.classList.contains('still'))
    const sync = () => setStill(document.documentElement.classList.contains('still'))
    window.addEventListener('bca:motion', sync)
    return () => window.removeEventListener('bca:motion', sync)
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('still')
    document.documentElement.classList.toggle('still', next)
    try {
      localStorage.setItem('bca-motion', next ? 'off' : 'on')
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    window.dispatchEvent(new Event('bca:motion'))
  }

  return (
    <button className="btn small-btn" type="button" onClick={toggle} aria-pressed={still === null ? undefined : !still}>
      {still === null ? 'Motion' : still ? 'Motion: off' : 'Motion: on'}
    </button>
  )
}
