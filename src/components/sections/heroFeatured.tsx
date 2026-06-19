import Motion from '@/components/animation/motion'
import Link from 'next/link'
import type { JSX } from 'react'

/**
 * Homepage signature hero (design node 339:8016, elevated).
 *
 * The thesis line + Poppins display headline open the page, then a grid of noise-gradient
 * "work stream" cards — each a real piece of Ternary's published work (case study, press
 * release, insight) keyed to a content-type gradient. The cards are the one bold moment;
 * everything around them stays quiet. Gradients are CSS (no image dependency), so they render
 * identically regardless of CMS/media availability.
 *
 * Server component. Reveals use the shared <Motion> (Framer Motion) wrapper — the single client
 * boundary, which already honors prefers-reduced-motion and fires once. Hover is pure Tailwind.
 */

export type FeaturedItem = {
  title: string
  category: string
  href: string
  tone: Tone
}

type Tone = 'crimson' | 'violet' | 'emerald' | 'azure' | 'magenta' | 'indigo'

// Rich, multi-stop radial gradients with a warm/cool spread across content types. The origin
// sits top-left so the brightest point reads as a light source the grain texture sits over.
const TONE: Record<Tone, string> = {
  crimson: 'radial-gradient(135% 135% at 18% 12%, #c1285f 0%, #6d1734 42%, #1d0a14 100%)',
  violet: 'radial-gradient(135% 135% at 22% 14%, #7c3aed 0%, #3a1c8c 44%, #140f2c 100%)',
  emerald: 'radial-gradient(135% 135% at 22% 14%, #1f9d6b 0%, #0f5a3d 44%, #07211a 100%)',
  azure: 'radial-gradient(135% 135% at 22% 14%, #2f93da 0%, #134a78 44%, #08233c 100%)',
  magenta: 'radial-gradient(135% 135% at 20% 12%, #b6249a 0%, #5e1457 44%, #190a1c 100%)',
  indigo: 'radial-gradient(135% 135% at 22% 14%, #4f6bed 0%, #25307e 44%, #0c1030 100%)',
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function Card({ item, index }: { item: FeaturedItem; index: number }): JSX.Element {
  return (
    <Motion
      tag="div"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.06, 0.48) }}
    >
      <Link
        href={item.href}
        className="group relative block aspect-[3/4] overflow-hidden rounded-md ring-1 ring-white/5 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] focus-visible:-translate-y-1"
      >
        {/* Gradient field — eases brighter and scales subtly on hover (the "orchestration" beat). */}
        <span
          aria-hidden
          className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          style={{ backgroundImage: TONE[item.tone] }}
        />
        {/* Grain overlay — the brand's signature texture, local asset (no external dependency). */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:240px] opacity-[0.16] mix-blend-overlay"
        />
        {/* Legibility scrim so eggshell text holds on the brightest gradients. */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />

        <div className="relative flex h-full flex-col p-5">
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-cream/75">{item.category}</span>
          <h3 className="mt-2 max-w-[14rem] text-[17px] font-semibold leading-[1.18] text-cream">{item.title}</h3>
          <span className="mt-auto inline-flex translate-y-1 items-center gap-1 text-[13px] text-cream/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-cream/90">
            Read
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </Motion>
  )
}

export default function HeroFeatured({ items }: { items: FeaturedItem[] }): JSX.Element {
  return (
    <section className="mx-auto w-full max-w-7xl px-5">
      <div className="flex flex-col items-center gap-6 py-16 text-center lg:py-24">
        <Motion
          tag="p"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-xl text-[15px] font-medium text-body lg:text-[16px]"
        >
          AI agents do the work. Human orchestrators own the outcome.
        </Motion>
        <Motion
          tag="h1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="font-display text-[clamp(2.25rem,5.5vw,3.5rem)] font-medium leading-[1.06] text-cream"
        >
          Agentic Engineering.
          <br />
          Human Orchestration.
        </Motion>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
          {items.map((item, i) => (
            <Card key={`${item.href}-${i}`} item={item} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
