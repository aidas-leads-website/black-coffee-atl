import Link from 'next/link'
import { business, timeline, press } from '@/lib/site'
import { pageGraph, historyNode, ids } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PageHead } from '@/components/PageHead'
import { StairStripe } from '@/components/StairStripe'
import art from '@/data/art.json'

const path = '/story'
const title = 'Our story: from pop-up to the BeltLine | Black Coffee ATL'
const description =
  'How Black Coffee ATL went from pop-up to Castleberry Hill in 2021 to The Vivian on the Atlanta BeltLine in 2023, with founder Carl Northrop.'
const summary =
  'Black Coffee ATL began as a pop-up, opened its first shop in Castleberry Hill in December 2021 and moved to The Vivian on the Atlanta BeltLine in October 2023. Founder Carl Northrop built it around one idea, come for the coffee and stay for the culture, from Atlanta art on the walls to the playlist.'
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Story', path },
]

export const metadata = pageMetadata({ title, description, path })

function pressDate(d: string) {
  const [y, m, day] = d.split('-')
  if (!m) return y
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(day || 1)))
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', ...(day ? { day: 'numeric' } : {}), timeZone: 'UTC' })
}

export default function StoryPage() {
  const graph = pageGraph({
    path,
    title,
    description,
    crumbs,
    type: 'AboutPage',
    pageExtra: { mainEntity: { '@id': ids.shop } },
    extra: [
      historyNode(),
      ...press.map((p) => ({
        '@type': 'NewsArticle',
        headline: p.title,
        url: p.url,
        datePublished: p.date,
        publisher: { '@type': 'Organization', name: p.outlet },
        about: { '@id': ids.shop },
      })),
    ],
  })

  return (
    <main className="page" id="main">
      <JsonLd data={graph} />
      <PageHead crumbs={crumbs} title="Liner notes" summary={summary} />

      <section className="section" aria-labelledby="h-who">
        <h2 id="h-who">Who we are</h2>
        {/* G2: the identity statement, verbatim */}
        <p className="identity">{business.identity}</p>
        <p className="prose" style={{ marginTop: '1.5rem' }}>
          The line on the door is the whole plan: <b>{business.tagline}</b> Side A is the coffee: espresso from Devoción, Onyx and Counter
          Culture, ceremonial-grade matcha and signature lattes built on house-made syrups. Side B is the culture: Atlanta art, a hand-picked
          hip-hop and R&amp;B playlist, and a room that people hire for their own events.
        </p>
      </section>

      <section className="section" aria-labelledby="h-route">
        <h2 id="h-route">Three addresses</h2>
        <ol className="route">
          {timeline.map((t) => (
            <li key={t.title}>
              <p className="when">{t.isoDate ? <time dateTime={t.isoDate}>{t.when}</time> : t.when}</p>
              <h3>{t.title}</h3>
              <p className="prose">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="split section">
        <section aria-labelledby="h-carl">
          <h2 id="h-carl">Carl Northrop, founder</h2>
          <p className="prose">
            Carl Northrop founded Black Coffee ATL and owns it. He took the business from a pop-up to its first storefront at 131 Walker St
            SW, then to The Vivian when the Castleberry Hill lease ended in 2023.
          </p>
        </section>
        <section aria-labelledby="h-vivian">
          <h2 id="h-vivian">Helping shape The Vivian</h2>
          <p className="prose">
            Before building the cafe, the Black Coffee ATL team helped plan and design The Vivian, the building on Allene Ave SW that the
            shop now calls home. The move brought a patio, easier parking and a place on the BeltLine&apos;s Westside extension.
          </p>
        </section>
      </div>

      <section className="section" aria-labelledby="h-art">
        <h2 id="h-art">The art wall</h2>
        <p className="prose">
          The walls at Black Coffee ATL carry rotating work by Atlanta artists, curated in-house by {art.curator}, the shop&apos;s curator
          and strategic partner. Artists can send a portfolio to{' '}
          <a href={`mailto:${art.submissions}`}>{art.submissions}</a>.
        </p>
        <StairStripe />
      </section>

      <section className="section" aria-labelledby="h-press">
        <h2 id="h-press">In the press</h2>
        <ul className="press">
          {press.map((p) => (
            <li key={p.url}>
              <a href={p.url} target="_blank" rel="noopener">
                {p.title}
              </a>
              <br />
              <span className="soft small">
                {p.outlet}, <time dateTime={p.date}>{pressDate(p.date)}</time>
              </span>
            </li>
          ))}
        </ul>
        {business.confirmedNoLinkToBlackCoffeeCompany ? (
          <p className="prose small soft" style={{ marginTop: '1.5rem' }}>
            Black Coffee ATL is not connected to The Black Coffee Company, also known as Black Coffee Atlanta, which is a separate business.
          </p>
        ) : null}
        <p className="prose" style={{ marginTop: '1.5rem' }}>
          <Link className="textlink" href="/visit">
            Come by
          </Link>{' '}
          or{' '}
          <Link className="textlink" href="/private-hire">
            hire the room
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
