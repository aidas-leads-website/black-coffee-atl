# Updating the website

Everything you are likely to change, including hours, menu, questions, events and the art wall, lives in a few text files.
Change a file and the website updates everywhere at once: the pages, what Google shows, and what AI assistants read.

## How to make a change

1. Open the repository on GitHub and go to the file named below.
2. Click the pencil icon (**Edit this file**).
3. Make the change. Keep every quote mark, comma and bracket exactly as it is around your edit.
4. Click **Commit changes**. The site redeploys on its own within a couple of minutes.

If something goes wrong, the build stops and the live site stays as it was. You won't break the live site by mistake.
Ask your developer to look at the failed build.

A few rules keep the site consistent:

- Write the name as **Black Coffee ATL** every time.
- Use plain sentences: what it is, what's in it, what it costs.
- Change a fact in one file only. The site copies it everywhere else for you.
- After changing hours, update Google Business Profile and Yelp the same day so they match the site.

## Opening hours

**File:** `lib/site.ts`. Look for `export const hours`.

```ts
{ label: 'Monday to Friday', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '20:00' },
{ label: 'Saturday and Sunday', days: ['Saturday', 'Sunday'], opens: '08:00', closes: '18:00' },
```

Times use the 24-hour clock: `18:00` is 6 PM. That is the only place hours are written. The "Open until…" line, the
Visit and FAQ sentences, the footer and Google's data all update from it. In FAQ answers, write `{hours}` wherever the
hours belong.

## The menu

**File:** `data/menu.json`.

Each drink looks like this:

```json
{ "name": "Lavender & Chill", "ingredients": ["lavender", "vanilla", "espresso", "milk"], "price": 7, "from": true }
```

| To… | Do this |
| --- | --- |
| Change a price | Edit `price`. Write 7.5 for $7.50 |
| Mark a starting price ("from $7.50") | Keep `"from": true`. Delete it if the price is fixed |
| Mark something sold out | Add `"available": false` and set `"price": null` |
| Add a drink | Copy a similar line, paste it under it and change the details. Mind the comma between lines |
| Note an ingredient, such as iced only | Add `"note": "Iced only"` |
| Say who a drink is named for | Add `"namedFor": "Carl Northrop, our founder"` |

The site writes each drink's sentence for you, for example: "Lavender & Chill is a signature latte made with lavender,
vanilla, espresso and milk, from $7.00."

Keep the Square ordering site in step with any price change.

## Questions and answers

**File:** `data/faq.json`.

Each entry has a question (`q`) and an answer (`a`). Every answer must:

- be 50 words or fewer,
- include **Black Coffee ATL** and **Capitol View**,
- make sense on its own, because Google and AI assistants quote answers one at a time.

If an answer breaks one of these rules, the build stops and tells you which answer it was.

## Events

**File:** `data/events.json`.

Add one entry per event inside `"events": [ ]`:

```json
{
  "name": "Listening party: Album title",
  "start": "2026-11-14T19:00:00-05:00",
  "end": "2026-11-14T22:00:00-05:00",
  "description": "One sentence about the night.",
  "performer": "DJ Name"
}
```

Write dates and times in Atlanta time:

- Winter (Eastern Standard Time) ends in `-05:00`.
- Summer (Eastern Daylight Time) ends in `-04:00`.

The home page lists the next three events and hides them once they have passed. Events also appear in Google's event
results.

## The art wall

**File:** `data/art.json`.

When a show goes up, replace `"currentShow": null` with:

```json
"currentShow": {
  "title": "Show title",
  "artist": "Artist Name",
  "artistUrl": "https://artist-website.com",
  "start": "2026-11-01",
  "end": "2026-12-31"
}
```

When the show comes down, move it into `"archive": [ ]` and set `currentShow` back to `null`.

## Private hire details

**File:** `lib/site.ts`. Look for `export const privateHire`.

| Field | Example | Empty (`null`) means the page says… |
| --- | --- | --- |
| `capacitySeated` | `40` | "Capacity depends on the layout you need" |
| `capacityStanding` | `80` | (same) |
| `availability` | `'Evenings after 6 PM and all day Sunday'` | "The team confirms availability date by date" |
| `startingPrice` | `'$500 for three hours'` | "Every event is quoted on its own" |
| `included` | `['Coffee and matcha bar', 'House sound system']` | "Every booking is shaped around the event" |

Text goes in single quotes. Numbers have no quotes.

## Address, phone, email, social links

**File:** `lib/site.ts`, at the top under `export const business`. Changing the address or phone here changes it on every
page, in Google's data and in the footer. Update every listing (Google, Yelp, Apple Maps, Facebook) the same day.

To add Instagram, add its link to the `sameAs` list.

Once the shop confirms it has no link to The Black Coffee Company, change
`confirmedNoLinkToBlackCoffeeCompany: false` to `true`. That switches on a short statement and an FAQ that keep the two
businesses apart.
