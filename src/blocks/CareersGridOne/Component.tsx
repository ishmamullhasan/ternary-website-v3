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
      {/* Two rows of asymmetric halves (Figma 943:5900): each half pairs one wide container
          (732px) with a 2-up of narrow cards (358px). Card height ~360px. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Row 1, left half: wide image/graphic card with content anchored bottom-left. */}
        <BentoCard
          className="lg:h-[360px]"
          icon={item1?.icon ?? undefined}
          title={item1?.title || 'Core production systems'}
          desc={
            item1?.excerpt ||
            'Build foundational systems that power our core products, ensuring reliability, scale, and performance across the board.'
          }
          imageBg={(item1?.media as Media)?.url || undefined}
        />
        {/* Row 1, right half: two equal narrow cards. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BentoCard
            className="lg:h-[360px]"
            icon={item2?.icon ?? undefined}
            title={item2?.title || 'Ship with intention'}
            desc={
              item2?.excerpt ||
              'We prioritize thoughtful execution. Every feature, every update is built with a clear purpose and user focus.'
            }
          />
          <BentoCard
            className="lg:h-[360px]"
            icon={item3?.icon ?? undefined}
            title={item3?.title || 'Build with respect'}
            desc={
              item3?.excerpt ||
              'We foster an inclusive environment where diverse perspectives are valued and everyone feels heard.'
            }
          />
        </div>

        {/* Row 2, left half: two equal narrow cards. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BentoCard
            className="lg:h-[360px]"
            icon={item4?.icon ?? undefined}
            title={item4?.title || 'Communicate directly'}
            desc={
              item4?.excerpt ||
              'Open and honest communication is key. We encourage direct feedback and transparent discussions.'
            }
          />
          <BentoCard
            className="lg:h-[360px]"
            icon={item5?.icon ?? undefined}
            title={item5?.title || 'Drive through ownership'}
            desc={
              item5?.excerpt ||
              'Take ownership of your projects from end to end. We empower you to make decisions and drive results.'
            }
          />
        </div>
        {/* Row 2, right half: wide card with the orbital graphic anchored bottom-right. */}
        <BentoCard
          className="relative lg:h-[360px]"
          icon={item6?.icon ?? undefined}
          title={item6?.title || 'Work with modern stacks'}
          desc={
            item6?.excerpt ||
            "We use the latest technologies to build robust and scalable systems. You'll have the opportunity to learn and grow with cutting-edge tools."
          }
        >
          {/* Decorative orbital graphic (Figma 943:5886) — ~200px eggshell ring cluster with a
              glowing core, anchored bottom-right. All motion is gated behind motion-reduce so
              prefers-reduced-motion renders it static. */}
          <div aria-hidden className="pointer-events-none absolute bottom-6 right-6 hidden h-48 w-48 lg:block">
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-cream/30 motion-reduce:animate-none"></div>
            <div className="absolute inset-5 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-cream/20 motion-reduce:animate-none"></div>
            <div className="absolute inset-6 animate-ping rounded-full border border-cream/20 [animation-duration:2.4s] motion-reduce:animate-none"></div>
            <div className="absolute inset-6 animate-ping rounded-full border border-cream/15 [animation-delay:1.2s] [animation-duration:2.4s] motion-reduce:animate-none"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[60px] w-[60px] animate-pulse items-center justify-center rounded-full bg-cream/90 backdrop-blur-sm motion-reduce:animate-none">
                <div className="h-2 w-2 rounded-full bg-ink shadow-[0_0_10px_rgba(244,243,236,0.8)]"></div>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>
    </Section>
  )
}
