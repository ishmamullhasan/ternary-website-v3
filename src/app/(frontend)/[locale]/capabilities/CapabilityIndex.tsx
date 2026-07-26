'use client'

import { useCanHover } from '@/components/hub/useCanHover'
import { type ReactNode, useState } from 'react'

/**
 * The signature capability index — a single-open accordion. On fine pointers a discipline opens on
 * hover (and on keyboard focus); on touch it toggles on tap. Item 0 is open by default. The
 * expand/collapse is a `grid-template-rows: 0fr → 1fr` transition (see capabilitiesHub.css), which
 * animates height without a measured pixel value.
 *
 * Content is intentionally hardcoded here (the eight disciplines are stable). A later pass can wire
 * this to the `capability` collection; the shape below maps cleanly onto it.
 */

type Cap = {
  num: string
  name: string
  tag: string
  desc: string
  chips: string[]
  graphic: ReactNode
}

const CAPS: Cap[] = [
  {
    num: '00',
    name: 'Agentic Architecture',
    tag: 'AI that does real work — and answers for it.',
    desc: 'Systems that plan, act, and verify — with people in command of anything that matters. Autonomy designed in as structure and bounded authority, not coaxed from a prompt.',
    chips: ['Multi-agent systems', 'Tool use & permissions', 'Evals & guardrails', 'Human oversight'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="st ac">
          <path className="a-flow" d="M60 130 H150" />
          <path className="a-flow" d="M150 130 L280 70" />
          <path className="a-flow" d="M150 130 H280" />
          <path className="a-flow" d="M150 130 L280 190" />
        </g>
        <circle className="acf a-node sp" cx="60" cy="130" r="7" />
        <circle className="fp" cx="150" cy="130" r="4" />
        <circle className="fp a-node sp" cx="280" cy="70" r="6" />
        <circle className="fp a-node sp" cx="280" cy="130" r="6" />
        <circle className="fp a-node sp" cx="280" cy="190" r="6" />
      </svg>
    ),
  },
  {
    num: '01',
    name: 'Artificial Intelligence',
    tag: 'Production ML, not demos.',
    desc: 'LLM applications and machine learning built for production — shipped, monitored, and owned after launch, not handed over as a notebook.',
    chips: ['LLM applications', 'ML pipelines', 'Retrieval & search', 'Model operations'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="st">
          <path className="a-flow" d="M60 60 L250 130" />
          <path className="a-flow" d="M60 110 L250 130" />
          <path className="a-flow" d="M60 160 L250 130" />
          <path className="a-flow" d="M60 210 L250 130" />
          <path className="a-flow" d="M110 90 L250 130" />
          <path className="a-flow" d="M110 175 L250 130" />
        </g>
        <circle className="acf a-node sp" cx="250" cy="130" r="9" />
        <g className="fp">
          <circle cx="60" cy="60" r="3.4" />
          <circle cx="60" cy="110" r="3.4" />
          <circle cx="60" cy="160" r="3.4" />
          <circle cx="60" cy="210" r="3.4" />
        </g>
      </svg>
    ),
  },
  {
    num: '02',
    name: 'Data & Analytics',
    tag: 'One source of truth.',
    desc: 'Pipelines, warehouses, and numbers your teams can actually act on — governed, documented, and trusted enough to make decisions from.',
    chips: ['Data pipelines', 'Warehousing', 'Decision analytics', 'Governance'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="a-wave">
          <path className="st ac" d="M-60 90 Q0 60 60 90 T180 90 T300 90 T420 90" />
        </g>
        <g className="a-wave" style={{ animationDuration: '9s' }}>
          <path className="st" d="M-60 135 Q0 108 60 135 T180 135 T300 135 T420 135" strokeOpacity=".5" />
        </g>
        <g className="a-wave" style={{ animationDuration: '11s' }}>
          <path className="st" d="M-60 180 Q0 156 60 180 T180 180 T300 180 T420 180" strokeOpacity=".28" />
        </g>
      </svg>
    ),
  },
  {
    num: '10',
    name: 'Cloud Transformation',
    tag: 'Move without betting the business.',
    desc: 'Architecture, migration, and operations — governed for regulated environments. Nothing switches off until its replacement has proven itself.',
    chips: ['Migration', 'Cloud-native architecture', 'Platform operations', 'Compliance'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="a-drift">
          <path className="st" d="M110 180 L180 150 L250 180 L180 210 Z" strokeOpacity=".3" />
        </g>
        <g className="a-drift" style={{ animationDuration: '11s' }}>
          <path className="st" d="M110 140 L180 110 L250 140 L180 170 Z" strokeOpacity=".5" />
        </g>
        <g className="a-drift" style={{ animationDuration: '8s' }}>
          <path className="st ac" d="M110 100 L180 70 L250 100 L180 130 Z" />
        </g>
      </svg>
    ),
  },
  {
    num: '11',
    name: 'Platformization',
    tag: 'From one-off to platform.',
    desc: 'Turn one-off builds into shared platforms, so every next project starts further ahead instead of from zero.',
    chips: ['Internal platforms', 'Reusable services', 'APIs & SDKs', 'Developer experience'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="st">
          <rect className="a-bre sp" x="120" y="150" width="40" height="40" rx="3" />
          <rect className="a-bre sp" x="168" y="150" width="40" height="40" rx="3" style={{ animationDelay: '.4s' }} />
          <rect className="a-bre sp" x="216" y="150" width="40" height="40" rx="3" style={{ animationDelay: '.8s' }} />
          <rect className="a-bre sp" x="144" y="102" width="40" height="40" rx="3" style={{ animationDelay: '.6s' }} />
          <rect className="a-bre sp" x="192" y="102" width="40" height="40" rx="3" style={{ animationDelay: '1s' }} />
        </g>
        <rect className="ac a-bre sp" x="168" y="56" width="40" height="40" rx="3" style={{ animationDelay: '1.2s' }} />
      </svg>
    ),
  },
  {
    num: '12',
    name: 'Digital Experiences',
    tag: 'Trusted at first use.',
    desc: 'Web, mobile, and product interfaces people trust at first use — clear, fast, and dependable on every device.',
    chips: ['Web & mobile', 'Product design', 'Accessibility', 'Performance'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <rect className="st a-bre sp" x="100" y="70" width="160" height="120" rx="6" strokeOpacity=".3" />
        <rect
          className="st a-bre sp"
          x="122"
          y="92"
          width="116"
          height="76"
          rx="5"
          strokeOpacity=".5"
          style={{ animationDelay: '.5s' }}
        />
        <rect className="ac a-bre sp" x="150" y="116" width="60" height="28" rx="4" style={{ animationDelay: '1s' }} />
        <path className="fp" d="M232 150 l14 6 -6 2 -2 6 z" />
      </svg>
    ),
  },
  {
    num: '20',
    name: 'DevOps & Automation',
    tag: 'Make shipping boring.',
    desc: 'More releases, fewer incidents, and no two-a.m. surprises — the pipeline that turns shipping from an event into a habit.',
    chips: ['CI/CD', 'Observability', 'Reliability', 'Release automation'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <circle className="st" cx="180" cy="130" r="60" strokeOpacity=".4" />
        <g className="a-orbit" style={{ transformOrigin: '180px 130px' }}>
          <circle className="acf a-node sp" cx="180" cy="70" r="7" />
        </g>
        <g
          className="a-orbit"
          style={{ transformOrigin: '180px 130px', animationDuration: '18s', animationDirection: 'reverse' }}
        >
          <circle className="fp" cx="240" cy="130" r="4.5" />
        </g>
      </svg>
    ),
  },
  {
    num: '21',
    name: 'Internet of Things',
    tag: 'Sensor to dashboard.',
    desc: 'Devices, firmware, and the data they send home — from the sensor on the floor to the dashboard on the wall.',
    chips: ['Firmware', 'Edge computing', 'Telemetry', 'Device fleets'],
    graphic: (
      <svg className="g" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <g className="st" strokeOpacity=".4">
          <line x1="180" y1="130" x2="180" y2="66" />
          <line x1="180" y1="130" x2="236" y2="98" />
          <line x1="180" y1="130" x2="236" y2="162" />
          <line x1="180" y1="130" x2="180" y2="194" />
          <line x1="180" y1="130" x2="124" y2="162" />
          <line x1="180" y1="130" x2="124" y2="98" />
        </g>
        <circle className="acf a-node sp" cx="180" cy="130" r="8" />
        <circle className="fp a-node sp" cx="180" cy="66" r="4" />
        <circle className="fp a-node sp" cx="236" cy="98" r="4" style={{ animationDelay: '.3s' }} />
        <circle className="fp a-node sp" cx="236" cy="162" r="4" style={{ animationDelay: '.6s' }} />
        <circle className="fp a-node sp" cx="180" cy="194" r="4" style={{ animationDelay: '.9s' }} />
        <circle className="fp a-node sp" cx="124" cy="162" r="4" style={{ animationDelay: '1.2s' }} />
        <circle className="fp a-node sp" cx="124" cy="98" r="4" style={{ animationDelay: '1.5s' }} />
      </svg>
    ),
  },
]

