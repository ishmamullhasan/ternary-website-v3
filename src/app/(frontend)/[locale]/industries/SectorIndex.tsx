'use client'

import IndustryBlueprint from '@/components/industry/IndustryBlueprint'
import * as Tabs from '@radix-ui/react-tabs'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

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
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const activeIndex = Math.max(
    0,
    SECTORS.findIndex((s) => s.num === active),
  )

  /**
   * Pin the section and take the selection from how far the reader has travelled through it, so one
   * sector holds the centre of the dial and the next arrives as they keep scrolling.
   *
   * `data-pin` is set here, from JavaScript, and only when the visitor has not asked for reduced
   * motion. Without it the stylesheet leaves the track at its natural height, the rail in normal
   * flow and every sector readable — the section degrades to a list beside a panel rather than to a
   * pinned stage that never advances. Same contract as the home page's process section.
   */
  useEffect(() => {
    const track = trackRef.current
    const pin = pinRef.current
    if (!track || !pin) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    track.dataset.pin = 'on'

    // The spacer is the card's own height plus a beat per sector, so the section ends when the dial
    // does rather than at an arbitrary multiple of the viewport.
    const measure = (): void => {
      track.style.setProperty('--ix-card', String(Math.round(pin.getBoundingClientRect().height)) + 'px')
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(pin)

    let raf = 0
    const apply = (): void => {
      raf = 0
      const r = track.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0
      // nudge off the very end so the last sector holds instead of flickering at p === 1
      const i = Math.min(SECTORS.length - 1, Math.floor(p * SECTORS.length * 0.999))
      const num = SECTORS[i]?.num
      if (num) setActive((prev) => (prev === num ? prev : num))
    }
    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      ro?.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  /**
   * Slide the rail so the selected row sits on the aperture's centre line.
   *
   * Measured, not a row height multiplied by an index: the rows are deliberately different sizes —
   * 36px for the focused one against 22px for the rest — so there is no single row height to count
   * in. The second pass on the next frame is because the focused row changes size, which moves the
   * offsets this is measured against.
   */
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const move = (): void => {
      // Only where the dial exists. Below 900px the aperture releases its height to show the whole
      // list, and sliding it there hid three rows outright behind the window's clip — measured.
      if (!window.matchMedia('(min-width: 900px)').matches) {
        list.style.transform = ''
        return
      }
      const row = list.querySelector<HTMLElement>('[data-sector="' + active + '"]')
      const win = list.parentElement
      if (!row || !win) return
      const y = win.clientHeight / 2 - (row.offsetTop + row.offsetHeight / 2)
      list.style.transform = 'translateY(' + Math.round(y) + 'px)'
    }
    move()
    const t = requestAnimationFrame(move)
    window.addEventListener('resize', move)
    return () => {
      cancelAnimationFrame(t)
      window.removeEventListener('resize', move)
    }
  }, [active])

  /**
   * Tapping a sector goes straight to that sector's card.
   *
   * It moves the SCROLL POSITION rather than setting state, because scroll is what drives the dial —
   * setting state directly would be overwritten on the next frame. Scroll position stays the single
   * source of truth, so tap, keyboard and scroll cannot disagree.
   *
   * `auto`, not `smooth`. Inside the pinned range the section does not move on screen — only the
   * dial's state does — so an instant seek reads as the dial jumping to the sector, which is what
   * "take me to that one" should feel like. Smooth would have animated up to five screens of
   * scrolling to show a card that is already on screen.
   */
  const pick = useCallback((num: string) => {
    const track = trackRef.current
    const i = SECTORS.findIndex((s) => s.num === num)
    if (!track || track.dataset.pin !== 'on' || i < 0) {
      setActive(num)
      return
    }
    const r = track.getBoundingClientRect()
    const travel = r.height - window.innerHeight
    window.scrollTo({
      top: r.top + window.scrollY + travel * ((i + 0.5) / SECTORS.length),
      behavior: 'auto',
    })
  }, [])

  /**
   * Fit the artwork to its own ink. The drawings share one 400x360 canvas but occupy very different
   * parts of it, so without this each sector renders at whatever size it happens to fill — measured
   * 217px to 368px wide inside an identical element. Driven by a MutationObserver because Radix
   * mounts a tab's content in its own commit, after the one our state change produces.
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
      const vb = [box.x - pad, box.y - pad, box.width + pad * 2, box.height + pad * 2]
        .map((v) => v.toFixed(2))
        .join(' ')
      if (svg.getAttribute('viewBox') === vb) return
      svg.setAttribute('viewBox', vb)
    }
    fit()
    const mo = new MutationObserver(fit)
    mo.observe(stage, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return (
    <div className="ix-track" ref={trackRef} style={{ '--ix-steps': SECTORS.length } as CSSProperties}>
      <div className="ix-pin" ref={pinRef}>
        <Tabs.Root value={active} onValueChange={pick} orientation="vertical" className="ix">
          {/* The aperture; the list slides behind it. */}
          <div className="ix-window">
            <Tabs.List className="ix-rail" aria-label="Sectors" ref={listRef}>
              {SECTORS.map((sector, i) => (
                <Tabs.Trigger
                  key={sector.num}
                  value={sector.num}
                  data-sector={sector.num}
                  /* Rings out from the selection: 0 is the focused row, 3 is three or more away. */
                  data-d={Math.min(3, Math.abs(i - activeIndex))}
                  className="ix-item"
                >
                  <span className="ix-line" aria-hidden="true" />
                  <span className="ix-mid">
                    <span className="ix-name">{sector.name}</span>
                    <span className="ix-caps">{(CAPS[sector.num] ?? []).slice(0, 3).join('  ·  ')}</span>
                  </span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

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
      </div>
    </div>
  )
}
