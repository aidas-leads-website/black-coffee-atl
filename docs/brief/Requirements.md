# Requirements

Oct 6, 2026 · @Jawad

## Goals and measures

The site succeeds if it becomes the source every listing and assistant agrees with, sends people to the counter, and stays fast while doing something memorable. Business baselines are unknown, so those targets are set after the first month of analytics.

| Goal | Measure | Target |
| --- | --- | --- |
| One source of truth | Name, address, phone and hours identical on the site, Google, Yelp, Apple Maps, Bing and Facebook | 100% match at launch |
| More visits and orders | Taps on Order, Directions and Call | Baseline in month 1, then growth month on month |
| Private-hire leads | Inquiry forms submitted per month | Baseline in month 1 |
| Cited by assistants | A fixed set of 15 prompts run monthly on ChatGPT, Gemini, Perplexity and Claude: is the shop named, are the facts right? | Correct facts in every answer that names the shop |
| Memorable without being slow | Core Web Vitals on mobile, 75th percentile | LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less |
| Usable by everyone | WCAG 2.2 AA audit, and the full site with motion switched off | Pass, with no content lost |

## Site structure

Build a hybrid: one immersive home page and five plain pages, six URLs at launch. A pure one-pager would give search a single page to rank for every intent, from "matcha near the BeltLine" to "event space Westside Atlanta"; separate pages give each intent its own title, summary and schema.

&#91;embedded content: sitemap · 6 pages at launch, 2 in phase two\]

Home carries the experience and links to every other page from its scenes. The five plain pages share the visual system and light motion, but no pinned scenes and no 3D, so they load fast and read cleanly to crawlers.

## Functional requirements

Sixteen requirements, ten of them needed for launch. Must means the site does not ship without it.

| ID | Requirement | Priority |
| --- | --- | --- |
| F1 | Live open or closed status in the header of every page, computed from the hours data in Atlanta time | Must |
| F2 | Fixed action bar on mobile with three buttons: Order, Directions, Call | Must |
| F3 | Menu rendered as HTML text from a single data file, grouped by category, each drink with its own anchor link | Must |
| F4 | Order buttons open the Square ordering site | Must |
| F5 | Private-hire inquiry form: date, guest count, event type, contact details. Spam protection, email to the shop, on-screen confirmation | Must |
| F6 | Location shown as a static map image linking to Google Maps by Place ID. No embedded map loaded up front | Must |
| F7 | Scroll-driven home page with the 3D piece, as set out in Design | Must |
| F8 | Complete static version for reduced-motion, no-WebGL and data-saver visitors | Must |
| F9 | 301 redirects from blackcoffeeatlanta.com, /home-1, /latenightmenu, /about-us and any other legacy URL | Must |
| F10 | Event tracking for order, call, directions and form submit | Must |
| F11 | Art wall block: current show, artist, dates, with an archive | Should |
| F12 | Events list with dates, fed from one data file | Should |
| F13 | Client can change hours, menu and events without a developer | Should |
| F14 | Custom 404 page that offers the menu and directions | Should |
| F15 | Newsletter signup | Could |
| F16 | Link to merchandise, if the old store is still wanted | Could |

## Content requirements

Every page opens with a 40 to 60 word plain summary that makes sense on its own, then goes deeper. The name is written the same way everywhere: Black Coffee ATL.

| Page | Must contain |
| --- | --- |
| Home | The one-sentence identity statement, the tagline, three signature drinks, the art wall, private hire teaser, an at-a-glance facts block, hours and address in text |
| Menu | All items from the Data tab with ingredients and prices, grouped. A short note per signature drink on who or what it is named for. Milk and syrup options. Allergen note |
| Private hire | What the space suits, capacity seated and standing, available days and times, what is included, starting price or how pricing works, three photos, the form |
| Story | Pop-up to Castleberry Hill to The Vivian, with dates. Carl Northrop's role. The team's part in shaping The Vivian. The art programme and its curator. Press links |
| Visit | Hours, address, map, parking and validation, arriving from the BeltLine, transit, accessibility of the entrance, WiFi, dogs, laptop policy |
| FAQ | At least 20 questions, each answered in 50 words or fewer, each answer naming the shop so it stands alone when quoted |

The identity statement, pending client sign-off:

