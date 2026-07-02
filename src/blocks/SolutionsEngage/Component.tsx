import Motion from '@/components/animation/motion'
import Section from '@/components/layout/section'
import RichTextComp, { type RichText } from '@/components/richtext'
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

// Signature noise-gradient panel — the one bold moment per card. Rendered inline so each
// card can place it at a different vertical position (Figma: Frame bottom, Flow middle, Orchestra top).
function GradientPanel({ tone }: { tone: string }): JSX.Element {
  return (
    <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-md">
      <span
        aria-hidden
        className="absolute inset-0 scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        style={{ backgroundImage: tone }}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-[url('/noise.svg')] bg-[length:200px] opacity-[0.16] mix-blend-overlay"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
    </div>
  )
}

export function SolutionsEngageComponent(props: SolutionsEngageBlock): JSX.Element {
  const engageCards = (props?.cards ?? []).filter((c) => Boolean(c?.title))

  return (
    <Section className="!space-y-0">
      {/* Single elevated panel holding the header + three engagement columns (Figma px-36 py-48). */}
      <div className="rounded-md bg-main px-6 py-10 sm:px-8 lg:px-9 lg:py-12">
        <div className="flex flex-col gap-8">
          {/* Header — left-aligned 'How We Engage' + supporting line, inside the panel like Figma. */}
          {(props?.heading || props?.description) && (
            <div className="flex flex-col gap-4">
              {props?.heading ? (
                <h2 className="font-display text-3xl font-medium leading-[1.15] text-cream">{props.heading}</h2>
              ) : null}
              {props?.description ? (
                <RichTextComp
                  content={props.description as RichText}
                  className="max-w-2xl prose-p:mb-0 prose-p:text-base prose-p:leading-[1.4] prose-p:text-body"
                />
              ) : null}
            </div>
          )}

          {engageCards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {engageCards.map((card, i) => {
                const labels = toLabels(card?.subtitle)
                // Vary the gradient panel position per column to mirror Figma's staggered composition.
                const panelPosition = i === 1 ? 'middle' : i === 2 ? 'top' : 'bottom'
                const tone = engageGradients[i % engageGradients.length]

                const titleBlock = (
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[40px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
                      {card?.title}
                    </h3>
                    {labels.length > 0 ? (
                      <div className="flex w-full justify-between text-[14px] font-medium text-body">
                        {labels.map((label, j) => (
                          <span
                            key={j}
                            className={j === 0 ? 'text-left' : j === labels.length - 1 ? 'text-right' : 'text-center'}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {/* Short intro line under the labels (Figma 1275:4491). */}
                    {card?.description ? (
                      <RichTextComp
                        content={card.description as RichText}
                        className="mt-1 prose-p:mb-0 prose-p:text-base prose-p:leading-[1.4] prose-p:text-body"
                      />
                    ) : null}
                  </div>
                )

                // Figma splits each card into a title block and a right-aligned "Ideal for" block
                // (1275:4492). The dedicated `idealFor` field backs the right-aligned paragraph; it is
                // distinct from the `description` intro line above, so each is rendered independently.
                // Legacy cards that carry only `description` show it as the intro line and simply leave
                // the Ideal-for block empty (graceful degradation — no duplicated copy).
                const idealForBlock = card?.idealFor ? (
                  <div className="flex flex-col items-end gap-3 text-right">
                    <span className="text-base font-medium text-cream">Ideal for</span>
                    <p className="text-base leading-[1.4] text-body">{card.idealFor}</p>
                  </div>
                ) : null

                return (
                  <Motion
                    tag="article"
                    key={card?.id ?? i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.08, 0.32) }}
                    className="group flex h-full flex-col gap-6 rounded-md bg-ink p-6"
                  >
                    {panelPosition === 'top' && <GradientPanel tone={tone} />}
                    {titleBlock}
                    {panelPosition === 'middle' && <GradientPanel tone={tone} />}
                    {idealForBlock}
                    {panelPosition === 'bottom' && <GradientPanel tone={tone} />}
                  </Motion>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default SolutionsEngageComponent
