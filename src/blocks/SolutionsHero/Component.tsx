import Motion from '@/components/animation/motion'
import type { Media, SolutionsHeroBlock } from '@/payload-types'
import Image from 'next/image'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
        fill="#b6b5ad"
        stroke="#b6b5ad"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Left face */}
      <polygon
        points={`${px - dx},${py} ${px},${py + dy} ${px},${py + dy + dz} ${px - dx},${py + dz}`}
        fill="#75746f"
        stroke="#75746f"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points={`${px},${py + dy} ${px + dx},${py} ${px + dx},${py + dz} ${px},${py + dy + dz}`}
        fill="#4c4b47"
        stroke="#4c4b47"
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
    <svg className="h-16 w-16 shrink-0 drop-shadow-2xl" viewBox="0 0 100 100" overflow="visible" aria-hidden>
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
  const heroImage = props?.backgroundImage as Media | undefined
  // Only render decorated cells that have CMS-backed copy so missing data collapses gracefully.
  const cells = cardShapes
    .map((shape, index) => ({ shape, card: heroCards[index] }))
    .filter((c) => Boolean(c.card?.title))

  return (
    <section className="mx-auto w-full max-w-7xl px-5">
      {/* Intro block — centered institutional statement. */}
      <div className="flex flex-col items-center gap-5 py-16 text-center lg:py-24">
        {props?.heading ? (
          <Motion
            tag="h1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-[clamp(2rem,4.5vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.02em] text-cream"
          >
            {props.heading}
          </Motion>
        ) : null}
        {props?.description ? (
          <Motion
            tag="p"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            className="max-w-2xl text-[15px] leading-relaxed text-body lg:text-base"
          >
            {props.description}
          </Motion>
        ) : null}
      </div>

      {/* Signature header image — degrades to a brand gradient + grain when media is absent. */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-md ring-1 ring-white/5 sm:aspect-[1480/720]"
      >
        {/* Always-present gradient + grain so the frame never reads as an empty/broken box. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(120% 120% at 30% 10%, #1c1b26 0%, #121119 46%, #0b0a0f 100%)' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
        />
        {heroImage?.url ? (
          <Image
            src={heroImage.url}
            alt={heroImage.alt || ''}
            fill
            sizes="(min-width: 1024px) 1480px, 100vw"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : null}
        {/* Bottom scrim keeps the band beneath cohesive with the photo. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
      </Motion>

      {/* Offering row — four disciplines on a flat band, divided by hairlines (no card fills). */}
      {cells.length > 0 ? (
        <div className="mt-px grid grid-cols-1 divide-y divide-white/5 overflow-hidden rounded-md bg-ink sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {cells.map(({ shape, card }, index) => (
            <Motion
              tag="div"
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.07, 0.42) }}
              className="group flex flex-col items-center px-6 py-8 text-center sm:border-r sm:border-white/5 sm:last:border-r-0 lg:px-7 lg:py-9"
            >
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <IconShapes cubes={shape.cubes} cy={shape.cy} />
              </div>
              <h3 className="font-display mt-5 text-[18px] font-medium leading-snug text-cream">{card?.title}</h3>
              {card?.excerpt ? <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">{card.excerpt}</p> : null}
            </Motion>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default SolutionsHeroComponent
