import Link from 'next/link'
import { business, fullAddress, hours, formatTime, mapsUrl, nav } from '@/lib/site'
import { MotionSwitch } from './MotionSwitch'

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-nap">
          <p className="foot-name">{business.name}</p>
          <p className="soft">{business.tagline}</p>
          <address>
            <a href={mapsUrl} target="_blank" rel="noopener" data-track="directions">
              {fullAddress}
            </a>
            <br />
            Inside The Vivian, {business.neighbourhood}
            <br />
            <a href={`tel:${business.phone.e164}`} data-track="call">
              {business.phone.display}
            </a>
            {' · '}
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </address>
        </div>
        <div>
          <p className="foot-h">Hours</p>
          <dl className="foot-hours">
            {hours.map((h) => (
              <div key={h.label}>
                <dt>{h.label}</dt>
                <dd>
                  {formatTime(h.opens)} to {formatTime(h.closes)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <nav aria-label="Footer">
          <p className="foot-h">Pages</p>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href={business.orderUrl} target="_blank" rel="noopener" data-track="order">
                Order ahead
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="foot-h">Follow</p>
          <ul>
            <li>
              <a href={business.sameAs[0]} target="_blank" rel="noopener me">
                Facebook
              </a>
            </li>
            <li>
              <a href={business.sameAs[1]} target="_blank" rel="noopener me">
                X (Twitter)
              </a>
            </li>
          </ul>
          <div className="foot-controls">
            <MotionSwitch />
          </div>
        </div>
      </div>
      <p className="foot-legal soft small">
        © {business.name}. Black-owned, on the Atlanta BeltLine.
      </p>
    </footer>
  )
}
