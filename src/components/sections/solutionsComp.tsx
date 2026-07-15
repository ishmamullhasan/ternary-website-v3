'use client'

import Motion from '@/components/animation/motion'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import MobileCarousel from '@/components/layout/MobileCarousel'
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

// Single solution card — shared by the sm+ grid and the mobile carousel. The whole card is the link
// (was the "Learn More" link). No resting background; hover fills with bg-ink. Title above excerpt.
// Keyboard focus uses the global :focus-visible cream outline (globals.css) — no ring needed here.
function SolutionCard({ item }: { item: Solution }): JSX.Element {
  return (
    <Link href="/solutions" className="flex h-full flex-col rounded-md p-4 transition-colors duration-200 hover:bg-ink">
      <h3 className="font-display text-2xl font-medium text-cream lg:mt-2 lg:text-lg">{item.title}</h3>

      {item.excerpts && <p className="mt-3 text-base leading-[1.15] text-body lg:mt-2 lg:text-sm">{item.excerpts}</p>}
    </Link>
  )
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
        {/* Title above excerpt, then Learn More — same order in both layouts. */}
        {/* Mobile: horizontal snap carousel with pagination dots. */}
        <MobileCarousel slideClassName="w-[280px]">
          {solutions.map((item, index) => (
            <SolutionCard key={item.id ?? index} item={item} />
          ))}
        </MobileCarousel>

        {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
        <div className="hidden gap-6 sm:grid lg:grid-cols-4 lg:gap-4">
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
                <SolutionCard item={item} />
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
