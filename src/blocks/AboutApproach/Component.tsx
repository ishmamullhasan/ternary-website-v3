import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutApproachBlock, Media } from '@/payload-types'
import { Zap } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Transparent icon + title + desc unit (design "Benefit block"): 48px round `bg-page` icon badge,
 * 32px gap to the text group, 8px title→desc. Title Poppins Medium 24, desc Inter 16 at 90%.
 */
function BenefitBlock({ title, desc }: { title?: string; desc?: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-end gap-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Zap aria-hidden className="h-6 w-6 text-cream" />
      </div>
      <div className="flex flex-col gap-2">
        {title ? (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">{title}</h3>
        ) : null}
        {desc ? <p className="text-base leading-snug text-body/90">{desc}</p> : null}
      </div>
    </div>
  )
}

/**
 * "The Ternary Way" (design node 1259:12848): an image-led composition where a tall grayscale
 * photo card anchors the left (the headline benefit overlaid bottom-left), with a stack of plain
 * icon+title+desc benefit cells filling the rest of the 3-column grid. The first cell carries the
 * signature grain media; when media is unavailable it degrades to an emerald brand gradient.
 */
function BentoMedia({ url, alt }: { url?: string; alt?: string }): JSX.Element {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt ?? ''}
          className="absolute inset-0 h-full w-full scale-105 object-cover grayscale transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
      ) : (
        <span
          className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          style={{
            backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
    </div>
  )
}

export function AboutApproachComponent({ heading, description, items }: AboutApproachBlock): JSX.Element | null {
  const motionGridItemProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' as const },
  }

  if (!heading || !items?.length) return null

  const [featured, ...rest] = items
  const rightColumn = rest.slice(0, 2) // stacked beside the featured media
  const bottomRow = rest.slice(2) // remaining benefits in the lower band
  const featuredImageUrl = featured?.media ? ((featured.media as Media)?.url ?? undefined) : undefined

  return (
    <div>
      <Section title={heading ?? ''} desc={description ?? ''}>
        {/* Top region: featured media (2/3) + a stacked pair of benefits (1/3). */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Motion className="lg:col-span-2" {...motionGridItemProps} transition={{ duration: 0.5, ease: EASE }}>
            <div className="group relative h-[460px] overflow-hidden rounded-md lg:h-[600px]">
              <BentoMedia url={featuredImageUrl} alt={featured?.title ?? undefined} />
              <div className="relative z-10 flex h-full flex-col justify-end gap-8 p-6 lg:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
                  <Zap aria-hidden className="h-6 w-6 text-cream" />
                </div>
                <div className="flex flex-col gap-2">
                  {featured?.title ? (
                    <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                      {featured.title}
                    </h3>
                  ) : null}
                  {featured?.excerpt ? (
                    <p className="max-w-sm text-base leading-snug text-body/90">{featured.excerpt}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </Motion>

          {rightColumn.length ? (
            <div className="flex flex-col gap-4 lg:col-span-1">
              {rightColumn.map((item, index) => (
                <Motion
                  key={item.id ?? `approach-right-${index}`}
                  className="min-h-[220px] flex-1"
                  {...motionGridItemProps}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min((index + 1) * 0.05, 0.4) }}
                >
                  <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
                </Motion>
              ))}
            </div>
          ) : null}
        </div>

        {/* Lower band: remaining benefits. */}
        {bottomRow.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bottomRow.map((item, index) => (
              <Motion
                key={item.id ?? `approach-bottom-${index}`}
                className={cn('min-h-[360px]', index === bottomRow.length - 1 ? 'lg:col-span-2' : '')}
                {...motionGridItemProps}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min((index + 3) * 0.05, 0.4) }}
              >
                <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
              </Motion>
            ))}
          </div>
        ) : null}
      </Section>
    </div>
  )
}
