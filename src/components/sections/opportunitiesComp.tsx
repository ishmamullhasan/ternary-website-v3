'use client'
import type { Media, Capability, Job } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface OpportunitiesCompProps {
  heading?: string | null
  description?: string | null
  opportunity?: Job[] | null
}

export default function OpportunitiesComp({
  heading,
  description,
  opportunity,
}: OpportunitiesCompProps) {
  return (
    <section className="bg-[#1B1A17] w-[1480px] p-10 mx-auto">
      <div className=" ">
        {/* top header */}
        <div className="mb-15 w-2/5">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          <p className="text-base">{description}</p>
        </div>

        {/* capabilities grid */}
        <div className="flex flex-row ">
          <div className="w-1/5"> </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 w-4/5">
            {opportunity?.map((item, index): JSX.Element => {
              return (
                <div key={index} className="bg-[#0F0E0E] p-4">
                  <div className="flex flex-row justify-between">
                    <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm">{item.code}</p>
                  </div>
                  <p className="text-sm mb-8">
                    {item.team} <br />
                    {item.department} <br />
                    {item.location} <br />
                    {item.code}
                  </p>
                  <Link href={`/solutions/${item.slug}`} key={index}>
                    <button className="text-sm ">
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
