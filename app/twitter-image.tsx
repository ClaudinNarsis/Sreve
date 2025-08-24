import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Sreve - AI Creative Co-pilot for Marketing Agencies'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff6600, #ff8533)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '8px',
            }}
          >
            Sreve
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            AI Creative Co-pilot for Marketing Agencies
          </div>
          <div
            style={{
              fontSize: '20px',
              opacity: 0.8,
              maxWidth: '800px',
              lineHeight: 1.3,
            }}
          >
            Generate scroll-stopping UGC scripts & ad copy in your brand's voice
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}