'use client'

import { useCanHover } from '@/components/hub/useCanHover'
import { type ReactNode, useState } from 'react'

/**
 * The signature sector index — a single-open accordion, ported from
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <line className="st" x1="50" y1="140" x2="250" y2="140" strokeOpacity=".4" />
        <line className="st ig-bar" x1="80" y1="140" x2="80" y2="96" />
        <line className="st ig-bar" x1="118" y1="140" x2="118" y2="70" style={{ animationDelay: '.3s' }} />
        <line className="st ac ig-bar" x1="156" y1="140" x2="156" y2="48" style={{ animationDelay: '.6s' }} />
        <line className="st ig-bar" x1="194" y1="140" x2="194" y2="82" style={{ animationDelay: '.9s' }} />
        <line className="st ig-bar" x1="232" y1="140" x2="232" y2="60" style={{ animationDelay: '1.2s' }} />
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <line className="st" x1="150" y1="90" x2="150" y2="146" strokeOpacity=".5" />
        <circle className="st" cx="150" cy="90" r="3" />
        <g className="ig-tilt">
          <line className="st" x1="86" y1="90" x2="214" y2="90" />
          <circle className="fp" cx="86" cy="90" r="5.5" />
          <circle className="acf" cx="214" cy="90" r="5.5" />
        </g>
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <path className="st" d="M40 92 H110 L128 52 L150 132 L168 92 H260" strokeOpacity=".3" />
        <path className="st ac ig-dash" d="M40 92 H110 L128 52 L150 132 L168 92 H260" />
      </svg>
    ),
  },
  {
    num: '04',
    name: 'Advanced Manufacturing & Energy',
    label: 'In the sector',
    clients: ['FAROGL'],
    desc: 'Connected plants, controlled processes, and operational intelligence from the floor up.',
    graphic: (
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <g className="ig-rot" style={{ transformOrigin: '150px 90px' }}>
          <circle className="st" cx="150" cy="90" r="40" strokeOpacity=".55" />
          <g className="st">
            <line x1="150" y1="36" x2="150" y2="50" />
            <line x1="150" y1="130" x2="150" y2="144" />
            <line x1="96" y1="90" x2="110" y2="90" />
            <line x1="190" y1="90" x2="204" y2="90" />
            <line x1="112" y1="52" x2="122" y2="62" />
            <line x1="178" y1="118" x2="188" y2="128" />
            <line x1="112" y1="128" x2="122" y2="118" />
            <line x1="178" y1="62" x2="188" y2="52" />
          </g>
        </g>
        <circle className="acf" cx="150" cy="90" r="6" />
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <circle className="st" cx="150" cy="90" r="42" strokeOpacity=".3" />
        <circle className="fp" cx="150" cy="90" r="6" />
        <g className="ig-orb" style={{ transformOrigin: '150px 90px' }}>
          <circle className="acf" cx="150" cy="48" r="6" />
        </g>
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <path className="st ac ig-draw" d="M60 128 C110 44 190 44 240 128" />
        <circle className="fp" cx="60" cy="128" r="5.5" />
        <circle className="fp" cx="240" cy="128" r="5.5" />
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <g className="st" strokeOpacity=".4">
          <line x1="150" y1="90" x2="150" y2="46" />
          <line x1="150" y1="90" x2="204" y2="64" />
          <line x1="150" y1="90" x2="204" y2="116" />
          <line x1="150" y1="90" x2="150" y2="134" />
          <line x1="150" y1="90" x2="96" y2="116" />
          <line x1="150" y1="90" x2="96" y2="64" />
        </g>
        <circle className="acf" cx="150" cy="90" r="6" />
        <circle className="fp ig-bre" cx="150" cy="46" r="4" />
        <circle className="fp ig-bre" cx="204" cy="64" r="4" style={{ animationDelay: '.4s' }} />
        <circle className="fp ig-bre" cx="204" cy="116" r="4" style={{ animationDelay: '.8s' }} />
        <circle className="fp ig-bre" cx="150" cy="134" r="4" style={{ animationDelay: '1.2s' }} />
        <circle className="fp ig-bre" cx="96" cy="116" r="4" style={{ animationDelay: '1.6s' }} />
        <circle className="fp ig-bre" cx="96" cy="64" r="4" style={{ animationDelay: '2s' }} />
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <rect className="st ig-bre" x="100" y="46" width="100" height="88" rx="3" strokeOpacity=".3" />
        <rect
          className="st ig-bre"
          x="120"
          y="66"
          width="60"
          height="48"
          rx="2"
          strokeOpacity=".55"
          style={{ animationDelay: '.5s' }}
        />
        <rect className="ac ig-bre" x="140" y="86" width="20" height="8" rx="1.5" style={{ animationDelay: '1s' }} />
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
      <svg className="g" viewBox="0 0 300 180" fill="none" aria-hidden="true">
        <rect className="st ig-rise" x="110" y="112" width="80" height="16" rx="3" />
        <rect className="st ig-rise" x="110" y="88" width="80" height="16" rx="3" style={{ animationDelay: '.4s' }} />
        <rect className="ac ig-rise" x="110" y="64" width="80" height="16" rx="3" style={{ animationDelay: '.8s' }} />
      </svg>
    ),
  },
]

export default function SectorIndex() {
  const [openIdx, setOpenIdx] = useState(0)
  const canHover = useCanHover()

  return (
    <div className="sectors">
      {SECTORS.map((sector, i) => {
        const open = i === openIdx
        return (
          <div className={`sector${open ? ' open' : ''}`} id={`s${sector.num}`} key={sector.num}>
            <button
              type="button"
              className="sector-head"
              aria-expanded={open}
              aria-controls={`sb${sector.num}`}
              onMouseEnter={canHover ? () => setOpenIdx(i) : undefined}
              onFocus={() => setOpenIdx(i)}
              onClick={() => {
                if (!canHover) setOpenIdx(open ? -1 : i)
              }}
            >
              <span className="sector-num">{sector.num}</span>
              <span className="sector-mid">
                <span className="sector-name">{sector.name}</span>
                <span className="sector-proof">
                  <span className="lab">{sector.label}</span>
                  {sector.none ? (
                    <span className="none">{sector.none}</span>
                  ) : (
                    sector.clients.map((client) => (
                      <span className="cli" key={client}>
                        {client}
                      </span>
                    ))
                  )}
                </span>
              </span>
              <span className="sector-chev" aria-hidden="true">
                →
              </span>
            </button>
            <div className="sector-body" id={`sb${sector.num}`}>
              <div className="sector-body-in">
                <div className="sector-grid">
                  <p className="sector-desc">{sector.desc}</p>
                  <div className="sector-panel">{sector.graphic}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
