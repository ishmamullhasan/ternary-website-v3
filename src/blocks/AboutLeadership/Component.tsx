import Motion from '@/components/animation/motion'
import type { AboutLeadershipBlock, Media, Team } from '@/payload-types'
import { Linkedin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export function AboutLeadershipComponent({ heading, description, members }: AboutLeadershipBlock): JSX.Element {
  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <Motion
      tag="section"
      className="bg-[#1B1A17] text-white lg:p-10 p-4 rounded-lg lg:m-0 m-4"
      {...motionSectionProps}
    >
      {/* Header */}
      <div className="mb-4 lg:w-2/5">
        <h2 className="lg:text-4xl text-2xl font-bold mb-4">{heading}</h2>
        <p className="lg:text-base text-sm text-[#D5D5D5]">{description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:pt-0 pt-4">
        {(members as Team[])?.map((member, index): JSX.Element => {
          return (
            <Motion
              key={member.id ?? index}
              className="relative lg:w-[280px] lg:h-[430px] h-[280px] rounded-lg overflow-hidden"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: index * 0.05,
              }}
            >
              {/* background image OR gradient */}
              {member.image ? (
                <Image
                  src={(member.image as Media)?.url || 'https://dummyimage.com/280x300/37624F/FFF2'}
                  alt={member.name || 'industry'}
                  height={(member.image as Media)?.height || 250}
                  width={(member.image as Media)?.width || 220}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
              )}

              {/* text */}
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-lg font-bold">{member.name}</h3>
                {member.position && (
                  <p className="text-xs border border-[#757571] px-2 py-.5 rounded-full w-fit my-1">
                    {member.position}
                  </p>
                )}

                {member.description && <p className="text-base mb-2 flex-grow line-clamp-4">{member.description}</p>}

                {member.excerpt && <p className="text-base mb-4">Specialization: {member.excerpt}</p>}

                {/* Socials */}
                {member.linkedin && (
                  <div className="flex gap-4">
                    <div className="flex gap-3">
                      <Link
                        href={member.linkedin}
                        className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF1A]"
                      >
                        <Linkedin size={16} fill="currentColor" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Motion>
          )
        })}
      </div>
    </Motion>
  )
}
