import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import type { CareersGrowthBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export function CareersGrowthComponent(props: CareersGrowthBlock): JSX.Element {
  const item1 = props.featured
  const item2 = props.items?.[0]
  const item3 = props.items?.[1]
  const item4 = props.items?.[2]
  const item5 = props.items?.[3]

  return (
    <Section
      title={props.heading || 'Engineering growth. Deliberate and structured.'}
      desc={
        props.description ||
        'We are committed to your professional development. We provide clear career paths, mentorship opportunities, and the resources you need to reach your full potential.'
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Row */}
        <BentoCard
          className="md:col-span-2 relative overflow-hidden"
          title={item1?.title || 'Structured leveling & clear progression'}
          desc={
            item1?.excerpt ||
            "Our career framework provides a clear path for advancement. You'll always know where you stand and what you need to do to reach the next level."
          }
        >
          {/* Simulated Graph Line */}
          <div className="absolute right-0 bottom-0 w-2/3 h-1/2 opacity-20 pointer-events-none z-0">
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-white fill-none">
              <path
                d="M0,48 C8,47 14,44 22,38 C32,30 40,18 50,14 C60,10 70,16 80,10 C90,4 96,2 100,0"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0,44 C8,43 14,40 22,34 C32,26 40,14 50,10 C58,8 66,10 74,12 C80,14 84,13 88,12"
                strokeWidth="1"
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 lg:grid-cols-4">
            {item1?.levels?.map((level, i) => (
              <div
                key={i}
                className="flex flex-col items-start justify-center rounded-lg bg-page px-8 py-4 transition-colors duration-300"
              >
                <div className="font-display text-lg/[1.5] font-medium text-cream opacity-90">{level?.name || ''}</div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard
          className="h-full"
          icon={item2?.icon ?? undefined}
          title={item2?.title || 'Mentorship & technical development'}
          desc={
            item2?.excerpt ||
            'Learn from experienced engineers through our mentorship program and ongoing technical training.'
          }
        />

        {/* Bottom Row */}
        <BentoCard
          icon={item3?.icon ?? undefined}
          title={item3?.title || 'Competitive compensation & benefits'}
          desc={
            item3?.excerpt ||
            'We offer highly competitive salaries, comprehensive health coverage, and generous equity packages.'
          }
        />
        <BentoCard
          icon={item4?.icon ?? undefined}
          title={item4?.title || 'Leadership & influence opportunities'}
          desc={
            item4?.excerpt || 'Take on leadership roles and shape the technical direction of our products and teams.'
          }
        />
        <BentoCard
          className="h-full"
          noIcon
          icon={item5?.icon ?? undefined}
          imageBg={(item5?.media as Media)?.url || undefined}
          title={item5?.title || 'Move with velocity'}
          desc={
            item5?.excerpt ||
            'Our agile processes ensure we are always building what matters most, quickly and efficiently.'
          }
        />
      </div>
    </Section>
  )
}
