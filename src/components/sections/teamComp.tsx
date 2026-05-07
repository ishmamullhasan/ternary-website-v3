'use client'
import type { Media } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface TeamCompProps {
  heading?: string | null
  description?: string | null
  members?:
    | {
        name?: string | null
        position?: string | null
        image?: Media | null
        linkedin?: string | null
        id?: string | null
      }[]
    | null
}

export default function TeamComp({ heading, description, members }: TeamCompProps) {
  const [showAll, setShowAll] = useState(false)

  const maxVisible = 3
  const total = members?.length || 0
  const remaining = total - maxVisible

  return (
    <section className="bg-main lg:p-10 p-4 lg:m-0 m-4 text-white">
      <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-8 space-y-4">
        {/* Left Header */}
        <div className="lg:w-1/5 ">
          <p className="lg:text-base text-sm text-[#D5D5D5] mb-3">{description}</p>
          <h2 className="lg:text-2xl text-xl font-semibold">{heading}</h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:w-4/5">
          {/* COLLAPSED VIEW */}
          {!showAll && (
            <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-10 gap-4">
              {members?.slice(0, maxVisible).map((member, index) => {
                const media = member.image as Media | null

                return (
                  <a
                    href={member.linkedin || '#'}
                    key={index}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center text-center lg:w-[180px] w-[100px]"
                  >
                    <div className="lg:w-[72px] lg:h-[72px] w-[50px] h-[50px] rounded-full overflow-hidden mb-4 bg-neutral-300">
                      {media?.url && (
                        <Image
                          src={media.url}
                          alt={member.name || 'member'}
                          width={72}
                          height={72}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    <p className="lg:text-base text-sm">{member.name}</p>
                    <p className="lg:text-sm text-xs mt-1">{member.position}</p>
                  </a>
                )
              })}

              {/* STACKED AVATARS */}
              {remaining > 0 && (
                <div
                  className="flex flex-col items-center text-center lg:w-[100px] w-[80px] cursor-pointer"
                  onClick={() => setShowAll(true)}
                >
                  <div className="flex items-center mb-4">
                    {members?.slice(maxVisible, maxVisible + 3).map((member, index) => {
                      const media = member.image as Media | null

                      return (
                        <div
                          key={index}
                          className="lg:w-[72px] lg:h-[72px] w-[50px] h-[50px] rounded-full overflow-hidden bg-neutral-300 border border-primary -ml-4 first:ml-0"
                        >
                          {media?.url && (
                            <Image
                              src={media.url}
                              alt={member.name || 'member'}
                              width={72}
                              height={72}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <p className="lg:text-sm text-xs">{remaining}+ Orchestrators</p>
                  <p className="lg:text-base text-sm mt-1">
                    <u>Meet the Team</u>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EXPANDED GRID VIEW */}
          {showAll && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 lg:gap-10 gap-4">
                {members?.map((member, index) => {
                  const media = member.image as Media | null

                  return (
                    <Link href={member.linkedin || '#'} key={index} className="flex flex-col items-center text-center">
                      <div className="lg:w-[72px] lg:h-[72px] w-[50px] h-[50px] rounded-full overflow-hidden mb-4 bg-neutral-300">
                        {media?.url && (
                          <Image
                            src={media.url}
                            alt={member.name || 'member'}
                            width={72}
                            height={72}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>

                      <p className="lg:text-sm text-xs">{member.name}</p>
                      <p className="lg:text-base text-sm mt-1">{member.position}</p>
                    </Link>
                  )
                })}
              </div>

              {/* Collapse Button */}
              <div className="flex justify-center lg:mt-10 mt-4">
                <button
                  onClick={() => setShowAll(false)}
                  className="lg:text-sm text-xs text-white/70 hover:text-white transition"
                >
                  <u>Show Less</u>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
