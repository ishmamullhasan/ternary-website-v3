import Corousel from '@/components/animation/corousel'
import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import type { CareersGridTwoBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function CareersGridTwoComponent(props: CareersGridTwoBlock): JSX.Element {
  const item1 = props.items?.[0]
  const item2 = props.items?.[1]
  const item3 = props.items?.[2]
  const item4 = props.items?.[3]
  const mobileCards = [
    {
      title: item1?.title || 'Genuine Connection',
      desc:
        item1?.excerpt ||
        'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.',
      imageBg: (item1?.media as Media)?.url || undefined,
    },
    {
      title: item2?.title || 'Genuine Connection',
      desc:
        item2?.excerpt ||
        'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.',
      imageBg: (item2?.media as Media)?.url || undefined,
    },
    {
      title: item3?.title || 'Ship agentic products',
      desc:
        item3?.excerpt ||
        'Work on products that have a real impact. We build tools that empower users to achieve more.',
    },
    {
      title: item4?.title || 'Move with velocity',
      desc:
        item4?.excerpt ||
        "We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly.",
    },
  ]

  return (
    <Section
      className="bg-ink p-4 lg:p-8 rounded-md border border-line"
      title={props.heading || 'Work hard. Live fully.'}
      desc={
        props.description ||
        'We believe that your best work happens when you have a healthy balance. We provide the support and resources you need to thrive both professionally and personally.'
      }
    >
      <div className="lg:hidden">
        <Corousel variant="careerCards" navVariant="dots" items={mobileCards} />
      </div>
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 lg:h-[560px]">
        {/* Left large card */}
        <BentoCard
          className="lg:col-span-2 h-full"
          noIcon
          imageBg={(item1?.media as Media)?.url || undefined}
          title={item1?.title || 'Genuine Connection'}
          desc={
            item1?.excerpt ||
            'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.'
          }
        />

        {/* Right stacked cards */}
        <div className="h-full lg:col-span-3 flex flex-col gap-4">
          <BentoCard
            className="lg:col-span-2 p-0 overflow-hidden bg-page! flex-1"
            title={item2?.title || 'Genuine Connection'}
            desc={
              item2?.excerpt ||
              'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.'
            }
            imageBg={(item2?.media as Media)?.url || undefined}
            variant="splitImageRight"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <BentoCard
              className="h-full bg-page!"
              title={item3?.title || 'Ship agentic products'}
              desc={
                item3?.excerpt ||
                'Work on products that have a real impact. We build tools that empower users to achieve more.'
              }
            />
            <BentoCard
              className="h-full bg-page!"
              title={item4?.title || 'Move with velocity'}
              desc={
                item4?.excerpt ||
                "We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly."
              }
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
