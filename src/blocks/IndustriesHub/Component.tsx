import Heading from '@/components/a11y/Heading'
import Reveal from '@/components/hub/Reveal'
import Link from '@/components/LocalizedLink'
import type { IndustriesHubBlock } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import type { JSX } from 'react'

import '@/components/hub/hub.css'
import '@/app/(frontend)/[locale]/industries/industriesHub.css'
import SectorIndex, { type Sector } from '@/app/(frontend)/[locale]/industries/SectorIndex'

/**
 * Industries hub (CMS build-out 2026-08-01). Renders the exact `.hub` CSS-driven layout the
 * previous hardcoded /industries page used — hero → the sector explorer → "before we write a line
 * of code" → regulatory posture → CTA — with the interactive SectorIndex behavior fully intact.
 * Copy is CMS-first with the authored default as fallback (SectorIndex carries its own default
 * sector set), so a half-edited doc can never render broken. Design is unchanged.
 */

const DEFAULT_APPROACH = [
  {
    title: 'Learn the rules',
    body: 'Regulation, workflows, vocabulary. We study how your world actually runs before proposing how software should.',
  },
  {
    title: 'Sit with the operators',
    body: 'The people doing the work every day know exactly where it breaks. We build from beside them, not from a spec.',
  },
  {
    title: 'Build to the constraints',
    body: 'Compliance, uptime windows, audit trails — treated as first-class requirements from day one, not patched in later.',
  },
]

const DEFAULT_POSTURE = [
  {
    title: 'Traceable by default',
    body: 'Every consequential action is attributable and replayable, months after the fact.',
  },
  {
    title: 'Deployed inside the boundary',
    body: 'On-premises and air-gapped patterns, for data that legally cannot leave the building.',
  },
  {
    title: 'Documented for procurement',
    body: 'Architecture, controls, and evidence packaged the way review boards actually ask for them.',
  },
]

export function IndustriesHubComponent(cms: Partial<IndustriesHubBlock> = {}): JSX.Element {
  // Sectors: pass CMS-authored ones to SectorIndex, else let it use its own hardcoded default
  // (undefined → the component's default param). `num` is assigned by index to keep the explorer's
  // pinning/active-state keys stable.
  const sectors: Sector[] | undefined = cms.sectors?.length
    ? cms.sectors.map((s, i) => ({
        num: String(i + 1).padStart(2, '0'),
        name: s.name ?? '',
        desc: s.desc ?? '',
        label: s.label ?? 'In the sector',
        clients: (s.clients ?? []).map((c) => c.name ?? ''),
        none: s.none ?? undefined,
        caps: (s.caps ?? []).map((c) => c.cap ?? ''),
      }))
    : undefined

  const approach = cms.approach?.length
    ? cms.approach.map((a) => ({ title: a.title ?? '', body: a.body ?? '' }))
    : DEFAULT_APPROACH
  const posture = cms.posture?.length
    ? cms.posture.map((p) => ({ title: p.title ?? '', body: p.body ?? '' }))
    : DEFAULT_POSTURE

  const heroHeading = cms.heroHeading || 'We build where the stakes are specific.'
  const heroSub =
    cms.heroSub ||
    'Every sector has its own rules, risks, and vocabulary. We learn yours before we build — because generic software doesn’t survive contact.'
  const sectorsHeading = cms.sectorsHeading || 'Where we build'
  const sectorsSub =
    cms.sectorsSub ||
    'Each entry opens into the work behind it. Where a client can be named, they are — proof, not a blurb.'
  const approachHeading = cms.approachHeading || 'Before we write a line of code.'
  const postureHeading = cms.postureHeading || 'Built to be audited.'
  const ctaHeading = cms.ctaHeading || 'Don’t see your industry?'
  const ctaBody =
    cms.ctaBody ||
    'The list above grows with the work. If your world has its own rules and real stakes, we’re interested — and your first conversation is with someone who’s built in a sector like yours, not a generalist.'

  return (
    <div className="hub">
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <Reveal>
            <Heading level={1}>{heroHeading}</Heading>
          </Reveal>
          <Reveal as="p" className="hero-sub" i={2}>
            {heroSub}
          </Reveal>
        </div>
      </section>

      {/* THE SECTORS */}
      <section className="sec-b">
        <div className="wrap">
          <Reveal className="sec-head">
            <Heading level={2}>{sectorsHeading}</Heading>
            <p className="sec-sub">{sectorsSub}</p>
          </Reveal>
          <Reveal i={1}>
            <SectorIndex sectors={sectors} />
          </Reveal>
        </div>
      </section>

      {/* HOW WE ENTER */}
      <section className="sec-b">
        <div className="wrap split">
          <Reveal x>
            <Heading level={2} className="split-lead">
              {approachHeading}
            </Heading>
          </Reveal>
          <div className="ladder ladder-flow">
            {approach.map((step, i) => (
              <Reveal className="step" i={i} key={step.title || i}>
                <div>
                  <Heading level={3}>{step.title}</Heading>
                  <p>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REGULATORY POSTURE */}
      <section className="sec-b">
        <div className="wrap split">
          <Reveal x>
            <Heading level={2} className="split-lead">
              {postureHeading}
            </Heading>
          </Reveal>
          <div className="ladder ladder-stack">
            {posture.map((point, i) => (
              <Reveal className="step" i={i} key={point.title || i}>
                <div>
                  <Heading level={3}>{point.title}</Heading>
                  <p>{point.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal i={1}>
            <Heading level={2}>{ctaHeading}</Heading>
          </Reveal>
          <Reveal as="p" i={2}>
            {ctaBody}
          </Reveal>
          <Reveal className="btns" i={3}>
            <Link className="btn btn-primary" href="/contact">
              Start a conversation
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link className="btn btn-ghost" href="/work">
              See our work
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
