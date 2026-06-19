import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import type { SolutionsEngageBlock } from '@/payload-types'
import type { JSX } from 'react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Signature per-card noise/grain gradient panels (matches the brand device used across the site).
// Frame = teal/emerald · Flow = violet/magenta · Orchestra = indigo → magenta.
const engageGradients = [
  'radial-gradient(135% 135% at 22% 18%, #1f9d6b 0%, #0f5a3d 46%, #07211a 100%)',
  'radial-gradient(135% 135% at 24% 16%, #7c3aed 0%, #5e1457 46%, #190a1c 100%)',
  'radial-gradient(135% 135% at 24% 16%, #4f6bed 0%, #6d1f8c 48%, #1a0f2c 100%)',
]

// Render the subtitle as a horizontal row of discrete caption labels. Split on explicit
// delimiters when present (· | / ;); otherwise show the whole string as a single label —
// never shatter multi-word labels into vertical fragments.
function toLabels(subtitle?: string | null): string[] {
  if (!subtitle?.trim()) return []
  return subtitle
    .split(/\s*[·|/;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function SolutionsEngageComponent(props: SolutionsEngageBlock): JSX.Element {
  const engageCards = (props?.cards ?? []).filter((c) => Boolean(c?.title))

  return (
    <Section title={props?.heading || undefined} desc={props?.description || undefined}>
      {engageCards.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {engageCards.map((card, i) => {
            const labels = toLabels(card?.subtitle)
            return (
              <Motion
                tag="article"
                key={card?.id ?? i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.08, 0.32) }}
                className="group flex h-full flex-col overflow-hidden rounded-md bg-main ring-1 ring-white/5 transition-[transform,box-shadow,outline-color] duration-500 ease-out outline outline-1 outline-transparent hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] hover:outline-white/10"
              >
                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <h3 className="font-display text-2xl font-medium leading-tight text-cream">{card?.title}</h3>

                  {labels.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                      {labels.map((label, j) => (
                        <span key={j} className="text-[12px] uppercase tracking-[0.12em] text-subtle">
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {card?.description ? (
                    <p className="mt-4 text-[14px] leading-relaxed text-body">{card.description}</p>
                  ) : null}
                </div>

                {/* Signature noise-gradient panel — always renders (the one bold moment per card). */}
                <div className="relative mx-7 mb-7 h-32 overflow-hidden rounded-md lg:mx-8 lg:mb-8">
                  <span
                    aria-hidden
                    className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    style={{ backgroundImage: engageGradients[i % engageGradients.length] }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:200px] opacity-[0.16] mix-blend-overlay"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45"
                  />
                </div>
              </Motion>
            )
          })}
        </div>
      ) : null}
    </Section>
  )
}

export default SolutionsEngageComponent
