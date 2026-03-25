'use client'
import type { Capability, Industry, Media, Model, Scale, Solution } from '@/payload-types'
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
    <section className="lg:pb-16 pb-8">
      <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
        {/* heading */}
        <div className="flex flex-col items-center lg:w-2/5">
          <h1 className="text-center lg:text-4xl text-2xl font-light mb-3">{heading}</h1>
          <p className="text-center lg:text-base text-sm ">{description}</p>
        </div>
        {/* cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:mt-10 mt-4">
          {(items as MultiRelation[])?.map((item, index: number): JSX.Element => {
            return (
              <Link href={`/${item.value.slug}`} key={index}>
                {/* gradient card */}
                <div className="relative lg:w-[300px] lg:h-[480px] w-[280px]  rounded-lg overflow-hidden">
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
                    <h3 className="lg:text-base text-sm">{item.value.title}</h3>
                    <p className="lg:text-sm text-xs">Stories</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && <p className="lg:text-base text-xs lg:mt-15 mt-8 mb-4 text-center">{organizations.heading}</p>}

        <div className="lg:flex lg:flex-row grid grid-cols-2 justify-center lg:gap-5 gap-4">
          {organizations?.organization?.map((item, index) => (
            <Link
              href={item.link || '#'}
              key={index}
              className="flex flex-row items-center rounded-lg bg-[#1B1A17] lg:px-3 lg:py-2 px-2 py-1"
            >
              <div className="lg:w-[30px] lg:h-[30px] w-[20px] h-[20px]">
                <Image
                  src={(item.icon as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
                  alt={(item.icon as Media)?.alt || 'org'}
                  width={(item.icon as Media)?.width || 30}
                  height={(item.icon as Media)?.height || 30}
                  className="object-contain grayscale hover:grayscale-0 transition w-full h-full"
                />
              </div>

              <p className="lg:text-base text-sm pl-2">{item.name}</p>
            </Link>
          ))}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <p className="text-justify lg:max-w-[600px] lg:mt-15 mt-8 lg:text-sm text-xs">{bottomDescription}</p>
        )}
      </div>
    </section>
  )
}
