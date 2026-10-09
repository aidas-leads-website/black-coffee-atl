import Link from 'next/link'
import { faqGroups, faqId } from '@/lib/faq'
import { pageGraph, faqNode, url } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PageHead } from '@/components/PageHead'
import { StairStripe } from '@/components/StairStripe'

const path = '/faq'
const title = 'Questions and answers | Black Coffee ATL'
const description =
  'Answers about Black Coffee ATL in Capitol View: hours, parking, WiFi, dogs, matcha, non-dairy milk, ordering ahead, private hire and the art wall.'
const summary =
  "Short, direct answers to the questions people ask most about Black Coffee ATL, the Black-owned coffee shop and event space inside The Vivian on the Atlanta BeltLine's Westside extension in Capitol View: hours, parking, WiFi, dogs, the menu, ordering ahead, private hire and showing art on the wall."
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'FAQ', path },
]

export const metadata = pageMetadata({ title, description, path })

export default function FaqPage() {
  const graph = pageGraph({
    path,
    title,
    description,
    crumbs,
    pageExtra: { mainEntity: { '@id': `${url(path)}#faq` } },
    extra: [faqNode(path)],
  })

  return (
    <main className="page" id="main">
      <JsonLd data={graph} />
      <PageHead crumbs={crumbs} title="Questions and answers" summary={summary}>
        <nav aria-label="Question groups">
          <ul className="jump">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>{g.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHead>

      {faqGroups.map((g) => (
        <section className="faq-group" id={g.id} key={g.id} aria-labelledby={`h-${g.id}`}>
          <h2 id={`h-${g.id}`}>{g.name}</h2>
          <div className="faq-list">
            {g.items.map((f) => (
              <section className="qa" id={faqId(f.q)} key={f.q} aria-labelledby={`q-${faqId(f.q)}`}>
                <h3 id={`q-${faqId(f.q)}`}>{f.q}</h3>
                <p>{f.a}</p>
              </section>
            ))}
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="h-more">
        <h2 id="h-more">Still have a question?</h2>
        <p className="prose">
          For anything else, see <Link href="/visit">Visit</Link> for directions and access, the{' '}
          <Link href="/menu">menu</Link> for every drink and price, or email{' '}
          <a href="mailto:westside@blackcoffeeatl.com">westside@blackcoffeeatl.com</a>.
        </p>
        <StairStripe />
      </section>
    </main>
  )
}
