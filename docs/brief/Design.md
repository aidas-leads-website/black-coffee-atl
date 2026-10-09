# Design

Oct 6, 2026 · @Jawad

## Concept: Side A, Side B

A cup of black coffee seen from above is a vinyl record. That one image is the site: the coffee turns into a record, the record plays the menu as a tracklist, then flips to Side B for the culture.

The idea comes from the shop, not from a trend:

- **The tagline already has two sides.** "Come for the coffee" is Side A. "Stay for the culture" is Side B.
- **The menu already reads like a tracklist.** Dear Mama, Remember the Thyme, You Bring Me Joy, The Blueprint and Three Little Birds read as nods to hip-hop, R&B and soul.
- **The room already has a soundtrack.** The shop describes a hand-picked hip-hop and R&B playlist, and its own copy talks in song titles.
- **The name is the object.** Black coffee, black vinyl.

Three rules keep it from becoming a gimmick:

1. **One thing moves.** The record is the only 3D object and the only continuous motion. Text stays still and readable.
2. **Scroll is the turntable.** Scrolling turns the record, moves the needle and flips the side. Stop scrolling and it settles.
3. **Nothing depends on it.** Every scene is ordinary HTML underneath. The record can be switched off and the page loses nothing but the show.

The site is silent by default and uses no licensed music or album artwork.

## Visual system

Two sides, two grounds: Side A is dark like the drink, Side B is white-painted brick like the storefront. This is a proposal to check against the client's logo and any existing brand colours.

| Name | Hex | Role | Taken from |
| --- | --- | --- | --- |
| Brew | #1A0F0A | Side A background, text on light | Black coffee is a very dark brown, not neutral black |
| Crema | #B98A4E | Rim light on the liquid, thin rules on Side A | The ring at the edge of a cup |
| Brick white | #F2F3F0 | Side B background, text on dark | The white brick storefront |
| Mortar | #C9CCC6 | Dividers, groove lines on Side B | The joints between bricks |
| Matcha | #7A9B3B | The matcha scene only | Whisked ceremonial matcha |
| Stair stripe | Six colours, to sample from a photo | A thin stepped band used once per page, and the Private hire scene | The rainbow-painted steps at the entrance |

The stair stripe is the only multi-colour element. It works as wayfinding from the real entrance and signals who the space welcomes without a badge. All text pairs must pass 4.5:1 contrast; Crema and Matcha are for shapes, not body text.

### Type

| Family | Used for | Why |
| --- | --- | --- |
| Archivo, variable width and weight | Headlines, navigation, body, facts | One family from condensed-heavy to wide-light. Headline width can track scroll, so the type behaves like a record spinning up |
| Bodoni Moda Italic | Drink names and pull quotes only | The high-contrast italic of 1990s R&B sleeves. It turns the menu into a tracklist |

Both are open-licence and self-hosted as subsetted WOFF2. Body text sets at 17 to 18 px with lines under 75 characters, left-aligned throughout. Sentence case everywhere.

### Imagery

- **Drinks shot from directly above**, on a dark surface, so every cup echoes the record.
- **The art wall shot straight-on**, evenly lit, like a gallery record.
- **People in the room, not posed.** No stock photography.
- **No illustration style on top.** The record and the stair stripe are the only graphic devices.

## The 3D piece

One object, four states: a ceramic cup of black coffee whose surface becomes a record, with a tonearm that tracks the menu and a flip at the halfway point. It is small enough to build in code, with no modelling software needed for a first version.

| Part | How it is built | Behaviour |
| --- | --- | --- |
| Cup | A lathed profile, glazed ceramic material | Seen at three-quarter view on arrival, then from directly above |
| Coffee surface | A disc with a custom shader | Liquid ripple settles into record grooves as the camera rises. Colour shifts per drink: honey for Marleaux, My Love, lavender for Lavender & Chill, green for matcha |
| Label | A small textured disc at the centre | Carries the logo on Side A and the stair stripe on Side B |
| Tonearm | Three simple shapes | Swings in at the tracklist, moves inward one track at a time, lifts at the end |
| Steam | Two or three soft sprites | Hero only, fades as the cup becomes a record |

How it responds:

- **Scroll position** sets the camera, the needle and the side.
- **Scroll speed** adds spin on top of the idle rotation, so a fast flick feels like a scratch.
- **Idle**, the record turns at 33⅓ rpm, one turn every 1.8 seconds. A pause control stops it.
- **Pointer** on desktop tilts the disc a few degrees toward the cursor. Nothing on touch.
- **Tapping a drink** in the tracklist drops the needle on that track and recolours the label.

