import { business, directionsUrl } from '@/lib/site'

/** F2: fixed Order, Directions, Call bar on phones. */
export function ActionBar() {
  return (
    <div className="actions" role="navigation" aria-label="Quick actions">
      <a className="btn primary" href={business.orderUrl} target="_blank" rel="noopener" data-track="order" data-order="">
        Order
      </a>
      <a className="btn" href={directionsUrl} target="_blank" rel="noopener" data-track="directions">
        Directions
      </a>
      <a className="btn" href={`tel:${business.phone.e164}`} data-track="call">
        Call
      </a>
    </div>
  )
}
