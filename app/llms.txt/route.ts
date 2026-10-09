import { business, fullAddress, hoursText, amenities, SITE_URL, timeline, press } from '@/lib/site'
import { menu, describe } from '@/lib/menu'
import { allFaqs } from '@/lib/faq'

export const dynamic = 'force-static'

/** G6: optional llms.txt, generated from the same data as the pages so it cannot drift. */
export function GET() {
  const signature = menu.sections.find((s) => s.id === 'signature-lattes')!
  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.identity}`,
    '',
    `Tagline: ${business.tagline}`,
    `Location name on Google: ${business.locationName}`,
    `Address: ${fullAddress} (inside The Vivian, ${business.neighbourhood})`,
    `Coordinates: ${business.geo.lat}, ${business.geo.lng}`,
    `Phone: ${business.phone.display}`,
    `Email: ${business.email}`,
    `Hours (Atlanta time): ${hoursText}`,
    `Order ahead: ${business.orderUrl}`,
    `Owner and founder: ${business.founder}`,
    `Roasters: ${business.roasters.join(', ')}`,
    `Amenities: ${amenities.join(', ')}`,
    '',
    '## Pages',
    '',
    `- [Menu](${SITE_URL}/menu): every drink and food item with ingredients and prices`,
    `- [Visit](${SITE_URL}/visit): hours, parking, directions, accessibility, WiFi, dogs`,
    `- [Private hire](${SITE_URL}/private-hire): event space hire and inquiry form`,
    `- [Story](${SITE_URL}/story): history from pop-up to Castleberry Hill to The Vivian, press`,
    `- [FAQ](${SITE_URL}/faq): ${allFaqs.length} short answers`,
    '',
    '## Signature drinks',
    '',
    ...signature.items.map((i) => `- ${describe(i, signature)}`),
    '',
    '## History',
    '',
    ...timeline.map((t) => `- ${t.when}: ${t.text}`),
    '',
    '## Press',
    '',
    ...press.map((p) => `- [${p.title}](${p.url}), ${p.outlet}, ${p.date}`),
    '',
    '## Frequently asked questions',
    '',
    ...allFaqs.flatMap((f) => [`### ${f.q}`, '', f.a, '']),
  ]
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
