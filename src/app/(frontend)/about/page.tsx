import Motion from '@/components/animation/motion'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import RichTextComp, { type RichText } from '@/components/richtext'
import { cn } from '@/lib/utils'
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

  const motionSectionProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  const motionBlockProps = {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.4 as const },
    transition: { duration: 0.35, ease: 'easeOut' as const },
  }

  /** Careers hero image panel: scale + opacity in view */
  const motionGridItemProps = {
    initial: { opacity: 0, scale: 0.985 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: false, amount: 0.35 as const },
    transition: { duration: 0.4, ease: 'easeOut' as const },
  }

  return (
    <div className="flex flex-col lg:gap-32 gap-10 text-primary max-w-7xl mx-auto w-full lg:pb-24 pb-10">
      {/* Hero Section */}
      <Motion tag="section" className="lg:pb-16 pb-8" {...motionSectionProps}>
        <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
          <Motion className="flex flex-col items-center lg:w-3/5" {...motionBlockProps}>
            <h1 className="text-center lg:text-3xl text-2xl font-medium mb-3">{aboutData?.heroSection?.heading}</h1>
            <p className="text-center lg:text-base text-sm text-[#D5D5D5] ">{aboutData?.heroSection?.description}</p>
          </Motion>
        </div>
      </Motion>

      {/* Funding Story Section */}
      <Motion
        tag="section"
        className="lg:m-0 m-4 lg:py-16 py-8 bg-cover bg-center flex items-center justify-center rounded-lg overflow-hidden h-[400px]"
        style={{
          backgroundImage: `url(${
            (aboutData?.fundingStory?.backgroundImage as Media)?.url ||
            'https://hips.hearstapps.com/hmg-prod/images/summer-flowers-1648478322.jpg'
          })`,
        }}
        {...motionSectionProps}
      >
        <div className="w-full mx-auto flex flex-col items-center lg:p-0 p-4">
          <Motion className="flex flex-col items-center lg:w-4/5" {...motionBlockProps}>
            <h1 className="text-center lg:text-3xl text-2xl font-medium mb-3">{aboutData?.fundingStory?.heading}</h1>
            <p className="text-center lg:text-base text-sm text-[#D5D5D5]">{aboutData?.fundingStory?.description}</p>
          </Motion>
        </div>
      </Motion>

      {/* About Section */}
      <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-4 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
        <div className="flex lg:flex-row flex-col  lg:items-start items-center lg:justify-between">
          <Motion className="lg:w-1/5" {...motionBlockProps}>
            <h3 className="lg:text-2xl text-xl mb-3 font-medium">{aboutData?.about?.heading}</h3>
            <p className="lg:text-sm text-xs text-[#D5D5D5]">{aboutData?.about?.description}</p>
          </Motion>

          <Motion className="lg:pl-8 pl-0 lg:pt-0 pt-4 lg:w-4/5" {...motionBlockProps}>
            <RichTextComp content={aboutData?.about?.content as RichText} />
          </Motion>
        </div>
      </Motion>

      {/* Our Thesis */}
      {aboutData?.ourThesis?.heading && (
        <div className="lg:p-0 p-4">
          <Section title={aboutData?.ourThesis?.heading ?? ''} desc={aboutData?.ourThesis?.description ?? ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
              {aboutData?.ourThesis?.items?.map((item, index) => {
                const imageUrl = item.image ? ((item.image as Media)?.url ?? undefined) : undefined
                const isFirst = index === 0
                const isSixth = index === 5
                const cardClass = [isFirst ? 'md:col-span-2 row-span-1' : '', isSixth ? 'md:col-span-2 relative' : '']
                  .filter(Boolean)
                  .join(' ')

                return (
                  <Motion
                    key={item.id ?? `thesis-${index}`}
                    className={cn('min-h-0 h-full', cardClass)}
                    {...motionGridItemProps}
                    transition={{
                      duration: 0.4,
                      ease: 'easeOut',
                      delay: index * 0.05,
                    }}
                  >
                    <BentoCard
                      animated={false}
                      className="h-full min-h-[240px]"
                      title={item.title ?? undefined}
                      desc={item.excerpt ?? undefined}
                      imageBg={isFirst ? imageUrl : undefined}
                    >
                      {isSixth ? (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 hidden lg:block">
                          <div className="absolute inset-0 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite]"></div>
                          <div className="absolute inset-4 rounded-full border border-white/20 animate-[spin_12s_linear_infinite_reverse]"></div>
                          <div className="absolute inset-5 rounded-full border border-white/25 animate-ping animation-duration-[2.4s]"></div>
                          <div className="absolute inset-5 rounded-full border border-white/20 animate-ping animation-duration-[2.4s] [animation-delay:0.8s]"></div>
                          <div className="absolute inset-5 rounded-full border border-white/15 animate-ping animation-duration-[2.4s] [animation-delay:1.6s]"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-[ping_2s_ease-in-out_infinite]"></div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </BentoCard>
                  </Motion>
                )
              })}
            </div>
          </Section>
        </div>
      )}

      {/* what we believe Section */}
      {aboutData?.whatWeBelieve?.heading && (
        <div className="lg:p-0 p-4">
          <Section title={aboutData?.whatWeBelieve?.heading ?? ''} desc={aboutData?.whatWeBelieve?.description ?? ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
              {aboutData?.whatWeBelieve?.items?.map((item, index) => {
                const imageUrl = item.image ? ((item.image as Media)?.url ?? undefined) : undefined
                const isFirst = index === 0
                const isSixth = index === 5
                const cardClass = [isFirst ? 'md:col-span-2 row-span-1' : '', isSixth ? 'md:col-span-2 relative' : '']
                  .filter(Boolean)
                  .join(' ')

                return (
                  <Motion
                    key={item.id ?? `thesis-${index}`}
                    className={cn('min-h-0 h-full', cardClass)}
                    {...motionGridItemProps}
                    transition={{
                      duration: 0.4,
                      ease: 'easeOut',
                      delay: index * 0.05,
                    }}
                  >
                    <BentoCard
                      animated={false}
                      className="h-full min-h-[240px]"
                      title={item.title ?? undefined}
                      desc={item.excerpt ?? undefined}
                      imageBg={isFirst ? imageUrl : undefined}
                    ></BentoCard>
                  </Motion>
                )
              })}
            </div>
          </Section>
        </div>
      )}

      {/* Our Approach Section */}
      {aboutData?.ourApproach?.heading && (
        <div className="lg:p-0 p-4">
          <Section title={aboutData?.ourApproach?.heading ?? ''} desc={aboutData?.ourApproach?.description ?? ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[240px]">
              {aboutData?.ourApproach?.items?.map((item, index) => {
                const imageUrl = item.image ? ((item.image as Media)?.url ?? undefined) : undefined
                const isFirst = index === 0
                const isFifth = index === 4
                const cardClass = [
                  isFirst ? 'md:col-span-2 md:row-span-2 col-span-1 row-span-1' : '',
                  isFifth ? 'md:col-span-2 relative' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <Motion
                    key={item.id ?? `approach-${index}`}
                    className={cn('min-h-0 h-full', cardClass)}
                    {...motionGridItemProps}
                    transition={{
                      duration: 0.4,
                      ease: 'easeOut',
                      delay: index * 0.05,
                    }}
                  >
                    <BentoCard
                      animated={false}
                      className="h-full min-h-[240px]"
                      title={item.title ?? undefined}
                      desc={item.excerpt ?? undefined}
                      imageBg={isFirst ? imageUrl : undefined}
                    ></BentoCard>
                  </Motion>
                )
              })}
            </div>
          </Section>
        </div>
      )}

      {/* Proof at Scale Section */}
      <Motion tag="section" className="bg-[#1B1A17] lg:p-10 p-4 rounded-lg lg:m-0 m-4" {...motionSectionProps}>
        <div className="mb-16">
          <Motion {...motionBlockProps}>
            <h2 className="lg:text-3xl text-2xl font-semibold mb-3">{aboutData?.proofOfScale?.heading}</h2>
            <p className="text-[#D5D5D5] text-base max-w-xl mb-12">{aboutData?.proofOfScale?.description}</p>
          </Motion>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData?.proofOfScale?.items?.map((stat, i) => (
              <Motion
                key={i}
                className="text-center"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              >
                <div className="lg:text-6xl text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg">{stat.title}</div>
              </Motion>
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
              <Motion
                key={index}
                className="bg-[#0F0E0E] p-4 flex flex-col justify-between h-full"
                {...motionGridItemProps}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
              >
                <div>
                  <p className="text-base mb-3">{item.excerpt}</p>
                  <div className="flex gap-2">
                    {item.stack?.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs border border-[#757571] px-2 py-.5 rounded-full">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-semibold mt-15">
                  <Box className="w-4 h-4 " />
                  <span className="text-lg">{item.name}</span>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      </Motion>

      {/* Leadership Section */}

      <Motion
        tag="section"
        className="bg-[#1B1A17] text-white lg:p-10 p-4 rounded-lg lg:m-0 m-4"
        {...motionSectionProps}
      >
        {/* Header */}
        <div className="mb-4 lg:w-2/5">
          <h2 className="lg:text-4xl text-2xl font-bold mb-4">{aboutData?.leadership?.heading}</h2>
          <p className="lg:text-base text-sm text-[#D5D5D5]">{aboutData?.leadership?.description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:pt-0 pt-4">
          {aboutData?.leadership?.members?.map((member, index): JSX.Element => {
            return (
              <Motion
                key={index}
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
              </Motion>
            )
          })}
        </div>
      </Motion>

      {/* CTA */}
      <Motion
        tag="section"
        className="lg:p-10 p-4 bg-cover bg-center rounded-lg overflow-hidden lg:m-0 m-4"
        style={{
          backgroundImage: `url(${
            (aboutData?.cta?.backgroundImage as Media)?.url ||
            'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
          })`,
        }}
        {...motionSectionProps}
      >
        <div className="text-center">
          <Motion {...motionBlockProps}>
            <p className="text-xs mb-4">{aboutData?.cta?.subheading}</p>
            <h2 className="lg:text-4xl text-2xl font-semibold mb-6">{aboutData?.cta?.heading}</h2>
            <p className="text-base md:text-xl max-w-2xl mx-auto mb-10">{aboutData?.cta?.description}</p>
          </Motion>

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
      </Motion>
    </div>
  )
}
