import Section from '@/components/layout/section'
import ColumnSection from '@/components/layout/sectionColumn'
import { Activity, ArrowRight, Code2, ShieldCheck } from 'lucide-react'
import type { JSX } from 'react'

export default async function Page(): Promise<JSX.Element> {
  const InfoCard = ({
    title,
    description,
    variant = 'compact',
  }: {
    title: string
    description: string
    variant?: 'compact' | 'large'
  }) => (
    <div
      className={
        variant === 'large'
          ? 'min-h-76 rounded-md bg-main p-6 lg:p-8 flex flex-col justify-end'
          : 'bg-neutral-900 border border-neutral-800 rounded-xl p-6'
      }
    >
      <h4
        className={
          variant === 'large'
            ? 'text-2xl font-medium text-neutral-200 mb-4 tracking-tight'
            : 'text-sm font-semibold text-white mb-2'
        }
      >
        {title}
      </h4>
      <p
        className={
          variant === 'large'
            ? 'max-w-xl text-base leading-tight text-neutral-400'
            : 'text-xs text-neutral-400 leading-relaxed'
        }
      >
        {description}
      </p>
    </div>
  )

  // --- Isometric 3D SVG Renderer ---
  // Mathematically projects 3D coordinates (x, y, z) into 2D isometric space.
  const Cube = ({ cx, cy, x, y, z }: { cx: number; cy: number; x: number; y: number; z: number }) => {
    // Isometric projection constants
    const dx = 16
    const dy = 8
    const dz = 16

    // Project 3D coordinates to 2D
    const px = cx + (x - y) * dx
    const py = cy + (x + y) * dy - z * dz

    return (
      <g>
        {/* Top face */}
        <polygon
          points={`${px},${py - dy} ${px + dx},${py} ${px},${py + dy} ${px - dx},${py}`}
          fill="#a3a3a3"
          stroke="#a3a3a3"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        {/* Left face */}
        <polygon
          points={`${px - dx},${py} ${px},${py + dy} ${px},${py + dy + dz} ${px - dx},${py + dz}`}
          fill="#737373"
          stroke="#737373"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        {/* Right face */}
        <polygon
          points={`${px},${py + dy} ${px + dx},${py} ${px + dx},${py + dz} ${px},${py + dy + dz}`}
          fill="#525252"
          stroke="#525252"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </g>
    )
  }

  // Sorts cubes topologically so back/bottom blocks render before front/top blocks
  const IconShapes = ({ cubes, cx = 50, cy = 60 }: { cubes: number[][]; cx?: number; cy?: number }) => {
    const sortedCubes = [...cubes].sort((a, b) => {
      const sumA = a[0] + a[1] + a[2]
      const sumB = b[0] + b[1] + b[2]
      if (sumA !== sumB) return sumA - sumB
      if (a[2] !== b[2]) return a[2] - b[2] // Render bottom-up
      return a[0] - b[0] // Then back-to-front
    })

    return (
      <svg className="mb-4 h-20 w-20 shrink-0 drop-shadow-2xl md:h-21 md:w-21" viewBox="0 0 100 100" overflow="visible">
        {sortedCubes.map((c, i) => (
          <Cube key={i} cx={cx} cy={cy} x={c[0]} y={c[1]} z={c[2]} />
        ))}
      </svg>
    )
  }

  // --- Data Models for Cards ---
  const cardsData = [
    {
      title: 'Product Engineering',
      description: 'Zero-to-one scalable architectures.',
      // Hollow corner shape
      cubes: [
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],
        [0, 1, 0],
        [0, 2, 0],
        [0, 0, 1],
        [0, 1, 1],
        [0, 2, 1],
        [1, 0, 1],
      ],
      cy: 70,
    },
    {
      title: 'Enterprise Transform',
      description: 'Modernization without disruption.',
      // Bridge / Arch shape
      cubes: [
        [0, 0, 0],
        [0, 0, 1],
        [0, 0, 2], // Left pillar
        [3, 0, 0],
        [3, 0, 1],
        [3, 0, 2], // Right pillar
        [1, 0, 2],
        [2, 0, 2], // Connecting bridge
      ],
      cy: 75,
    },
    {
      title: 'Engineering Augmentation',
      description: 'Strategic engineering power.',
      // Staggered ascending stack
      cubes: [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [1, 0, 1],
        [1, 1, 0],
        [0, 1, 1],
        [1, 1, 1],
        [1, 1, 2],
      ],
      cy: 75,
    },
    {
      title: 'Managed Services',
      description: 'We run what we build.',
      // Corner pyramid / Slope
      cubes: [
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],
        [3, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [2, 1, 0],
        [0, 2, 0],
        [1, 2, 0],
        [0, 3, 0],
        [0, 0, 1],
        [1, 0, 1],
        [2, 0, 1],
        [0, 1, 1],
        [1, 1, 1],
        [0, 2, 1],
        [0, 0, 2],
        [1, 0, 2],
        [0, 1, 2],
        [0, 0, 3],
      ],
      cy: 85,
    },
  ]

  return (
    <main className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-4 lg:px-6 space-y-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-0">
        <h1 className="text-[40px] font-bold text-white mb-6 leading-tight text-center">Solutions</h1>
        <p className="text-neutral-400 mb-10 text-base leading-relaxed text-center">
          We help you strategically modernize your core applications. Moving to the cloud, microservices, or rewriting
          complex monoliths without downtime.
        </p>
      </section>

      <section className="relative z-10 shrink-0 mx-auto w-full max-w-7xl px-6 lg:px-0">
        <div className="relative flex min-h-[min(70vh,540px)] w-full flex-col justify-end overflow-hidden rounded-xl sm:h-[70vh] sm:min-h-0">
          <img
            src="https://dummyimage.com/1920x1080/red/FFF"
            alt=""
            className="absolute inset-0 h-full w-full min-h-full object-cover object-center"
          />

          <div className="relative z-20 px-6 lg:px-8 pb-4 sm:absolute sm:inset-x-0 sm:bottom-0 lg:pb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {cardsData.map((card, index) => (
                <div
                  key={index}
                  className="group flex cursor-pointer flex-col items-center rounded-md bg-main px-5 py-6 text-center shadow-xl shadow-black/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f1f1f]/95 md:px-6 md:py-7"
                >
                  <div className="transition-transform duration-500 group-hover:scale-105">
                    <IconShapes cubes={card.cubes} cy={card.cy} />
                  </div>

                  <h3 className="mt-6 mb-1 text-[15px] font-bold leading-snug tracking-wide text-white md:text-base">
                    {card.title}
                  </h3>

                  <p className="text-[12px] font-normal leading-relaxed tracking-wide text-neutral-400 md:text-[13px]">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Product Engineering */}
      <ColumnSection
        badge="Product Engineering"
        title="Modernization without breaking what already works."
        description="We help you strategically modernize your core applications. Moving to the cloud, microservices, or rewriting complex monoliths without downtime."
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 p-8 flex flex-col justify-between border border-white/10 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-white/5"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full border border-white/10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-full border border-white/20"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-xs font-mono text-purple-200/50">PERFORMANCE METRIC</span>
              <Activity className="text-white/50" size={20} />
            </div>

            <div className="relative z-10 text-center">
              <h3 className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">10x</h3>
              <div className="w-12 h-1 bg-white/20 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <p className="text-sm text-white/90">
                Average increase in deployment frequency after implementing our CI/CD pipelines and microservices
                architecture.
              </p>
            </div>
          </div>
        }
      >
        <div className="mb-6 rounded-b-xl bg-[#1a1a17] px-8 pb-8 pt-7">
          <span className="block text-sm font-medium text-neutral-300">Trajectory · 0 → 1</span>

          <div className="mt-14 grid grid-cols-4 gap-4">
            {[
              { step: 1, label: 'Discovery' },
              { step: 2, label: 'Architect' },
              { step: 3, label: 'Build' },
              { step: 4, label: 'Scale' },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                    step === 4
                      ? 'border-white bg-white text-neutral-950'
                      : 'border-neutral-600 bg-transparent text-white'
                  }`}
                >
                  {step}
                </div>
                <span className="text-base text-neutral-100">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 h-px w-full bg-neutral-200" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">Who It&apos;s For</h4>
            <p className="text-xl leading-tight text-neutral-400">
              Founders &amp; Product Leads needing robust MVPs that scale instantly.
            </p>
          </div>
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">Shape</h4>
            <p className="text-xl leading-tight text-neutral-400">
              Pods of 3-5 engineers (Architect, Backend, Frontend, DevOps) for 3-6 months.
            </p>
          </div>
        </div>
      </ColumnSection>

      {/* Section 2: Enterprise Transform */}
      <ColumnSection
        badge="Enterprise Transform"
        title="Modernization without breaking what already works."
        description="We help you strategically modernize your core applications. Moving to the cloud, microservices, or rewriting complex monoliths without downtime."
        mainSide="right"
        aside={
          <div className="space-y-4">
            <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900 to-fuchsia-900 p-8 flex flex-col justify-between border border-white/10">
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-fuchsia-200/50">SYSTEM MIGRATION</span>
                  <span className="text-sm text-white">Data Throughput</span>
                </div>
                <span className="text-xs font-mono text-white/50 border border-white/10 px-2 py-1 rounded">
                  Q3 REPORT
                </span>
              </div>

              <div className="relative z-10 h-1/2 w-full mt-auto flex items-end">
                <div className="absolute bottom-0 w-full h-[1px] bg-white/20"></div>
                <div
                  className="w-full h-full bg-gradient-to-t from-fuchsia-500/40 to-transparent"
                  style={{
                    clipPath: 'polygon(0 100%, 0 60%, 20% 40%, 40% 50%, 60% 20%, 80% 30%, 100% 10%, 100% 100%)',
                  }}
                ></div>
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path
                    d="M0,60 L20,40 L40,50 L60,20 L80,30 L100,10"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1"
                  />
                  <circle cx="20" cy="40" r="1.5" fill="white" />
                  <circle cx="60" cy="20" r="1.5" fill="white" />
                  <circle cx="100" cy="10" r="1.5" fill="white" />
                </svg>
              </div>

              <div className="relative z-10 flex justify-between text-[10px] text-white/40 mt-4 border-t border-white/10 pt-4">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
              </div>
            </div>

            <InfoCard
              title="Engagement Shape"
              description="Dedicated pods of 3-5 engineers (Architect, Backend, Frontend, DevOps) for 3-6 months."
              variant="large"
            />
          </div>
        }
      >
        <div className="grid gap-4">
          <InfoCard
            title="Who It's For"
            description="Founders & Product Leads needing robust MVPs that scale instantly."
            variant="large"
          />
          <InfoCard
            title="Engagement Shape"
            description="Dedicated pods of 3-5 engineers (Architect, Backend, Frontend, DevOps) for 3-6 months."
            variant="large"
          />
        </div>
      </ColumnSection>

      {/* Section 3: Engineering Augmentation */}
      <ColumnSection
        badge="Engineering Augmentation"
        title="Senior engineers, plugged into your sprint."
        description="Need to accelerate delivery? We provide battle-tested senior engineers who seamlessly integrate into your team, ceremonies, and codebase."
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-red-900 via-orange-900 to-amber-950 p-8 flex flex-col justify-between border border-white/10">
            <div className="relative z-10 flex justify-between items-start mb-8">
              <span className="text-xs font-mono text-orange-200/50">VELOCITY IMPACT</span>
              <Code2 className="text-white/50" size={20} />
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center gap-4">
              {[
                { task: 'Initial onboarding & setup', time: '1 week' },
                { task: 'First feature shipped', time: '2 weeks' },
                { task: 'Full integration velocity', time: '1 month' },
                { task: 'Architecture refactor start', time: '3 months' },
                { task: 'Major version release', time: '6 months' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50">
                      {i + 1}
                    </span>
                    {item.task}
                  </div>
                  <span className="text-white font-mono opacity-60">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
              <span className="text-sm text-white/60">Average increase in sprint velocity</span>
              <span className="text-4xl font-bold text-white">40%</span>
            </div>
          </div>
        }
      >
        <div className="mb-10">
          <span className="text-xs text-neutral-500 uppercase mb-4 block">Current Tech Stack</span>
          <div className="flex gap-3">
            {['JS', 'TS', 'RE', 'ND', 'GO', '+12'].map((tech, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${i === 5 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'}`}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard
            title="Who is for"
            description="Teams with existing roadmaps that need immediate velocity boosts."
          />
          <InfoCard title="Shape" description="Individual contributors or small pods joining your workflow." />
        </div>
      </ColumnSection>

      {/* Section 4: Managed Services */}
      <ColumnSection
        badge="Managed Services"
        title="Modernization without breaking what already works."
        description="We take over the operational burden. 24/7 monitoring, incident response, and continuous optimization of your infrastructure."
        mainSide="right"
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-950 p-8 flex flex-col justify-between border border-white/10">
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-emerald-200/50">SYSTEM UPTIME</span>
                <h3 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mt-2">99.99%</h3>
              </div>
              <ShieldCheck className="text-white/50" size={24} />
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-end gap-[2px] h-32 mb-4">
                {Array.from({ length: 40 }).map((_, i) => {
                  const isWarning = i === 12 || i === 28
                  const height = isWarning ? '60%' : `${85 + Math.random() * 15}%`
                  const color = isWarning ? 'bg-amber-400' : 'bg-emerald-400'

                  return <div key={i} className={`w-full rounded-t-sm opacity-80 ${color}`} style={{ height }}></div>
                })}
              </div>

              <div className="flex justify-between text-xs text-white/50 border-t border-white/10 pt-4">
                <span>US-EAST</span>
                <span>EU-WEST</span>
                <span>AP-SOUTH</span>
              </div>
            </div>

            <div className="relative z-10 mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/80">
                Proactive monitoring and automated failover systems ensuring your product never sleeps.
              </p>
            </div>
          </div>
        }
      >
        <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl mb-8">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-2">
            <span>INCIDENT RESPONSE</span>
            <span>30D HISTORY</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm ${i === 7 || i === 14 ? 'bg-emerald-500/50' : 'bg-neutral-800'}`}
              ></div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard
            title="Who is for"
            description="Products requiring high availability and rigorous compliance standards."
          />
          <InfoCard title="Shape" description="Always-on SLA backed support and SRE teams." />
        </div>
      </ColumnSection>

      {/* Section 5: How We Engage */}
      <Section
        title="How We Engage"
        desc="We adapt to your needs. Choose from structured projects, continuous delivery pods, or fully managed technical orchestration."
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Frame™',
              subtitle: 'Fixed scope Fixed timeline Fixed price',
              desc: 'Perfect for defined projects with clear outcomes. We build it, you own it.',
              gradient: 'from-emerald-900/40 to-teal-900/40',
              barColor: 'bg-gradient-to-r from-emerald-400 to-teal-400',
            },
            {
              title: 'Flow™',
              subtitle: 'Continuous delivery Ongoing partnership',
              desc: 'A dedicated pod operating as an extension of your team, delivering value continuously.',
              gradient: 'from-violet-900/40 to-fuchsia-900/40',
              barColor: 'bg-gradient-to-r from-violet-400 to-fuchsia-400',
            },
            {
              title: 'Orchestra™',
              subtitle: 'Full technology management Multi-vendor orchestration',
              desc: 'We act as your CTO office, managing multiple streams, vendors, and strategic technical direction.',
              gradient: 'from-indigo-900/40 to-purple-900/40',
              barColor: 'bg-gradient-to-r from-indigo-400 to-purple-400',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full hover:border-neutral-700 transition-colors cursor-pointer"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  <ArrowRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-xs font-mono text-neutral-500 mb-4 whitespace-pre-line leading-relaxed">
                  {item.subtitle.split(' ').map((word, j) => (
                    <div key={j}>{word}</div>
                  ))}
                </div>
                <p className="text-sm text-neutral-400">{item.desc}</p>
              </div>

              <div className={`h-32 mt-auto bg-gradient-to-b ${item.gradient} relative`}>
                <div
                  className={`absolute bottom-6 left-6 right-6 h-12 rounded-lg opacity-80 ${item.barColor} blur-[2px]`}
                ></div>
                <div
                  className={`absolute bottom-6 left-6 right-6 h-12 rounded-lg opacity-50 ${item.barColor} blur-xl`}
                ></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.1),transparent)]"></div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-950 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between border border-indigo-500/20 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="relative z-10 mb-8 md:mb-0 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to build?</h2>
            <p className="text-indigo-200/80 text-sm md:text-base">
              Talk to our technical experts today and discover how we can help accelerate your engineering efforts.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-white/10 text-white font-medium border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              Book a strategy call
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-white text-neutral-950 font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              Get in touch
            </button>
          </div>
        </div>
      </Section>
    </main>
  )
}
