'use client'
import Motion from '@/components/animation/motion'
import { EASE } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import LocalizedLink from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import { TeamMemberCard } from '@/components/sections/teamMemberCard'
import type { Media, Team } from '@/payload-types'
import { sortByTeamOrder } from '@/utilities/teamOrder'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

interface TeamCompProps {
  heading?: string | null
  description?: RichText | string | null
  members?: Team[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
}

export default function TeamComp({ heading, description, members: rawMembers }: TeamCompProps): JSX.Element | null {
  if (!rawMembers || rawMembers.length === 0) return null

  // Global manual roster order (admin drag-and-drop) wins over the relationship's pick order.
  // Render guard (Stage 6.4): only complete entries (name + role) appear publicly.
  const members = sortByTeamOrder(rawMembers).filter((m) => m.name?.trim() && m.position?.trim())

  const maxVisible = 3
  const total = members.length
  const remaining = total - maxVisible

  return (
    <section className="section-card">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
        {/* Left header — description first, heading below (Figma 339:13754). */}
        <div className="lg:w-1/4">
          {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
          {description && <RichTextComp content={description as RichText} className="prose-p:mb-0 prose-p:text-body" />}
        </div>

        {/* Member grid — a preview of the roster; the overflow tile links to the full /team page. */}
        <div className="mt-6 lg:mt-0 lg:w-3/4">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {members.slice(0, maxVisible).map((member, index) => (
              <TeamMemberCard key={member.id ?? index} member={member} index={index} />
            ))}

            {/* STACKED AVATARS — links to the full team page (no inline expand). */}
            {remaining > 0 && (
              <Motion
                tag="div"
                {...motionGridItemProps}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(maxVisible * 0.05, 0.4) }}
              >
                <LocalizedLink
                  href="/team"
                  className="group flex w-full flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                >
                  <div className="mb-4 flex items-center">
                    {members.slice(maxVisible, maxVisible + 4).map((member, index) => {
                      const media = (typeof member.image === 'object' ? member.image : null) as Media | null

                      return (
                        <span
                          key={member.id ?? index}
                          // Reverse the paint order so the FIRST avatar stacks on top (earlier index
                          // = higher z-index); without this the last avatar in the DOM wins the overlap.
                          style={{ zIndex: maxVisible - index }}
                          className="relative -ml-12 aspect-square w-16 shrink-0 overflow-hidden rounded-full border border-line first:ml-0 lg:w-[72px]"
                        >
                          <GradientPanel tone={toneFor(undefined, maxVisible + index)} interactive />
                          {media?.url && (
                            <Image
                              src={media.url}
                              alt={member.name || 'team member'}
                              fill
                              sizes="72px"
                              className="relative object-cover"
                            />
                          )}
                        </span>
                      )
                    })}
                  </div>

                  <span className="mt-1 inline-flex items-center gap-1 text-sm text-cream transition-all group-hover:gap-2 motion-reduce:group-hover:gap-1 lg:text-base">
                    Meet the Team
                    <ArrowUpRight size={16} aria-hidden />
                  </span>
                </LocalizedLink>
              </Motion>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
