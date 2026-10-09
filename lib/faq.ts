import faqData from '@/data/faq.json'
import { business, hoursSentence } from './site'

export type Faq = { q: string; a: string }
export type FaqGroup = { id: string; name: string; items: Faq[] }

const raw = faqData as unknown as { groups: FaqGroup[]; disambiguation: Faq }

// {hours} in an answer is filled in from the opening hours, so hours are only ever typed in one place.
const fill = (f: Faq): Faq => ({ q: f.q, a: f.a.replaceAll('{hours}', hoursSentence) })
const data = {
  groups: raw.groups.map((g) => ({ ...g, items: g.items.map(fill) })),
  disambiguation: fill(raw.disambiguation),
}

/** FAQ groups as shown on the page. The disambiguation answer is added once the client confirms it. */
export const faqGroups: FaqGroup[] = data.groups.map((g) =>
  g.id === 'about' && business.confirmedNoLinkToBlackCoffeeCompany ? { ...g, items: [...g.items, data.disambiguation] } : g,
)

export const allFaqs = faqGroups.flatMap((g) => g.items)

export function faqId(q: string) {
  return q
    .toLowerCase()
    .replace(/[“”"'’?]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
