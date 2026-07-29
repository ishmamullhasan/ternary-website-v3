'use client'

import { useCanHover } from '@/components/hub/useCanHover'
import IndustryBlueprint from '@/components/industry/IndustryBlueprint'
import * as Tabs from '@radix-ui/react-tabs'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The sector index — a sticky split-view explorer. The left rail lists every sector with the
 * capabilities it draws on; the right panel is one large preview that crossfades as the selection
 * changes. One sector is shown at a time and the layout never reflows, so there is no
 * hover-induced whitespace and nothing jumps.
 *
 * Selection follows pointer, keyboard and scroll: hover (fine pointers only) and Radix's own
 * roving-tabindex arrow keys set it directly, and an IntersectionObserver advances it as the rail
 * scrolls past the viewport's middle band — pointer and keyboard always win over scroll.
 *
 * Built on @radix-ui/react-tabs rather than hand-rolled: it supplies the roving tabindex, arrow-key
 * semantics and aria-selected/aria-controls wiring this pattern needs and that are easy to get
 * subtly wrong.
 *
 * The panel artwork is the SAME component the home page's industry cards use
 * (components/industry/IndustryBlueprint) rather than a second set of drawings maintained here.
 * It selects by keyword on the sector name, so the nine names map onto it without a lookup table,
 * and the two surfaces can never drift apart.
 *
 * EVERY WORD HERE IS REAL. Sector names, one-line descriptions and named clients are the authored
 * copy that shipped with the previous accordion; CAPS maps each sector onto Ternary's eight actual
 * capabilities. The CMS holds no per-industry overview, challenge list, technology tags or outcome
 * metric — see the note on CAPS — so none are rendered rather than invented.
 *
 * (Originally a single-open accordion, ported from
 * public/hub/industries-hub-bold.html. On fine pointers a sector opens on hover (and on keyboard
 * focus); on touch it toggles on tap. Item 0 is open by default. The expand/collapse is a
 * `grid-template-rows: 0fr → 1fr` transition (see industriesHub.css) so height animates without a
 * measured pixel value.
 *
 * The "proof" line stays visible in every header — a named client (cream) is the star, not a blurb.
 * Content is hardcoded here (the nine sectors are stable); the shape maps cleanly onto a future CMS
 * wiring. Row titles are `<span>`, never headings inside a button (site heading policy).
 */

type Sector = {
  num: string
  name: string
  label: string
  clients: string[]
  none?: string
  desc: string
}

const SECTORS: Sector[] = [
  {
    num: '01',
    name: 'Banking & Capital Markets',
    label: 'In the sector',
    clients: ['Dhaka Stock Exchange', 'LankaBangla Securities'],
    desc: "Exchanges, brokerages, and systems that can't be down while markets are open.",
  },
  {
    num: '02',
    name: 'Financial Services & Insurance',
    label: 'In the sector',
    clients: [],
    none: 'Named work under NDA',
    desc: 'Compliant platforms that scale with the book — and auditors who get real answers.',
  },
  {
    num: '03',
    name: 'Health Care',
    label: 'In the sector',
    clients: ['Flex5 by Reality Meets Science'],
    desc: 'HIPAA-grade platforms where clinical trust and consumer ease have to live together.',
  },
  {
    num: '04',
    name: 'Advanced Manufacturing',
    label: 'In the sector',
    clients: ['FAROGL'],
    desc: 'Connected plants, controlled processes, and operational intelligence from the floor up.',
  },
  {
    num: '05',
    name: 'Sports & Entertainment',
    label: 'In the sector',
    clients: ['Alley Analytix', 'Turfly'],
    desc: 'Booking, performance data, and platforms that survive a matchday spike.',
  },
  {
    num: '06',
    name: 'Hospitality & Travel',
    label: 'In the sector',
    clients: ['Counterfoil — attractions, activities & tours'],
    desc: 'Booking, inventory, and revenue systems for operators running thin margins against volatile demand.',
  },
  {
    num: '07',
    name: 'Consumer Goods & Services',
    label: 'In the sector',
    clients: ['Hissho Sushi', 'DoYouWork'],
    desc: 'Field teams, franchise networks, and the last mile between insight and daily action.',
  },
  {
    num: '08',
    name: 'Public Sector',
    label: 'Posture',
    clients: ['Cleared engineers · ATO-ready · Continuous compliance'],
    desc: 'Cleared engineers and ATO-ready delivery, with compliance that stays continuous — not a one-time certificate.',
  },
  {
    num: '09',
    name: 'Technology Platforms',
    label: 'In the sector',
    clients: [],
    none: 'Named work under NDA',
    desc: 'Product companies making the jump from one system to a real platform.',
  },
]

// Ternary's eight real capabilities, mapped onto the sectors that draw on them. These are the
// capability names authored in the CMS — nothing here is invented. The left rail shows the first
// three; the preview lists them all under "What we build".
//
// TO AUTHOR LATER: the brief this replaces also asked for a per-sector 80-120 word overview, a
// challenges list, technology tags and an outcome metric. None exist in the `industry` collection
// (every doc has an empty `layout` and a one-line excerpt), so no slot for them is rendered. Add
// the fields, then render them here — do not backfill with generated copy.
const CAPS: Record<string, string[]> = {
  '01': [
    'Data & Analytics',
    'Cloud Transformation',
    'DevOps & Automation',
    'Platformization',
    'Artificial Intelligence',
  ],
  '02': [
    'Data & Analytics',
    'Artificial Intelligence',
    'Cloud Transformation',
    'Platformization',
    'DevOps & Automation',
  ],
  '03': [
    'Digital Experiences',
    'Cloud Transformation',
    'Data & Analytics',
    'Artificial Intelligence',
    'Platformization',
  ],
  '04': ['Internet of Things', 'Data & Analytics', 'Platformization', 'Cloud Transformation', 'DevOps & Automation'],
  '05': ['Digital Experiences', 'Data & Analytics', 'Cloud Transformation', 'Platformization'],
  '06': ['Digital Experiences', 'Platformization', 'Data & Analytics', 'Cloud Transformation'],
  '07': ['Digital Experiences', 'Data & Analytics', 'Artificial Intelligence', 'Platformization'],
  '08': ['Cloud Transformation', 'DevOps & Automation', 'Data & Analytics', 'Platformization', 'Agentic Architecture'],
  '09': [
    'Platformization',
    'Agentic Architecture',
    'DevOps & Automation',
    'Cloud Transformation',
    'Artificial Intelligence',
  ],
}

export default function SectorIndex() {
  const [active, setActive] = useState(SECTORS[0].num)
  const canHover = useCanHover()
  const listRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  // Pointer and keyboard beat scroll: while either is driving, the observer stands down.
  const held = useRef(false)

  const pick = useCallback((num: string) => {
    held.current = true
    setActive(num)
  }, [])

  /**
   * Fit the artwork to its own ink.
   *
   * IndustryBlueprint draws every sector into one fixed 400x360 viewBox, which is right on the home
   * page — nine cards in a grid want a common box so their figures share a baseline. Here a single
   * figure IS the panel, and the fixed box meant each sector rendered at whatever size it happened
   * to occupy: measured across the nine, ink ran from 217px wide (Consumer Goods) to 368px
   * (Advanced Manufacturing) inside an identical 426px element, starting anywhere from 28px to
   * 104px in. They read as different sizes and off-centre because they were.
   *
   * Re-fitting the viewBox to the drawn extent makes every sector exactly as wide as the panel
   * allows, and `aspectRatio` locks the height to that drawing's own proportions rather than
   * stretching it — so the ratio holds and the flex centring has something uniform to centre.
   *
   * Measured rather than baked into the component: `getBBox()` is the browser's own geometry, exact
   * for the arcs and quadratics these drawings use, and it cannot go stale the way a hardcoded table
   * of extents would the first time the art is edited. It also keeps IndustryBlueprint a pure server
   * component for the home page, which never needs any of this.
   *
   * DRIVEN BY A MutationObserver, NOT BY THE RENDER. Radix mounts a tab's content in its own commit,
   * after the one our state change produces — so an effect keyed on `active` (or even one with no
   * deps) looks at a stage that does not hold the new drawing yet. It fitted on first load and
   * silently missed every switch after it, which is precisely how this failed when it was written
   * that way. Watching the stage for the swap catches whoever performs it and whenever.
   */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const fit = (): void => {
      const svg = stage.querySelector<SVGSVGElement>('.ib')
      if (!svg) return
      let box: DOMRect
      try {
        box = svg.getBBox()
      } catch {
        return // not laid out yet; the untouched 400x360 viewBox is a fine fallback
      }
      if (!box.width || !box.height) return
      // getBBox is geometry, not ink: a 1.6 stroke sits 0.8 outside it on every edge.
      const pad = 3
      const vb = `${(box.x - pad).toFixed(2)} ${(box.y - pad).toFixed(2)} ${(box.width + pad * 2).toFixed(2)} ${(box.height + pad * 2).toFixed(2)}`
      // Guard the write: the observer watches this subtree, and re-setting an identical value would
      // still be a mutation to react to.
      if (svg.getAttribute('viewBox') === vb) return
      svg.setAttribute('viewBox', vb)
      svg.style.aspectRatio = `${(box.width + pad * 2).toFixed(2)} / ${(box.height + pad * 2).toFixed(2)}`
    }

    fit()
    const mo = new MutationObserver(fit)
    mo.observe(stage, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  // Scroll-sync — whichever rail item crosses the viewport's middle band becomes active.
  useEffect(() => {
    const root = listRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-sector]'))
    if (items.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        if (held.current) return
        const num = entries.find((e) => e.isIntersecting)?.target.getAttribute('data-sector')
        if (num) setActive(num)
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <Tabs.Root
      value={active}
      onValueChange={pick}
      orientation="vertical"
      className="ix"
      onPointerLeave={() => {
        held.current = false
      }}
    >
      <Tabs.List className="ix-rail" aria-label="Sectors" ref={listRef}>
        {SECTORS.map((sector) => (
          <Tabs.Trigger
            key={sector.num}
            value={sector.num}
            data-sector={sector.num}
            className="ix-item"
            onMouseEnter={canHover ? () => pick(sector.num) : undefined}
          >
            {/* the accent line, 0 -> 100% */}
            <span className="ix-line" aria-hidden="true" />
            <span className="ix-num" aria-hidden="true">
              {sector.num}
            </span>
            <span className="ix-mid">
              <span className="ix-name">{sector.name}</span>
              <span className="ix-caps">{(CAPS[sector.num] ?? []).slice(0, 3).join('  ·  ')}</span>
            </span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="ix-stage" ref={stageRef}>
        {SECTORS.map((sector) => (
          <Tabs.Content key={sector.num} value={sector.num} className="ix-panel">
            <div className="ix-art" aria-hidden="true">
              <IndustryBlueprint title={sector.name} />
            </div>
            <div className="ix-copy">
              <h3 className="ix-title">{sector.name}</h3>
              <p className="ix-desc">{sector.desc}</p>

              <div className="ix-proof">
                <span className="ix-lab">{sector.label}</span>
                {sector.none ? (
                  <span className="ix-none">{sector.none}</span>
                ) : (
                  sector.clients.map((client) => (
                    <span className="ix-cli" key={client}>
                      {client}
                    </span>
                  ))
                )}
              </div>

              <div className="ix-build">
                <span className="ix-lab">What we build</span>
                <ul className="ix-caplist">
                  {(CAPS[sector.num] ?? []).map((cap) => (
                    <li key={cap}>{cap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  )
}
