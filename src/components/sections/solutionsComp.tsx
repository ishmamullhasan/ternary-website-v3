'use client'

import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media, Solution } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

interface SolutionsCompProps {
  heading?: string | null
  description?: RichText | string | null
  image?: Media | null
  items?: Solution[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function SolutionsComp({ heading, description, image, items }: SolutionsCompProps): JSX.Element | null {
  const solutions = (items as Solution[] | null | undefined) ?? []
  if (solutions.length === 0) return null

  const hero = image as Media | null | undefined

  return (
    <section className="section-card flex w-full flex-col">
      <div className="flex justify-start">
        <div className="flex flex-col lg:w-[500px]">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && (
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-body lg:prose-p:text-base"
            />
          )}
        </div>
      </div>

      {/* Hero media: the gradient field IS the fallback; the CMS image layers on top when present. */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="group relative my-8 aspect-[16/10] w-full overflow-hidden rounded-md border border-white/[0.06] lg:my-10 lg:aspect-[16/7]"
      >
        <GradientPanel tone={toneFor(undefined, 0)} interactive />
        {hero?.url && <Image src={hero.url} alt={hero.alt || ''} fill className="relative object-cover" />}
      </Motion>

      <div className="w-full">
        {/* Two layouts share one DOM via flex `order`. Mobile (Figma 888:4122): title → excerpt →
            Learn More, with a full-width divider BETWEEN items. Desktop (Figma 339:8087): excerpt →
            divider → title → Learn More, each column top-aligned with a uniform 8px gap (NOT pinned
            to the bottom — the divider floats directly under each excerpt). */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-4">
          {solutions.map((item, index: number): JSX.Element => {
            return (
              <Motion
                key={item.id ?? index}
                {...motionGridItemProps}
                className="flex h-full flex-col"
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                {/* Mobile-only separator between items (skipped on the first). Cream line (Figma). */}
                {index > 0 && <hr className="order-1 mb-4 border-cream lg:hidden" />}

                <h3 className="order-2 font-display text-xl font-medium text-cream lg:order-3 lg:mt-2 lg:text-base">
                  {item.title}
                </h3>

                {item.excerpts && (
                  <p className="order-3 mt-3 text-base leading-[1.15] text-body lg:order-1 lg:mt-0 lg:text-sm">
                    {item.excerpts}
                  </p>
                )}

                {/* Desktop-only cream divider directly under the excerpt (columns are top-aligned). */}
                <hr className="order-4 hidden border-cream lg:order-2 lg:mt-2 lg:block" />

                {/* Plain cream text link — no arrow (Figma 890:7313). */}
                <Link
                  href="/solutions"
                  className="order-5 mt-3 inline-flex w-fit items-center text-sm font-medium text-cream transition-opacity hover:opacity-70 lg:order-4 lg:mt-2"
                >
                  Learn More
                </Link>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
