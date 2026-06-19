'use client'

import Section from '@/components/layout/section'
import { careersText } from '@/lib/careers-colors'
import type { JobListing } from '@/lib/jobs-data'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import type { JSX } from 'react'
import { useMemo, useState } from 'react'

interface JobsProps {
  /** Server-fetched roles. `null` = upstream fetch failed → error state; `[]` = no open roles. */
  jobs: JobListing[] | null
  heading?: string
  description?: string
  /** Locale segment to prefix job detail links with (WEB-445), e.g. "en". "" keeps legacy links. */
  localePrefix?: string
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', BDT: '৳', GBP: '£', EUR: '€', INR: '₹' }

/**
 * Local, dependency-free comp formatter (mirrors lib/jobs-data's formatComp). Inlined here because
 * this is a 'use client' component — importing the server-bound jobs-data module would pull the
 * Payload config into the client bundle.
 */
function formatComp(min?: number | null, max?: number | null, currency?: string | null): string | null {
  if (min == null && max == null) return null
  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? `${currency} `) : ''
  const money = (n: number) => `${symbol}${n.toLocaleString('en-US')}`
  if (min != null && max != null) return `${money(min)} to ${money(max)}`
  return money((min ?? max) as number)
}

/** A single label:value pair in the structured job-info grid (design 1018:4423). */
function InfoItem({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }): JSX.Element {
  return (
    <p className="text-[14px] leading-[1.5] text-subtle">
      {label}: <span className={`font-medium ${emphasis ? 'text-cream' : 'text-body'}`}>{value}</span>
    </p>
  )
}

/** One open-role card — title + ID pill, a structured info grid, and a ghost "Learn More" link. */
function JobCard({ job, localePrefix }: { job: JobListing; localePrefix: string }): JSX.Element {
  const comp = formatComp(job.comp_band_min, job.comp_band_max, job.comp_currency)
  // Render only rows backed by data so missing facets degrade gracefully (design shows up to 6).
  const info: Array<{ label: string; value: string; emphasis?: boolean }> = [
    job.location ? { label: 'Location', value: job.location, emphasis: true } : null,
    comp ? { label: 'Compensation', value: comp } : null,
    job.seniority_level ? { label: 'Experience Level', value: job.seniority_level } : null,
    job.roleType ? { label: 'Type', value: job.roleType } : null,
    job.employment_type ? { label: 'Commitment', value: job.employment_type } : null,
    job.department ? { label: 'Team', value: job.department } : null,
  ].filter((row): row is { label: string; value: string; emphasis?: boolean } => row !== null)

  return (
    <motion.div
      className="group relative flex flex-col rounded-md border border-line bg-main p-6 transition-colors duration-300 hover:border-white/15 focus-within:border-cream/40"
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-[22px] font-medium leading-[1.15] text-cream">{job.title}</h3>
        {job.code && (
          <span className="shrink-0 rounded-full bg-ink px-4 py-1 text-[13px] font-medium tracking-tight text-cream">
            {job.code}
          </span>
        )}
      </div>

      {info.length > 0 && (
        <div className="mb-6 flex flex-col gap-2">
          {info.map((row) => (
            <InfoItem key={row.label} label={row.label} value={row.value} emphasis={row.emphasis} />
          ))}
        </div>
      )}

      <div className="mt-auto flex justify-end">
        <Link
          href={`${localePrefix}/job/${job.slug}`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-cream/80 bg-ink px-4 text-[14px] font-medium text-cream transition-colors duration-200 hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-main"
        >
          Learn More
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </motion.div>
  )
}

export default function Jobs({ jobs, heading, description, localePrefix = '' }: JobsProps): JSX.Element {
  // Hooks must run unconditionally before any early return (react-hooks/rules-of-hooks).
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments')
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels')

  const uniqueDepartments = useMemo(
    () => [
      ...new Set(
        (jobs ?? [])
          .map((job) => job.department)
          .filter((department): department is string => Boolean(department && department.trim())),
      ),
    ],
    [jobs],
  )
  const uniqueLevels = useMemo(
    () => [
      ...new Set(
        (jobs ?? [])
          .map((job) => job.seniority_level)
          .filter((level): level is string => Boolean(level && level.trim())),
      ),
    ],
    [jobs],
  )

  // `jobs` is fetched server-side; a null/undefined prop means the fetch failed upstream.
  if (!jobs) {
    return (
      <Section title={heading || 'Open Roles'} desc={description}>
        <div className={`col-span-full py-12 text-center ${careersText.muted}`}>
          <p className="text-lg font-medium text-cream">We couldn&rsquo;t load open roles.</p>
          <p className="text-sm">Please refresh the page or check back shortly.</p>
        </div>
      </Section>
    )
  }

  // No roles at all on the live API (the expected state when nothing is open).
  if (jobs.length === 0) {
    return (
      <Section
        title={heading || 'Open Roles'}
        desc={
          description ||
          'Openings for engineers wanting production ownership, technical growth, and operational impact.'
        }
      >
        <div className={`col-span-full py-12 text-center ${careersText.muted}`}>
          <p className="text-lg font-medium text-cream">No open roles right now — check back soon.</p>
          <p className="text-sm">We&rsquo;re always growing; new positions are posted here as they open.</p>
        </div>
      </Section>
    )
  }

  const filteredJobs = jobs.filter((job) => {
    if (selectedDepartment !== 'All Departments' && job.department !== selectedDepartment) return false
    if (selectedLevel !== 'All Levels' && job.seniority_level !== selectedLevel) return false
    return true
  })

  const hasActiveFilters = selectedDepartment !== 'All Departments' || selectedLevel !== 'All Levels'
  const clearFilters = () => {
    setSelectedDepartment('All Departments')
    setSelectedLevel('All Levels')
  }

  const selectClass =
    'appearance-none cursor-pointer rounded-md border border-line-strong bg-transparent py-2 pl-4 pr-10 text-sm text-body transition-colors hover:border-subtle focus:outline-none focus-visible:border-cream/60 focus-visible:ring-2 focus-visible:ring-cream/30'

  return (
    <Section
      title={heading || 'Open Roles'}
      desc={
        description ||
        'Openings for engineers wanting production ownership, technical growth, and operational impact. Roles include client collaboration, architecture, and system responsibility.'
      }
    >
      <motion.div
        className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center"
        initial={fadeUp.initial}
        whileInView={fadeUp.animate}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
      >
        <div className="flex items-center gap-3">
          <label htmlFor="job-department" className={`text-sm font-medium ${careersText.muted}`}>
            Filter
          </label>
          <div className="relative">
            <select
              id="job-department"
              className={`${selectClass} min-w-[200px]`}
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {uniqueDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${careersText.muted}`}
              size={16}
              aria-hidden
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="job-level" className={`text-sm font-medium ${careersText.muted}`}>
            Experience Level
          </label>
          <div className="relative">
            <select
              id="job-level"
              className={`${selectClass} min-w-[160px]`}
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
            >
              <option value="All Levels">All Levels</option>
              {uniqueLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${careersText.muted}`}
              size={16}
              aria-hidden
            />
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-subtle underline-offset-4 transition-colors hover:text-cream hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 focus-visible:rounded-sm"
          >
            Clear filters
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => <JobCard key={job.id ?? job.slug} job={job} localePrefix={localePrefix} />)
        ) : (
          <motion.div
            className={`col-span-full py-8 text-center ${careersText.muted}`}
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <p className="text-lg font-medium text-cream">No roles match your filters.</p>
            <p className="text-sm">Try a different department or experience level.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex h-10 items-center rounded-md border border-cream/80 bg-ink px-4 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </Section>
  )
}
