// The single source of truth for every business fact on the site.
// Pages, structured data, robots, sitemap and llms.txt all read from here,
// so a fact changed once changes everywhere (Requirements: "One source of truth").

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blackcoffeeatl.com').replace(/\/$/, '')

/**
 * Only the production deployment may be indexed. Vercel preview deployments (and any host that sets
 * NEXT_PUBLIC_NOINDEX=1, such as a staging server) are kept out of search so they never compete with the real site.
 */
export const INDEXABLE =
  process.env.NEXT_PUBLIC_NOINDEX !== '1' && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')

/** Date the business facts were last confirmed. Used for sitemap lastModified and schema dateModified only. */
export const FACTS_REVIEWED = '2026-10-07'

export const business = {
  name: 'Black Coffee ATL',
  locationName: 'Black Coffee ATL - Westside',
  tagline: 'Come for the coffee. Stay for the culture.',
  // G2: this exact wording appears on Home, on Story and in the schema description.
  identity:
    "Black Coffee ATL is a Black-owned specialty coffee shop and event space inside The Vivian at 1246 Allene Ave SW, on the Atlanta BeltLine's Westside extension in Capitol View. Founded by Carl Northrop, it opened in Castleberry Hill in 2021 and moved to the BeltLine in 2023.",
  founder: 'Carl Northrop',
  curator: 'Brit Sade',
  neighbourhood: 'Capitol View',
  area: "the Atlanta BeltLine's Westside extension",
  building: 'The Vivian',
  address: {
    street: '1246 Allene Ave SW',
    locality: 'Atlanta',
    region: 'GA',
    postalCode: '30310',
    country: 'US',
  },
  geo: { lat: 33.7209, lng: -84.4108 },
  phone: { display: '(404) 343-1565', e164: '+14043431565', schema: '+1-404-343-1565' },
  email: 'westside@blackcoffeeatl.com',
  priceRange: '$$',
  placeId: 'ChIJGQ_foHsD9YgRkojsy7Y2ANs',
  orderUrl: 'https://blackcoffeeatl.square.site/',
  roasters: ['Devoción', 'Onyx', 'Counter Culture'],
  brewMethods: ['espresso', 'batch brew', 'pour-over'],
  sameAs: ['https://www.facebook.com/BlackCoffeeAtlanta/', 'https://x.com/BlackCoffeeATL'],
  twitter: '@BlackCoffeeATL',
  // Set to true once the client confirms there is no link to The Black Coffee Company.
  confirmedNoLinkToBlackCoffeeCompany: false,
} as const

export const fullAddress = `${business.address.street}, ${business.address.locality}, ${business.address.region} ${business.address.postalCode}`

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  business.locationName,
)}&query_place_id=${business.placeId}`

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  business.locationName,
)}&destination_place_id=${business.placeId}`

export const transitUrl = `${directionsUrl}&travelmode=transit`

/** Opening hours in Atlanta time, 24-hour HH:MM. Days use schema.org names. */
export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export const hours: Array<{ label: string; days: DayName[]; opens: string; closes: string }> = [
  { label: 'Monday to Friday', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '20:00' },
  { label: 'Saturday and Sunday', days: ['Saturday', 'Sunday'], opens: '08:00', closes: '18:00' },
]

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 || 12
  return m ? `${h12}:${String(m).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`
}

/** "Monday to Friday from 8 AM to 8 PM, and Saturday and Sunday from 8 AM to 6 PM", for use inside sentences. */
export const hoursSentence = hours
  .map((h) => `${h.label} from ${formatTime(h.opens)} to ${formatTime(h.closes)}`)
  .join(', and ')

export const hoursText = hours.map((h) => `${h.label}, ${formatTime(h.opens)} to ${formatTime(h.closes)}`).join('. ')

/** The at-a-glance facts block (A1), shared by Home and Visit. */
export const atAGlance: Array<{ term: string; detail: string; href?: string }> = [
  ...hours.map((h) => ({ term: h.label, detail: `${formatTime(h.opens)} to ${formatTime(h.closes)}` })),
  { term: 'Address', detail: `${fullAddress}, inside The Vivian`, href: mapsUrl },
  { term: 'Phone', detail: business.phone.display, href: `tel:${business.phone.e164}` },
  { term: 'Parking', detail: 'Two hours free at The Vivian, with validation' },
  { term: 'WiFi', detail: 'Free' },
  { term: 'Dogs', detail: 'Welcome' },
  { term: 'Laptops', detail: 'Welcome' },
  { term: 'Payment', detail: 'Cards accepted' },
  { term: 'Order ahead', detail: 'blackcoffeeatl.square.site', href: business.orderUrl },
]

export const amenities = [
  'Free WiFi',
  'Validated two-hour parking',
  'Dog-friendly',
  'Outdoor patio',
  'Event space',
  'Laptop-friendly',
]

/** Private hire details. null means "not yet confirmed by the shop": the page asks visitors to inquire. */
export const privateHire = {
  uses: ['Pop-ups', 'Listening parties', 'Brand activations', 'Community gatherings'],
  capacitySeated: null as number | null,
  capacityStanding: null as number | null,
  availability: null as string | null,
  startingPrice: null as string | null,
  // A list of what a booking includes, e.g. ['Coffee and matcha bar service', 'House sound system'].
  included: null as string[] | null,
}

export const press = [
  {
    outlet: 'Atlanta News First',
    title: 'Black History Spotlight: Black Coffee ATL',
    date: '2025-02-20',
    url: 'https://www.atlantanewsfirst.com/2025/02/20/black-history-spotlight-black-coffee-atl/',
  },
  {
    outlet: 'What Now Atlanta',
    title: 'Black Coffee ATL closing in Castleberry Hill, opening on the BeltLine',
    date: '2023-10',
    url: 'https://whatnow.com/atlanta/restaurants/black-coffee-atl-closing-in-castleberry-hill-opening-on-the-beltline/',
  },
  {
    outlet: 'Atlanta Magazine',
    title: 'The new black brews: 5 Black-owned bars and cafes you need to try',
    date: '2022',
    url: 'https://www.atlantamagazine.com/drinks/the-new-black-brews-5-black-owned-bars-and-cafes-you-need-to-try/',
  },
]

export const timeline = [
  {
    when: 'Before December 2021',
    title: 'A pop-up',
    text: 'Black Coffee ATL starts as a pop-up, serving coffee around Atlanta before it has a storefront of its own.',
  },
  {
    when: 'December 2021',
    isoDate: '2021-12',
    title: 'Castleberry Hill',
    text: 'The first shop opens at 131 Walker St SW, the first coffee shop in that part of Castleberry Hill. It closes in 2023 at the end of its lease.',
  },
  {
    when: 'October 2023',
    isoDate: '2023-10-21',
    title: 'The Vivian',
    text: 'The shop reopens at 1246 Allene Ave SW, inside The Vivian on the BeltLine’s Westside extension, with a patio and easier parking.',
  },
]

export const nav = [
  { href: '/menu', label: 'Menu' },
  { href: '/private-hire', label: 'Private hire' },
  { href: '/story', label: 'Story' },
  { href: '/visit', label: 'Visit' },
  { href: '/faq', label: 'FAQ' },
] as const
