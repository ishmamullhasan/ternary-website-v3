'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
import GradientPanel, { toneFor } from '@/components/layout/GradientPanel'
// Type-only import: JobListing's runtime module (jobs-data) pulls in the Payload config, which must
// never reach the client bundle — see the same pattern in components/sections/job.tsx.
import type { JobListing } from '@/lib/jobs-data'
import Link from '@/components/LocalizedLink'
import { ArrowUpRight } from 'lucide-react'
import type { JSX } from 'react'

interface OpportunitiesCompProps {
  heading?: string | null
  description?: string | null
  /** Open roles fetched live from the recruiting system (GET /jobs), newest first. */
  opportunity?: JobListing[] | null
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

export default function OpportunitiesComp({ heading, description, opportunity }: OpportunitiesCompProps) {
  const roles = opportunity ?? []
  return (
    <section>
      {/* top header */}
      <Motion {...reveal} className="lg:mb-14 mb-8 max-w-xl">
        <p className="uppercase tracking-[0.14em] text-subtle text-xs mb-4">Open roles</p>
        <h2 className="text-section font-display font-medium text-cream mb-3">{heading}</h2>
        {description && <p className="text-body lg:text-base text-sm">{description}</p>}
      </Motion>

      {/* opportunities grid */}
      {roles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((item: JobListing, index: number): JSX.Element => {
            // The recruiting API exposes no separate `code` — its public `slug` IS the role code
            // (e.g. "BACS31") and is also the detail-page key, so /job/{slug} resolves to the live JD.
            const meta = [item.team, item.department, item.location].filter((value): value is string =>
              Boolean(value),
            )
            return (
              <Motion key={item.slug} {...revealItem(index)}>
                <Link
                  href={`/job/${item.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-md border border-white/[0.06] bg-ink transition-colors hover:border-line-strong ${focusRing}`}
                >
                  {/* Jobs have no CMS media; the signature gradient IS the card's visual anchor. */}
                  <div className="relative aspect-[4/3] w-full">
                    <GradientPanel tone={toneFor(undefined, index)} interactive />
                    <span className="absolute left-4 top-4 z-10 rounded-md bg-page/40 px-2 py-1 font-display text-xs text-cream backdrop-blur-sm">
                      {item.slug}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display font-medium text-cream lg:text-base text-sm mb-2">
                      {item.title}
                    </h3>
                    {meta.length > 0 && (
                      <p className="text-body lg:text-sm text-xs mb-8">
                        {meta.map((line) => (
                          <span key={line}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 text-cream text-sm font-medium transition-colors group-hover:text-cream">
                      Explore role
                      <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
                    </span>
                  </div>
                </Link>
              </Motion>
            )
          })}
        </div>
      ) : (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-md border border-white/[0.06] bg-ink p-6"
        >
          <p className="text-body lg:text-base text-sm">No open roles right now — check back soon.</p>
        </Motion>
      )}
    </section>
  )
}
