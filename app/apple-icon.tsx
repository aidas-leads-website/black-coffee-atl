import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A0F0A' }}>
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 999,
            background: '#0a0a0a',
            border: '3px solid #3a2a20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 999, background: '#B98A4E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#1A0F0A' }} />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
