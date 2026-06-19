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
          imageBg={(item1?.media as Media)?.url || undefined}
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
          {/* Decorative orbital graphic — concentric rings around a glowing core. All motion is
              gated behind motion-reduce so prefers-reduced-motion renders it static. */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 top-1/2 hidden h-32 w-32 -translate-y-1/2 lg:block"
          >
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-white/10 motion-reduce:animate-none"></div>
            <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-white/20 motion-reduce:animate-none"></div>
            <div className="absolute inset-5 animate-ping rounded-full border border-white/20 [animation-duration:2.4s] motion-reduce:animate-none"></div>
            <div className="absolute inset-5 animate-ping rounded-full border border-white/15 [animation-delay:1.2s] [animation-duration:2.4s] motion-reduce:animate-none"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-white/10 backdrop-blur-sm motion-reduce:animate-none">
                <div className="h-2 w-2 rounded-full bg-cream shadow-[0_0_10px_rgba(244,243,236,0.8)]"></div>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>
    </Section>
  )
}
