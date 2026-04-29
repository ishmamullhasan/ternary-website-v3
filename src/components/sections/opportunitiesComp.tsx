'use client'
import type { Job } from '@/payload-types'
import Link from 'next/link'
import type { JSX } from 'react'

interface OpportunitiesCompProps {
  heading?: string | null
  description?: string | null
  opportunity?: Job[] | null
}

export default function OpportunitiesComp({ heading, description, opportunity }: OpportunitiesCompProps) {
  return (
    <section className="bg-primary  lg:p-10 lg:m-0 m-4 p-4">
      <div className=" ">
        {/* top header */}
        <div className="lg:mb-15 mb-4 lg:w-2/5">
          <h2 className="lg:text-3xl text-2xl font-light mb-3">{heading}</h2>
          <p className="lg:text-base text-sm">{description}</p>
        </div>

        {/* capabilities grid */}
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start ">
          <div className="lg:w-1/5"> </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4 gap-3 lg:pt-5 pt-4">
            {opportunity?.map((item, index): JSX.Element => {
              return (
                <div key={index} className="bg-[#0F0E0E] p-4">
                  <div className="flex flex-row justify-between">
                    <h3 className="lg:text-base text-sm font-semibold mb-2">{item.title}</h3>
                    <p className="lg:text-sm text-xs">{item.code}</p>
                  </div>
                  <p className="lg:text-sm text-xs mb-8">
                    {item.team} <br />
                    {item.department} <br />
                    {item.location} <br />
                    {item.code}
                  </p>
                  <Link href={`/solutions/${item.slug}`} key={index}>
                    <button className="lg:text-sm text-xs ">
                      <u>Explore Role</u>
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
