'use client'

import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import SectionCta from '@/components/sections/SectionCta'
import SolutionsFrame, { artIndexFor } from '@/components/solutions/SolutionsFrame'
import type { Media, Solution } from '@/payload-types'
import { useEffect, useMemo, useState, type JSX } from 'react'

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
//
// The card is also what drives the frame above it: pointer and keyboard focus both resolve this
// solution's lane, so the graphic answers to the same target either way.
function SolutionCard({
  item,
  isFocus,
  onEnter,
  onLeave,
}: {
  item: Solution
  isFocus: boolean
  onEnter: () => void
  onLeave: () => void
}): JSX.Element {
  return (
    <Link
      href="/solutions"
      className="group/sol flex h-full flex-col gap-2.5 rounded-md p-4 transition-colors duration-200 hover:bg-ink"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
    >
      {/* The rule fills left-to-right on the focused lane — the caption's half of the frame's
          "this one resolves" gesture. Decorative; the focus state is already carried by the text. */}
      <span aria-hidden className="relative block h-px w-full overflow-hidden bg-cream/10">
        <span
          className={`absolute inset-0 origin-left bg-cream/75 transition-transform duration-[800ms] ease-[cubic-bezier(.16,1,.3,1)] ${
            isFocus ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </span>

      <h3 className="font-display text-2xl font-medium text-cream lg:mt-1 lg:text-lg">{item.title}</h3>

      {/* Resting colour is --color-body (#aaaaaa, AAA 7:1); the focused lane lifts to cream. Never
          drop the resting step below text-body — cream/50-60 would fail the AAA floor for body text. */}
      {item.excerpts && (
        /* lg guard: reserve + clamp 3 lines (3 × 1.15 leading) so the 4-up row keeps a uniform
           text block — excerpts are budgeted to the 105–124ch band (3 lines at lane width). */
        <p
          className={`text-base leading-[1.15] transition-colors duration-500 lg:line-clamp-3 lg:min-h-[3.45em] lg:text-sm ${
            isFocus ? 'text-cream' : 'text-body'
          }`}
        >
          {item.excerpts}
        </p>
      )}
    </Link>
  )
}

export default function SolutionsComp({ heading, description, items }: SolutionsCompProps): JSX.Element | null {
  // Memoised so `lanes` below isn't recomputed on every render by a fresh [] identity.
  const solutions = useMemo(() => (items as Solution[] | null | undefined) ?? [], [items])

  // Which lane resolves: the hovered/focused card wins, otherwise the frame walks the lanes on its
  // own so the section is never inert. Hooks run before the early return — they must be unconditional.
  const [active, setActive] = useState<number | null>(null)
  const [auto, setAuto] = useState(0)
  const count = solutions.length

  useEffect(() => {
    if (active !== null || count < 2) return
    // Don't cycle for people who asked for less motion — they get lane 01, held.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setAuto((i) => (i + 1) % count), 4000)
    return () => clearInterval(t)
  }, [active, count])

  const lanes = useMemo(() => solutions.map((item, i) => artIndexFor(item?.title, i)), [solutions])

  if (count === 0) return null

  const focus = active ?? auto % count

  return (
    <section className="section-card flex w-full flex-col">
      {/* Hub link top-right, level with the h2's first line; below sm it drops under the copy. */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex flex-col lg:w-[500px]">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && (
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-body lg:prose-p:text-base"
            />
          )}
        </div>
        <SectionCta href="/solutions" destination="about our solutions" />
      </div>

      {/* One wide field, one movement per solution — replaces the gradient hero. Bound to the cards
          below: hovering or focusing a card resolves its lane. */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full"
      >
        <SolutionsFrame focus={focus} lanes={lanes} />
      </Motion>

      <div className="w-full">
        {/* Title above excerpt, then Learn More — same order in both layouts. */}
        {/* Mobile: horizontal snap carousel with pagination dots. */}
        <MobileCarousel slideClassName="w-[280px]">
          {solutions.map((item, index) => (
            <SolutionCard
              key={item.id ?? index}
              item={item}
              isFocus={focus === index}
              onEnter={() => setActive(index)}
              onLeave={() => setActive(null)}
            />
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
                <SolutionCard
                  item={item}
                  isFocus={focus === index}
                  onEnter={() => setActive(index)}
                  onLeave={() => setActive(null)}
                />
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
