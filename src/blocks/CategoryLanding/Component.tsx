import Motion from '@/components/animation/motion'
import { cn } from '@/lib/utils'
import type { CategoryLandingBlock, Media } from '@/payload-types'
import { ArrowUpRight, FileText, FlaskConical, Lightbulb, Newspaper, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

const CATEGORY_LANDING_ICONS = {
  newspaper: Newspaper,
  'flask-conical': FlaskConical,
  lightbulb: Lightbulb,
  'file-text': FileText,
} as const satisfies Record<string, LucideIcon>

type CategoryLandingIconKey = keyof typeof CATEGORY_LANDING_ICONS

// Content-type radial gradients matching the site's signature noise-gradient device. Origin
// sits top-left so the brightest point reads as a light source the grain texture sits over.
// Keyed by content type: insight = violet, research/data = azure, press = emerald, case = crimson.
const CATEGORY_TONES = [
  'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)', // azure
  'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)', // violet
  'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)', // emerald
  'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)', // crimson
] as const

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function CategoryLandingIcon({ icon }: { icon: string | null | undefined }): JSX.Element | null {
  if (!icon || !(icon in CATEGORY_LANDING_ICONS)) return null
  const Icon = CATEGORY_LANDING_ICONS[icon as CategoryLandingIconKey]
  return <Icon size={18} strokeWidth={1.75} aria-hidden className="shrink-0 text-cream" />
}

export const CategoryLandingComponent = (data: CategoryLandingBlock): JSX.Element | null => {
  const sectionReveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' } as const,
    transition: { duration: 0.6, ease: EASE },
  }

  if (!data.categories || data.categories.length === 0) return null

  return (
    <Motion tag="section" className="w-full space-y-8" {...sectionReveal}>
      <div className="max-w-3xl space-y-3">
        {data.heading && (
          <h2 className="font-display text-[clamp(1.6rem,3vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream">
            {data.heading}
          </h2>
        )}
        {data.description && <p className="text-[15px] leading-relaxed text-body">{data.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.categories.map((category, index) => {
          const image = category.image as Media | undefined
          const tone = CATEGORY_TONES[index % CATEGORY_TONES.length]

          const content = (
            <Motion
              className="group relative flex h-[360px] flex-col justify-end overflow-hidden rounded-md p-8 ring-1 ring-white/[0.06] transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] lg:h-[440px]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.42) }}
            >
              {/* Gradient field — eases brighter and scales subtly on hover. */}
              <span
                aria-hidden
                className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                style={{ backgroundImage: tone }}
              />
              {/* Optional CMS image sits over the gradient (degrades to the gradient when absent). */}
              {image?.url && (
                <Image
                  src={image.url}
                  alt={image.alt || category.title || 'Category'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
              )}
              {/* Grain overlay — local asset, no external dependency. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
              />
              {/* Legibility scrim so eggshell text holds on the brightest gradients/imagery. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60"
              />

              <div className="relative z-10">
                <div className="mb-5 flex size-10 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.08]">
                  <CategoryLandingIcon icon={category.icon} />
                </div>

                <div className="space-y-3">
                  {category.title && (
                    <h3 className="text-[24px] font-medium leading-tight tracking-[-0.01em] text-cream lg:text-[28px]">
                      {category.title}
                    </h3>
                  )}
                  {category.description && (
                    <p className="line-clamp-2 text-[14px] leading-relaxed text-cream/75">{category.description}</p>
                  )}
                  {category.link && (
                    <span className="inline-flex items-center gap-1.5 pt-1 text-[14px] text-cream/90 transition-colors group-hover:text-cream">
                      {category.linkLabel || 'Open section'}
                      <ArrowUpRight
                        size={14}
                        strokeWidth={2}
                        aria-hidden
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  )}
                </div>
              </div>
            </Motion>
          )

          return category.link ? (
            <Link
              key={category.id ?? `category-${index}`}
              href={category.link}
              className={cn(
                'group block rounded-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page',
              )}
            >
              {content}
            </Link>
          ) : (
            <div key={category.id ?? `category-${index}`} className="group block">
              {content}
            </div>
          )
        })}
      </div>
    </Motion>
  )
}

export default CategoryLandingComponent
