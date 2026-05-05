import type { About, Media } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
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
        className="lg:my-10 my-4 lg:py-16  py-8 lg:m-0 m-4 bg-cover bg-center"
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
      {/* <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4 lg:my-10 my-4">
       
        <div className="flex  lg:flex-row flex-col lg:mt-20 mt-8 lg:items-start items-center lg:justify-between">
          <div className="lg:w-1/5">
            <h3 className="lg:text-2xl text-xl mb-3 font-semibold">{aboutData?.about?.heading}</h3>
            <p className="lg:text-base text-sm text-[#D5D5D5]">{aboutData?.about?.description}</p>

          </div>

          <div className="lg:pl-8 pl-0 lg:pt-0 pt-4">
            <RichTextComp content={aboutData?.about?.paragraph as RichText} />
          </div>
        </div>
      </section> */}

      {/* Proof at Scale Section */}
      <section className="bg-[#1B1A17] lg:p-10 lg:m-0 m-4 p-4">
        {/* Proof at Scale Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-3">{aboutData?.proofOfScale?.heading}</h2>
          <p className="text-[#D5D5D5] max-w-xl mb-12">{aboutData?.proofOfScale?.description}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData?.proofOfScale?.items?.map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-2/5 mb-10">
          <h2 className="text-3xl font-semibold">{aboutData?.proofOfScale?.company?.heading}</h2>
          <p className="text-[#D5D5D5] max-w-xl mb-12">{aboutData?.proofOfScale?.company?.description}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {aboutData?.proofOfScale?.company?.items?.map((item, index) => (
            <div key={index} className="bg-[#0F0E0E] p-6 flex flex-col justify-between border border-[#1f1f1f]">
              <div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{item.excerpt}</p>
                <div className="flex gap-2 mb-8">
                  {item.stack?.map((tag, index) => (
                    <span key={index} className="text-[10px] border border-gray-600 px-2 py-1 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 font-semibold">
                <div className="w-6 h-6 bg-white rounded-full" /> {/* Placeholder for Logo */}
                <span>{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="w-full lg:mb-16 mb-6">
        <IndustriesComp
          heading={homePageData.industries?.heading}
          description={homePageData.industries?.description}
          industry={homePageData.industries?.industry as Industry[]}
        />
      </section> */}

      {/* <section className="w-full lg:mb-16 mb-6">
        <EngagementComp
          heading={homePageData.engagement?.heading}
          description={homePageData.engagement?.description}
          model={homePageData.engagement?.model as Model[]}
        />
      </section> */}

      {/* <section className="w-full ">
        <OpportunitiesComp
          heading={homePageData.opportunities?.heading}
          description={homePageData.opportunities?.description}
          opportunity={homePageData.opportunities?.opportunity as Job[] | null}
        />
      </section> */}

      {/* CTA */}
      <section
        className="w-full lg:my-10 my-4 lg:p-10 lg:m-0 m-4 p-4 bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            (aboutData?.cta?.backgroundImage as Media)?.url ||
            'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
          })`,
        }}
      >
        <div className="max-w-7xl mx-auto rounded-3xl text-center text-white  relative overflow-hidden">
          {/* Subtle noise/texture overlay can be added here if you have a noise.png asset */}
          <p className="text-xs uppercase tracking-widest text-gray-300 mb-4">{aboutData?.cta?.subheading}</p>
          <h2 className="lg:text-3xl text-2xl font-semibold mb-6">{aboutData?.cta?.heading}</h2>
          <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            {aboutData?.cta?.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href={aboutData?.cta?.button_1?.link as string}>
              <button className="px-8 py-3 bg-[#F5F5F0] text-black font-medium rounded-2xl hover:bg-white transition-colors text-base">
                {aboutData?.cta?.button_1?.label}
              </button>
            </Link>
            <Link href={aboutData?.cta?.button_2?.link as string}>
              <button className="px-8 py-3 bg-[#1A1A1A] text-white border border-gray-700 font-medium rounded-2xl hover:bg-black transition-colors text-base">
                {aboutData?.cta?.button_2?.label}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
