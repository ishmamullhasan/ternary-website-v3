'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
// Type-only import: JobListing's runtime module (jobs-data) pulls in the Payload config, which must
// never reach the client bundle — see the same pattern in components/sections/job.tsx.
import Link from '@/components/LocalizedLink'
import type { JobListing } from '@/lib/jobs-data'
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
      {/* Header — description first, heading below (Figma 339:13767). Anchors the empty
          left gutter column above the card grid. */}
      <Motion {...reveal} className="lg:mb-14 mb-8 max-w-xl">
        {description && <p className="text-body text-base">{description}</p>}
        <h2 className="mt-4 text-section font-display font-medium text-cream">{heading}</h2>
      </Motion>

      {/* opportunities grid — cards occupy the right 4 columns; the first lg column is the empty
          gutter beneath the header (Figma 339:13770). */}
      {roles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Empty gutter aligned under the header (desktop only). */}
          <div className="hidden lg:block" aria-hidden />
          {roles.map((item: JobListing, index: number): JSX.Element => {
            // The recruiting API exposes no separate `code` — its public `slug` IS the role code
            // (e.g. "BACS31") and is also the detail-page key, so /job/{slug} resolves to the live JD.
            const meta = [item.team, item.department, item.location].filter((value): value is string => Boolean(value))
            return (
              <Motion key={item.slug} {...revealItem(index)}>
                <Link
                  href={`/job/${item.slug}`}
                  className={`group flex h-full flex-col justify-between rounded-md border border-white/[0.06] bg-ink p-4 transition-colors hover:border-line-strong ${focusRing}`}
                >
                  <div className="flex flex-col">
                    {/* Title (Inter Medium 16px) with the role code as a caption top-right. */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-medium text-cream">{item.title}</h3>
                      <span className="shrink-0 text-xs text-cream">{item.slug}</span>
                    </div>
                    {meta.length > 0 && (
                      <div className="mt-1 flex flex-col gap-1">
                        {meta.map((line) => (
                          <span key={line} className="text-sm text-cream">
                            {line}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="mt-auto pt-4 text-sm font-medium text-cream">Explore Role</span>
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