> Black Coffee ATL is a Black-owned specialty coffee shop and event space inside The Vivian at 1246 Allene Ave SW, on the Atlanta BeltLine's Westside extension in Capitol View. Founded by Carl Northrop, it opened in Castleberry Hill in 2021 and moved to the BeltLine in 2023.

This exact wording appears on Home, on Story and in the structured data description. If the client confirms no link to The Black Coffee Company, Story and FAQ say so in one sentence.

## Search requirements

One rule covers all three disciplines: every fact and every sentence of copy exists as plain HTML that loads without scripts, and says the same thing everywhere it appears. The animation layer sits on top of that and never replaces it.

### SEO

| ID | Requirement |
| --- | --- |
| S1 | One canonical domain, blackcoffeeatl.com. The second domain and all legacy URLs 301 to it |
| S2 | Static or server-rendered HTML for all pages. View-source shows the full copy |
| S3 | One h1 per page, a unique title under 60 characters and a description under 155 |
| S4 | No meta keywords tag and no visible keyword lists |
| S5 | XML sitemap, submitted to Google Search Console and Bing Webmaster Tools |
| S6 | Images in AVIF or WebP with width, height and descriptive alt text |
| S7 | Google Business Profile updated the same day: menu link, order link, booking link to Private hire, corrected hours, new photos |
| S8 | Viewport tag without maximum-scale |

### Structured data (JSON-LD)

| Type | Where | Key properties |
| --- | --- | --- |
| CafeOrCoffeeShop | Every page | name, alternateName, description, address, geo (33.7209, -84.4108 once confirmed), telephone, openingHoursSpecification, priceRange, hasMenu, amenityFeature, founder, image, sameAs for every official profile |
| Menu, MenuSection, MenuItem | Menu | name, description and offers.price for each item, generated from the same data file as the page |
| FAQPage | FAQ | Every question and answer exactly as shown on the page |
| Event | Home, Art wall | name, startDate, location, performer or artist |
| BreadcrumbList, WebSite | Every page | Standard |

Do not mark up the Google rating as aggregateRating: self-published review markup for a local business is not eligible for rich results. FAQ markup is there for machine clarity, not for a rich result.

### AEO

| ID | Requirement |
| --- | --- |
| A1 | An at-a-glance facts block on Home and Visit, built as a definition list: hours, address, phone, parking, WiFi, dogs, payment |
| A2 | Question-style headings on Visit, Private hire and FAQ, each followed by the answer in the first sentence |
| A3 | FAQ answers of 50 words or fewer that include the shop name and neighbourhood |
| A4 | Each named drink described in one sentence that states what it is, what is in it and its price |

### GEO

| ID | Requirement |
| --- | --- |
| G1 | robots.txt allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot and Google-Extended. Confirm the host or CDN's bot protection is not blocking them |
| G2 | The identity statement appears verbatim on Home, Story and in schema |
| G3 | Listings corrected to match: claim Yelp, fix its name and hours, then Apple Business Connect, Bing Places, Facebook, BrewAtlas and the data brokers showing the old address |
| G4 | Dated, attributable pages: each art show and event names people and dates. A press page links every article about the shop |
| G5 | A monthly prompt test, logged, using the 15 prompts agreed in Goals |
| G6 | llms.txt is optional. Add it if wanted, but nothing depends on it |

Built this way, scroll-driven effects cost search nothing beyond their file weight, which the next section caps. They become a real cost when text is injected by script or drawn inside the canvas.

## Performance, accessibility and motion safety

The 3D layer is a guest on the page: it loads last, yields first, and the page is complete without it. The weight budgets below are my proposals to tune on real devices; the Core Web Vitals thresholds are Google's.

| ID | Requirement | Target |
| --- | --- | --- |
| P1 | Largest Contentful Paint, mobile, 75th percentile | 2.5 s or less |
| P2 | Interaction to Next Paint | 200 ms or less |
| P3 | Cumulative Layout Shift | 0.1 or less |
| P4 | The largest element on first paint is a static poster image, not the canvas | Poster 150 KB or less |
| P5 | JavaScript needed before first interaction, excluding 3D | 120 KB compressed or less |
| P6 | 3D code and model load only after first paint, and only if the device qualifies | Model 1.5 MB or less, compressed geometry and textures |
| P7 | Frame rate on a mid-range phone | 60 fps target, never below 30 |
| P8 | Render loop pauses when the canvas is off-screen or the tab is hidden | Always |
| P9 | Pixel ratio capped | 2 on desktop, 1.5 on mobile |

