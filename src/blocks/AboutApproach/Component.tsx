import AboutMotion from '@/components/about/AboutMotion'
import AboutPlate from '@/components/about/AboutPlate'
import MaskText from '@/components/about/MaskText'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { AboutApproachBlock, Media } from '@/payload-types'
import type { CSSProperties, JSX } from 'react'

/**
 * "The Ternary Way" — set as an editorial spread: a full-width plate, then the practices
 * beneath it in columns.
 *
 * REPLACES a bento of the same construction as the two sections either side of it (48px round
 * badge, one repeated `Zap` glyph, title, description, on a card). Sitting between "Our thesis"
 * and "Our culture", three identical grids in a row gave the page no shape at all.
 *
 * The distinction here is deliberate and structural, not decorative: "Our thesis" runs as a
 * vertical index against a sticky rail, this runs as a horizontal spread under a plate, and
 * "Our culture" runs as a counted rail. Same design system, three different rhythms, so the
 * page has a shape you could describe with your hands.
 *
 * CONTENT: headings, titles and excerpts are CMS strings, unchanged.
 */

type ApproachItem = NonNullable<AboutApproachBlock['items']>[number]

/** One practice: index numeral, title, description, over a drawn rule. */
function Practice({ item, index }: { item: ApproachItem; index: number }): JSX.Element {
  return (
    <div className="am-step flex flex-col">
      <span
        aria-hidden
        className="am-rule mb-6 h-px w-full bg-line"
        style={{ '--am-d': `${Math.min(index * 0.07, 0.35)}s` } as CSSProperties}
      />
      <div
        className="am-r flex flex-col gap-3"
        style={{ '--am-d': `${Math.min(index * 0.07 + 0.06, 0.4)}s` } as CSSProperties}
      >
        <span aria-hidden className="am-num font-mono text-[13px] tabular-nums tracking-[0.1em] text-cream">
          {String(index + 1).padStart(2, '0')}
        </span>
        {item.title ? (
          <h3 className="font-display text-[clamp(1.125rem,1.5vw,1.4rem)] leading-[1.2] font-medium tracking-[-0.03em] text-cream">
            {item.title}
          </h3>
        ) : null}
        {item.excerpt ? <p className="text-[15px] leading-[1.62] text-body">{item.excerpt}</p> : null}
      </div>
    </div>
  )
}

export function AboutApproachComponent({ heading, description, items }: AboutApproachBlock): JSX.Element | null {
  if (!heading || !items?.length) return null

  const [featured, ...rest] = items
  const media = featured?.media ? (featured.media as Media) : undefined

  return (
    <AboutMotion tag="section" className="w-full rounded-md bg-main px-6 py-12 md:px-9 lg:px-12 lg:py-16">
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h2 className="font-display max-w-[16ch] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-medium tracking-[-0.04em] text-cream">
          <MaskText>{heading}</MaskText>
        </h2>
        {description ? (
          <div className="am-r max-w-[48ch]" style={{ '--am-d': '0.14s' } as CSSProperties}>
            <RichTextComp
              content={description as RichText}
              className="prose-p:mb-0 prose-p:text-[16px] prose-p:leading-[1.6] prose-p:text-body"
            />
          </div>
        ) : null}
      </div>

      {/* ── the plate ──────────────────────────────────────────────────────────
          The lead practice, given the width of the section. The photograph drifts against
          the scroll inside a fixed frame and settles from slightly overscaled; the copy sits
          under it as a caption rather than on top of it, so nothing is read through an image. */}
      {featured ? (
        <div className="mt-12 lg:mt-16">
          <AboutPlate media={media} tone="emerald" className="h-[240px] sm:h-[320px] lg:h-[400px]" parallax={24} />

          <div className="am-r mt-7 grid grid-cols-1 gap-x-10 gap-y-3 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]" style={{ '--am-d': '0.16s' } as CSSProperties}>
            {featured.title ? (
              <h3 className="font-display text-[clamp(1.375rem,2.2vw,1.875rem)] leading-[1.12] font-medium tracking-[-0.035em] text-cream">
                {featured.title}
              </h3>
            ) : null}
            {featured.excerpt ? (
              <p className="max-w-[58ch] text-[16px] leading-[1.62] text-body">{featured.excerpt}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ── the practices ──────────────────────────────────────────────────── */}
      {rest.length ? (
        // Two columns, not three. The block currently carries four practices after the lead, and
        // a three-up leaves the fourth stranded alone on a second row with two thirds of the
        // width empty beside it. Two-up pairs them and gives the copy a wider measure.
        <div className="mt-14 grid grid-cols-1 gap-x-14 gap-y-12 sm:grid-cols-2 lg:mt-20">
          {rest.map((item, index) => (
            <Practice key={item.id ?? `approach-${index}`} item={item} index={index + 1} />
          ))}
        </div>
      ) : null}
    </AboutMotion>
  )
}