Lighting is one key light and a small baked environment map, with a painted contact shadow instead of real-time shadows. The proposed ceiling is 20,000 triangles and two textures, which keeps it inside requirement P6.

## Scroll storyboard

The home page is nine scenes over about 14 screens of scroll on desktop, shortened to about 10 on a phone. Each scene has one move, and every scene's text is in the page before any script runs.

| Scene | Length | What the visitor reads | What the record does | Other motion | Technique |
| --- | --- | --- | --- | --- | --- |
| 1. Arrival | 1 screen | "Come for the coffee." Open status, address, Order button | Cup at three-quarter view, steam rising, slow turn | Headline widens from condensed to regular, once, on load | CSS, variable font axis |
| 2. The drop | 1.5 screens, pinned | The identity statement | Camera rises to directly above. Ripples settle into grooves | None | Pinned and scrubbed timeline |
| 3. Side A | 3 screens, pinned | Six signature drinks, one at a time: name, what is in it, price | Tonearm swings in. Needle steps inward per drink. Label takes the drink's colour | Drink name swaps with a short wipe | Pinned and scrubbed timeline |
| 4. Matcha | 1.5 screens | Matcha drinks and the ceremonial-grade note | Liquid whisks from brown to green in a spiral | None | Shader value driven by scroll |
| 5. The flip | 1 screen, pinned | "Stay for the culture." | Record lifts, turns over, lands as Side B | Page ground changes from Brew to Brick white along the edge of the turning disc | Scrubbed timeline, clip-path wipe |
| 6. The wall | 2 screens, sideways | Current show: works, artist, dates | Shrinks to a corner badge and keeps turning | Framed works travel sideways as the page scrolls down | Pinned horizontal track |
| 7. The room | 1.5 screens | Private hire: uses, capacity, "Ask about a date" | Stays in the corner | The stair stripe rises one step at a time | CSS scroll-driven, with fallback |
| 8. Liner notes | 1.5 screens | Three dated stops: pop-up, Castleberry Hill 2021, The Vivian 2023 | Stays in the corner | One line draws itself between the stops | SVG stroke driven by scroll |
| 9. Last groove | 1 screen | Hours, address, map, parking, three buttons | Returns to centre. Needle lifts. Camera pulls back to the cup | None | Scrubbed timeline |

Nobody is made to sit through it. The Order, Directions and Call buttons stay in reach the whole way, and a "Skip to hours and menu" link is the first focusable element on the page.

## Motion system

Text stays put, the record moves, and everything else moves only in answer to the visitor. Three kinds of motion cover the whole site.

| Kind | Where it is used | Rule |
| --- | --- | --- |
| Tied to scroll | The record, the flip, the wall, the stair stripe, the route line | No fixed duration. Position follows the scroll with about half a second of catch-up, so it never jerks |
| Plays once | Headline width on load, drink-name wipe | 600 ms, one time. Never replays when scrolling back |
| Answers an action | Buttons, form, drink taps, menu filter | 150 ms for a press, 300 ms for a change of state |

| Setting | Value |
| --- | --- |
| Interface easing | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Scroll catch-up | 0.5 s |
| Furthest any text travels | 24 px |
| Idle rotation | 33⅓ rpm |
| The flip | 180 degrees across one screen of scroll |

### Small interactions

| Element | What happens |
| --- | --- |
| Open status | A dot pulses once on load, then holds. The words "Open until 8 PM" or "Closed, opens 8 AM" sit beside it, so colour is never the only signal |
| Header record | A small flat record in the header. Its needle position shows how far down the page you are. On inner pages it is the link home |
| Drink row | Hover or focus underlines the name. A tap drops the needle on that track and recolours the label |
| Order button | On press, the coffee level in the cup dips as if sipped. Home only |
| Copy address | The button reads "Address copied" for two seconds |
| Inquiry form | The button reads "Sending", then "Inquiry sent", and repeats back the date the visitor chose |
| Page change | The header record carries across pages as a shared element where the browser supports view transitions. Elsewhere, a normal page load |
| Motion switch | A "Motion: on" and "Motion: off" control in the footer. The choice is remembered |

### Left out on purpose

- Fade-and-slide entrances on every block
- Parallax on text
- A custom cursor
- A smooth-scroll library that overrides native scrolling
- A loading screen. The poster image shows at once and the 3D arrives over it
- Sound that starts by itself

## Layout, responsive behaviour and fallbacks

