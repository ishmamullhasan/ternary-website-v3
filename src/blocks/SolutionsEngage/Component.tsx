import Motion from '@/components/animation/motion'
import MobileCarousel from '@/components/layout/MobileCarousel'
import Section from '@/components/layout/section'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Media, Model, SolutionsEngageBlock } from '@/payload-types'
import Image from 'next/image'
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

// Signature panel — the one bold moment per card. Rendered inline so each card can place it at a
// different vertical position (Figma: Frame bottom, Flow middle, Orchestra top).
//
// The image comes from the linked Model's `thumbnail`. The gradient is always painted underneath, so
// it doubles as the skeleton and as the fallback when a card has no model (or the model has no
// thumbnail) — same approach as IndustryPanels' GradientField.
//
// alt="" is deliberate: the panel is an abstract ornament sitting directly above/below the card's own
// visible <h3> title, so it carries no information a screen-reader user is missing. Passing the Media
// `alt` through would announce the pattern's filename-ish alt text as if it meant something.
function GradientPanel({ tone, image }: { tone: string; image?: Media }): JSX.Element {
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

      {image?.url ? (
        <Image
          src={image.url}
          alt=""
          fill
          sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 30vw"
          className="relative object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : null}
    </div>
  )
}

type EngageCardItem = NonNullable<SolutionsEngageBlock['cards']>[number]

// Single engagement card — shared by the sm+ grid and the mobile carousel. Varies the gradient
// panel position per column (Figma: Frame bottom, Flow middle, Orchestra top).
function EngageCard({ card, index }: { card: EngageCardItem; index: number }): JSX.Element {
  const labels = toLabels(card?.subtitle)
  const panelPosition = index === 1 ? 'middle' : index === 2 ? 'top' : 'bottom'
  const tone = engageGradients[index % engageGradients.length]

  // depth:2 on the page query populates the model (depth 1) and its thumbnail (depth 2). Guard the
  // object shape anyway: at depth 0/1 these come back as bare ids, and rendering must not throw.
  const model = typeof card?.model === 'object' ? (card.model as Model) : undefined
  const image = typeof model?.thumbnail === 'object' ? (model.thumbnail as Media) : undefined
  const panel = <GradientPanel tone={tone} image={image} />

  const titleBlock = (
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-[40px] font-medium leading-[1.15] tracking-[-0.05em] text-cream">
        {card?.title}
      </h3>
      {labels.length > 0 ? (
        <div className="flex w-full justify-between text-[14px] font-medium text-body">
          {labels.map((label, j) => (
            <span key={j} className={j === 0 ? 'text-left' : j === labels.length - 1 ? 'text-right' : 'text-center'}>
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

  // Figma splits each card into a title block and a right-aligned "Ideal for" block (1275:4492).
  // The dedicated `idealFor` field backs the right-aligned paragraph; it is distinct from the
  // `description` intro line above, so each is rendered independently. Legacy cards that carry only
  // `description` show it as the intro line and simply leave the Ideal-for block empty (graceful
  // degradation — no duplicated copy).
  const idealForBlock = card?.idealFor ? (
    <div className="flex flex-col items-end gap-3 text-right">
      <span className="text-base font-medium text-cream">Ideal for</span>
      <p className="text-base leading-[1.4] text-body">{card.idealFor}</p>
    </div>
  ) : null

  return (
    <article className="group flex h-full flex-col gap-6 rounded-md bg-ink p-6">
      {panelPosition === 'top' && panel}
      {titleBlock}
      {panelPosition === 'middle' && panel}
      {idealForBlock}
      {panelPosition === 'bottom' && panel}
    </article>
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
            <>
              {/* Mobile: horizontal snap carousel with pagination dots. */}
              <MobileCarousel slideClassName="w-[280px]">
                {engageCards.map((card, i) => (
                  <EngageCard key={card?.id ?? i} card={card} index={i} />
                ))}
              </MobileCarousel>

              {/* sm+ grid — hidden on mobile, where the carousel takes over. */}
              <div className="hidden gap-4 sm:grid md:grid-cols-3">
                {engageCards.map((card, i) => (
                  <Motion
                    tag="div"
                    key={card?.id ?? i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.08, 0.32) }}
                  >
                    <EngageCard card={card} index={i} />
                  </Motion>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default SolutionsEngageComponent
