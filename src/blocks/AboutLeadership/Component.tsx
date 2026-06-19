import Motion from '@/components/animation/motion'
import type { AboutLeadershipBlock, Media, Team } from '@/payload-types'
import { Linkedin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Leadership grid — "Team voices. Production stories." (design node 1255:3051). Each card is a
 * grayscale portrait filling a 3:4 frame with the name, a role pill and a LinkedIn link anchored to
 * the bottom over a scrim. Portraits desaturate by default and warm to color on hover. No
 * "Specialization" line (per design). Missing media degrades to a brand-token gradient rather than
 * an empty/broken box; an empty members array collapses the whole block.
 */
export function AboutLeadershipComponent({ heading, description, members }: AboutLeadershipBlock): JSX.Element | null {
  const motionBlockProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' as const },
  }

  const team = (members as Team[] | undefined)?.filter(Boolean) ?? []

  if (!heading && team.length === 0) return null

  return (
    <section className="rounded-md bg-main p-6 lg:p-12">
      <Motion className="mb-8 max-w-2xl" {...motionBlockProps} transition={{ duration: 0.6, ease: EASE }}>
        {heading ? (
          <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-cream lg:text-3xl">{heading}</h2>
        ) : null}
        {description ? <p className="mt-3 text-[15px] leading-relaxed text-body">{description}</p> : null}
      </Motion>

      {team.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => {
            const portrait = (member.image as Media | undefined)?.url ?? undefined
            return (
              <Motion
                key={member.id ?? index}
                className="group relative aspect-[3/4] overflow-hidden rounded-md ring-1 ring-white/5 transition-transform duration-500 ease-out hover:-translate-y-1"
                {...motionBlockProps}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
              >
                {portrait ? (
                  <Image
                    src={portrait}
                    alt={member.name ?? 'Team member'}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale transition-[filter,transform] duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    style={{
                      backgroundImage: 'radial-gradient(135% 135% at 22% 14%, #4f6bed 0%, #25307e 44%, #0c1030 100%)',
                    }}
                  />
                )}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.12] mix-blend-overlay"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[#0f0e0e] via-[#0f0e0e]/35 to-transparent"
                />

                <div className="absolute inset-x-5 bottom-5">
                  {member.name ? (
                    <h3 className="text-[17px] font-medium tracking-[-0.01em] text-cream">{member.name}</h3>
                  ) : null}
                  {member.position ? (
                    <p className="mt-2 inline-flex w-fit rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-medium text-cream/85">
                      {member.position}
                    </p>
                  ) : null}
                  {member.linkedin ? (
                    <div className="mt-3">
                      <Link
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn — ${member.name ?? 'team member'}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-cream transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0e0e]"
                      >
                        <Linkedin aria-hidden className="h-4 w-4" fill="currentColor" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              </Motion>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