export default function CapabilityIndex() {
  const [openIdx, setOpenIdx] = useState(0)
  const canHover = useCanHover()

  return (
    <div className="index">
      {CAPS.map((cap, i) => {
        const open = i === openIdx
        return (
          <div className={`cap${open ? ' open' : ''}`} id={`c${cap.num}`} key={cap.num}>
            <button
              type="button"
              className="cap-head"
              aria-expanded={open}
              aria-controls={`b${cap.num}`}
              onMouseEnter={canHover ? () => setOpenIdx(i) : undefined}
              onFocus={() => setOpenIdx(i)}
              onClick={() => {
                if (!canHover) setOpenIdx(open ? -1 : i)
              }}
            >
              <span className="cap-titles">
                <span className="cap-name">{cap.name}</span>
                <span className="cap-tag">{cap.tag}</span>
              </span>
              <span className="cap-chev" aria-hidden="true">
                →
              </span>
            </button>
            <div className="cap-body" id={`b${cap.num}`}>
              <div className="cap-body-in">
                <div className="cap-grid">
                  <div className="cap-copy">
                    <p className="cap-desc">{cap.desc}</p>
                    <div className="cap-chips">
                      {cap.chips.map((chip) => (
                        <span key={chip}>{chip}</span>
                      ))}
                    </div>
                  </div>
                  <div className="cap-panel">{cap.graphic}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
