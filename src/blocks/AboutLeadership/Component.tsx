import Motion from '@/components/animation/motion'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutLeadershipBlock, Media, Team } from '@/payload-types'
import { Github, Globe, Linkedin, Twitter } from 'lucide-react'
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
          <h2 className="font-display text-2xl font-medium tracking-[-0.05em] text-cream lg:text-3xl">{heading}</h2>
        ) : null}
        {description ? <p className="mt-3 text-base leading-relaxed text-body">{description}</p> : null}
      </Motion>

      {team.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => {
            const portrait = (member.image as Media | undefined)?.url ?? undefined
            const socials = [
              { href: member.linkedin, Icon: Linkedin, label: 'LinkedIn' },
              { href: member.x, Icon: Twitter, label: 'X' },
              { href: member.github, Icon: Github, label: 'GitHub' },
              { href: member.website, Icon: Globe, label: 'Website' },
            ].filter((s): s is { href: string; Icon: typeof Linkedin; label: string } => Boolean(s.href))
            return (
              <Motion
                key={member.id ?? index}
                className="group relative h-[520px] overflow-hidden rounded-md ring-1 ring-white/5 transition-transform duration-500 ease-out hover:-translate-y-1"
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
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />

                <div className="absolute inset-x-6 bottom-6">
                  {member.name ? (
                    <h3 className="font-display text-2xl font-medium tracking-[-0.05em] text-cream">{member.name}</h3>
                  ) : null}
                  {member.position ? (
                    <p className="mt-2 inline-flex w-fit rounded-full border border-[#757571] px-4 py-1 text-xs text-cream/85 backdrop-blur-sm">
                      {member.position}
                    </p>
                  ) : null}
                  {member.description ? (
                    <RichTextComp
                      content={member.description as RichText}
                      className="mt-3 max-w-none prose-p:mb-0 prose-p:text-sm prose-p:leading-relaxed prose-p:text-cream/75"
                    />
                  ) : member.excerpt ? (
                    <p className="mt-3 text-sm leading-relaxed text-cream/75">{member.excerpt}</p>
                  ) : null}
                  {socials.length ? (
                    <div className="mt-4 flex gap-3">
                      {socials.map(({ href, Icon, label }) => (
                        <Link
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${label} — ${member.name ?? 'team member'}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-cream transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                        >
                          <Icon aria-hidden className="h-4 w-4" />
                        </Link>
                      ))}
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
