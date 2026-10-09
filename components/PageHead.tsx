import type { Crumb } from '@/lib/schema'
import { Breadcrumbs } from './Breadcrumbs'

/** Breadcrumbs, the page's one h1, and its 40 to 60 word plain summary (Content requirements). */
export function PageHead({ crumbs, title, summary, children }: { crumbs: Crumb[]; title: string; summary: string; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <Breadcrumbs crumbs={crumbs} />
      <h1>{title}</h1>
      <p className="lede summary">{summary}</p>
      {children}
    </header>
  )
}
