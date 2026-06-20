'use client'
import Motion from '@/components/animation/motion'
import Link from '@/components/LocalizedLink'
import { GradientPanel, toneFor } from '@/components/sections/stories/gradient'
import type { Capability, Industry, Insight, Media, Model, PressRelease, Scale, Solution, Story } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

type MultiRelation =
  | { relationTo: 'capability'; value: Capability }
  | { relationTo: 'solution'; value: Solution }
  | { relationTo: 'industry'; value: Industry }
  | { relationTo: 'scale'; value: Scale }
  | { relationTo: 'model'; value: Model }
  | { relationTo: 'insight'; value: Insight }
  | { relationTo: 'story'; value: Story }
  | { relationTo: 'pressRelease'; value: PressRelease }

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

const motionGridItemProps = {
  initial: { opacity: 0, scale: 0.985 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.35 as const },
  transition: { duration: 0.4, ease: 'easeOut' as const },
}

function getItemHref(item: MultiRelation): string {
  if (typeof item.value === 'string' || !item.value.slug) return '#'

  switch (item.relationTo) {
    case 'capability':
      return `/capabilities/${item.value.slug}`
    case 'solution':
      return `/solutions/${item.value.slug}`
    case 'industry':
      return `/industries/${item.value.slug}`
    case 'scale':
      return '/scales'
    case 'model':
      return '/solutions'
    case 'insight':
      return `/insights/${item.value.slug}`
    case 'story':
      return `/stories/${item.value.slug}`
    case 'pressRelease':
      return `/press-release/${item.value.slug}`
    default:
      return '#'
  }
}

export default function AboutComp({ heading, description, items, organizations, bottomDescription }: AboutProps) {
  return (
    <section className="lg:pb-16 pb-8">
      <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
        {/* heading */}
        <div className="flex flex-col items-center lg:w-2/5">
          <h1 className="text-center lg:text-4xl text-2xl font-semibold mb-3">{heading}</h1>
          <p className="text-center lg:text-base text-sm text-[#D5D5D5] ">{description}</p>
        </div>
        {/* cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:mt-10 mt-4">
          {(items as MultiRelation[])?.map((item, index: number): JSX.Element => {
            return (
              <Link href={getItemHref(item)} key={index} className="group block">
                {/* gradient card */}
                <Motion
                  className="relative lg:w-[300px] lg:h-[480px] w-[280px]  rounded-lg overflow-hidden"
                  {...motionGridItemProps}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: index * 0.05,
                  }}
                >
                  {/* Cover: the uploaded thumbnail if present, else the signature colorful
                      noise-gradient (content-type tone, falling across the palette by index). */}
                  {(item.value.thumbnail as Media)?.url ? (
                    <Image
                      src={(item.value.thumbnail as Media).url as string}
                      alt={item.value.title || 'cover'}
                      height={(item.value.thumbnail as Media)?.height || 480}
                      width={(item.value.thumbnail as Media)?.width || 300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <GradientPanel tone={toneFor(item.relationTo, index)} interactive />
                  )}

                  {/* text */}
                  <div className="absolute top-5 left-5 right-5">
                    <p className="lg:text-base text-xs">{item.value.excerpts}</p>
                    <p className="lg:text-sm">{item.value.title}</p>
                  </div>
                </Motion>
              </Link>
            )
          })}
        </div>

        {/* organizations */}
        {organizations?.heading && (
          <p className="lg:text-base text-xs lg:mt-15 mt-8 mb-6 text-center">{organizations.heading}</p>
        )}

        <div className="lg:flex lg:flex-row grid grid-cols-2 justify-center lg:gap-5 gap-4">
          {organizations?.organization?.map((item, index) => (
            <Motion
              key={index}
              className="flex flex-row items-center lg:px-3 lg:py-2 px-2 py-1"
              {...motionGridItemProps}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: index * 0.05,
              }}
            >
              <Link href={item.link || '#'} className="flex flex-row items-center">
                <div className="lg:w-auto lg:h-[35px] h-[30px]">
                  <Image
                    src={(item.icon as Media)?.url || 'https://dummyimage.com/365x375/37624F/FFF2'}
                    alt={(item.icon as Media)?.alt || 'org'}
                    width={(item.icon as Media)?.width || 40}
                    height={(item.icon as Media)?.height || 35}
                    className="object-contain grayscale hover:grayscale-0 transition w-full h-full"
                  />
                </div>

                <p className="lg:text-base text-sm pl-2">{item.name}</p>
              </Link>
            </Motion>
          ))}
        </div>

        {/* bottom text */}
        {bottomDescription && (
          <p className="text-center lg:max-w-[900px] lg:mt-15 mt-8 lg:text-sm text-xs">{bottomDescription}</p>
        )}
      </div>
    </section>
  )
}
