'use client'

import Section from '@/components/layout/section'
import type { Job } from '@/payload-types'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { JSX } from 'react'
import { useState } from 'react'

interface JobsProps {
  jobs: Job[]
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

export default function Jobs({ jobs }: JobsProps): JSX.Element {
  if (!jobs) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  const uniqueDepartments = [
    ...new Set(
      jobs
        .map((job: Job) => job.department)
        .filter((department): department is NonNullable<Job['department']> => Boolean(department && department.trim())),
    ),
  ]
  const uniqueLevels = [
    ...new Set(
      jobs
        .map((job: Job) => job.level)
        .filter((level): level is NonNullable<Job['level']> => Boolean(level && level.trim())),
    ),
  ]
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments')
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredJobs = jobs.filter((job: Job) => {
    if (selectedDepartment !== 'All Departments' && job.department !== selectedDepartment) {
      return false
    }
    if (selectedLevel !== 'All Levels' && job.level !== selectedLevel) {
      return false
    }
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    if (normalizedSearchTerm) {
      const searchableText = [job.title, job.code, job.department, job.level, job.excerpts]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(normalizedSearchTerm)) {
        return false
      }
    }
    return true
  })
  return (
    <Section
      title="Open Roles"
      desc="Openings for engineers wanting production ownership, technical growth, and operational impact. Roles include client collaboration, architecture, and system responsibility."
    >
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8"
        initial={fadeUp.initial}
        whileInView={fadeUp.animate}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.35, delay: 0.06, ease: 'easeOut' }}
      >
        <div className="w-full lg:w-auto lg:min-w-[320px]">
          <label htmlFor="job-search" className="sr-only">
            Search jobs
          </label>
          <input
            id="job-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, code, department, level..."
            className="w-full bg-transparent border border-zinc-700 text-zinc-300 py-2 px-4 rounded-md focus:outline-none focus:border-zinc-500 hover:border-zinc-600 transition-colors text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400 font-medium">Filter</label>
          <div className="relative">
            <select
              className="appearance-none bg-transparent border border-zinc-700 text-zinc-300 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-zinc-500 hover:border-zinc-600 transition-colors text-sm cursor-pointer min-w-[200px]"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              size={16}
              aria-hidden
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400 font-medium">Experience Level</label>
          <div className="relative">
            <select
              className="appearance-none bg-transparent border border-zinc-700 text-zinc-300 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-zinc-500 hover:border-zinc-600 transition-colors text-sm cursor-pointer min-w-[160px]"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              size={16}
              aria-hidden
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(
            (job: Job): JSX.Element => (
              <motion.div
                key={job.id}
                className="bg-main border border-zinc-800 rounded-xl p-6 flex flex-col hover:border-zinc-700 transition-colors duration-300"
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                whileHover={{ y: -2 }}
              >
                <div className="flex justify-between items-start mb-5 gap-3">
                  <h3 className="text-xl font-semibold text-white tracking-tight">{job.title}</h3>
                  <span className="shrink-0 bg-[#202020] text-zinc-300 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                    {job.code}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  {job.excerpts && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <div className="text-zinc-400 flex items-center gap-1">{job.excerpts}</div>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex justify-end">
                  <button
                    type="button"
                    className="flex items-center gap-2 border border-zinc-600 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all group"
                  >
                    Learn More
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
                  </button>
                </div>
              </motion.div>
            ),
          )
        ) : (
          <motion.div
            className="col-span-full text-center text-zinc-400"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <p className="text-lg font-medium text-zinc-400">No jobs found.</p>
            <p className="text-sm text-zinc-400">Please try again later.</p>
          </motion.div>
        )}
      </div>
    </Section>
  )
}
