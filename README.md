# Black Coffee ATL website

The website for Black Coffee ATL, a coffee shop and event space inside The Vivian on the Atlanta BeltLine. It is built
with Next.js 16 (App Router) and React 19. Every page is static HTML, and the private-hire form is handled by one server
action.

| Document | For |
| --- | --- |
| This README | Developers: setup, architecture, checks |
| [docs/LAUNCH.md](docs/LAUNCH.md) | Whoever deploys it: hosting, domains, environment variables, launch-day tasks, open questions for the shop |
| [docs/EDITING.md](docs/EDITING.md) | The shop: how to change hours, the menu, FAQs, events and the art wall |
| [docs/brief/](docs/brief/) | The original brief: requirements, design, data, analysis and the home page prototype |

## Quick start

Requires Node 20.9 or later (`.nvmrc` pins 22).

```bash
npm install
cp .env.example .env.local   # optional for local work; nothing in it is needed to build
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript, no emit |
| `npm run verify` | Production build, then `scripts/seo-check.mjs` against the built HTML. CI runs this on every push and pull request |

In development the form logs inquiries to the terminal instead of emailing them.

## How it is put together

```
app/                  Routes. One folder per page, plus robots, sitemap, manifest, icons, share image, llms.txt
  page.tsx, home.css  The home page: nine scroll scenes over server-rendered HTML
  private-hire/       Page, inquiry form (client) and its server action
components/           Header, footer, phone action bar, facts list, map card, etc.
  home/               HomeExperience.tsx (scroll engine), record3d.ts (Three.js record, lazy-loaded)
lib/site.ts           Every business fact: name, address, phone, hours, coordinates, amenities, timeline, press
lib/menu.ts, faq.ts   Loaders and helpers for the data files
lib/schema.ts         JSON-LD builders
data/                 menu.json, faq.json, events.json, art.json: content the shop edits
scripts/seo-check.mjs Build guardrail
```

**One source of truth.** No fact is typed into a page. The pages, JSON-LD, sitemap, error pages and `/llms.txt` all read
from `lib/site.ts` and `data/`, so they cannot disagree. Keep it that way. If you need a fact on a new page, import it.

**The home page.** All copy is server-rendered HTML. `HomeExperience` reads that markup and adds motion; it never writes
text. It picks one of three levels:

| Level | Who gets it | What they see |
| --- | --- | --- |
| Full | WebGL2 on a real GPU, 4 GB+ memory, motion allowed, data saver off | The 3D cup that becomes a record. It loads after first paint, when the browser is idle |
| Light | No WebGL2, a software renderer, low memory, or under 30 fps (it steps down mid-visit) | A flat SVG record that turns with scroll |
| Still | Reduced motion, data saver, very low memory, the footer "Motion: off" switch, or no JavaScript | Sections in normal flow, with exactly the same words |

An inline script in `app/layout.tsx` picks the level before first paint, so reduced-motion visitors never see a frame of
animation.

**The form.** `app/private-hire/actions.ts` validates input and checks a honeypot field and a minimum fill time. It
rate-limits each IP address to 5 inquiries an hour, per server instance, then emails the shop through the Resend REST API.
The form works without JavaScript. If email is not configured or the send fails, it tells the visitor to email or call
instead.

**Analytics.** Links with `data-track="order|call|directions"` and successful form submissions are reported through
`track()` in `components/SiteEffects.tsx`. It sends to Plausible, `gtag` or `dataLayer`, whichever is loaded.

## What `npm run verify` enforces

The build fails if any page breaks one of these rules:

- a title of 60 or more characters, a description of 155 or more, or a duplicate of either
- a missing canonical link or Open Graph tags
- more than one `h1`, a meta keywords tag, or a viewport that blocks zoom
- an opening summary that is not 40 to 60 words
- JSON-LD that does not parse, is missing the shop, website or breadcrumbs, or contains a self-published rating
- an identity statement that is not verbatim on Home, Story and in the schema
- menu structured data that differs from the menu on the page
- fewer than 20 FAQs, an answer over 50 words, or an answer that does not name the shop and Capitol View
- an FAQ schema that differs from the page
- builder's notes in page copy, such as "placeholder", "to confirm" or "prices checked"
- AI crawlers missing from `robots.txt`, or a sitemap that does not list the six pages

## Production behaviour

- **Redirects:** 301s from `blackcoffeeatlanta.com` (with or without www), from the `blackcoffeeatl.com` apex to www,
  and from every legacy path (`/home-1`, `/latenightmenu`, `/about-us` and others; see `next.config.ts`).
- **Security headers:** Content-Security-Policy, HSTS, `nosniff`, a referrer policy, a permissions policy and a frame
  policy. They are production only, so development tooling still works.
- **Previews:** any deployment where `VERCEL_ENV` is not `production`, or where `NEXT_PUBLIC_NOINDEX=1` is set, serves
  `Disallow: /`, a noindex meta tag and an `X-Robots-Tag` header.
- **Freshness:** the home page regenerates daily so past events drop off. Everything else changes on deploy.

At handoff, Lighthouse on mobile against the production build scored:

| Category | Score |
| --- | --- |
| SEO | 100 on every page |
| Accessibility | 100 on every page |
| Best practices | 100 on every page |
| Performance | 93 to 98 |

## Adding photos later

Put images in `public/`, render them with `next/image` (AVIF and WebP are already configured) and give each one
descriptive alt text. Images on other domains must be added to `img-src` in the CSP in `next.config.ts`.
