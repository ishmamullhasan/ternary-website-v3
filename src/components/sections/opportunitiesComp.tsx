'use client'
import Motion from '@/components/animation/motion'
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

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function OpportunitiesComp({ heading, description, opportunity }: OpportunitiesCompProps) {
  const roles = opportunity ?? []
  return (
    <section className="bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      {/* top header */}
      <div className="lg:mb-15 mb-4 lg:w-2/5">
        <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{heading}</h2>
        <p className="lg:text-base text-sm lg:not-first:max-w-[500px] text-[#D5D5D5]">{description}</p>
      </div>

      {/* opportunities grid */}
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>

        {roles.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
            {roles.map((item: JobListing, index: number): JSX.Element => {
              // The recruiting API exposes no separate `code` — its public `slug` IS the role code
              // (e.g. "BACS31") and is also the detail-page key, so /job/{slug} resolves to the live JD.
              const meta = [item.team, item.department, item.location].filter((value): value is string =>
                Boolean(value),
              )
              return (
                <Motion
                  key={item.slug}
                  className="bg-[#0F0E0E] p-4"
                  {...motionGridItemProps}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  <div className="flex flex-row justify-between">
                    <h3 className="lg:text-base text-sm  mb-2">{item.title}</h3>
                    <p className="text-xs">{item.slug}</p>
                  </div>
                  <p className="lg:text-sm text-xs mb-8">
                    {meta.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                  <Link href={`/job/${item.slug}`}>
                    <button className="lg:text-base text-xs mt-8">Explore Role</button>
                  </Link>
                </Motion>
              )
            })}
          </div>
        ) : (
          <div className="w-full lg:w-4/5 lg:pl-8 lg:pt-10 pt-4 text-[#D5D5D5]">
            <p className="lg:text-base text-sm">No open roles right now — check back soon.</p>
          </div>
        )}
      </div>
    </section>
  )
}
