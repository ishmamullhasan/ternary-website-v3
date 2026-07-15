'use client'

import Motion from '@/components/animation/motion'
import { usePointerReveal } from '@/components/capability/usePointerReveal'
import type { JSX, ReactNode } from 'react'
import { useId } from 'react'

import './heroIcon.css'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// The designer's isometric artwork for one card, kept as data so the server component can hold the
// paths and this client card only supplies the pointer-reactive frame around them.
export interface HeroIconData {
  w: number
  h: number
  paths: ReactNode
}

/**
 * The masked SVG plate. Same shape as capabilityArt's `Fig`: a latent base plus a pointer-tracking
 * spot, wrapped in a group that leans away from the pointer. The mask ids MUST be per-instance —
 * `url(#…)` resolves to the first matching id in the document, so a hard-coded id would silently mask
 * one card with another's spotlight. `useId` gives each card its own.
 *
 * `aria-hidden` because the card's <h3> already names the discipline; the icon carries no additional
 * information for a screen-reader user, and being decorative it is exempt from contrast requirements.
 */
function HeroIcon({ w, h, paths }: HeroIconData): JSX.Element {
  const uid = useId()
  const grad = `hi-g-${uid}`
  const mask = `hi-m-${uid}`
  const spotR = Math.round(w * 0.62)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden className="hi-svg h-[72px] w-auto shrink-0 drop-shadow-2xl">
      <defs>
        <radialGradient id={grad}>
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x="0" y="0" width={w} height={h} fill="#fff" className="hi-base" />
          <circle cx="0" cy="0" r={spotR} fill={`url(#${grad})`} className="hi-spot" />
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        {/* hi-par leans with the pointer; hi-build assembles the faces one by one (heroIcon.css). */}
        <g className="hi-par hi-build">{paths}</g>
      </g>
    </svg>
  )
}

/**
 * One hero discipline card. Reuses the capability cards' pointer-reveal mechanism (usePointerReveal +
 * the `--cap-*` variable contract): the icon is latent and resolves under the cursor, the card carries
 * a lume pool, and the whole figure leans away from the pointer. The scroll-reveal keeps its original
 * per-index stagger.
 */
export function DisciplineCard({
  icon,
  title,
  excerpt,
  index,
}: {
  icon: HeroIconData
  title?: string | null
  excerpt?: string | null
  index: number
}): JSX.Element {
  const { ref, onPointerMove, onPointerLeave } = usePointerReveal<HTMLDivElement>(icon.w / 2, icon.h / 2)

  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.07, 0.42) }}
      className="h-full"
    >
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="hi-stage group relative flex h-full flex-col items-center gap-2 overflow-hidden rounded-md bg-card px-3 pb-4 pt-6 text-center lg:gap-4 lg:rounded-xl lg:border lg:border-white/10 lg:bg-ink/75 lg:px-6 lg:py-7 lg:backdrop-blur-md"
      >
        <span aria-hidden className="hi-lume" />

        {/* Isometric icon is a desktop-only flourish. The Figma mobile layout (1719:2995) is
            text-only, so it is hidden until the grid becomes 4-up at lg. */}
        <div className="relative z-[1] hidden lg:block">
          <HeroIcon {...icon} />
        </div>

        <div className="relative z-[1] flex flex-col gap-2 lg:gap-1.5">
          <h3 className="font-display text-[16px] font-medium leading-[1.15] tracking-[-0.05em] text-cream lg:text-[18px] lg:leading-[1.2] lg:tracking-normal">
            {title}
          </h3>
          {excerpt ? (
            <p className="text-[14px] leading-[1.15] text-body lg:text-[12px] lg:leading-relaxed lg:text-subtle">
              {excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Motion>
  )
}

export default DisciplineCard
