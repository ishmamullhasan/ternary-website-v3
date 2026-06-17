import Section from '@/components/layout/section'
import ColumnSection from '@/components/layout/sectionColumn'
import type { Media, SolutionsPageBlock } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { JSX } from 'react'

export const SolutionsPageComponent = (data: SolutionsPageBlock): JSX.Element => {
  const InfoCard = ({
    title,
    description,
    variant = 'compact',
  }: {
    title?: string | null
    description?: string | null
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

  // --- Static decoration (fixed in code, matched to CMS data by index) ---
  // Isometric geometry for the four hero cards.
  const cardShapes = [
    {
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

  // Gradient/bar styling for the three "How We Engage" cards.
  const engageStyles = [
    {
      gradient: 'from-emerald-900/40 to-teal-900/40',
      barColor: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    },
    {
      gradient: 'from-violet-900/40 to-fuchsia-900/40',
      barColor: 'bg-gradient-to-r from-violet-400 to-fuchsia-400',
    },
    {
      gradient: 'from-indigo-900/40 to-purple-900/40',
      barColor: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    },
  ]

  // --- CMS data ---
  const hero = data?.hero
  const heroCards = hero?.cards ?? []
  const s0 = data?.section_2
  const s1 = data?.section_3
  const s2 = data?.section_4
  const s3 = data?.section_5
  const engage = data?.engage
  const engageCards = engage?.cards ?? []
  const cta = data?.cta

  return (
    <main className="min-h-screen space-y-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5">
        <h1 className="text-[40px] font-bold text-white mb-6 leading-tight text-center">{hero?.heading}</h1>
        <p className="text-neutral-400 mb-10 text-base leading-relaxed text-center">{hero?.description}</p>
      </section>

      <section className="relative z-10 shrink-0 mx-auto w-full max-w-7xl px-5">
        <div className="relative flex min-h-[min(70vh,540px)] w-full flex-col justify-end overflow-hidden rounded-xl sm:h-[70vh] sm:min-h-0">
          <Image
            src={(hero?.backgroundImage as Media)?.url || 'https://dummyimage.com/1920x1080/37624F/ffffff'}
            alt={(hero?.backgroundImage as Media)?.alt || ''}
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="relative z-20 px-6 lg:px-8 pb-4 sm:absolute sm:inset-x-0 sm:bottom-0 lg:pb-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {cardShapes.map((card, index) => (
                <div
                  key={index}
                  className="group flex cursor-pointer flex-col items-center rounded-md bg-main px-5 py-6 text-center shadow-xl shadow-black/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f1f1f]/95 md:px-6 md:py-7"
                >
                  <div className="transition-transform duration-500 group-hover:scale-105">
                    <IconShapes cubes={card.cubes} cy={card.cy} />
                  </div>

                  <h3 className="mt-6 mb-1 text-[15px] font-bold leading-snug tracking-wide text-white md:text-base">
                    {heroCards[index]?.title}
                  </h3>

                  <p className="text-[12px] font-normal leading-relaxed tracking-wide text-neutral-400 md:text-[13px]">
                    {heroCards[index]?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Product Engineering */}
      <ColumnSection
        badge={s0?.badge || undefined}
        title={s0?.title || undefined}
        description={s0?.description || undefined}
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src={(s0?.image as Media)?.url || 'https://dummyimage.com/800x600/37624F/ffffff'}
              alt={(s0?.image as Media)?.alt || s0?.badge || ''}
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        }
      >
        <div className="mb-6 rounded-b-xl bg-[#1a1a17] px-8 pb-8 pt-7">
          <span className="block text-sm font-medium text-neutral-300">{s0?.trajectory?.label}</span>

          <div className="mt-14 grid grid-cols-4 gap-4">
            {(s0?.trajectory?.steps ?? []).map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full border text-sm ${
                    step?.active
                      ? 'border-white bg-white text-neutral-950'
                      : 'border-neutral-600 bg-transparent text-white'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-base text-neutral-100">{step?.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 h-px w-full bg-neutral-200" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">{s0?.whoTitle}</h4>
            <p className="text-xl leading-tight text-neutral-400">{s0?.whoDescription}</p>
          </div>
          <div className="rounded-md bg-[#1a1a17] px-8 pb-12 pt-48">
            <h4 className="mb-4 text-3xl font-semibold tracking-tight text-white">{s0?.shapeTitle}</h4>
            <p className="text-xl leading-tight text-neutral-400">{s0?.shapeDescription}</p>
          </div>
        </div>
      </ColumnSection>

      {/* Section 3: Enterprise Transform */}
      <ColumnSection
        badge={s1?.badge || undefined}
        title={s1?.title || undefined}
        description={s1?.description || undefined}
        mainSide="right"
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src={(s1?.image as Media)?.url || 'https://dummyimage.com/800x600/37624F/ffffff'}
              alt={(s1?.image as Media)?.alt || s1?.badge || ''}
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        }
      >
        <div className="grid gap-4">
          <InfoCard title={s1?.whoTitle} description={s1?.whoDescription} variant="large" />
          <InfoCard title={s1?.shapeTitle} description={s1?.shapeDescription} variant="large" />
        </div>
      </ColumnSection>

      {/* Section 4: Engineering Augmentation */}
      <ColumnSection
        badge={s2?.badge || undefined}
        title={s2?.title || undefined}
        description={s2?.description || undefined}
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src={(s2?.image as Media)?.url || 'https://dummyimage.com/800x600/37624F/ffffff'}
              alt={(s2?.image as Media)?.alt || s2?.badge || ''}
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        }
      >
        <div className="mb-10">
          <span className="text-xs text-neutral-500 uppercase mb-4 block">{s2?.techStack?.label}</span>
          <div className="flex gap-3">
            {(s2?.techStack?.items ?? []).map((tech, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${tech?.highlight ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300'}`}
              >
                {tech?.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard title={s2?.whoTitle} description={s2?.whoDescription} />
          <InfoCard title={s2?.shapeTitle} description={s2?.shapeDescription} />
        </div>
      </ColumnSection>

      {/* Section 5: Managed Services */}
      <ColumnSection
        badge={s3?.badge || undefined}
        title={s3?.title || undefined}
        description={s3?.description || undefined}
        mainSide="right"
        aside={
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden">
            <Image
              src={(s3?.image as Media)?.url || 'https://dummyimage.com/800x600/37624F/ffffff'}
              alt={(s3?.image as Media)?.alt || s3?.badge || ''}
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        }
      >
        <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl mb-8">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-2">
            <span>{s3?.incident?.label}</span>
            <span>{s3?.incident?.historyLabel}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: s3?.incident?.totalCells ?? 0 }).map((_, i) => {
              const active = (s3?.incident?.activeCells ?? []).some((c) => c?.position === i + 1)
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${active ? 'bg-emerald-500/50' : 'bg-neutral-800'}`}
                ></div>
              )
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard title={s3?.whoTitle} description={s3?.whoDescription} />
          <InfoCard title={s3?.shapeTitle} description={s3?.shapeDescription} />
        </div>
      </ColumnSection>

      {/* Section 6: How We Engage */}
      <Section title={engage?.heading || undefined} desc={engage?.description || undefined}>
        <div className="grid md:grid-cols-3 gap-6">
          {engageStyles.map((item, i) => (
            <div
              key={i}
              className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full hover:border-neutral-700 transition-colors cursor-pointer"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-white">{engageCards[i]?.title}</h3>
                  <ArrowRight size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-xs font-mono text-neutral-500 mb-4 whitespace-pre-line leading-relaxed">
                  {(engageCards[i]?.subtitle || '').split(' ').map((word, j) => (
                    <div key={j}>{word}</div>
                  ))}
                </div>
                <p className="text-sm text-neutral-400">{engageCards[i]?.description}</p>
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
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{cta?.heading}</h2>
            <p className="text-indigo-200/80 text-sm md:text-base">{cta?.description}</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a
              href={cta?.button_1?.link || '#'}
              className="px-6 py-3 rounded-full bg-white/10 text-white font-medium border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              {cta?.button_1?.label}
            </a>
            <a
              href={cta?.button_2?.link || '#'}
              className="px-6 py-3 rounded-full bg-white text-neutral-950 font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              {cta?.button_2?.label}
            </a>
          </div>
        </div>
      </Section>
    </main>
  )
}

export default SolutionsPageComponent
