import { SITE_NAME } from '@/lib/seo/config'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

// next/og runs the Satori renderer; the edge runtime keeps cold starts low and is the
// recommended target for ImageResponse.
export const runtime = 'edge'

// Brand palette mirrored from src/app/(frontend)/globals.css so the card stays on-brand
// without pulling Tailwind into the edge runtime.
const COLORS = {
  page: '#050505',
  ink: '#0f0e0e',
  cream: '#f4f3ec',
  body: '#d5d5d5',
  subtle: '#757571',
  line: '#27272a',
}

/** Keep long strings from overflowing the card; Satori has no native line clamp. */
function truncate(value: string, max: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

/**
 * Dynamic Open Graph card (WEB-451).
 *
 * GET /og?title=...&subtitle=...&eyebrow=... → a branded 1200×630 PNG used as the
 * og:image / twitter:image for pages that don't set an explicit SEO image.
 * Referenced from src/lib/seo/generateMeta.ts.
 */
export function GET(request: NextRequest): ImageResponse {
  const { searchParams } = new URL(request.url)

  const title = truncate(searchParams.get('title') || SITE_NAME, 90)
  const subtitle = searchParams.get('subtitle')?.trim() ? truncate(searchParams.get('subtitle')!, 140) : null
  const eyebrow = searchParams.get('eyebrow')?.trim() ? truncate(searchParams.get('eyebrow')!, 48).toUpperCase() : null

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: COLORS.page,
        backgroundImage: `radial-gradient(circle at 18% 12%, ${COLORS.ink} 0%, ${COLORS.page} 60%)`,
        padding: '72px 80px',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: COLORS.cream,
          }}
        >
          {SITE_NAME}
        </div>
      </div>

      {/* Title block */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {eyebrow ? (
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: COLORS.subtle,
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 50 ? 64 : 80,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: COLORS.cream,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.3,
              color: COLORS.body,
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Footer rule */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: `2px solid ${COLORS.line}`,
          paddingTop: 28,
        }}
      >
        <div style={{ fontSize: 24, color: COLORS.subtle }}>ternary.solutions</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
