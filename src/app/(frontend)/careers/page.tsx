'use client'

import 'swiper/css'

import { cn } from '@/lib/utils'
import { CareersPage } from '@/payload-types'
import config from '@/payload.config'
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { useState, type JSX, type ReactNode } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

// Reusable Bento Card Component
type BentoCardProps = {
  title?: string
  desc?: string
  children?: ReactNode
  className?: string
  noIcon?: boolean
  imageBg?: string
  isImageOnly?: boolean
  variant?: 'default' | 'splitImageRight'
}

type SectionProps = {
  title: string
  desc: string
  children: ReactNode
  className?: string
}

export function Section({ title, desc, children, className = '' }: SectionProps): JSX.Element {
  return (
    <section className={cn('space-y-8', className)}>
      <div>
        <h2 className="max-w-none lg:max-w-md text-3xl font-medium text-white tracking-tight mb-2">{title}</h2>
        <p className="max-w-none lg:max-w-2xl text-zinc-400 text-base">{desc}</p>
      </div>
      {children}
    </section>
  )
}

export function BentoCard({
  title,
  desc,
  children,
  className = '',
  noIcon = false,
  imageBg,
  isImageOnly = false,
  variant = 'default',
}: BentoCardProps): JSX.Element {
  if (variant === 'splitImageRight') {
    return (
      <div
        className={cn(
          `bg-main border border-white/5 rounded-lg relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-dark`,
          className,
        )}
      >
        <div className="relative h-full">
          {imageBg && (
            <div className="absolute inset-y-0 right-0 w-full lg:w-1/2">
              <img
                src={imageBg}
                className="absolute inset-0 w-full h-full object-cover opacity-55"
                alt={title ?? 'Card image'}
              />
              <div className="absolute inset-0 bg-linear-to-l from-transparent via-black/35 to-[#050505]"></div>
            </div>
          )}
          <div className="relative z-10 h-full p-8 flex flex-col justify-end max-w-xl">
            {!noIcon && (
              <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm w-fit mb-6">
                <ArrowUpRight className="w-4 h-4 text-white/70" />
              </div>
            )}
            {title && <h3 className="max-w-lg text-2xl font-medium text-white mb-4 tracking-tight">{title}</h3>}
            {desc && <p className="max-w-lg text-zinc-400 text-sm leading-relaxed">{desc}</p>}
          </div>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        `bg-main border border-white/5 rounded-lg p-6 lg:p-8 relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-dark`,
        className,
      )}
    >
      {imageBg && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${imageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {!isImageOnly && !noIcon && (
        <div className="mb-auto relative z-10">
          <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm">
            <ArrowUpRight className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}

      {!isImageOnly && (
        <div className={`mt-auto max-w-lg ${noIcon ? 'h-full flex flex-col justify-end' : ''} relative z-10`}>
          {title && <h3 className="text-lg lg:text-xl font-medium text-white mb-2 tracking-tight">{title}</h3>}
          {desc && <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default async function Page() {
  const getCareersPageData = unstable_cache(
    async () => {
      const payload = await getPayload({ config })
      return payload.findGlobal({ slug: 'careersPage' })
    },
    ['careersPage'],
    { tags: ['careersPage'] },
  )
  const careersPageData: CareersPage | null = await getCareersPageData()

  if (!careersPageData) {
    return (
      <div className="max-w-6xl text-red-700 font-bold flex justify-center items-center p-12">Error loading data.</div>
    )
  }

  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const teamVoices = [
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      quote:
        'Ternary gives me the autonomy to define the architecture for complex distributed systems. The team trusts my judgment.',
      author: 'Shemul Rodriguez',
      role: 'Staff Software Engineer',
    },
    {
      type: 'solid',
      color: 'bg-[#231733]',
      quote:
        'Ternary gives me the autonomy to define the architecture for complex distributed systems. The team trusts my judgment.',
      author: 'Marcus Rodriguez',
      role: 'Staff Software Engineer',
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      quote:
        'Ternary gives me the autonomy to define the architecture for complex distributed systems. The team trusts my judgment.',
      author: 'Shemul Rodriguez',
      role: 'Staff Software Engineer',
    },
    {
      type: 'solid',
      color: 'bg-[#152724]',
      quote:
        'Ternary gives me the autonomy to define the architecture for complex distributed systems. The team trusts my judgment.',
      author: 'Marcus Rodriguez',
      role: 'Staff Software Engineer',
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop',
      quote:
        'Shipping production changes at Ternary feels focused and fast. We solve hard problems with strong pairing and clear ownership.',
      author: 'Aisha Khan',
      role: 'Senior Backend Engineer',
    },
    {
      type: 'solid',
      color: 'bg-[#1f2b3a]',
      quote:
        'Mentorship here is practical and consistent. I get high-signal feedback every week, and that has accelerated my growth.',
      author: 'Daniel Park',
      role: 'Software Engineer II',
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
      quote:
        'Our infra team gives product engineers reliable foundations, so we can move quickly without compromising performance.',
      author: 'Nadia Rahman',
      role: 'Platform Engineer',
    },
    {
      type: 'solid',
      color: 'bg-[#2a1b1f]',
      quote: 'What stands out most is the trust. You are expected to lead initiatives and improve systems end-to-end.',
      author: 'Leo Martins',
      role: 'Staff Frontend Engineer',
    },
  ] as const

  const mockOpenRoles = [
    {
      id: 1,
      title: 'Software Engineer',
      code: 'ENCS3X',
      details: [
        [
          { label: 'Format', value: 'Hybrid' },
          { label: 'Location', value: 'Dhaka, Bangladesh' },
        ],
        [
          { label: 'Compensation', value: '360,000 to 1,080,000/Yearly' },
          { label: 'Experience Level', value: '1 to 3 Years' },
        ],
        [
          { label: 'Type', value: 'Individual Contributor' },
          { label: 'Commitment', value: 'Full Time' },
        ],
      ],
    },
    {
      id: 2,
      title: 'Software Engineer',
      code: 'ENCS3X',
      details: [
        [
          { label: 'Format', value: 'Hybrid' },
          { label: 'Location', value: 'Dhaka, Bangladesh' },
        ],
        [
          { label: 'Compensation', value: '360,000 to 1,080,000/Yearly' },
          { label: 'Experience Level', value: '1 to 3 Years' },
        ],
        [
          { label: 'Type', value: 'Individual Contributor' },
          { label: 'Commitment', value: 'Full Time' },
        ],
      ],
    },
    {
      id: 3,
      title: 'Software Engineer',
      code: 'ENCS3X',
      details: [
        [
          { label: 'Format', value: 'Hybrid' },
          { label: 'Location', value: 'Dhaka, Bangladesh' },
        ],
        [
          { label: 'Compensation', value: '360,000 to 1,080,000/Yearly' },
          { label: 'Experience Level', value: '1 to 3 Years' },
        ],
        [
          { label: 'Type', value: 'Individual Contributor' },
          { label: 'Commitment', value: 'Full Time' },
        ],
      ],
    },
    {
      id: 4,
      title: 'Software Engineer',
      code: 'ENCS3X',
      details: [
        [
          { label: 'Format', value: 'Hybrid' },
          { label: 'Location', value: 'Dhaka, Bangladesh' },
        ],
        [
          { label: 'Compensation', value: '360,000 to 1,080,000/Yearly' },
          { label: 'Experience Level', value: '1 to 3 Years' },
        ],
        [
          { label: 'Type', value: 'Individual Contributor' },
          { label: 'Commitment', value: 'Full Time' },
        ],
      ],
    },
    {
      id: 5,
      title: 'Software Engineer',
      code: 'ENCS3X',
      details: [
        [
          { label: 'Format', value: 'Hybrid' },
          { label: 'Location', value: 'Dhaka, Bangladesh' },
        ],
        [
          { label: 'Compensation', value: '360,000 to 1,080,000/Yearly' },
          { label: 'Experience Level', value: '1 to 3 Years' },
        ],
        [
          { label: 'Type', value: 'Individual Contributor' },
          { label: 'Commitment', value: 'Full Time' },
        ],
      ],
    },
  ] as const

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-white/20">
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-32">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 pr-8">
            <p className="text-zinc-400 text-base">
              Welcome to our company. We build tools that help you work better. Join our team to make an impact.
            </p>
            <h1 className="text-3xl lg:text-[40px] font-medium text-white tracking-tighter leading-[1.1]">
              Agentic Engineering.
              <br />
              Human Orchestration.
            </h1>
            <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
              View Open Roles
            </button>
          </div>
          <div className="aspect-4/3 rounded-3xl overflow-hidden relative border border-white/10">
            {/* Synthetic noisy gradient background to match original image */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] opacity-80 mix-blend-screen"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 contrast-150 mix-blend-overlay"></div>
          </div>
        </section>

        {/* Section 1: More than just a workplace */}
        <Section
          title="More than just a workplace. A platform for impact."
          desc="Our culture is built on trust, autonomy, and a shared passion for creating great things. We believe in giving you the tools and space to do your best work."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[240px]">
            {/* Top Row */}
            <BentoCard
              className="md:col-span-2 row-span-1"
              title="Core production systems"
              desc="Build foundational systems that power our core products, ensuring reliability, scale, and performance across the board."
              imageBg="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"
            />
            <BentoCard
              title="Ship with intention"
              desc="We prioritize thoughtful execution. Every feature, every update is built with a clear purpose and user focus."
            />
            <BentoCard
              title="Build with respect"
              desc="We foster an inclusive environment where diverse perspectives are valued and everyone feels heard."
            />

            {/* Bottom Row */}
            <BentoCard
              title="Communicate directly"
              desc="Open and honest communication is key. We encourage direct feedback and transparent discussions."
            />
            <BentoCard
              title="Drive through ownership"
              desc="Take ownership of your projects from end to end. We empower you to make decisions and drive results."
            />
            <BentoCard
              className="md:col-span-2 relative"
              title="Work with modern stacks"
              desc="We use the latest technologies to build robust and scalable systems. You'll have the opportunity to learn and grow with cutting-edge tools."
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

        {/* Section 2: Work hard. Live fully. */}
        <Section
          className="bg-main p-8 rounded-lg"
          title="Work hard. Live fully."
          desc="We believe that your best work happens when you have a healthy balance. We provide the support and resources you need to thrive both professionally and personally."
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:h-[560px]">
            {/* Left large card */}
            <BentoCard
              className="lg:col-span-2 h-full"
              noIcon
              imageBg="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
              title="Genuine Connection"
              desc="Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong."
            />

            {/* Right stacked cards */}
            <div className="h-full lg:col-span-3 flex flex-col gap-4">
              <BentoCard
                className="lg:col-span-2 p-0 overflow-hidden bg-[#050505]! flex-1"
                title="Genuine Connection"
                desc="Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual support, where everyone feels like they belong."
                imageBg="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
                variant="splitImageRight"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <BentoCard
                  className="h-full bg-[#0f0f0f]!"
                  title="Ship agentic products"
                  desc="Work on products that have a real impact. We build tools that empower users to achieve more."
                />
                <BentoCard
                  className="h-full bg-[#0f0f0f]!"
                  title="Move with velocity"
                  desc="We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly."
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Section 3: Engineering growth */}
        <Section
          title="Engineering growth. Deliberate and structured."
          desc="We are committed to your professional development. We provide clear career paths, mentorship opportunities, and the resources you need to reach your full potential."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Row */}
            <BentoCard
              className="md:col-span-2 relative overflow-hidden"
              title="Structured leveling & clear progression"
              desc="Our career framework provides a clear path for advancement. You'll always know where you stand and what you need to do to reach the next level."
            >
              {/* Simulated Graph Line */}
              <div className="absolute right-0 bottom-0 w-2/3 h-1/2 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-white fill-none">
                  <path
                    d="M0,50 L20,40 L40,45 L60,20 L80,25 L100,0"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 border-t border-white/10 pt-6">
                {[
                  {
                    level: 1,
                    title: 'Foundations',
                  },
                  {
                    level: 2,
                    title: 'Execution',
                  },
                  {
                    level: 3,
                    title: 'Influence',
                  },
                  {
                    level: 4,
                    title: 'Leadership',
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-[#0f0f0f] p-4 rounded-lg flex flex-col items-start justify-center">
                    <div className="text-xs text-zinc-500 mb-1">LEVEL {item.level}</div>
                    <div className="text-sm text-white">{item.title}</div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard
              className="aspect-square"
              title="Mentorship & technical development"
              desc="Learn from experienced engineers through our mentorship program and ongoing technical training."
            />

            {/* Bottom Row */}
            <BentoCard
              title="Competitive compensation & benefits"
              desc="We offer highly competitive salaries, comprehensive health coverage, and generous equity packages."
            />
            <BentoCard
              title="Leadership & influence opportunities"
              desc="Take on leadership roles and shape the technical direction of our products and teams."
            />
            <BentoCard
              className="p-0 border-0 aspect-square"
              noIcon
              imageBg="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop"
              title="Move with velocity"
              desc="Our agile processes ensure we are always building what matters most, quickly and efficiently."
            />
          </div>
        </Section>

        {/* Section 4: Team Voices */}
        <Section
          title="Team voices. Production stories."
          desc="Our engineers share what it's like to maintain production systems, grow through operational accountability, and build careers around technical depth rather than corporate advancement."
        >
          <div className="-mx-6 px-6 lg:mx-0 lg:px-0 pb-4 overflow-hidden">
            <Swiper
              onSwiper={(instance) => {
                setSwiper(instance)
                setCanScrollPrev(!instance.isBeginning)
                setCanScrollNext(!instance.isEnd)
              }}
              onSlideChange={(instance) => {
                setCanScrollPrev(!instance.isBeginning)
                setCanScrollNext(!instance.isEnd)
              }}
              slidesPerView={1.15}
              spaceBetween={16}
              breakpoints={{
                640: { slidesPerView: 1.7, spaceBetween: 20 },
                1024: { slidesPerView: 3.3, spaceBetween: 24 },
              }}
              touchRatio={1}
              touchReleaseOnEdges
            >
              {teamVoices.map((item, i) => (
                <SwiperSlide key={i}>
                  <div
                    className={`relative h-[480px] rounded-xl lg:rounded-lg overflow-hidden ${item.type === 'solid' ? item.color : ''}`}
                  >
                    {item.type === 'image' && (
                      <>
                        <img
                          src={item.image}
                          alt={item.author}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
                        <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform z-10 shadow-lg">
                          <Play className="w-4 h-4 text-black ml-1" fill="currentColor" />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-0 left-0 p-8 w-full z-10 flex flex-col justify-end h-full">
                      <p className="text-white text-[17px] font-medium leading-snug mb-8">"{item.quote}"</p>
                      <div>
                        <div className="text-white text-sm font-medium">{item.author}</div>
                        <div className="text-zinc-400 text-sm mt-0.5">{item.role}</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              disabled={!canScrollPrev}
              className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              disabled={!canScrollNext}
              className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </Section>

        {/* Section 5: Open Roles */}
        <Section
          title="Open Roles"
          desc="Openings for engineers wanting production ownership, technical growth, and operational impact. Roles include client collaboration, architecture, and system responsibility."
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400 font-medium">Filter</label>
              <div className="relative">
                <select
                  className="appearance-none bg-transparent border border-zinc-700 text-zinc-300 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-zinc-500 hover:border-zinc-600 transition-colors text-sm cursor-pointer min-w-[200px]"
                  defaultValue="All Departments"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  size={16}
                  aria-hidden
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400 font-medium">Experience Level</label>
              <div className="relative">
                <select
                  className="appearance-none bg-transparent border border-zinc-700 text-zinc-300 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-zinc-500 hover:border-zinc-600 transition-colors text-sm cursor-pointer min-w-[160px]"
                  defaultValue="All"
                >
                  <option value="All">All</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  size={16}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mockOpenRoles.map((job) => (
              <div
                key={job.id}
                className="bg-main border border-zinc-800 rounded-xl p-6 flex flex-col hover:border-zinc-700 transition-colors duration-300"
              >
                <div className="flex justify-between items-start mb-5 gap-3">
                  <h3 className="text-xl font-semibold text-white tracking-tight">{job.title}</h3>
                  <span className="shrink-0 bg-[#202020] text-zinc-300 px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                    {job.code}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  {job.details.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {row.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-1">
                          <span className="text-zinc-400">{item.label}:</span>
                          <span className="text-zinc-200">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex justify-end">
                  <button
                    type="button"
                    className="flex items-center gap-2 border border-zinc-600 text-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all group"
                  >
                    Learn More
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}
