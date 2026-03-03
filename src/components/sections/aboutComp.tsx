'use client'
import type { Industry, Capability, Media, Solution, Story, Model, Scale } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

type MultiRelation =
  | { relationTo: 'capability'; value: Capability }
  | { relationTo: 'solution'; value: Solution }
  | { relationTo: 'industry'; value: Industry }
  | { relationTo: 'scale'; value: Scale }
  | { relationTo: 'model'; value: Model }

interface AboutProps {
  heading?: string | null
  description?: string | null
  items?: MultiRelation[] | null
  organizations?: {
    heading?: string | null
    organization?:
      | {
          icon?: Media | null
          name?: string | null
          link?: string | null
        }[]
      | null
  } | null
  bottomDescription?: string | null
}

export default function AboutComp({
  heading,
  description,
  items,
  organizations,
  bottomDescription,
}: AboutProps) {
  return (
    <section className="pb-16">
      <div className="w-full mx-auto flex flex-col items-center">
        {/* heading */}
        <div className="flex flex-col items-center w-2/5">
          <h1 className="text-center text-4xl font-light mb-3">{heading}</h1>
          <p className="text-center text-base ">{description}</p>
        </div>
        {/* cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {(items as MultiRelation[])?.map((item, index: number): JSX.Element => {
            return (
              <Link href={`/${item.value.slug}`} key={index}>
                {/* gradient card */}
                <div className="relative w-[300px] h-[480px] rounded-lg overflow-hidden">
                  {/* background image OR gradient */}
                  {item.value.thumbnail ? (
                    <Image
                      src={
                        (item.value.thumbnail as Media)?.url ||
                        'https://dummyimage.com/350x590/37624F/FFF2'
                      }
                      alt={item.value.title || 'story'}
                      height={(item.value.thumbnail as Media)?.height || 480}
                      width={(item.value.thumbnail as Media)?.width || 300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
                  )}

                  {/* text */}
                  <div className="absolute top-5 left-5 right-5">
                    <h3 className="text-base">{item.value.title}</h3>
                    <p className="text-sm">Stories</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && <p className="text-base mt-15 mb-4">{organizations.heading}</p>}

        <div className="flex flex-row justify-center gap-5">
          {organizations?.organization?.map((item, index) => (
            <Link
              href={item.link || '#'}
              key={index}
              className="flex flex-row items-center rounded-lg bg-[#1B1A17] px-3 py-2"
            >
              <div className="w-[30px] h-[30px]">
                <Image
                  src={(item.icon as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
                  alt={(item.icon as Media)?.alt || 'org'}
                  width={(item.icon as Media)?.width || 30}
                  height={(item.icon as Media)?.height || 30}
                  className="object-contain grayscale hover:grayscale-0 transition w-full h-full"
                />
              </div>

              <p className="text-base pl-2">{item.name}</p>
            </Link>
          ))}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <p className="text-justify max-w-[600px] mt-15 text-sm">{bottomDescription}</p>
        )}
      </div>
    </section>
  )
}