| ID | Requirement |
| --- | --- |
| M1 | Native scrolling only. No hijacked wheel, no forced snap, no scroll speed changes |
| M2 | With reduced motion set: no pinning, no parallax, no 3D rotation. Sections stack normally with the poster image. All content identical |
| M3 | No WebGL, data-saver on, or low device memory: same static version as M2 |
| M4 | Any motion that runs longer than five seconds without user input has a visible pause control |
| M5 | Nothing flashes more than three times a second |
| X1 | WCAG 2.2 AA: contrast, visible focus, full keyboard use, zoom to 400% without loss |
| X2 | The canvas is hidden from assistive tech. Its meaning is carried by the HTML beside it |
| X3 | Form fields have labels, errors are announced, targets are at least 24 by 24 px |

Browser support: current and previous versions of Chrome, Edge, Safari and Firefox. CSS scroll-driven animation is native in [Chrome and Edge 115+ and Safari 26+](https://ics.media/en/entry/230718/) but not in a Firefox release as of August 2026, so nothing essential may depend on it alone.

## Stack, integrations and tools

I recommend a static-first build: pages ship as finished HTML and the animation code hydrates only where it is used. Everything here is a recommendation and can be swapped if you have a house stack.

| Layer | Recommendation | Why |
| --- | --- | --- |
| Site framework | Astro, static output | HTML first, scripts only on the components that need them. Next.js is the alternative if you want React throughout |
| 3D | Three.js, loaded as a lazy island on Home only | Mature, small enough when tree-shaken, runs on WebGL everywhere |
| Scroll choreography | GSAP with ScrollTrigger for pinned and scrubbed scenes | Works in every browser, including Firefox |
| Simple reveals | Native CSS scroll-driven animations inside an @supports check | Runs off the main thread where supported, harmless where not |
| Menu data | One JSON file in the repo to start. Square Catalog API sync later | The same file feeds the page and the schema, so they cannot drift |
| Forms | Serverless form handler with honeypot and rate limit | No backend to maintain |
| Hosting | Any static host with a CDN and redirect rules | Cheap, fast, simple 301s |
| Analytics | Privacy-light analytics plus Search Console and Bing Webmaster Tools | Enough to measure the Goals table |

### What I need to build it

Nothing extra is required for a first working prototype: I can write the full site, including a procedural 3D model built in code. These would raise the ceiling:

| Need | What it unlocks | Required? |
| --- | --- | --- |
| Client assets: logo as SVG, brand colours, photos of the room, drinks and art | Real imagery instead of placeholders | Yes, before launch |
| A browser-automation or Chrome DevTools MCP | Lets me watch the scroll animation run, catch jank and run Lighthouse | Strongly recommended |
| Blender MCP, or a finished GLB file from a 3D artist | A hand-modelled hero object rather than a procedural one | Optional |
| Figma MCP | Design review and handoff if you work in Figma | Optional |
| GitHub and a hosting connector | Preview deployments on every change | Optional |
| Square API credentials from the client | Live menu sync | Optional, phase two |
| Access to Google Business Profile, Yelp and Search Console | The listing clean-up in G3 | Yes, client side |

Canva is already connected here and can cover mood boards and social images.

## Open questions for the client

These sit alongside the seven data conflicts on the Data tab. The first four block design; the rest block launch.

- [ ] Is there a logo file, a colour palette or brand guide, and a preferred typeface?
- [ ] Who can supply photography, and is a half-day shoot possible?
- [ ] What is the Instagram handle, and should the feed appear on the site?
- [ ] Who are Carl, Bre, Toni and Marleaux in the drink names, and may we tell those stories?
- [ ] Private hire: capacity, available hours, starting price, what is included, who answers inquiries?
- [ ] Who controls the domain, DNS and the Square account?
- [ ] Who will update hours, menu and events after launch?
- [ ] Is the merchandise store still wanted?
- [ ] Is there a launch date or an event to launch around?
