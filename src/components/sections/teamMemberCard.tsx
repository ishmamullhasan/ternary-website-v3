'use client'
import Motion from '@/components/animation/motion'
import { EASE } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import type { Media, Team } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

const motionGridItemProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
}

/**
 * A single team member tile: circular avatar (gradient base is the fallback, CMS portrait layers on
 * top), name, and position. Shared by the home Team section and the /team page so both stay in sync.
 * The square box + object-cover keeps the circle perfectly round for any uploaded aspect ratio.
 */
export function TeamMemberCard({ member, index }: { member: Team; index: number }): JSX.Element {
  const media = (typeof member.image === 'object' ? member.image : null) as Media | null
  const href = member.linkedin || undefined

  return (
    <Motion
      tag="div"
      {...motionGridItemProps}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
    >
      <a
        href={href}
        target={href ? '_blank' : undefined}
        rel={href ? 'noopener noreferrer' : undefined}
        className="group flex flex-col items-center text-center"
      >
        <div className="relative mb-4 aspect-square w-16 shrink-0 overflow-hidden rounded-full border border-white/[0.06] lg:w-[72px]">
          <GradientPanel tone={toneFor(undefined, index)} interactive />
          {media?.url && (
            <Image
              src={media.url}
              alt={member.name || 'team member'}
              fill
              sizes="72px"
              className="relative object-cover"
            />
          )}
        </div>

        <p className="text-sm text-cream transition-colors group-hover:text-cream lg:text-base">{member.name}</p>
        <p className="mt-1 text-xs text-subtle lg:text-sm">{member.position}</p>
      </a>
    </Motion>
  )
}
