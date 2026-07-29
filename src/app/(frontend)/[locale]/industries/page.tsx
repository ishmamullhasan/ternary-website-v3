import Heading from '@/components/a11y/Heading'
import Reveal from '@/components/hub/Reveal'
import Link from '@/components/LocalizedLink'
import { asTypedLocale } from '@/lib/i18n/locales'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import '@/components/hub/hub.css'
import './industriesHub.css'
import SectorIndex from './SectorIndex'
import SplitLadder, { type LadderItem } from './SplitLadder'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!asTypedLocale(locale)) return {}
  return {
    title: 'Industries',
    description:
      'We build where the stakes are specific — sectors where the rules, the risk, and the vocabulary are specific, with named work behind them.',
  }
}

// The "before we write a line of code" ladder and the regulatory posture — hardcoded; the title
// and body of each are the approved preview's voice, verbatim.
//
// `preview` is what the split's left-hand panel shows while that rung is active. Each one is a
// restatement of the rung beside it, never new information: the keyword compresses the title, the
// line compresses the body, and the three chips name what the body already claims. That is what
// lets the panel be aria-hidden without withholding anything (see SplitLadder).
const APPROACH: readonly LadderItem[] = [
  {
    k: '1',
    title: 'Learn the rules',
    body: 'Regulation, workflows, vocabulary. We study how your world actually runs before proposing how software should.',
    preview: {
      keyword: 'Domain',
      line: 'We study how your world runs before proposing how software should.',
      chips: ['Regulation', 'Workflow', 'Vocabulary'],
    },
  },
  {
    k: '2',
    title: 'Sit with the operators',
    body: 'The people doing the work every day know exactly where it breaks. We build from beside them, not from a spec.',
    preview: {
      keyword: 'Operators',
      line: 'We build beside the people doing the work, not from a spec.',
      chips: ['Beside them', 'Where it breaks', 'Every day'],
    },
  },
  {
    k: '3',
    title: 'Build to the constraints',
    body: 'Compliance, uptime windows, audit trails — treated as first-class requirements from day one, not patched in later.',
    preview: {
      keyword: 'Constraints',
      line: 'First-class requirements from day one, not patched in later.',
      chips: ['Compliance', 'Uptime', 'Audit trails'],
    },
  },
]

const POSTURE: readonly LadderItem[] = [
  {
    k: 'a',
    title: 'Traceable by default',
    body: 'Every consequential action is attributable and replayable, months after the fact.',
    preview: {
      keyword: 'Traceability',
      line: 'Every consequential action has an owner, months after the fact.',
      chips: ['Attributable', 'Auditable', 'Replayable'],
    },
  },
  {
    k: 'b',
    title: 'Deployed inside the boundary',
    body: 'On-premises and air-gapped patterns, for data that legally cannot leave the building.',
    preview: {
      keyword: 'Boundary',
      line: 'Runs where the data is, for data that cannot leave the building.',
      chips: ['On-premises', 'Air-gapped', 'Private'],
    },
  },
  {
    k: 'c',
    title: 'Documented for procurement',
    body: 'Architecture, controls, and evidence packaged the way review boards actually ask for them.',
    preview: {
      keyword: 'Procurement',
      line: 'Packaged the way review boards actually ask for it.',
      chips: ['Architecture', 'Controls', 'Evidence'],
    },
  },
]

export default async function IndustriesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!asTypedLocale(locale)) notFound()

  return (
    <div className="hub">
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <Reveal className="eyebrow">Industries</Reveal>
          <Reveal i={1}>
            <Heading level={1}>We build where the stakes are specific.</Heading>
          </Reveal>
          <Reveal as="p" className="hero-sub" i={2}>
            Every sector has its own rules, risks, and vocabulary. We learn yours before we build — because generic
            software doesn&rsquo;t survive contact.
          </Reveal>
        </div>
      </section>

      {/* THE SECTORS */}
      <section className="sec-b">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">The sectors</span>
              <Heading level={2}>Where we build</Heading>
            </div>
            <p className="sec-sub">
              Each entry opens into the work behind it. Where a client can be named, they are — proof, not a blurb.
            </p>
          </Reveal>
          <Reveal i={1}>
            <SectorIndex />
          </Reveal>
        </div>
      </section>

      {/* HOW WE ENTER — a sequence, so the tiles carry a directional wash and the order reads
          without numbering. */}
      <section className="sec-b">
        <SplitLadder eyebrow="Our approach" heading="Before we write a line of code." items={APPROACH} flow />
      </section>

      {/* REGULATORY POSTURE — not a sequence: three standing guarantees, so every tile is lit
          evenly. */}
      <section className="sec-b">
        <SplitLadder eyebrow="Regulatory posture" heading="Built to be audited." items={POSTURE} />
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <Reveal className="eyebrow">Start here</Reveal>
          <Reveal i={1}>
            <Heading level={2}>Don&rsquo;t see your industry?</Heading>
          </Reveal>
          <Reveal as="p" i={2}>
            The list above grows with the work. If your world has its own rules and real stakes, we&rsquo;re interested
            — and your first conversation is with someone who&rsquo;s built in a sector like yours, not a generalist.
          </Reveal>
          <Reveal className="btns" i={3}>
            <Link className="btn btn-primary" href="/contact">
              Start a conversation
              <ArrowRight size={16} strokeWidth={2} aria-hidden />
            </Link>
            <Link className="btn btn-ghost" href="/stories">
              See our work
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
