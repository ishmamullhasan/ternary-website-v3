import type { JobsBlockType } from '@/payload-types'

import type { JSX } from 'react'

import JobsList from '@/components/sections/job'
import { getJobs, type JobListing } from '@/lib/jobs-data'

export async function JobsBlockComponent({ heading, description }: JobsBlockType): Promise<JSX.Element> {
  // A null `jobs` prop drives the list's friendly error state; an empty array is the (valid)
  // "no open roles" state. Distinguish a real fetch failure from a genuinely empty live list.
  let jobs: JobListing[] | null
  try {
    jobs = await getJobs()
  } catch {
    jobs = null
  }
  // `#roles` is the canonical deep link (the Contact "Careers" route and the careers hero CTA
  // both target /careers#roles); the scroll-margin keeps the heading clear of the sticky header.
  return (
    <div id="roles" className="scroll-mt-24">
      <JobsList jobs={jobs} heading={heading ?? undefined} description={description ?? undefined} />
    </div>
  )
}
