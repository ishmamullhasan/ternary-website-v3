'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'
import type { Media } from '@/payload-types'

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
  return (
    <section className="bg-[#1B1A17] w-[1480px] p-10 mx-auto">
      <div className="flex flex-row items-start">
        {/* top header */}
        <div className="w-1/5">
          <h2 className="text-3xl font-light mb-3">{heading}</h2>
          <p className="text-base">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-4/5">
          {(() => {
            const maxVisible = 3
            const total = members?.length || 0
            const visibleMembers = members?.slice(0, maxVisible)
            const remaining = total - maxVisible

            return (
              <>
                {/* Visible Members */}
                {visibleMembers?.map((member, index): JSX.Element => {
                  const media = member.image as Media | null

                  return (
                    <Link
                      href={member.linkedin || '#'}
                      key={index}
                      className="flex flex-col items-center text-center group"
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
                      <p className="text-xs text-white/60 mt-1 max-w-[160px]">{member.position}</p>
                    </Link>
                  )
                })}

                {/* Overflow Indicator */}
                {remaining > 0 && (
                  <div className="flex flex-col items-center text-center cursor-pointer">
                    <div className="w-[72px] h-[72px] rounded-full bg-neutral-300 flex items-center justify-center mb-4 text-lg font-semibold text-black">
                      +{remaining}
                    </div>
                    <p className="text-sm">{remaining}+ Orchestrators</p>
                    <p className="text-xs text-white/60 mt-1">Meet the Team</p>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </section>
  )
}
