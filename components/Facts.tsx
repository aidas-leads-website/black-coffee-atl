import { atAGlance } from '@/lib/site'

/** A1: the at-a-glance facts block, a definition list so assistants can lift each pair. */
export function Facts({ className = 'facts' }: { className?: string }) {
  return (
    <dl className={className}>
      {atAGlance.map((f) => (
        <div key={f.term}>
          <dt>{f.term}</dt>
          <dd>
            {f.href ? (
              <a
                href={f.href}
                {...(f.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                data-track={f.href.startsWith('tel:') ? 'call' : f.href.includes('google.com/maps') ? 'directions' : f.href.includes('square.site') ? 'order' : undefined}
              >
                {f.detail}
              </a>
            ) : (
              f.detail
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
