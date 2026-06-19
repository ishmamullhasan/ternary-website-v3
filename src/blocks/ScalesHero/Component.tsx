import Motion from '@/components/animation/motion'
import type { Media } from '@/payload-types'
import type { JSX } from 'react'

/**
 * Scales page hero (design node 1459:7521, elevated).
 *
 * Editorial header (Poppins display headline + Inter sub) opening onto a row of equal
 * "engagement shape" cards. Each card is a numbered eyebrow + title sitting above a
 * full-width gradient block carrying the brand's signature grain texture — the same
 * noise-gradient device used on the homepage hero. The gradient is pure CSS keyed to the
 * card index (warm → cool → green across the row), so it renders identically regardless of
 * CMS/media availability; uploaded media, when present, layers over the gradient and any
 * broken/missing image degrades to the gradient rather than an empty box.
 */

// TODO: switch to ScalesHeroBlock after generate:types
// Local interface mirroring src/blocks/ScalesHero/config.ts until payload-types
// regenerates the generated `ScalesHeroBlock` type.
interface ScalesHeroBlock {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  items?:
    | {
        title: string
        excerpt?: string | null
        media?: (string | null) | Media
        id?: string | null
      }[]
    | null
  id?: string | null
  blockName?: string | null
  blockType?: 'scalesHero'
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Design-language gradients keyed to the engagement-shape sequence: warm (startups) →
// cool (mid-market/enterprise) → green (public sector). Origin sits top-left so the grain
// texture reads against a clear light source. Cycles if there are more than six cards.
const TONES: string[] = [
  'radial-gradient(135% 135% at 12% 12%, #f0913f 0%, #d8345b 58%, #7c1230 100%)',
  'radial-gradient(135% 135% at 16% 14%, #7c3aed 0%, #4654d8 56%, #1f2a8c 100%)',
  'radial-gradient(135% 135% at 16% 14%, #2bc48a 0%, #1f9d6b 56%, #0f5a3d 100%)',
  'radial-gradient(135% 135% at 16% 14%, #2f93da 0%, #1f5fa8 56%, #134a78 100%)',
  'radial-gradient(135% 135% at 14% 12%, #c2289a 0%, #6d1457 56%, #2a0f2c 100%)',
  'radial-gradient(135% 135% at 16% 14%, #4f6bed 0%, #2f3aa8 56%, #1a2270 100%)',
]

export function ScalesHeroComponent(props: ScalesHeroBlock): JSX.Element {
  const items = props?.items ?? []

  return (
    <section className="mx-auto w-full max-w-7xl px-5 lg:pt-16 lg:pb-8 pt-10 pb-4">
      {/* Header */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex max-w-4xl flex-col items-start text-left"
      >
        {props?.eyebrow && (
          <span className="mb-4 text-[12px] uppercase tracking-[0.14em] text-subtle">{props.eyebrow}</span>
        )}
        {props?.heading && (
          <h1 className="font-display max-w-2xl text-[clamp(2rem,5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.04em] text-cream">
            {props.heading}
          </h1>
        )}
        {props?.description && (
          <p className="mt-6 max-w-xl text-[15px] leading-[1.5] text-body lg:text-[16px]">{props.description}</p>
        )}
      </Motion>

      {/* Engagement-shape cards */}
      {items.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12">
          {items.map((item, index) => {
            const media = item.media as Media | null | undefined
            const tone = TONES[index % TONES.length]
            return (
              <Motion
                key={item.id ?? `hero-card-${index}`}
                tag="div"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
                className="group flex flex-col rounded-md bg-ink p-4 ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]"
              >
                {/* Numbered eyebrow + title */}
                <div className="flex flex-col items-start gap-2 px-1 pb-4 pt-1">
                  <span className="text-[12px] tracking-[0.14em] text-subtle tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[15px] font-medium leading-[1.2] tracking-[-0.01em] text-cream">{item.title}</h3>
                </div>

                {/* Gradient block — signature noise-gradient, with optional media layered over. */}
                <div className="relative aspect-[2.6/1] w-full overflow-hidden rounded-md">
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    style={{ backgroundImage: tone }}
                  />
                  {media?.url && (
                    <img
                      src={media.url}
                      alt={media.alt || ''}
                      className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-luminosity"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40"
                  />
                </div>
              </Motion>
            )
          })}
        </div>
      )}
    </section>
  )
}
