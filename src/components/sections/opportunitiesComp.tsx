'use client'
import Motion from '@/components/animation/motion'
import { EASE, reveal, revealItem } from '@/components/animation/reveal'
// Type-only import: JobListing's runtime module (jobs-data) pulls in the Payload config, which must
// never reach the client bundle — see the same pattern in components/sections/job.tsx.
import MobileCarousel from '@/components/layout/MobileCarousel'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { JobListing } from '@/lib/jobs-data'
import type { JSX } from 'react'

interface OpportunitiesCompProps {
  heading?: string | null
  description?: RichText | string | null
  /** Open roles fetched live from the recruiting system (GET /jobs), newest first. */
  opportunity?: JobListing[] | null
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page'

// Single open-role card — shared by the sm+ grid and the mobile carousel.
function JobCard({ item }: { item: JobListing }): JSX.Element {
  // The recruiting API exposes no separate `code` — its public `slug` IS the role code
  // (e.g. "BACS31") and is also the detail-page key, so /job/{slug} resolves to the live JD.
  const meta = [item.team, item.department, item.location].filter((value): value is string => Boolean(value))

  return (
    <Link
      href={`/job/${item.slug}`}
      className={`group flex h-full min-h-[160px] flex-col rounded-md bg-ink p-5 transition-colors hover:bg-button-dark ${focusRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-medium text-cream">{item.title}</h3>
        <span className="shrink-0 font-display text-xs text-subtle">{item.slug}</span>
      </div>

      {meta.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5 text-sm text-body">
          {meta.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}

      <span className="mt-auto pt-6 text-sm font-medium text-cream">Explore Role</span>
    </Link>
  )
}

export default function OpportunitiesComp({ heading, description, opportunity }: OpportunitiesCompProps) {
  const roles = opportunity ?? []
  return (
    <section className="section-card">
      {/* Header — heading ABOVE the supporting sentence, left-aligned. */}
      <Motion {...reveal} className="mb-8 flex max-w-2xl flex-col lg:mb-14">
        {heading && <h2 className="text-section font-display font-medium text-cream">{heading}</h2>}
        {description && (
          <RichTextComp
            content={description as RichText}
            className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
          />
        )}
      </Motion>

      {/* opportunities grid — cards occupy the right 4 columns; the first lg column is the empty
          gutter beneath the header (Figma 339:13770). */}
      {roles.length > 0 ? (
        <>
          {/* Mobile: horizontal snap carousel with pagination dots. */}
          <MobileCarousel slideClassName="h-[212px] w-[260px]">
            {roles.map((item) => (
              <JobCard key={item.slug} item={item} />
            ))}
          </MobileCarousel>

          {/* sm+ grid — on lg an empty left gutter column (col 1) + a 4-column card grid spanning cols
              2–5, so the cards line up with the Capabilities / Industries sections. Hidden on mobile,
              where the carousel takes over. */}
          <div className="hidden sm:block lg:grid lg:grid-cols-5">
            <div aria-hidden className="hidden lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
              {roles.map((item: JobListing, index: number): JSX.Element => (
                <Motion key={item.slug} {...revealItem(index)} className="h-full">
                  <JobCard item={item} />
                </Motion>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Motion
          tag="div"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-md bg-ink p-6"
        >
          <p className="text-body lg:text-base text-sm">No open roles right now — check back soon.</p>
        </Motion>
      )}
    </section>
  )
}
