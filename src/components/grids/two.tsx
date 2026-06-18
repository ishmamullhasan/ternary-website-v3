import Corousel from '@/components/animation/corousel'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import type { CareersPageBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export default function GridTwo({ careersPageData }: { careersPageData: CareersPageBlock }): JSX.Element {
  const item1 = careersPageData.section_3?.item_1
  const item2 = careersPageData.section_3?.item_2
  const item3 = careersPageData.section_3?.item_3
  const item4 = careersPageData.section_3?.item_4
  const mobileCards = [
    {
      title: item1?.heading || 'Genuine Connection',
      desc:
        item1?.description ||
        'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.',
      imageBg: (item1?.image as Media)?.url || undefined,
    },
    {
      title: item2?.heading || 'Genuine Connection',
      desc:
        item2?.description ||
        'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.',
      imageBg: (item2?.image as Media)?.url || undefined,
    },
    {
      title: item3?.heading || 'Ship agentic products',
      desc:
        item3?.description ||
        'Work on products that have a real impact. We build tools that empower users to achieve more.',
    },
    {
      title: item4?.heading || 'Move with velocity',
      desc:
        item4?.description ||
        "We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly.",
    },
  ]

  return (
    <Section
      className="bg-main p-4 lg:p-8 rounded-lg"
      title="Work hard. Live fully."
      desc="We believe that your best work happens when you have a healthy balance. We provide the support and resources you need to thrive both professionally and personally."
    >
      <div className="lg:hidden">
        <Corousel variant="careerCards" navVariant="dots" items={mobileCards} />
      </div>
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 lg:h-[560px]">
        {/* Left large card */}
        <BentoCard
          className="lg:col-span-2 h-full"
          noIcon
          imageBg={
            (item1?.image as Media)?.url ||
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop'
          }
          title={item1?.heading || 'Genuine Connection'}
          desc={
            item1?.description ||
            'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.'
          }
        />

        {/* Right stacked cards */}
        <div className="h-full lg:col-span-3 flex flex-col gap-4">
          <BentoCard
            className="lg:col-span-2 p-0 overflow-hidden bg-[#050505]! flex-1"
            title={item2?.heading || 'Genuine Connection'}
            desc={
              item2?.description ||
              'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.'
            }
            imageBg={
              (item2?.image as Media)?.url ||
              'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop'
            }
            variant="splitImageRight"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <BentoCard
              className="h-full bg-[#0f0f0f]!"
              title={item3?.heading || 'Ship agentic products'}
              desc={
                item3?.description ||
                'Work on products that have a real impact. We build tools that empower users to achieve more.'
              }
            />
            <BentoCard
              className="h-full bg-[#0f0f0f]!"
              title={item4?.heading || 'Move with velocity'}
              desc={
                item4?.description ||
                "We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly."
              }
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
