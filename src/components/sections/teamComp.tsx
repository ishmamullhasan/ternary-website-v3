'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Media } from '@/payload-types'
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

export default function TeamComp({
  heading,
  description,
  members,
}: TeamCompProps) {
  const [showAll, setShowAll] = useState(false)

  const maxVisible = 3
  const total = members?.length || 0
  const remaining = total - maxVisible 

  return (
    <section className="bg-[#1B1A17] w-full p-10 mx-auto text-white">
      <div className="flex flex-row items-center space-x-8">
        {/* Left Header */}
        <div className="w-1/5 ">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          <p className="text-base text-white/70">{description}</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-4/5">

          {/* COLLAPSED VIEW */}
          {!showAll && (
            <div className="grid grid-cols-4 gap-10">
              {members?.slice(0, maxVisible ).map((member, index) => {
                const media = member.image as Media | null

                return (
                  <a
                    href={member.linkedin || '#'}
                    key={index}
                    target='_blank'
                    rel='noopener noreferrer'
                    className="flex flex-col items-center text-center w-[180px]"
                  >
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-4 bg-neutral-300">
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

                    <p className="text-sm">{member.name}</p>
                    <p className="text-base mt-1">
                      {member.position}
                    </p>
                  </a>
                )
              })}

              {/* STACKED AVATARS */}
              {remaining > 0 && (
                <div
                  className="flex flex-col items-center text-center w-[100px] cursor-pointer"
                  onClick={() => setShowAll(true)}
                >
                  <div className="flex items-center mb-4">
                    {members
                      ?.slice(maxVisible, maxVisible + 3)
                      .map((member, index) => {
                        const media = member.image as Media | null

                        return (
                          <div
                            key={index}
                            className="w-[72px] h-[72px] rounded-full overflow-hidden bg-neutral-300 border border-[#1B1A17] -ml-4 first:ml-0"
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

                  <p className="text-sm">{remaining}+ Orchestrators</p>
                  <p className="text-base mt-1">
                    Meet the Team
                  </p>
                </div>
              )}
            </div>
          )}

          {/* EXPANDED GRID VIEW */}
          {showAll && (
            <>
              <div className="grid grid-cols-4 gap-10">
                {members?.map((member, index) => {
                  const media = member.image as Media | null

                  return (
                    <Link
                      href={member.linkedin || '#'}
                      key={index}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-4 bg-neutral-300">
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

                      <p className="text-sm">{member.name}</p>
                      <p className="text-base mt-1">
                        {member.position}
                      </p>
                    </Link>
                  )
                })}
              </div>

              {/* Collapse Button */}
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setShowAll(false)}
                  className="text-sm text-white/70 hover:text-white transition"
                >
                  Show Less
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}