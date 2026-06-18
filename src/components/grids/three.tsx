import { BentoCard } from '@/components/layout/bentoCard'
import Section from '@/components/layout/section'
import type { CareersPageBlock, Media } from '@/payload-types'
import type { JSX } from 'react'

export default function GridThree({ careersPageData }: { careersPageData: CareersPageBlock }): JSX.Element {
  const item1 = careersPageData.section_4?.item_1
  const item2 = careersPageData.section_4?.item_2
  const item3 = careersPageData.section_4?.item_3
  const item4 = careersPageData.section_4?.item_4
  const item5 = careersPageData.section_4?.item_5

  return (
    <Section
      title="Engineering growth. Deliberate and structured."
      desc="We are committed to your professional development. We provide clear career paths, mentorship opportunities, and the resources you need to reach your full potential."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Row */}
        <BentoCard
          className="md:col-span-2 relative overflow-hidden"
          title={item1?.heading || 'Structured leveling & clear progression'}
          desc={
            item1?.description ||
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
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2 mt-8 border-t border-white/10 pt-6">
            {item1?.levels?.map((level, i) => (
              <div key={i} className="bg-[#0f0f0f] p-4 rounded-lg flex flex-col items-start justify-center">
                <div className="text-xs text-zinc-500 mb-1">LEVEL {i + 1}</div>
                <div className="text-sm text-white">{level?.name || ''}</div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard
          className="aspect-square"
          title={item2?.heading || 'Mentorship & technical development'}
          desc={
            item2?.description ||
            'Learn from experienced engineers through our mentorship program and ongoing technical training.'
          }
        />

        {/* Bottom Row */}
        <BentoCard
          title={item3?.heading || 'Competitive compensation & benefits'}
          desc={
            item3?.description ||
            'We offer highly competitive salaries, comprehensive health coverage, and generous equity packages.'
          }
        />
        <BentoCard
          title={item4?.heading || 'Leadership & influence opportunities'}
          desc={
            item4?.description ||
            'Take on leadership roles and shape the technical direction of our products and teams.'
          }
        />
        <BentoCard
          className="p-0 border-0 aspect-square"
          noIcon
          imageBg={
            (item5?.image as Media)?.url ||
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop'
          }
          title={item5?.heading || 'Move with velocity'}
          desc={
            item5?.description ||
            'Our agile processes ensure we are always building what matters most, quickly and efficiently.'
          }
        />
      </div>
    </Section>
  )
}
