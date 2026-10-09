// JSON-LD builders. Every node is generated from lib/site.ts and the data files,
// so the structured data can never disagree with the visible page.
import { SITE_URL, business, hours, mapsUrl, amenities, timeline } from './site'
import { menu, describe } from './menu'
import { allFaqs } from './faq'
import eventsData from '@/data/events.json'

type Node = Record<string, unknown>

export const ids = {
  shop: `${SITE_URL}/#shop`,
  website: `${SITE_URL}/#website`,
  founder: `${SITE_URL}/#founder`,
  vivian: `${SITE_URL}/#the-vivian`,
}

export function url(path: string) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

const address = {
  '@type': 'PostalAddress',
  streetAddress: business.address.street,
  addressLocality: business.address.locality,
  addressRegion: business.address.region,
  postalCode: business.address.postalCode,
  addressCountry: business.address.country,
}

export function shopNode(): Node {
  return {
    '@type': 'CafeOrCoffeeShop',
    '@id': ids.shop,
    name: business.name,
    alternateName: [business.locationName, 'Black Coffee ATL Westside'],
    description: business.identity,
    slogan: business.tagline,
    url: url('/'),
    telephone: business.phone.schema,
    email: business.email,
    priceRange: business.priceRange,
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card',
    servesCuisine: ['Coffee', 'Espresso', 'Matcha', 'Tea', 'Sandwiches'],
    address,
    geo: { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng },
    hasMap: mapsUrl,
    containedInPlace: { '@type': 'Place', '@id': ids.vivian, name: 'The Vivian', address },
    openingHoursSpecification: hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    hasMenu: url('/menu'),
    acceptsReservations: false,
    amenityFeature: amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    founder: { '@type': 'Person', '@id': ids.founder, name: business.founder, jobTitle: 'Founder and owner' },
    image: [url('/opengraph-image')],
    logo: url('/apple-icon'),
    sameAs: [...business.sameAs, business.orderUrl],
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: business.orderUrl,
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
      deliveryMethod: 'https://schema.org/OnSitePickup',
    },
    knowsAbout: ['Specialty coffee', 'Ceremonial-grade matcha', 'Atlanta art', 'Private events'],
  }
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: url('/'),
    name: business.name,
    alternateName: business.locationName,
    inLanguage: 'en-US',
    publisher: { '@id': ids.shop },
  }
}

export type Crumb = { name: string; path: string }

export function breadcrumbNode(path: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url(path)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: url(c.path) })),
  }
}

export function webPageNode(opts: { path: string; title: string; description: string; type?: string; extra?: Node }): Node {
  return {
    '@type': opts.type || 'WebPage',
    '@id': `${url(opts.path)}#webpage`,
    url: url(opts.path),
    name: opts.title,
    description: opts.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': ids.website },
    about: { '@id': ids.shop },
    breadcrumb: { '@id': `${url(opts.path)}#breadcrumb` },
    primaryImageOfPage: url('/opengraph-image'),
    ...opts.extra,
  }
}

export function menuNode(): Node {
  return {
    '@type': 'Menu',
    '@id': `${url('/menu')}#menu`,
    name: `${business.name} menu`,
    url: url('/menu'),
    inLanguage: 'en-US',
    hasMenuSection: menu.sections.map((s) => ({
      '@type': 'MenuSection',
      '@id': `${url('/menu')}#${s.id}`,
      name: s.name,
      description: s.intro,
      hasMenuItem: s.items.map((item) => {
        const node: Node = { '@type': 'MenuItem', name: item.name, description: describe(item, s) }
        if (item.price != null && item.available !== false) {
          node.offers = {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          }
        }
        return node
      }),
    })),
  }
}

export function faqNode(path: string): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${url(path)}#faq`,
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

type EventData = { name: string; start: string; end?: string; description?: string; performer?: string; url?: string }
export const events = (eventsData as { events: EventData[] }).events
  .slice()
  .sort((a, b) => a.start.localeCompare(b.start))

export function eventNodes(): Node[] {
  return events.map((e) => ({
    '@type': 'Event',
    name: e.name,
    startDate: e.start,
    ...(e.end ? { endDate: e.end } : {}),
    ...(e.description ? { description: e.description } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@id': ids.shop },
    organizer: { '@id': ids.shop },
    ...(e.performer ? { performer: { '@type': 'PerformingGroup', name: e.performer } } : {}),
    ...(e.url ? { url: e.url } : {}),
  }))
}

export function historyNode(): Node {
  return {
    '@type': 'ItemList',
    '@id': `${url('/story')}#timeline`,
    name: `${business.name} history`,
    itemListElement: timeline.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `${t.when}: ${t.title}`, description: t.text })),
  }
}

/** Every page gets the shop, the website, its WebPage and its BreadcrumbList, plus any extras. */
export function pageGraph(opts: {
  path: string
  title: string
  description: string
  crumbs: Crumb[]
  type?: string
  extra?: Node[]
  pageExtra?: Node
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      shopNode(),
      websiteNode(),
      webPageNode({ path: opts.path, title: opts.title, description: opts.description, type: opts.type, extra: opts.pageExtra }),
      breadcrumbNode(opts.path, opts.crumbs),
      ...(opts.extra || []),
    ],
  }
}
