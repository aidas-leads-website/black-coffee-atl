import Link from 'next/link'
import { business, fullAddress, directionsUrl, privateHire, timeline } from '@/lib/site'
import { sideA, matchaPours, describe, priceLabel, slugify } from '@/lib/menu'
import { pageGraph, eventNodes, events } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { Facts } from '@/components/Facts'
import { CopyAddress } from '@/components/CopyAddress'
import { STAIRS } from '@/components/StairStripe'
import { HomeExperience } from '@/components/home/HomeExperience'
import art from '@/data/art.json'
import './home.css'

const title = 'Black Coffee ATL | Coffee shop on the Atlanta BeltLine'
const description =
  'Black-owned specialty coffee shop and event space inside The Vivian, 1246 Allene Ave SW, on the BeltLine Westside extension in Capitol View, Atlanta.'

export const metadata = pageMetadata({ title, description, path: '/' })

// Rebuilt daily so "Coming up" drops events once they have passed.
export const revalidate = 86400

type Show = { title: string; artist: string; artistUrl?: string; start: string; end: string; statement?: string }
const show = (art as { currentShow: Show | null }).currentShow

function fmtDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
}

/** Decorative frames for the wall until photographs of the current show are supplied. */
const FRAMES = [
  <svg key="1" className="art" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="80" height="100" fill="#1A0F0A" /><circle cx="44" cy="46" r="30" fill="#B98A4E" /><circle cx="36" cy="54" r="18" fill="#0a0a0a" /><circle cx="36" cy="54" r="5" fill="#F2F3F0" /></svg>,
  <svg key="2" className="art" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="80" height="100" fill="#F2F3F0" />{STAIRS.map((c, i) => <rect key={c} y={70 - i * 10} x={i * 12} width={80 - i * 12} height="8" fill={c} />)}</svg>,
  <svg key="3" className="art" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="80" height="100" fill="#DDE5C8" /><g fill="none" stroke="#7A9B3B" strokeWidth="7"><path d="M-5 80A45 45 0 0 1 85 80" /><path d="M5 95A35 35 0 0 1 75 95" /><path d="M-10 60A50 50 0 0 1 90 60" /></g><circle cx="58" cy="24" r="9" fill="#1A0F0A" /></svg>,
  <svg key="4" className="art" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="80" height="100" fill="#B98A4E" /><path d="M0 100L80 0V100z" fill="#1A0F0A" /><circle cx="24" cy="28" r="12" fill="#F2F3F0" /></svg>,
  <svg key="5" className="art" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="80" height="100" fill="#F2F3F0" /><g fill="#1A0F0A"><circle cx="16" cy="20" r="6" /><circle cx="40" cy="20" r="6" /><circle cx="64" cy="20" r="6" /><circle cx="16" cy="50" r="6" /><circle cx="64" cy="50" r="6" /><circle cx="16" cy="80" r="6" /><circle cx="40" cy="80" r="6" /><circle cx="64" cy="80" r="6" /></g><circle cx="40" cy="50" r="6" fill="#D8443C" /></svg>,
]

