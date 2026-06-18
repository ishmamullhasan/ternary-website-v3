import Motion from '@/components/animation/motion'
import type { Media, SolutionsHeroBlock } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

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

export function SolutionsHeroComponent(props: SolutionsHeroBlock): JSX.Element {
  const heroCards = props?.cards ?? []

  return (
    <Motion
      tag="section"
      className="space-y-32"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5">
        <h1 className="text-[40px] font-bold text-white mb-6 leading-tight text-center">{props?.heading}</h1>
        <p className="text-neutral-400 mb-10 text-base leading-relaxed text-center">{props?.description}</p>
      </section>

      <section className="relative z-10 shrink-0 mx-auto w-full max-w-7xl px-5">
        <div className="relative flex min-h-[min(70vh,540px)] w-full flex-col justify-end overflow-hidden rounded-xl sm:h-[70vh] sm:min-h-0">
          <Image
            src={(props?.backgroundImage as Media)?.url || 'https://dummyimage.com/1920x1080/37624F/ffffff'}
            alt={(props?.backgroundImage as Media)?.alt || ''}
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
                    {heroCards[index]?.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Motion>
  )
}

export default SolutionsHeroComponent
