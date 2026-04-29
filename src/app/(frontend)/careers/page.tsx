import { ArrowUpRight, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import React from 'react'

// Reusable Bento Card Component
type BentoCardProps = {
  title?: string
  desc?: string
  children?: React.ReactNode
  className?: string
  noIcon?: boolean
  imageBg?: string
  isImageOnly?: boolean
}

const BentoCard = ({
  title,
  desc,
  children,
  className = '',
  noIcon = false,
  imageBg,
  isImageOnly = false,
}: BentoCardProps) => {
  return (
    <div
      className={`bg-primary border border-white/5 rounded-lg lg:rounded-4xl p-6 lg:p-8 relative overflow-hidden flex flex-col group transition-all duration-300 hover:bg-[#151515] ${className}`}
      style={
        imageBg
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${imageBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {!isImageOnly && !noIcon && (
        <div className="mb-auto">
          <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm">
            <ArrowUpRight className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}

      {!isImageOnly && (
        <div className={`mt-auto ${noIcon ? 'h-full flex flex-col justify-end' : ''} relative z-10`}>
          {title && <h3 className="text-lg lg:text-xl font-medium text-white mb-2 tracking-tight">{title}</h3>}
          {desc && <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-white/20">
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-32">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 pr-8">
            <p className="text-zinc-400 text-sm">
              Welcome to our company. We build tools that help you work better. Join our team to make an impact.
            </p>
            <h1 className="text-5xl lg:text-7xl font-medium text-white tracking-tighter leading-[1.1]">
              Agentic Engineering.
              <br />
              Human Orchestration.
            </h1>
            <button className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors">
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
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-medium text-white tracking-tight mb-2">
              More than just a workplace. A<br />
              platform for impact.
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Our culture is built on trust, autonomy, and a shared passion for creating great things. We believe in
              giving you the tools and space to do your best work.
            </p>
          </div>

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
                <div className="absolute inset-4 rounded-full border border-white/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Section 2: Work hard. Live fully. */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-medium text-white tracking-tight mb-2">
              Work hard.
              <br />
              Live fully.
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              We believe that your best work happens when you have a healthy balance. We provide the support and
              resources you need to thrive both professionally and personally.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[500px]">
            {/* Left large card */}
            <BentoCard className="lg:col-span-2" noIcon>
              <div className="absolute inset-0 grid grid-cols-2">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    alt="Team collaborating"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]"></div>
                </div>
                <div className="p-8 flex flex-col justify-center bg-[#0f0f0f]">
                  <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm w-fit mb-6">
                    <ArrowUpRight className="w-4 h-4 text-white/70" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">Genuine Connection</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Build meaningful relationships with your colleagues. We foster a culture of collaboration and mutual
                    support, where everyone feels like they belong.
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Right stacked cards */}
            <div className="flex flex-col gap-4">
              <BentoCard
                className="flex-1"
                title="Ship agentic products"
                desc="Work on products that have a real impact. We build tools that empower users to achieve more."
              />
              <BentoCard
                className="flex-1"
                title="Move with velocity"
                desc="We move fast and iterate quickly. You'll have the opportunity to see your work in the hands of users rapidly."
              />
            </div>
          </div>
        </section>

        {/* Section 3: Engineering growth */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-medium text-white tracking-tight mb-2">
              Engineering growth.
              <br />
              Deliberate and structured.
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              We are committed to your professional development. We provide clear career paths, mentorship
              opportunities, and the resources you need to reach your full potential.
            </p>
          </div>

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
              <div className="flex gap-8 mt-8 border-t border-white/10 pt-6">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">LEVEL 1</div>
                  <div className="text-sm text-white">Foundations</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">LEVEL 2</div>
                  <div className="text-sm text-white">Execution</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">LEVEL 3</div>
                  <div className="text-sm text-white">Influence</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-zinc-500 mb-1">LEVEL 4</div>
                  <div className="text-sm text-white">Leadership</div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
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
            <BentoCard className="p-0 border-0" noIcon isImageOnly>
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop"
                alt="Meeting room"
                className="w-full h-full object-cover rounded-lg lg:rounded-4xl opacity-60"
              />
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end bg-linear-to-t from-black/80 to-transparent">
                <div className="p-2 bg-white/5 rounded-full inline-flex backdrop-blur-sm w-fit mb-4">
                  <ArrowUpRight className="w-4 h-4 text-white/70" />
                </div>
                <h3 className="text-lg lg:text-xl font-medium text-white mb-2">Move with velocity</h3>
                <p className="text-zinc-300 text-sm line-clamp-2">
                  Our agile processes ensure we are always building what matters most, quickly and efficiently.
                </p>
              </div>
            </BentoCard>
          </div>
        </section>

        {/* Section 4: Team Voices */}
        <section className="space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-2">
              Team voices.
              <br />
              Production stories.
            </h2>
            <p className="text-zinc-400 text-sm">
              Our engineers share what it's like to maintain production systems, grow through operational
              accountability, and build careers around technical depth rather than corporate advancement.
            </p>
          </div>

          <div className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-6 px-6 lg:mx-0 lg:px-0 pb-4">
            {[
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
            ].map((item, i) => (
              <div
                key={i}
                className={`relative w-[320px] lg:w-[400px] shrink-0 h-[480px] rounded-xl lg:rounded-lg overflow-hidden snap-start ${item.type === 'solid' ? item.color : ''}`}
              >
                {item.type === 'image' && (
                  <>
                    <img src={item.image} alt={item.author} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
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
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </section>

        {/* Section 5: Open Roles */}
        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-medium text-white tracking-tight mb-2">Open Roles</h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              We are looking for passionate individuals to join our team. Explore our open positions and apply today.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <select className="bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-full px-4 py-2 appearance-none pr-10 relative cursor-pointer outline-none focus:border-white/30">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Design</option>
            </select>
            <select className="bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-full px-4 py-2 appearance-none pr-10 relative cursor-pointer outline-none focus:border-white/30">
              <option>All Locations</option>
              <option>Remote</option>
              <option>San Francisco</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
            {[
              { title: 'Software Engineer', dept: 'Product, Applied Research', location: 'San Francisco, CA / Remote' },
              {
                title: 'Software Engineer',
                dept: 'Infrastructure, Core Platform',
                location: 'San Francisco, CA / Remote',
              },
              { title: 'Frontend Engineer', dept: 'Product, Web Experience', location: 'San Francisco, CA / Remote' },
              { title: 'Machine Learning Engineer', dept: 'Applied Research', location: 'San Francisco, CA / Remote' },
            ].map((job, i) => (
              <div
                key={i}
                className="bg-primary border border-white/5 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#151515] transition-colors cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-white">{job.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md text-zinc-400 font-medium">
                      Remote
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400">
                    <span>{job.dept}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{job.location}</span>
                  </div>
                  <p className="text-sm text-zinc-500 max-w-3xl mt-2 line-clamp-1">
                    Join our team to build scalable systems, improve performance, and deliver exceptional experiences
                    for our users globally.
                  </p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap group-hover:bg-white group-hover:text-black transition-all">
                  Learn more <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <button className="text-sm font-medium text-white border-b border-white/20 pb-1 hover:border-white transition-colors">
              View all open roles
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
