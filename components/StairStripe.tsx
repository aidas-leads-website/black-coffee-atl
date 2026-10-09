/** The six-colour stepped band from the rainbow stairs at the entrance. Used once per page. */
export const STAIRS = ['#D8443C', '#E8873A', '#EBC245', '#5E9B4C', '#3F78C2', '#7E57B5']

export function StairStripe({ className = 'stripe' }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {STAIRS.map((c, i) => (
        <span key={c} style={{ ['--c' as string]: c, ['--k' as string]: i + 1 }} />
      ))}
    </div>
  )
}
