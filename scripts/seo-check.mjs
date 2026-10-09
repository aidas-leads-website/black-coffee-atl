// Checks the built HTML against the search requirements (S2, S3, S4, S8, G2, A3, content rules).
// Run after `next build`: `npm run check`. Exits non-zero on any failure.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), '.next/server/app')
const PAGES = {
  '/': 'index.html',
  '/menu': 'menu.html',
  '/private-hire': 'private-hire.html',
  '/story': 'story.html',
  '/visit': 'visit.html',
  '/faq': 'faq.html',
}
const IDENTITY =
  "Black Coffee ATL is a Black-owned specialty coffee shop and event space inside The Vivian at 1246 Allene Ave SW, on the Atlanta BeltLine's Westside extension in Capitol View. Founded by Carl Northrop, it opened in Castleberry Hill in 2021 and moved to the BeltLine in 2023."

let failures = 0
const fail = (page, msg) => {
  failures++
  console.log(`  ✗ ${page}: ${msg}`)
}
const ok = (page, msg) => console.log(`  ✓ ${page}: ${msg}`)

const decode = (s) =>
  s
    .replace(/<!-- -->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
const words = (s) => s.split(/\s+/).filter(Boolean).length
const attr = (html, re) => (html.match(re) || [])[1]

const seenTitles = new Set()
const seenDescriptions = new Set()

for (const [path, file] of Object.entries(PAGES)) {
  const f = join(OUT, file)
  if (!existsSync(f)) {
    fail(path, `missing build output ${file}`)
    continue
  }
  const html = readFileSync(f, 'utf8')
  // Only the server HTML, before the RSC payload scripts.
  const body = html.split('<script>self.__next_f')[0]
  console.log(`\n${path}`)

  const title = decode(attr(html, /<title>([^<]*)<\/title>/) || '')
  if (!title) fail(path, 'no <title>')
  else if (title.length >= 60) fail(path, `title is ${title.length} chars: "${title}"`)
  else ok(path, `title ${title.length} chars`)
  if (seenTitles.has(title)) fail(path, 'duplicate title')
  seenTitles.add(title)

  const desc = decode(attr(html, /<meta name="description" content="([^"]*)"/) || '')
  if (!desc) fail(path, 'no meta description')
  else if (desc.length >= 155) fail(path, `description is ${desc.length} chars`)
  else ok(path, `description ${desc.length} chars`)
  if (seenDescriptions.has(desc)) fail(path, 'duplicate description')
  seenDescriptions.add(desc)

  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/)
  canonical ? ok(path, `canonical ${canonical}`) : fail(path, 'no canonical link')

  if (/<meta name="keywords"/.test(html)) fail(path, 'meta keywords tag present (S4)')
  const viewport = attr(html, /<meta name="viewport" content="([^"]*)"/) || ''
  if (/maximum-scale|user-scalable=no/.test(viewport)) fail(path, `viewport blocks zoom: ${viewport}`)

  const h1s = body.match(/<h1[\s>]/g) || []
  h1s.length === 1 ? ok(path, 'one h1') : fail(path, `${h1s.length} h1 elements`)

  for (const tag of ['og:title', 'og:description', 'og:image', 'twitter:card']) {
    if (!new RegExp(`(property|name)="${tag}"`).test(html)) fail(path, `missing ${tag}`)
  }

  // Structured data
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
  let graph = []
  try {
    graph = blocks.flatMap((b) => JSON.parse(b)['@graph'] || [])
  } catch (e) {
    fail(path, `JSON-LD does not parse: ${e.message}`)
  }
  const types = graph.map((n) => n['@type'])
  for (const t of ['CafeOrCoffeeShop', 'WebSite', 'BreadcrumbList']) {
    if (!types.includes(t)) fail(path, `JSON-LD missing ${t}`)
  }
  const shop = graph.find((n) => n['@type'] === 'CafeOrCoffeeShop')
  if (shop && shop.description !== IDENTITY) fail(path, 'schema description is not the identity statement verbatim (G2)')
  if (shop && 'aggregateRating' in shop) fail(path, 'aggregateRating must not be self-published')
  ok(path, `JSON-LD types: ${types.join(', ')}`)

  // Summary: 40 to 60 words, plain HTML
  const summary = path === '/' ? attr(body, /<p class="lede">([\s\S]*?)<\/p>/) : attr(body, /<p class="lede summary">([\s\S]*?)<\/p>/)
  if (!summary) fail(path, 'no opening summary')
  else {
    const n = words(decode(summary))
    n >= 40 && n <= 60 ? ok(path, `summary ${n} words`) : fail(path, `summary is ${n} words`)
  }

  // Facts present in the server HTML (S2)
  const text = decode(body)
  for (const fact of ['1246 Allene Ave SW', '(404) 343-1565', 'Black Coffee ATL']) {
    if (!text.includes(fact)) fail(path, `"${fact}" not in server HTML`)
  }

  // Customer-facing copy only: no notes from the build, review dates or placeholders.
  const banned = /placeholder|lorem ipsum|\bTODO\b|to confirm|prototype|prices checked|always current|answers so far|facts reviewed|official ones|last reviewed/i
  const hit = text.match(banned)
  hit ? fail(path, `internal wording in page copy: "${hit[0]}"`) : ok(path, 'no internal wording')

  if (path === '/' || path === '/story') {
    text.includes(IDENTITY) ? ok(path, 'identity statement verbatim') : fail(path, 'identity statement not verbatim on page (G2)')
  }

  if (path === '/menu') {
    const menu = graph.find((n) => n['@type'] === 'Menu')
    const schemaItems = menu ? menu.hasMenuSection.flatMap((s) => s.hasMenuItem) : []
    const pageItems = (body.match(/<li class="item[ "]/g) || []).length
    schemaItems.length === pageItems && pageItems > 0
      ? ok(path, `${pageItems} menu items, schema matches page`)
      : fail(path, `menu items: page ${pageItems}, schema ${schemaItems.length}`)
    for (const it of schemaItems) {
      if (!text.includes(it.description)) fail(path, `menu sentence not on page: ${it.description}`)
    }
  }

  if (path === '/faq') {
    const faq = graph.find((n) => n['@type'] === 'FAQPage')
    const qs = faq ? faq.mainEntity : []
    qs.length >= 20 ? ok(path, `${qs.length} questions`) : fail(path, `only ${qs.length} questions (need 20)`)
    for (const q of qs) {
      const a = q.acceptedAnswer.text
      if (words(a) > 50) fail(path, `answer over 50 words (${words(a)}): ${q.name}`)
      if (!a.includes('Black Coffee ATL')) fail(path, `answer does not name the shop: ${q.name}`)
      if (!a.includes('Capitol View')) fail(path, `answer does not name the neighbourhood: ${q.name}`)
      if (!text.includes(a)) fail(path, `answer in schema differs from page: ${q.name}`)
      if (!text.includes(q.name)) fail(path, `question in schema differs from page: ${q.name}`)
    }
  }
}

// Crawler files
console.log('\ncrawler files')
const robots = existsSync(join(OUT, 'robots.txt.body')) ? readFileSync(join(OUT, 'robots.txt.body'), 'utf8') : ''
for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended']) {
  if (!robots.includes(`User-Agent: ${bot}`)) fail('robots.txt', `${bot} not listed`)
}
if (/Disallow: \/\s*$/m.test(robots)) fail('robots.txt', 'contains Disallow: /')
else ok('robots.txt', 'AI crawlers allowed')
const sitemap = existsSync(join(OUT, 'sitemap.xml.body')) ? readFileSync(join(OUT, 'sitemap.xml.body'), 'utf8') : ''
const locs = (sitemap.match(/<loc>/g) || []).length
locs === 6 ? ok('sitemap.xml', '6 URLs') : fail('sitemap.xml', `${locs} URLs`)

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll checks passed.')
process.exit(failures ? 1 : 0)
