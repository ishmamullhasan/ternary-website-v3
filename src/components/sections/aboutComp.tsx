'use client'
import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import type { Capability, Industry, Insight, Media, Model, PressRelease, Scale, Solution, Story } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

type MultiRelation =
  | { relationTo: 'capability'; value: Capability }
  | { relationTo: 'solution'; value: Solution }
  | { relationTo: 'industry'; value: Industry }
  | { relationTo: 'scale'; value: Scale }
  | { relationTo: 'model'; value: Model }
  | { relationTo: 'story'; value: Story }
  | { relationTo: 'insight'; value: Insight }
  | { relationTo: 'pressRelease'; value: PressRelease }

// Human-readable label for the card badge, keyed by the relationship's content type.
const CONTENT_TYPE_LABEL: Record<MultiRelation['relationTo'], string> = {
  capability: 'Capability',
  solution: 'Solution',
  industry: 'Industry',
  scale: 'Scale',
  model: 'Model',
  story: 'Story',
  insight: 'Insight',
  pressRelease: 'Press Release',
}

interface AboutProps {
  heading?: string | null
  description?: string | null
  items?: MultiRelation[] | null
  organizations?: {
    heading?: string | null
    organization?:
      | {
          icon?: Media | null
          name?: string | null
          link?: string | null
        }[]
      | null
  } | null
  bottomDescription?: string | null
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

const motionGridItemProps = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 as const },
}

function getItemHref(item: MultiRelation): string {
  if (typeof item.value === 'string' || !item.value.slug) return '#'

  switch (item.relationTo) {
    case 'capability':
      return `/capabilities/${item.value.slug}`
    case 'solution':
      return `/solutions/${item.value.slug}`
    case 'industry':
      return `/industries/${item.value.slug}`
    case 'scale':
      return '/scales'
    case 'model':
      return '/solutions'
    case 'story':
      return `/stories/${item.value.slug}`
    case 'insight':
      return `/insights/${item.value.slug}`
    case 'pressRelease':
      return `/press-release/${item.value.slug}`
    default:
      return '#'
  }
}

export default function AboutComp({ heading, description, items, organizations, bottomDescription }: AboutProps) {
  const list = (items as MultiRelation[]) ?? []
  if (list.length === 0) return null

  return (
    <section className="w-full">
      <div className="flex flex-col items-center">
        {/* heading */}
        {(heading || description) && (
          <div className="flex max-w-2xl flex-col items-center text-center">
            {heading && (
              <h1 className="text-section font-display font-medium text-cream">{heading}</h1>
            )}
            {description && <p className="mt-3 text-body">{description}</p>}
          </div>
        )}

        {/* cards grid */}
        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item, index: number): JSX.Element => {
            const thumbnail = item.value.thumbnail as Media | null | undefined
            const imageUrl = thumbnail?.url

            return (
              <Motion
                tag="div"
                key={index}
                {...motionGridItemProps}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              >
                <Link
                  href={getItemHref(item)}
                  className={`group relative block aspect-[3/4] overflow-hidden rounded-md border border-white/[0.06] bg-ink transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
                >
                  {/* gradient field IS the fallback; optional CMS image layers on top */}
                  <GradientPanel tone={toneFor(undefined, index)} interactive />
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.value.title || 'story'}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="relative object-cover"
                    />
                  )}

                  {/* text — content-type badge + single-line title header, with a Learn more affordance
                       pinned to the bottom (the whole card is already the link). */}
                  <div className="absolute inset-5 flex flex-col">
                    <div>
                      <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/85 backdrop-blur-sm">
                        {CONTENT_TYPE_LABEL[item.relationTo]}
                      </span>
                      {item.value.title && (
                        <h3 className="mt-3 line-clamp-1 font-display text-lg font-medium tracking-tight text-cream">
                          {item.value.title}
                        </h3>
                      )}
                      {item.value.excerpts && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/75">{item.value.excerpts}</p>
                      )}
                    </div>

                    <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/90 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none">
                      Learn more
                      <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                </Link>
              </Motion>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && (
          <p className="mt-12 mb-6 text-center text-xs uppercase tracking-[0.14em] text-subtle lg:text-[13px]">
            {organizations.heading}
          </p>
        )}

        <div className="grid grid-cols-2 justify-center gap-4 lg:flex lg:flex-row lg:gap-5">
          {organizations?.organization?.map((item, index) => {
            const orgIcon = item.icon as Media | null | undefined
            const orgIconUrl = orgIcon?.url

            return (
              <Motion
                tag="div"
                key={index}
                {...motionGridItemProps}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              >
                <Link
                  href={item.link || '#'}
                  className={`flex flex-row items-center rounded-md px-3 py-2 transition-colors hover:bg-white/[0.04] ${focusRing}`}
                >
                  {orgIconUrl && (
                    <span className="h-[30px] lg:h-[35px]">
                      <Image
                        src={orgIconUrl}
                        alt={orgIcon?.alt || 'org'}
                        width={orgIcon?.width || 40}
                        height={orgIcon?.height || 35}
                        className="h-full w-full object-contain grayscale transition group-hover:grayscale-0 hover:grayscale-0"
                      />
                    </span>
                  )}
                  {item.name && <span className="pl-2 text-sm text-body lg:text-base">{item.name}</span>}
                </Link>
              </Motion>
            )
          })}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <p className="mt-12 max-w-[900px] text-center text-xs text-body lg:text-sm">{bottomDescription}</p>
        )}
      </div>
    </section>
  )
}
