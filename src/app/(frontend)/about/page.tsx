import type { About, Media } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Box, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

export const dynamic = 'force-dynamic'

export default async function Page(): Promise<JSX.Element> {
  let aboutData: About | null = null
  try {
    aboutData = (await getCachedGlobal('about', 2)()) as About | null
  } catch {
    // Database may be unavailable during build
  }

  if (!aboutData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  return (
    <div className="flex flex-col text-primary max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="lg:pb-16 pb-8">
        <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
          {/* heading */}
          <div className="flex flex-col items-center lg:w-3/5">
            <h1 className="text-center lg:text-3xl text-2xl font-semibold mb-3">{aboutData?.heroSection?.heading}</h1>
            <p className="text-center lg:text-base text-sm text-[#D5D5D5] ">{aboutData?.heroSection?.description}</p>
          </div>
        </div>
      </section>

      {/* Funding Story Section */}
      <section
        className="lg:my-10 my-4 lg:py-16  py-8 lg:m-0 m-4 bg-cover bg-center rounded-lg"
        style={{
          backgroundImage: `url(${
            (aboutData?.fundingStory?.backgroundImage as Media)?.url ||
            'https://hips.hearstapps.com/hmg-prod/images/summer-flowers-1648478322.jpg'
          })`,
        }}
      >
        <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
          <div className="flex flex-col items-center lg:w-4/5">
            <h1 className="text-center lg:text-3xl text-2xl font-semibold mb-3">{aboutData?.fundingStory?.heading}</h1>
            <p className="text-center lg:text-base text-sm text-[#D5D5D5]">{aboutData?.fundingStory?.description}</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4 lg:my-10 my-4">
        <div className="flex  lg:flex-row flex-col lg:mt-20 mt-8 lg:items-start items-center lg:justify-between">
          <div className="lg:w-1/5">
            <h3 className="lg:text-2xl text-xl mb-3 font-semibold">{aboutData?.about?.heading}</h3>
            <p className="lg:text-base text-sm text-[#D5D5D5]">{aboutData?.about?.description}</p>
          </div>

          <div className="lg:pl-8 pl-0 lg:pt-0 pt-4">
            <p className="text-lg text-[#D5D5D5]">{aboutData?.about?.paragraph}</p>
          </div>
        </div>
      </section>

      {/* Proof at Scale Section */}
      <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4 rounded-lg">
        {/* Proof at Scale Section */}
        <div className="mb-16">
          <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{aboutData?.proofOfScale?.heading}</h2>
          <p className="text-[#D5D5D5] text-base max-w-xl mb-12">{aboutData?.proofOfScale?.description}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData?.proofOfScale?.items?.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="lg:text-6xl text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-2/5 mb-10">
          <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{aboutData?.proofOfScale?.company?.heading}</h2>
          <p className="text-[#D5D5D5] text-base mb-12">{aboutData?.proofOfScale?.company?.description}</p>
        </div>
        <div className="flex flex-row">
          <div className="lg:w-1/5"> </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:w-4/5">
            {aboutData?.proofOfScale?.company?.items?.map((item, index) => (
              <div key={index} className="bg-[#0F0E0E] p-4 flex flex-col justify-between">
                <div>
                  <p className="text-base mb-3">{item.excerpt}</p>
                  <div className="flex gap-2">
                    {item.stack?.map((tag, index) => (
                      <span key={index} className="text-xs border border-[#757571] px-2 py-.5 rounded-full">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-semibold mt-15">
                  <Box className="w-4 h-4 " />
                  <span className="text-lg">{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}

      <section className="bg-[#1B1A17] text-white lg:p-10 p-4 lg:my-10 my-4 rounded-lg">
        {/* Header */}
        <div className="mb-4 lg:w-2/5">
          <h2 className="lg:text-4xl text-2xl font-bold mb-4">{aboutData?.leadership?.heading}</h2>
          <p className="lg:text-base text-sm text-[#D5D5D5]">{aboutData?.leadership?.description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4 gap-3 lg:pt-0 pt-4">
          {aboutData?.leadership?.members?.map((member, index): JSX.Element => {
            return (
              <div key={index} className="relative lg:w-[280px] lg:h-[430px] w-[250px]  rounded-lg overflow-hidden">
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

                  {member.story && <p className="text-base mb-2 flex-grow line-clamp-4">{member.story}</p>}

                  {member.specialization && <p className="text-base mb-4">Specialization: {member.specialization}</p>}

                  {/* Socials */}
                  {member.socials && (
                    <div className="flex gap-4">
                      {member.socials?.map((social, i) => (
                        <div key={i} className="flex gap-3">
                          {social.facebook && (
                            <Link
                              href={social.facebook}
                              className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF1A]"
                            >
                              {/* Adding fill="currentColor" makes the icon solid */}
                              <Facebook size={16} fill="currentColor" />
                            </Link>
                          )}
                          {social.linkedin && (
                            <Link
                              href={social.linkedin}
                              className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF1A]"
                            >
                              <Linkedin size={16} fill="currentColor" />
                            </Link>
                          )}
                          {social.twitter && (
                            <Link
                              href={social.twitter}
                              className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF1A] "
                            >
                              <Twitter size={16} fill="currentColor" />
                            </Link>
                          )}
                          {social.instagram && (
                            <Link
                              href={social.instagram}
                              className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF1A]"
                            >
                              <Instagram size={16} />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section
        className="max-w-7xl lg:my-10 my-4 lg:p-10 lg:m-0 m-4 p-4 bg-cover bg-center rounded-lg"
        style={{
          backgroundImage: `url(${
            (aboutData?.cta?.backgroundImage as Media)?.url ||
            'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
          })`,
        }}
      >
        <div className=" text-center">
          {/* Subtle noise/texture overlay can be added here if you have a noise.png asset */}
          <p className="text-xs mb-4">{aboutData?.cta?.subheading}</p>
          <h2 className="lg:text-4xl text-2xl font-semibold mb-6">{aboutData?.cta?.heading}</h2>
          <p className="text-base md:text-xl  max-w-2xl mx-auto mb-10">{aboutData?.cta?.description}</p>

          <div className="flex lg:flex-row flex-col gap-4 justify-center">
            {aboutData?.cta?.button_1?.label && (
              <Link
                href={aboutData?.cta?.button_1?.link as string}
                className="px-8 py-3 bg-[#F4F3EC] text-[#0F0E0E] font-medium rounded-2xl text-base"
              >
                {aboutData?.cta?.button_1?.label}
              </Link>
            )}
            {aboutData?.cta?.button_2?.label && (
              <Link
                href={aboutData?.cta?.button_2?.link as string}
                className="px-8 py-3 bg-[#14120B] font-medium rounded-2xl text-base"
              >
                {aboutData?.cta?.button_2?.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
