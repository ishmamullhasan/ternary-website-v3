'use client'
import type { Media, Story } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

interface AboutProps {
  heading?: string | null
  description?: string | null
  stories?: Story[] | null
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
  stories,
  organizations,
  bottomDescription,
}: AboutProps) {
  return (
    <section className=" py-24 px-6">
      <div className="max-w-[1480px] mx-auto flex flex-col items-center">
        {/* heading */}
        <h1 className="text-center text-3xl md:text-5xl font-light max-w-[900px] leading-tight">
          {heading}
        </h1>

        <p className="text-center text-white/70 mt-4 max-w-[700px]">{description}</p>

        {/* cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 w-full">
          {(stories as Story[])?.map((item, index: number): JSX.Element => {
            return (
              <Link href={`/stories/${item.slug}`} key={index}>
                {/* gradient card */}
                <div className="relative w-[350px] h-[590px] rounded-2xl overflow-hidden group">
                  {/* background image OR gradient */}
                  {item.thumbnail ? (
                    <Image
                      src={(item.thumbnail as Media)?.url as string || 'https://dummyimage.com/350x590/37624F/FFF2'}
                      alt={item.title || 'story'}
                      height={590}
                      width={350}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
                  )}

                 
                  {/* text */}
                  <div className="absolute top-5 left-5 right-5">
                   
                    <h3 className="text-white text-lg leading-snug mt-1 max-w-[220px]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/70">Stories</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && (
          <p className="text-white/60 text-sm mt-20 mb-6">{organizations.heading}</p>
        )}

        <div className="flex flex-row justify-center gap-8">
          {organizations?.organization?.map((item, index) => (
            <Link
              href={item.link || '#'}
              key={index}
              className="flex flex-row items-center rounded-lg bg-[#1B1A17] px-3 py-2"
            >
              <Image
                src={(item.icon as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
                alt={(item.icon as Media)?.alt || 'org'}
                width={30}
                height={30}
                className="object-contain grayscale hover:grayscale-0 transition"
              />
              <p>{item.name}</p>
            </Link>
          ))}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <p className="text-center text-white/60 max-w-[600px] mt-16 text-sm leading-relaxed">
            {bottomDescription}
          </p>
        )}
      </div>
    </section>
  )
}
