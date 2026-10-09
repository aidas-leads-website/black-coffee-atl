import { business, fullAddress, mapsUrl } from '@/lib/site'

/**
 * F6: the location as a static image linking to Google Maps by Place ID. No embedded map loads.
 * With a Static Maps key set, a real map image is used; otherwise a drawn card stands in.
 */
export function MapCard() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY
  const { lat, lng } = business.geo
  const src = key
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=640x480&scale=2&markers=color:0x1A0F0A%7C${lat},${lng}&style=feature:poi%7Cvisibility:off&key=${key}`
    : null

  return (
    <a className="map" href={mapsUrl} target="_blank" rel="noopener" data-track="directions">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={640} height={480} loading="lazy" decoding="async" alt={`Map showing ${business.name} at ${fullAddress}`} />
      ) : (
        <svg viewBox="0 0 400 300" role="img" aria-label={`${business.name} location card, ${fullAddress}`}>
          <rect width="400" height="300" fill="#1A0F0A" />
          <g stroke="#3a2a20" strokeWidth="10" fill="none" strokeLinecap="round">
            <path d="M-20 210 C 80 190, 160 230, 260 200 S 380 150, 430 160" />
            <path d="M120 -20 L 150 320" />
            <path d="M-20 90 L 430 120" />
          </g>
          <path d="M-20 210 C 80 190, 160 230, 260 200 S 380 150, 430 160" stroke="#7A9B3B" strokeWidth="3" strokeDasharray="2 8" fill="none" strokeLinecap="round" />
          <g transform="translate(200 128)">
            <circle r="30" fill="#0a0a0a" stroke="#B98A4E" strokeWidth="2" />
            <circle r="22" fill="none" stroke="#262626" />
            <circle r="16" fill="none" stroke="#262626" />
            <circle r="9" fill="#B98A4E" />
            <circle r="2" fill="#1A0F0A" />
          </g>
        </svg>
      )}
      <span className="map-label">
        <span>
          <b>{business.name}</b>
          {fullAddress}
        </span>
        <span aria-hidden="true">Open in Maps →</span>
      </span>
    </a>
  )
}