The layout is a record half out of its sleeve: the text column is the sleeve, and the record shows beside it on desktop and above it on a phone. Three levels of experience share the same HTML, so no visitor gets a broken page.

&#91;embedded content: layout · desktop and phone\]

The sleeve changes from Brew to Brick white at the flip. The record never covers text at any width.

| Screen width | Layout | Scenes |
| --- | --- | --- |
| 1024 px and wider | Sleeve takes the left 55%. Record pinned on the right, half hidden behind the sleeve | All nine, pinned as in the storyboard |
| 600 to 1023 px | Sleeve full width. Record above, 40% of the screen height | All nine, pins shortened by a third |
| Under 600 px | Half-disc at the top edge, sleeve below, action bar fixed at the bottom | All nine. The wall becomes a native swipe row instead of a pinned track |

| Level | Who gets it | What they see |
| --- | --- | --- |
| Full | Devices that pass a quick capability check, with motion allowed and data-saver off | The 3D record and every scrubbed scene |
| Light | Older or low-memory phones, data-saver on, or any device whose frame rate stays under 30 for two seconds | A flat record drawn in SVG and turned by CSS. Same scenes, no shader effects, shorter pins |
| Still | Reduced motion set, motion switched off, scripts blocked or failed | One poster image per scene, sections in normal page flow, every word and link present |

A device can step down from Full to Light mid-visit without a reload, and never steps back up in the same visit. The five inner pages use the Light level's header record and nothing more.

## Assets to produce or collect

Fifteen assets, six of which need the client or a photo shoot. Photography is the long pole: the design leans on top-down drink shots and straight-on photos of the art.

| Asset | Specification | Who provides it |
| --- | --- | --- |
| Logo | SVG, one-colour and full versions | Client |
| Stair colours | Six hex values sampled from a straight-on photo of the entrance steps | Client photo, then me |
| Drink photos | Shot from directly above on a dark surface. Eight signature drinks at minimum, 1600 px wide | Photo shoot |
| Art wall photos | Each work straight-on plus one wide shot, with title, artist and show dates | Client or curator |
| Room and exterior | Storefront with the stairs, interior wide, patio, the room set for an event. Six to ten images | Photo shoot |
| Portraits | Owner and team. Optional | Photo shoot |
| Cup and record model | Built in code for the first version. A modelled GLB under 1.5 MB is an optional upgrade | Me, or a 3D artist |
| Label texture | 512 px square. Logo on Side A, stair stripe on Side B | Me, from the logo |
| Environment map | 256 px, baked | Me |
| Poster images | One per scene, nine in total, AVIF. The first under 150 KB | Rendered from the 3D scene |
| Flat record | SVG, for the Light level and the header | Me |
| Fonts | Archivo variable and Bodoni Moda Italic, subsetted WOFF2 | Open licence |
| Social share image | 1200 by 630 px, the record on Brew | Me |
| Favicon | The record, as SVG and a 180 px PNG | Me |
| Copy | Identity statement, 20-plus FAQ answers, a line per signature drink, private hire details | Me to draft, client to confirm |

## Build approach and guardrails

Build from the plainest version up, so there is a complete, shippable site at every stage and the fallback is never an afterthought.

1. **Facts and copy.** The client resolves the seven conflicts on the Data tab. Copy is written against the confirmed facts.
2. **Still.** All six pages as static HTML with structured data, redirects and the inquiry form. This version could launch as it stands, and it remains the fallback for good. Core Web Vitals are measured here as the baseline.
3. **Light.** The flat record, the header record, the stair stripe, the route line and the CSS reveals.
4. **Full.** The 3D record and the pinned scenes on Home.
5. **Device testing.** A mid-range Android phone, an older iPhone, desktop Firefox, keyboard only, a screen reader, and reduced motion.
6. **Launch.** Redirects go live, the sitemap is submitted, listings are corrected the same day, and the monthly prompt log starts.

| Guardrail | How it is enforced |
| --- | --- |
| Same words at every level | An automated check compares the text of the Still and Full versions of each page. Any difference fails the build |
| Weight budgets | The build fails if script or image budgets in the Requirements tab are exceeded |
| No text in the canvas | Reviewed on every change to the 3D layer |
| One switch turns the 3D off | A single site setting drops everyone to Light without touching content |
| Visitors stay in control | The footer motion switch and the pause control are tested on every release |
| Evidence after launch | At 30 days, review field speed data, button taps and how far people scroll. If most leave before scene 6, shorten the pinned scenes |
