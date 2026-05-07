'use client'
import Motion from '@/components/animation/motion'
import type { Job } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

interface OpportunitiesCompProps {
  heading?: string | null
  description?: string | null
  opportunity?: Job[] | null
}

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

export default function OpportunitiesComp({ heading, description, opportunity }: OpportunitiesCompProps) {
  return (
    <section className="bg-main lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
      {/* top header */}
      <div className="lg:mb-15 mb-4 lg:w-2/5">
        <p className="lg:text-base text-sm lg:not-first:max-w-[500px] mb-3 text-[#D5D5D5]">{description}</p>
        <h2 className="lg:text-3xl text-2xl font-semibold">{heading}</h2>
      </div>

      {/* opportunities grid */}
      <div className="flex flex-row">
        <div className="lg:w-1/5"> </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:pt-10 pt-4 w-full lg:w-4/5 lg:pl-8">
          {opportunity?.map((item: Job, index: number): JSX.Element => {
            return (
              <Motion
                key={index}
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
                  <p className="text-xs">{item.code}</p>
                </div>
                <p className="lg:text-sm text-xs mb-8">
                  {item.team} <br />
                  {item.department} <br />
                  {item.location} <br />
                </p>
                <Link href={`/solutions/${item.slug}`} key={index}>
                  <button className="lg:text-base text-xs mt-8">Explore Role</button>
                </Link>
              </Motion>
            )
          })}
        </div>
      </div>
    </section>
  )
}
