'use client'

import Link from '@/components/LocalizedLink'
import { useCanHover } from '@/components/hub/useCanHover'
import * as Tabs from '@radix-ui/react-tabs'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

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
  graphic: ReactNode
}

const SECTORS: Sector[] = [
  {
    num: '01',
    name: 'Banking & Capital Markets',
    label: 'In the sector',
    clients: ['Dhaka Stock Exchange', 'LankaBangla Securities'],
    desc: "Exchanges, brokerages, and systems that can't be down while markets are open.",
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* floor plane */}
        <path className="im-draw" pathLength={1} d="M100 112 L152 138 L100 164 L48 138 Z" strokeOpacity=".3" />
        {/* vault body edges */}
        <line className="im-draw" pathLength={1} x1="48" y1="72" x2="48" y2="138" strokeOpacity=".5" style={{ animationDelay: '.1s' }} />
        <line className="im-draw" pathLength={1} x1="152" y1="72" x2="152" y2="138" strokeOpacity=".5" style={{ animationDelay: '.1s' }} />
        <line className="im-draw" pathLength={1} x1="100" y1="98" x2="100" y2="164" strokeOpacity=".5" style={{ animationDelay: '.2s' }} />
        {/* stacked layers */}
        <path className="im-draw" pathLength={1} d="M100 90 L152 116 L100 142 L48 116 Z" strokeOpacity=".6" style={{ animationDelay: '.3s' }} />
        <path className="im-draw" pathLength={1} d="M100 68 L152 94 L100 120 L48 94 Z" strokeOpacity=".8" style={{ animationDelay: '.45s' }} />
        {/* top plate */}
        <path className="im-draw" pathLength={1} d="M100 46 L152 72 L100 98 L48 72 Z" style={{ animationDelay: '.6s' }} />
        {/* vault ring + turning lock */}
        <circle className="im-draw" pathLength={1} cx="100" cy="72" r="13" style={{ animationDelay: '.75s' }} />
        <g className="im-turn">
          <line className="im-draw" pathLength={1} x1="100" y1="63" x2="100" y2="81" style={{ animationDelay: '.85s' }} />
          <line className="im-draw" pathLength={1} x1="91" y1="72" x2="109" y2="72" style={{ animationDelay: '.85s' }} />
        </g>
      </svg>
    ),
  },
  {
    num: '02',
    name: 'Financial Services & Insurance',
    label: 'In the sector',
    clients: [],
    none: 'Named work under NDA',
    desc: 'Compliant platforms that scale with the book — and auditors who get real answers.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        <path className="im-draw" pathLength={1} d="M100 61 L158 90 L100 119 L42 90 Z" strokeOpacity=".4" />
        <path className="im-draw" pathLength={1} d="M100 70 L140 90 L100 110 L60 90 Z" strokeOpacity=".6" style={{ animationDelay: '.25s' }} />
        <path className="im-draw" pathLength={1} d="M100 79 L122 90 L100 101 L78 90 Z" strokeOpacity=".85" style={{ animationDelay: '.5s' }} />
        <circle className="im-draw im-pulse" pathLength={1} cx="100" cy="90" r="4.5" style={{ animationDelay: '.7s' }} />
      </svg>
    ),
  },
  {
    num: '03',
    name: 'Health Care',
    label: 'In the sector',
    clients: ['Flex5 by Reality Meets Science'],
    desc: 'HIPAA-grade platforms where clinical trust and consumer ease have to live together.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* connectors */}
        <line className="im-draw" pathLength={1} x1="72" y1="64" x2="128" y2="64" strokeOpacity=".45" style={{ animationDelay: '.5s' }} />
        <line className="im-draw" pathLength={1} x1="72" y1="116" x2="128" y2="116" strokeOpacity=".45" style={{ animationDelay: '.55s' }} />
        <line className="im-draw" pathLength={1} x1="72" y1="64" x2="72" y2="116" strokeOpacity=".45" style={{ animationDelay: '.6s' }} />
        <line className="im-draw" pathLength={1} x1="128" y1="64" x2="128" y2="116" strokeOpacity=".45" style={{ animationDelay: '.65s' }} />
        {/* four cells */}
        <circle className="im-draw" pathLength={1} cx="72" cy="64" r="18" />
        <circle className="im-draw" pathLength={1} cx="128" cy="64" r="18" style={{ animationDelay: '.2s' }} />
        <circle className="im-draw" pathLength={1} cx="72" cy="116" r="18" style={{ animationDelay: '.3s' }} />
        <circle className="im-draw" pathLength={1} cx="128" cy="116" r="18" style={{ animationDelay: '.4s' }} />
        {/* dividing nucleus */}
        <circle className="im-pulse" cx="100" cy="90" r="4" strokeOpacity=".9" />
      </svg>
    ),
  },
  {
    num: '04',
    name: 'Advanced Manufacturing',
    label: 'In the sector',
    clients: ['FAROGL'],
    desc: 'Connected plants, controlled processes, and operational intelligence from the floor up.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* north */}
        <path className="im-draw" pathLength={1} d="M100 45 L126 58 L100 71 L74 58 Z" style={{ animationDelay: '.1s' }} />
        {/* west */}
        <path className="im-draw" pathLength={1} d="M60 71 L86 84 L60 97 L34 84 Z" strokeOpacity=".75" style={{ animationDelay: '.25s' }} />
        {/* east (the block that shifts) */}
        <path className="im-draw im-pulse" pathLength={1} d="M140 71 L166 84 L140 97 L114 84 Z" strokeOpacity=".75" style={{ animationDelay: '.4s' }} />
        {/* south */}
        <path className="im-draw" pathLength={1} d="M100 97 L126 110 L100 123 L74 110 Z" style={{ animationDelay: '.55s' }} />
      </svg>
    ),
  },
  {
    num: '05',
    name: 'Sports & Entertainment',
    label: 'In the sector',
    clients: ['Alley Analytix', 'Turfly'],
    desc: 'Booking, performance data, and platforms that survive a matchday spike.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        <ellipse className="im-draw" pathLength={1} cx="100" cy="95" rx="74" ry="35" strokeOpacity=".35" />
        <ellipse className="im-draw" pathLength={1} cx="100" cy="95" rx="52" ry="25" strokeOpacity=".55" style={{ animationDelay: '.25s' }} />
        <ellipse className="im-draw" pathLength={1} cx="100" cy="95" rx="30" ry="15" strokeOpacity=".75" style={{ animationDelay: '.5s' }} />
        <circle className="im-draw im-pulse" pathLength={1} cx="100" cy="95" r="6" style={{ animationDelay: '.7s' }} />
      </svg>
    ),
  },
  {
    num: '06',
    name: 'Hospitality & Travel',
    label: 'In the sector',
    clients: ['Counterfoil — attractions, activities & tours'],
    desc: 'Booking, inventory, and revenue systems for operators running thin margins against volatile demand.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        <path className="im-draw" pathLength={1} d="M48 120 Q80 68 110 56" strokeOpacity=".55" style={{ animationDelay: '.5s' }} />
        <path className="im-draw" pathLength={1} d="M110 56 Q146 72 166 112" strokeOpacity=".55" style={{ animationDelay: '.7s' }} />
        <circle className="im-draw" pathLength={1} cx="48" cy="120" r="7" />
        <circle className="im-draw" pathLength={1} cx="110" cy="54" r="7" style={{ animationDelay: '.2s' }} />
        <circle className="im-draw im-pulse" pathLength={1} cx="166" cy="112" r="7" style={{ animationDelay: '.4s' }} />
      </svg>
    ),
  },
  {
    num: '07',
    name: 'Consumer Goods & Services',
    label: 'In the sector',
    clients: ['Hissho Sushi', 'DoYouWork'],
    desc: 'Field teams, franchise networks, and the last mile between insight and daily action.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* shelves */}
        <line className="im-draw" pathLength={1} x1="44" y1="58" x2="156" y2="58" strokeOpacity=".5" />
        <line className="im-draw" pathLength={1} x1="44" y1="92" x2="156" y2="92" strokeOpacity=".5" style={{ animationDelay: '.15s' }} />
        <line className="im-draw" pathLength={1} x1="44" y1="126" x2="156" y2="126" strokeOpacity=".5" style={{ animationDelay: '.3s' }} />
        {/* uprights */}
        <line className="im-draw" pathLength={1} x1="44" y1="58" x2="44" y2="126" strokeOpacity=".5" style={{ animationDelay: '.2s' }} />
        <line className="im-draw" pathLength={1} x1="100" y1="58" x2="100" y2="126" strokeOpacity=".5" style={{ animationDelay: '.35s' }} />
        <line className="im-draw" pathLength={1} x1="156" y1="58" x2="156" y2="126" strokeOpacity=".5" style={{ animationDelay: '.5s' }} />
        {/* product blocks */}
        <rect className="im-draw" pathLength={1} x="54" y="66" width="30" height="18" rx="3" style={{ animationDelay: '.6s' }} />
        <rect className="im-draw" pathLength={1} x="116" y="66" width="30" height="18" rx="3" style={{ animationDelay: '.7s' }} />
        <rect className="im-draw im-pulse" pathLength={1} x="54" y="100" width="30" height="18" rx="3" style={{ animationDelay: '.8s' }} />
        <rect className="im-draw" pathLength={1} x="116" y="100" width="30" height="18" rx="3" style={{ animationDelay: '.9s' }} />
      </svg>
    ),
  },
  {
    num: '08',
    name: 'Public Sector',
    label: 'Posture',
    clients: ['Cleared engineers · ATO-ready · Continuous compliance'],
    desc: 'Cleared engineers and ATO-ready delivery, with compliance that stays continuous — not a one-time certificate.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* base platform */}
        <line className="im-draw" pathLength={1} x1="40" y1="138" x2="160" y2="138" strokeOpacity=".55" />
        <line className="im-draw" pathLength={1} x1="48" y1="126" x2="152" y2="126" strokeOpacity=".4" style={{ animationDelay: '.1s' }} />
        {/* columns */}
        <line className="im-draw" pathLength={1} x1="62" y1="72" x2="62" y2="126" style={{ animationDelay: '.35s' }} />
        <line className="im-draw" pathLength={1} x1="88" y1="72" x2="88" y2="126" style={{ animationDelay: '.45s' }} />
        <line className="im-draw" pathLength={1} x1="114" y1="72" x2="114" y2="126" style={{ animationDelay: '.55s' }} />
        <line className="im-draw" pathLength={1} x1="140" y1="72" x2="140" y2="126" style={{ animationDelay: '.65s' }} />
        {/* top beam + pediment */}
        <line className="im-draw" pathLength={1} x1="48" y1="72" x2="154" y2="72" strokeOpacity=".7" style={{ animationDelay: '.75s' }} />
        <path className="im-draw im-pulse" pathLength={1} d="M50 60 L101 44 L152 60" strokeOpacity=".8" style={{ animationDelay: '.85s' }} />
      </svg>
    ),
  },
  {
    num: '09',
    name: 'Technology Platforms',
    label: 'In the sector',
    clients: [],
    none: 'Named work under NDA',
    desc: 'Product companies making the jump from one system to a real platform.',
    graphic: (
      <svg viewBox="0 0 200 180" aria-hidden="true">
        {/* frame */}
        <rect className="im-draw" pathLength={1} x="46" y="44" width="108" height="104" rx="10" strokeOpacity=".4" />
        {/* connectors */}
        <line className="im-draw" pathLength={1} x1="100" y1="96" x2="62" y2="60" strokeOpacity=".5" style={{ animationDelay: '.5s' }} />
        <line className="im-draw" pathLength={1} x1="100" y1="96" x2="138" y2="60" strokeOpacity=".5" style={{ animationDelay: '.55s' }} />
        <line className="im-draw" pathLength={1} x1="100" y1="96" x2="62" y2="132" strokeOpacity=".5" style={{ animationDelay: '.6s' }} />
        <line className="im-draw" pathLength={1} x1="100" y1="96" x2="138" y2="132" strokeOpacity=".5" style={{ animationDelay: '.65s' }} />
        {/* nodes */}
        <circle className="im-draw" pathLength={1} cx="62" cy="60" r="7" style={{ animationDelay: '.2s' }} />
        <circle className="im-draw" pathLength={1} cx="138" cy="60" r="7" style={{ animationDelay: '.3s' }} />
        <circle className="im-draw" pathLength={1} cx="62" cy="132" r="7" style={{ animationDelay: '.35s' }} />
        <circle className="im-draw" pathLength={1} cx="138" cy="132" r="7" style={{ animationDelay: '.4s' }} />
        {/* center data pulse */}
        <circle className="im-draw im-pulse" pathLength={1} cx="100" cy="96" r="7" style={{ animationDelay: '.7s' }} />
      </svg>
    ),
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
  '01': ['Data & Analytics', 'Cloud Transformation', 'DevOps & Automation', 'Platformization', 'Artificial Intelligence'],
  '02': ['Data & Analytics', 'Artificial Intelligence', 'Cloud Transformation', 'Platformization', 'DevOps & Automation'],
  '03': ['Digital Experiences', 'Cloud Transformation', 'Data & Analytics', 'Artificial Intelligence', 'Platformization'],
  '04': ['Internet of Things', 'Data & Analytics', 'Platformization', 'Cloud Transformation', 'DevOps & Automation'],
  '05': ['Digital Experiences', 'Data & Analytics', 'Cloud Transformation', 'Platformization'],
  '06': ['Digital Experiences', 'Platformization', 'Data & Analytics', 'Cloud Transformation'],
  '07': ['Digital Experiences', 'Data & Analytics', 'Artificial Intelligence', 'Platformization'],
  '08': ['Cloud Transformation', 'DevOps & Automation', 'Data & Analytics', 'Platformization', 'Agentic Architecture'],
  '09': ['Platformization', 'Agentic Architecture', 'DevOps & Automation', 'Cloud Transformation', 'Artificial Intelligence'],
}

// Real slugs from the industry collection, so every CTA lands on a page that exists.
const SLUGS: Record<string, string> = {
  '01': 'banking-capital-markets',
  '02': 'financial-services-insurance',
  '03': 'healthcare',
  '04': 'advanced-manufacturing',
  '05': 'sports-entertainment',
  '06': 'hospitality-travel',
  '07': 'consumer-goods',
  '08': 'public-sector',
  '09': 'technology-platforms',
}

export default function SectorIndex() {
  const [active, setActive] = useState(SECTORS[0].num)
  const canHover = useCanHover()
  const listRef = useRef<HTMLDivElement>(null)
  // Pointer and keyboard beat scroll: while either is driving, the observer stands down.
  const held = useRef(false)

  const pick = useCallback((num: string) => {
    held.current = true
    setActive(num)
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

      <div className="ix-stage">
        {SECTORS.map((sector) => (
          <Tabs.Content key={sector.num} value={sector.num} className="ix-panel">
            <div className="ix-art" aria-hidden="true">
              {sector.graphic}
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

              <Link className="ix-cta" href={`/industries/${SLUGS[sector.num]}`}>
                Explore {sector.name}
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  )
}
