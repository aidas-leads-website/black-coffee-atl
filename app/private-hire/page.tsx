import Link from 'next/link'
import { business, privateHire, hoursText } from '@/lib/site'
import { pageGraph, url, ids } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PageHead } from '@/components/PageHead'
import { StairStripe } from '@/components/StairStripe'
import { InquiryForm } from './InquiryForm'

const path = '/private-hire'
const title = 'Private hire and event space | Black Coffee ATL'
const description =
  'Hire Black Coffee ATL inside The Vivian on the Westside BeltLine for pop-ups, listening parties, brand activations and community gatherings.'
const summary =
  "Black Coffee ATL hires out its coffee shop inside The Vivian, on the Atlanta BeltLine's Westside extension in Capitol View, for pop-ups, listening parties, brand activations and community gatherings. The room comes with rotating Atlanta art on the walls and a coffee bar. Send your date, guest count and event type for availability and a quote."
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Private hire', path },
]

export const metadata = pageMetadata({ title, description, path })

const usesList = privateHire.uses.map((u) => u.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')

export default function PrivateHirePage() {
  const graph = pageGraph({
    path,
    title,
    description,
    crumbs,
    extra: [
      {
        '@type': 'Service',
        '@id': `${url(path)}#service`,
        name: 'Private hire at Black Coffee ATL',
        serviceType: 'Event venue hire',
        description: summary,
        provider: { '@id': ids.shop },
        areaServed: { '@type': 'City', name: 'Atlanta' },
        availableChannel: { '@type': 'ServiceChannel', serviceUrl: `${url(path)}#inquire` },
      },
    ],
  })

  return (
    <main className="page" id="main">
      <JsonLd data={graph} />
      <PageHead crumbs={crumbs} title="Hire the room" summary={summary}>
        <div className="btns">
          <a className="btn primary" href="#inquire">
            Ask about a date
          </a>
          <a className="btn" href={`tel:${business.phone.e164}`} data-track="call">
            Call {business.phone.display}
          </a>
        </div>
      </PageHead>

      <div className="split">
        <div>
          <section className="qa" aria-labelledby="q-what">
            <h2 id="q-what">What can you host at Black Coffee ATL?</h2>
            <p>
              Black Coffee ATL hosts {usesList} in its shop inside The Vivian at 1246 Allene Ave SW. The space suits events that want a
              room with character: Atlanta art on the walls, a coffee bar, and the BeltLine&apos;s Westside extension outside.
            </p>
          </section>

          <section className="qa" aria-labelledby="q-capacity">
            <h2 id="q-capacity">How many guests does the space hold?</h2>
            {privateHire.capacitySeated || privateHire.capacityStanding ? (
              <p>
                The shop holds
                {privateHire.capacitySeated ? ` up to ${privateHire.capacitySeated} guests seated` : ''}
                {privateHire.capacitySeated && privateHire.capacityStanding ? ' and' : ''}
                {privateHire.capacityStanding ? ` up to ${privateHire.capacityStanding} standing` : ''}.
              </p>
            ) : (
              <p>
                Capacity depends on the layout you need, seated or standing. Put your guest count in the form and the team will confirm
                what fits.
              </p>
            )}
          </section>

          <section className="qa" aria-labelledby="q-when">
            <h2 id="q-when">When is the space available?</h2>
            {privateHire.availability ? (
              <p>{privateHire.availability}</p>
            ) : (
              <p>
                The team confirms availability date by date. Tell us the date and the times you have in mind. For reference, the shop&apos;s
                opening hours are: {hoursText}.
              </p>
            )}
          </section>

          <section className="qa" aria-labelledby="q-included">
            <h2 id="q-included">What is included?</h2>
            {privateHire.included ? (
              <ul className="ticks">
                {privateHire.included.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : (
              <p>
                Every booking is shaped around the event. Say what you need, such as drinks service, layout or sound, and the quote is built
                around it.
              </p>
            )}
          </section>

          <section className="qa" aria-labelledby="q-price">
            <h2 id="q-price">How much does private hire cost?</h2>
            <p>
              {privateHire.startingPrice
                ? `Private hire starts at ${privateHire.startingPrice}.`
                : 'Every event is quoted on its own, based on the date, how long you need the room, guest count and drinks service.'}{' '}
              The team replies to each inquiry with availability and a price.
            </p>
          </section>

          <section className="qa" aria-labelledby="q-where">
            <h2 id="q-where">Where is it, and is there parking?</h2>
            <p>
              Black Coffee ATL is up the rainbow-painted stairs at The Vivian, 1246 Allene Ave SW, Atlanta, GA 30310, in Capitol View.
              The Vivian offers two hours of free validated parking. <Link href="/visit">Directions and access</Link>.
            </p>
          </section>
        </div>

        <aside aria-label="The stair stripe">
          <StairStripe className="stripe big" />
        </aside>
      </div>

      <section className="section" id="inquire" aria-labelledby="q-book">
        <h2 id="q-book">How do I book Black Coffee ATL?</h2>
        <p className="prose">
          Send the form below with your date, guest count and type of event, and the team replies by email. You can also write to{' '}
          <a href={`mailto:${business.email}?subject=Private%20hire%20inquiry`}>{business.email}</a>.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <InquiryForm />
        </div>
      </section>
    </main>
  )
}
