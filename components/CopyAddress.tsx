'use client'

import { useState } from 'react'

export function CopyAddress({ address }: { address: string }) {
  const [label, setLabel] = useState('Copy address')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setLabel('Address copied')
    } catch {
      setLabel('Copy not available')
    }
    setTimeout(() => setLabel('Copy address'), 2000)
  }
  return (
    <button className="btn" type="button" onClick={copy} aria-live="polite">
      {label}
    </button>
  )
}