export default function Home() {
  const upcoming = events.filter((e) => e.start >= new Date().toISOString().slice(0, 10))
  const graph = pageGraph({
    path: '/',
    title,
    description,
    crumbs: [{ name: 'Home', path: '/' }],
    extra: eventNodes(),
  })

  return (
    <main className="home" id="main">
      <JsonLd data={graph} />

      {/* Fixed layers: ground (the Side B wipe), the record stage, the sleeve. Decoration only. */}
      <div className="ground" aria-hidden="true" />
      <div className="sleeve" aria-hidden="true" />
      <div className="stage" aria-hidden="true">
        <div className="stage-inner">
          <svg className="poster" viewBox="0 0 400 400" focusable="false">
            <circle cx="200" cy="200" r="160" fill="#0a0a0a" />
            <g fill="none" stroke="#262626" strokeWidth="1">
              {[152, 140, 128, 116, 104, 92, 80, 68].map((r) => (
                <circle key={r} cx="200" cy="200" r={r} />
              ))}
            </g>
            <g className="la">
              <circle cx="200" cy="200" r="54" fill="#B98A4E" />
              <text x="200" y="186" textAnchor="middle" fontFamily="Archivo,Arial,sans-serif" fontWeight="800" fontSize="9" textLength="86" lengthAdjust="spacingAndGlyphs" fill="#1A0F0A">BLACK COFFEE ATL</text>
              <text x="200" y="226" textAnchor="middle" fontFamily="Archivo,Arial,sans-serif" fontWeight="700" fontSize="9" fill="#1A0F0A">SIDE A</text>
            </g>
            <g className="lb">
              <circle cx="200" cy="200" r="54" fill="#F2F3F0" />
              {STAIRS.map((c, i) => (
                <rect key={c} x={170 + i * 10} y={212 - i * 6} width="10" height={6 + i * 6} fill={c} />
              ))}
              <text x="200" y="236" textAnchor="middle" fontFamily="Archivo,Arial,sans-serif" fontWeight="700" fontSize="9" fill="#1A0F0A">SIDE B</text>
            </g>
            <circle cx="200" cy="200" r="4" fill="#1A0F0A" />
          </svg>
          <canvas id="gl" />
        </div>
      </div>
      <button className="btn small-btn pause" type="button" id="pauseBtn" aria-pressed="false" hidden>
        Pause the record
      </button>

      {/* 1. Arrival */}
      <section className="scene" id="arrival" data-scene aria-labelledby="h-arrival">
        <div className="col">
          <h1 id="h-arrival">
            <span className="kicker">{business.name}</span>
            <span>Come for</span>
            <span>the coffee.</span>
          </h1>
          <p className="lede">
            Black Coffee ATL pours specialty espresso, ceremonial-grade matcha and house-made signature lattes inside The Vivian, on
            the Atlanta BeltLine&apos;s Westside extension in Capitol View. Order ahead, sit with your laptop, look at the art on the
            wall, or hire the whole room for your event.
          </p>
          <p className="where">
            <a href={directionsUrl} target="_blank" rel="noopener" data-track="directions">
              {fullAddress}
            </a>
          </p>
          <div className="btns">
            <a className="btn primary" data-order="" data-track="order" href={business.orderUrl} target="_blank" rel="noopener">
              Order ahead
            </a>
            <Link className="btn" href="/menu">
              See the menu
            </Link>
          </div>
          <p className="cue">
            <a href="#visit">Skip to hours and address</a>
            <span className="cue-motion"> or scroll to drop the needle.</span>
          </p>
        </div>
      </section>

      {/* 2. The drop: the identity statement, verbatim (G2) */}
      <section className="scene" id="drop" data-scene aria-labelledby="h-drop">
        <div className="hold col">
          <h2 id="h-drop">A coffee shop with a soundtrack</h2>
          <p className="lede">{business.identity}</p>
          <p className="body soft">
            The beans come from Devoción, Onyx and Counter Culture, pulled as espresso, batch brew and pour-over. The art on the walls is
            by Atlanta artists. The playlist is hip-hop and R&amp;B, picked by hand.
          </p>
        </div>
      </section>

      {/* 3. Side A: the tracklist */}
      <section className="scene" id="side-a" data-scene aria-labelledby="h-side-a">
        <div className="hold col">
          <h2 id="h-side-a">Side A: the coffee</h2>
          <p className="body">Six house lattes, each with its own colour on the label. Choose a track to drop the needle on it.</p>
          <ol className="tracks" id="tracks">
            {sideA.map(({ item, section }, i) => (
              <li key={item.name} style={{ ['--c' as string]: item.color }}>
                <button className="track" type="button" aria-describedby={`d-${slugify(item.name)}`}>
                  <span className="n">A{i + 1}</span>
                  <span className="name">
                    <i className="sw" />
                    {item.name}
                  </span>
                  <span className="price">{priceLabel(item)}</span>
                </button>
                <p className="detail" id={`d-${slugify(item.name)}`}>
                  <span>{describe(item, section)}</span>
                </p>
              </li>
            ))}
          </ol>
          <div className="dots" aria-hidden="true">
            {sideA.map((s) => (
              <span key={s.item.name} />
            ))}
          </div>
          <p className="small">
            <Link className="textlink" href="/menu">
              See the full menu
            </Link>
          </p>
        </div>
      </section>

      {/* 4. Matcha */}
      <section className="scene" id="matcha" data-scene aria-labelledby="h-matcha">
        <div className="hold col">
          <h2 id="h-matcha">Ceremonial-grade matcha</h2>
          <p className="body">Whisked to order and served with milk or lemonade. From $7.00.</p>
          <ul className="pours">
            {matchaPours.map((m) => (
              <li key={m.name}>
                <Link className="name" href={`/menu#${slugify(m.name)}`}>
                  {m.name}
                </Link>
                <span className="with">{m.flavor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. The flip */}
      <section className="scene" id="flip" data-scene aria-labelledby="h-flip">
        <div className="hold col">
          <h2 className="display" id="h-flip">
            <span>Stay for</span>
            <span>the culture.</span>
          </h2>
          <p className="lede">Side B. The walls, the room, and the people who built it.</p>
        </div>
      </section>

      {/* 6. The wall */}
      <section className="scene" id="wall" data-scene aria-labelledby="h-wall">
        <div className="hold">
          <div className="wide">
            <h2 id="h-wall">The wall</h2>
            {show ? (
              <p className="body">
                Now showing: <b>{show.title}</b> by{' '}
                {show.artistUrl ? (
                  <a href={show.artistUrl} target="_blank" rel="noopener">
                    {show.artist}
                  </a>
                ) : (
                  show.artist
                )}
                , {fmtDate(show.start)} to {fmtDate(show.end)}.
              </p>
            ) : (
              <p className="body">
                Black Coffee ATL hangs work by Atlanta artists, rotated through the year and curated in-house by {art.curator}. Artists can
                send a portfolio to <a href={`mailto:${art.submissions}`}>{art.submissions}</a>.
              </p>
            )}
          </div>
          <div className="track-x" aria-hidden="true">
            {FRAMES.map((f, i) => (
              <figure className="frame" key={i}>
                {f}
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7. The room */}
      <section className="scene" id="room" data-scene aria-labelledby="h-room">
        <div className="hold">
          <div>
            <h2 id="h-room">Hire the room</h2>
            <p className="lede">
              Black Coffee ATL opens for private events: {privateHire.uses.map((u) => u.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}.
            </p>
            <dl className="facts">
              <div>
                <dt>Where</dt>
                <dd>Up the painted stairs at The Vivian</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{privateHire.capacityStanding ? `Up to ${privateHire.capacityStanding} standing` : 'Ask about your layout'}</dd>
              </div>
              <div>
                <dt>Pricing</dt>
                <dd>{privateHire.startingPrice ?? 'Quoted per event'}</dd>
              </div>
            </dl>
            <div className="btns">
              <Link className="btn primary" href="/private-hire#inquire">
                Ask about a date
              </Link>
            </div>
          </div>
          <div className="stairs" aria-hidden="true">
            {STAIRS.map((c, i) => (
              <div key={c} className="step" style={{ ['--k' as string]: i + 1, ['--c' as string]: c }} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Liner notes */}
      <section className="scene" id="story" data-scene aria-labelledby="h-story">
        <div className="hold">
          <h2 id="h-story">Liner notes</h2>
          <p className="lede">Three addresses, one idea: a coffee shop built for Atlanta, by Atlanta.</p>
          <div className="route-x">
            <span className="route-line" aria-hidden="true" />
            <ol className="stops">
              {timeline.map((t) => (
                <li key={t.title}>
                  <p className="when">{t.when}</p>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="body after soft">
            The team helped plan and design The Vivian before building the cafe inside it.{' '}
            <Link className="textlink" href="/story">
              Read the story
            </Link>
          </p>
        </div>
      </section>

      {/* 9. Last groove: hours, address, facts (A1) */}
      <section className="scene" id="visit" data-scene aria-labelledby="h-visit">
        <div className="col">
          <h2 id="h-visit">Come by</h2>
          <p className="lede">Black Coffee ATL is inside The Vivian, on the BeltLine&apos;s Westside extension in Capitol View.</p>
          <Facts />
          {upcoming.length > 0 && (
            <div className="coming">
              <h3>Coming up</h3>
              <ul>
                {upcoming.slice(0, 3).map((e) => (
                  <li key={e.name + e.start}>
                    <b>{e.name}</b>, {fmtDate(e.start.slice(0, 10))}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="btns">
            <a className="btn primary" data-order="" data-track="order" href={business.orderUrl} target="_blank" rel="noopener">
              Order ahead
            </a>
            <a className="btn" href={directionsUrl} target="_blank" rel="noopener" data-track="directions">
              Get directions
            </a>
            <CopyAddress address={fullAddress} />
          </div>
          <p className="small soft more">
            <Link href="/visit">Parking, transit and access</Link> · <Link href="/faq">Questions and answers</Link>
          </p>
        </div>
      </section>

      <HomeExperience />
    </main>
  )
}
