import { ImageResponse } from 'next/og';
import { eventConfig } from '@/lib/config';

export const runtime = 'edge';

export const alt = `Australian AI Safety Forum ${eventConfig.year}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 40%, #0047ba 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
          }}
        >
          {/* Year badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0,212,255,0.15)',
              border: '1px solid rgba(0,212,255,0.3)',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#00d4ff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            {eventConfig.datesLong} · {eventConfig.venue}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Australian AI
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Safety Forum
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '700px',
              lineHeight: 1.4,
              marginTop: '8px',
            }}
          >
            Rigorous dialogue on the future of AI safety
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00d4ff, #0047ba, #00d4ff)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
