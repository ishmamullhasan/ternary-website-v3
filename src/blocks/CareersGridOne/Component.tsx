import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import type { CareersGridOneBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function CareersGridOneComponent(props: CareersGridOneBlock): JSX.Element {
  const item1 = props.items?.[0]
  const item2 = props.items?.[1]
  const item3 = props.items?.[2]
  const item4 = props.items?.[3]
  const item5 = props.items?.[4]
  const item6 = props.items?.[5]
  return (
    <Section
      title={props.heading || 'More than just a workplace. A platform for impact.'}
      desc={
        props.description ||
        'Our culture is built on trust, autonomy, and a shared passion for creating great things. We believe in giving you the tools and space to do your best work.'
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
        {/* Top Row */}
        <BentoCard
          className="md:col-span-2 row-span-1"
          title={item1?.title || 'Core production systems'}
          desc={
            item1?.excerpt ||
            'Build foundational systems that power our core products, ensuring reliability, scale, and performance across the board.'
          }
          imageBg={
            (item1?.media as Media)?.url ||
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop'
          }
        />
        <BentoCard
          title={item2?.title || 'Ship with intention'}
          desc={
            item2?.excerpt ||
            'We prioritize thoughtful execution. Every feature, every update is built with a clear purpose and user focus.'
          }
        />
        <BentoCard
          title={item3?.title || 'Build with respect'}
          desc={
            item3?.excerpt ||
            'We foster an inclusive environment where diverse perspectives are valued and everyone feels heard.'
          }
        />

        {/* Bottom Row */}
        <BentoCard
          title={item4?.title || 'Communicate directly'}
          desc={
            item4?.excerpt ||
            'Open and honest communication is key. We encourage direct feedback and transparent discussions.'
          }
        />
        <BentoCard
          title={item5?.title || 'Drive through ownership'}
          desc={
            item5?.excerpt ||
            'Take ownership of your projects from end to end. We empower you to make decisions and drive results.'
          }
        />
        <BentoCard
          className="md:col-span-2 relative"
          title={item6?.title || 'Work with modern stacks'}
          desc={
            item6?.excerpt ||
            "We use the latest technologies to build robust and scalable systems. You'll have the opportunity to learn and grow with cutting-edge tools."
          }
        >
          {/* Decorative graphic for this card */}
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
        </BentoCard>
      </div>
    </Section>
  )
}
