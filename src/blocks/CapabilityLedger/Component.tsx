'use client'

import * as Accordion from '@radix-ui/react-accordion'
import * as Tabs from '@radix-ui/react-tabs'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { JSX } from 'react'

import Heading from '@/components/a11y/Heading'
import Motion from '@/components/animation/motion'
import { EASE, reveal } from '@/components/animation/reveal'
import CapabilityArt from '@/components/capability/CapabilityArt'
import Link from '@/components/LocalizedLink'
import RichTextComp, { type RichText } from '@/components/richtext'
import type { Capability, CapabilityLedgerBlock } from '@/payload-types'

import './ledger.css'

/**
 * The practice ledger — the depth behind the capability grid.
 *
 * The grid above answers "which disciplines"; this answers "what does that discipline actually
 * consist of" without making the reader leave for a detail page. Every row reads its excerpt,
 * practice items, headline metric and figure off the capability doc itself — the block authors
 * nothing but its own header, so the landing cannot drift from the pages it indexes.
 *
 * Two structures, one per breakpoint, because the interaction genuinely differs:
 *   lg+   — Radix vertical Tabs. The list is an index; the panel beside it is the entry.
 *   below — Radix Accordion. There is no room for a panel, so the entry opens in place.
 * Both are Radix (see CLAUDE.md): roving tabindex, arrow keys, aria-selected/aria-controls and the
 * open/closed wiring are exactly the things a hand-rolled version gets subtly wrong.
 */

// Capabilities arrive as relationship values: populated docs at depth ≥ 1, bare ids at depth 0.
// A row is only renderable with a slug (it links) — drop anything else rather than render a dead row.
type LedgerItem = Capability & { slug: string }

const isRenderable = (value: unknown): value is LedgerItem =>
  !!value && typeof value === 'object' && typeof (value as Capability).slug === 'string'

const ordinal = (index: number): string => String(index + 1).padStart(2, '0')

const practicesOf = (item: LedgerItem) => (item.howWeDoIt?.items ?? []).filter((practice) => practice.title)

// The headline number, if the discipline has one. Only some capabilities carry case studies, and a
// case study only counts here when it has BOTH halves of the stat — a bare "10x" with no subject is
// noise. Absent → the row simply has no chip.
const metricOf = (item: LedgerItem): { value: string; label: string } | null => {
  const study = (item.caseStudies?.items ?? []).find((entry) => entry.metricValue && entry.metricLabel)
  return study ? { value: study.metricValue as string, label: study.metricLabel as string } : null
}

const focusRing =
  // The offset ring is painted in the colour of the surface the link actually sits on — the entry
  // panel is bg-button-dark, not the section's bg-card.
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70 focus-visible:ring-offset-2 focus-visible:ring-offset-button-dark'

/**
 * One ledger entry. `withTitle` is false inside the accordion, where the row's own trigger is
 * already the heading — repeating the title in the panel would give the same discipline two names
 * one after the other.
 */
