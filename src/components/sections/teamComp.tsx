'use client'
import Motion from '@/components/animation/motion'
import { EASE } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
import type { Media, Team } from '@/payload-types'
import Image from 'next/image'
import { useState, type JSX } from 'react'

interface TeamCompProps {
  heading?: string | null
  description?: string | null
  members?: Team[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
}

/** A single team member tile: gradient base (the fallback) with optional CMS portrait on top. */
function MemberCard({ member, index }: { member: Team; index: number }): JSX.Element {
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
        <div className="relative mb-4 aspect-square w-14 overflow-hidden rounded-full border border-white/[0.06]">
          <GradientPanel tone={toneFor(undefined, index)} interactive />
          {media?.url && (
            <Image
              src={media.url}
              alt={member.name || 'team member'}
              fill
              sizes="56px"
              className="relative object-cover"
            />
          )}
        </div>

        <p className="text-base font-medium text-cream">{member.name}</p>
        <p className="mt-1 max-w-[160px] text-sm text-cream">{member.position}</p>
      </a>
    </Motion>
  )
}

export default function TeamComp({ heading, description, members }: TeamCompProps) {
  const [showAll, setShowAll] = useState(false)

  if (!members || members.length === 0) return null

  const maxVisible = 3
  const total = members.length
  const remaining = total - maxVisible

  return (
    <section>
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
        {/* Left header — description first, heading below (Figma 339:13754). */}
        <div className="lg:w-1/4">
          {description && <p className="max-w-[238px] text-sm text-body">{description}</p>}
          {heading && <h2 className="mt-3 text-2xl font-display font-medium text-cream">{heading}</h2>}
        </div>

        {/* Member grid */}
        <div className="mt-6 lg:mt-0 lg:w-3/4">
          {/* COLLAPSED VIEW */}
          {!showAll && (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
              {members.slice(0, maxVisible).map((member, index) => (
                <MemberCard key={member.id ?? index} member={member} index={index} />
              ))}

              {/* STACKED AVATARS — opens the full roster */}
              {remaining > 0 && (
                <Motion
                  tag="div"
                  {...motionGridItemProps}
                  transition={{ duration: 0.55, ease: EASE, delay: Math.min(maxVisible * 0.05, 0.4) }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <div className="mb-4 flex items-center">
                      {members.slice(maxVisible, maxVisible + 3).map((member, index) => {
                        const media = (typeof member.image === 'object' ? member.image : null) as Media | null

                        return (
                          <span
                            key={member.id ?? index}
                            className="relative -ml-4 aspect-square w-14 overflow-hidden rounded-full border border-line first:ml-0"
                          >
                            <GradientPanel tone={toneFor(undefined, maxVisible + index)} interactive />
                            {media?.url && (
                              <Image
                                src={media.url}
                                alt={member.name || 'team member'}
                                fill
                                sizes="56px"
                                className="relative object-cover"
                              />
                            )}
                          </span>
                        )
                      })}
                    </div>

                    <p className="text-base font-medium text-cream">{remaining}+ Orchestrators</p>
                    <span className="mt-1 text-sm text-cream">Meet the Team</span>
                  </button>
                </Motion>
              )}
            </div>
          )}

          {/* EXPANDED GRID VIEW */}
          {showAll && (
            <>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {members.map((member, index) => (
                  <MemberCard key={member.id ?? index} member={member} index={index} />
                ))}
              </div>

              {/* Collapse */}
              <div className="mt-6 flex justify-center lg:mt-10">
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="text-sm text-subtle transition-colors hover:text-cream"
                >
                  Show Less
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
