import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutApproachBlock, Media } from '@/payload-types'
import { Zap } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type ApproachItem = NonNullable<AboutApproachBlock['items']>[number]

/**
 * Icon + title + desc unit (design "Benefit block"): a 48px round `bg-main` icon badge, a 32px gap
 * to the text group, then 8px title→desc. Title Poppins Medium 24 at 90% opacity, desc Inter 16 at
 * 75% opacity. Sits on a `bg-page` card (the panel is `bg-main`, so the inner cards step darker).
 */
function BenefitBlock({ title, desc }: { title?: string; desc?: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-end gap-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main">
        <Zap aria-hidden className="h-6 w-6 text-cream" />
      </div>
      <div className="flex flex-col gap-2">
        {title ? (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">{title}</h3>
        ) : null}
        {desc ? <p className="text-base leading-tight tracking-[-0.02em] text-body/75">{desc}</p> : null}
      </div>
    </div>
  )
}

/** A standard benefit on its own `bg-page` card surface. */
function BenefitCard({ item }: { item: { title?: string | null; excerpt?: string | null } }): JSX.Element {
  return (
    <div className="h-full overflow-hidden rounded-md bg-page p-6">
      <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
    </div>
  )
}

/**
 * Signature media layer for the featured "Ternary Way" cell (design node 1259:12854). A full-bleed
 * grayscale photo under the brand grain (`/noise.svg`) with a bottom→top scrim so the icon/title
 * hold legibility over the image. Degrades to an emerald brand gradient when media is unavailable.
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
      <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
    </div>
  )
}

/**
 * Featured "Ternary Way" cell — full-bleed grayscale media under grain, with the icon/title/desc
 * group anchored to the bottom. Reused by both the desktop bento (fixed heights) and the mobile
 * carousel (`h-full` slide). `className` sizes the outer surface.
 */
function FeaturedCard({ item, className }: { item?: ApproachItem; className?: string }): JSX.Element {
  const url = item?.media ? ((item.media as Media)?.url ?? undefined) : undefined
  return (
    <div className={cn('group relative overflow-hidden rounded-md', className)}>
      <BentoMedia url={url} alt={item?.title ?? undefined} />
      <div className="relative z-10 flex h-full flex-col justify-end gap-8 p-6 lg:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main">
          <Zap aria-hidden className="h-6 w-6 text-cream" />
        </div>
        <div className="flex flex-col gap-2">
          {item?.title ? (
            <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">
              {item.title}
            </h3>
          ) : null}
          {item?.excerpt ? (
            <p className="max-w-md text-base leading-tight tracking-[-0.02em] text-body/75">{item.excerpt}</p>
          ) : null}
        </div>
      </div>
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

  return (
    <div>
      <Section title={heading ?? ''} desc={description ?? ''} className="rounded-md bg-main px-9 py-12">
        {/* Mobile: single horizontal carousel of every benefit (featured first). `sm:hidden`
            is baked into MobileCarousel, so the bento grid below takes over at sm+. */}
        <MobileCarousel slideClassName="h-[420px] w-[280px]">
          {items.map((item, index) =>
            index === 0 ? (
              <FeaturedCard key={item.id ?? `approach-slide-${index}`} item={item} className="h-full" />
            ) : (
              <BenefitCard key={item.id ?? `approach-slide-${index}`} item={item} />
            ),
          )}
        </MobileCarousel>

        {/* Body: row A (featured + stacked pair) over row B (narrow + wide), 16px apart. */}
        <div className="hidden flex-col gap-4 sm:flex">
          {/* Row A: featured media (2/3) + a stacked pair of benefits (1/3). */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Motion className="lg:col-span-2" {...motionGridItemProps} transition={{ duration: 0.5, ease: EASE }}>
              <FeaturedCard item={featured} className="h-[460px] lg:h-[600px]" />
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
                    <BenefitCard item={item} />
                  </Motion>
                ))}
              </div>
            ) : null}
          </div>

          {/* Row B: remaining benefits — last one is the wide (2/3) card. */}
          {bottomRow.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bottomRow.map((item, index) => (
                <Motion
                  key={item.id ?? `approach-bottom-${index}`}
                  className={cn('min-h-[360px]', index === bottomRow.length - 1 ? 'lg:col-span-2' : '')}
                  {...motionGridItemProps}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min((index + 3) * 0.05, 0.4) }}
                >
                  <BenefitCard item={item} />
                </Motion>
              ))}
            </div>
          ) : null}
        </div>
      </Section>
    </div>
  )
}
