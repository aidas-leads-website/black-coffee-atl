import { business, fullAddress, directionsUrl, transitUrl, hoursSentence, FACTS_REVIEWED } from '@/lib/site'
import { pageGraph, ids } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PageHead } from '@/components/PageHead'
import { Facts } from '@/components/Facts'
import { MapCard } from '@/components/MapCard'
import { CopyAddress } from '@/components/CopyAddress'
import { StairStripe } from '@/components/StairStripe'

const path = '/visit'
const title = 'Hours, parking and directions | Black Coffee ATL'
const description =
  'Black Coffee ATL hours, address, validated parking, WiFi and directions from the BeltLine. Inside The Vivian, 1246 Allene Ave SW, Capitol View.'
const summary = `Black Coffee ATL is inside The Vivian at ${fullAddress}, on the BeltLine's Westside extension in Capitol View. It is open ${hoursSentence}. There is free WiFi and validated parking, and dogs and laptops are welcome.`
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Visit', path },
]

export const metadata = pageMetadata({ title, description, path })

export default function VisitPage() {
  const graph = pageGraph({
    path,
    title,
    description,
    crumbs,
    type: 'ContactPage',
    pageExtra: { mainEntity: { '@id': ids.shop }, dateModified: FACTS_REVIEWED },
  })

  return (
    <main className="page" id="main">
      <JsonLd data={graph} />
      <PageHead crumbs={crumbs} title="Visit" summary={summary}>
        <div className="btns">
          <a className="btn primary" href={directionsUrl} target="_blank" rel="noopener" data-track="directions">
            Get directions
          </a>
          <a className="btn" href={`tel:${business.phone.e164}`} data-track="call">
            Call {business.phone.display}
          </a>
          <CopyAddress address={fullAddress} />
        </div>
      </PageHead>

      <div className="split">
        <section aria-labelledby="h-glance">
          <h2 id="h-glance">At a glance</h2>
          <Facts />
        </section>
        <div>
          <MapCard />
          <StairStripe />
        </div>
      </div>

      <section className="section" aria-labelledby="h-faq">
        <h2 id="h-faq" className="sr-only">
          Getting here
        </h2>
        <div className="faq-list">
          <section className="qa" aria-labelledby="q-hours">
            <h3 id="q-hours">When is Black Coffee ATL open?</h3>
            <p>
              Black Coffee ATL is open {hoursSentence}.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-where">
            <h3 id="q-where">Where exactly is the shop?</h3>
            <p>
              Black Coffee ATL is inside The Vivian at 1246 Allene Ave SW, Atlanta, GA 30310, in Capitol View. Look for the white brick
              storefront and walk up the rainbow-painted stairs.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-parking">
            <h3 id="q-parking">Is there parking?</h3>
            <p>
              Yes. The Vivian gives Black Coffee ATL customers two hours of free parking. Ask at the counter to validate your parking before
              you leave.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-beltline">
            <h3 id="q-beltline">How do I get there from the BeltLine?</h3>
            <p>
              The Vivian sits on the Atlanta BeltLine&apos;s Westside extension in Capitol View, so you can walk or cycle to Black Coffee ATL
              from the trail. Head for 1246 Allene Ave SW and the white brick storefront with painted stairs.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-transit">
            <h3 id="q-transit">Can I get there by transit?</h3>
            <p>
              Yes. Plan a MARTA trip to 1246 Allene Ave SW with{' '}
              <a href={transitUrl} target="_blank" rel="noopener" data-track="directions">
                transit directions in Google Maps
              </a>
              , which shows the current bus and rail options from where you are.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-access">
            <h3 id="q-access">Is the entrance accessible?</h3>
            <p>
              The main entrance at The Vivian is up a flight of painted stairs. If you need step-free access, call Black Coffee ATL on{' '}
              <a href={`tel:${business.phone.e164}`} data-track="call">
                {business.phone.display}
              </a>{' '}
              before you visit and the team will tell you the best way in.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-wifi">
            <h3 id="q-wifi">Is there WiFi, and can I work there?</h3>
            <p>
              Yes. Black Coffee ATL has free WiFi and welcomes laptops. Remote workers and students use the shop as a workspace, and two hours
              of validated parking covers a solid session.
            </p>
          </section>
          <section className="qa" aria-labelledby="q-dogs">
            <h3 id="q-dogs">Can I bring my dog?</h3>
            <p>Yes. Black Coffee ATL is dog-friendly.</p>
          </section>
          <section className="qa" aria-labelledby="q-order">
            <h3 id="q-order">Can I order ahead?</h3>
            <p>
              Yes. Order on{' '}
              <a href={business.orderUrl} target="_blank" rel="noopener" data-track="order">
                the Black Coffee ATL Square site
              </a>{' '}
              and pick up at the counter.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
