import Link from 'next/link'
import { nav, business } from '@/lib/site'
import { OpenStatus } from './OpenStatus'

/** The small flat record in the header. Its needle tracks scroll position; on every page it links home. */
function RecordMark() {
  return (
    <svg viewBox="0 0 30 30" aria-hidden="true" focusable="false" className="mark">
      <circle cx="14" cy="16" r="12" fill="currentColor" />
      <circle cx="14" cy="16" r="4.2" fill="#B98A4E" />
      <circle cx="14" cy="16" r="1" fill="#1A0F0A" />
      <g id="miniNeedle" transform="rotate(-24 27 3)">
        <line x1="27" y1="3" x2="19" y2="13" stroke="#B98A4E" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <circle cx="27" cy="3" r="2" fill="#B98A4E" />
    </svg>
  )
}

export function Header() {
  return (
    <header className="top">
      <Link className="brand" href="/" aria-label={`${business.name}, home`}>
        <RecordMark />
        <span>{business.name}</span>
      </Link>
      <OpenStatus />
      <nav aria-label="Main" className="mainnav">
        <ul>
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href}>{n.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <details className="mnav">
        <summary>Pages</summary>
        <nav aria-label="Main">
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </header>
  )
}
