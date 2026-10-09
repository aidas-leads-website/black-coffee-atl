import { business } from '@/lib/site'
import { menu, describe, priceLabel, slugify } from '@/lib/menu'
import { pageGraph, menuNode, url } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { PageHead } from '@/components/PageHead'
import { StairStripe } from '@/components/StairStripe'

const path = '/menu'
const title = 'Menu: signature lattes, matcha and food | Black Coffee ATL'
const description =
  'The full Black Coffee ATL menu with prices: signature lattes like Marleaux, My Love, ceremonial-grade matcha, espresso, tea and food in Capitol View.'
const summary =
  'Black Coffee ATL serves specialty espresso from Devoción, Onyx and Counter Culture, ceremonial-grade matcha and house-made signature lattes such as Marleaux, My Love and Dear Mama, plus tea, caffeine-free drinks and food. Signature drinks cost $7.00 to $8.50. Order ahead on Square or at the counter in Capitol View.'
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path },
]

export const metadata = pageMetadata({ title, description, path })

export default function MenuPage() {
  const graph = pageGraph({
    path,
    title,
    description,
    crumbs,
    type: 'WebPage',
    pageExtra: { mainEntity: { '@id': `${url(path)}#menu` }, dateModified: menu.updated },
    extra: [menuNode()],
  })

  return (
    <main className="page" id="main">
      <JsonLd data={graph} />
      <PageHead crumbs={crumbs} title="The menu" summary={summary}>
        <div className="btns">
          <a className="btn primary" href={business.orderUrl} target="_blank" rel="noopener" data-track="order">
            Order ahead on Square
          </a>
        </div>
        <nav aria-label="Menu sections">
          <ul className="jump">
            {menu.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.name}</a>
              </li>
            ))}
            <li>
              <a href="#options">Milk, syrups and allergens</a>
            </li>
          </ul>
        </nav>
      </PageHead>

      {menu.sections.map((s) => (
        <section className="menu-sec" id={s.id} key={s.id} aria-labelledby={`h-${s.id}`}>
          <h2 id={`h-${s.id}`}>{s.name}</h2>
          <p className="soft">{s.intro}</p>
          <ul className="items">
            {s.items.map((item) => {
              const id = slugify(item.name)
              const out = item.available === false
              return (
                <li className={`item${out ? ' out' : ''}`} id={id} key={id}>
                  <div className="item-top">
                    <h3>
                      <a href={`#${id}`}>
                        {item.color ? <i className="sw" style={{ ['--c' as string]: item.color }} aria-hidden="true" /> : null}
                        {item.name}
                      </a>
                    </h3>
                    <span className="price">{priceLabel(item)}</span>
                  </div>
                  <p>{describe(item, s)}</p>
                  {item.namedFor ? <p className="small">Named for {item.namedFor}.</p> : null}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <section className="section" id="options" aria-labelledby="h-options">
        <h2 id="h-options">Milk, syrups and allergens</h2>
        <div className="notes-grid">
          <div>
            <h3>Milk</h3>
            <p>{menu.options.milk}</p>
          </div>
          <div>
            <h3>Syrups and sizes</h3>
            <p>{menu.options.syrups}</p>
            <p className="soft small">{menu.options.sizes}</p>
          </div>
          <div>
            <h3>Allergens</h3>
            <p>{menu.allergens}</p>
          </div>
        </div>
        <StairStripe />
      </section>
    </main>
  )
}
