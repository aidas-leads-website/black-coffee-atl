import { ImageResponse } from 'next/og'
import { business } from '@/lib/site'

export const alt = 'Black Coffee ATL: Come for the coffee. Stay for the culture. Inside The Vivian on the Atlanta BeltLine.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STAIRS = ['#D8443C', '#E8873A', '#EBC245', '#5E9B4C', '#3F78C2', '#7E57B5']

/** The social share image: the record on Brew. */
export default function OpengraphImage() {
  const grooves = [250, 226, 202, 178, 154, 130, 106]
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#1A0F0A', color: '#F2F3F0', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 80px', width: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: '#B98A4E', fontWeight: 700 }}>BLACK COFFEE ATL</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, marginTop: 24 }}>Come for the coffee.</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, color: '#C9CCC6' }}>Stay for the culture.</div>
          <div style={{ fontSize: 28, marginTop: 36, color: 'rgba(242,243,240,.8)' }}>
            {`Inside The Vivian · ${business.address.street} · Atlanta BeltLine`}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 40, width: 240, marginTop: 36 }}>
            {STAIRS.map((c, i) => (
              <div key={c} style={{ flex: 1, height: ((i + 1) / 6) * 40, background: c }} />
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', right: -80, top: 35, width: 560, height: 560, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#0a0a0a' }} />
          {grooves.map((r) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: 280 - r,
                top: 280 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: 999,
                border: '1px solid #262626',
              }}
            />
          ))}
          <div style={{ position: 'absolute', left: 190, top: 190, width: 180, height: 180, borderRadius: 999, background: '#B98A4E' }} />
          <div style={{ position: 'absolute', left: 272, top: 272, width: 16, height: 16, borderRadius: 999, background: '#1A0F0A' }} />
        </div>
      </div>
    ),
    size,
  )
}
