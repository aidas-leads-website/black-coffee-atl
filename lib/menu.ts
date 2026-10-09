import menuData from '@/data/menu.json'

export type MenuItem = {
  name: string
  kind?: string
  ingredients: string[] | null
  note?: string
  price: number | null
  from?: boolean
  available?: boolean
  color?: string
  flavor?: string
  sentence?: string
  plain?: boolean
  namedFor?: string
}

export type MenuSection = {
  id: string
  name: string
  kind: string
  intro: string
  items: MenuItem[]
}

export const menu = menuData as unknown as {
  updated: string
  source: string
  sections: MenuSection[]
  options: { milk: string; syrups: string; sizes: string }
  allergens: string
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function money(n: number) {
  return `$${n.toFixed(2)}`
}

export function priceLabel(item: MenuItem) {
  if (item.available === false || item.price == null) return 'Currently unavailable'
  return item.from ? `from ${money(item.price)}` : money(item.price)
}

function joinList(xs: string[]) {
  if (xs.length <= 1) return xs.join('')
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a'
}

/**
 * One sentence per item that says what it is, what is in it and what it costs (A4).
 * The same sentence is used on the page and in the Menu structured data.
 */
export function describe(item: MenuItem, section: MenuSection) {
  if (item.sentence) return item.sentence
  const price =
    item.available === false || item.price == null
      ? 'currently unavailable'
      : item.from
        ? `from ${money(item.price)}`
        : money(item.price)
  if (item.plain) return `${item.name}, ${price}.`
  const kind = item.kind || section.kind
  const what = `${item.name} is ${article(kind)} ${kind}`
  const made = item.ingredients?.length ? ` made with ${joinList(item.ingredients)}` : ''
  const note = item.note ? `, ${item.note.toLowerCase()}` : ''
  return `${what}${made}${note}, ${price}.`
}

export function findItem(name: string) {
  for (const section of menu.sections) {
    const item = section.items.find((i) => i.name === name)
    if (item) return { item, section }
  }
  throw new Error(`Menu item not found: ${name}`)
}

/** Side A on the home page: six signature lattes, in tracklist order. */
export const sideA = ['Marleaux, My Love', 'Brown Sugar Baby', 'Dear Mama', 'Lavender & Chill', 'You Bring Me Joy', "Carl's Coffee Soda"].map(
  (n) => findItem(n),
)

/** The matcha scene on the home page. */
export const matchaPours = menu.sections
  .find((s) => s.id === 'matcha')!
  .items.filter((i) => i.flavor)