function LedgerEntry({
  item,
  index,
  practiceLabel,
  linkLabel,
  withTitle,
}: {
  item: LedgerItem
  index: number
  practiceLabel?: string | null
  linkLabel: string
  withTitle: boolean
}): JSX.Element {
  const practices = practicesOf(item)
  const metric = metricOf(item)

  return (
    <div className="cap-stage relative overflow-hidden rounded-md bg-button-dark">
      {/* Decorative. The same drawing the card in the grid above carries, but held lit rather than
          resolving under the pointer — here it is the subject, not a reward for hovering. */}
      <div aria-hidden className="relative h-[160px] w-full sm:h-[200px]">
        <CapabilityArt animation={item.animation} />
        {/* text-subtle, not a cream opacity step: this is TEXT, and the contrast exemption in
            CLAUDE.md covers decorative icons, not numerals a low-vision reader may still try to
            read. cream/30 landed near 2.5:1 on this surface. */}
        <span className="absolute top-5 left-5 font-mono text-[10px] tracking-[0.18em] text-subtle">
          {ordinal(index)}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex flex-col gap-2">
          {withTitle && (
            <Heading level={3} className="font-display text-[22px] leading-[1.1] font-medium text-cream">
              {item.title}
            </Heading>
          )}
          {item.excerpts && <p className="max-w-[56ch] text-[15px] leading-[1.45] text-body">{item.excerpts}</p>}
        </div>

        {practices.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            {/* Localized copy, so it gets the site's plain eyebrow treatment (see the capability
                detail page's Eyebrow) — NOT the mono/uppercase/letter-spaced label used for the
                ordinals. Tracking and uppercase are Latin-only ideas: applied to Bengali they prise
                the conjuncts apart and do nothing at all for case. */}
            {practiceLabel && <span className="text-[12px] text-subtle">{practiceLabel}</span>}
            <ul className="flex flex-col gap-3">
              {practices.map((practice, i) => (
                <li key={practice.id ?? i} className="flex gap-3">
                  <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-cream/40" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14px] leading-[1.25] font-medium text-cream">{practice.title}</span>
                    {practice.excerpt && (
                      <span className="text-[13px] leading-[1.45] text-body">{practice.excerpt}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          {metric ? (
            <span className="inline-flex items-baseline gap-2 rounded-full bg-badge px-3 py-1.5">
              <span className="font-display text-[15px] font-medium text-cream">{metric.value}</span>
              <span className="text-[12px] text-body">{metric.label}</span>
            </span>
          ) : (
            <span aria-hidden />
          )}

          <Link
            href={`/capabilities/${item.slug}`}
            // Eight rows, eight links reading "Explore" — the accessible name has to say which one
            // (SC 2.4.4). It opens with the visible label, so the visible text stays a prefix of the
            // name (SC 2.5.3).
            aria-label={`${linkLabel} ${item.title ?? ''}`.trim()}
            className={`group inline-flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap text-cream transition-[gap] duration-500 hover:gap-2.5 ${focusRing}`}
          >
            {linkLabel}
            <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function CapabilityLedgerComponent({
  heading,
  description,
  capabilities,
  practiceLabel,
  linkLabel,
}: CapabilityLedgerBlock): JSX.Element | null {
  const items = (capabilities ?? []).filter(isRenderable)
  if (items.length === 0) return null

  const explore = linkLabel?.trim() || 'Explore'
  const entryProps = (item: LedgerItem, index: number) => ({ item, index, practiceLabel, linkLabel: explore })

  return (
    <Motion tag="section" className="section-card flex w-full flex-col gap-8" {...reveal}>
      <div className="flex max-w-[544px] flex-col gap-2">
        {heading && (
          <Heading level={2} className="text-section font-display font-medium text-cream">
            {heading}
          </Heading>
        )}
        {description && (
          <RichTextComp
            content={description as RichText}
            className="prose-p:mb-0 prose-p:text-base prose-p:leading-[1.15] prose-p:text-body"
          />
        )}
      </div>

      {/* lg+ — index on the left, the selected entry beside it. Vertical orientation gives Radix
          Up/Down as the arrow keys, which is what a stacked list implies. */}
      <Tabs.Root
        defaultValue={items[0].slug}
        orientation="vertical"
        className="hidden gap-8 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-12"
      >
        <Tabs.List aria-label={heading ?? 'Capabilities'} className="flex flex-col self-start border-t border-line">
          {items.map((item, index) => (
            <Tabs.Trigger
              key={item.id ?? item.slug}
              value={item.slug}
              className="group relative flex cursor-pointer items-center gap-4 border-b border-line py-[18px] text-left"
            >
              <span aria-hidden className="ledger-rule" />
              <span className="font-mono text-[11px] tracking-[0.18em] text-subtle transition-colors duration-300 group-data-[state=active]:text-cream">
                {ordinal(index)}
              </span>
              <span className="flex-1 font-display text-[18px] leading-[1.2] font-medium text-body transition-colors duration-300 group-hover:text-cream group-data-[state=active]:text-cream">
                {item.title}
              </span>
              <ArrowUpRight
                size={15}
                strokeWidth={1.6}
                aria-hidden
                className="shrink-0 -translate-x-1 text-cream opacity-0 transition duration-500 group-data-[state=active]:translate-x-0 group-data-[state=active]:opacity-100"
              />
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div>
          {items.map((item, index) => (
            <Tabs.Content key={item.id ?? item.slug} value={item.slug}>
              {/* Keyed by the panel, which Radix mounts on activation — so the fade replays each
                  time the reader moves down the index. Motion drops it under reduced motion. */}
              <Motion
                tag="div"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <LedgerEntry {...entryProps(item, index)} withTitle />
              </Motion>
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>

      {/* Below lg there is no room for a panel beside the index, so the entry opens in place. */}
      <Accordion.Root
        type="single"
        collapsible
        defaultValue={items[0].slug}
        className="flex flex-col border-t border-line lg:hidden"
      >
        {items.map((item, index) => (
          <Accordion.Item key={item.id ?? item.slug} value={item.slug} className="border-b border-line">
            {/* Radix renders this as an <h3> — the level this site gives repeated items inside a
                block, so the entry below it deliberately does not repeat the title. */}
            <Accordion.Header className="flex">
              <Accordion.Trigger className="group flex flex-1 cursor-pointer items-center gap-3 py-[18px] text-left">
                <span className="font-mono text-[11px] tracking-[0.18em] text-subtle">{ordinal(index)}</span>
                <span className="flex-1 font-display text-[17px] leading-[1.2] font-medium text-cream">
                  {item.title}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.6}
                  aria-hidden
                  className="shrink-0 text-cream/70 transition-transform duration-300 group-data-[state=open]:rotate-180"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="ledger-panel overflow-hidden">
              <div className="pt-1 pb-5">
                <LedgerEntry {...entryProps(item, index)} withTitle={false} />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Motion>
  )
}

export default CapabilityLedgerComponent
