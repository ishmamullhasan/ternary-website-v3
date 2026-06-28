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
      {/* Intro block — centered institutional statement (Figma: ~72px top pad, 24px headline→desc gap). */}
      <div className="flex flex-col items-center gap-6 py-[72px] text-center">
        {props?.heading ? (
          <Motion
            tag="h1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-3xl font-medium leading-[1.15] tracking-[-0.05em] text-cream"
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
            className="max-w-3xl text-base leading-[1.5] text-body"
          >
            {props.description}
          </Motion>
        ) : null}
      </div>

      {/* Signature header image with the four offering cards overlaid on the bottom (Figma 1480×843). */}
      <Motion
        tag="div"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-md ring-1 ring-line sm:aspect-[1480/843]"
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
        {/* Bottom scrim keeps the overlaid cards legible against the photo. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />

        {/* Offering row — four disciplines as separate frosted cards inset over the bottom of the
            photo (Figma: gaps between cards, ~32px outer inset). */}
        {cells.length > 0 ? (
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 p-4 sm:p-6 lg:grid-cols-4 lg:gap-4 lg:p-8">
            {cells.map(({ shape, card }, index) => (
              <Motion
                tag="div"
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.07, 0.42) }}
                className="group flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-ink/75 px-5 py-6 text-center backdrop-blur-md lg:px-6 lg:py-7"
              >
                <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
                  <IconShapes cubes={shape.cubes} cy={shape.cy} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-[18px] font-medium leading-[1.2] text-cream">{card?.title}</h3>
                  {card?.excerpt ? <p className="text-[12px] leading-relaxed text-subtle">{card.excerpt}</p> : null}
                </div>
              </Motion>
            ))}
          </div>
        ) : null}
      </Motion>
    </section>
  )
}

export default SolutionsHeroComponent
