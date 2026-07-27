import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import { cn } from '@/lib/utils'
import type { AboutBeliefsBlock, Media } from '@/payload-types'
import { Zap } from 'lucide-react'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Icon + title + desc unit (design "Benefit block"): a 48px round `bg-page` icon badge, a 32px gap
 * to the text group, then 8px title→desc. Title Poppins Medium 24 at 90% opacity, desc Inter 16 at
 * 75% opacity. Each cell sits on its own `bg-main` card (5px radius, 24px padding), matching the comp.
 */
function BenefitBlock({ title, desc }: { title?: string; desc?: string }): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-end gap-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Zap aria-hidden className="h-6 w-6 text-cream" />
      </div>
      <div className="flex flex-col gap-2">
        {title ? (
          <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">{title}</h3>
        ) : null}
        {desc ? <p className="text-base leading-tight tracking-[-0.02em] text-body">{desc}</p> : null}
      </div>
    </div>
  )
}

/**
 * Signature media layer for the featured belief cell (design node 1258:11849). A grayscale photo
 * occupies the right half of the card under the brand grain (`/noise.svg`); a left→right gradient
 * dissolves the photo into the `bg-main` card on its left edge so the icon/title hold legibility
 * over solid card colour. Sits at z-0 behind the cell's `relative z-10` text. Degrades to a violet
 * brand gradient when media is unavailable.
 */
function BentoMedia({ url, alt }: { url?: string; alt?: string }): JSX.Element {
  return (
    <div aria-hidden className="absolute inset-y-0 right-0 z-0 w-full overflow-hidden md:w-1/2">
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
            backgroundImage: 'radial-gradient(135% 135% at 78% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
          }}
        />
      )}
      <span className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay" />
      {/* Photo dissolves into the card on its left edge (Figma 1258:11850 left→right fade). */}
      <span className="absolute inset-0 bg-gradient-to-r from-main via-main/60 to-transparent" />
    </div>
  )
}

type BeliefItem = NonNullable<AboutBeliefsBlock['items']>[number]

const MOTION_ITEM = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
}

/** A standard (non-featured) belief: the benefit block on its own card surface. */
function BeliefCard({ item, index }: { item: BeliefItem; index: number }): JSX.Element {
  return (
    <Motion
      className="h-full min-h-0"
      {...MOTION_ITEM}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
    >
      <div className="h-full min-h-[360px] overflow-hidden rounded-md bg-main p-6">
        <BenefitBlock title={item.title ?? undefined} desc={item.excerpt ?? undefined} />
      </div>
    </Motion>
  )
}

/** The wide featured belief: photo on the right half with the benefit overlaid bottom-left. */
function FeaturedBelief({ item }: { item: BeliefItem }): JSX.Element {
  const imageUrl = item.media ? ((item.media as Media)?.url ?? undefined) : undefined
  return (
    <Motion className="h-full min-h-0" {...MOTION_ITEM} transition={{ duration: 0.5, ease: EASE }}>
      <div className="group relative h-full min-h-[360px] overflow-hidden rounded-md bg-main">
        <BentoMedia url={imageUrl} alt={item.title ?? undefined} />
        <div className="relative z-10 flex h-full flex-col justify-end gap-8 p-6 lg:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
            <Zap aria-hidden className="h-6 w-6 text-cream" />
          </div>
          <div className="flex flex-col gap-2">
            {item.title ? (
              <h3 className="font-display text-2xl font-medium leading-[1.15] tracking-[-0.05em] text-cream/90">
                {item.title}
              </h3>
            ) : null}
            {item.excerpt ? (
              <p className="max-w-md text-base leading-tight tracking-[-0.02em] text-body">{item.excerpt}</p>
            ) : null}
          </div>
        </div>
      </div>
    </Motion>
  )
}

export function AboutBeliefsComponent({ heading, description, items }: AboutBeliefsBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  // Figma 1258:11841 lays the beliefs out as two flex rows rather than a uniform grid:
  //   row 1 — wide featured (2) + one card (1);  row 2 — cards (1) with the last one wide (2).
  const [featured, ...rest] = items
  const row1Second = rest[0]
  const row2 = rest.slice(1)

  return (
    <div>
      <Section title={heading ?? ''} desc={description ?? ''}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="lg:flex-[2]">
              <FeaturedBelief item={featured} />
            </div>
            {row1Second ? (
              <div className="lg:flex-1">
                <BeliefCard item={row1Second} index={1} />
              </div>
            ) : null}
          </div>

          {row2.length ? (
            <div className="flex flex-col gap-4 lg:flex-row">
              {row2.map((item, i) => (
                <div
                  key={item.id ?? `belief-${i + 2}`}
                  className={cn('lg:flex-1', i === row2.length - 1 ? 'lg:flex-[2]' : '')}
                >
                  <BeliefCard item={item} index={i + 2} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Section>
    </div>
  )
}
