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
      title={props.heading || 'Work hard. Live fully.'}
      desc={
        props.description ||
        'We believe that your best work happens when you have a healthy balance. We provide the support and resources you need to thrive both professionally and personally.'
      }
    >
      <div className="lg:hidden">
        <Corousel variant="careerCards" navVariant="dots" items={mobileCards} />
      </div>
      {/* Figma 943:5963: tall image on the left (577px / full 600px height) + a 2x2 grid of
          icon+title+desc blocks on the right. No outer card frame — flat on the page. */}
      <div className="hidden lg:grid lg:grid-cols-[577px_1fr] gap-4 lg:h-[600px]">
        {/* Left tall image card. */}
        <BentoCard className="h-full" noIcon isImageOnly imageBg={(item1?.media as Media)?.url || undefined} />

        {/* Right: 2x2 grid of benefit blocks. */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <BentoCard
            className="h-full"
            icon={item1?.icon ?? undefined}
            title={item1?.title || 'Genuine Connection'}
            desc={
              item1?.excerpt ||
              'Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong.'
            }
          />
          <BentoCard className="h-full" noIcon isImageOnly imageBg={(item2?.media as Media)?.url || undefined} />
          <BentoCard
            className="h-full"
            icon={item3?.icon ?? undefined}
            title={item3?.title || 'Ship agentic products'}
            desc={
              item3?.excerpt ||
              'Work on products that have a real impact. We build tools that empower users to achieve more.'
            }
          />
          <BentoCard
            className="h-full"
            icon={item4?.icon ?? undefined}
            title={item4?.title || 'Move with velocity'}
            desc={
              item4?.excerpt ||
              "We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly."
            }
          />
        </div>
      </div>
    </Section>
  )
}
