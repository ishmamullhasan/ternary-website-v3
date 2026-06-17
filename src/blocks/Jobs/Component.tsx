import type { JobsBlockType } from '@/payload-types'

import type { JSX } from 'react'

import JobsList from '@/components/sections/job'
import { getJobs } from '@/lib/jobs-data'

export async function JobsBlockComponent({ heading, description }: JobsBlockType): Promise<JSX.Element> {
  const jobs = await getJobs()
  return <JobsList jobs={jobs} heading={heading ?? undefined} description={description ?? undefined} />
}
