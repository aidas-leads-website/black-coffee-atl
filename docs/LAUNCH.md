# Launch runbook

Do the steps in order. The site builds and runs with no configuration. Steps 2 and 3 switch on email and analytics.

## 1. Host it

**Recommended: Vercel.** Import the repository at vercel.com/new. Vercel detects Next.js, so no build settings are needed.
Every pull request gets its own preview deployment, and previews are automatically kept out of search.

**Other hosts.** Any host that runs Node 20.9 or later can serve the site with `npm ci && npm run build && npm start`. Use
port 3000, or set `PORT`. On a staging server, set `NEXT_PUBLIC_NOINDEX=1`.

## 2. Environment variables

Set these in the host's project settings, for the production environment.

| Variable | Needed? | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Only if it changes | `https://www.blackcoffeeatl.com` |
| `RESEND_API_KEY` | **Yes, for the form** | An API key from resend.com |
| `INQUIRY_FROM` | **Yes, for the form** | An address on a domain verified in Resend, such as `Black Coffee ATL website <inquiries@blackcoffeeatl.com>` |
| `INQUIRY_TO` | Optional | Where inquiries go. Default `westside@blackcoffeeatl.com` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Only if you want Plausible as well as Vercel Analytics |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Recommended | The token from Google Search Console's HTML-tag method |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Recommended | The token from Bing Webmaster Tools |
| `NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY` | Optional | A Maps Static API key restricted to the site's domain. Without it, Visit shows a drawn location card |

Variables starting `NEXT_PUBLIC_` are baked in at build time, so redeploy after changing them. A production build without
the Resend variables prints a warning but still succeeds.

**Vercel Web Analytics:** the code is already in place. Switch it on in the Vercel dashboard under the project's
**Analytics** tab, then redeploy. Page views work on every plan. The custom events (Order, Call, Directions and inquiry
submissions) appear under **Events**, which needs a Pro or Enterprise plan. On the Hobby plan only page views are recorded.
Analytics only runs on Vercel deployments; on another host the component does nothing.

**Resend setup:**

1. Add `blackcoffeeatl.com` as a domain in Resend.
2. Add the DNS records Resend shows.
3. Wait for the domain to verify.
4. Create an API key.

Until all four steps are done, the form tells visitors to email or call instead.

## 3. Domains

1. Add these four domains to the hosting project:
   - `www.blackcoffeeatl.com` (primary)
   - `blackcoffeeatl.com`
   - `blackcoffeeatlanta.com`
   - `www.blackcoffeeatlanta.com`
2. Point their DNS at the host. The site itself 301s every non-primary domain to `https://www.blackcoffeeatl.com`, keeping
   the path.
3. On Vercel, attach the extra domains to the project as plain domains. Don't also set them as Vercel redirects: one
   redirect is enough.
4. If a CDN or firewall sits in front, such as Cloudflare's bot fight mode, make sure it does not challenge AI crawlers.
   Then test:

   ```bash
   curl -A "GPTBot" -I https://www.blackcoffeeatl.com/
   curl -A "ClaudeBot" -I https://www.blackcoffeeatl.com/menu
   curl -A "PerplexityBot" https://www.blackcoffeeatl.com/robots.txt
   ```

   All three requests should return `200`.

## 4. Smoke test the live site

- [ ] `https://blackcoffeeatlanta.com/menu` returns a 301 to `https://www.blackcoffeeatl.com/menu`.
- [ ] `/home-1`, `/latenightmenu` and `/about-us` each return a 301.
- [ ] The header shows the correct open or closed status for Atlanta time.
- [ ] On a phone: Order opens Square, Directions opens Google Maps, and Call dials.
- [ ] A test inquiry arrives in the shop inbox, and replying to it reaches the sender.
- [ ] With reduced motion switched on in the OS, the home page shows every section with no animation.
- [ ] The [Rich Results Test](https://search.google.com/test/rich-results) on `/` and `/menu` shows no errors.

## 5. Search and listings: same day

1. **Google Search Console:** verify the site, then submit `https://www.blackcoffeeatl.com/sitemap.xml`. Use URL inspection
   to request indexing for each of the six pages.
2. **Bing Webmaster Tools:** import from Search Console, or verify and submit the sitemap. This also feeds ChatGPT and
   Copilot search.
3. **Google Business Profile:**
   - Set the website to `https://www.blackcoffeeatl.com`.
   - Set the menu link to `/menu`, the order link to the Square site, and the booking link to `/private-hire`.
   - Confirm the hours match the site.
   - Add photos.
4. **Listings:** make every listing match the site exactly, with the same name, address, phone and hours.
   - Claim Yelp and correct its name and weekend hours.
   - Correct Apple Business Connect, Bing Places, Facebook and BrewAtlas.
   - Ask the data brokers still showing 131 Walker St SW or 364 Auburn Ave NE to update. `docs/brief/Data.md` lists them.

## 6. After launch

- **Monthly:** run the 15 agreed prompts on ChatGPT, Gemini, Perplexity and Claude. Log whether each answer names the shop
  and gets its facts right.
- **At 30 days:**
  - Review Core Web Vitals field data in Search Console. The target at the 75th percentile is LCP 2.5 s or less, INP
    200 ms or less and CLS 0.1 or less.
  - In Vercel Analytics, under **Events**, count `order`, `call`, `directions` and `inquiry_submit` per month. These are
    the baselines for the goals in the brief.
- If field LCP misses its target, the first lever is `display: 'optional'` for Archivo in `app/layout.tsx`. It saves
  about 0.3 to 0.6 s, but first-time visitors on slow connections see the fallback font.

## Open questions for the shop

Each answer is a one-line change, and [EDITING.md](EDITING.md) says where. Until they are answered, the site states only
what has been confirmed.

- [ ] **Weekend hours.** The site says 8 AM to 6 PM, as Waze, BrewAtlas and Square do. Yelp says 4 PM.
- [ ] **The Black Coffee Company.** Is there any link to it? If not, a one-line statement and an FAQ can be switched on to
      separate the two businesses.
- [ ] **Private hire.** What is the seated and standing capacity, when is the space available, what is the starting price,
      and what is included?
- [ ] **The art wall.** What is the current show, who is the artist, what are the dates, and are there photos?
- [ ] **Drink names.** Who are Carl, Bre, Toni and Marleaux, and may their stories be told?
- [ ] **Photos and logo.** The logo is needed as an SVG. The site also needs room, drink and art photography; Private hire
      needs three room photos.
- [ ] **Instagram handle.**
- [ ] **Accessible entrance.** Is there a step-free entrance? The site currently says to call ahead.
- [ ] **Payment.** Is cash accepted?
- [ ] **Ownership wording.** Are "women-owned" and "LGBTQ-owned" accurate? Only "Black-owned" and "LGBTQ-friendly" are
      used now.
- [ ] **Accounts.** Who controls the domain, DNS, Square, Google Business Profile and the hosting account after handoff?
