import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import LocalizedLink from '@/components/LocalizedLink'
import type { IndustriesSectionBlock, Industry, Media } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Renders the Industries section as a uniform 8-up grid of equal rich cards. Each card layers the
// signature GradientPanel device (always-on) under an optional cover image, with a foreground text
// stack (numbered eyebrow, title, excerpt) and an ArrowUpRight affordance — keeping the surface
// cohesive whether or not CMS thumbnails are present.
export function IndustriesSectionComponent({
  heading,
  description,
  industries,
}: IndustriesSectionBlock): JSX.Element | null {
  const items = (industries ?? []).filter((i): i is Industry => typeof i === 'object' && i !== null)
  if (items.length === 0) return null

  return (
    <Motion tag="section" className="w-full py-4 lg:py-8">
      {(heading || description) && (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 max-w-2xl space-y-3 lg:mb-14"
        >
          {heading && (
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cream lg:text-3xl">
              {heading}
            </h2>
          )}
          {description && <p className="text-sm leading-relaxed text-body lg:text-base">{description}</p>}
        </Motion>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const thumb = item.thumbnail as Media | undefined
          const cover = thumb?.url
          const alt = thumb?.alt || `${item.title} — industry`
          return (
            <Motion
              key={item.id ?? index}
              tag="div"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.06, 0.36) }}
            >
              <LocalizedLink
                href={`/industries/${item.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page"
              >
                <GradientPanel tone={toneFor(undefined, index)} interactive />

                {cover && (
                  <Image
                    src={cover}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="relative object-cover transition-transform duration-[1200ms] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  />
                )}

                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
                />

                <div className="relative flex h-full flex-col justify-end p-5">
                  <span className="font-display text-xs font-medium tracking-[0.2em] text-cream/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <h3 className="font-display mt-3 text-[19px] font-medium leading-[1.18] tracking-tight text-cream lg:text-xl">
                    {item.title}
                  </h3>

                  {item.excerpts && (
                    <p className="mt-2 text-sm leading-relaxed text-cream/80">{item.excerpts}</p>
                  )}

                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.75}
                    aria-hidden
                    className="absolute right-5 top-5 text-cream/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cream motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  />
                </div>
              </LocalizedLink>
            </Motion>
          )
        })}
      </div>
    </Motion>
  )
}
